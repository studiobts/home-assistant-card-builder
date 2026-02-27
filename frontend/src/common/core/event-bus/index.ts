/**
 * EventBus - Simple event emitter manager
 *
 * Provides a pub/sub pattern for component communication.
 */
import { createContext } from "@lit/context";

export type EventCallback<T = any> = (data: T) => void;

export const eventBusContext = createContext<EventBus>('event-bus');

/**
 * Simple event bus implementation
 */
export class EventBus {
    private listeners: Map<string, Set<EventCallback>> = new Map();

    /**
     * Subscribe to an event
     */
    addEventListener<T = any>(event: string, callback: EventCallback<T>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(callback);

        // Return unsubscribe function
        return () => this.removeEventListener(event, callback);
    }

    /**
     * Unsubscribe from an event
     */
    removeEventListener(event: string, callback: EventCallback): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Emit an event
     */
    dispatchEvent<T = any>(event: string, data?: T): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            });
        }
    }

    /**
     * Remove all listeners for an event or all events
     */
    removeAllListeners(event?: string): void {
        event ?
            this.listeners.delete(event) :
            this.listeners.clear();
    }

    /**
     * Get listener count for an event
     */
    listenerCount(event: string): number {
        return this.listeners.get(event)?.size || 0;
    }

    /**
     * Check if the event has listeners
     */
    hasListeners(event: string): boolean {
        return this.listenerCount(event) > 0;
    }
}

