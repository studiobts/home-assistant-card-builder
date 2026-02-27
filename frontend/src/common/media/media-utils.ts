import type { HomeAssistant } from 'custom-card-helpers';

export const CARD_BUILDER_MEDIA_PREFIX = 'cb-media://';
export const CARD_BUILDER_LOCAL_ROOT = `${CARD_BUILDER_MEDIA_PREFIX}local/card_builder`;
export const CARD_BUILDER_PUBLIC_BASE = '/local/card_builder';

export function isCardBuilderMediaReference(reference: string): boolean {
    return reference === CARD_BUILDER_LOCAL_ROOT || reference.startsWith(`${CARD_BUILDER_LOCAL_ROOT}/`);
}

export function isManagedMediaReference(reference: string): boolean {
    return isCardBuilderMediaReference(reference);
}

export function isExternalUrl(reference: string): boolean {
    return /^https?:\/\//i.test(reference) || reference.startsWith('data:') || reference.startsWith('blob:');
}

export function normalizeMediaPath(path: string): string {
    return path.replace(/^\/+/, '').replace(/\/+$/g, '').replace(/\/+/g, '/');
}

function stripDotSegments(path: string): string {
    return path.replace(/(^|\/)\.\//g, '$1');
}

export function buildCardBuilderMediaReference(relativePath?: string): string {
    const cleanRelative = relativePath ? normalizeMediaPath(relativePath) : '';
    if (!cleanRelative) return CARD_BUILDER_LOCAL_ROOT;
    return `${CARD_BUILDER_LOCAL_ROOT}/${cleanRelative}`;
}

export function getCardBuilderRelativePath(reference: string): string {
    if (reference === CARD_BUILDER_LOCAL_ROOT) return '';
    if (!reference.startsWith(`${CARD_BUILDER_LOCAL_ROOT}/`)) return '';
    return reference.slice(CARD_BUILDER_LOCAL_ROOT.length + 1);
}

export function getMediaReferenceName(reference: string): string {
    if (!reference) return '';

    if (isCardBuilderMediaReference(reference)) {
        const relative = getCardBuilderRelativePath(reference);
        if (!relative) return 'card_builder';
        const parts = relative.split('/');
        return parts[parts.length - 1] || relative;
    }

    if (isExternalUrl(reference)) {
        try {
            const url = new URL(reference, window.location.origin);
            const pathname = url.pathname.replace(/\/+$/g, '');
            const segments = pathname.split('/');
            return segments[segments.length - 1] || reference;
        } catch (_err) {
            return reference;
        }
    }

    const normalized = normalizeMediaPath(reference);
    const segments = normalized.split('/');
    return segments[segments.length - 1] || normalized;
}

export function mediaContentIdToPublicUrl(reference: string): string | null {
    if (isCardBuilderMediaReference(reference)) {
        const relative = stripDotSegments(normalizeMediaPath(getCardBuilderRelativePath(reference)));
        if (!relative) return CARD_BUILDER_PUBLIC_BASE;
        return `${CARD_BUILDER_PUBLIC_BASE}/${relative}`;
    }

    return null;
}

export async function resolveMediaUrl(
    _hass: HomeAssistant | undefined,
    reference: string
): Promise<string | null> {
    if (!reference) return null;
    if (isExternalUrl(reference)) return reference;

    if (isCardBuilderMediaReference(reference)) {
        return mediaContentIdToPublicUrl(reference);
    }

    return reference;
}
