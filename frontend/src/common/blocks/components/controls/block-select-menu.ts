import { BaseOptionSelector, buildFeatureTraitOptions, type ResolvedFeature } from '@/common/blocks/components/controls/base-option-selector';
import type { BlockRegistration } from '@/common/blocks/core/registry/block-registry';
import type { BlockPanelConfig } from '@/common/blocks/types';
import { css, html, nothing, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { HassEntity } from 'home-assistant-js-websocket';

// =============================================================================
// Types
// =============================================================================

type ContentOrder = 'icon-first' | 'label-first';
type DropdownPlacement = 'down' | 'up';

// =============================================================================
// Select Menu Block
// =============================================================================

@customElement('block-select-menu')
export class BlockSelectMenu extends BaseOptionSelector {
    static styles = [
        ...BaseOptionSelector.styles,
        css`
            :host {
                display: block;
            }

            .select-root {
                position: relative;
                width: 100%;
            }

            .select-button {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 6px;
                background: var(--bg-primary, #fff);
                color: var(--text-primary, #333);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.15s ease;
                box-sizing: border-box;
            }

            .select-button:hover:not(:disabled) {
                border-color: var(--accent-color, #2196f3);
            }

            .select-button.open {
                border-color: var(--accent-color, #2196f3);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
            }

            .select-content {
                display: flex;
                align-items: center;
                gap: 6px;
                flex: 1;
                min-width: 0;
            }

            .select-content.order-label-first .option-icon {
                order: 2;
            }

            .select-content.order-label-first .option-label {
                order: 1;
            }

            .select-arrow {
                color: var(--text-tertiary, #999);
                font-size: 10px;
                margin-left: auto;
            }

            .option-label {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                margin-top: 6px;
                background: var(--bg-primary, #fff);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 6px;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
                z-index: 1000;
                max-height: 280px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .dropdown.placement-up {
                top: auto;
                bottom: 100%;
                margin-top: 0;
                margin-bottom: 6px;
            }

            .dropdown-options {
                overflow-y: auto;
                padding: 4px 0;
            }

            .dropdown-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: background 0.1s ease;
            }

            .dropdown-option.order-label-first .option-icon {
                order: 2;
            }

            .dropdown-option.order-label-first .option-label {
                order: 1;
            }

            .dropdown-option:hover {
                background: var(--bg-secondary, #f5f5f5);
            }

            .dropdown-option.selected {
                background: rgba(33, 150, 243, 0.1);
            }

            .no-options {
                font-size: 12px;
                color: var(--text-secondary, #666);
                padding: 6px 8px;
            }
        `,
    ];

    @state() private _dropdownOpen = false;

    static getBlockConfig(): BlockRegistration {
        return {
            definition: {
                label: 'Select Menu',
                icon: '<ha-icon icon="mdi:form-dropdown"></ha-icon>',
                category: 'controls',
            },
            defaults: {
                requireEntity: true,
                props: {
                    feature: {value: 'auto'},
                    contentOrder: {value: 'icon-first'},
                    dropdownPlacement: {value: 'down'},
                    containerShowIcon: {value: true},
                    containerShowLabel: {value: true},
                    dropdownShowIcon: {value: true},
                    dropdownShowLabel: {value: true},
                },
            },
            entityDefaults: {
                mode: 'inherited',
            },
            exposeBlockActionTarget: false,
        };
    }

    protected hasNativeActions(): boolean {
        return true;
    }

    public getPanelConfig(): BlockPanelConfig {
        return {
            properties: {
                groups: [
                    {
                        id: 'options',
                        label: 'Options',
                        traits: [
                            {
                                type: 'context-select',
                                name: 'feature',
                                label: 'Feature',
                                emptyLabel: 'No options available',
                                optionsProvider: buildFeatureTraitOptions,
                            },
                        ],
                    },
                    {
                        id: 'appearance',
                        label: 'Appearance',
                        traits: [
                            {
                                type: 'checkbox',
                                name: 'containerShowIcon',
                                label: 'Show Container Icon',
                            },
                            {
                                type: 'checkbox',
                                name: 'containerShowLabel',
                                label: 'Show Container Label',
                            },
                            {
                                type: 'checkbox',
                                name: 'dropdownShowIcon',
                                label: 'Show Dropdown Icon',
                            },
                            {
                                type: 'checkbox',
                                name: 'dropdownShowLabel',
                                label: 'Show Dropdown Label',
                            },
                            {
                                type: 'select',
                                name: 'contentOrder',
                                label: 'Content Order',
                                options: [
                                    {value: 'icon-first', label: 'Icon First'},
                                    {value: 'label-first', label: 'Label First'},
                                ],
                            },
                            {
                                type: 'select',
                                name: 'dropdownPlacement',
                                label: 'Dropdown Placement',
                                options: [
                                    {value: 'down', label: 'Below'},
                                    {value: 'up', label: 'Above'},
                                ],
                            },
                        ],
                    },
                ],
            },
            targetStyles: {
                block: {
                    styles: {
                        preset: 'full',
                    },
                },
                container: {
                    label: 'Container',
                    description: 'Select container',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                dropdown: {
                    label: 'Dropdown',
                    description: 'Dropdown panel',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'container-icon': {
                    label: 'Container Icon',
                    description: 'Selected icon',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'container-label': {
                    label: 'Container Label',
                    description: 'Selected label',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'dropdown-icon': {
                    label: 'Dropdown Icon',
                    description: 'Option icon',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'dropdown-label': {
                    label: 'Dropdown Label',
                    description: 'Option label',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'dropdown-selected-icon': {
                    label: 'Selected Icon',
                    description: 'Selected option icon',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
                'dropdown-selected-label': {
                    label: 'Selected Label',
                    description: 'Selected option label',
                    styles: {
                        preset: 'full',
                        exclude: {groups: ['layout', 'flex']},
                    },
                },
            },
        };
    }

    updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        if (changedProps.has('block')) {
            this.entity = this.resolvedEntityId();
        }
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._handleOutsideClick = this._handleOutsideClick.bind(this);
    }

    disconnectedCallback(): void {
        this._removeOutsideListener();
        super.disconnectedCallback();
    }

    render() {
        if (!this.entity) {
            return html`<div class="no-options">No entity selected</div>`;
        }

        const state = this.getEntityState();
        if (!state) {
            return html`<div class="no-options">Entity unavailable</div>`;
        }

        const domain = this.getEntityDomain();
        if (!domain) {
            return html`<div class="no-options">Entity unavailable</div>`;
        }

        const available = this._resolveAvailableFeatures(state, domain);
        const feature = this._resolveSelectedFeature(available);

        if (!feature || feature.options.length < 2) {
            return html`<div class="no-options">No options available</div>`;
        }

        const options = this._buildOptions(feature, state);
        const effectiveValue = this._getEffectiveValue(feature, state);
        const currentValue = effectiveValue ?? feature.currentValue ?? options[0]?.value;
        const currentOption = options.find((option) => option.value === currentValue);
        const currentLabel = currentOption?.label ?? 'Select';

        const contentOrder = this.resolveProperty('contentOrder', 'icon-first') as ContentOrder;
        const dropdownPlacement = this.resolveProperty('dropdownPlacement', 'down') as DropdownPlacement;
        const containerShowIcon = this.resolvePropertyAsBoolean('containerShowIcon');
        const containerShowLabel = this.resolvePropertyAsBoolean('containerShowLabel');
        const dropdownShowIcon = this.resolvePropertyAsBoolean('dropdownShowIcon');
        const dropdownShowLabel = this.resolvePropertyAsBoolean('dropdownShowLabel');

        const containerStyle = this.getTargetStyle('container');
        const dropdownStyle = this.getTargetStyle('dropdown');
        const containerIconStyle = this.getTargetStyle('container-icon');
        const containerLabelStyle = this.getTargetStyle('container-label');
        const dropdownIconStyle = this.getTargetStyle('dropdown-icon');
        const dropdownLabelStyle = this.getTargetStyle('dropdown-label');
        const dropdownSelectedIconStyle = this.getTargetStyle('dropdown-selected-icon');
        const dropdownSelectedLabelStyle = this.getTargetStyle('dropdown-selected-label');

        const contentClasses = classMap({
            'select-content': true,
            'order-label-first': contentOrder === 'label-first',
        });

        const dropdownClasses = classMap({
            dropdown: true,
            'placement-up': dropdownPlacement === 'up',
            'style-target-active': this.isStyleTargetActive('dropdown'),
        });

        const buttonClasses = classMap({
            'select-button': true,
            open: this._dropdownOpen,
            'style-target-active': this.isStyleTargetActive('container'),
        });

        return html`
            <div class="select-root">
                <button
                    class=${buttonClasses}
                    style=${styleMap(containerStyle)}
                    data-style-target="container"
                    type="button"
                    aria-disabled=${this.areActionsEnabled() && this.isEntityAvailable() ? 'false' : 'true'}
                    @click=${this._toggleDropdown}
                >
                    <div class=${contentClasses}>
                        ${containerShowIcon && currentValue
                            ? this._renderOptionIcon(feature, currentValue, containerIconStyle, 'container-icon')
                            : nothing}
                        ${containerShowLabel
                            ? this._renderOptionLabel(
                                currentLabel,
                                containerLabelStyle,
                                'container-label'
                            )
                            : nothing}
                    </div>
                    <span class="select-arrow">▼</span>
                </button>

                ${this._dropdownOpen ? html`
                    <div class=${dropdownClasses} style=${styleMap(dropdownStyle)} data-style-target="dropdown" @click=${(e: Event) => e.stopPropagation()}>
                        <div class="dropdown-options">
                            ${options.map((option) => {
                                const isSelected = option.value === currentValue;
                                const iconStyle = isSelected
                                    ? {...dropdownIconStyle, ...dropdownSelectedIconStyle}
                                    : dropdownIconStyle;
                                const labelStyle = isSelected
                                    ? {...dropdownLabelStyle, ...dropdownSelectedLabelStyle}
                                    : dropdownLabelStyle;

                                const optionClasses = classMap({
                                    'dropdown-option': true,
                                    selected: isSelected,
                                    'order-label-first': contentOrder === 'label-first',
                                });

                                return html`
                                    <div
                                        class=${optionClasses}
                                        @click=${(e: Event) => this._handleOptionSelect(e, option.value, feature, state)}
                                    >
                                        ${dropdownShowIcon
                                            ? this._renderOptionIcon(feature, option.value, iconStyle, isSelected ? 'dropdown-selected-icon' : 'dropdown-icon')
                                            : nothing}
                                        ${dropdownShowLabel
                                            ? this._renderOptionLabel(option.label, labelStyle, isSelected ? 'dropdown-selected-label' : 'dropdown-label')
                                            : nothing}
                                    </div>
                                `;
                            })}
                        </div>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    private _toggleDropdown = (e: Event): void => {
        if (!this.areActionsEnabled()) return;
        if (!this.isEntityAvailable()) return;

        e.preventDefault();
        e.stopPropagation();

        if (this._dropdownOpen) {
            this._closeDropdown();
        } else {
            this._openDropdown();
        }
    };

    private _openDropdown(): void {
        this._dropdownOpen = true;
        setTimeout(() => {
            document.addEventListener('click', this._handleOutsideClick);
        }, 0);
    }

    private _closeDropdown(): void {
        this._dropdownOpen = false;
        this._removeOutsideListener();
    }

    private _removeOutsideListener(): void {
        document.removeEventListener('click', this._handleOutsideClick);
    }

    private _handleOutsideClick(e: Event): void {
        if (!this.contains(e.target as Node)) {
            this._closeDropdown();
        }
    }

    private async _handleOptionSelect(
        e: Event,
        value: string,
        feature: ResolvedFeature,
        state: HassEntity
    ): Promise<void> {
        if (!this.hass || !this.entity) return;
        if (!this.areActionsEnabled()) return;
        if (!this.isEntityAvailable()) return;

        e.preventDefault();
        e.stopPropagation();

        const current = this._getEffectiveValue(feature, state);
        if (current === value) {
            this._closeDropdown();
            return;
        }

        this._setPendingValue(value);
        this._closeDropdown();

        await this._dispatchBlockAction(feature, value);
    }

    protected _emitServiceError(error: unknown, payload: Record<string, unknown>): void {
        const detail = {
            entityId: this.entity,
            error,
            payload,
            blockId: this.block?.id,
        };

        this.eventBus?.dispatchEvent('select-menu-service-error', detail);
        this.dispatchEvent(new CustomEvent('select-menu-service-error', {detail, bubbles: true, composed: true}));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'block-select-menu': BlockSelectMenu;
    }
}
