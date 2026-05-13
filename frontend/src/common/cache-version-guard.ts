import type { HomeAssistant } from 'custom-card-helpers';
import { CARD_BUILDER_VERSION } from '@/common/version';
import type { CardBuilderRuntimeConfig } from '@/common/api/runtime-config';

const PANEL_KEY = 'card-builder';
export const CARD_BUILDER_FRONTEND_VERSION_RECHECK_EVENT = 'card-builder-frontend-version-recheck';

interface CardBuilderWindowState {
    isFrontendVersionValid?: boolean;
    cachedJsVersion?: string;
    cachedRuntimeVersion?: string;
    backendWasDisconnected?: boolean;
    observedConnection?: HomeAssistant['connection'];
    removeConnectionListeners?: () => void;
}

interface PanelRuntimeConfig {
    base_domain: string;
    base_schema: string;
    integration_version: string;
}

export type RuntimeVersionCheckResult =
    | {
        ok: true;
        jsVersion: string;
        runtimeVersion: string;
    }
    | {
        ok: false;
        reason: 'mismatch';
        jsVersion: string;
        runtimeVersion: string;
    };

export interface RuntimeVersionBlockedCopy {
    title: string;
    message: string;
    jsVersion: string;
    runtimeVersion: string;
}

declare global {
    interface Window {
        cardbuilder?: CardBuilderWindowState;
    }

    interface WindowEventMap {
        'card-builder-frontend-version-recheck': CustomEvent<void>;
    }
}

function normalizeVersion(version: string | null | undefined): string {
    return typeof version === 'string' ? version.trim() : '';
}

function getCardBuilderWindowState(): CardBuilderWindowState {
    window.cardbuilder = window.cardbuilder || {};
    return window.cardbuilder;
}

function getPanelConfig(hass: HomeAssistant): PanelRuntimeConfig {
    return hass.panels[PANEL_KEY].config as PanelRuntimeConfig;
}

function clearVersionCheckCache(state: CardBuilderWindowState): void {
    delete state.isFrontendVersionValid;
    delete state.cachedJsVersion;
    delete state.cachedRuntimeVersion;
}

function dispatchVersionRecheck(): void {
    window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent(CARD_BUILDER_FRONTEND_VERSION_RECHECK_EVENT));
    }, 0);
}

function observeBackendConnection(hass: HomeAssistant): CardBuilderWindowState {
    const state = getCardBuilderWindowState();
    if (state.observedConnection !== hass.connection) {
        state.removeConnectionListeners?.();

        const connection = hass.connection;
        const handleDisconnected = () => {
            state.backendWasDisconnected = true;
        };
        const handleReady = () => {
            if (!state.backendWasDisconnected) {
                return;
            }

            state.backendWasDisconnected = false;
            clearVersionCheckCache(state);
            dispatchVersionRecheck();
        };

        connection.addEventListener('disconnected', handleDisconnected);
        connection.addEventListener('ready', handleReady);
        state.observedConnection = connection;
        state.removeConnectionListeners = () => {
            connection.removeEventListener('disconnected', handleDisconnected);
            connection.removeEventListener('ready', handleReady);
        };
    }

    if (!hass.connected) {
        state.backendWasDisconnected = true;
    } else if (state.backendWasDisconnected) {
        state.backendWasDisconnected = false;
        clearVersionCheckCache(state);
        dispatchVersionRecheck();
    }

    return state;
}

export function getCardBuilderPanelRuntimeConfig(hass: HomeAssistant): CardBuilderRuntimeConfig {
    const config = getPanelConfig(hass);
    return {
        baseDomain: config.base_domain,
        baseSchema: config.base_schema,
        integrationVersion: config.integration_version,
    };
}

export function isCardBuilderFrontendVersionValid(hass: HomeAssistant): boolean {
    const state = observeBackendConnection(hass);
    const runtimeVersion = normalizeVersion(getPanelConfig(hass).integration_version);
    const jsVersion = normalizeVersion(CARD_BUILDER_VERSION);

    if (
        typeof state.isFrontendVersionValid === 'boolean'
        && state.cachedRuntimeVersion === runtimeVersion
        && state.cachedJsVersion === jsVersion
    ) {
        return state.isFrontendVersionValid;
    }

    const isValid = runtimeVersion === jsVersion;
    state.isFrontendVersionValid = isValid;
    state.cachedRuntimeVersion = runtimeVersion;
    state.cachedJsVersion = jsVersion;
    return isValid;
}

export function getCardBuilderFrontendVersionCheck(
    hass: HomeAssistant
): RuntimeVersionCheckResult {
    const runtimeVersion = normalizeVersion(getPanelConfig(hass).integration_version);
    const jsVersion = normalizeVersion(CARD_BUILDER_VERSION);

    if (isCardBuilderFrontendVersionValid(hass)) {
        return {
            ok: true,
            jsVersion,
            runtimeVersion,
        };
    }

    return {
        ok: false,
        reason: 'mismatch',
        jsVersion,
        runtimeVersion,
    };
}

function versionText(version: string | undefined): string {
    return version && version.trim() ? version : 'unknown';
}

export function getCardBuilderVersionBlockedCopy(
    result: RuntimeVersionCheckResult
): RuntimeVersionBlockedCopy {
    return {
        title: 'Card Builder cache refresh required',
        message: 'Home Assistant is running a different Card Builder version than the JavaScript cached on this device. Clear the browser or app cache, then reload Home Assistant.',
        jsVersion: versionText(result.jsVersion),
        runtimeVersion: versionText(result.runtimeVersion),
    };
}
