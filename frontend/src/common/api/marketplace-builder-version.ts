import { getRuntimeConfig } from '@/common/api/runtime-config';
import { compareVersions } from '@/common/core/version-utils';

export function getMarketplaceBuilderVersionError(
    minBuilderVersion: string | null | undefined,
    action = 'downloading',
): string | null {
    const requiredVersion = typeof minBuilderVersion === 'string' ? minBuilderVersion.trim() : '';
    if (!requiredVersion) return null;

    const currentVersion = getRuntimeConfig()?.integrationVersion;
    if (currentVersion && compareVersions(currentVersion, requiredVersion) >= 0) {
        return null;
    }

    return `This card requires Card Builder ${requiredVersion} or newer. Update the Card Builder integration to the latest version before ${action} it.`;
}
