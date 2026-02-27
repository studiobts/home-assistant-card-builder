/**
 * Style Preset Service
 *
 * WebSocket API client for style preset CRUD operations.
 * Provides client-side caching for fast access.
 */

import { BASE_PATH } from "@/common/api/types";
import type { HomeAssistant } from 'custom-card-helpers';
import type { CreateStylePresetInput, StylePreset, UpdateStylePresetInput } from '@/common/types/style-preset';

const BASE_STYLE_PRESETS_PATH = `${BASE_PATH}/style_presets`;

// ============================================================================
// Types
// ============================================================================

/**
 * Callback for preset updates
 */
export type PresetUpdateCallback = (presets: StylePreset[]) => void;

// ============================================================================
// Style Preset Service
// ============================================================================

interface StylePresetMessage {
    preset: StylePreset;
}

/**
 * Service for managing style presets via WebSocket API
 */
export class StylePresetsService {
    /** Client-side preset cache */
    private cache = new Map<string, StylePreset>();

    /** Whether initial load has completed */
    private initialized = false;

    /** Subscribers for preset updates */
    private subscribers = new Set<PresetUpdateCallback>();

    /** Unsubscribe function for WebSocket subscription */
    private unsubscribe: (() => void) | null = null;

    // ==========================================================================
    // Initialization
    // ==========================================================================

    constructor(private hass: HomeAssistant) {
    }

    /**
     * Initialize the service with a WebSocket connection
     */
    async initialize(): Promise<void> {
        if (!this.initialized) {
            // Load initial presets
            await this.loadPresets();
            // Subscribe to real-time updates
            await this.subscribeToUpdates();

            this.initialized = true;
        }
    }

    /**
     * Cleanup service resources
     */
    dispose(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.cache.clear();
        this.subscribers.clear();
        this.initialized = false;
    }

    // ==========================================================================
    // CRUD Operations
    // ==========================================================================

    /**
     * Load all presets from backend
     */
    async loadPresets(): Promise<StylePreset[]> {
        const presets = await this.hass.callWS<StylePreset[]>({
            type: `${BASE_STYLE_PRESETS_PATH}/list`,
        });

        // Update cache
        this.cache.clear();
        for (const preset of presets) {
            this.cache.set(preset.id, preset);
        }

        return presets;
    }

    /**
     * Get all presets (from cache)
     */
    getAllPresets(): StylePreset[] {
        return Array.from(this.cache.values());
    }

    /**
     * Get a single preset by ID (from cache)
     *
     * @param id - Preset ID
     */
    getCachedPreset(id: string): StylePreset | undefined {
        return this.cache.get(id);
    }

    /**
     * Get a single preset by ID (from backend)
     *
     * @param id - Preset ID
     */
    async getPreset(id: string): Promise<StylePreset | undefined> {
        try {
            const preset = await this.hass.callWS<StylePreset>({
                type: `${BASE_STYLE_PRESETS_PATH}/get`,
                preset_id: id,
            });

            // Update cache
            this.cache.set(preset.id, preset);

            return preset;
        } catch {
            return undefined;
        }
    }

    /**
     * Create a new preset
     *
     * @param input - Preset creation input
     */
    async createPreset(input: CreateStylePresetInput): Promise<StylePreset> {
        const preset = await this.hass.callWS<StylePreset>({
            type: `${BASE_STYLE_PRESETS_PATH}/create`,
            name: input.name,
            description: input.description || '',
            extends_preset_id: input.extendsPresetId,
            data: input.data,
        });

        // Update cache
        this.cache.set(preset.id, preset);
        this.notifySubscribers();

        return preset;
    }

    /**
     * Update an existing preset
     *
     * @param id - Preset ID
     * @param input - Update input
     */
    async updatePreset(id: string, input: UpdateStylePresetInput): Promise<StylePreset> {
        const preset = await this.hass.callWS<StylePreset>({
            type: `${BASE_STYLE_PRESETS_PATH}/update`,
            preset_id: id,
            ...input,
        });

        // Update cache
        this.cache.set(preset.id, preset);
        this.notifySubscribers();

        return preset;
    }

    /**
     * Delete a preset
     *
     * @param id - Preset ID
     */
    async deletePreset(id: string): Promise<void> {
        await this.hass.callWS({
            type: `${BASE_STYLE_PRESETS_PATH}/delete`,
            preset_id: id,
        });

        // Update cache
        this.cache.delete(id);
        this.notifySubscribers();
    }

    // ==========================================================================
    // Subscription
    // ==========================================================================

    /**
     * Subscribe to preset updates
     *
     * @param callback - Callback function
     * @returns Unsubscribe function
     */
    subscribe(callback: PresetUpdateCallback): () => void {
        this.subscribers.add(callback);

        // Immediately notify with current state
        callback(this.getAllPresets());

        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Check if a preset exists
     *
     * @param id - Preset ID
     */
    hasPreset(id: string): boolean {
        return this.cache.has(id);
    }

    /**
     * Get presets that extend a specific preset
     *
     * @param presetId - Parent preset ID
     */
    getChildPresets(presetId: string): StylePreset[] {
        return this.getAllPresets().filter((p) => p.extendsPresetId === presetId);
    }

    // ==========================================================================
    // Utility Methods
    // ==========================================================================

    /**
     * Get the full inheritance chain for a preset
     *
     * @param presetId - Starting preset ID
     * @returns Array of presets from base to target
     */
    getInheritanceChain(presetId: string): StylePreset[] {
        const chain: StylePreset[] = [];
        const visited = new Set<string>();
        let currentId: string | undefined = presetId;

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const preset = this.cache.get(currentId);

            if (preset) {
                chain.unshift(preset); // Add to beginning (base first)
                currentId = preset.extendsPresetId;
            } else {
                break;
            }
        }

        return chain;
    }

    /**
     * Subscribe to WebSocket updates from backend
     */
    private async subscribeToUpdates(): Promise<void> {
        try {
            // Use Home Assistant's subscription pattern
            // The DictStorageCollectionWebsocket provides subscribe command
            this.unsubscribe = await this.hass.connection.subscribeMessage(
                (message: StylePresetMessage) => {
                    // Update cache with changed preset
                    if (message.preset) {
                        this.cache.set(message.preset.id, message.preset);
                        this.notifySubscribers();
                    }
                },
                {
                    type: `${BASE_STYLE_PRESETS_PATH}/subscribe`,
                }
            );
        } catch (error) {
            console.warn('[StylePresetService] Failed to subscribe to updates:', error);
        }
    }

    /**
     * Notify all subscribers of changes
     */
    private notifySubscribers(): void {
        const presets = this.getAllPresets();
        for (const callback of this.subscribers) {
            try {
                callback(presets);
            } catch (error) {
                console.error('[StylePresetService] Subscriber error:', error);
            }
        }
    }
}
