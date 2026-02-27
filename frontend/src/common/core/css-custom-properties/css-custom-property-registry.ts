/**
 * Global registry for custom CSS properties.
 */

import { getCSSCustomPropertiesService } from '@/common/api';
import type {
    CssCustomPropertiesService,
    CSSCustomPropertyRecord
} from '@/common/api/services/css-custom-properties-service';
import type { HomeAssistant } from 'custom-card-helpers';

export interface CSSCustomProperty {
    name: string;
    syntax: string;
    inherits?: boolean;
    initialValue?: string;
}

type RegistrySubscriber = (properties: CSSCustomProperty[]) => void;

class CSSCustomPropertyRegistry {
    private properties = new Map<string, CSSCustomProperty>();
    private registered = new Set<string>();
    private subscribers = new Set<RegistrySubscriber>();
    private hass?: HomeAssistant;
    private service?: CssCustomPropertiesService;
    private serviceUnsubscribe?: () => void;
    private initializing?: Promise<void>;

    setHass(hass?: HomeAssistant): void {
        if (!hass || this.hass === hass) return;

        this.hass = hass;
        this.service = undefined;
        this.initializing = undefined;
        if (this.serviceUnsubscribe) {
            this.serviceUnsubscribe();
            this.serviceUnsubscribe = undefined;
        }
    }

    list(): CSSCustomProperty[] {
        return Array.from(this.properties.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    async add(
        property: CSSCustomProperty
    ): Promise<{ ok: boolean; error?: string }> {
        const normalized = this.normalizeProperty(property);
        if (!normalized.ok) return normalized;

        if (this.properties.has(normalized.property.name)) {
            return {ok: false, error: 'Property already exists.'};
        }

        await this.initialize();
        if (!this.service) {
            return {ok: false, error: 'Service not available.'};
        }

        try {
            const created = await this.service.createProperty(normalized.property);
            const mapped = this.mapRecord(created);
            if (!mapped.initialValue) {
                return {ok: false, error: 'Initial value is required.'};
            }

            this.properties.set(mapped.name, mapped);
            this.registerProperty(mapped);
            this.notify();
            return {ok: true};
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to register property.';
            return {ok: false, error: message};
        }
    }

    subscribe(callback: RegistrySubscriber): () => void {
        this.subscribers.add(callback);
        callback(this.list());
        void this.initialize();

        return () => {
            this.subscribers.delete(callback);
        };
    }

    async initialize(): Promise<void> {
        if (!this.hass) return;
        if (this.serviceUnsubscribe) return;
        if (this.initializing) return this.initializing;

        this.initializing = (async () => {
            this.service = await getCSSCustomPropertiesService(this.hass!);
            if (!this.serviceUnsubscribe) {
                this.serviceUnsubscribe = this.service.subscribe((properties) => {
                    this.syncFromService(properties);
                });
            }
        })().catch((error) => {
            console.warn('[CSSCustomPropertyRegistry] Failed to initialize:', error);
        });

        return this.initializing;
    }

    private syncFromService(records: CSSCustomPropertyRecord[]): void {
        this.properties.clear();
        for (const record of records) {
            const mapped = this.mapRecord(record);
            if (!mapped.name || !mapped.syntax || !mapped.initialValue) continue;
            this.properties.set(mapped.name, mapped);
            this.registerProperty(mapped);
        }
        this.notify();
    }

    private mapRecord(record: CSSCustomPropertyRecord): CSSCustomProperty {
        const initialValue =
            record.initial_value ?? (record as unknown as { initialValue?: string }).initialValue ?? '';

        return {
            name: String(record.name ?? '').trim(),
            syntax: String(record.syntax ?? '').trim(),
            inherits: Boolean(record.inherits),
            initialValue: String(initialValue ?? '').trim(),
        };
    }

    private notify(): void {
        const list = this.list();
        for (const callback of this.subscribers) {
            callback(list);
        }
    }

    private registerProperty(property: CSSCustomProperty): void {
        const name = property.name.trim();
        if (!name.startsWith('--')) return;
        if (this.registered.has(name)) return;
        if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') return;

        try {
            CSS.registerProperty({
                name,
                syntax: property.syntax,
                inherits: Boolean(property.inherits),
                initialValue: property.initialValue,
            });
            this.registered.add(name);
        } catch {
            // Ignore registration failures (already registered or invalid config).
        }
    }

    private normalizeProperty(
        property: CSSCustomProperty
    ): { ok: true; property: CSSCustomProperty } | { ok: false; error: string } {
        const name = String(property.name ?? '').trim();
        if (!name.startsWith('--')) {
            return {ok: false, error: 'Name must start with --.'};
        }

        const syntax = String(property.syntax ?? '').trim();
        if (!syntax) {
            return {ok: false, error: 'Syntax is required.'};
        }

        const initialValue = String(property.initialValue ?? '').trim();
        if (!initialValue) {
            return {ok: false, error: 'Initial value is required.'};
        }

        return {
            ok: true,
            property: {
                name,
                syntax,
                inherits: Boolean(property.inherits),
                initialValue,
            },
        };
    }
}

let registryInstance: CSSCustomPropertyRegistry | null = null;

export function getCSSCustomPropertyRegistry(
    hass?: HomeAssistant
): CSSCustomPropertyRegistry {
    if (!registryInstance) {
        registryInstance = new CSSCustomPropertyRegistry();
    }

    if (hass) {
        registryInstance.setHass(hass);
        void registryInstance.initialize();
    }

    return registryInstance;
}
