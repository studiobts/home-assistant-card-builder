/**
 * Property Animation Editor Overlay
 *
 * Slide-in panel for style property animation configuration.
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import '@/panel/designer/components/editors/property-editor-overlay';

/**
 * Property Animation Editor Overlay
 */
export class PropertyAnimationEditorOverlay extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
        .not-available {
            padding: 12px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
        }
    `;
    /** Whether overlay is open */
    @property({type: Boolean, reflect: true})
    open = false;
    /** Property label */
    @property({type: String})
    label = '';
    /** Property name */
    @property({type: String})
    propertyName = '';
    /** Target ID if editing a style target */


    render() {
        return html`
            <property-editor-overlay
                .open=${this.open}
                title="Animation"
                .subtitle=${this.label || this.propertyName}
                @overlay-close=${this.handleClose}
            >
                <div class="not-available">Animation Configuration is not available yet</div>
            </property-editor-overlay>
        `;
    }


    protected handleClose(): void {
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
        'property-animation-editor-overlay': PropertyAnimationEditorOverlay;
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('property-animation-editor-overlay', PropertyAnimationEditorOverlay);
