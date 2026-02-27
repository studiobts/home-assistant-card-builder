/**
 * Container Manager - Responsive breakpoints management
 *
 * Manages virtual containers with different sizes for responsive design.
 * Provides container definitions, ordering, and fallback logic.
 */

import { EventBus } from '@/common/core/event-bus';
import { createContext } from "@lit/context";

const DEFAULT_CONTAINER_ID = 'desktop';

export interface Container {
    id: string;
    name: string;
    width: number;
    order: number; // For sorting and fallback chain
    isDefault: boolean; // Default container, cannot be deleted
    /**
     * Indicates whether the container is a device container.
     * In this case the breakpoint is like a CSS media query.
     */
    isDevice: boolean;
    icon?: string;
    disabled?: boolean
}

export class ContainerManager extends EventBus {
    protected containers: Map<string, Container> = new Map();

    constructor(data: any = null) {
        super();

        // Set the default responsive container (no width constraint)
        // This is required for responsive design and fallbacks and can not be removed
        this.containers.set(DEFAULT_CONTAINER_ID, {id: DEFAULT_CONTAINER_ID, name: 'Desktop', width: 0, order: 1, isDefault: true, isDevice: true, icon: 'mdi:monitor'});

        // Initialize with default containers or provided ones
        const defaultContainers: Container[] = this.getDefaultContainers(data);

        defaultContainers.forEach(container => this.setContainer(container));
    }

    protected getDefaultContainers(_data: any): Container[] {
        return [
            {id: 'tablet', name: 'Tablet', width: 768, order: 2, isDefault: false, isDevice: true, icon: 'mdi:tablet', disabled: true},
            {id: 'mobile', name: 'Mobile', width: 480, order: 3, isDefault: false, isDevice: true, icon: 'mdi:cellphone', disabled: true},
        ];
    }

    /**
     * Get all containers sorted by order
     */
    getContainers(): Container[] {
        return Array.from(this.containers.values()).sort((a, b) => a.order - b.order);
    }

    /**
     * Get default container (no width constraint)
     */
    getDefaultContainer(): Container {
        return this.containers.get(DEFAULT_CONTAINER_ID)!;
    }

    getDefaultContainerId(): string {
        return DEFAULT_CONTAINER_ID;
    }

    /**
     * Get active container
     */
    getActiveContainer(): Container {
        return this.containers.get(DEFAULT_CONTAINER_ID)!;
    }

    getActiveContainerId(): string {
        return DEFAULT_CONTAINER_ID;
    }

    /**
     * Add or update a container
     */
    setContainer(container: Container): void {
        if (this.containers.has(container.id)) {
            throw new Error(`Container is already registered: ${container.id}`);
        }
        if (container.isDefault) {
            throw new Error(`Container ${container.id} can not be registered ad default container`);
        }

        this.containers.set(container.id, container);
        // FIXME: add event type
        this.dispatchEvent('containers-updated', {containers: this.getContainers()});
    }

    getFallbackChain(_id: string): Container[] {
        return [this.getDefaultContainer()]
    }
}

/**
 * Create a container manager instance
 */
export const containerManager = new ContainerManager();

export const containerManagerContext = createContext<ContainerManager>('container-manager');

