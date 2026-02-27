import { BaseEntity } from "@/common/blocks/components/entities/base-entity";
import { html } from 'lit';

/**
 * Property value with template support
 */
export interface TemplateValue {
    value: string;
    isTemplate: boolean;
}

/**
 * Attribute configuration
 */
export interface AttributeConfig {
    name: string;
    visible: boolean;
    label?: string;
    showLabel?: boolean;
}

/**
 * Base class for all entity field blocks
 * Provides entity binding, state updates, and template support.
 * Entity configuration is now handled via entityConfig in BlockData.
 */
export abstract class BaseEntityField extends BaseEntity {

    static styles = [
        ...BaseEntity.styles
    ];

    /**
     * Check if this field has a locked entity from parent
     */
    protected get hasLockedEntity(): boolean {
        // Entity is locked when inherited from parent
        return this.block?.entityConfig?.mode === 'inherited';
    }

    /**
     * Get attribute configuration list
     */
    protected getAttributeConfig(): AttributeConfig[] {
        const resolved = this.resolveRawValue(this.block?.props?.attributes, []);
        return Array.isArray(resolved) ? (resolved as AttributeConfig[]) : [];
    }

    /**
     * Check if a specific attribute should be visible
     */
    protected isAttributeVisible(attributeName: string): boolean {
        const config = this.getAttributeConfig();
        const attrConfig = config.find(attr => attr.name === attributeName);
        return attrConfig?.visible ?? false;
    }

    /**
     * Get visible attributes
     */
    protected getVisibleAttributes(): AttributeConfig[] {
        return this.getAttributeConfig().filter(attr => attr.visible);
    }

    /**
     * Get attribute label (custom or auto-generated from name)
     */
    protected getAttributeLabel(attributeName: string): string {
        const config = this.getAttributeConfig();
        const attrConfig = config.find(attr => attr.name === attributeName);

        if (attrConfig?.label) {
            return attrConfig.label;
        }

        // Auto-generate label: replace underscores with spaces and capitalize words
        return attributeName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Render a single attribute
     */
    protected renderAttribute(attributeName: string): any {
        const value = this.getEntityAttribute(attributeName);
        const label = this.getAttributeLabel(attributeName);
        const config = this.getAttributeConfig();
        const attrConfig = config.find(attr => attr.name === attributeName);
        const showLabel = attrConfig?.showLabel ?? true;

        return html`
      <div class="attribute-row">
        ${showLabel ? html`<span class="attribute-label">${label}</span>` : ''}
        <span class="attribute-value">${value !== undefined ? value : '—'}</span>
      </div>
    `;
    }

    /**
     * Render all visible attributes
     */
    protected renderAttributes(): any {
        const visibleAttributes = this.getVisibleAttributes();

        if (visibleAttributes.length === 0) {
            return html``;
        }

        return html`
      <div class="attributes-container">
        ${visibleAttributes.map(attr => this.renderAttribute(attr.name))}
      </div>
    `;
    }
}
