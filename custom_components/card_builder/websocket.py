"""WebSocket API for Card Builder integration."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.collection import DictStorageCollectionWebsocket

from .storage import (
    CSSCustomPropertyStorageCollection,
    CardStorageCollection,
    StylePresetStorageCollection,
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
