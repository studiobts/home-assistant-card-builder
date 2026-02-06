"""Card Builder integration for Home Assistant."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .const import (
    CARD_RENDERER_SCRIPT_URL,
    DOMAIN,
    PANEL_SCRIPT_URL,
    PANEL_ICON,
    PANEL_NAME,
    PANEL_TITLE,
    PANEL_URL,
)
from .storage import (
    CSSCustomPropertyStore,
    CSSCustomPropertyStorageCollection,
    CardStore,
    CardStorageCollection,
    StylePresetStore,
    StylePresetStorageCollection
)
from . import websocket

_LOGGER = logging.getLogger(__name__)

# Keys for storing collections in hass.data
DATA_CARDS = "cards"
DATA_PRESETS = "presets"
DATA_CUSTOM_PROPERTIES = "custom_properties"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Card Builder integration."""

    # If domain is in config, trigger import flow
    if DOMAIN in config:
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN,
                context={"source": "import"},
                data={},
            )
        )

    return True


async def async_setup_entry(hass: HomeAssistant, entry) -> bool:
    """Set up Card Builder from a config entry."""

    # Initialize hass.data structure
    hass.data.setdefault(DOMAIN, {})

    # Initialize card storage collection
    card_store = CardStore(hass)
    card_collection = CardStorageCollection(card_store)
    await card_collection.async_load()
    hass.data[DOMAIN][DATA_CARDS] = card_collection

    # Initialize preset storage collection
    style_preset_store = StylePresetStore(hass)
    style_preset_collection = StylePresetStorageCollection(style_preset_store)
    await style_preset_collection.async_load()
    hass.data[DOMAIN][DATA_PRESETS] = style_preset_collection

    # Initialize custom property storage collection
    custom_property_store = CSSCustomPropertyStore(hass)
    custom_property_collection = CSSCustomPropertyStorageCollection(custom_property_store)
    await custom_property_collection.async_load()
    hass.data[DOMAIN][DATA_CUSTOM_PROPERTIES] = custom_property_collection

    # Set up WebSocket APIs
    websocket.async_setup(
        hass,
        card_collection,
        style_preset_collection,
        custom_property_collection,
    )

    # Get the path to the frontend files
    frontend_path = Path(__file__).parent / "frontend" / "dist"

    if not frontend_path.exists():
        _LOGGER.error("Frontend files not found at %s", frontend_path)
        return False

    # Register static path for frontend files
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            url_path="/card_builder",
            path=str(frontend_path),
            cache_headers=False,
        )
    ])

    # Register the custom card
    frontend.add_extra_js_url(hass, CARD_RENDERER_SCRIPT_URL)

    # Register the custom panel
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_NAME,
        frontend_url_path=PANEL_URL.lstrip("/"),
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=PANEL_SCRIPT_URL,
        embed_iframe=False,
        require_admin=True,
        config={},
    )

    _LOGGER.info("Card Builder panel registered successfully")

    return True


async def async_unload_entry(hass: HomeAssistant, entry) -> bool:
    """Unload a config entry."""
    # Clean up data
    if DOMAIN in hass.data:
        hass.data.pop(DOMAIN)

    return True
