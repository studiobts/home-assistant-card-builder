"""Storage for Card Builder integration."""
from __future__ import annotations

from datetime import datetime
from typing import Any
import uuid

from homeassistant.core import HomeAssistant
from homeassistant.helpers.collection import DictStorageCollection
from homeassistant.helpers.storage import Store

from .const import (
    CSS_CUSTOM_PROPERTIES_STORAGE_KEY,
    CSS_PROPERTIES_STORAGE_VERSION,
    CARDS_KEYSTORAGE_KEY,
    CARDS_STORAGE_VERSION,
    STYLE_PRESETS_STORAGE_KEY,
    STYLE_PRESETS_STORAGE_VERSION
)


class CardStore(Store[dict[str, list[dict[str, Any]]]]):
    """Store for Card Builder cards."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the card store."""
        super().__init__(
            hass,
            CARDS_STORAGE_VERSION,
            CARDS_KEYSTORAGE_KEY,
        )


class CardStorageCollection(DictStorageCollection):
    """Collection of Card Builder cards stored in storage."""

    def __init__(self, store: CardStore) -> None:
        """Initialize the card collection."""
        super().__init__(store)

    async def _process_create_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Process data for creating a new card."""
        now = datetime.utcnow().isoformat() + "Z"
        return {
            "name": data["name"],
            "description": data.get("description", ""),
            "config": data["config"],
            "created_at": now,
            "updated_at": now,
        }

    def _get_suggested_id(self, info: dict[str, Any]) -> str:
        """Generate a unique ID for a new card."""
        return str(uuid.uuid4())

    async def _update_data(
        self, item: dict[str, Any], update_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update an existing card."""
        now = datetime.utcnow().isoformat() + "Z"
        return {
            **item,
            **update_data,
            "updated_at": now,
        }


class StylePresetStore(Store[dict[str, list[dict[str, Any]]]]):
    """Store for Card Builder style presets."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the preset store."""
        super().__init__(
            hass,
            STYLE_PRESETS_STORAGE_VERSION,
            STYLE_PRESETS_STORAGE_KEY,
        )


class StylePresetStorageCollection(DictStorageCollection):
    """Collection of style presets stored in storage."""

    def __init__(self, store: StylePresetStore) -> None:
        """Initialize the preset collection."""
        super().__init__(store)

    async def _process_create_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Process data for creating a new preset.

        Validates and normalizes the preset data structure.
        """
        now = datetime.utcnow().isoformat() + "Z"

        # Ensure data has the container structure
        preset_data = data.get("data", {})
        if "containers" not in preset_data:
            preset_data = {"containers": preset_data}

        return {
            "name": data["name"],
            "description": data.get("description", ""),
            "extends_preset_id": data.get("extends_preset_id"),
            "data": preset_data,
            "created_at": now,
            "updated_at": now,
        }

    def _get_suggested_id(self, info: dict[str, Any]) -> str:
        """Generate a unique ID for a new preset."""
        return str(uuid.uuid4())

    async def _update_data(
        self, item: dict[str, Any], update_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update an existing preset."""
        now = datetime.utcnow().isoformat() + "Z"

        # Ensure data has the containers structure if provided
        if "data" in update_data:
            preset_data = update_data["data"]
            if "containers" not in preset_data:
                update_data["data"] = {"containers": preset_data}

        return {
            **item,
            **{k: v for k, v in update_data.items() if v is not None},
            "updated_at": now,
        }

    def get_presets_using(self, preset_id: str) -> list[dict[str, Any]]:
        """Get all presets that extend a specific preset.

        Useful for checking dependencies before deletion.
        """
        return [
            preset
            for preset in self.data.values()
            if preset.get("extends_preset_id") == preset_id
        ]


class CSSCustomPropertyStore(Store[dict[str, list[dict[str, Any]]]]):
    """Store for CSS custom properties."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the custom property store."""
        super().__init__(
            hass,
            CSS_PROPERTIES_STORAGE_VERSION,
            CSS_CUSTOM_PROPERTIES_STORAGE_KEY,
        )


class CSSCustomPropertyStorageCollection(DictStorageCollection):
    """Collection of CSS custom properties stored in storage."""

    def __init__(self, store: CSSCustomPropertyStore) -> None:
        """Initialize the custom property collection."""
        super().__init__(store)

    async def _process_create_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Process data for creating a new custom property."""
        now = datetime.utcnow().isoformat() + "Z"

        name = str(data["name"]).strip()
        if not name.startswith("--"):
            raise ValueError("Name must start with --.")

        syntax = str(data["syntax"]).strip()
        if not syntax:
            raise ValueError("Syntax is required.")

        initial_value = str(data.get("initial_value", "")).strip()
        if not initial_value:
            raise ValueError("Initial value is required.")

        if any(item.get("name") == name for item in self.data.values()):
            raise ValueError("Property already exists.")

        return {
            "name": name,
            "syntax": syntax,
            "inherits": bool(data.get("inherits", False)),
            "initial_value": initial_value,
            "created_at": now,
            "updated_at": now,
        }

    def _get_suggested_id(self, info: dict[str, Any]) -> str:
        """Generate a unique ID for a new custom property."""
        return str(uuid.uuid4())

    async def _update_data(
        self, item: dict[str, Any], update_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Reject updates to custom properties."""
        if update_data:
            raise ValueError("CSS custom properties cannot be updated once registered.")

        return item
