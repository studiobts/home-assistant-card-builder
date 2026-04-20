import { createContext } from '@lit/context';
import type { HomeAssistant } from 'custom-card-helpers';
import JSZip from 'jszip';

import {
    type CardData,
    getCardsService,
    MediaService,
    getStylePresentsService,
} from '@/common/api';
import type { DocumentData } from '@/common/core/model/types';
import type { StylePreset } from '@/common/types/style-preset';
import {
    buildCardBuilderMediaReference,
    getCardBuilderRelativePath,
    isCardBuilderMediaReference,
    mediaContentIdToPublicUrl,
} from '@/common/media';

const EXPORT_BUNDLE_VERSION = 1;
const EXPORT_CARD_FILENAME = 'card.json';
const EXPORT_EXTRAS_FILENAME = 'extras.json';
const EXPORT_MEDIA_FOLDER = 'media';

export interface ExportMediaItem {
    reference: string;
    relativePath: string;
    fileName: string;
    zipPath: string;
}

export interface CardsExportExtras {
    version: number;
    meta: {
        exportedAt: string;
        cardId: string;
        cardName: string;
    };
    presets?: {
        items: StylePreset[];
    };
    media?: {
        items: ExportMediaItem[];
    };
}

export type PresetConflictStrategy = 'create-new' | 'use-existing' | 'overwrite';
export type MediaConflictStrategy = 'rename' | 'overwrite' | 'skip';

export interface PresetConflict {
    preset: StylePreset;
    existing: StylePreset;
}

export interface MediaConflict {
    item: ExportMediaItem;
    existingName: string;
}

export interface ImportBundleInfo {
    card: Partial<CardData> & {config: DocumentData};
    extras?: CardsExportExtras;
    mediaItems: ExportMediaItem[];
    hasExtras: boolean;
    hasMedia: boolean;
    presetConflicts: PresetConflict[];
    mediaConflicts: MediaConflict[];
    zip: JSZip;
}

export interface ImportOptions {
    name: string;
    description: string;
    importExtras: boolean;
    importMedia: boolean;
    presetConflictStrategy: PresetConflictStrategy;
    mediaConflictStrategy: MediaConflictStrategy;
}

export class CardsManager {
    private cardsService?: ReturnType<typeof getCardsService>;
    private hass?: HomeAssistant;
    private mediaService?: MediaService;
    private presetService?: Awaited<ReturnType<typeof getStylePresentsService>>;

    setHass(hass: HomeAssistant): void {
        this.hass = hass;
        this.cardsService = getCardsService(hass);
        this.mediaService = new MediaService(hass);
    }

    getDefaultDuplicateName(cardName: string): string {
        return `${cardName} (Copy)`;
    }

    getDefaultExportFileName(cardName: string): string {
        return this._slugifyFileName(cardName);
    }

    async duplicateCard(card: CardData, newName: string): Promise<CardData> {
        const service = this._requireService();
        const name = newName.trim();
        if (!name) {
            throw new Error('Card name is required');
        }

        const parentId = card.marketplace_id ?? undefined;
        const parentVersion = typeof card.marketplace_download_version === 'number'
            ? card.marketplace_download_version
            : undefined;

        return service.createCard({
            name,
            description: card.description,
            config: this._cloneConfig(card.config),
            source: 'marketplace',
            author: card.author,
            marketplace_origin: undefined,
            marketplace_download: false,
            marketplace_download_version: undefined,
            marketplace_parent_id: parentId,
            marketplace_parent_version: parentVersion,
            marketplace_id: undefined,
            version: undefined,
            group_id: card.group_id ?? undefined,
            license_id: card.license_id ?? undefined,
            tags: card.tags ? [...card.tags] : undefined,
            categories: card.categories ? [...card.categories] : undefined,
            min_ha_version: card.min_ha_version ?? undefined,
            max_ha_version: card.max_ha_version ?? undefined,
            min_builder_version: card.min_builder_version ?? undefined,
            checksum: undefined,
            last_synced_at: undefined,
            tier: card.tier ?? undefined,
        });
    }

    async exportCardBundle(card: CardData, fileName: string): Promise<void> {
        if (card.source === 'marketplace') {
            throw new Error('Marketplace cards cannot be exported');
        }
        const zip = new JSZip();
        const payload = this._buildExportPayload(card);
        const cardJson = JSON.stringify(payload, null, 2);
        zip.file(EXPORT_CARD_FILENAME, cardJson);

        const mediaRefs = this._collectMediaReferences(card.config);
        const presetIds = this._collectPresetIds(card.config);

        const [mediaItems, presets] = await Promise.all([
            this._buildMediaItems(mediaRefs),
            this._collectPresetsForExport(presetIds),
        ]);

        const extras = presets.length > 0 ? this._buildExtras(card, mediaItems, presets) : null;
        if (extras) {
            zip.file(EXPORT_EXTRAS_FILENAME, JSON.stringify(extras, null, 2));
        }

        if (mediaItems.length > 0) {
            await this._addMediaFilesToZip(zip, mediaItems);
        }

        const filename = this._normalizeExportFileName(fileName, card.name);
        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {level: 6},
        });

        this._downloadBlobFile(filename, blob);
    }

    async readImportBundle(file: File): Promise<ImportBundleInfo> {
        if (!file.name.toLowerCase().endsWith('.zip')) {
            throw new Error('Please select a ZIP bundle');
        }

        const zip = await JSZip.loadAsync(file);
        const cardEntry = zip.file(EXPORT_CARD_FILENAME);
        if (!cardEntry) {
            throw new Error('Invalid bundle: missing card.json');
        }

        const cardText = await cardEntry.async('string');
        const card = this._parseCardPayload(cardText);
        if (card.source === 'marketplace' || (typeof card.marketplace_id === 'string' && card.marketplace_id.trim())) {
            throw new Error('Marketplace cards cannot be imported');
        }

        const extrasEntry = zip.file(EXPORT_EXTRAS_FILENAME);
        const extras = extrasEntry ? this._parseExtras(await extrasEntry.async('string')) : undefined;
        const mediaItems = this._extractMediaItems(zip, extras);

        const presetConflicts = extras?.presets?.items?.length
            ? await this._detectPresetConflicts(extras.presets.items)
            : [];
        const mediaConflicts = mediaItems.length > 0
            ? await this._detectMediaConflicts(mediaItems)
            : [];

        return {
            card,
            extras: extras ?? undefined,
            mediaItems,
            hasExtras: Boolean(extras?.presets?.items?.length),
            hasMedia: mediaItems.length > 0,
            presetConflicts,
            mediaConflicts,
            zip,
        };
    }

    async importBundle(bundle: ImportBundleInfo, options: ImportOptions): Promise<CardData> {
        if (
            bundle.card.source === 'marketplace'
            || (typeof bundle.card.marketplace_id === 'string' && bundle.card.marketplace_id.trim())
        ) {
            throw new Error('Marketplace cards cannot be imported');
        }
        const config = this._cloneConfig(bundle.card.config);
        let presetMapping = new Map<string, string>();
        let mediaMapping = new Map<string, string>();

        if (options.importExtras && bundle.extras?.presets?.items?.length) {
            presetMapping = await this._importPresets(bundle.extras.presets.items, options.presetConflictStrategy);
        }

        if (options.importMedia && bundle.mediaItems.length > 0) {
            mediaMapping = await this._importMedia(bundle, options.mediaConflictStrategy);
        }

        const configWithPresets = presetMapping.size > 0
            ? this._applyPresetMapping(config, presetMapping)
            : config;
        const finalConfig = mediaMapping.size > 0
            ? this._applyMediaMapping(configWithPresets, mediaMapping)
            : configWithPresets;

        return this._createCardFromBundle(bundle.card, options.name, options.description, finalConfig);
    }

    private _requireService(): ReturnType<typeof getCardsService> {
        if (!this.cardsService) {
            throw new Error('Cards service not available');
        }
        return this.cardsService;
    }

    private _requireHass(): HomeAssistant {
        if (!this.hass) {
            throw new Error('Home Assistant not available');
        }
        return this.hass;
    }

    private async _requirePresetService(): Promise<Awaited<ReturnType<typeof getStylePresentsService>>> {
        if (!this.presetService) {
            this.presetService = await getStylePresentsService(this._requireHass());
        }
        return this.presetService;
    }

    private _requireMediaService(): MediaService {
        if (!this.mediaService) {
            this.mediaService = new MediaService(this._requireHass());
        }
        return this.mediaService;
    }

    private _cloneConfig<T>(config: T): T {
        return JSON.parse(JSON.stringify(config));
    }

    private _slugifyFileName(name: string): string {
        const trimmed = name.trim();
        if (!trimmed) return 'card';
        const normalized = trimmed
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        return normalized || 'card';
    }

    private _normalizeExportFileName(input: string, fallbackName: string): string {
        const trimmed = input.trim();
        if (!trimmed) {
            return `${this._slugifyFileName(fallbackName)}.zip`;
        }

        let base = trimmed;
        if (base.toLowerCase().endsWith('.zip')) {
            base = base.slice(0, -4).trim();
        }

        const safe = this._slugifyFileName(base);
        return `${safe}.zip`;
    }

    private _buildExportPayload(card: CardData): CardData {
        return {
            id: card.id,
            name: card.name,
            description: card.description,
            config: card.config,
            source: card.source,
            author: card.source === 'local' ? '' : (card.author ?? ''),
            marketplace_origin: card.marketplace_origin ?? null,
            version: card.version,
            marketplace_id: card.marketplace_id ?? null,
            group_id: card.group_id ?? null,
            license_id: card.license_id ?? null,
            tags: card.tags ?? [],
            categories: card.categories ?? [],
            min_ha_version: card.min_ha_version ?? null,
            max_ha_version: card.max_ha_version ?? null,
            min_builder_version: card.min_builder_version ?? null,
            checksum: card.checksum ?? null,
            last_synced_at: card.last_synced_at ?? null,
            tier: card.tier ?? 'base',
            created_at: card.created_at,
            updated_at: card.updated_at,
        };
    }

    private _buildExtras(card: CardData, mediaItems: ExportMediaItem[], presets: StylePreset[]): CardsExportExtras {
        const extras: CardsExportExtras = {
            version: EXPORT_BUNDLE_VERSION,
            meta: {
                exportedAt: new Date().toISOString(),
                cardId: card.id,
                cardName: card.name,
            },
        };

        if (presets.length > 0) {
            extras.presets = {items: presets};
        }

        if (mediaItems.length > 0) {
            extras.media = {items: mediaItems};
        }

        return extras;
    }

    private _downloadBlobFile(filename: string, blob: Blob): void {
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.rel = 'noopener';
        anchor.click();

        URL.revokeObjectURL(url);
    }

    private _collectMediaReferences(config: DocumentData): string[] {
        const refs = new Set<string>();
        const walk = (value: unknown): void => {
            if (typeof value === 'string') {
                if (isCardBuilderMediaReference(value)) {
                    refs.add(value);
                }
                return;
            }
            if (Array.isArray(value)) {
                value.forEach(walk);
                return;
            }
            if (value && typeof value === 'object') {
                Object.values(value as Record<string, unknown>).forEach(walk);
            }
        };
        walk(config);
        return Array.from(refs.values());
    }

    private _collectPresetIds(config: DocumentData): string[] {
        const ids = new Set<string>();
        const blocks = config?.blocks ?? {};
        Object.values(blocks).forEach((block) => {
            const styles = block.styles ?? {};
            Object.values(styles).forEach((target) => {
                if (target && typeof target.stylePresetId === 'string') {
                    ids.add(target.stylePresetId);
                }
            });
        });
        return Array.from(ids.values());
    }

    private async _collectPresetsForExport(presetIds: string[]): Promise<StylePreset[]> {
        if (presetIds.length === 0) return [];
        const service = await this._requirePresetService();
        const collected = new Map<string, StylePreset>();
        const stack = [...presetIds];

        while (stack.length > 0) {
            const id = stack.pop();
            if (!id || collected.has(id)) continue;
            const preset = service.getCachedPreset(id) ?? await service.getPreset(id);
            if (!preset) continue;
            collected.set(id, preset);
            if (preset.extendsPresetId) {
                stack.push(preset.extendsPresetId);
            }
        }

        return Array.from(collected.values());
    }

    private async _buildMediaItems(references: string[]): Promise<ExportMediaItem[]> {
        return references
            .map((reference) => {
                const relativePath = getCardBuilderRelativePath(reference);
                if (!relativePath) return null;
                const parts = relativePath.split('/');
                const fileName = parts[parts.length - 1] || relativePath;
                return {
                    reference,
                    relativePath,
                    fileName,
                    zipPath: `${EXPORT_MEDIA_FOLDER}/${relativePath}`,
                };
            })
            .filter((item): item is ExportMediaItem => Boolean(item));
    }

    private async _addMediaFilesToZip(zip: JSZip, items: ExportMediaItem[]): Promise<void> {
        await Promise.all(
            items.map(async (item) => {
                const url = mediaContentIdToPublicUrl(item.reference);
                if (!url) {
                    throw new Error(`Unable to resolve media URL for ${item.reference}`);
                }
                const response = await fetch(url, {credentials: 'include'});
                if (!response.ok) {
                    throw new Error(`Failed to download media: ${item.fileName}`);
                }
                const buffer = await response.arrayBuffer();
                zip.file(item.zipPath, buffer);
            })
        );
    }

    private _parseCardPayload(text: string): Partial<CardData> & {config: DocumentData} {
        let data: unknown;
        try {
            data = JSON.parse(text);
        } catch (err) {
            throw new Error(`Invalid card.json: ${err instanceof Error ? err.message : 'parse error'}`);
        }

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid card.json: expected object');
        }

        const config = (data as CardData).config;
        if (!config || typeof config !== 'object') {
            throw new Error('Invalid card.json: missing config');
        }

        return data as Partial<CardData> & {config: DocumentData};
    }

    private _parseExtras(text: string): CardsExportExtras {
        let data: unknown;
        try {
            data = JSON.parse(text);
        } catch (err) {
            throw new Error(`Invalid extras.json: ${err instanceof Error ? err.message : 'parse error'}`);
        }

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid extras.json: expected object');
        }

        return data as CardsExportExtras;
    }

    private _extractMediaItems(zip: JSZip, extras?: CardsExportExtras): ExportMediaItem[] {
        if (extras?.media?.items?.length) {
            return extras.media.items.map((item) => ({
                reference: item.reference,
                relativePath: item.relativePath,
                fileName: item.fileName,
                zipPath: item.zipPath || `${EXPORT_MEDIA_FOLDER}/${item.relativePath}`,
            }));
        }

        const items: ExportMediaItem[] = [];
        zip.forEach((path) => {
            if (!path.startsWith(`${EXPORT_MEDIA_FOLDER}/`)) return;
            const relativePath = path.slice(EXPORT_MEDIA_FOLDER.length + 1);
            if (!relativePath || relativePath.endsWith('/')) return;
            const parts = relativePath.split('/');
            const fileName = parts[parts.length - 1] || relativePath;
            items.push({
                reference: buildCardBuilderMediaReference(relativePath),
                relativePath,
                fileName,
                zipPath: path,
            });
        });

        return items;
    }

    private async _detectPresetConflicts(presets: StylePreset[]): Promise<PresetConflict[]> {
        const service = await this._requirePresetService();
        const existing = service.getAllPresets();
        const byName = new Map<string, StylePreset[]>();
        existing.forEach((preset) => {
            const key = preset.name.trim().toLowerCase();
            if (!byName.has(key)) {
                byName.set(key, []);
            }
            byName.get(key)!.push(preset);
        });

        const conflicts: PresetConflict[] = [];
        presets.forEach((preset) => {
            const key = preset.name.trim().toLowerCase();
            const matches = byName.get(key);
            if (matches && matches.length > 0) {
                conflicts.push({preset, existing: matches[0]});
            }
        });

        return conflicts;
    }

    private async _detectMediaConflicts(items: ExportMediaItem[]): Promise<MediaConflict[]> {
        const mediaService = this._requireMediaService();
        const rootListing = await mediaService.browse(buildCardBuilderMediaReference());
        const existingNames = new Set(
            (rootListing.children || [])
                .filter((item) => !item.can_expand)
                .map((item) => item.title)
        );

        const conflicts: MediaConflict[] = [];
        items.forEach((item) => {
            const fileName = this._toFlatMediaName(item.relativePath);
            if (existingNames.has(fileName)) {
                conflicts.push({item, existingName: fileName});
            }
        });

        return conflicts;
    }

    private async _importPresets(
        presets: StylePreset[],
        strategy: PresetConflictStrategy
    ): Promise<Map<string, string>> {
        const service = await this._requirePresetService();
        const existing = service.getAllPresets();
        const byName = new Map<string, StylePreset[]>();
        existing.forEach((preset) => {
            const key = preset.name.trim().toLowerCase();
            if (!byName.has(key)) {
                byName.set(key, []);
            }
            byName.get(key)!.push(preset);
        });

        const presetById = new Map(presets.map((preset) => [preset.id, preset] as const));
        const mapping = new Map<string, string>();

        const ensurePreset = async (presetId: string): Promise<string | null> => {
            if (mapping.has(presetId)) {
                return mapping.get(presetId) ?? null;
            }

            const preset = presetById.get(presetId);
            if (!preset) return null;

            const existingMatches = byName.get(preset.name.trim().toLowerCase()) || [];
            const existingMatch = existingMatches[0];
            const hasConflict = Boolean(existingMatch);

            let targetParentId: string | undefined;
            if (preset.extendsPresetId) {
                const resolvedParent = await ensurePreset(preset.extendsPresetId);
                if (resolvedParent) {
                    targetParentId = resolvedParent;
                }
            }

            if (hasConflict) {
                if (strategy === 'use-existing') {
                    mapping.set(presetId, existingMatch.id);
                    return existingMatch.id;
                }

                if (strategy === 'overwrite') {
                    await service.updatePreset(existingMatch.id, {
                        name: preset.name,
                        description: preset.description,
                        extendsPresetId: targetParentId,
                        data: preset.data,
                    });
                    mapping.set(presetId, existingMatch.id);
                    return existingMatch.id;
                }
            }

            const created = await service.createPreset({
                name: preset.name,
                description: preset.description,
                extendsPresetId: targetParentId,
                data: preset.data,
            });
            mapping.set(presetId, created.id);
            return created.id;
        };

        for (const preset of presets) {
            await ensurePreset(preset.id);
        }

        return mapping;
    }

    private async _importMedia(
        bundle: ImportBundleInfo,
        strategy: MediaConflictStrategy
    ): Promise<Map<string, string>> {
        const mediaService = this._requireMediaService();
        const rootListing = await mediaService.browse(buildCardBuilderMediaReference());
        const existingNames = new Set(
            (rootListing.children || [])
                .filter((item) => !item.can_expand)
                .map((item) => item.title)
        );

        const mapping = new Map<string, string>();

        for (const item of bundle.mediaItems) {
            const entry = bundle.zip.file(item.zipPath);
            if (!entry) continue;

            const baseName = this._toFlatMediaName(item.relativePath);
            const hasConflict = existingNames.has(baseName);

            if (hasConflict && strategy === 'skip') {
                mapping.set(item.reference, buildCardBuilderMediaReference(baseName));
                continue;
            }

            let targetName = baseName;
            if (hasConflict && strategy === 'rename') {
                targetName = this._getUniqueMediaName(baseName, existingNames);
            }

            const blob = await entry.async('blob');
            const file = new File([blob], targetName, {type: blob.type || 'application/octet-stream'});
            const response = await mediaService.uploadFile(file, buildCardBuilderMediaReference());
            existingNames.add(targetName);
            mapping.set(item.reference, response.reference || buildCardBuilderMediaReference(targetName));
        }

        return mapping;
    }

    private _applyPresetMapping(config: DocumentData, mapping: Map<string, string>): DocumentData {
        const cloned = this._cloneConfig(config);
        const blocks = cloned.blocks ?? {};
        Object.values(blocks).forEach((block) => {
            if (!block.styles) return;
            Object.values(block.styles).forEach((target) => {
                if (!target || typeof target.stylePresetId !== 'string') return;
                const mapped = mapping.get(target.stylePresetId);
                if (mapped) {
                    target.stylePresetId = mapped;
                }
            });
        });
        return cloned;
    }

    private _applyMediaMapping(config: DocumentData, mapping: Map<string, string>): DocumentData {
        const cloned = this._cloneConfig(config);
        const walk = (value: unknown): unknown => {
            if (typeof value === 'string') {
                return mapping.get(value) ?? value;
            }
            if (Array.isArray(value)) {
                return value.map(walk);
            }
            if (value && typeof value === 'object') {
                const entries = Object.entries(value as Record<string, unknown>);
                const mapped: Record<string, unknown> = {};
                entries.forEach(([key, val]) => {
                    mapped[key] = walk(val);
                });
                return mapped;
            }
            return value;
        };

        return walk(cloned) as DocumentData;
    }

    private _toFlatMediaName(relativePath: string): string {
        return relativePath.replace(/\//g, '__');
    }

    private _getUniqueMediaName(baseName: string, existingNames: Set<string>): string {
        if (!existingNames.has(baseName)) return baseName;

        const match = /^(.*?)(\.[^.]+)?$/.exec(baseName);
        const stem = match?.[1] || baseName;
        const ext = match?.[2] || '';

        let index = 1;
        let candidate = `${stem}_${index}${ext}`;
        while (existingNames.has(candidate)) {
            index += 1;
            candidate = `${stem}_${index}${ext}`;
        }
        return candidate;
    }

    private _createCardFromBundle(
        card: Partial<CardData> & {config: DocumentData},
        name: string,
        description: string,
        config: DocumentData
    ): Promise<CardData> {
        const service = this._requireService();
        const source = card.source ?? 'local';
        const author = source === 'local' ? this._getCurrentUserName() : (card.author ?? '');

        return service.createCard({
            name: name.trim(),
            description: description.trim(),
            config,
            source,
            author,
            marketplace_origin: card.marketplace_origin ?? undefined,
            version: card.version ?? undefined,
            marketplace_id: card.marketplace_id ?? undefined,
            group_id: card.group_id ?? undefined,
            license_id: card.license_id ?? undefined,
            tags: card.tags ? [...card.tags] : undefined,
            categories: card.categories ? [...card.categories] : undefined,
            min_ha_version: card.min_ha_version ?? undefined,
            max_ha_version: card.max_ha_version ?? undefined,
            min_builder_version: card.min_builder_version ?? undefined,
            checksum: card.checksum ?? undefined,
            last_synced_at: card.last_synced_at ?? undefined,
            tier: card.tier ?? undefined,
        });
    }

    private _getCurrentUserName(): string {
        return this.hass?.user?.name ?? '';
    }
}

export const cardsManagerContext = createContext<CardsManager>('cards-manager');
