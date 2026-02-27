/**
 * CSS custom properties service
 *
 * WebSocket API client for custom CSS property registration.
 */

import { BASE_PATH } from "@/common/api/types";
import type { CSSCustomProperty } from '@/common/core/css-custom-properties';
import type { HomeAssistant } from 'custom-card-helpers';

const BASE_CSS_CUSTOM_PROPERTIES_PATH = `${BASE_PATH}/css_custom_properties`;

export interface CSSCustomPropertyRecord {
    id: string;
    name: string;
    syntax: string;
    inherits?: boolean;
    initial_value: string;
    created_at?: string;
    updated_at?: string;
}

export type CSSCustomPropertyUpdateCallback = (
    properties: CSSCustomPropertyRecord[]
) => void;

export class CssCustomPropertiesService {
    private cache = new Map<string, CSSCustomPropertyRecord>();
    private subscribers = new Set<CSSCustomPropertyUpdateCallback>();
    private initialized = false;
    private unsubscribe: (() => void) | null = null;

    constructor(private hass: HomeAssistant) {
    }

    async initialize(): Promise<void> {
        if (!this.initialized) {
            await this.loadProperties();
            await this.subscribeToUpdates();
            this.initialized = true;
        }
    }

    dispose(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.cache.clear();
        this.subscribers.clear();
        this.initialized = false;
    }

    async loadProperties(): Promise<CSSCustomPropertyRecord[]> {
        const properties = await this.hass.callWS<CSSCustomPropertyRecord[]>({
            type: `${BASE_CSS_CUSTOM_PROPERTIES_PATH}/list`,
        });

        this.cache.clear();
        for (const property of properties) {
            this.cache.set(property.id, property);
        }

        return properties;
    }

    getAllProperties(): CSSCustomPropertyRecord[] {
        return Array.from(this.cache.values());
    }

    async createProperty(
        input: CSSCustomProperty
    ): Promise<CSSCustomPropertyRecord> {
        const property = await this.hass.callWS<CSSCustomPropertyRecord>({
            type: `${BASE_CSS_CUSTOM_PROPERTIES_PATH}/create`,
            name: input.name,
            syntax: input.syntax,
            inherits: Boolean(input.inherits),
            initial_value: input.initialValue ?? '',
        });

        this.cache.set(property.id, property);
        this.notifySubscribers();

        return property;
    }

    subscribe(callback: CSSCustomPropertyUpdateCallback): () => void {
        this.subscribers.add(callback);
        callback(this.getAllProperties());

        return () => {
            this.subscribers.delete(callback);
        };
    }

    private async subscribeToUpdates(): Promise<void> {
        try {
            this.unsubscribe = await this.hass.connection.subscribeMessage(
                (message) => {
                    this.handleSubscriptionMessage(message);
                },
                {
                    type: `${BASE_CSS_CUSTOM_PROPERTIES_PATH}/subscribe`,
                }
            );
        } catch (error) {
            console.warn('[CSSCustomPropertiesService] Failed to subscribe:', error);
        }
    }

    private handleSubscriptionMessage(message: unknown): void {
        const changes = Array.isArray(message) ? message : [message];
        let changed = false;

        for (const change of changes) {
            if (!change || typeof change !== 'object') continue;
            const record = change as {
                change_type?: string;
                custom_property_id?: string;
                item?: CSSCustomPropertyRecord;
            };
            const itemId = record.custom_property_id ?? record.item?.id;
            if (!itemId) continue;

            if (record.change_type === 'removed') {
                if (this.cache.delete(itemId)) {
                    changed = true;
                }
                continue;
            }

            if (record.item) {
                this.cache.set(itemId, record.item);
                changed = true;
            }
        }

        if (changed) {
            this.notifySubscribers();
        }
    }

    private notifySubscribers(): void {
        const properties = this.getAllProperties();
        for (const callback of this.subscribers) {
            try {
                callback(properties);
            } catch (error) {
                console.error('[CSSCustomPropertiesService] Subscriber error:', error);
            }
        }
    }
}
