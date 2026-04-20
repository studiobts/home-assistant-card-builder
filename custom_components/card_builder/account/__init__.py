"""Account-related helpers for Card Builder."""

from . import websocket
from .api import CardBuilderAccountApiClient
from .const import (
    DATA_KEY_ACCOUNT_API_CLIENT,
    DATA_KEY_ACCOUNT_STORE
)
from .storage import AccountStore

from ..const import DOMAIN
from homeassistant.core import HomeAssistant

async def async_setup(hass: HomeAssistant) -> bool:
    """Set up Card Builder account."""
    # Initialize Account API client and store
    account_store = AccountStore(hass)
    account_data = await account_store.async_load() or {}
    account_api_client = CardBuilderAccountApiClient(hass, token=account_data.get("token"))
    hass.data[DOMAIN][DATA_KEY_ACCOUNT_STORE] = account_store
    hass.data[DOMAIN][DATA_KEY_ACCOUNT_API_CLIENT] = account_api_client

    websocket.async_setup(hass)

    return True