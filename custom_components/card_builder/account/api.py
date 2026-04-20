"""API client for Card Builder account."""
from __future__ import annotations

import asyncio
import json
from json import JSONDecodeError
from typing import Any

from aiohttp import ClientError, ClientResponse, ClientSession, ContentTypeError, FormData

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    API_ACCOUNT_PATH,
    API_ACCOUNT_DISCONNECT_PATH,
    API_ACCOUNT_FINGERPRINT_PATH,
    API_BASE_URL,
    API_EXTRA_HEADERS,
    API_INFO_PATH,
    API_MARKETPLACE_CARDS_AVAILABLE_ASSET_PATH,
    API_MARKETPLACE_CARDS_AVAILABLE_GET_PATH,
    API_MARKETPLACE_CARDS_AVAILABLE_INFO_PATH,
    API_MARKETPLACE_CARDS_AVAILABLE_CHANGELOG_PATH,
    API_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK_PATH,
    API_MARKETPLACE_CARDS_SHARED_ASSET_UPLOAD_PATH,
    API_MARKETPLACE_CARDS_SHARED_CREATE_PATH,
    API_MARKETPLACE_CARDS_SHARED_VERSION_CREATE_PATH,
    API_MARKETPLACE_CATEGORIES_PATH,
    API_MARKETPLACE_CARDS_SHARED_LIST_PATH,
    API_MARKETPLACE_CARDS_SHARED_UPDATE_PATH,
    API_MARKETPLACE_CARDS_SHARED_UPDATE_REASONS_PATH,
    API_MARKETPLACE_DISCLAIMER_DOWNLOAD_PATH,
    API_MARKETPLACE_DISCLAIMER_SHARE_PATH,
)
from ..const import (
    CARD_BUILDER_INTEGRATION_VERSION,
    DATA_KEY_INSTANCE_FINGERPRINT,
    DOMAIN,
)


class CardBuilderAccountApiError(HomeAssistantError):
    """Base error for Card Builder API failures."""

    def __init__(self, message: str, *, api_code: str | None = None) -> None:
        super().__init__(message)
        self.api_code = api_code


class CardBuilderAccountAuthError(CardBuilderAccountApiError):
    """Authentication failure for Card Builder API."""


class CardBuilderAccountNotFoundError(CardBuilderAccountApiError):
    """Resource was not found in Card Builder API."""


class CardBuilderAccountConflictError(CardBuilderAccountApiError):
    """Conflict error from Card Builder API."""


class CardBuilderAccountValidationError(CardBuilderAccountApiError):
    """Validation error from Card Builder API."""


class CardBuilderAccountCommunicationError(CardBuilderAccountApiError):
    """Communication error with Card Builder API."""


class CardBuilderAccountIntegrationVersionOutdated(CardBuilderAccountApiError):
    """Integration version is outdated for the Card Builder API."""


class CardBuilderAccountApiClient:
    """Client for Card Builder console API."""

    def __init__(
        self,
        hass: HomeAssistant,
        token: str | None = None,
        session: ClientSession | None = None,
    ) -> None:
        """Initialize the API client."""
        self._hass = hass
        self._session = session or async_get_clientsession(hass)
        self._base_url = API_BASE_URL.rstrip("/")
        self._token = token

    def set_token(self, token: str | None) -> None:
        """Set the bearer token for API requests."""
        self._token = token

    async def marketplace_card_create(self, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
        """Create a new marketplace card."""
        status, data = await self._request_json(
            "POST",
            API_MARKETPLACE_CARDS_SHARED_CREATE_PATH,
            json_payload=payload,
            include_fingerprint=True,
        )
        return status, _unwrap_data(data)

    async def marketplace_card_create_version(
        self, card_id: str, payload: dict[str, Any]
    ) -> tuple[int, dict[str, Any]]:
        """Create a new version for an existing marketplace card."""
        status, data = await self._request_json(
            "POST",
            API_MARKETPLACE_CARDS_SHARED_VERSION_CREATE_PATH.format(card_id=card_id),
            json_payload=payload,
            include_fingerprint=True,
        )
        return status, _unwrap_data(data)

    async def marketplace_cards_shared_list(
        self,
        *,
        ids: list[str] | None = None,
        sort: str | None = None,
        direction: str | None = None,
        per_page: int | None = None,
        page: int | None = None,
    ) -> dict[str, Any]:
        """Fetch shared cards list from the marketplace."""
        params: dict[str, Any] = {}
        if ids:
            params["ids[]"] = ids
        if sort:
            params["sort"] = sort
        if direction:
            params["direction"] = direction
        if per_page is not None:
            params["per_page"] = per_page
        if page is not None:
            params["page"] = page

        _, data = await self._request_json(
            "GET",
            API_MARKETPLACE_CARDS_SHARED_LIST_PATH,
            query_params=params or None,
            include_fingerprint=True,
        )
        return data or {}

    async def card_categories(
        self,
        *,
        lang: str | None = None,
        search: str | None = None,
        page: int | None = None,
        per_page: int | None = None,
    ) -> dict[str, Any]:
        """Fetch available card categories."""
        params: dict[str, Any] = {}
        if lang:
            params["lang"] = lang
        if search:
            params["search"] = search
        if page is not None:
            params["page"] = page
        if per_page is not None:
            params["per_page"] = per_page

        _, data = await self._request_json(
            "GET",
            API_MARKETPLACE_CATEGORIES_PATH,
            query_params=params or None,
            include_fingerprint=True,
        )
        return data or {}

    async def marketplace_card_update_reasons(self) -> dict[str, Any]:
        """Fetch available update reasons."""
        _, data = await self._request_json(
            "GET",
            API_MARKETPLACE_CARDS_SHARED_UPDATE_REASONS_PATH,
            include_fingerprint=True,
        )
        return data or {}

    async def marketplace_card_update(self, card_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Update base card info without creating a new version."""
        _, data = await self._request_json(
            "PUT",
            API_MARKETPLACE_CARDS_SHARED_UPDATE_PATH.format(card_id=card_id),
            json_payload=payload,
            include_fingerprint=True,
        )
        return _unwrap_data(data)

    async def marketplace_disclaimer_share(self) -> dict[str, Any]:
        """Fetch marketplace share disclaimer."""
        _, data = await self._request_json(
            "GET",
            API_MARKETPLACE_DISCLAIMER_SHARE_PATH,
            include_fingerprint=True,
        )
        return _unwrap_data(data)

    async def marketplace_disclaimer_download(self) -> dict[str, Any]:
        """Fetch marketplace download disclaimer."""
        _, data = await self._request_json(
            "GET",
            API_MARKETPLACE_DISCLAIMER_DOWNLOAD_PATH,
            include_fingerprint=True,
        )
        return _unwrap_data(data)

    async def marketplace_card_available_info(
        self, marketplace_id: str, version: int | None = None
    ) -> dict[str, Any]:
        """Fetch marketplace card info for preview."""
        params: dict[str, Any] | None = None
        if isinstance(version, int) and version > 0:
            params = {"version": version}
        _, data = await self._request_json(
            "GET",
            API_MARKETPLACE_CARDS_AVAILABLE_INFO_PATH.format(marketplace_id=marketplace_id),
            query_params=params,
            include_fingerprint=True,
        )
        return _unwrap_data(data)

    async def marketplace_card_available_get(
        self, marketplace_id: str, version: int | None = None
    ) -> tuple[int, dict[str, Any]]:
        """Download a marketplace card payload."""
        params: dict[str, Any] | None = None
        if isinstance(version, int) and version > 0:
            params = {"version": version}
        status, data = await self._request_json(
            "GET",
            API_MARKETPLACE_CARDS_AVAILABLE_GET_PATH.format(marketplace_id=marketplace_id),
            query_params=params,
            include_fingerprint=True,
        )
        return status, _unwrap_data(data)

    async def marketplace_card_versions_check(self, marketplace_ids: list[str]) -> dict[str, Any]:
        """Check latest versions for marketplace cards."""
        _, data = await self._request_json(
            "POST",
            API_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK_PATH,
            json_payload={"marketplace_ids": marketplace_ids},
            include_fingerprint=True,
        )
        return _unwrap_data(data)

    async def marketplace_card_available_changelog(self, marketplace_id: str) -> dict[str, Any]:
        """Fetch marketplace card changelog."""
        _, data = await self._request_json(
            "GET",
            API_MARKETPLACE_CARDS_AVAILABLE_CHANGELOG_PATH.format(marketplace_id=marketplace_id),
            include_fingerprint=True,
        )
        return _unwrap_data(data)

    async def marketplace_card_available_asset_get(
        self,
        marketplace_id: str,
        version: int,
        asset_id: str,
    ) -> tuple[int, bytes, str | None]:
        """Download a single marketplace card asset."""
        return await self._request_bytes(
            "GET",
            API_MARKETPLACE_CARDS_AVAILABLE_ASSET_PATH.format(
                marketplace_id=marketplace_id,
                version=version,
                asset_id=asset_id,
            ),
            include_fingerprint=True,
        )

    async def card_upload_asset(
        self,
        card_id: str,
        version: int,
        *,
        filename: str,
        content: bytes,
        content_type: str | None,
        asset_type: str,
        role: str | None = None,
        sort_order: int | None = None,
    ) -> dict[str, Any]:
        """Upload a single asset image for a card version."""
        form = FormData()
        form.add_field(
            "file",
            content,
            filename=filename,
            content_type=content_type or "application/octet-stream",
        )
        form.add_field("type", asset_type)
        if role:
            form.add_field("role", role)
        if sort_order is not None:
            form.add_field("sort_order", str(sort_order))

        _, data = await self._request_multipart(
            API_MARKETPLACE_CARDS_SHARED_ASSET_UPLOAD_PATH.format(
                card_id=card_id,
                version=version,
            ),
            form,
            include_fingerprint=True,
        )
        return data

    async def account_get(self) -> dict[str, Any]:
        """Fetch account information from the API."""
        _, data = await self._request_json("GET", API_ACCOUNT_PATH)
        account = _unwrap_data(data)
        return {
            "plan_code": account.get("plan_code"),
            "downloads_count": account.get("downloads_count"),
            "downloads_remaining": account.get("downloads_remaining"),
            "download_slots": account.get("download_slots"),
            "download_slots_initial": account.get("download_slots_initial"),
        }

    async def account_register_fingerprint(self, fingerprint: str) -> dict[str, Any]:
        """Register instance fingerprint for the account."""
        payload = {"fingerprint": fingerprint}
        _, data = await self._request_json("POST", API_ACCOUNT_FINGERPRINT_PATH, json_payload=payload)
        return data

    async def account_disconnect(self) -> dict[str, Any]:
        """Disconnect the current account from the instance."""
        _, data = await self._request_json("POST", API_ACCOUNT_DISCONNECT_PATH)
        return data

    async def info_get(self) -> dict[str, Any]:
        """Fetch public info about plans and limits."""
        _, data = await self._request_json("GET", API_INFO_PATH, require_auth=False)
        return data

    def _build_headers(
        self,
        *,
        accept_json: bool = True,
        include_fingerprint: bool = False,
        require_auth: bool = True,
    ) -> dict[str, str]:
        """Build request headers."""
        headers: dict[str, str] = {}
        headers["X-CardBuilder-Integration-Version"] = CARD_BUILDER_INTEGRATION_VERSION
        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        elif require_auth:
            raise CardBuilderAccountAuthError("Token is required")
        if accept_json:
            headers["Accept"] = "application/json"
        if include_fingerprint:
            if not require_auth:
                raise CardBuilderAccountAuthError("Fingerprint requires authentication")
            fingerprint = self._hass.data.get(DOMAIN, {}).get(DATA_KEY_INSTANCE_FINGERPRINT)
            if not fingerprint:
                raise CardBuilderAccountAuthError("Fingerprint not available")
            headers["X-Home-Assistant-Fingerprint"] = str(fingerprint)

        for extra_header_name, extra_header_value in API_EXTRA_HEADERS.items():
            if extra_header_name.lower() == "cookie":
                existing_cookie_key = next(
                    (key for key in headers if key.lower() == "cookie"),
                    None,
                )
                if existing_cookie_key:
                    headers[existing_cookie_key] = (
                        f"{headers[existing_cookie_key]}; {extra_header_value}"
                    )
                else:
                    headers["Cookie"] = extra_header_value
                continue

            has_existing_key = any(
                key.lower() == extra_header_name.lower() for key in headers
            )
            if has_existing_key:
                continue
            headers[extra_header_name] = extra_header_value

        return headers

    def _build_url(self, path: str) -> str:
        """Build a full API URL for a relative path."""
        return f"{self._base_url}/{path.lstrip('/')}"

    async def _request_json(
        self,
        method: str,
        path: str,
        *,
        json_payload: dict[str, Any] | None = None,
        query_params: dict[str, Any] | None = None,
        include_fingerprint: bool = False,
        require_auth: bool = True,
    ) -> tuple[int, dict[str, Any]]:
        """Perform a JSON API request."""
        url = self._build_url(path)
        headers = self._build_headers(
            include_fingerprint=include_fingerprint,
            require_auth=require_auth,
        )
        try:
            async with self._session.request(
                method,
                url,
                json=json_payload,
                params=query_params,
                headers=headers,
            ) as response:
                data = await self._read_response_json(response)
                await self._raise_for_status(response, data)
                return response.status, data or {}
        except (ClientError, asyncio.TimeoutError) as err:
            raise CardBuilderAccountCommunicationError("Unable to reach the API") from err

    async def _request_multipart(
        self,
        path: str,
        form: FormData,
        *,
        include_fingerprint: bool = False,
    ) -> tuple[int, dict[str, Any]]:
        """Perform a multipart API request."""
        url = self._build_url(path)
        headers = self._build_headers(include_fingerprint=include_fingerprint)
        try:
            async with self._session.post(
                url,
                data=form,
                headers=headers,
            ) as response:
                data = await self._read_response_json(response)
                await self._raise_for_status(response, data)
                return response.status, data or {}
        except (ClientError, asyncio.TimeoutError) as err:
            raise CardBuilderAccountCommunicationError("Unable to reach the API") from err

    async def _request_bytes(
        self,
        method: str,
        path: str,
        *,
        include_fingerprint: bool = False,
        require_auth: bool = True,
    ) -> tuple[int, bytes, str | None]:
        """Perform a binary API request."""
        url = self._build_url(path)
        headers = self._build_headers(
            accept_json=False,
            include_fingerprint=include_fingerprint,
            require_auth=require_auth,
        )
        try:
            async with self._session.request(method, url, headers=headers) as response:
                raw = await response.read()
                if response.status >= 400:
                    data = _try_decode_json_bytes(raw)
                    await self._raise_for_status(response, data)
                content_type = response.headers.get("Content-Type")
                return response.status, raw, content_type
        except (ClientError, asyncio.TimeoutError) as err:
            raise CardBuilderAccountCommunicationError("Unable to reach the API") from err

    async def _read_response_json(self, response: ClientResponse) -> dict[str, Any] | None:
        """Read JSON data from a response."""
        try:
            return await response.json()
        except (ContentTypeError, JSONDecodeError):
            text = await response.text()
            if not text:
                return None
            return {"detail": text}

    async def _raise_for_status(
        self, response: ClientResponse, data: dict[str, Any] | None
    ) -> None:
        """Raise an API error if the response status indicates failure."""
        if response.status < 400:
            return

        error_code = _extract_error_code(data)
        message = _extract_error_message(data) or response.reason

        if error_code == "integration_version_outdated":
            raise CardBuilderAccountIntegrationVersionOutdated(message, api_code=error_code)

        if response.status == 401:
            raise CardBuilderAccountAuthError(message, api_code=error_code)
        if response.status == 404:
            raise CardBuilderAccountNotFoundError(message, api_code=error_code)
        if response.status == 409:
            raise CardBuilderAccountConflictError(message, api_code=error_code)
        if response.status == 422:
            raise CardBuilderAccountValidationError(message, api_code=error_code)

        raise CardBuilderAccountApiError(message, api_code=error_code)


def _extract_error_message(data: dict[str, Any] | None) -> str | None:
    """Extract a human-readable error message from API payloads."""
    if not data:
        return None
    for key in ("detail", "message", "error"):
        value = data.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def _extract_error_code(data: dict[str, Any] | None) -> str | None:
    """Extract an error code from API payloads."""
    if not data:
        return None
    value = data.get("code")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _unwrap_data(data: dict[str, Any] | None) -> dict[str, Any]:
    if not data:
        return {}
    payload = data.get("data")
    if isinstance(payload, dict):
        return payload
    return data


def _try_decode_json_bytes(raw: bytes) -> dict[str, Any] | None:
    if not raw:
        return None
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        return None
    try:
        data = json.loads(text)
    except JSONDecodeError:
        return {"detail": text} if text.strip() else None
    if isinstance(data, dict):
        return data
    return None
