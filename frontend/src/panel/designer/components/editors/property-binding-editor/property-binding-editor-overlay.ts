/**
 * Property Binding Editor Overlay
 *
 * Slide-in panel for style property binding configuration.
 * Matches the right sidebar width with no backdrop.
 */

import type { BindingValueInputConfig } from '@/common/blocks/core/properties';
import type { ValueBinding } from '@/common/core/binding';
import type { BlockData, DocumentSlot } from '@/common/core/model/types';
import type { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../property-editor-overlay';
import './property-binding-editor';

/**
 * Property Binding Editor Overlay
 *
 * @fires property-binding-change - When binding changes
 * @fires overlay-close - When the editor should close
 */
@customElement('property-binding-editor-overlay')
export class PropertyBindingEditorOverlay extends LitElement {
    static styles = css`
    :host {
      display: contents;
    }
  `;
    /** Whether overlay is open */
    @property({type: Boolean, reflect: true})
    open = false;
    /** Home Assistant instance */
    @property({attribute: false})
    hass?: HomeAssistant;
    /** Property label */
    @property({type: String})
    label = '';
    /** Property category */
    @property({type: String})
    category = '';
    /** Property name */
    @property({type: String})
    propertyName = '';
    /** Block data */
    @property({type: Object})
    block!: BlockData;
    /** Current binding configuration */
    @property({attribute: false})
    binding?: ValueBinding;
    /** Default entity ID */
    @property({type: String})
    defaultEntityId?: string;
    /** Available slots */
    @property({attribute: false})
    slots: DocumentSlot[] = [];
    /** Value input configuration */
    @property({attribute: false})
    valueInputConfig?: BindingValueInputConfig;

    render() {
        return html`
            <property-editor-overlay
                .open=${this.open}
                title="Binding"
                .subtitle=${this.label || this.propertyName}
                @overlay-close=${this._handleClose}
            >
                <property-binding-editor
                    .hass=${this.hass}
                    .binding=${this.binding}
                    .block=${this.block}
                    .defaultEntityId=${this.defaultEntityId}
                    .slots=${this.slots}
                    .valueInputConfig=${this.valueInputConfig}
                    @binding-change=${this._handleBindingChange}
                ></property-binding-editor>
            </property-editor-overlay>
        `;
    }

    private _handleBindingChange(e: CustomEvent): void {
        this.dispatchEvent(
            new CustomEvent('property-binding-change', {
                detail: {
                    category: this.category,
                    property: this.propertyName,
                    binding: e.detail.binding,
                    unit: e.detail.unit,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    private _handleClose(): void {
        this.dispatchEvent(
            new CustomEvent('overlay-close', {
                bubbles: true,
                composed: true,
            })
        );
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'property-binding-editor-overlay': PropertyBindingEditorOverlay;
    }
}
