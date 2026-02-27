import { migrateToV2 } from '@/common/core/model/migration/migrate-to-v2';
import { migrateToV3 } from '@/common/core/model/migration/migrate-to-v3';
import {
    DOCUMENT_MODEL_VERSION,
    type DocumentData,
} from "@/common/core/model/types";

export function needsDocumentMigration(config: DocumentData | Record<string, unknown>): boolean {
    const version = typeof (config as {version?: unknown}).version === 'number'
        ? (config as {version: number}).version
        : 1;
    return version < DOCUMENT_MODEL_VERSION;
}

export function migrateDocumentData(config: DocumentData | Record<string, unknown>): {
    config: DocumentData;
    fromVersion: number;
    toVersion: number;
    migrated: boolean;
} {
    const fromVersion = config.version as number;
    const needsMigration = fromVersion < DOCUMENT_MODEL_VERSION;

    let nextConfig = {...config};

    if (fromVersion < 2) {
        nextConfig = migrateToV2(nextConfig);
    }
    if (fromVersion < 3) {
        nextConfig = migrateToV3(nextConfig);
    }

    nextConfig = {
        ...nextConfig,
        version: DOCUMENT_MODEL_VERSION,
    } as DocumentData;

    return {
        config: nextConfig,
        fromVersion,
        toVersion: DOCUMENT_MODEL_VERSION,
        migrated: needsMigration,
    };
}
