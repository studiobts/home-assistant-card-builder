/**
 * Trait Renderer Factory
 *
 * Factory per ottenere il renderer appropriato per ogni tipo di trait.
 */

import type { PropertyTrait } from '@/common/blocks/core/properties';
import type { TraitRenderContext } from "@/panel/designer/components/panels/panel-properties/traits/types";
import { html, type TemplateResult } from 'lit';
import { ActionTraitRenderer } from './renderers/action-trait-renderer';
import { AttributePickerTraitRenderer } from './renderers/attribute-picker-trait-renderer';
import { CheckboxTraitRenderer } from './renderers/checkbox-trait-renderer';
import { ColorTraitRenderer } from './renderers/color-trait-renderer';
import { ContextSelectTraitRenderer } from './renderers/context-select-trait-renderer';
import { EntityModeTraitRenderer } from './renderers/entity-mode-trait-renderer';
import { EntityPickerTraitRenderer } from './renderers/entity-picker-trait-renderer';
import { IconPickerTraitRenderer } from './renderers/icon-picker-trait-renderer';
import { InfoTraitRenderer } from './renderers/info-trait-renderer';
import { MediaPickerTraitRenderer } from './renderers/media-picker-trait-renderer';
import { NumberTraitRenderer } from './renderers/number-trait-renderer';
import { SelectTraitRenderer } from './renderers/select-trait-renderer';

// Import renderers
import { TextTraitRenderer } from './renderers/text-trait-renderer';
import { TextareaTraitRenderer } from './renderers/textarea-trait-renderer';
import { type TraitChangeCallback, TraitRendererBase } from './trait-renderer-base';

/**
 * Factory per i renderer dei trait
 */
export class TraitRendererFactory {
    private static renderers: Map<string, TraitRendererBase> = new Map();
    private static initialized = false;

    /**
     * Registra un renderer per un tipo di trait
     */
    static register(type: string, renderer: TraitRendererBase): void {
        this.renderers.set(type, renderer);
    }

    /**
     * Ottiene un renderer per tipo
     */
    static get(type: string): TraitRendererBase | undefined {
        this.initialize();
        return this.renderers.get(type);
    }

    /**
     * Renderizza un trait usando il renderer appropriato
     */
    static render(
        trait: PropertyTrait,
        value: unknown,
        onChange: TraitChangeCallback,
        context: TraitRenderContext
    ): TemplateResult {
        this.initialize();

        const renderer = this.renderers.get(trait.type);
        if (!renderer) {
            console.warn(`[TraitRendererFactory] No renderer found for trait type: ${trait.type}`);
            return html`
        <div class="property-row">
          <span class="property-label">${trait.label}</span>
          <span style="color: var(--error-color, red); font-size: 11px;">
            Unknown trait type: ${trait.type}
          </span>
        </div>
      `;
        }

        return renderer.render(trait, value, onChange, context);
    }

    /**
     * Verifica se esiste un renderer per un tipo
     */
    static hasRenderer(type: string): boolean {
        this.initialize();
        return this.renderers.has(type);
    }

    /**
     * Inizializza i renderer predefiniti
     */
    private static initialize(): void {
        if (this.initialized) return;

        this.register('text', new TextTraitRenderer());
        this.register('number', new NumberTraitRenderer());
        this.register('color', new ColorTraitRenderer());
        this.register('checkbox', new CheckboxTraitRenderer());
        this.register('select', new SelectTraitRenderer());
        this.register('context-select', new ContextSelectTraitRenderer());
        this.register('textarea', new TextareaTraitRenderer());
        this.register('entity-picker', new EntityPickerTraitRenderer());
        this.register('icon-picker', new IconPickerTraitRenderer());
        this.register('action', new ActionTraitRenderer());
        this.register('media-picker', new MediaPickerTraitRenderer());
        this.register('info', new InfoTraitRenderer());
        this.register('entity-mode', new EntityModeTraitRenderer());
        this.register('attribute-picker', new AttributePickerTraitRenderer());

        this.initialized = true;
    }
}
