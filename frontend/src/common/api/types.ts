/**
 * Card data interfaces and types
 */
import type { DocumentData } from "@/common/core/model/types";

export const BASE_PATH = 'card_builder';

export type CardBuilderAccount = Record<string, unknown>;

export interface CardBuilderAccountPlanFeature {
    code: string;
    label: string;
}

export type CardBuilderAccountBillingType = 'free' | 'one_time' | 'subscription';
export type CardBuilderAccountBillingInterval = 'monthly' | 'yearly' | 'one_time' | null;

export interface CardBuilderAccountPlanPrice {
    amount: number;
    currency: string;
    billing_type: CardBuilderAccountBillingType;
    billing_interval: CardBuilderAccountBillingInterval;
}

export type CardBuilderAccountPlanStatus = 'enabled' | 'preview';

export interface CardBuilderAccountPlanCta {
    label: string;
    link: string | null;
}

export interface CardBuilderAccountPlanInfo {
    code: string;
    name: string;
    status: CardBuilderAccountPlanStatus;
    cta: CardBuilderAccountPlanCta;
    download_limit: number | null;
    features: CardBuilderAccountPlanFeature[];
    prices: CardBuilderAccountPlanPrice[];
}

export interface CardBuilderAccountPlansInfo {
    free_download_limit: number;
    marketplace_cards_count: number;
    plans: CardBuilderAccountPlanInfo[];
    urls: {
        website_page_home: string;
        website_page_marketplace: string;
        marketplace_page_home: string;
        marketplace_page_browse: string;
    };
}

export type CardBuilderAccountTier = 'base' | 'pro';

export interface MarketplaceCardCreatorInfo {
    username?: string | null;
    profile?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
}

export interface MarketplaceCardPreviewImage {
    url: string;
    width?: number | null;
    height?: number | null;
    role?: string | null;
    sort_order?: number | null;
}

export interface MarketplaceLinkedFacet {
    label: string;
    url: string;
}

export interface MarketplaceCardInfo {
    marketplace_id: string;
    name: string;
    description?: string | null;
    author?: string | null;
    creator?: MarketplaceCardCreatorInfo | null;
    version?: number | null;
    min_ha_version?: string | null;
    max_ha_version?: string | null;
    min_builder_version?: string | null;
    tier?: CardBuilderAccountTier | string | null;
    categories?: string[];
    tags?: string[];
    style?: string | null;
    collections?: string[];
    preview_images?: MarketplaceCardPreviewImage[];
    downloads_count?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface MarketplaceFeaturedCard {
    id: string;
    name: string;
    description: string;
    origin: 'official' | 'community';
    creator?: MarketplaceCardCreatorInfo | null;
    categories: MarketplaceLinkedFacet[];
    tags: MarketplaceLinkedFacet[];
    style: MarketplaceLinkedFacet;
    preview_images: MarketplaceCardPreviewImage[];
}

export interface MarketplaceFeaturedCardsResponse {
    list: {
        count: number;
        items: MarketplaceFeaturedCard[];
    };
}

export interface MarketplaceDownloadResult {
    card_id: string;
    marketplace_id: string;
    version?: number;
    assets?: Array<{
        asset_id?: string;
        filename: string;
        reference: string;
        reused?: boolean;
    }>;
    asset_errors?: Array<{
        asset_id?: string;
        error: string;
    }>;
}

export interface MarketplacePrepareResult {
    name: string;
    description?: string | null;
    config: DocumentData;
    meta?: Record<string, unknown> | null;
    assets?: Array<Record<string, unknown>>;
    version: number;
    marketplace_id?: string;
    group_id?: string | null;
    min_ha_version?: string | null;
    max_ha_version?: string | null;
    min_builder_version?: string | null;
    tier?: string | null;
    checksum?: string | null;
    tags?: string[];
    categories?: string[];
    created_at?: string | null;
    updated_at?: string | null;
}

export interface MarketplaceUpdatePrepareResult {
    payload: MarketplacePrepareResult;
    local_config?: DocumentData;
}

export interface MarketplaceVersionsCheckEntry {
    marketplace_id: string;
    latest_version?: number | null;
    updated_at?: string | null;
}

export type MarketplaceVersionsCheckResult = Record<string, MarketplaceVersionsCheckEntry | null>;

export interface MarketplaceSharedCardListItem {
    id: string;
    version: number;
    marketplace_id: string;
    marketplace_version: number;
}

export interface MarketplaceSharedCardSyncResult {
    id: string;
    shared: boolean;
    marketplace_id: string | null;
    version: number | null;
}

export interface MarketplaceChangelogEntry {
    version: number;
    update_notes?: string | null;
    update_reasons?: string[];
    released_at?: string | null;
}

export interface MarketplaceCardChangelog {
    marketplace_id: string;
    name: string;
    description?: string | null;
    author?: string | null;
    latest_version?: number | null;
    updated_at?: string | null;
    changelog?: MarketplaceChangelogEntry[];
}

export interface MarketplaceDisclaimerLink {
    label: string;
    url: string;
}

export interface MarketplaceDisclaimer {
    html: string;
    links: MarketplaceDisclaimerLink[];
    version: string;
}

export type CardSource = 'local' | 'marketplace';
export type CardMarketplaceOrigin = 'official' | 'community';

export interface CardData {
    id: string;
    name: string;
    description: string;
    config: DocumentData;
    source: CardSource;
    author?: string;
    version: number;
    marketplace_id?: string | null;
    marketplace_origin?: CardMarketplaceOrigin | null;
    marketplace_download?: boolean | null;
    marketplace_download_version?: number | null;
    marketplace_parent_id?: string | null;
    marketplace_parent_version?: number | null;
    meta?: Record<string, unknown> | null;
    group_id?: string | null;
    license_id?: string | null;
    tags?: string[];
    categories?: string[];
    min_ha_version?: string | null;
    max_ha_version?: string | null;
    min_builder_version?: string | null;
    checksum?: string | null;
    last_synced_at?: string | null;
    tier?: CardBuilderAccountTier;
    created_at: string;
    updated_at: string;
}

export interface CreateCardInput {
    name: string;
    description?: string;
    config: DocumentData;
    source?: CardSource;
    author?: string;
    version?: number;
    marketplace_id?: string | null;
    marketplace_origin?: CardMarketplaceOrigin | null;
    marketplace_download?: boolean | null;
    marketplace_download_version?: number | null;
    marketplace_parent_id?: string | null;
    marketplace_parent_version?: number | null;
    meta?: Record<string, unknown> | null;
    group_id?: string | null;
    license_id?: string | null;
    tags?: string[];
    categories?: string[];
    min_ha_version?: string | null;
    max_ha_version?: string | null;
    min_builder_version?: string | null;
    checksum?: string | null;
    last_synced_at?: string | null;
    tier?: CardBuilderAccountTier;
}

export interface UpdateCardInput {
    name?: string;
    description?: string;
    config?: DocumentData;
    source?: CardSource;
    author?: string;
    version?: number;
    marketplace_id?: string | null;
    marketplace_origin?: CardMarketplaceOrigin | null;
    marketplace_download?: boolean | null;
    marketplace_download_version?: number | null;
    marketplace_parent_id?: string | null;
    marketplace_parent_version?: number | null;
    meta?: Record<string, unknown> | null;
    group_id?: string | null;
    license_id?: string | null;
    tags?: string[];
    categories?: string[];
    min_ha_version?: string | null;
    max_ha_version?: string | null;
    min_builder_version?: string | null;
    checksum?: string | null;
    last_synced_at?: string | null;
    tier?: CardBuilderAccountTier;
}
