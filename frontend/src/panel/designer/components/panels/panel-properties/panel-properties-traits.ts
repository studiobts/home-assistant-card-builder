/**
 * Traits Panel Component
 *
 * Componente principale per il rendering dei property traits.
 * Riceve una configurazione BlockPropertyConfig e renderizza automaticamente
 * tutti i gruppi e traits usando i renderer appropriati.
 */

import type {
    BlockPropertyConfig,
    PropertyGroup,
    PropertyTrait,
    TemplateKeywordDefinition,
    TraitPropertyValue
} from '@/common/blocks/core/properties';
import type { ValueBinding } from '@/common/core/binding';
import { type DocumentModel, documentModelContext } from '@/common/core/model';
import type { BlockData, DocumentSlot } from '@/common/core/model/types';
import { buildEntityTemplateVariables, HaTemplateSession } from '@/common/core/template/ha-template-service';
import type { HomeAssistant } from 'custom-card-helpers';
import { consume } from '@lit/context';
import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type TraitRenderContext, type VisibilityEvaluationContext, VisibilityEvaluator } from "./traits";
import { TraitRendererFactory } from './traits/trait-renderer-factory';
import './panel-property-group';

import '@/panel/designer/components/editors/property-binding-editor/property-binding-editor';

@customElement('traits-panel')
export class PanelPropertiesTraits extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .traits-container {
            display: flex;
            flex-direction: column;
        }

        .empty-state {
            padding: 16px;
            text-align: center;
            color: var(--secondary-text-color, #666);
            font-size: 12px;
            font-style: italic;
        }

        /* Property row styles - used by trait renderers */

        .property-row {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .property-row.property-row-inline {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }

        .property-label {
            font-size: 11px;
            font-weight: 500;
            color: var(--secondary-text-color, #666);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .property-input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 4px;
            font-size: 13px;
            background: var(--card-background-color, #fff);
            color: var(--primary-text-color, #333);
            box-sizing: border-box;
            transition: border-color 0.15s ease;
        }

        .media-picker-row {
            gap: 6px;
        }

        .media-picker {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .media-chip {
            padding: 6px 10px;
            border-radius: 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border: 1px solid var(--divider-color, #e0e0e0);
            font-size: 12px;
            color: var(--primary-text-color, #333);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .media-picker-actions {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        .media-action-btn {
            border: 1px solid var(--divider-color, #d4d4d4);
            background: var(--card-background-color, #fff);
            color: var(--text-primary, #333);
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .media-action-btn.primary {
            background: var(--primary-color, #03a9f4);
            color: var(--text-primary-color, #fff);
            border-color: transparent;
        }

        .media-action-btn.danger {
            border: 1px solid rgba(211, 47, 47, 0.4);
            background: rgba(211, 47, 47, 0.1);
            color: #b71c1c;
        }

        .property-input:focus {
            outline: none;
            border-color: var(--primary-color, #03a9f4);
        }

        .property-input[type="number"] {
            width: 100%;
        }

        .property-input[type="color"] {
            width: 100%;
            height: 36px;
            cursor: pointer;
            padding: 4px;
        }

        .property-input[type="checkbox"] {
            width: auto;
        }

        select.property-input {
            cursor: pointer;
        }

        textarea.property-input {
            min-height: 60px;
            resize: vertical;
            font-family: inherit;
        }

        /* Template support styles */

        .property-with-template {
            display: flex;
            gap: 4px;
            align-items: flex-start;
        }

        .property-with-template .property-input {
            flex: 1;
        }

        .template-toggle {
            padding: 6px 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            white-space: nowrap;
            transition: all 0.2s;
        }

        .template-toggle:hover {
            background: var(--primary-color, #03a9f4);
            color: white;
        }

        .template-toggle.active {
            background: var(--accent-color, #ff9800);
            color: white;
            border-color: var(--accent-color, #ff9800);
        }

        .template-textarea {
            width: 100%;
            min-height: 60px;
            font-family: monospace;
            font-size: 12px;
            resize: vertical;
        }

        .template-legend {
            margin-top: 4px;
            padding: 6px 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 4px;
            font-size: 10px;
            color: var(--text-secondary, #666);
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .template-legend-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .template-legend-row code {
            font-family: monospace;
            font-size: 10px;
            color: var(--primary-text-color, #333);
        }

        .template-error {
            margin-top: 4px;
            font-size: 10px;
            color: var(--error-color, #d32f2f);
            white-space: pre-wrap;
        }

        /* Entity mode toggle styles */

        .entity-mode-toggle {
            display: flex;
            gap: 8px;
            margin-top: 8px;
            padding: 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 4px;
            align-items: center;
        }

        .entity-mode-label {
            font-size: 11px;
            opacity: 0.7;
            margin-right: auto;
        }

        .toggle-switch {
            position: relative;
            width: 40px;
            height: 20px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.3s;
            border-radius: 20px;
        }

        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
            background-color: var(--primary-color, #03a9f4);
        }

        .toggle-switch input:checked + .toggle-slider:before {
            transform: translateX(20px);
        }

        .slot-info {
            font-size: 10px;
            opacity: 0.6;
            margin-top: 4px;
            font-style: italic;
        }

        /* Info display styles */

        .property-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
        }

        .info-text {
            font-size: 10px;
            opacity: 0.6;
            font-style: italic;
            font-family: var(--font-family, sans-serif), sans-serif;
        }

        /* Action button styles */

        .edit-grid-button {
            width: 100%;
            padding: 10px 16px;
            background: var(--accent-color, #2196f3);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .edit-grid-button:hover {
            background: var(--accent-dark, #1976d2);
        }

        .action-icon {
            font-size: 14px;
        }
    `;

    @consume({context: documentModelContext})
    documentModel?: DocumentModel;

    /** Configurazione dei traits del blocco */
    @property({attribute: false}) config?: BlockPropertyConfig;

    /** Props correnti del blocco */
    @property({attribute: false}) props: Record<string, unknown> = {};

    /** Dati del blocco corrente */
    @property({attribute: false}) block?: BlockData;

    /** Istanza Home Assistant */
    @property({attribute: false}) hass?: HomeAssistant;

    /** Handlers per le action (es: open-grid-editor) */
    @property({attribute: false}) actionHandlers?: Map<string, () => void>;

    /** Default entity ID for bindings */
    @property({type: String}) defaultEntityId?: string;

    @state() private bindingEditorOpen = false;

    @state() private bindingEditorTarget: { name: string; label: string } | null = null;

    @state() private slots: DocumentSlot[] = [];

    @state() private templateErrors: Record<string, string | undefined> = {};

    private templateSessions = new Map<string, HaTemplateSession>();

    connectedCallback(): void {
        super.connectedCallback();

        if (this.documentModel) {
            this.slots = this.documentModel.getSlotEntities();
            this.documentModel.addEventListener('slots-changed', this._handleSlotsChanged);
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.documentModel?.removeEventListener('slots-changed', this._handleSlotsChanged);
        this._disposeTemplateSessions();
    }

    render() {
        if (!this.config || !this.config.groups || this.config.groups.length === 0) {
            return html`
                <div class="empty-state">
                    No editable properties available for this element
                </div>
            `;
        }

        const visibleGroups = this.config.groups.filter(group =>
            this._isGroupVisible(group)
        );

        if (visibleGroups.length === 0) {
            return html`
                <div class="empty-state">
                    No editable properties available for this element
                </div>
            `;
        }

        return html`
            <div
                    class="traits-container"
                    @property-binding-edit=${this._handleBindingEdit}
                    @property-binding-change=${this._handleBindingChange}
            >
                ${visibleGroups.map(group => this._renderGroup(group))}
            </div>
            ${this._renderBindingEditorOverlay()}
        `;
    }

    public openBindingEditor(propertyName: string): void {
        const trait = this._findTraitByName(propertyName);
        if (!trait?.binding) {
            return;
        }

        this.bindingEditorTarget = {name: propertyName, label: trait.label};
        this.bindingEditorOpen = true;
    }

    protected updated(changedProps: PropertyValues): void {
        if (changedProps.has('block') && changedProps.get('block')?.id !== this.block?.id) {
            this._closeBindingEditor(true);
            this._disposeTemplateSessions();
            this.templateErrors = {};
        }

        if (changedProps.has('hass')) {
            this._disposeTemplateSessions();
            this.templateErrors = {};
        }

        if (changedProps.has('props') || changedProps.has('block') || changedProps.has('hass')) {
            this._syncTemplateSessions();
        }
    }

    private _handleSlotsChanged = (): void => {
        this.slots = this.documentModel?.getSlotEntities() ?? [];
        this.requestUpdate();
    };

    /**
     * Check if a group should be visible
     */
    private _isGroupVisible(group: PropertyGroup): boolean {
        const context = this._getVisibilityContext();
        return VisibilityEvaluator.evaluate(group.visible, context);
    }

    /**
     * Check if a trait should be visible
     */
    private _isTraitVisible(trait: PropertyTrait): boolean {
        const context = this._getVisibilityContext();
        return VisibilityEvaluator.evaluate(trait.visible, context);
    }

    /**
     * Get the visibility evaluation context
     */
    private _getVisibilityContext(): VisibilityEvaluationContext {
        return {
            props: this._getRawProps(),
            blockContext: {
                parentManaged: this.block?.parentManaged,
                type: this.block?.type,
                id: this.block?.id
            }
        };
    }

    /**
     * Render a property group
     */
    private _renderGroup(group: PropertyGroup): TemplateResult {
        const visibleTraits = group.traits.filter(trait => this._isTraitVisible(trait));

        if (visibleTraits.length === 0) {
            return nothing as unknown as TemplateResult;
        }

        return html`
            <property-group
                    .label=${group.label}
                    .groupId=${group.id}
                    ?collapsed=${group.collapsed ?? false}
            >
                ${visibleTraits.map(trait => this._renderTrait(trait))}
            </property-group>
        `;
    }

    /**
     * Render a single trait using the appropriate renderer
     */
    private _renderTrait(trait: PropertyTrait): TemplateResult {
        const value = this._getTraitPropertyValue(trait.name);
        const context: TraitRenderContext = {
            hass: this.hass,
            block: this.block!,
            props: this.props,
            actionHandlers: this.actionHandlers,
            defaultEntityId: this.defaultEntityId,
            documentModel: this.documentModel,
            templateErrors: this.templateErrors
        };

        return TraitRendererFactory.render(
            trait,
            value,
            this._handleTraitChange.bind(this),
            context
        );
    }

    /**
     * Handle trait value change
     */
    private _handleTraitChange(name: string, value: unknown): void {
        this._updateTemplateSession(name, value);
        this.dispatchEvent(new CustomEvent('trait-changed', {
            detail: {name, value},
            bubbles: true,
            composed: true
        }));
    }

    private _syncTemplateSessions(): void {
        const groups = this.config?.groups ?? [];
        const activeTemplates = new Set<string>();
        for (const group of groups) {
            for (const trait of group.traits) {
                if (!this._isTraitVisible(trait)) continue;
                const value = this._getRawPropValue(trait.name);
                const updated = this._updateTemplateSession(trait.name, value, trait);
                if (updated) {
                    activeTemplates.add(trait.name);
                }
            }
        }

        for (const key of this.templateSessions.keys()) {
            if (!activeTemplates.has(key)) {
                this._disposeTemplateSession(key);
                this._clearTemplateError(key);
            }
        }
    }

    private _updateTemplateSession(
        name: string,
        value: unknown,
        traitOverride?: PropertyTrait
    ): boolean {
        if (!this.hass || !this.block) return false;

        const trait = traitOverride ?? this._findTraitByName(name);
        if (!trait) return false;

        const templateInfo = this._extractTemplateInfo(trait, value);
        if (!templateInfo) {
            this._clearTemplateError(name);
            this._disposeTemplateSession(name);
            return false;
        }

        const session = this._getTemplateSession(name);
        session.update({
            template: templateInfo.template,
            variables: templateInfo.variables,
            reportErrors: true,
            debounceMs: 250,
        });
        return true;
    }

    private _extractTemplateInfo(
        trait: PropertyTrait,
        value: unknown
    ): { template: string; variables: Record<string, unknown> } | null {
        const templateString = this._getTemplateString(trait, value);
        if (!templateString) return null;

        const variables = this._buildTemplateVariables(trait);
        return {template: templateString, variables};
    }

    private _getTemplateString(trait: PropertyTrait, value: unknown): string | null {
        // Traits with template keywords always behave as templates (e.g. formatTemplate)
        const keywords = (trait as { templateKeywords?: TemplateKeywordDefinition[] }).templateKeywords;
        if (keywords && keywords.length > 0) {
            if (value === undefined || value === null) return '';
            return String(value);
        }

        return null;
    }

    private _buildTemplateVariables(trait: PropertyTrait): Record<string, unknown> {
        const entityId = this.documentModel?.resolveEntityForBlock(this.block!.id).entityId;
        const state = entityId ? this.hass?.states?.[entityId] : undefined;

        let value: unknown = state?.state;
        const attrNameValue = this._getRawPropValue('attributeName');
        if (attrNameValue && state?.attributes) {
            value = (state.attributes as Record<string, unknown>)[String(attrNameValue)];
        }

        const variables = buildEntityTemplateVariables(state as any, value);

        if (trait.name === 'customName') {
            const friendlyName = state?.attributes?.friendly_name || entityId;
            variables.name = friendlyName;
            variables.value = friendlyName;
        }

        if (trait.name === 'customState') {
            const friendlyName = state?.attributes?.friendly_name || entityId;
            variables.name = friendlyName;
        }

        return variables;
    }

    private _getRawPropValue(name: string): unknown {
        const value = this.props[name];
        if (value && typeof value === 'object' && 'value' in (value as any)) {
            return (value as any).value;
        }
        return value;
    }

    private _getTemplateSession(key: string): HaTemplateSession {
        let session = this.templateSessions.get(key);
        if (!session) {
            session = new HaTemplateSession(this.hass!, {
                onResult: () => this._clearTemplateError(key),
                onError: (error) => this._setTemplateError(key, error.error),
            });
            this.templateSessions.set(key, session);
        }
        return session;
    }

    private _disposeTemplateSession(key: string): void {
        const session = this.templateSessions.get(key);
        if (!session) return;
        session.dispose();
        this.templateSessions.delete(key);
    }

    private _disposeTemplateSessions(): void {
        for (const session of this.templateSessions.values()) {
            session.dispose();
        }
        this.templateSessions.clear();
    }

    private _setTemplateError(name: string, error: string): void {
        if (this.templateErrors[name] === error) return;
        this.templateErrors = {...this.templateErrors, [name]: error};
    }

    private _clearTemplateError(name: string): void {
        if (!this.templateErrors[name]) return;
        const next = {...this.templateErrors};
        delete next[name];
        this.templateErrors = next;
    }

    private _handleBindingEdit(e: CustomEvent<{ category: string; property: string; label: string }>): void {
        if (e.detail.category !== 'props') {
            return;
        }

        const trait = this._findTraitByName(e.detail.property);
        if (!trait?.binding) {
            return;
        }

        this.bindingEditorTarget = {name: e.detail.property, label: e.detail.label};
        this.bindingEditorOpen = true;
    }

    private _handleBindingChange(
        e: CustomEvent<{ category: string; property: string; binding: ValueBinding | null }>
    ): void {
        if (e.detail.category !== 'props') {
            return;
        }

        this.dispatchEvent(new CustomEvent('trait-binding-changed', {
            detail: {name: e.detail.property, binding: e.detail.binding},
            bubbles: true,
            composed: true
        }));
    }

    private _closeBindingEditor(clearTarget = false): void {
        this.bindingEditorOpen = false;
        if (clearTarget) {
            this.bindingEditorTarget = null;
        }
    }

    private _getTraitPropertyValue(name: string): TraitPropertyValue | undefined {
        const value = this.props[name];
        if (!value || typeof value !== 'object') {
            return undefined;
        }

        const candidate = value as TraitPropertyValue;
        if ('value' in candidate || 'binding' in candidate) {
            return candidate;
        }

        return undefined;
    }

    private _getRawProps(): Record<string, unknown> {
        const raw: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(this.props)) {
            if (value && typeof value === 'object' && 'value' in value) {
                raw[key] = (value as TraitPropertyValue).value;
            } else {
                raw[key] = value;
            }
        }
        return raw;
    }

    private _findTraitByName(name: string): PropertyTrait | undefined {
        const groups = this.config?.groups ?? [];
        for (const group of groups) {
            const match = group.traits.find((trait) => trait.name === name);
            if (match) return match;
        }
        return undefined;
    }

    private _renderBindingEditorOverlay(): TemplateResult {
        if (!this.bindingEditorTarget) {
            return nothing as unknown as TemplateResult;
        }

        const trait = this._findTraitByName(this.bindingEditorTarget.name);
        if (!trait?.binding) {
            return nothing as unknown as TemplateResult;
        }

        const propertyValue = this._getTraitPropertyValue(this.bindingEditorTarget.name);
        const binding = propertyValue?.binding;

        return html`
            <property-binding-editor-overlay
                    .open=${this.bindingEditorOpen}
                    .hass=${this.hass}
                    .label=${this.bindingEditorTarget.label}
                    .category=${'props'}
                    .propertyName=${this.bindingEditorTarget.name}
                    .block=${this.block}
                    .binding=${binding}
                    .defaultEntityId=${this.defaultEntityId}
                    .slots=${this.slots}
                    .valueInputConfig=${trait.binding}
                    @property-binding-change=${this._handleBindingChange}
                    @overlay-close=${() => this._closeBindingEditor()}
            ></property-binding-editor-overlay>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'traits-panel': PanelPropertiesTraits;
    }
}
