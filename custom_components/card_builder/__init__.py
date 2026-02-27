"""Card Builder integration for Home Assistant."""
from __future__ import annotations

import hashlib
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
    MEDIA_DATA_KEY,
    MEDIA_DIR_NAME,
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


def _ensure_media_dir_sync(path: Path) -> None:
    """Ensure the media directory exists."""
    path.mkdir(parents=True, exist_ok=True)


def _compute_fast_hash_sync(path: Path) -> str | None:
    """Return a short hex digest for cache busting."""
    try:
        hasher = hashlib.blake2s(digest_size=8)
        with path.open("rb") as file_handle:
            for chunk in iter(lambda: file_handle.read(8192), b""):
                hasher.update(chunk)
        return hasher.hexdigest()
    except OSError:
        _LOGGER.warning("Unable to read frontend file for cache busting: %s", path)
        return None


async def _compute_fast_hash(hass: HomeAssistant, path: Path) -> str | None:
    """Compute the hash in the executor to avoid blocking the event loop."""
    return await hass.async_add_executor_job(_compute_fast_hash_sync, path)


async def _with_cache_bust(
    hass: HomeAssistant, url_path: str, base_dir: Path
) -> str:
    """Append a short hash query param to a frontend asset URL."""
    file_path = base_dir / Path(url_path).name
    digest = await _compute_fast_hash(hass, file_path)
    if not digest:
        return url_path
    return f"{url_path}?v={digest[:6]}"


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

    # Ensure media folder exists under www/card_builder
    media_dir = Path(hass.config.path("www", MEDIA_DIR_NAME))
    await hass.async_add_executor_job(_ensure_media_dir_sync, media_dir)
    hass.data[DOMAIN][MEDIA_DATA_KEY] = media_dir

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
    card_renderer_url = await _with_cache_bust(hass, CARD_RENDERER_SCRIPT_URL, frontend_path)
    frontend.add_extra_js_url(hass, card_renderer_url)

    # Register the custom panel
    panel_module_url = await _with_cache_bust(hass, PANEL_SCRIPT_URL, frontend_path)
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_NAME,
        frontend_url_path=PANEL_URL.lstrip("/"),
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=panel_module_url,
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
