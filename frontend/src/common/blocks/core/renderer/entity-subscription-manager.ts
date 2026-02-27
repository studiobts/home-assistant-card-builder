/**
 * Entity Subscription Manager
 *
 * Centralized manager for entity state subscriptions at the renderer level.
 * Prevents duplicate subscriptions and efficiently tracks entity changes
 * across all blocks in the canvas.
 */

import type { HomeAssistant } from 'custom-card-helpers';

// ============================================================================
// Types
// ============================================================================

/**
 * Callback type for entity state changes
 */
export type EntityChangeCallback = (
    entityId: string,
    newState: unknown,
    oldState: unknown
) => void;

// ============================================================================
// Entity Subscription Manager
// ============================================================================

/**
 * Centralized manager for entity state subscriptions
 * Prevents duplicate subscriptions and efficiently tracks entity changes
 */
export class EntitySubscriptionManager {
    /** Current HomeAssistant instance */
    private hass?: HomeAssistant;

    /** Map of entity ID to set of subscriber callbacks */
    private subscriptions = new Map<string, Set<EntityChangeCallback>>();

    /** Previous states cache for change detection */
    private previousStates = new Map<string, unknown>();

    // ==========================================================================
    // Public API
    // ==========================================================================

    /**
     * Update the HomeAssistant instance and check for state changes
     * Call this when hass property changes in the renderer
     *
     * @param hass - New HomeAssistant instance
     */
    setHass(hass: HomeAssistant): void {
        const oldHass = this.hass;
        this.hass = hass;

        if (!oldHass) {
            // First time - cache all subscribed entity states
            for (const entityId of this.subscriptions.keys()) {
                this.previousStates.set(entityId, hass.states[entityId]);
            }
            return;
        }

        // Check each subscribed entity for changes
        for (const entityId of this.subscriptions.keys()) {
            const oldState = this.previousStates.get(entityId);
            const newState = hass.states[entityId];

            if (oldState !== newState) {
                this.previousStates.set(entityId, newState);
                this.notifySubscribers(entityId, newState, oldState);
            }
        }
    }

    /**
     * Get the current HomeAssistant instance
     */
    getHass(): HomeAssistant | undefined {
        return this.hass;
    }

    /**
     * Subscribe to an entity's state changes
     *
     * @param entityId - Entity ID to watch
     * @param callback - Function called when entity state changes
     * @returns Unsubscribe function
     */
    subscribe(entityId: string, callback: EntityChangeCallback): () => void {
        if (!this.subscriptions.has(entityId)) {
            this.subscriptions.set(entityId, new Set());

            // Cache initial state if hass is available
            if (this.hass) {
                this.previousStates.set(entityId, this.hass.states[entityId]);
            }
        }

        this.subscriptions.get(entityId)!.add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscriptions.get(entityId);
            callbacks?.delete(callback);

            // Clean up if no more subscribers
            if (callbacks?.size === 0) {
                this.subscriptions.delete(entityId);
                this.previousStates.delete(entityId);
            }
        };
    }

    /**
     * Subscribe to multiple entities at once
     *
     * @param entityIds - Array of entity IDs to watch
     * @param callback - Function called when any entity state changes
     * @returns Unsubscribe function that removes all subscriptions
     */
    subscribeMultiple(
        entityIds: string[],
        callback: EntityChangeCallback
    ): () => void {
        const unsubscribers = entityIds.map((id) => this.subscribe(id, callback));

        return () => {
            unsubscribers.forEach((unsub) => unsub());
        };
    }

    /**
     * Check if an entity is currently subscribed
     *
     * @param entityId - Entity ID to check
     */
    isSubscribed(entityId: string): boolean {
        return this.subscriptions.has(entityId);
    }

    /**
     * Get all currently subscribed entity IDs
     * Useful for debugging
     */
    getSubscribedEntities(): string[] {
        return Array.from(this.subscriptions.keys());
    }

    /**
     * Get the number of subscribers for a specific entity
     *
     * @param entityId - Entity ID to check
     */
    getSubscriberCount(entityId: string): number {
        return this.subscriptions.get(entityId)?.size ?? 0;
    }

    /**
     * Get current state for an entity
     *
     * @param entityId - Entity ID
     * @returns Entity state or undefined
     */
    getEntityState(entityId: string): unknown {
        return this.hass?.states[entityId];
    }

    /**
     * Clear all subscriptions
     * Call on cleanup/destruction
     */
    clear(): void {
        this.subscriptions.clear();
        this.previousStates.clear();
    }

    // ==========================================================================
    // Private Methods
    // ==========================================================================

    /**
     * Notify all subscribers of an entity change
     */
    private notifySubscribers(
        entityId: string,
        newState: unknown,
        oldState: unknown
    ): void {
        const callbacks = this.subscriptions.get(entityId);
        if (!callbacks) return;

        for (const callback of callbacks) {
            try {
                callback(entityId, newState, oldState);
            } catch (error) {
                console.error(
                    `[EntitySubscriptionManager] Error in callback for ${entityId}:`,
                    error
                );
            }
        }
    }
}
