"""Account WebSocket API for Card Builder integration."""
from __future__ import annotations

import asyncio
import base64
import binascii
from copy import deepcopy
import hashlib
import mimetypes
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlparse

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .api import (
    CardBuilderAccountApiClient,
    CardBuilderAccountApiError,
    CardBuilderAccountAuthError,
    CardBuilderAccountConflictError,
    CardBuilderAccountIntegrationVersionOutdated,
    CardBuilderAccountNotFoundError,
    CardBuilderAccountValidationError,
)
from .const import (
    DATA_KEY_ACCOUNT_API_CLIENT,
    DATA_KEY_ACCOUNT_STORE,
    WS_ACCOUNT_DISCONNECT,
    WS_ACCOUNT_FINGERPRINT,
    WS_ACCOUNT_GET,
    WS_INFO_GET,
    WS_MARKETPLACE_CATEGORIES,
    WS_MARKETPLACE_CARDS_SHARED_LIST,
    WS_MARKETPLACE_CARDS_SHARED_UPDATE,
    WS_MARKETPLACE_CARDS_SHARED_UPLOAD,
    WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_PREPARE,
    WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_CONFIRM,
    WS_MARKETPLACE_CARDS_AVAILABLE_INFO,
    WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_PREPARE,
    WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_CONFIRM,
    WS_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK,
    WS_MARKETPLACE_CARDS_AVAILABLE_CHANGELOG,
    WS_MARKETPLACE_CARDS_SHARED_UPDATE_REASONS,
    WS_MARKETPLACE_DISCLAIMER_DOWNLOAD,
    WS_MARKETPLACE_DISCLAIMER_SHARE,
    WS_TOKEN_SET,
)
from ..const import (
    DATA_KEY_CARDS,
    DOMAIN,
    DATA_KEY_INSTANCE_FINGERPRINT,
    DATA_KEY_MEDIA,
    MEDIA_REFERENCE_LOCAL_ROOT,
)
from .storage import AccountStore
from ..storage import CardStorageCollection

MEDIA_REFERENCE_PATTERN = re.compile(r"""(cb-media://[^'\"\\s)]+)""")


def _get_api_client(hass: HomeAssistant) -> CardBuilderAccountApiClient:
    api_client = hass.data.get(DOMAIN, {}).get(DATA_KEY_ACCOUNT_API_CLIENT)
    if not api_client:
        raise HomeAssistantError("API client not initialized")
    return api_client


def _get_account_store(hass: HomeAssistant) -> AccountStore:
    account_store = hass.data.get(DOMAIN, {}).get(DATA_KEY_ACCOUNT_STORE)
    if not account_store:
        raise HomeAssistantError("Account store not initialized")
    return account_store


def _get_card_storage(hass: HomeAssistant) -> CardStorageCollection:
    card_storage = hass.data.get(DOMAIN, {}).get(DATA_KEY_CARDS)
    if not card_storage:
        raise HomeAssistantError("Card storage not initialized")
    return card_storage


def _get_media_dir(hass: HomeAssistant) -> Path:
    media_dir = hass.data.get(DOMAIN, {}).get(DATA_KEY_MEDIA)
    if not media_dir:
        raise HomeAssistantError("Media directory not initialized")
    return Path(media_dir)


def _get_instance_fingerprint(hass: HomeAssistant) -> str:
    fingerprint = hass.data.get(DOMAIN, {}).get(DATA_KEY_INSTANCE_FINGERPRINT)
    if not fingerprint:
        raise HomeAssistantError("Fingerprint not available")
    return str(fingerprint)


def _resolve_media_path(base_dir: Path, relative: str) -> Path:
    safe_relative = (relative or "").lstrip("/")
    target = (base_dir / safe_relative).resolve()
    base_resolved = base_dir.resolve()
    if target != base_resolved and base_resolved not in target.parents:
        raise HomeAssistantError("Invalid media path")
    return target


def _send_api_error(
    connection: websocket_api.ActiveConnection,
    msg_id: int,
    err: CardBuilderAccountApiError,
) -> None:
    if isinstance(err, CardBuilderAccountIntegrationVersionOutdated):
        code = "integration_version_outdated"
    elif isinstance(err, CardBuilderAccountAuthError):
        code = "api_auth_failed"
    elif isinstance(err, CardBuilderAccountNotFoundError):
        code = "api_not_found"
    elif isinstance(err, CardBuilderAccountConflictError):
        code = "api_conflict"
    elif isinstance(err, CardBuilderAccountValidationError):
        code = "api_validation_error"
    else:
        code = "api_error"
    connection.send_error(msg_id, code, str(err))


def _normalize_plan_status(value: Any) -> str:
    if isinstance(value, str) and value.strip().lower() == "preview":
        return "preview"
    return "enabled"


def _normalize_info_payload(data: Any) -> Any:
    if not isinstance(data, dict):
        return data

    normalized = dict(data)
    plans = data.get("plans")
    if not isinstance(plans, list):
        return normalized

    normalized_plans: list[Any] = []
    for plan in plans:
        if not isinstance(plan, dict):
            normalized_plans.append(plan)
            continue
        normalized_plan = dict(plan)
        normalized_plan["status"] = _normalize_plan_status(plan.get("status"))
        normalized_plans.append(normalized_plan)

    normalized["plans"] = normalized_plans
    return normalized


def _parse_update_reasons(value: Any) -> list[int]:
    if not isinstance(value, list):
        raise HomeAssistantError("Update reasons are required")

    parsed: list[int] = []
    for item in value:
        if isinstance(item, int):
            parsed.append(item)
            continue
        if isinstance(item, str):
            stripped = item.strip()
            if not stripped:
                continue
            if stripped.isdigit():
                parsed.append(int(stripped))
                continue
        raise HomeAssistantError("Update reasons must be numeric IDs")

    if not parsed:
        raise HomeAssistantError("Update reasons are required")

    return parsed


def _build_marketplace_card_create_payload(card_id: str, card: dict[str, Any]) -> dict[str, Any]:
    name = str(card.get("name", "")).strip()
    if not name:
        raise HomeAssistantError("Card name is required")

    config = card.get("config")
    if not isinstance(config, dict):
        raise HomeAssistantError("Card config is required")

    version = card.get("version")
    if not isinstance(version, int) or version < 1:
        raise HomeAssistantError("Card version is required")

    payload: dict[str, Any] = {
        "id": card_id,
        "name": name,
        "config": config,
        "version": version,
    }

    description = str(card.get("description") or "").strip()
    if description:
        payload["description"] = description

    author = str(card.get("author") or "").strip()
    if author:
        payload["author"] = author

    group_id = str(card.get("group_id") or "").strip()
    if group_id:
        payload["group_id"] = group_id

    parent_id = str(card.get("marketplace_parent_id") or "").strip()
    if parent_id:
        payload["parent_marketplace_card_id"] = parent_id

    parent_version = card.get("marketplace_parent_version")
    if isinstance(parent_version, int) and parent_version > 0:
        payload["parent_marketplace_card_version"] = parent_version

    min_ha_version = str(card.get("min_ha_version") or "").strip()
    if min_ha_version:
        payload["min_ha_version"] = min_ha_version

    max_ha_version = str(card.get("max_ha_version") or "").strip()
    if max_ha_version:
        payload["max_ha_version"] = max_ha_version

    min_builder_version = str(card.get("min_builder_version") or "").strip()
    if min_builder_version:
        payload["min_builder_version"] = min_builder_version

    tier = str(card.get("tier") or "").strip()
    if tier:
        payload["tier"] = tier

    meta = card.get("meta")
    if isinstance(meta, dict) and meta:
        payload["meta"] = meta

    return payload


def _build_card_version_payload(card: dict[str, Any]) -> dict[str, Any]:
    config = card.get("config")
    if not isinstance(config, dict):
        raise HomeAssistantError("Card config is required")

    version = card.get("version")
    if not isinstance(version, int) or version < 1:
        raise HomeAssistantError("Card version is required")

    update_notes = str(card.get("update_notes") or "").strip()
    if not update_notes:
        raise HomeAssistantError("Update notes are required")

    update_reasons = _parse_update_reasons(card.get("update_reasons"))

    payload: dict[str, Any] = {
        "config": config,
        "version": version,
        "update_notes": update_notes,
        "update_reasons": update_reasons,
    }

    min_ha_version = str(card.get("min_ha_version") or "").strip()
    if min_ha_version:
        payload["min_ha_version"] = min_ha_version

    max_ha_version = str(card.get("max_ha_version") or "").strip()
    if max_ha_version:
        payload["max_ha_version"] = max_ha_version

    min_builder_version = str(card.get("min_builder_version") or "").strip()
    if min_builder_version:
        payload["min_builder_version"] = min_builder_version

    tier = str(card.get("tier") or "").strip()
    if tier:
        payload["tier"] = tier

    meta = card.get("meta")
    if isinstance(meta, dict) and meta:
        payload["meta"] = meta

    return payload


def _build_marketplace_card_update_payload(card: dict[str, Any]) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    name = str(card.get("name") or "").strip()
    description = str(card.get("description") or "").strip()
    if name:
        payload["name"] = name
    if description:
        payload["description"] = description
    if not payload:
        raise HomeAssistantError("Name or description is required")
    return payload


def _collect_media_references(value: Any, found: set[str]) -> None:
    if isinstance(value, dict):
        for item in value.values():
            _collect_media_references(item, found)
        return
    if isinstance(value, list):
        for item in value:
            _collect_media_references(item, found)
        return
    if not isinstance(value, str):
        return

    for match in MEDIA_REFERENCE_PATTERN.findall(value):
        if match.startswith(MEDIA_REFERENCE_LOCAL_ROOT):
            found.add(match)


def _media_reference_to_path(base_dir: Path, reference: str) -> Path:
    relative = reference.removeprefix(MEDIA_REFERENCE_LOCAL_ROOT).lstrip("/")
    if not relative:
        raise HomeAssistantError("Invalid media reference")
    return _resolve_media_path(base_dir, relative)


def _extract_preview_reference(meta: Any) -> str | None:
    if not isinstance(meta, dict):
        return None
    for key in ("preview_image", "preview_image_reference", "preview_image_ref"):
        value = meta.get(key)
        if isinstance(value, str) and value.startswith(MEDIA_REFERENCE_LOCAL_ROOT):
            return value
    return None


def _decode_data_url(data_url: str) -> tuple[bytes, str]:
    if not isinstance(data_url, str) or not data_url.startswith("data:"):
        raise HomeAssistantError("Invalid screen data")
    header, encoded = data_url.split(",", 1)
    content_type = "application/octet-stream"
    if ";base64" in header:
        content_type = header[5:].split(";")[0] or content_type
        try:
            return base64.b64decode(encoded), content_type
        except (ValueError, binascii.Error) as exc:
            raise HomeAssistantError("Invalid screen payload") from exc
    raise HomeAssistantError("Unsupported screen encoding")


def _sanitize_filename(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9._-]", "_", value.strip() or "screen")
    return cleaned.strip("._") or "screen"


def _build_media_reference(relative: str) -> str:
    clean_relative = (relative or "").strip("/")
    if not clean_relative:
        return MEDIA_REFERENCE_LOCAL_ROOT
    return f"{MEDIA_REFERENCE_LOCAL_ROOT}/{clean_relative}"


def _compute_sha256_bytes(content: bytes) -> str:
    digest = hashlib.sha256()
    digest.update(content)
    return digest.hexdigest()


def _compute_sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _store_media_asset_sync(base_dir: Path, filename: str, content: bytes) -> tuple[str, bool]:
    safe_name = _sanitize_filename(Path(filename).name or "asset")
    if not safe_name:
        raise HomeAssistantError("Invalid asset filename")
    if not base_dir.exists() or not base_dir.is_dir():
        raise HomeAssistantError("Media directory not initialized")

    base_path = base_dir.resolve()
    content_hash = _compute_sha256_bytes(content)
    stem = Path(safe_name).stem or "asset"
    suffix = Path(safe_name).suffix

    index = 0
    while True:
        name = safe_name if index == 0 else f"{stem}_{index}{suffix}"
        candidate = (base_dir / name).resolve()
        if candidate.parent != base_path:
            raise HomeAssistantError("Invalid asset path")

        if candidate.exists():
            if not candidate.is_file():
                raise HomeAssistantError("Asset path is not a file")
            existing_hash = _compute_sha256_file(candidate)
            if existing_hash == content_hash:
                return name, True
            index += 1
            continue

        candidate.write_bytes(content)
        return name, False


def _extract_asset_id(asset: dict[str, Any]) -> str | None:
    for key in ("id", "asset_id", "card_asset_id", "uuid"):
        value = asset.get(key)
        if isinstance(value, (int, str)) and str(value).strip():
            return str(value)
    return None


def _extract_asset_filename(asset: dict[str, Any]) -> str | None:
    filename_keys = (
        "filename",
        "file_name",
        "name",
        "original_filename",
        "original_name",
        "card_asset_filename",
        "card_asset_name",
    )
    for key in filename_keys:
        value = asset.get(key)
        if isinstance(value, str) and value.strip():
            return Path(value).name

    path_keys = (
        "path",
        "asset_path",
        "card_asset_path",
        "url",
        "asset_url",
        "card_asset_url",
    )
    for key in path_keys:
        value = asset.get(key)
        if not isinstance(value, str) or not value.strip():
            continue
        parsed = urlparse(value)
        candidate = Path(parsed.path).name if parsed.path else Path(value).name
        if candidate:
            return candidate
    return None


def _collect_asset_reference_candidates(asset: dict[str, Any], asset_id: str | None) -> set[str]:
    candidates: set[str] = set()
    reference_keys = (
        "reference",
        "original_reference",
        "source_reference",
        "card_asset_reference",
        "media_reference",
        "asset_reference",
        "preview_reference",
        "url",
        "asset_url",
        "card_asset_url",
        "path",
        "asset_path",
        "card_asset_path",
    )
    for key in reference_keys:
        value = asset.get(key)
        if isinstance(value, str) and value.strip():
            candidates.add(value)

    if asset_id:
        for prefix in ("cb-asset://", "card-asset://", "asset://", "marketplace-asset://"):
            candidates.add(f"{prefix}{asset_id}")

    return candidates


def _apply_reference_mapping(value: Any, mapping: dict[str, str]) -> Any:
    if isinstance(value, dict):
        return {key: _apply_reference_mapping(val, mapping) for key, val in value.items()}
    if isinstance(value, list):
        return [_apply_reference_mapping(item, mapping) for item in value]
    if not isinstance(value, str) or not mapping:
        return value

    updated = value
    for old, new in mapping.items():
        if old in updated:
            updated = updated.replace(old, new)
    return updated


async def _fetch_marketplace_card_payload(
    api_client: CardBuilderAccountApiClient,
    marketplace_id: str,
    version: int | None = None,
) -> tuple[int, dict[str, Any]]:
    """Fetch a marketplace card payload from the remote API without downloading assets."""
    status, data = await api_client.marketplace_card_available_get(marketplace_id, version)
    payload = data or {}

    name = str(payload.get("name") or "").strip()
    if not name:
        raise HomeAssistantError("Card name is required")

    config = payload.get("config")
    if not isinstance(config, dict):
        raise HomeAssistantError("Card config is required")

    payload_version = payload.get("version")
    if not isinstance(payload_version, int) or payload_version < 1:
        raise HomeAssistantError("Card version is required")

    return status, payload


async def _download_and_map_assets(
    hass: HomeAssistant,
    api_client: CardBuilderAccountApiClient,
    marketplace_id: str,
    payload: dict[str, Any],
    config: dict[str, Any],
) -> tuple[dict[str, Any], dict[str, Any] | None, list[dict[str, Any]], list[dict[str, Any]]]:
    """Download assets for a marketplace card and apply reference mapping to config."""
    payload_version = payload.get("version")
    if not isinstance(payload_version, int) or payload_version < 1:
        raise HomeAssistantError("Card version is required")

    assets = payload.get("assets")
    if not isinstance(assets, list):
        assets = []

    references: set[str] = set()
    _collect_media_references(config, references)
    meta = payload.get("meta")
    if isinstance(meta, dict):
        meta = deepcopy(meta)
        _collect_media_references(meta, references)
    else:
        meta = None

    base_dir = _get_media_dir(hass)
    asset_results: list[dict[str, Any]] = []
    asset_errors: list[dict[str, Any]] = []
    reference_mapping: dict[str, str] = {}
    filename_entries: list[dict[str, Any]] = []

    for asset in assets:
        if not isinstance(asset, dict):
            continue
        asset_id = _extract_asset_id(asset)
        if not asset_id:
            asset_errors.append({"error": "Missing asset id"})
            continue
        try:
            _, content, content_type = await api_client.marketplace_card_available_asset_get(
                marketplace_id,
                payload_version,
                asset_id,
            )
            extracted_name = _extract_asset_filename(asset) or asset_id
            content_type_value = (content_type or "").split(";")[0].strip() or None
            filename = _sanitize_filename(Path(extracted_name).name or asset_id)
            if not Path(filename).suffix and content_type_value:
                ext = mimetypes.guess_extension(content_type_value) or ""
                if ext:
                    filename = f"{filename}{ext}"

            saved_name, reused = await hass.async_add_executor_job(
                _store_media_asset_sync, base_dir, filename, content
            )
            reference = _build_media_reference(saved_name)
            asset_results.append(
                {
                    "asset_id": asset_id,
                    "filename": saved_name,
                    "reference": reference,
                    "reused": reused,
                }
            )

            for candidate in _collect_asset_reference_candidates(asset, asset_id):
                if candidate and candidate not in reference_mapping:
                    reference_mapping[candidate] = reference

            filename_entries.append(
                {
                    "original_name": Path(extracted_name).name,
                    "reference": reference,
                }
            )
        except (HomeAssistantError, CardBuilderAccountApiError) as err:
            asset_errors.append({"asset_id": asset_id, "error": str(err)})

    if references:
        remaining = references.difference(reference_mapping.keys())
        if remaining and filename_entries:
            name_counts: dict[str, int] = {}
            for entry in filename_entries:
                entry_name = entry.get("original_name") or ""
                if entry_name:
                    name_counts[entry_name] = name_counts.get(entry_name, 0) + 1
            for ref in remaining:
                base_name = Path(ref).name
                if not base_name:
                    continue
                if name_counts.get(base_name, 0) != 1:
                    continue
                match = next(
                    (entry for entry in filename_entries if entry.get("original_name") == base_name),
                    None,
                )
                if match and base_name not in reference_mapping:
                    reference_mapping[ref] = match["reference"]

    if reference_mapping:
        config = _apply_reference_mapping(config, reference_mapping)
        if isinstance(meta, dict):
            meta = _apply_reference_mapping(meta, reference_mapping)

    return config, meta, asset_results, asset_errors


def _extract_uploaded_version(payload: dict[str, Any], response: dict[str, Any]) -> int:
    if "data" in response and isinstance(response.get("data"), dict):
        response = response["data"]

    latest_version = response.get("latest_version")
    if isinstance(latest_version, dict):
        for key in ("version", "version_number", "number"):
            value = latest_version.get(key)
            if isinstance(value, int):
                return value

    version = response.get("version")
    if isinstance(version, int):
        return version

    payload_version = payload.get("version")
    if isinstance(payload_version, int):
        return payload_version

    raise HomeAssistantError("Unable to determine uploaded version")


async def _upload_asset_reference(
    hass: HomeAssistant,
    api_client: CardBuilderAccountApiClient,
    card_id: str,
    version: int,
    base_dir: Path,
    reference: str,
    asset_type: str,
) -> dict[str, Any]:
    try:
        file_path = _media_reference_to_path(base_dir, reference)
        if not file_path.exists() or not file_path.is_file():
            raise HomeAssistantError("Media file not found")

        content = await hass.async_add_executor_job(file_path.read_bytes)
        content_type = mimetypes.guess_type(file_path.name)[0]
        data = await api_client.card_upload_asset(
            card_id,
            version,
            filename=file_path.name,
            content=content,
            content_type=content_type,
            asset_type=asset_type,
        )
        return {"reference": reference, "asset_type": asset_type, "data": data}
    except (HomeAssistantError, CardBuilderAccountApiError) as err:
        return {"reference": reference, "asset_type": asset_type, "error": str(err)}


def async_setup(hass: HomeAssistant) -> None:
    """Set up the Card Builder account WebSocket API."""
    websocket_api.async_register_command(hass, ws_info_get)
    websocket_api.async_register_command(hass, ws_api_token_set)
    websocket_api.async_register_command(hass, ws_account_get)
    websocket_api.async_register_command(hass, ws_account_fingerprint)
    websocket_api.async_register_command(hass, ws_account_disconnect)
    websocket_api.async_register_command(hass, ws_marketplace_cards_shared_list)
    websocket_api.async_register_command(hass, ws_marketplace_categories)
    websocket_api.async_register_command(hass, ws_marketplace_cards_shared_update_reasons)
    websocket_api.async_register_command(hass, ws_marketplace_cards_shared_upload)
    websocket_api.async_register_command(hass, ws_marketplace_cards_shared_update)
    websocket_api.async_register_command(hass, ws_marketplace_disclaimer_share)
    websocket_api.async_register_command(hass, ws_marketplace_disclaimer_download)
    websocket_api.async_register_command(hass, ws_marketplace_cards_available_info)
    websocket_api.async_register_command(hass, ws_marketplace_cards_available_download_prepare)
    websocket_api.async_register_command(hass, ws_marketplace_cards_available_download_confirm)
    websocket_api.async_register_command(hass, ws_marketplace_cards_available_update_prepare)
    websocket_api.async_register_command(hass, ws_marketplace_cards_available_update_confirm)
    websocket_api.async_register_command(hass, ws_marketplace_cards_available_versions_check)
    websocket_api.async_register_command(hass, ws_marketplace_cards_available_changelog)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TOKEN_SET,
        vol.Required("token"): cv.string,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_api_token_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Store the API token for Card Builder."""
    try:
        token = msg.get("token", "").strip()
        if not token:
            raise HomeAssistantError("Token is required")
        account_store = _get_account_store(hass)
        await account_store.async_save({"token": token})
        api_client = _get_api_client(hass)
        api_client.set_token(token)
        connection.send_result(msg["id"], {"success": True})
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "token_set_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_SHARED_UPLOAD,
        vol.Required("card_id"): cv.string,
        vol.Optional("screens"): vol.All(cv.ensure_list, [dict]),
        vol.Optional("update_notes"): cv.string,
        vol.Optional("update_reasons"): vol.All(cv.ensure_list, [vol.Any(cv.positive_int, cv.string)]),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_shared_upload(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Upload a card or a new card version."""
    try:
        card_id = msg["card_id"]
        card_storage = _get_card_storage(hass)
        card = card_storage.data.get(card_id)
        if not card:
            raise HomeAssistantError("Card not found")
        card_payload = dict(card)
        if "update_notes" in msg:
            card_payload["update_notes"] = msg.get("update_notes")
        if "update_reasons" in msg:
            card_payload["update_reasons"] = msg.get("update_reasons")
        api_client = _get_api_client(hass)

        marketplace_id = card_payload.get("marketplace_id")
        marketplace_download = bool(card_payload.get("marketplace_download"))
        if marketplace_download:
            raise HomeAssistantError("Marketplace downloaded cards cannot be uploaded")
        is_shared = bool(marketplace_id)

        if is_shared:
            payload = _build_card_version_payload(card_payload)
            status, data = await api_client.marketplace_card_create_version(card_id, payload)
        else:
            payload = _build_marketplace_card_create_payload(card_id, card_payload)
            status, data = await api_client.marketplace_card_create(payload)

        version = _extract_uploaded_version(payload, data)

        preview_reference = _extract_preview_reference(payload.get("meta"))
        references: set[str] = set()
        _collect_media_references(payload.get("config", {}), references)
        if preview_reference:
            references.discard(preview_reference)

        asset_uploads: list[dict[str, Any]] = []
        asset_errors: list[dict[str, Any]] = []

        if preview_reference or references:
            base_dir = _get_media_dir(hass)
            asset_jobs: list[tuple[str, str]] = []
            if preview_reference:
                asset_jobs.append((preview_reference, "preview-image"))
            asset_jobs.extend((reference, "in-card-image") for reference in references)
            results = await asyncio.gather(
                *[
                    _upload_asset_reference(
                        hass,
                        api_client,
                        card_id,
                        version,
                        base_dir,
                        reference,
                        asset_type,
                    )
                    for reference, asset_type in asset_jobs
                ]
            )
            for result in results:
                if "error" in result:
                    asset_errors.append(result)
                else:
                    asset_uploads.append(result)

        screens = msg.get("screens")
        if isinstance(screens, list) and screens:
            for index, screen in enumerate(screens):
                if not isinstance(screen, dict):
                    continue
                data_url = screen.get("data_url") or screen.get("data")
                if not isinstance(data_url, str):
                    continue
                container_id = screen.get("container_id") or screen.get("containerId") or f"screen-{index + 1}"
                try:
                    content, content_type = _decode_data_url(data_url)
                    ext = mimetypes.guess_extension(content_type or "") or ".png"
                    filename = f"{_sanitize_filename(str(container_id))}{ext}"
                    result = await api_client.card_upload_asset(
                        card_id,
                        version,
                        filename=filename,
                        content=content,
                        content_type=content_type,
                        asset_type="preview-image",
                        role=str(container_id),
                        sort_order=index,
                    )
                    asset_uploads.append(result)
                except (HomeAssistantError, CardBuilderAccountApiError) as err:
                    asset_errors.append({
                        "error": str(err),
                        "container_id": str(container_id),
                    })

        response: dict[str, Any] = {"status": status, "data": data}
        if asset_uploads:
            response["asset_uploads"] = asset_uploads
        if asset_errors:
            response["asset_errors"] = asset_errors
        connection.send_result(msg["id"], response)
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "card_upload_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_SHARED_LIST,
        vol.Optional("ids"): vol.All(cv.ensure_list, [cv.string]),
        vol.Optional("sort"): vol.In(["id", "version", "created_at", "updated_at"]),
        vol.Optional("direction"): vol.In(["asc", "desc"]),
        vol.Optional("per_page"): vol.All(vol.Coerce(int), vol.Range(min=1, max=100)),
        vol.Optional("page"): vol.All(vol.Coerce(int), vol.Range(min=1)),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_shared_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch shared cards list from the marketplace."""
    try:
        api_client = _get_api_client(hass)
        data = await api_client.marketplace_cards_shared_list(
            ids=msg.get("ids"),
            sort=msg.get("sort"),
            direction=msg.get("direction"),
            per_page=msg.get("per_page"),
            page=msg.get("page"),
        )
        connection.send_result(msg["id"], data)
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_cards_shared_list_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CATEGORIES,
        vol.Optional("lang"): cv.string,
        vol.Optional("search"): cv.string,
        vol.Optional("per_page"): vol.All(vol.Coerce(int), vol.Range(min=1, max=100)),
        vol.Optional("page"): vol.All(vol.Coerce(int), vol.Range(min=1)),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_categories(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch available card categories."""
    try:
        api_client = _get_api_client(hass)
        data = await api_client.card_categories(
            lang=msg.get("lang"),
            search=msg.get("search"),
            per_page=msg.get("per_page"),
            page=msg.get("page"),
        )
        connection.send_result(msg["id"], data)
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "card_categories_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_SHARED_UPDATE_REASONS,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_shared_update_reasons(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch available update reasons."""
    try:
        api_client = _get_api_client(hass)
        data = await api_client.marketplace_card_update_reasons()
        connection.send_result(msg["id"], data)
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "update_reasons_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_SHARED_UPDATE,
        vol.Required("card_id"): cv.string,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_shared_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Update base card information."""
    try:
        card_id = msg["card_id"]
        card_storage = _get_card_storage(hass)
        card = card_storage.data.get(card_id)
        if not card:
            raise HomeAssistantError("Card not found")
        payload = _build_marketplace_card_update_payload(card)
        api_client = _get_api_client(hass)
        data = await api_client.marketplace_card_update(card_id, payload)
        connection.send_result(msg["id"], {"data": data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_card_update_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_AVAILABLE_INFO,
        vol.Required("marketplace_id"): cv.string,
        vol.Optional("version"): cv.positive_int,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_available_info(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch marketplace card preview info."""
    try:
        marketplace_id = str(msg.get("marketplace_id") or "").strip()
        if not marketplace_id:
            raise HomeAssistantError("Marketplace ID is required")
        version = msg.get("version")
        version_value = int(version) if isinstance(version, int) else None
        api_client = _get_api_client(hass)
        data = await api_client.marketplace_card_available_info(marketplace_id, version_value)
        connection.send_result(msg["id"], {"data": data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_card_info_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_PREPARE,
        vol.Required("marketplace_id"): cv.string,
        vol.Optional("version"): cv.positive_int,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_available_download_prepare(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch a marketplace card payload for preview/configuration before downloading."""
    try:
        marketplace_id = str(msg.get("marketplace_id") or "").strip()
        if not marketplace_id:
            raise HomeAssistantError("Marketplace ID is required")

        card_storage = _get_card_storage(hass)
        for card in card_storage.data.values():
            if str(card.get("marketplace_id") or "") == marketplace_id:
                raise HomeAssistantError("Marketplace card already downloaded")

        api_client = _get_api_client(hass)
        requested_version = msg.get("version")
        version_value = int(requested_version) if isinstance(requested_version, int) else None
        status, payload = await _fetch_marketplace_card_payload(
            api_client, marketplace_id, version_value,
        )

        connection.send_result(msg["id"], {"status": status, "data": payload})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        error_code = "marketplace_card_download_prepare_failed"
        if str(err) == "Marketplace card already downloaded":
            error_code = "marketplace_card_already_downloaded"
        connection.send_error(msg["id"], error_code, str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_CONFIRM,
        vol.Required("marketplace_id"): cv.string,
        vol.Required("payload"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_available_download_confirm(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Confirm marketplace card download: download assets and save the card locally."""
    try:
        marketplace_id = str(msg.get("marketplace_id") or "").strip()
        if not marketplace_id:
            raise HomeAssistantError("Marketplace ID is required")

        card_storage = _get_card_storage(hass)
        for card in card_storage.data.values():
            if str(card.get("marketplace_id") or "") == marketplace_id:
                raise HomeAssistantError("Marketplace card already downloaded")

        payload = msg["payload"]
        if not isinstance(payload, dict):
            raise HomeAssistantError("Payload is required")

        name = str(payload.get("name") or "").strip()
        if not name:
            raise HomeAssistantError("Card name is required")

        config = payload.get("config")
        if not isinstance(config, dict):
            raise HomeAssistantError("Card config is required")

        version = payload.get("version")
        if not isinstance(version, int) or version < 1:
            raise HomeAssistantError("Card version is required")

        api_client = _get_api_client(hass)
        config = deepcopy(config)
        config, meta, asset_results, asset_errors = await _download_and_map_assets(
            hass, api_client, marketplace_id, payload, config,
        )

        card_payload: dict[str, Any] = {
            "name": name,
            "description": str(payload.get("description") or ""),
            "config": config,
            "source": "marketplace",
            "marketplace_id": marketplace_id,
            "marketplace_download": True,
            "marketplace_download_version": version,
            "version": version,
        }

        if isinstance(meta, dict):
            card_payload["meta"] = meta

        for key in (
            "group_id",
            "min_ha_version",
            "max_ha_version",
            "min_builder_version",
            "tier",
            "checksum",
            "tags",
            "categories",
            "created_at",
            "updated_at",
        ):
            if key in payload:
                card_payload[key] = payload.get(key)

        created = await card_storage.async_create_item(card_payload)

        response: dict[str, Any] = {
            "card_id": created.get("id"),
            "marketplace_id": marketplace_id,
        }
        if asset_results:
            response["assets"] = asset_results
        if asset_errors:
            response["asset_errors"] = asset_errors
        connection.send_result(msg["id"], {"status": 200, "data": response})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        error_code = "marketplace_card_download_failed"
        if str(err) == "Marketplace card already downloaded":
            error_code = "marketplace_card_already_downloaded"
        connection.send_error(msg["id"], error_code, str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_PREPARE,
        vol.Required("card_id"): cv.string,
        vol.Optional("version"): cv.positive_int,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_available_update_prepare(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch a marketplace card update payload for preview/configuration before applying."""
    try:
        card_id = msg["card_id"]
        card_storage = _get_card_storage(hass)
        card = card_storage.data.get(card_id)
        if not card:
            raise HomeAssistantError("Card not found")
        if not bool(card.get("marketplace_download")):
            raise HomeAssistantError("Only downloaded marketplace cards can be updated")

        marketplace_id = str(card.get("marketplace_id") or "").strip()
        if not marketplace_id:
            raise HomeAssistantError("Marketplace ID is required")

        api_client = _get_api_client(hass)
        requested_version = msg.get("version")
        version_value = int(requested_version) if isinstance(requested_version, int) else None
        status, payload = await _fetch_marketplace_card_payload(
            api_client, marketplace_id, version_value,
        )

        local_config = card.get("config")

        response_data: dict[str, Any] = {
            "payload": payload,
        }
        if isinstance(local_config, dict):
            response_data["local_config"] = local_config

        connection.send_result(msg["id"], {"status": status, "data": response_data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_card_update_prepare_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_CONFIRM,
        vol.Required("card_id"): cv.string,
        vol.Required("payload"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_available_update_confirm(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Confirm marketplace card update: download assets and save the updated card."""
    try:
        card_id = msg["card_id"]
        card_storage = _get_card_storage(hass)
        card = card_storage.data.get(card_id)
        if not card:
            raise HomeAssistantError("Card not found")
        if not bool(card.get("marketplace_download")):
            raise HomeAssistantError("Only downloaded marketplace cards can be updated")

        marketplace_id = str(card.get("marketplace_id") or "").strip()
        if not marketplace_id:
            raise HomeAssistantError("Marketplace ID is required")

        payload = msg["payload"]
        if not isinstance(payload, dict):
            raise HomeAssistantError("Payload is required")

        name = str(payload.get("name") or "").strip()
        if not name:
            raise HomeAssistantError("Card name is required")

        config = payload.get("config")
        if not isinstance(config, dict):
            raise HomeAssistantError("Card config is required")

        version = payload.get("version")
        if not isinstance(version, int) or version < 1:
            raise HomeAssistantError("Card version is required")

        api_client = _get_api_client(hass)
        config = deepcopy(config)
        config, meta, asset_results, asset_errors = await _download_and_map_assets(
            hass, api_client, marketplace_id, payload, config,
        )

        update_data: dict[str, Any] = {
            "name": name,
            "description": str(payload.get("description") or ""),
            "config": config,
            "source": "marketplace",
            "marketplace_id": marketplace_id,
            "marketplace_download": True,
            "marketplace_download_version": version,
            "version": version,
            "_skip_version_bump": True,
        }

        if isinstance(meta, dict):
            update_data["meta"] = meta

        for key in (
            "group_id",
            "min_ha_version",
            "max_ha_version",
            "min_builder_version",
            "tier",
            "checksum",
            "tags",
            "categories",
            "created_at",
            "updated_at",
        ):
            if key in payload:
                update_data[key] = payload.get(key)

        await card_storage.async_update_item(card_id, update_data)

        response: dict[str, Any] = {
            "card_id": card_id,
            "marketplace_id": marketplace_id,
            "version": version,
        }
        if asset_results:
            response["assets"] = asset_results
        if asset_errors:
            response["asset_errors"] = asset_errors

        connection.send_result(msg["id"], {"status": 200, "data": response})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_card_update_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK,
        vol.Required("marketplace_ids"): vol.All(cv.ensure_list, [cv.string]),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_available_versions_check(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Check latest versions for marketplace cards."""
    try:
        raw_ids = msg.get("marketplace_ids") or []
        marketplace_ids = [str(item).strip() for item in raw_ids if str(item).strip()]
        if not marketplace_ids:
            raise HomeAssistantError("Marketplace IDs are required")
        api_client = _get_api_client(hass)
        data = await api_client.marketplace_card_versions_check(marketplace_ids)
        connection.send_result(msg["id"], {"data": data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_versions_check_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_CARDS_AVAILABLE_CHANGELOG,
        vol.Required("marketplace_id"): cv.string,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_cards_available_changelog(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch marketplace card changelog."""
    try:
        marketplace_id = str(msg.get("marketplace_id") or "").strip()
        if not marketplace_id:
            raise HomeAssistantError("Marketplace ID is required")
        api_client = _get_api_client(hass)
        data = await api_client.marketplace_card_available_changelog(marketplace_id)
        connection.send_result(msg["id"], {"data": data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_changelog_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_DISCLAIMER_SHARE,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_disclaimer_share(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch marketplace share disclaimer."""
    try:
        api_client = _get_api_client(hass)
        data = await api_client.marketplace_disclaimer_share()
        connection.send_result(msg["id"], {"data": data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_disclaimer_share_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_MARKETPLACE_DISCLAIMER_DOWNLOAD,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_marketplace_disclaimer_download(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch marketplace download disclaimer."""
    try:
        api_client = _get_api_client(hass)
        data = await api_client.marketplace_disclaimer_download()
        connection.send_result(msg["id"], {"data": data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "marketplace_disclaimer_download_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_ACCOUNT_GET,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_account_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch account information from the API."""
    try:
        api_client = _get_api_client(hass)
        data = await api_client.account_get()
        connection.send_result(msg["id"], {"data": data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "account_get_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_ACCOUNT_FINGERPRINT,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_account_fingerprint(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Register the Home Assistant instance fingerprint for the account."""
    try:
        fingerprint = _get_instance_fingerprint(hass)
        api_client = _get_api_client(hass)
        data = await api_client.account_register_fingerprint(fingerprint)
        connection.send_result(msg["id"], {"data": data, "success": True})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "account_fingerprint_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_ACCOUNT_DISCONNECT,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_account_disconnect(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Disconnect the Card Builder account from this instance."""
    try:
        api_client = _get_api_client(hass)
        data = await api_client.account_disconnect()
        account_store = _get_account_store(hass)
        await account_store.async_save({})
        api_client.set_token(None)
        connection.send_result(msg["id"], {"data": data, "success": True})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "account_disconnect_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_INFO_GET,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_info_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Fetch public info about plans and limits."""
    try:
        api_client = _get_api_client(hass)
        data = await api_client.info_get()
        connection.send_result(msg["id"], {"data": data})
    except CardBuilderAccountApiError as err:
        _send_api_error(connection, msg["id"], err)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "info_get_failed", str(err))
