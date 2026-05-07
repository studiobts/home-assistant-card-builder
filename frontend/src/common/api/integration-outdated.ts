import { getRuntimeConfig, hasRuntimeToken } from '@/common/api/runtime-config';
import { compareVersions } from '@/common/core/version-utils';

const OUTDATED_COOKIE_NAME = 'cb_integration_outdated';
const OUTDATED_EVENT_NAME = 'card-builder-integration-outdated-change';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const prefix = `${name}=`;
    const entries = document.cookie ? document.cookie.split(';') : [];
    for (const entry of entries) {
        const trimmed = entry.trim();
        if (trimmed.startsWith(prefix)) {
            return decodeURIComponent(trimmed.slice(prefix.length));
        }
    }
    return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; samesite=lax`;
}

function clearCookie(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; max-age=0; path=/; samesite=lax`;
}

export function getOutdatedIntegrationVersion(): string | null {
    return readCookie(OUTDATED_COOKIE_NAME);
}

export function markIntegrationOutdated(version: string | null | undefined): void {
    if (!version) return;
    writeCookie(OUTDATED_COOKIE_NAME, version, COOKIE_MAX_AGE_SECONDS);
    notifyIntegrationOutdatedChange();
}

export function clearIntegrationOutdated(): void {
    clearCookie(OUTDATED_COOKIE_NAME);
    notifyIntegrationOutdatedChange();
}

export function resolveOutdatedIntegrationIfUpdated(
    currentVersion: string | null | undefined
): boolean {
    const storedVersion = getOutdatedIntegrationVersion();
    if (!storedVersion || !currentVersion) return false;
    if (compareVersions(currentVersion, storedVersion) > 0) {
        clearIntegrationOutdated();
        return true;
    }
    return false;
}

export function shouldShowIntegrationOutdatedNotice(): boolean {
    const storedVersion = getOutdatedIntegrationVersion();
    if (!storedVersion) return false;
    if (!hasRuntimeToken()) return false;
    return true;
}

export function handleIntegrationOutdatedError(err: unknown): void {
    if (!err || typeof err !== 'object') return;
    const maybe = err as { code?: string };
    if (maybe.code !== 'integration_version_outdated') return;
    const runtimeConfig = getRuntimeConfig();
    markIntegrationOutdated(runtimeConfig?.integrationVersion);
}

export function notifyIntegrationOutdatedChange(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(OUTDATED_EVENT_NAME));
}

export function subscribeIntegrationOutdatedChange(handler: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(OUTDATED_EVENT_NAME, handler);
    return () => window.removeEventListener(OUTDATED_EVENT_NAME, handler);
}
