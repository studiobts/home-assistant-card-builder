import { BlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import { DragDropManager, dragDropManagerContext, type DragSourceElement } from "@/common/core/drag-and-drop";
import { consume } from "@lit/context";
import { css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ref } from "lit/directives/ref.js";
import { PanelBase } from './panel-base';
import '../draggable-block';

interface Section {
    label: string;
    expanded: boolean;
}

@customElement('panel-blocks')
export class PanelBlocks extends PanelBase implements DragSourceElement {
    static styles = [
        ...PanelBase.styles,
        css`
            .panel-content {
                padding: 0;
            }

            .block-section {
                padding: 10px;
                border-bottom: 1px solid #ddd;
            }

            .block-section-header {
                display: flex;
                align-items: center;
                padding: 8px 4px;
                cursor: pointer;
                user-select: none;
                font-size: 13px;
                font-weight: 500;
                color: var(--text-primary);
                border-radius: 4px;
            }

            .block-section-header::before {
                content: '';
                display: inline-block;
                width: 0;
                height: 0;
                border-left: 5px solid var(--text-primary);
                border-top: 4px solid transparent;
                border-bottom: 4px solid transparent;
                margin-right: 8px;
                transition: transform 0.2s;
            }

            .block-section.expanded .block-section-header::before {
                transform: rotate(90deg);
            }

            .block-section-content {
                display: none;
                padding: 8px 0 8px 4px;
            }

            .block-section.expanded .block-section-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
        `,
    ];
    @consume({context: blockRegistryContext})
    protected blockRegistry!: BlockRegistry;
    @consume({context: dragDropManagerContext})
    protected dragDropManager!: DragDropManager;
    protected panelContent: HTMLElement | null = null;
    @state() private sections: Record<string, Section> = {
        basic: {label: 'Basic', expanded: true},
        layout: {label: 'Layout', expanded: true},
        entities: {label: 'Entities', expanded: true},
        controls: {label: 'Controls', expanded: true},
        // domains: {label: 'Domains', expanded: true},
        advanced: {label: 'Advanced', expanded: true},
    };

    public get sourceId(): string {
        return 'main-sidebar';
    }

    public get sourceElement(): HTMLElement {
        return this.panelContent!;
    }

    public get sourceAllowedBlockTypes(): string[] | null {
        return null;
    }

    async firstUpdated() {
        await this.updateComplete;

        this.dragDropManager.registerSourceZone(this);
    }

    render() {
        const categories = this.blockRegistry.getAllCategories();

        return html`
            <div class="panel-content" ${ref((el) => this.panelContent = el as HTMLElement)}>
                ${Object.entries(this.sections).map(
                        ([key, section]) => categories.includes(key) ? html`
                            <div class="block-section ${section.expanded ? 'expanded' : ''}">
                                <div class="block-section-header" @click=${() => this._toggleSection(key)}>
                                    ${section.label}
                                </div>
                                <div class="block-section-content">
                                    ${this.blockRegistry.getByCategory(key).map(
                                            (block) => html`
                                                <draggable-block
                                                        block-type="${block.type}"
                                                        icon="${block.icon}"
                                                        label="${block.label}"
                                                        data-block-type="${block.type}"
                                                        data-type="${block.type}"
                                                        data-dnd-draggable="true"
                                                ></draggable-block>
                                            `
                                    )}
                                </div>
                            </div>
                        ` : nothing
                )}
            </div>
        `;
    }

    private _toggleSection(key: string): void {
        this.sections = {
            ...this.sections,
            [key]: {
                ...this.sections[key],
                expanded: !this.sections[key].expanded,
            },
        };
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'panel-blocks': PanelBlocks;
    }
}
