import type { HomeAssistant } from 'custom-card-helpers';
import type {
    CardBuilderAccount,
    CardBuilderAccountPlansInfo,
    MarketplaceCardInfo,
    MarketplaceCardChangelog,
    MarketplaceDisclaimer,
    MarketplaceFeaturedCardsResponse,
    MarketplaceSharedCardListItem,
    MarketplaceSharedCardSyncResult,
    MarketplaceVersionsCheckResult,
    MarketplaceDownloadResult,
    MarketplacePrepareResult,
    MarketplaceUpdatePrepareResult,
} from '@/common/api/types';
import {
    handleIntegrationOutdatedError,
} from '@/common/api/integration-outdated';
import { notifyRuntimeConfigChange, updateRuntimeConfig } from '@/common/api/runtime-config';

const WS_INFO_GET = 'card_builder/account/info_get';
const WS_ACCOUNT_GET = 'card_builder/account/account_get';
const WS_ACCOUNT_FINGERPRINT = 'card_builder/account/account_fingerprint';
const WS_ACCOUNT_DISCONNECT = 'card_builder/account/account_disconnect';
const WS_TOKEN_SET = 'card_builder/account/token_set';
const WS_MARKETPLACE_CARDS_SHARED_UPLOAD = 'card_builder/account/marketplace/cards/shared/upload';
const WS_MARKETPLACE_CARDS_SHARED_LIST = 'card_builder/account/marketplace/cards/shared/list';
const WS_MARKETPLACE_CARDS_SHARED_LIST_ALL = 'card_builder/account/marketplace/cards/shared/list_all';
const WS_MARKETPLACE_CARDS_SHARED_SYNC = 'card_builder/account/marketplace/cards/shared/sync';
const WS_MARKETPLACE_CARDS_SHARED_UPDATE_REASONS = 'card_builder/account/marketplace/cards/shared/update_reasons';
const WS_MARKETPLACE_CATEGORIES = 'card_builder/account/marketplace/categories';
const WS_MARKETPLACE_CARDS_AVAILABLE_INFO = 'card_builder/account/marketplace/cards/available/info';
const WS_MARKETPLACE_CARDS_AVAILABLE_FEATURED = 'card_builder/account/marketplace/cards/available/featured';
const WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_PREPARE = 'card_builder/account/marketplace/cards/available/download_prepare';
const WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_CONFIRM = 'card_builder/account/marketplace/cards/available/download_confirm';
const WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_PREPARE = 'card_builder/account/marketplace/cards/available/update_prepare';
const WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_CONFIRM = 'card_builder/account/marketplace/cards/available/update_confirm';
const WS_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK = 'card_builder/account/marketplace/cards/available/versions_check';
const WS_MARKETPLACE_CARDS_AVAILABLE_CHANGELOG = 'card_builder/account/marketplace/cards/available/changelog';
const WS_MARKETPLACE_DISCLAIMER_SHARE = 'card_builder/account/marketplace/disclaimers/share';
const WS_MARKETPLACE_DISCLAIMER_DOWNLOAD = 'card_builder/account/marketplace/disclaimers/download';

const CACHE_SHARED_CARDS = 'card_builder.account.marketplace.shared_cards';
const CACHE_AVAILABLE_VERSIONS = 'card_builder.account.marketplace.available_versions';
const CACHE_AVAILABLE_FEATURED = 'card_builder.account.marketplace.available_featured';
const MARKETPLACE_FEATURED_CARDS_CACHE_TTL_SECONDS = 6 * 60 * 60;

interface CacheOptions {
    ttlSeconds: number;
    refresh?: boolean;
}

interface DefaultCacheOptions {
    ttlSeconds?: number;
    refresh?: boolean;
}

/**
 * Service for account management via WebSocket API
 */
export class AccountService {
    constructor(private hass: HomeAssistant) {
    }

    private async _callWS<T>(payload: {type: string} & Record<string, unknown>): Promise<T> {
        try {
            return await this.hass.callWS<T>(payload);
        } catch (err) {
            handleIntegrationOutdatedError(err);
            this._handleAuthFailedError(err);
            throw err;
        }
    }

    private _handleAuthFailedError(err: unknown): void {
        if (!this._isAuthFailedError(err)) return;
        updateRuntimeConfig({hasToken: false});
        this.invalidateMarketplaceSharedCardsCache();
        this.invalidateMarketplaceCardVersionsCache();
        notifyRuntimeConfigChange();
    }

    private _isAuthFailedError(err: unknown): boolean {
        if (!err || typeof err !== 'object') return false;
        return (err as {code?: string}).code === 'api_auth_failed';
    }

    private _readCache<T>(key: string): T | undefined {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return undefined;
            const cached = JSON.parse(raw) as {expiresAt: number; data: T};
            if (cached.expiresAt <= Date.now()) {
                localStorage.removeItem(key);
                return undefined;
            }
            return cached.data;
        } catch {
            return undefined;
        }
    }

    private _writeCache<T>(key: string, data: T, ttlSeconds: number): void {
        try {
            localStorage.setItem(key, JSON.stringify({
                data,
                expiresAt: Date.now() + ttlSeconds * 1000,
            }));
        } catch {
        }
    }

    private _deleteCache(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch {
        }
    }

    async getInfo(): Promise<CardBuilderAccountPlansInfo> {
        const response = await this._callWS<{data?: CardBuilderAccountPlansInfo}>({
            type: WS_INFO_GET,
        });
        if (!response?.data) {
            throw new Error('Info payload missing');
        }
        return response.data;
    }

    async setToken(token: string): Promise<void> {
        await this._callWS({
            type: WS_TOKEN_SET,
            token,
        });
        updateRuntimeConfig({hasToken: true});
        notifyRuntimeConfigChange();
    }

    async getAccount(): Promise<CardBuilderAccount> {
        const response = await this._callWS<{data?: CardBuilderAccount}>({
            type: WS_ACCOUNT_GET,
        });
        updateRuntimeConfig({hasToken: true});
        notifyRuntimeConfigChange();
        return response?.data ?? {};
    }

    async registerFingerprint(): Promise<void> {
        await this._callWS({
            type: WS_ACCOUNT_FINGERPRINT,
        });
    }

    async disconnect(): Promise<void> {
        await this._callWS({
            type: WS_ACCOUNT_DISCONNECT,
        });
        updateRuntimeConfig({hasToken: false});
        notifyRuntimeConfigChange();
    }

    /**
     * Upload card to marketplace with associated assets
     */
    async uploadMarketplaceCard(
        id: string,
        options?: {
            screens?: Array<{
                container_id: string;
                data_url: string;
                width?: number;
                height?: number;
                card_width_percent?: number;
                card_scale?: number;
            }>;
            updateNotes?: string;
            updateReasons?: number[];
        }
    ): Promise<Record<string, unknown>> {
        const screens = options?.screens;
        const updateNotes = options?.updateNotes;
        const updateReasons = options?.updateReasons;
        const response = await this._callWS<Record<string, unknown>>({
            type: WS_MARKETPLACE_CARDS_SHARED_UPLOAD,
            card_id: id,
            screens,
            update_notes: updateNotes,
            update_reasons: updateReasons,
        });
        this.invalidateMarketplaceSharedCardsCache();
        return response;
    }

    /**
     * List shared cards from marketplace
     */
    async listMarketplaceCardsShared(options: {
        local_ids?: string[];
        sort?: 'id' | 'version' | 'created_at' | 'updated_at';
        direction?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    } = {}): Promise<{
        data: MarketplaceSharedCardListItem[];
        meta: Record<string, unknown>;
    }> {
        const {local_ids, sort, direction, per_page, page} = options ?? {};
        return this._callWS({
            type: WS_MARKETPLACE_CARDS_SHARED_LIST,
            ids: local_ids,
            sort,
            direction,
            per_page,
            page,
        });
    }

    async listAllMarketplaceCardsShared(options?: { cache?: CacheOptions }): Promise<MarketplaceSharedCardListItem[]> {
        const cache = options?.cache;
        if (cache && !cache.refresh) {
            const cached = this._readCache<MarketplaceSharedCardListItem[]>(CACHE_SHARED_CARDS);
            if (cached !== undefined) return cached;
        }

        const response = await this._callWS<{data?: MarketplaceSharedCardListItem[]}>({
            type: WS_MARKETPLACE_CARDS_SHARED_LIST_ALL,
        });
        if (!response?.data) {
            throw new Error('Marketplace shared cards payload missing');
        }
        if (cache) {
            this._writeCache(CACHE_SHARED_CARDS, response.data, cache.ttlSeconds);
        }
        return response.data;
    }

    invalidateMarketplaceSharedCardsCache(): void {
        this._deleteCache(CACHE_SHARED_CARDS);
    }

    /**
     * Synchronize local shared card marketplace metadata
     */
    async syncMarketplaceSharedCard(cardId: string): Promise<MarketplaceSharedCardSyncResult> {
        const response = await this._callWS<{data?: MarketplaceSharedCardSyncResult}>({
            type: WS_MARKETPLACE_CARDS_SHARED_SYNC,
            card_id: cardId,
        });
        if (!response?.data) {
            throw new Error('Marketplace shared card sync payload missing');
        }
        this.invalidateMarketplaceSharedCardsCache();
        return response.data;
    }

    /**
     * Fetch available card categories
     */
    async listMarketplaceCategories(options: {
        lang?: string;
        search?: string;
        page?: number;
        per_page?: number;
    }): Promise<{
        data?: Array<Record<string, unknown>>;
        meta?: Record<string, unknown>;
    }> {
        const {lang, search, page, per_page} = options ?? {};
        return this._callWS({
            type: WS_MARKETPLACE_CATEGORIES,
            lang,
            search,
            page,
            per_page,
        });
    }

    /**
     * Fetch available update reasons
     */
    async listMarketplaceUpdateReasons(): Promise<{
        data?: Array<Record<string, unknown>>;
    }> {
        return this._callWS({
            type: WS_MARKETPLACE_CARDS_SHARED_UPDATE_REASONS,
        });
    }

    /**
     * Fetch marketplace card preview info by ID
     */
    async getMarketplaceCardInfo(marketplaceId: string, version?: number): Promise<MarketplaceCardInfo> {
        const response = await this._callWS<{data?: MarketplaceCardInfo}>({
            type: WS_MARKETPLACE_CARDS_AVAILABLE_INFO,
            marketplace_id: marketplaceId,
            version,
        });
        if (!response?.data) {
            throw new Error('Marketplace card info payload missing');
        }
        return response.data;
    }

    /**
     * Fetch featured marketplace cards
     */
    async listMarketplaceCardsAvailableFeatured(
        options: { cache?: DefaultCacheOptions } = {},
    ): Promise<MarketplaceFeaturedCardsResponse> {
        const cache = options.cache ?? {};
        if (!cache.refresh) {
            const cached = this._readCache<MarketplaceFeaturedCardsResponse>(CACHE_AVAILABLE_FEATURED);
            if (cached !== undefined) return cached;
        }

        const response = await this._callWS<{data?: MarketplaceFeaturedCardsResponse}>({
            type: WS_MARKETPLACE_CARDS_AVAILABLE_FEATURED,
        });
        if (!response?.data) {
            throw new Error('Marketplace featured cards payload missing');
        }
        this._writeCache(
            CACHE_AVAILABLE_FEATURED,
            response.data,
            cache.ttlSeconds ?? MARKETPLACE_FEATURED_CARDS_CACHE_TTL_SECONDS,
        );
        return response.data;
    }

    /**
     * Prepare marketplace card download: fetch payload without saving
     */
    async prepareMarketplaceDownload(marketplaceId: string, version?: number): Promise<MarketplacePrepareResult> {
        const response = await this._callWS<{data?: MarketplacePrepareResult}>({
            type: WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_PREPARE,
            marketplace_id: marketplaceId,
            version,
        });
        if (!response?.data) {
            throw new Error('Marketplace card prepare payload missing');
        }
        return response.data;
    }

    /**
     * Confirm marketplace card download: download assets and save locally
     */
    async confirmMarketplaceDownload(marketplaceId: string, payload: MarketplacePrepareResult): Promise<MarketplaceDownloadResult> {
        const response = await this._callWS<{data?: MarketplaceDownloadResult}>({
            type: WS_MARKETPLACE_CARDS_AVAILABLE_DOWNLOAD_CONFIRM,
            marketplace_id: marketplaceId,
            payload,
        });
        if (!response?.data) {
            throw new Error('Marketplace card download confirm payload missing');
        }
        this.invalidateMarketplaceCardVersionsCache();
        return response.data;
    }

    /**
     * Prepare marketplace card update: fetch new version payload without saving
     */
    async prepareMarketplaceUpdate(cardId: string, version?: number): Promise<MarketplaceUpdatePrepareResult> {
        const response = await this._callWS<{data?: MarketplaceUpdatePrepareResult}>({
            type: WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_PREPARE,
            card_id: cardId,
            version,
        });
        if (!response?.data) {
            throw new Error('Marketplace card update prepare payload missing');
        }
        return response.data;
    }

    /**
     * Confirm marketplace card update: download assets and save the updated card
     */
    async confirmMarketplaceUpdate(cardId: string, payload: MarketplacePrepareResult): Promise<MarketplaceDownloadResult> {
        const response = await this._callWS<{data?: MarketplaceDownloadResult}>({
            type: WS_MARKETPLACE_CARDS_AVAILABLE_UPDATE_CONFIRM,
            card_id: cardId,
            payload,
        });
        if (!response?.data) {
            throw new Error('Marketplace card update confirm payload missing');
        }
        this.invalidateMarketplaceCardVersionsCache();
        return response.data;
    }

    /**
     * Check latest marketplace versions for downloaded cards
     */
    async checkMarketplaceCardVersions(
        marketplaceIds: string[],
        options?: { cache?: CacheOptions },
    ): Promise<MarketplaceVersionsCheckResult> {
        const cache = options?.cache;
        if (cache) {
            const cached = cache.refresh
                ? undefined
                : this._readCache<MarketplaceVersionsCheckResult>(CACHE_AVAILABLE_VERSIONS);
            if (cached !== undefined) return cached;

            const response = await this._callWS<{data?: MarketplaceVersionsCheckResult}>({
                type: WS_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK,
                marketplace_ids: marketplaceIds,
            });
            const data = response?.data ?? {};
            this._writeCache(CACHE_AVAILABLE_VERSIONS, data, cache.ttlSeconds);
            return data;
        }

        const response = await this._callWS<{data?: MarketplaceVersionsCheckResult}>({
            type: WS_MARKETPLACE_CARDS_AVAILABLE_VERSIONS_CHECK,
            marketplace_ids: marketplaceIds,
        });
        return response?.data ?? {};
    }

    invalidateMarketplaceCardVersionsCache(): void {
        this._deleteCache(CACHE_AVAILABLE_VERSIONS);
    }

    /**
     * Fetch changelog for a marketplace card
     */
    async getMarketplaceCardChangelog(marketplaceId: string): Promise<MarketplaceCardChangelog> {
        const response = await this._callWS<{data?: MarketplaceCardChangelog}>({
            type: WS_MARKETPLACE_CARDS_AVAILABLE_CHANGELOG,
            marketplace_id: marketplaceId,
        });
        if (!response?.data) {
            throw new Error('Marketplace changelog payload missing');
        }
        return response.data;
    }

    /**
     * Fetch marketplace share disclaimer
     */
    async getMarketplaceShareDisclaimer(): Promise<MarketplaceDisclaimer> {
        const response = await this._callWS<{data?: MarketplaceDisclaimer}>({
            type: WS_MARKETPLACE_DISCLAIMER_SHARE,
        });
        if (!response?.data) {
            throw new Error('Marketplace share disclaimer payload missing');
        }
        return response.data;
    }

    /**
     * Fetch marketplace download disclaimer
     */
    async getMarketplaceDownloadDisclaimer(): Promise<MarketplaceDisclaimer> {
        const response = await this._callWS<{data?: MarketplaceDisclaimer}>({
            type: WS_MARKETPLACE_DISCLAIMER_DOWNLOAD,
        });
        if (!response?.data) {
            throw new Error('Marketplace download disclaimer payload missing');
        }
        return response.data;
    }
}
