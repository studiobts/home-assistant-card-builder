"""Constants for Card Builder integration."""

DOMAIN = "card_builder"

PANEL_URL = "/card-builder"
PANEL_TITLE = "Card Builder"
PANEL_ICON = "mdi:card-plus-outline"
PANEL_NAME = "card-builder-panel"

PANEL_SCRIPT_URL = "/card_builder/card-builder-panel.js"
CARD_RENDERER_SCRIPT_URL = "/card_builder/card-builder-renderer-card.js"

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
MEDIA_DATA_KEY = "media_dir"

MEDIA_WS_LIST = "card_builder/media/list"
MEDIA_WS_UPLOAD = "card_builder/media/upload"
MEDIA_WS_DELETE = "card_builder/media/delete"
