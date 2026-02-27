/**
 * Transfer Manager
 *
 * Manages cross-canvas block transfers and ownership tracking.
 */

import type { TransferRule } from '../types';

export class TransferManager {
    private transferRules: TransferRule[] = [];
    private blockOwnership = new Map<string, string>(); // blockId -> canvasId

    /**
     * Set transfer rules
     */
    setRules(rules: TransferRule[]): void {
        this.transferRules = rules;
    }

    /**
     * Get current transfer rules
     */
    getRules(): TransferRule[] {
        return this.transferRules;
    }

    /**
     * Check if transfer is allowed between canvases
     */
    canTransfer(
        sourceCanvasId: string,
        targetCanvasId: string,
        blockType: string
    ): boolean {
        // Same canvas is always allowed
        if (sourceCanvasId === targetCanvasId) {
            return true;
        }

        // If no rules defined, allow all transfers
        if (this.transferRules.length === 0) {
            return true;
        }

        // Check for matching rule
        for (const rule of this.transferRules) {
            const isDirectMatch =
                rule.sourceCanvasId === sourceCanvasId &&
                rule.targetCanvasId === targetCanvasId;

            const isReverseMatch =
                rule.bidirectional &&
                rule.sourceCanvasId === targetCanvasId &&
                rule.targetCanvasId === sourceCanvasId;

            if (isDirectMatch || isReverseMatch) {
                // Check block type if specified
                if (rule.allowedBlockTypes && rule.allowedBlockTypes.length > 0) {
                    return rule.allowedBlockTypes.includes(blockType);
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Track which canvas owns a block
     */
    trackBlock(blockId: string, canvasId: string): void {
        this.blockOwnership.set(blockId, canvasId);
    }

    /**
     * Stop tracking a block
     */
    untrackBlock(blockId: string): void {
        this.blockOwnership.delete(blockId);
    }

    /**
     * Get the canvas that owns a block
     */
    getBlockCanvas(blockId: string): string | undefined {
        return this.blockOwnership.get(blockId);
    }

    /**
     * Cleanup
     */
    destroy(): void {
        this.transferRules = [];
        this.blockOwnership.clear();
    }
}

