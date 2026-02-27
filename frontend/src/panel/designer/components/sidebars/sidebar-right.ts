import type { HomeAssistant } from 'custom-card-helpers';
import type { TabConfig } from '@/panel/designer/types.ts';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './sidebar-tabbed';
import '@/panel/designer/components/panels/panel-styles/panel-styles'
import '@/panel/designer/components/panels/panel-properties/panel-properties';
import '@/panel/designer/components/panels/panel-actions/panel-actions';

@customElement('sidebar-right')
export class SidebarRight extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100%;
            width: 260px;
            position: relative;
        }

        .resize-handle {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 10px;
            cursor: ew-resize;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .resize-handle::before {
            content: '';
            width: 4px;
            height: 40px;
            background: var(--border-color, #d4d4d4);
            border-radius: 2px;
            transition: background 0.2s ease;
        }

        .resize-handle:hover::before,
        .resize-handle.resizing::before {
            background: var(--accent-color, #0078d4);
        }

        .sidebar-content {
            height: 100%;
            width: 100%;
        }
    `;

    private static readonly MIN_WIDTH = 200;
    private static readonly MAX_WIDTH = 600;

    @property({type: Number}) canvasWidth!: number;
    @property({type: Number}) canvasHeight!: number;
    @property({type: Object}) canvas?: any;
    @property({attribute: false}) hass?: HomeAssistant;
    @property({type: Number}) width: number = 260;

    @state() private _width: number = 260;
    @state() private _isResizing: boolean = false;

    private _startX: number = 0;
    private _startWidth: number = 0;

    connectedCallback(): void {
        super.connectedCallback();
        this._width = this.width;
        this._updateHostWidth();
    }

    render() {
        const tabs: TabConfig[] = [
            {
                id: 'properties',
                label: 'Properties',
                component: 'panel-properties',
                props: {
                    hass: this.hass
                }
            },
            {
                id: 'styles',
                label: 'Styles',
                component: 'panel-style',
                props: {
                    hass: this.hass,
                    canvasWidth: this.canvasWidth,
                    canvasHeight: this.canvasHeight,
                    canvas: this.canvas
                }
            },
            {
                id: 'actions',
                label: 'Actions',
                component: 'panel-actions',
                props: {
                    hass: this.hass
                }
            }
        ];

        return html`
            <div class="resize-handle ${this._isResizing ? 'resizing' : ''}"
                 @mousedown=${this._handleResizeStart}></div>
            <div class="sidebar-content">
                <sidebar-tabbed .tabs=${tabs}></sidebar-tabbed>
            </div>
        `;
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        // When canvas property changes, update panel-style reference
        if (changedProps.has('canvas') && this.canvas) {
            this._updateStylePanelCanvas();
        }

        if (changedProps.has('width') && !this._isResizing) {
            this._width = this.width;
            this._updateHostWidth();
        }
    }

    private _updateHostWidth(): void {
        this.style.width = `${this._width}px`;
    }

    private _handleResizeStart(e: MouseEvent): void {
        e.preventDefault();
        this._isResizing = true;
        this._startX = e.clientX;
        this._startWidth = this._width;

        const handleMouseMove = (e: MouseEvent) => {
            if (!this._isResizing) return;

            const delta = this._startX - e.clientX;
            const newWidth = Math.max(
                SidebarRight.MIN_WIDTH,
                Math.min(SidebarRight.MAX_WIDTH, this._startWidth + delta)
            );

            this._width = newWidth;
            this._updateHostWidth();
            this.dispatchEvent(new CustomEvent('right-sidebar-width-changed', {
                detail: {width: newWidth},
                bubbles: true,
                composed: true,
            }));
        };

        const handleMouseUp = () => {
            if (this._isResizing) {
                this._isResizing = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    private _updateStylePanelCanvas(): void {
        // Navigate to panel-style in shadow DOM and update canvas reference
        const sidebarTabbed = this.shadowRoot?.querySelector('sidebar-tabbed');
        if (sidebarTabbed?.shadowRoot) {
            const stylePanel = sidebarTabbed.shadowRoot.querySelector('panel-style') as any;
            if (stylePanel && this.canvas) {
                stylePanel.canvas = this.canvas;
            }
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'sidebar-right': SidebarRight;
    }
}
