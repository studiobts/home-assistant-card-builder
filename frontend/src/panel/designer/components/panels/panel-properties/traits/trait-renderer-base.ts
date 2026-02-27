/**
 * Trait Renderer Base
 *
 * Classe base astratta per tutti i renderer di trait.
 */

import type { PropertyTrait, TraitPropertyValue } from '@/common/blocks/core/properties';
import { type TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';

import '@/panel/common/ui/property-editor/property-row';

/**
 * Callback per notificare il cambio di valore di una proprietà
 */
export type TraitChangeCallback = (name: string, value: unknown) => void;

/**
 * Classe base astratta per i renderer dei trait
 */
export abstract class TraitRendererBase<T extends PropertyTrait = PropertyTrait> {
    /**
     * Renderizza il trait
     *
     * @param trait - La configurazione del trait
     * @param value - Il valore corrente della proprietà
     * @param onChange - Callback per notificare il cambio di valore
     * @param context - Il contesto di rendering (hass, block, props)
     * @returns TemplateResult di Lit
     */
    abstract render(
        trait: T,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult;

    /**
     * Helper per creare il wrapper standard di una proprietà
     */
    protected renderPropertyRow(
        trait: PropertyTrait,
        content: TemplateResult,
        context: TraitRenderContext,
        options: { description?: string; resolvedValue?: unknown; propertyValue?: TraitPropertyValue, classes?: string[]} = {}
    ): TemplateResult {
        const {description, resolvedValue, propertyValue} = options;
        const classes = options.classes ? options.classes : [];

        if (!trait.binding) {
            return html`
                <div class="property-row ${classes.join(' ')}">
                  <label class="property-label" title="${description || ''}">${trait.label}</label>
                  ${content}
                </div>
            `;
        }

        const binding = propertyValue?.binding;

        return html`
            <property-row
                class="property-row ${classes.join(' ')}"
                .hass=${context.hass}
                .label=${trait.label}
                .property=${trait.name}
                .category=${'props'}
                .origin=${'default'}
                .hasLocalOverride=${false}
                .binding=${binding}
                .resolvedValue=${resolvedValue}
                .defaultEntityId=${context.defaultEntityId}
                .showBindingToggle=${true}
                .showAnimationToggle=${false}
                .showOriginBadge=${false}
                title=${description || ''}
            >
                ${content}
            </property-row>
            `;
    }

    protected getPropertyValue<T>(value: unknown, fallback: T): T {
        const propertyValue = this.getPropertyValueObject(value);
        if (!propertyValue) {
            return fallback;
        }
        return (propertyValue.value ?? fallback) as T;
    }

    protected getPropertyValueObject(value: unknown): TraitPropertyValue | undefined {
        if (!value || typeof value !== 'object') {
            return undefined;
        }

        const candidate = value as TraitPropertyValue;
        if ('value' in candidate || 'binding' in candidate) {
            return candidate;
        }

        return undefined;
    }

    /**
     * Helper per ottenere un valore con fallback
     */
    protected getValue<V>(value: unknown, defaultValue: V): V {
        if (value === undefined || value === null) {
            return defaultValue;
        }
        return value as V;
    }
}
