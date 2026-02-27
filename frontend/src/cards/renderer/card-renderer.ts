import type { CardBuilderRendererCardConfig } from "@/cards/renderer/card-renderer-editor";
import { type CardData, type CardsService, getCardsService, getStylePresentsService } from "@/common/api";
import { BlockRegistry, blockRegistry as appBlockRegistry } from "@/common/blocks/core/registry/block-registry";
import { blockRegistryContext } from '@/common/blocks/core/registry/block-registry-context';
import type { RenderContext } from "@/common/blocks/core/renderer";
import { BlocksRenderer } from "@/common/blocks/core/renderer/blocks-renderer";
import type { BlockInterface } from "@/common/blocks/types";
import { BindingEvaluator } from "@/common/core/binding";
import { ContainerManager, containerManagerContext } from "@/common/core/container-manager/container-manager";
import { type EnvironmentContext, environmentContext } from "@/common/core/environment-context";
import { EventBus, eventBusContext } from "@/common/core/event-bus";
import { type BlockData, DocumentModel, documentModelContext } from '@/common/core/model';
import { migrateDocumentData } from '@/common/core/model/migration';
import { StyleResolver, styleResolverContext } from "@/common/core/style-resolver";
import { hassContext } from "@/common/types";
import { ContextProvider, provide } from "@lit/context";
import type { HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
import { css, html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { html as staticHtml } from "lit-html/static.js";
import { property, state } from 'lit/decorators.js';
import { ref } from "lit/directives/ref.js";
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from "lit/directives/style-map.js";

export const ENVIRONMENT_CONTEXT: EnvironmentContext = {
    isBuilder: false,
    blocksOutlineEnabled: false,
    actionsEnabled: true,
};

export class CardBuilderRendererCard extends LitElement implements LovelaceCard {
    static styles = css`
        .card-content {
            padding: 16px;
        }

        .card-content.loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100px;
        }

        .card-content.error {
            color: var(--error-color);
        }

        .card-content.placeholder {
            color: var(--secondary-text-color);
            text-align: center;
        }
    `

    @provide({context: environmentContext})
    protected environment: EnvironmentContext = ENVIRONMENT_CONTEXT;

    @provide({context: blockRegistryContext})
    protected blockRegistry: BlockRegistry = appBlockRegistry;

    @provide({context: containerManagerContext})
    protected containerManager: ContainerManager = new ContainerManager(); // FIXME: we should have a containerManager singleton!

    @provide({context: styleResolverContext})
    protected styleResolver!: StyleResolver;

    @provide({context: eventBusContext})
    protected eventBus: EventBus = new EventBus();

    protected hassProvider = new ContextProvider(this, {context: hassContext})
    protected _hass?: HomeAssistant;

    @property({attribute: false})
    set hass(hass: HomeAssistant) {
        this._hass = hass;

        if (this.styleResolver) {
            this.styleResolver.setBindingEvaluator(this._createBindingEvaluator());
        }
        this.hassProvider.setValue(hass);

    }

    /** Local DocumentModel instance for this card */
    @provide({context: documentModelContext})
    private documentModel = new DocumentModel();

    @state() private cards?: CardData[];
    @state() private _cardData?: CardData;
    @state() private _config?: CardBuilderRendererCardConfig;
    @state() private _loading = false;
    @state() private _error?: string;

    private _cardsService?: CardsService;
    private unsubscribe?: () => void;

    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement('card-builder-renderer-card-editor') as LovelaceCardEditor;
    }

    public static getStubConfig(): CardBuilderRendererCardConfig {
        return {
            type: 'custom:card-builder-renderer-card',
        };
    }

    async connectedCallback(): Promise<void> {
        await this._initializeStyleResolver();

        if (this._hass) {
            await this._loadCards();
            await this._subscribeToCardsUpdates();
        }

        super.connectedCallback();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();

        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    public setConfig(config: CardBuilderRendererCardConfig): void {
        if (!config) {
            throw new Error('Invalid configuration');
        }

        const oldCardId = this._config?.card_id;
        this._config = config;

        // Load card data if card_id changed or is newly set
        if (config.card_id && config.card_id !== oldCardId) {
            void this._loadCardData(config.card_id);
            return;
        }
        this._applySlotEntitiesFromConfig();
        this._applySlotActionsFromConfig();
    }

    public getCardSize(): number {
        return 3;
    }

    async updated(changedProps: PropertyValues) {
        super.updated(changedProps);

        if (changedProps.has('hass') && this._hass && !this._cardsService) {
            await this._loadCards();
            await this._subscribeToCardsUpdates();
        }

        // Load card data when hass becomes available
        if (changedProps.has('cards') && this._config?.card_id && !this._cardData && !this._loading) {
            await this._loadCardData(this._config.card_id);
        }
    }

    protected render() {
        if (!this._config || !this._hass) {
            return html``;
        }

        if (!this._config.card_id) {
            return html`
                <ha-card>
                    <div class="card-content placeholder">
                        <p>No card selected. Configure this card to select a Card Builder card.</p>
                    </div>
                </ha-card>
            `;
        }

        if (this._loading) {
            return html`
                <ha-card>
                    <div class="card-content loading">
                        <ha-circular-progress indeterminate></ha-circular-progress>
                    </div>
                </ha-card>
            `;
        }

        if (this._error) {
            return html`
                <ha-card>
                    <div class="card-content error">${this._error}</div>
                </ha-card>
            `;
        }

        // Use blocks from local DocumentModel
        const blocks = this.documentModel.blocks;
        const hasBlocks = Object.keys(blocks).length > 1; // More than just root block

        if (!this._cardData || !hasBlocks) {
            return html`
                <ha-card>
                    <div class="card-content placeholder">No card data available</div>
                </ha-card>
            `;
        }

        return html`
            <card-builder-renderer-card-canvas 
                .hass=${this._hass}
            >
            </card-builder-renderer-card-canvas>
        `;
    }

    private async _initializeStyleResolver() {
        try {
            const presetService = await getStylePresentsService(this._hass!);

            this.styleResolver = new StyleResolver(
                this.documentModel,
                this.containerManager,
                presetService,
                this.blockRegistry
            );

            // Set up binding evaluator if hass is available
            if (this._hass) {
                this.styleResolver.setBindingEvaluator(this._createBindingEvaluator());
            }
        } catch (error) {
            console.error('[CardBuilderRendererCard] Failed to initialize StyleResolver:', error);
        }
    }

    private async _loadCards() {
        if (!this._hass) return;

        this._cardsService = getCardsService(this._hass);
        this._loading = true;
        this._error = undefined;

        try {
            this.cards = await this._cardsService.listCards();
        } catch (err) {
            console.error('Failed to load cards:', err);
            this._error = `Failed to load cards: ${err}`;
        } finally {
            this._loading = false;
        }
    }

    private async _loadCardData(cardId: string): Promise<void> {
        if (!this._hass || this.cards === undefined) {
            return;
        }

        this._loading = true;
        this._error = undefined;

        try {
            const cardData = this.cards?.find(card => card.id === cardId);

            if (cardData) {
                this._cardData = cardData;

                // Load blocks into local DocumentModel
                const {config: migratedConfig} = migrateDocumentData(cardData.config);
                this.documentModel.loadFromConfig(migratedConfig);
                this._applySlotEntitiesFromConfig();
                this._applySlotActionsFromConfig();
            } else {
                this._cardData = undefined;
                this._error = `Card not found: ${cardId}`;
            }
        } catch (err) {
            console.error('Failed to load card:', err);
            this._cardData = undefined;
            this._error = `Failed to load card: ${err}`;
        } finally {
            this._loading = false;
        }
    }


    private async _subscribeToCardsUpdates(): Promise<void> {
        if (!this._cardsService) return;

        try {
            this.unsubscribe = await this._cardsService.subscribeToUpdates(() => {
                this._loadCards();
            });
        } catch (err) {
            console.error('Failed to subscribe to cards updates:', err);
        }
    }

    private _createBindingEvaluator(): BindingEvaluator {
        return new BindingEvaluator(this._hass!, {
            resolveSlotEntity: (slotId) => this.documentModel.resolveSlotEntity(slotId),
            onTemplateResult: () => {
                this.eventBus.dispatchEvent('template-updated');
            },
        });
    }

    private _applySlotEntitiesFromConfig(): void {
        const slotEntities = this._config?.slot_entities;
        if (!slotEntities) {
            return;
        }

        for (const slot of this.documentModel.getSlotEntities()) {
            if (!(slot.id in slotEntities)) {
                continue;
            }
            const entityId = slotEntities[slot.id];
            const nextEntityId = entityId.trim() || undefined;
            this.documentModel.updateSlotEntity(slot.id, {entityId: nextEntityId});
        }
    }

    private _applySlotActionsFromConfig(): void {
        const slotActions = this._config?.slot_actions;
        if (!slotActions) {
            return;
        }

        for (const slot of this.documentModel.getSlotActions()) {
            if (!(slot.id in slotActions)) {
                continue;
            }
            const action = slotActions[slot.id];
            if (!action || action.action === 'none') {
                continue;
            }
            this.documentModel.updateSlotAction(slot.id, {action});
        }
    }
}

export class CardBuilderRendererCardCanvas extends BlocksRenderer {
    connectedCallback() {
        super.connectedCallback();

        this.rootBlocks = Object
            .values(this.documentModel.blocks)
            .filter(block => block.parentId === this.documentModel.rootId);
    }

    render() {
        const {
            absoluteBlocks,
            staticBlocks,
            flowBlocks,
            haCardStyles,
            canvasStyles,
            canvasFlowContainerStyles
        } = this.getRenderData();

        return html`
            <ha-card style="${styleMap(haCardStyles)}">
                <div
                    class="canvas"
                    style="${styleMap(canvasStyles)}"
                    ${ref((el) => this.canvas = el as HTMLElement)}
                >
                    ${repeat(absoluteBlocks, (block) => block.id, (block) => this.renderBlock(block))}
                    ${repeat(staticBlocks, (block) => block.id, (block) => this.renderBlock(block))}
                    <div 
                        class="canvas-flow-container"
                        style="${styleMap(canvasFlowContainerStyles)}"
                        ${ref((el) => this.canvasFlowContainer = el as HTMLElement)}
                    >
                        ${repeat(flowBlocks, (block) => block.id, (block) => this.renderBlock(block))}
                    </div>
                </div>
            </ha-card>
        `;
    }

    protected doBlockRender(block: BlockData, context: RenderContext): TemplateResult {
        return staticHtml`
          <${context.tag}
            block-id="${block.id}"
            .block=${block}
            .renderer="${this}"
            .activeContainerId=${this.containerManager.getActiveContainer().id}
            ${ref((el) => this.documentModel.registerElement(block.id, el as BlockInterface))}
          ></${context.tag}>
      `;
    }
}

interface HomeAssistantCustomCard {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}

declare global {
  interface Window {
    customCards: HomeAssistantCustomCard[];
  }
}

// Register the card in the customElements registry
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'card-builder-renderer-card',
    name: 'Card Builder Card',
    description: 'Render a card created with Card Builder',
});

declare global {
    interface HTMLElementTagNameMap {
        'card-builder-renderer-card': CardBuilderRendererCard;
        'card-builder-renderer-card-canvas': CardBuilderRendererCardCanvas;
    }
}

import { cardRendererComponentsRegistry } from '@/cards/renderer/registry';
cardRendererComponentsRegistry.define('card-builder-renderer-card', CardBuilderRendererCard);
cardRendererComponentsRegistry.define('card-builder-renderer-card-canvas', CardBuilderRendererCardCanvas);
