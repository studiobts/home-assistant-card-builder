/**
 * Slider Trait Renderer
 */

import type { SliderTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from '@/panel/designer/components/panels/panel-properties/traits';
import { html, type TemplateResult } from 'lit';
import { type TraitChangeCallback, TraitRendererBase } from '../trait-renderer-base';

export class SliderTraitRenderer extends TraitRendererBase<SliderTrait> {
    render(
        trait: SliderTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        const propertyValue = this.getPropertyValueObject(value);
        const numValue = this.clampValue(trait, this.getPropertyValue<number>(value, trait.min));
        const inputStep = this.getInputStep(trait);
        const displayStep = this.getDisplayStep(trait, numValue);
        const displayValue = this.formatValue(displayStep, numValue);

        return this.renderPropertyRow(
            trait,
            html`
                <div class="slider-row">
                    <input
                        type="range"
                        class="property-input property-input-slider"
                        .value=${String(numValue)}
                        min="${trait.min}"
                        max="${trait.max}"
                        step="${inputStep}"
                        @input=${(e: Event) => {
                            const inputValue = (e.target as HTMLInputElement).value;
                            const normalized = this.normalizeInput(trait, inputValue);
                            onChange(trait.name, normalized);
                        }}
                    />
                    <div class="slider-value">${displayValue}</div>
                </div>
            `,
            context,
            {description: trait.description, resolvedValue: numValue, propertyValue}
        );
    }

    private getInputStep(trait: SliderTrait): number {
        if (trait.stepMode === 'adaptive') {
            return 0.1;
        }
        return trait.step ?? 1;
    }

    private getDisplayStep(trait: SliderTrait, currentValue: number): number {
        if (trait.stepMode === 'adaptive') {
            return currentValue < 1 ? 0.1 : 1;
        }
        return trait.step ?? 1;
    }

    private normalizeInput(trait: SliderTrait, inputValue: string): number {
        const numeric = parseFloat(inputValue);
        if (Number.isNaN(numeric)) return trait.min;

        let step = trait.step ?? 1;
        if (trait.stepMode === 'adaptive') {
            step = numeric < 1 ? 0.1 : 1;
        }

        let normalized = numeric;
        if (step > 0) {
            normalized = Math.round(numeric / step) * step;
            if (step === 0.1) {
                normalized = parseFloat(normalized.toFixed(1));
            } else {
                normalized = Math.round(normalized);
            }
        }

        if (trait.min !== undefined) normalized = Math.max(trait.min, normalized);
        if (trait.max !== undefined) normalized = Math.min(trait.max, normalized);

        return normalized;
    }

    private clampValue(trait: SliderTrait, value: number): number {
        let normalized = Number.isFinite(value) ? value : trait.min;
        if (trait.min !== undefined) normalized = Math.max(trait.min, normalized);
        if (trait.max !== undefined) normalized = Math.min(trait.max, normalized);
        return normalized;
    }

    private formatValue(step: number, value: number): string {
        if (step < 1) return value.toFixed(1);
        return String(Math.round(value));
    }
}
