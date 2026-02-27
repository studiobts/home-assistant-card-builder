import type { PropertyTrait } from "@/common/blocks/core/properties";
import { stateIcon } from "custom-card-helpers";
import { css } from 'lit';
import { BlockBase } from '@/common/blocks/components/block-base';
import { type DateFormatType, type FormatValueContext, formatValue } from '@/common/blocks/utils';
import { buildEntityTemplateVariables, DEFAULT_ENTITY_TEMPLATE_KEYWORDS } from '@/common/core/template/ha-template-service';

export const PROPS_FORMATTING: PropertyTrait[] = [
    {
        type: 'select',
        name: 'format',
        label: 'Format',
        options: [
            {value: 'text', label: 'Text'},
            {value: 'numeric', label: 'Numeric'},
            {value: 'integer', label: 'Integer'},
            {value: 'date', label: 'Date/Time'},
            {value: 'boolean', label: 'Boolean'},
            {value: 'template', label: 'Template'}
        ]
    },
    {
        type: 'number',
        name: 'precision',
        label: 'Precision',
        min: 0,
        max: 10,
        visible: {
            prop: 'format',
            in: ['numeric', 'integer']
        }
    },
    {
        type: 'select',
        name: 'dateFormat',
        label: 'Date Format',
        options: [
            {value: 'full', label: 'Full (Feb 12, 2026, 3:45 PM)'},
            {value: 'long', label: 'Long (February 12, 2026)'},
            {value: 'medium', label: 'Medium (Feb 12, 2026)'},
            {value: 'short', label: 'Short (2/12/26)'},
            {value: 'time', label: 'Time Only (3:45 PM)'},
            {value: 'datetime', label: 'Date & Time (2/12/26, 3:45 PM)'},
            {value: 'relative', label: 'Time Ago (5 minutes ago)'},
            {value: 'iso', label: 'ISO 8601 (2026-02-12T15:45:00)'}
        ],
        visible: {
            prop: 'format',
            eq: 'date'
        }
    },
    {
        type: 'textarea',
        name: 'formatTemplate',
        label: 'Format Template',
        placeholder: 'e.g., {{ value | round(2) }} units',
        rows: 3,
        templateKeywords: DEFAULT_ENTITY_TEMPLATE_KEYWORDS,
        visible: {
            prop: 'format',
            eq: 'template'
        }
    },
]

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
 * Base class for all entity reactive blocks
 * Provides entity binding, state updates, and helpers for reactive blocks
 */
export abstract class BaseEntity extends BlockBase {
    static styles = [
        ...BlockBase.styles,
        css`
      .no-entity {
        color: var(--warning-color, #ff9800);
        font-size: 14px;
        padding: 8px;
        text-align: center;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      }
    `,
    ];

    /**
     * Get entity attribute value
     * Handles special attributes: last_changed, last_updated
     */
    protected getEntityAttribute(attributeName: string): any {
        const state = this.getEntityState();
        if (!state) return undefined;

        // Handle special attributes that are in the state object but not in attributes
        if (attributeName === 'last_changed') {
            return state.last_changed;
        }
        if (attributeName === 'last_updated') {
            return state.last_updated;
        }

        // Regular attributes
        return state.attributes?.[attributeName];
    }

    /**
     * Get entity icon (from attributes or fallback)
     */
    protected getEntityIcon(fallback?: string): string | undefined {
        const state = this.getEntityState();
        if (!state) return fallback;

        return stateIcon(state);
    }

    /**
     * Get entity friendly name
     */
    protected getEntityName(): string {
        return this.getEntityAttribute('friendly_name') || this.entity || 'Unknown';
    }

    /**
     * Get entity domain (e.g., 'sensor', 'binary_sensor')
     */
    protected getEntityDomain(): string | null {
        if (!this.entity) return null;
        return this.entity.split('.')[0];
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
     * Format value based on format type
     */
    protected formatValue(value: string): string {
        const format = this.resolveProperty('format', 'text');

        if (format === 'template') {
            const template = this.resolveProperty('formatTemplate', '');
            if (!template) return '';

            const variables = this.getTemplateVariables(value);
            return this.resolveTemplateString('formatTemplate', template, variables);
        }

        const context: FormatValueContext = {
            format,
            precision: this.resolvePropertyAsNumber('precision', 1),
            dateFormat: this.resolveProperty('dateFormat', 'full') as DateFormatType,
        };

        return formatValue(value, context, '');
    }

    /**
     * Build template variables for current entity context
     */
    protected getTemplateVariables(
        valueOverride?: unknown,
        extra?: Record<string, unknown>
    ): Record<string, unknown> {
        const state = this.getEntityState();
        const variables = buildEntityTemplateVariables(state as any, valueOverride);

        if (extra && Object.keys(extra).length > 0) {
            Object.assign(variables, extra);
        }

        return variables;
    }
}
