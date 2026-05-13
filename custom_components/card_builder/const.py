"""Constants for Card Builder integration."""

import json
import os
from pathlib import Path

DOMAIN = "card_builder"
WS_BASE = DOMAIN

CARD_BUILDER_BASE_DOMAIN = "cardbuilder.pro"
CARD_BUILDER_BASE_SCHEMA = "https"

_env = os.path.join(os.path.dirname(__file__), "env.py")
if os.path.exists(_env):
    from . import env
    CARD_BUILDER_BASE_DOMAIN = getattr(env, "CARD_BUILDER_BASE_DOMAIN", CARD_BUILDER_BASE_DOMAIN)
    CARD_BUILDER_BASE_SCHEMA = getattr(env, "CARD_BUILDER_BASE_SCHEMA", CARD_BUILDER_BASE_SCHEMA)


def _load_integration_version() -> str:
    manifest_path = Path(__file__).resolve().parent / "manifest.json"
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return "0.0.0"
    version = data.get("version")
    if isinstance(version, str) and version.strip():
        return version.strip()
    return "0.0.0"


CARD_BUILDER_INTEGRATION_VERSION = _load_integration_version()

PANEL_URL = "/card-builder"
PANEL_TITLE = "Card Builder"
PANEL_ICON = "mdi:card-plus-outline"
PANEL_NAME = "card-builder-panel"

PANEL_SCRIPT_URL = "/card_builder/card-builder-panel.js"
CARD_RENDERER_SCRIPT_URL = "/card_builder/card-builder-renderer-card.js"

# Runtime data keys
DATA_KEY_CARDS = "cards"
DATA_KEY_MEDIA = "media_dir"
DATA_KEY_INSTANCE_FINGERPRINT = "instance_fingerprint"

# Storage - Cards
CARDS_KEYSTORAGE_KEY = "card_builder.cards"
CARDS_STORAGE_VERSION = 1

# Storage - Style Presets
STYLE_PRESETS_STORAGE_KEY = "card_builder.style_presets"
STYLE_PRESETS_STORAGE_VERSION = 1

# Storage - CSS Custom Properties
CSS_CUSTOM_PROPERTIES_STORAGE_KEY = "card_builder.css_custom_properties"
CSS_PROPERTIES_STORAGE_VERSION = 1

# Media manager (www/card_builder)
MEDIA_DIR_NAME = "card_builder"
MEDIA_REFERENCE_PREFIX = "cb-media://"
MEDIA_REFERENCE_LOCAL_ROOT = f"{MEDIA_REFERENCE_PREFIX}local/{MEDIA_DIR_NAME}"

MEDIA_WS_BASE = f"{WS_BASE}/media"
MEDIA_WS_LIST = f"{MEDIA_WS_BASE}/list"
MEDIA_WS_UPLOAD = f"{MEDIA_WS_BASE}/upload"
MEDIA_WS_DELETE = f"{MEDIA_WS_BASE}/delete"
