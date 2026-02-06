import{b as t,j as e,s as a,k as s,a as r,c as i,o,E as d,m as c,n,e as l,S as h,q as p,B as u,l as g}from"./card-builder-shared-Bd8OtdC0.js";import{aB as v,aR as _,aC as f,aG as b,aD as y,aQ as m,aE as x,aF as C,aM as w,aL as $,aN as k,aP as S}from"./card-builder-shared-DM_W7S1D.js";import"./card-builder-shared-Ky8KdkrL.js";const F="CARD-BUILDER-RENDERER",E="1.0.0",B="#1976d2",D="#FFFFFF",M="#ff7043",R="#FFFFFF";var j=Object.defineProperty,z=Object.getOwnPropertyDescriptor,I=(t,e,a,s)=>{for(var r,i=s>1?void 0:s?z(e,a):e,o=t.length-1;o>=0;o--)(r=t[o])&&(i=(s?r(e,a,i):r(i))||i);return s&&i&&j(e,a,i),i};let U=class extends y{constructor(){super(...arguments),this.blockRegistry=i,this.deviceManager=new o,this.eventBus=new d,this.hassProvider=new m(this,{context:c}),this.documentModel=new n,this._loading=!1}set hass(t){this._hass=t,this.styleResolver&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator()),this.hassProvider.setValue(t)}static async getConfigElement(){return document.createElement("card-builder-renderer-card-editor")}static getStubConfig(){return{type:"custom:card-builder-renderer-card"}}async connectedCallback(){await this._initializeStyleResolver(),this._hass&&(await this._loadCards(),await this._subscribeToCardsUpdates()),super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}setConfig(t){var e;if(!t)throw new Error("Invalid configuration");const a=null==(e=this._config)?void 0:e.card_id;this._config=t,t.card_id&&t.card_id!==a?this._loadCardData(t.card_id):this._applySlotEntitiesFromConfig()}getCardSize(){return 3}async updated(t){var e;super.updated(t),t.has("hass")&&this._hass&&!this._cardsService&&(await this._loadCards(),await this._subscribeToCardsUpdates()),t.has("cards")&&(null==(e=this._config)?void 0:e.card_id)&&!this._cardData&&!this._loading&&await this._loadCardData(this._config.card_id)}render(){if(!this._config||!this._hass)return x``;if(!this._config.card_id)return x`
                <ha-card>
                    <div class="card-content placeholder">
                        <p>No card selected. Configure this card to select a Card Builder card.</p>
                    </div>
                </ha-card>
            `;if(this._loading)return x`
                <ha-card>
                    <div class="card-content loading">
                        <ha-circular-progress indeterminate></ha-circular-progress>
                    </div>
                </ha-card>
            `;if(this._error)return x`
                <ha-card>
                    <div class="card-content error">${this._error}</div>
                </ha-card>
            `;const t=this.documentModel.blocks,e=Object.keys(t).length>1;return this._cardData&&e?x`
            <card-builder-renderer-card-canvas 
                .hass=${this._hass}
            >
            </card-builder-renderer-card-canvas>
        `:x`
                <ha-card>
                    <div class="card-content placeholder">No card data available</div>
                </ha-card>
            `}async _initializeStyleResolver(){try{const t=await l(this._hass);this.styleResolver=new h(this.documentModel,t,this.blockRegistry,{enableCache:!0,evaluateBindings:!0}),this._hass&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator())}catch(t){console.error("[CardBuilderRendererCard] Failed to initialize StyleResolver:",t)}}async _loadCards(){if(this._hass){this._cardsService=p(this._hass),this._loading=!0,this._error=void 0;try{this.cards=await this._cardsService.listCards()}catch(t){console.error("Failed to load cards:",t),this._error=`Failed to load cards: ${t}`}finally{this._loading=!1}}}async _loadCardData(t){var e;if(this._hass&&void 0!==this.cards){this._loading=!0,this._error=void 0;try{const a=null==(e=this.cards)?void 0:e.find(e=>e.id===t);if(a){this._cardData=a;const t=a.config;t&&"object"==typeof t&&(this.documentModel.loadFromConfig(t),this._applySlotEntitiesFromConfig())}else this._cardData=void 0,this._error=`Card not found: ${t}`}catch(a){console.error("Failed to load card:",a),this._cardData=void 0,this._error=`Failed to load card: ${a}`}finally{this._loading=!1}}}async _subscribeToCardsUpdates(){if(this._cardsService)try{this.unsubscribe=await this._cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(t){console.error("Failed to subscribe to cards updates:",t)}}_createBindingEvaluator(){return new u(this._hass,{resolveSlotEntity:t=>this.documentModel.resolveSlotEntity(t)})}_applySlotEntitiesFromConfig(){var t;const e=null==(t=this._config)?void 0:t.slot_entities;if(e)for(const a of this.documentModel.getSlots()){if(!(a.id in e))continue;const t=e[a.id].trim()||void 0;this.documentModel.updateSlot(a.id,{entityId:t})}}};U.styles=v`
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
    `,I([_({context:t})],U.prototype,"blockRegistry",2),I([_({context:e})],U.prototype,"deviceManager",2),I([_({context:a})],U.prototype,"styleResolver",2),I([_({context:s})],U.prototype,"eventBus",2),I([f({attribute:!1})],U.prototype,"hass",1),I([_({context:r})],U.prototype,"documentModel",2),I([b()],U.prototype,"cards",2),I([b()],U.prototype,"_cardData",2),I([b()],U.prototype,"_config",2),I([b()],U.prototype,"_loading",2),I([b()],U.prototype,"_error",2),U=I([C("card-builder-renderer-card")],U);let T=class extends y{constructor(){super(...arguments),this._cards=[],this._loading=!0,this._slots=[],this._documentModel=new n}async connectedCallback(){super.connectedCallback(),this.hass&&(await this._loadCards(),await this._subscribeToCardsUpdates())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}setConfig(t){this._config=t,(null==t?void 0:t.card_id)?this._loadCardData(t.card_id):this._slots=[]}async updated(t){t.has("hass")&&this.hass&&!this._cardsService&&(await this._loadCards(),await this._subscribeToCardsUpdates())}render(){if(!this._config)return x``;const t=this._config.slot_entities||{};return x`
            <div class="card-config">
                ${this._loading?x`
                            <div class="loading">
                                <ha-circular-progress active></ha-circular-progress>
                                <p>Loading cards...</p>
                            </div>
                        `:x`
                            <label class="select-label">
                                Select Card
                                ${0===this._cards.length?x`
                                            <p class="no-cards">
                                                No cards available. Create a card in the Card Builder panel first.
                                            </p>
                                        `:x`
                                            <select @change=${this._cardSelected}>
                                                <option value="">-- Select a card --</option>
                                                ${this._cards.map(t=>{var e;return x`
                                                            <option
                                                                    value=${t.id}
                                                                    ?selected=${(null==(e=this._config)?void 0:e.card_id)===t.id}
                                                            >
                                                                ${t.name}${t.description?` - ${t.description}`:""}
                                                            </option>
                                                        `})}
                                            </select>
                                        `}
                            </label>
                        `}

                ${this._config.card_id?x`
                            <p class="info">
                                Selected card ID: <code>${this._config.card_id}</code>
                            </p>
                        `:x``}

                ${this._config.card_id&&this._slots.length?x`
                            <div class="slots-config">
                                <div class="slots-title">Slot entities</div>
                                ${this._slots.map(e=>{var a;const s=[e.description||"",(null==(a=e.entityId)?void 0:a.trim())?`Default: ${e.entityId}`:""].filter(Boolean).join(" • ");return x`
                                                <div class="slot-row">
                                                    <div class="slot-label">
                                                        <div class="slot-name">${e.name||e.id}</div>
                                                        <div class="slot-id">${e.id}</div>
                                                    </div>
                                                    <ha-selector
                                                        .hass=${this.hass}
                                                        .selector=${{entity:{multiple:!1}}}
                                                        .value=${t[e.id]??""}
                                                        @value-changed=${t=>this._slotEntityChanged(t,e)}
                                                        allow-custom-entity
                                                    ></ha-selector>
                                                    ${s?x`<div class="slot-helper">${s}</div>`:x``}
                                                </div>
                                            `})}
                            </div>
                        `:x``}
            </div>
        `}async _loadCards(){var t;if(this.hass){this._cardsService=p(this.hass),this._loading=!0;try{this._cards=await this._cardsService.listCards(),(null==(t=this._config)?void 0:t.card_id)&&await this._loadCardData(this._config.card_id)}catch(e){console.error("Failed to load cards:",e)}finally{this._loading=!1}}}async _subscribeToCardsUpdates(){if(this._cardsService)try{this.unsubscribe=await this._cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(t){console.error("Failed to subscribe to cards updates:",t)}}async _loadCardData(t){var e;const a=null==(e=this._cards)?void 0:e.find(e=>e.id===t);if(!a)return void(this._slots=[]);const s=a.config;s&&"object"==typeof s?(this._documentModel.loadFromConfig(s),this._slots=this._documentModel.getSlots()):this._slots=[]}_cardSelected(t){if(!this._config||!this.hass)return;const e=t.target.value;if(this._config.card_id===e)return;const a={...this._config,card_id:e,slot_entities:{}},s=new CustomEvent("config-changed",{detail:{config:a},bubbles:!0,composed:!0});this.dispatchEvent(s)}_slotEntityChanged(t,e){var a;if(!this._config||!this.hass)return;let s=(null==(a=t.detail)?void 0:a.value)??"";s="string"==typeof s?s.trim():"";const r={...this._config.slot_entities||{}};s?r[e.id]=s:delete r[e.id];const i={...this._config,slot_entities:r},o=new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0});this.dispatchEvent(o)}};T.styles=v`
        .card-config {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 24px;
        }

        .loading p {
            margin: 0;
            color: var(--secondary-text-color);
        }

        .select-label {
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-weight: 500;
            color: var(--primary-text-color);
        }

        select {
            width: 100%;
            padding: 8px 12px;
            font-size: 14px;
            background-color: var(--card-background-color);
            color: var(--primary-text-color);
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            cursor: pointer;
        }

        select:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        .no-cards {
            margin: 0;
            padding: 16px;
            background-color: var(--warning-color);
            color: var(--text-primary-color);
            border-radius: 4px;
            font-size: 0.9em;
        }

        .info {
            margin: 0;
            padding: 12px;
            background-color: var(--secondary-background-color);
            border-radius: 4px;
            color: var(--secondary-text-color);
            font-size: 0.9em;
        }

        .info code {
            padding: 2px 6px;
            background-color: var(--primary-background-color);
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.95em;
        }

        .slots-config {
            display: flex;
            flex-direction: column;
            gap: 12px;
            border-top: 1px solid var(--divider-color);
            padding-top: 12px;
        }

        .slots-title {
            font-weight: 600;
            color: var(--primary-text-color);
        }

        .slot-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 10px;
            border: 1px solid var(--divider-color);
            border-radius: 6px;
            background: var(--secondary-background-color);
        }

        .slot-label {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .slot-name {
            font-weight: 600;
        }

        .slot-id {
            font-size: 12px;
            color: var(--secondary-text-color);
        }

        .slot-helper {
            font-size: 12px;
            color: var(--secondary-text-color);
        }
    `,I([f({attribute:!1})],T.prototype,"hass",2),I([b()],T.prototype,"_config",2),I([b()],T.prototype,"_cards",2),I([b()],T.prototype,"_loading",2),I([b()],T.prototype,"_slots",2),T=I([C("card-builder-renderer-card-editor")],T);let N=class extends g{connectedCallback(){super.connectedCallback(),this.rootBlocks=Object.values(this.documentModel.blocks).filter(t=>t.parentId===this.documentModel.rootId)}render(){const{absoluteBlocks:t,flowBlocks:e,haCardStyles:a,canvasStyles:s,canvasFlowContainerStyles:r}=this.getRenderData();return x`
            <ha-card style="${w(a)}">
                <div
                    class="canvas"
                    style="${w(s)}"
                    ${$(t=>this.canvas=t)}
                >
                    ${k(t,t=>t.id,t=>this.renderBlock(t))}
                    <div 
                        class="canvas-flow-container"
                        style="${w(r)}"
                    >
                        ${k(e,t=>t.id,t=>this.renderBlock(t))}
                    </div>
                </div>
            </ha-card>
        `}doBlockRender(t,e){return S`
          <${e.tag}
            block-id="${t.id}"
            .block=${t}
            .renderer="${this}"
            .documentModel=${this.documentModel}
            .deviceManager=${this.deviceManager}
            .activeDeviceId=${this.deviceManager.getActiveDevice().id}
            ${$(e=>this.documentModel.registerElement(t.id,e))}
          ></${e.tag}>
      `}};N=I([C("card-builder-renderer-card-canvas")],N),window.customCards=window.customCards||[],window.customCards.push({type:"card-builder-renderer-card",name:"Card Builder Card",description:"Render a card created with Card Builder"}),console.info(`%c ${F} %c v${E}`,`background: ${B}; color: ${D}; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;`,`background: ${M}; color: ${R}; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;`);
