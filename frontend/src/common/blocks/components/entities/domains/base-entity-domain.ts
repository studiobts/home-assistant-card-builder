import { BaseEntity } from '@/common/blocks/components/entities/base-entity';
import type { AttributeConfig } from '@/common/blocks/components/entities/fields/base-entity-field';
import { BlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import type { BlockData } from '@/common/core/model/types';
import type { Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item";
import { consume } from "@lit/context";
import { css, html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from "lit/directives/repeat.js";

/**
 * Base class for all domain blocks
 *
 * Domain blocks provide a pre-configured entity presentation with:
 * - A drop-zone for user customization
 * - A grid layout with entity field blocks for common entity properties
 * - Automatic entity forwarding to child fields
 * - Attribute visibility management
 */
export abstract class BaseEntityDomain extends BaseEntity {
    static styles = [
        ...BaseEntity.styles,
        css`
      .domain-container {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
    `,
    ];
    @consume({context: blockRegistryContext})
    blockRegistry!: BlockRegistry;
    /**
     * Entity ID to display - forwarded to all child fields
     */
    @property({type: String})
    entity?: string;

    /**
     * Update entity prop when block changes
     */
    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        if (changedProps.has('block')) {
            // Ensure structure exists
            this._ensureDomainStructure();

            // Forward entity to all descendant primitives
            this._forwardEntityToPrimitives();

            // Update primitive visibility based on props
            this._updatePrimitiveVisibility();
        }
    }

    /**
     * Render the domain block
     */
    render() {
        const children = this.block?.children || [];

        if (children.length === 0) {
            return html`
        <div class="domain-container">
          <div class="no-entity">Setting up domain block...</div>
        </div>
      `;
        }

        // Render the drop-zone (which contains the grid)
        const childBlocks: BlockData[] = children
            .map((child) => this.documentModel.getBlock(child as string))
            .filter((block): block is BlockData => !!block);

        return html`
      <div class="domain-container">
        ${repeat(childBlocks, (block) => block.id, (block) => this.renderer!.renderBlock(block))}
      </div>
    `;
    }

    /**
     * Domain blocks combine their children
     */
    public getBlockedDropInstructions(): Instruction['operation'][] | null {
        return ['combine'];
    }

    /**
     * Get the default grid configuration for this domain
     * Override in subclasses to customize layout
     */
    protected abstract getDefaultGridConfig(): any;

    /**
     * Get the entity field blocks to create by default
     * Returns array of { type: string, props: any, gridArea?: string }
     */
    protected abstract getDefaultPrimitives(): Array<{
        type: string;
        props: any;
        gridArea?: string;
    }>;

    /**
     * Get attribute configuration list
     */
    protected getAttributeConfig(): AttributeConfig[] {
        const resolved = this.resolveRawValue(this.block?.props?.attributes, []);
        return Array.isArray(resolved) ? (resolved as AttributeConfig[]) : [];
    }

    /**
     * Update attribute configuration
     */
    protected updateAttributeConfig(attributes: AttributeConfig[]): void {
        if (!this.block) return;
        this.documentModel.updateBlock(this.block.id, {
            props: {attributes}
        });
    }

    /**
     * Ensure the domain block has the required structure:
     * - One drop-zone child
     * - One grid child inside the drop-zone
     * - Primitive blocks inside the grid
     */
    private _ensureDomainStructure(): void {
        if (!this.block) return;

        const children = this.block.children || [];

        // Check if we already have the structure
        if (children.length > 0) {
            this._forwardEntityToPrimitives();
            return;
        }

        // Create drop-zone
        const dropZone = this.documentModel.createBlock('block-drop-zone', this.block.id, this.blockRegistry.getDefaults('block-drop-zone'));

        // Create grid inside drop-zone
        const gridConfig = this.getDefaultGridConfig();
        const grid = this.documentModel.createBlock('block-grid', dropZone.id, this.blockRegistry.getDefaults('block-grid'), {
            props: {
                gridConfig,
            },
        });

        // Wait for grid to create its drop-zones, then add primitives
        requestAnimationFrame(() => {
            this._createDefaultPrimitives(grid.id);
        });
    }

    /**
     * Create the default primitive blocks in the grid
     */
    private _createDefaultPrimitives(gridId: string): void {
        const primitives = this.getDefaultPrimitives();
        const grid = this.documentModel.getBlock(gridId);

        if (!grid) return;

        const gridDropZones = grid.children as string[];

        // Create primitives in their designated areas
        primitives.forEach((primitive) => {
            // Find the drop-zone for this grid area
            const targetZone = gridDropZones.find((zoneId) => {
                const zone = this.documentModel.getBlock(zoneId as string);
                return zone?.props?.gridArea === primitive.gridArea;
            });

            if (targetZone) {
                // Check visibility flag (e.g., showIcon, showState, showName)
                const visibilityKey = this._getVisibilityKeyForPrimitive(primitive.type);
                // Create primitive with fixed entity and non-deletable flag
                this.documentModel.createBlock(primitive.type, targetZone, this.blockRegistry.getDefaults(primitive.type), {
                    props: {
                        ...primitive.props,
                        entity: this.entity,
                        entityMode: 'fixed',
                        lockedEntity: this.entity, // Mark as having locked entity from parent
                        _primitiveKey: visibilityKey, // Store the visibility key for updates
                    },
                });
            }
        });
    }

    /**
     * Get the visibility property key for a primitive type
     */
    private _getVisibilityKeyForPrimitive(primitiveType: string): string | null {
        const mapping: Record<string, string> = {
            'block-entity-field-icon': 'showIcon',
            'block-entity-field-state': 'showState',
            'block-entity-field-name': 'showName',
            'block-entity-field-image': 'showImage',
        };
        return mapping[primitiveType] || null;
    }

    /**
     * Update visibility of primitive blocks based on props
     */
    private _updatePrimitiveVisibility(): void {
        if (!this.block) return;

        const descendants = this._getAllDescendants(this.block);

        descendants.forEach((descendantId) => {
            const descendant = this.documentModel.getBlock(descendantId);
            if (!descendant || !descendant.parentManaged) return;

            const visibilityKey = descendant.props._primitiveKey as string;
            if (!visibilityKey) return;

            const isVisible = this.resolvePropertyAsBoolean(visibilityKey);

            // Update element display
            const descendantElement = this.documentModel.getElement(descendant);
            if (descendantElement) {
                descendantElement.style.display = isVisible ? '' : 'none';
            }
        });
    }

    /**
     * Forward entity to all descendant primitive blocks
     */
    private _forwardEntityToPrimitives(): void {
        if (!this.block || !this.entity) return;

        const descendants = this._getAllDescendants(this.block);

        descendants.forEach((descendantId) => {
            const descendant = this.documentModel.getBlock(descendantId);
            if (!descendant) return;

            // Check if this is a primitive block (has lockedEntity prop)
            if (descendant.parentManaged) {
                this.documentModel.updateBlock(descendantId, {
                    props: {
                        entity: this.entity,
                        lockedEntity: this.entity,
                    }
                });
            }
        });
    }

    /**
     * Get all descendant block IDs recursively
     */
    private _getAllDescendants(block: BlockData): string[] {
        const descendants: string[] = [];
        const children = block.children || [];

        children.forEach((childId) => {
            descendants.push(childId as string);
            const child = this.documentModel.getBlock(childId as string);
            if (child) {
                descendants.push(...this._getAllDescendants(child));
            }
        });

        return descendants;
    }
}
