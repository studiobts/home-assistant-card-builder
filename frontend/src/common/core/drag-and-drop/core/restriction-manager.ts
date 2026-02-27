import {
    type DraggablePayloadData,
    type RestrictionCheckResult,
    type RestrictionConfig,
    RestrictionReason,
    type TransferRule
} from '../types';

/**
 * Restriction Manager
 *
 * Manages restrictions for drag-and-drop operations using firewall-like logic.
 * Default behavior is allow-all; restrictions are opt-in.
 */
export class RestrictionManager {
    private sourceAllowlist = new Map<string, Set<string>>();
    private blockTypeRestrictions = new Map<string, Set<string>>();
    private containerAcceptance = new Map<string, Set<string>>();
    private boundBlocks = new Set<string>();
    private transferRules: TransferRule[] = [];

    /**
     * Update restriction configuration
     */
    setRestrictions(config: Partial<RestrictionConfig>): void {
        if (config.sourceAllowlist) {
            this.sourceAllowlist = config.sourceAllowlist;
        }
        if (config.blockTypeRestrictions) {
            this.blockTypeRestrictions = config.blockTypeRestrictions;
        }
        if (config.containerAcceptance) {
            this.containerAcceptance = config.containerAcceptance;
        }
        if (config.boundBlocks) {
            this.boundBlocks = config.boundBlocks;
        }
    }

    /**
     * Set cross-canvas transfer rules
     */
    setTransferRules(rules: TransferRule[]): void {
        this.transferRules = rules;
    }

    /**
     * Check if a block can start being dragged
     */
    canStartDrag(_payload: DraggablePayloadData, blockId?: string): RestrictionCheckResult {
        // Check if block is bound and cannot be moved
        if (blockId && this.boundBlocks.has(blockId)) {
            return {
                allowed: false,
                reason: RestrictionReason.BOUND_BLOCK_LOCKED,
                message: 'This block is locked and cannot be moved',
            };
        }

        // Default: allow
        return {allowed: true};
    }

    /**
     * Check if a block can be dropped in a canvas
     */
    canDropInCanvas(payload: DraggablePayloadData, canvas: string): RestrictionCheckResult {
        // Check source allowed list
        if (this.sourceAllowlist.has(canvas)) {
            const allowedSources = this.sourceAllowlist.get(canvas)!;
            if (!allowedSources.has(payload.sourceId)) {
                return {
                    allowed: false,
                    reason: RestrictionReason.SOURCE_NOT_ALLOWED,
                    message: `Blocks from this source cannot be dropped in this canvas`,
                };
            }
        }

        // Check block type restrictions
        if (this.blockTypeRestrictions.has(canvas)) {
            const allowedTypes = this.blockTypeRestrictions.get(canvas)!;
            if (!allowedTypes.has(payload.blockType)) {
                return {
                    allowed: false,
                    reason: RestrictionReason.BLOCK_TYPE_NOT_ALLOWED,
                    message: `This block type is not allowed in this canvas`,
                };
            }
        }

        // Default: allow
        return {allowed: true};
    }

    /**
     * Check if a block can be nested in a container
     */
    canNestInContainer(payload: DraggablePayloadData, containerType: string, acceptedTypes: string[] | null = null):
        RestrictionCheckResult {
        // First check canvas-level restrictions
        // (This will be called after canDropInCanvas, but we check again for safety)

        // Check container's accept list
        if (acceptedTypes && acceptedTypes.length > 0) {
            if (!acceptedTypes.includes(payload.blockType)) {
                return {
                    allowed: false,
                    reason: RestrictionReason.CONTAINER_REFUSES,
                    message: `This container does not accept this block type`,
                };
            }
        }

        // Check global container acceptance rules
        if (this.containerAcceptance.has(containerType)) {
            const allowedTypes = this.containerAcceptance.get(containerType)!;
            if (!allowedTypes.has(payload.blockType)) {
                return {
                    allowed: false,
                    reason: RestrictionReason.CONTAINER_REFUSES,
                    message: `This container type does not accept this block`,
                };
            }
        }

        // Default: allow
        return {allowed: true};
    }

    /**
     * Check if a block can be transferred between canvases
     */
    canTransferBetweenCanvases(payload: DraggablePayloadData, sourceCanvasId: string, targetCanvasId: string):
        RestrictionCheckResult {
        // Same canvas is always allowed (reordering)
        if (sourceCanvasId === targetCanvasId) {
            return {allowed: true};
        }

        // If no transfer rules defined, allow all transfers
        if (this.transferRules.length === 0) {
            return {allowed: true};
        }

        // Check if there's a matching transfer rule
        for (const rule of this.transferRules) {
            const isDirectMatch =
                rule.sourceCanvasId === sourceCanvasId &&
                rule.targetCanvasId === targetCanvasId;

            const isReverseMatch =
                rule.bidirectional &&
                rule.sourceCanvasId === targetCanvasId &&
                rule.targetCanvasId === sourceCanvasId;

            if (isDirectMatch || isReverseMatch) {
                // Check block type if rule specifies allowed types
                if (rule.allowedBlockTypes && rule.allowedBlockTypes.length > 0) {
                    if (!rule.allowedBlockTypes.includes(payload.blockType)) {
                        return {
                            allowed: false,
                            reason: RestrictionReason.TRANSFER_NOT_ALLOWED,
                            message: `This block type cannot be transferred between these canvases`,
                        };
                    }
                }
                // Rule matches and block type is allowed
                return {allowed: true};
            }
        }

        // No matching rule found
        return {
            allowed: false,
            reason: RestrictionReason.TRANSFER_NOT_ALLOWED,
            message: `Transfer between these canvases is not allowed`,
        };
    }

    /**
     * Mark a block as bound (cannot be moved)
     */
    addBoundBlock(blockId: string): void {
        this.boundBlocks.add(blockId);
    }

    /**
     * Unmark a block as bound
     */
    removeBoundBlock(blockId: string): void {
        this.boundBlocks.delete(blockId);
    }
}

