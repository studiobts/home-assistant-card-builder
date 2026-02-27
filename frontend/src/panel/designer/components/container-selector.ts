/**
 * Container Selector - UI component for selecting responsive breakpoints
 *
 * Dropdown selector for switching between different container views.
 */

import type { Container } from '@/common/core/container-manager/container-manager';
import { DropdownSelectorBase } from '@/panel/common/ui/dropdown-selector-base';
import { css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';

export class ContainerSelector extends DropdownSelectorBase {
    static styles = [
        DropdownSelectorBase.styles,
        css`
            :host {
                min-width: 180px;
            }
            .selector-button {
                --mdc-icon-size: 18px;
                padding: 4px 12px;
            }
            .option-item {
                --mdc-icon-size: 20px;
            }
            .option-item.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `,
    ];

    @property({type: Array}) containers: Container[] = [];

    @property({type: String}) activeContainerId!: string;

    protected get showSearch(): boolean {
        return this.containers.length > 5;
    }

    protected get searchPlaceholder(): string {
        return 'Search containers...';
    }

    protected renderTriggerIcon() {
        const activeContainer = this._getActiveContainer();
        return activeContainer ? this._renderContainerIcon(activeContainer) : nothing;
    }

    protected renderTriggerLabel() {
        const activeContainer = this._getActiveContainer();

        if (!activeContainer) {
            return html`<span class="placeholder">Select container</span>`;
        }

        return html`${activeContainer.name}${this._formatWidth(activeContainer.width)}`;
    }

    protected renderDropdownContent() {
        const filteredContainers = this._getFilteredContainers();

        return html`
            <div class="option-list">
                ${filteredContainers.length > 0 ? filteredContainers.map((container) => html`
                    <div
                        class="option-item ${container.id === this.activeContainerId ? 'selected' : ''} ${container.disabled ? 'disabled' : ''}"
                        @click=${() => this._selectContainer?.(container)}
                    >
                        <span class="icon">${this._renderContainerIcon(container)}</span>
                        <div class="info">
                            <div class="name">${container.name || container.id}</div>
                            <div class="description">${this._getContainerDescription(container)}</div>
                            <div class="meta">${this._getContainerMeta(container)}</div>
                        </div>
                        ${container.id === this.activeContainerId ? html`<span class="check">✓</span>` : nothing}
                    </div>
                `) : this._searchFilter ? html`
                    <div class="empty-message">No containers match "${this._searchFilter}"</div>
                ` : html`
                    <div class="empty-message">No containers available</div>
                `}
            </div>
        `;
    }

    protected _selectContainer(_container: Container) {}

    private _renderContainerIcon(container: Container) {
        const icon = container.icon || 'mdi:border-radius';
        return html`<ha-icon icon=${icon}></ha-icon>`;
    }

    private _getActiveContainer(): Container | undefined {
        return this.containers.find((container) => container.id === this.activeContainerId) || this.containers[0];
    }

    private _getFilteredContainers(): Container[] {
        if (!this._searchFilter) return this.containers;

        return this.containers.filter((container) =>
            container.id.toLowerCase().includes(this._searchFilter) ||
            container.name.toLowerCase().includes(this._searchFilter)
        );
    }

    private _formatWidth(width: number): string {
        return width ? ` (${width}px)` : '';
    }

    private _getContainerDescription(container: Container): string {
        if (!container.width) {
            return 'No width limit';
        }

        return `Max width: ${container.width}px`;
    }

    private _getContainerMeta(container: Container): string {
        const typeLabel = container.isDefault
            ? 'Default'
            : container.isDevice
                ? 'Device'
                : 'Container';

        return `${typeLabel} • ID: ${container.id}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'container-selector': ContainerSelector;
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('container-selector', ContainerSelector);
