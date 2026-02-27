/**
 * Attribute Picker Trait Renderer
 *
 * Renderizza un selettore di attributi entity con opzione "Custom..."
 * Simile all'implementazione nel property-binding-editor
 */

import type { AttributePickerTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, nothing, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class AttributePickerTraitRenderer extends TraitRendererBase<AttributePickerTrait> {
    render(
        trait: AttributePickerTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const attributeName = this.getPropertyValue<string>(value, '');

        // Use document model to resolve entity for this block
        const resolvedEntity = context.documentModel?.resolveEntityForBlock(context.block.id);
        const entityId = resolvedEntity?.entityId;

        // Get available attributes from entity state
        let availableAttributes: string[] = [];
        if (entityId && context.hass?.states?.[entityId]) {
            const entityState = context.hass.states[entityId];
            const entityAttributes = Object.keys(entityState.attributes || {}).sort();

            // Add special attributes that are in the state object but not in attributes
            availableAttributes = [
                'last_changed',
                'last_updated',
                ...entityAttributes
            ];
        }

        // Determine if we're showing custom input
        const isCustomAttribute =
            availableAttributes.length > 0 &&
            attributeName !== '' &&
            !availableAttributes.includes(attributeName);

        const attributeSelectValue = isCustomAttribute ? '__custom__' : attributeName;

        return this.renderPropertyRow(
            trait,
            html`
                ${availableAttributes.length === 0 ? html`
                    <!-- No attributes available - show text input -->
                    <input
                        type="text"
                        class="property-input"
                        .value=${attributeName}
                        @input=${(e: Event) => {onChange(trait.name, (e.target as HTMLInputElement).value)}}
                        placeholder=${trait.placeholder || 'Enter attribute name'}
                    />
                    ${entityId ? html`
                        <div class="info-text" style="margin-top: 4px;">
                            This entity has no attributes
                        </div>
                    ` : html`
                        <div class="info-text" style="margin-top: 4px;">
                            No entity configured - enter attribute name manually
                        </div>
                    `}
                ` : html`
                    <!-- Attributes available - show dropdown with custom option -->
                    <select
                        class="property-input"
                        .value=${attributeSelectValue}
                        @change=${(e: Event) => {
                            const selectValue = (e.target as HTMLSelectElement).value;
                            if (selectValue === '__custom__') {
                                // Switch to custom mode
                                if (!isCustomAttribute) {
                                    // Set a default custom attribute name
                                    onChange(trait.name, 'custom_attribute');
                                }
                                // If already custom, keep the current value
                            } else {
                                onChange(trait.name, selectValue);
                            }
                        }}
                    >
                        ${attributeName === '' ? html`
                            <option value="">Select attribute...</option>
                        ` : nothing}
                        ${availableAttributes.map(attr => html`
                            <option value=${attr} ?selected=${attributeName === attr}>
                                ${attr}
                            </option>
                        `)}
                        <option value="__custom__" ?selected=${isCustomAttribute}>
                            Custom...
                        </option>
                    </select>
                    ${isCustomAttribute ? html`
                        <input
                            type="text"
                            class="property-input"
                            style="margin-top: 8px;"
                            .value=${attributeName}
                            @input=${(e: Event) => {onChange(trait.name, (e.target as HTMLInputElement).value)}}
                            placeholder=${trait.placeholder || 'Enter attribute name'}
                        />
                    ` : nothing}
                `}
            `,
            context,
            {description: trait.description, resolvedValue: attributeName, propertyValue}
        );
    }
}



