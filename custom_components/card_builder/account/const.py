import os

from ..const import (
    CARD_BUILDER_BASE_DOMAIN,
    CARD_BUILDER_BASE_SCHEMA,
    WS_BASE
)

DATA_KEY_ACCOUNT_API_CLIENT = "account_api_client"
DATA_KEY_ACCOUNT_STORE = "account_store"

API_BASE_URL = "{schema}://console.{domain}/api/v1".format(
    schema=CARD_BUILDER_BASE_SCHEMA,
    domain=CARD_BUILDER_BASE_DOMAIN
)

API_EXTRA_HEADERS: dict[str, str] = {}


def _normalize_headers(value: object) -> dict[str, str]:
    if not isinstance(value, dict):
        return {}
    headers: dict[str, str] = {}
    for raw_name, raw_header_value in value.items():
        name = str(raw_name).strip()
        header_value = str(raw_header_value).strip()
        if not name or not header_value:
            continue
        headers[name] = header_value
    return headers


_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), "env.py")
if os.path.exists(_env):
    from .. import env
    API_EXTRA_HEADERS = _normalize_headers(
        getattr(env, "CARD_BUILDER_API_EXTRA_HEADERS", API_EXTRA_HEADERS)
    )

API_INFO_PATH = "info"
API_ACCOUNT_PATH = "account"
API_ACCOUNT_FINGERPRINT_PATH = "account/fingerprint"
API_ACCOUNT_DISCONNECT_PATH = "account/disconnect"
API_MARKETPLACE_CARDS_SHARED_LIST_PATH = "marketplace/cards/shared"
API_MARKETPLACE_CARDS_SHARED_CREATE_PATH = "marketplace/cards/shared"
API_MARKETPLACE_CARDS_SHARED_UPDATE_PATH = "marketplace/cards/shared/{card_id}"
API_MARKETPLACE_CARDS_SHARED_VERSION_CREATE_PATH = "marketplace/cards/shared/{card_id}/versions"
API_MARKETPLACE_CARDS_SHARED_ASSET_UPLOAD_PATH = "marketplace/cards/shared/{card_id}/versions/{version}/assets"
API_MARKETPLACE_CARDS_SHARED_UPDATE_REASONS_PATH = "marketplace/cards/shared/update-reasons"
API_MARKETPLACE_CARDS_AVAILABLE_GET_PATH = "marketplace/cards/available/{marketplace_id}"
API_MARKETPLACE_CARDS_AVAILABLE_INFO_PATH = "marketplace/cards/available/{marketplace_id}/info"
API_MARKETPLACE_CARDS_AVAILABLE_FEATURED_PATH = "marketplace/cards/available/featured"
API_MARKETPLACE_CARDS_AVAILABLE_ASSET_PATH = "marketplace/cards/available/{marketplace_id}/versions/{version}/assets/{asset_id}"
API_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK_PATH = "marketplace/cards/available/versions-check"
API_MARKETPLACE_CARDS_AVAILABLE_CHANGELOG_PATH = "marketplace/cards/available/{marketplace_id}/changelog"
API_MARKETPLACE_CATEGORIES_PATH = "marketplace/categories"
API_MARKETPLACE_DISCLAIMER_SHARE_PATH = "marketplace/disclaimers/share"
API_MARKETPLACE_DISCLAIMER_DOWNLOAD_PATH = "marketplace/disclaimers/download"

WS_BASE_ACCOUNT = f"{WS_BASE}/account"
WS_INFO_GET = f"{WS_BASE_ACCOUNT}/info_get"
WS_TOKEN_SET = f"{WS_BASE_ACCOUNT}/token_set"
WS_ACCOUNT_GET = f"{WS_BASE_ACCOUNT}/account_get"
WS_ACCOUNT_FINGERPRINT = f"{WS_BASE_ACCOUNT}/account_fingerprint"
WS_ACCOUNT_DISCONNECT = f"{WS_BASE_ACCOUNT}/account_disconnect"
WS_MARKETPLACE_CARDS_SHARED_UPLOAD = f"{WS_BASE_ACCOUNT}/marketplace/cards/shared/upload"
WS_MARKETPLACE_CARDS_SHARED_UPDATE = f"{WS_BASE_ACCOUNT}/marketplace/cards/shared/update"
WS_MARKETPLACE_CARDS_SHARED_LIST = f"{WS_BASE_ACCOUNT}/marketplace/cards/shared/list"
WS_MARKETPLACE_CARDS_SHARED_LIST_ALL = f"{WS_BASE_ACCOUNT}/marketplace/cards/shared/list_all"
WS_MARKETPLACE_CARDS_SHARED_SYNC = f"{WS_BASE_ACCOUNT}/marketplace/cards/shared/sync"
WS_MARKETPLACE_CARDS_SHARED_UPDATE_REASONS = f"{WS_BASE_ACCOUNT}/marketplace/cards/shared/update_reasons"
WS_MARKETPLACE_CARDS_AVAILABLE_INFO = f"{WS_BASE_ACCOUNT}/marketplace/cards/available/info"
WS_MARKETPLACE_CARDS_AVAILABLE_FEATURED = f"{WS_BASE_ACCOUNT}/marketplace/cards/available/featured"
WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_PREPARE = f"{WS_BASE_ACCOUNT}/marketplace/cards/available/download_prepare"
WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_CONFIRM = f"{WS_BASE_ACCOUNT}/marketplace/cards/available/download_confirm"
WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_PREPARE = f"{WS_BASE_ACCOUNT}/marketplace/cards/available/update_prepare"
WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_CONFIRM = f"{WS_BASE_ACCOUNT}/marketplace/cards/available/update_confirm"
WS_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK = f"{WS_BASE_ACCOUNT}/marketplace/cards/available/versions_check"
WS_MARKETPLACE_CARDS_AVAILABLE_CHANGELOG = f"{WS_BASE_ACCOUNT}/marketplace/cards/available/changelog"
WS_MARKETPLACE_CATEGORIES = f"{WS_BASE_ACCOUNT}/marketplace/categories"
WS_MARKETPLACE_DISCLAIMER_SHARE = f"{WS_BASE_ACCOUNT}/marketplace/disclaimers/share"
WS_MARKETPLACE_DISCLAIMER_DOWNLOAD = f"{WS_BASE_ACCOUNT}/marketplace/disclaimers/download"

API_ASSET_TYPE_VALUES = ["in-card-image", "preview-image"]

STORAGE_KEY = "card_builder.account"
STORAGE_VERSION = 1
