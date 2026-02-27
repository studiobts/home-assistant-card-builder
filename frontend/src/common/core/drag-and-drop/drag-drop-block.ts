import type { DragDropManager } from "./drag-drop-manager";
import type { DropElement } from "./types";
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item";
import { consume, createContext } from "@lit/context";
import { LitElement, type PropertyValues } from 'lit';
import { property } from "lit/decorators.js";

export const dragDropManagerContext = createContext<DragDropManager>('drag-drop-manager');

export abstract class DragDropBlock extends LitElement implements DropElement {
    @property({type: String, attribute: 'block-id'})
    blockId = '';
    @property({type: String, attribute: 'canvas-id'})
    canvasId = '';
    /**
     * DragDropManager instance.
     * If not set, the block is not rendered inside a canvas and not needed for drag and drop.
     */
    @consume({context: dragDropManagerContext})
    protected readonly dragDropManager?: DragDropManager;
    /** Whether this component has already registered */
    private _registered = false;

    /** Track if block was disconnected (moved in DOM) */
    private _wasDisconnected = false;

    public get dropId(): string {
        return this.blockId;
    }

    public get dropElement(): HTMLElement {
        return this;
    }

    public get blockType(): string {
        return this.tagName.toLowerCase();
    }

    public get isBlockDraggable(): boolean {
        return true;
    }

    public get isBlockDroppable(): boolean {
        return true;
    }

    public get isBlockContainer(): boolean {
        return false;
    }

    public shouldShowDropIndicator(): boolean {
        return true;
    }

    public get blockTypesAcceptedAsChildren(): string[] | null {
        return null;
    }

    connectedCallback() {
        super.connectedCallback();

        if (!this.dragDropManager) {
            return;
        }
    }

    disconnectedCallback() {
        if (this.dragDropManager) {
            this._wasDisconnected = true;
            this._unregisterFromManager();
        }

        super.disconnectedCallback();
    }

    updated(changedProperties: PropertyValues) {
        if (!this.dragDropManager) {
            return;
        }

        // Check if we need to register or re-register
        const hasRequiredProps = this.blockId && this.canvasId;
        const propsChanged = changedProperties.has('blockId') || changedProperties.has('canvasId');

        // Register if:
        // 1. Not registered yet, OR
        // 2. Key properties changed (requires re-registration), OR
        // 3. Block was disconnected and reconnected (DOM move)
        const needsReregistration = !this._registered || propsChanged || this._wasDisconnected;

        if (hasRequiredProps && needsReregistration) {
            // Reset flags
            if ((propsChanged || this._wasDisconnected) && this._registered) {
                this._registered = false;
            }
            this._wasDisconnected = false;
            this._registerWithManager();
        }
    }

    public getBlockedDropInstructions(): Instruction['operation'][] | null {
        return null;
    };

    /**
     * Register this block with the DragDropManager
     * Protected to allow subclasses to override capabilities
     */
    protected _registerWithManager(): void {
        // Call manager directly instead of dispatching event
        this.dragDropManager!.registerBlock(this);

        this._registered = true;
        console.log('[DragDropBlock] Registered block:', this.blockId);
    }

    /**
     * Unregister this block from the DragDropManager
     */
    private _unregisterFromManager(): void {
        if (!this._registered || !this.blockId) {
            return;
        }

        // Call manager directly instead of dispatching event
        this.dragDropManager!.unregisterBlock(this);

        this._registered = false;
        console.log('[DragDropBlock] Unregistered block:', this.blockId);
    }
}
