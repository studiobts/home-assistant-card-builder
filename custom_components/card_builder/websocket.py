"""WebSocket API for Card Builder integration."""
from __future__ import annotations

from typing import Any

import base64
import mimetypes
from pathlib import Path

import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.collection import DictStorageCollectionWebsocket
from homeassistant.components import websocket_api

from .storage import (
    CSSCustomPropertyStorageCollection,
    CardStorageCollection,
    StylePresetStorageCollection,
)
from .const import (
    DOMAIN,
    MEDIA_DATA_KEY,
    MEDIA_DIR_NAME,
    MEDIA_REFERENCE_LOCAL_ROOT,
    MEDIA_WS_DELETE,
    MEDIA_WS_LIST,
    MEDIA_WS_UPLOAD,
)

CARD_CREATE_FIELDS: dict[vol.Marker, Any] = {
    vol.Required("name"): cv.string,
    vol.Optional("description", default=""): cv.string,
    vol.Required("config"): dict,
}

CARD_UPDATE_FIELDS: dict[vol.Marker, Any] = {
    vol.Optional("name"): cv.string,
    vol.Optional("description"): cv.string,
    vol.Optional("config"): dict,
}

PRESET_CREATE_FIELDS: dict[vol.Marker, Any] = {
    vol.Required("name"): cv.string,
    vol.Optional("description", default=""): cv.string,
    vol.Optional("extends_preset_id"): vol.Any(cv.string, None),
    vol.Required("data"): dict,
}

PRESET_UPDATE_FIELDS: dict[vol.Marker, Any] = {
    vol.Optional("name"): cv.string,
    vol.Optional("description"): cv.string,
    vol.Optional("extends_preset_id"): vol.Any(cv.string, None),
    vol.Optional("data"): dict,
}

CSS_CUSTOM_PROPERTY_CREATE_FIELDS: dict[vol.Marker, Any] = {
    vol.Required("name"): cv.string,
    vol.Required("syntax"): cv.string,
    vol.Optional("inherits", default=False): cv.boolean,
    vol.Required("initial_value"): cv.string,
}

CSS_CUSTOM_PROPERTY_UPDATE_FIELDS: dict[vol.Marker, Any] = {}


def _get_media_dir(hass: HomeAssistant) -> Path:
    media_dir = hass.data.get(DOMAIN, {}).get(MEDIA_DATA_KEY)
    if not media_dir:
        raise HomeAssistantError("Media directory not initialized")
    return Path(media_dir)


def _resolve_media_path(base_dir: Path, relative: str) -> Path:
    safe_relative = (relative or "").lstrip("/")
    target = (base_dir / safe_relative).resolve()
    base_resolved = base_dir.resolve()
    if target != base_resolved and base_resolved not in target.parents:
        raise HomeAssistantError("Invalid media path")
    return target


def _build_media_reference(relative: str) -> str:
    clean_relative = (relative or "").strip("/")
    if not clean_relative:
        return MEDIA_REFERENCE_LOCAL_ROOT
    return f"{MEDIA_REFERENCE_LOCAL_ROOT}/{clean_relative}"


def _list_media_entries(base_dir: Path, target_dir: Path) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for entry in target_dir.iterdir():
        if entry.name.startswith("."):
            continue
        is_dir = entry.is_dir()
        rel_path = entry.relative_to(base_dir).as_posix()
        if is_dir:
            entries.append(
                {
                    "title": entry.name,
                    "media_content_id": _build_media_reference(rel_path),
                    "media_content_type": "directory",
                    "media_class": "directory",
                    "can_expand": True,
                }
            )
            continue

        mime_type, _ = mimetypes.guess_type(entry.name)
        media_type = mime_type or "application/octet-stream"
        media_class = "image" if mime_type and mime_type.startswith("image/") else "file"
        entries.append(
            {
                "title": entry.name,
                "media_content_id": _build_media_reference(rel_path),
                "media_content_type": media_type,
                "media_class": media_class,
                "can_expand": False,
            }
        )

    entries.sort(key=lambda item: (0 if item.get("can_expand") else 1, item.get("title", "").lower()))
    return entries


def _write_media_file(target_dir: Path, filename: str, content: bytes) -> Path:
    safe_name = Path(filename).name
    if not safe_name:
        raise HomeAssistantError("Invalid filename")
    if not target_dir.exists() or not target_dir.is_dir():
        raise HomeAssistantError("Target folder does not exist")
    target_path = (target_dir / safe_name).resolve()
    if target_path.parent != target_dir.resolve():
        raise HomeAssistantError("Invalid target path")
    target_path.write_bytes(content)
    return target_path


def _delete_media_file(path: Path) -> None:
    if not path.exists():
        raise HomeAssistantError("File not found")
    if path.is_dir():
        raise HomeAssistantError("Deleting folders is not supported")
    path.unlink()


def async_setup(
    hass: HomeAssistant,
    card_storage: CardStorageCollection,
    preset_storage: StylePresetStorageCollection,
    custom_property_storage: CSSCustomPropertyStorageCollection,
) -> None:
    """Set up the Card Builder WebSocket API."""

    card_websocket = DictStorageCollectionWebsocket(
        card_storage,
        "card_builder/cards",
        "card",
        CARD_CREATE_FIELDS,
        CARD_UPDATE_FIELDS,
    )

    preset_websocket = DictStorageCollectionWebsocket(
        preset_storage,
        "card_builder/style_presets",
        "style_preset",
        PRESET_CREATE_FIELDS,
        PRESET_UPDATE_FIELDS,
    )

    css_custom_property_websocket = DictStorageCollectionWebsocket(
        custom_property_storage,
        "card_builder/css_custom_properties",
        "custom_property",
        CSS_CUSTOM_PROPERTY_CREATE_FIELDS,
        CSS_CUSTOM_PROPERTY_UPDATE_FIELDS,
    )

    card_websocket.async_setup(hass)
    preset_websocket.async_setup(hass)
    css_custom_property_websocket.async_setup(hass)

    websocket_api.async_register_command(hass, ws_media_list)
    websocket_api.async_register_command(hass, ws_media_upload)
    websocket_api.async_register_command(hass, ws_media_delete)


@websocket_api.websocket_command(
    {
        vol.Required("type"): MEDIA_WS_LIST,
        vol.Optional("path", default=""): cv.string,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_media_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """List files in the Card Builder media directory."""
    try:
        base_dir = _get_media_dir(hass)
        target_dir = _resolve_media_path(base_dir, msg.get("path", ""))
        if not target_dir.exists() or not target_dir.is_dir():
            raise HomeAssistantError("Directory not found")

        entries = await hass.async_add_executor_job(_list_media_entries, base_dir, target_dir)
        connection.send_result(msg["id"], {"children": entries})
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "media_list_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): MEDIA_WS_UPLOAD,
        vol.Optional("path", default=""): cv.string,
        vol.Required("filename"): cv.string,
        vol.Required("content"): cv.string,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_media_upload(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Upload a file to the Card Builder media directory."""
    try:
        base_dir = _get_media_dir(hass)
        target_dir = _resolve_media_path(base_dir, msg.get("path", ""))
        payload = msg.get("content", "")
        if not payload:
            raise HomeAssistantError("Empty upload payload")

        try:
            raw = base64.b64decode(payload)
        except (ValueError, TypeError) as err:
            raise HomeAssistantError("Invalid base64 payload") from err

        target_path = await hass.async_add_executor_job(
            _write_media_file, target_dir, msg.get("filename", ""), raw
        )
        relative_path = target_path.relative_to(base_dir).as_posix()
        reference = _build_media_reference(relative_path)
        connection.send_result(
            msg["id"],
            {
                "reference": reference,
                "path": relative_path,
                "url": f"/local/{MEDIA_DIR_NAME}/{relative_path}",
            },
        )
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "media_upload_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): MEDIA_WS_DELETE,
        vol.Required("path"): cv.string,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_media_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Delete a file from the Card Builder media directory."""
    try:
        base_dir = _get_media_dir(hass)
        target_path = _resolve_media_path(base_dir, msg.get("path", ""))
        await hass.async_add_executor_job(_delete_media_file, target_path)
        connection.send_result(msg["id"], {"path": msg.get("path"), "success": True})
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "media_delete_failed", str(err))
