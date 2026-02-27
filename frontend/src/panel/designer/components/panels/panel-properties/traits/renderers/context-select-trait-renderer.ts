/**
 * Context Select Trait Renderer
 */

import type { ContextSelectTrait, SelectOption } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits";
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class ContextSelectTraitRenderer extends TraitRendererBase<ContextSelectTrait> {
    render(
        trait: ContextSelectTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const stringValue = this.getPropertyValue<string>(value, '');

        const resolvedOptions = this._resolveOptions(trait, context);
        const options = this._ensureCurrentOption(resolvedOptions, stringValue);
        const hasOptions = options.length > 0;
        const emptyLabel = trait.emptyLabel ?? 'No options available';

        return this.renderPropertyRow(
            trait,
            html`
                <select
                    class="property-input"
                    .value=${String(stringValue)}
                    ?disabled=${!hasOptions}
                    @change=${(e: Event) => {
                        onChange(trait.name, (e.target as HTMLSelectElement).value);
                    }}
                >
                    ${hasOptions
                        ? options.map(option => html`
                            <option value="${option.value}" ?selected=${stringValue === option.value}>
                                ${option.label}
                            </option>
                        `)
                        : html`<option value="">${emptyLabel}</option>`
                    }
                </select>
            `,
            context,
            {description: trait.description, resolvedValue: stringValue, propertyValue}
        );
    }

    private _resolveOptions(trait: ContextSelectTrait, context: TraitRenderContext): SelectOption[] {
        if (typeof trait.optionsProvider === 'function') {
            const result = trait.optionsProvider(context);
            if (Array.isArray(result)) {
                return result;
            }
        }
        return trait.options ?? [];
    }

    private _ensureCurrentOption(options: SelectOption[], currentValue: string): SelectOption[] {
        if (!currentValue) return options;
        if (options.some(option => option.value === currentValue)) {
            return options;
        }
        return [{value: currentValue, label: currentValue}, ...options];
    }
}
