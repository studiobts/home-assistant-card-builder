/**
 * Textarea Trait Renderer
 */

import type { TextareaTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class TextareaTraitRenderer extends TraitRendererBase<TextareaTrait> {
    render(
        trait: TextareaTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const stringValue = this.getPropertyValue<string>(value, '');
        const templateError = context.templateErrors?.[trait.name];
        const showTemplateLegend = trait.templateKeywords && trait.templateKeywords.length > 0;

        return this.renderPropertyRow(
            trait,
            html`
        <textarea
          class="property-input"
          rows="${trait.rows || 3}"
          placeholder="${trait.placeholder || ''}"
          .value=${String(stringValue)}
          @input=${(e: Event) => {
                onChange(trait.name, (e.target as HTMLTextAreaElement).value);
            }}
        ></textarea>
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
        ${templateError ? html`<div class="template-error">${templateError}</div>` : ''}
      `,
            context,
            {description: trait.description, resolvedValue: stringValue, propertyValue}
        );
    }
}
