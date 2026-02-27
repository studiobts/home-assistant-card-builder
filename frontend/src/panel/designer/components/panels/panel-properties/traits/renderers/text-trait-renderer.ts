/**
 * Text Trait Renderer
 */

import type { TextTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class TextTraitRenderer extends TraitRendererBase<TextTrait> {
    render(
        trait: TextTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const stringValue = this.getPropertyValue<string>(value, '');

        // Check if value is a template object
        const isTemplateObject = typeof stringValue === 'object' && stringValue !== null && 'isTemplate' in stringValue;
        const actualValue = isTemplateObject ? (stringValue as any).value : stringValue;
        const templateError = context.templateErrors?.[trait.name];
        const showTemplateLegend = trait.templateKeywords && trait.templateKeywords.length > 0;

        return this.renderPropertyRow(
            trait,
            html`
                <input
                        type="text"
                        class="property-input"
                        .value=${String(actualValue)}
                        placeholder="${trait.placeholder || ''}"
                        @input=${(e: Event) => {
                            onChange(trait.name, (e.target as HTMLInputElement).value);
                        }}
                />
                ${showTemplateLegend ? html`
                    <div class="template-legend">
                        ${trait.templateKeywords!.map((keyword) => html`
                            <div class="template-legend-row">
                                <code>{{${keyword.key}}}</code>
                                <span>${keyword.description}</span>
                            </div>
                        `)}
                    </div>
                ` : ''}
                ${templateError ? html`
                    <div class="template-error">${templateError}</div>` : ''}
            `,
            context,
            {description: trait.description, resolvedValue: actualValue, propertyValue}
        );
    }
}
