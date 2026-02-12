import{C as t,c as e,o as a,E as s,m as i,n as r,e as o,S as d,r as c,B as n,q as l,b as h,j as p,s as u,k as v,a as g,l as _}from"./card-builder-shared-CdEXSN8H.js";import{aD as f,aQ as b,aB as y,aE as m,aR as x,aC as C,aG as w,aM as $,aL as k,aN as S,aP as E}from"./card-builder-shared-BlFcJoge.js";import"./card-builder-shared-DUFN59qu.js";const F=new t;var B=Object.defineProperty,D=Object.getOwnPropertyDescriptor,M=(t,e,a,s)=>{for(var i,r=s>1?void 0:s?D(e,a):e,o=t.length-1;o>=0;o--)(i=t[o])&&(r=(s?i(e,a,r):i(r))||r);return s&&r&&B(e,a,r),r};const R=class extends f{constructor(){super(...arguments),this.environment={isBuilder:!1,blocksOutlineEnabled:!1},this.blockRegistry=e,this.deviceManager=new a,this.eventBus=new s,this.hassProvider=new b(this,{context:i}),this.documentModel=new r,this._loading=!1}set hass(t){this._hass=t,this.styleResolver&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator()),this.hassProvider.setValue(t)}static async getConfigElement(){return document.createElement("card-builder-renderer-card-editor")}static getStubConfig(){return{type:"custom:card-builder-renderer-card"}}async connectedCallback(){await this._initializeStyleResolver(),this._hass&&(await this._loadCards(),await this._subscribeToCardsUpdates()),super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}setConfig(t){var e;if(!t)throw new Error("Invalid configuration");const a=null==(e=this._config)?void 0:e.card_id;this._config=t,t.card_id&&t.card_id!==a?this._loadCardData(t.card_id):this._applySlotEntitiesFromConfig()}getCardSize(){return 3}async updated(t){var e;super.updated(t),t.has("hass")&&this._hass&&!this._cardsService&&(await this._loadCards(),await this._subscribeToCardsUpdates()),t.has("cards")&&(null==(e=this._config)?void 0:e.card_id)&&!this._cardData&&!this._loading&&await this._loadCardData(this._config.card_id)}render(){if(!this._config||!this._hass)return m``;if(!this._config.card_id)return m`
                <ha-card>
                    <div class="card-content placeholder">
                        <p>No card selected. Configure this card to select a Card Builder card.</p>
                    </div>
                </ha-card>
            `;if(this._loading)return m`
                <ha-card>
                    <div class="card-content loading">
                        <ha-circular-progress indeterminate></ha-circular-progress>
                    </div>
                </ha-card>
            `;if(this._error)return m`
                <ha-card>
                    <div class="card-content error">${this._error}</div>
                </ha-card>
            `;const t=this.documentModel.blocks,e=Object.keys(t).length>1;return this._cardData&&e?m`
            <card-builder-renderer-card-canvas 
                .hass=${this._hass}
            >
            </card-builder-renderer-card-canvas>
        `:m`
                <ha-card>
                    <div class="card-content placeholder">No card data available</div>
                </ha-card>
            `}async _initializeStyleResolver(){try{const t=await o(this._hass);this.styleResolver=new d(this.documentModel,this.deviceManager,t,this.blockRegistry,{enableCache:!0,evaluateBindings:!0}),this._hass&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator())}catch(t){console.error("[CardBuilderRendererCard] Failed to initialize StyleResolver:",t)}}async _loadCards(){if(this._hass){this._cardsService=c(this._hass),this._loading=!0,this._error=void 0;try{this.cards=await this._cardsService.listCards()}catch(t){console.error("Failed to load cards:",t),this._error=`Failed to load cards: ${t}`}finally{this._loading=!1}}}async _loadCardData(t){var e;if(this._hass&&void 0!==this.cards){this._loading=!0,this._error=void 0;try{const a=null==(e=this.cards)?void 0:e.find(e=>e.id===t);if(a){this._cardData=a;const t=a.config;t&&"object"==typeof t&&(this.documentModel.loadFromConfig(t),this._applySlotEntitiesFromConfig())}else this._cardData=void 0,this._error=`Card not found: ${t}`}catch(a){console.error("Failed to load card:",a),this._cardData=void 0,this._error=`Failed to load card: ${a}`}finally{this._loading=!1}}}async _subscribeToCardsUpdates(){if(this._cardsService)try{this.unsubscribe=await this._cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(t){console.error("Failed to subscribe to cards updates:",t)}}_createBindingEvaluator(){return new n(this._hass,{resolveSlotEntity:t=>this.documentModel.resolveSlotEntity(t)})}_applySlotEntitiesFromConfig(){var t;const e=null==(t=this._config)?void 0:t.slot_entities;if(e)for(const a of this.documentModel.getSlots()){if(!(a.id in e))continue;const t=e[a.id].trim()||void 0;this.documentModel.updateSlot(a.id,{entityId:t})}}};R.styles=y`
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
    `;let j=R;M([x({context:l})],j.prototype,"environment",2),M([x({context:h})],j.prototype,"blockRegistry",2),M([x({context:p})],j.prototype,"deviceManager",2),M([x({context:u})],j.prototype,"styleResolver",2),M([x({context:v})],j.prototype,"eventBus",2),M([C({attribute:!1})],j.prototype,"hass",1),M([x({context:g})],j.prototype,"documentModel",2),M([w()],j.prototype,"cards",2),M([w()],j.prototype,"_cardData",2),M([w()],j.prototype,"_config",2),M([w()],j.prototype,"_loading",2),M([w()],j.prototype,"_error",2);window.customCards=window.customCards||[],window.customCards.push({type:"card-builder-renderer-card",name:"Card Builder Card",description:"Render a card created with Card Builder"}),F.define("card-builder-renderer-card",j),F.define("card-builder-renderer-card-canvas",class extends _{connectedCallback(){super.connectedCallback(),this.rootBlocks=Object.values(this.documentModel.blocks).filter(t=>t.parentId===this.documentModel.rootId)}render(){const{absoluteBlocks:t,flowBlocks:e,haCardStyles:a,canvasStyles:s,canvasFlowContainerStyles:i}=this.getRenderData();return m`
            <ha-card style="${$(a)}">
                <div
                    class="canvas"
                    style="${$(s)}"
                    ${k(t=>this.canvas=t)}
                >
                    ${S(t,t=>t.id,t=>this.renderBlock(t))}
                    <div 
                        class="canvas-flow-container"
                        style="${$(i)}"
                        ${k(t=>this.canvasFlowContainer=t)}
                    >
                        ${S(e,t=>t.id,t=>this.renderBlock(t))}
                    </div>
                </div>
            </ha-card>
        `}doBlockRender(t,e){return E`
          <${e.tag}
            block-id="${t.id}"
            .block=${t}
            .renderer="${this}"
            .documentModel=${this.documentModel}
            .deviceManager=${this.deviceManager}
            .activeDeviceId=${this.deviceManager.getActiveDevice().id}
            ${k(e=>this.documentModel.registerElement(t.id,e))}
          ></${e.tag}>
      `}});var z=Object.defineProperty,I=(t,e,a,s)=>{for(var i,r=void 0,o=t.length-1;o>=0;o--)(i=t[o])&&(r=i(e,a,r)||r);return r&&z(e,a,r),r};const U=class extends f{constructor(){super(...arguments),this._cards=[],this._loading=!0,this._slots=[],this._documentModel=new r}async connectedCallback(){super.connectedCallback(),this.hass&&(await this._loadCards(),await this._subscribeToCardsUpdates())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}setConfig(t){this._config=t,(null==t?void 0:t.card_id)?this._loadCardData(t.card_id):this._slots=[]}async updated(t){t.has("hass")&&this.hass&&!this._cardsService&&(await this._loadCards(),await this._subscribeToCardsUpdates())}render(){if(!this._config)return m``;const t=this._config.slot_entities||{};return m`
            <div class="card-config">
                ${this._loading?m`
                            <div class="loading">
                                <ha-circular-progress active></ha-circular-progress>
                                <p>Loading cards...</p>
                            </div>
                        `:m`
                            <label class="select-label">
                                Select Card
                                ${0===this._cards.length?m`
                                            <p class="no-cards">
                                                No cards available. Create a card in the Card Builder panel first.
                                            </p>
                                        `:m`
                                            <select @change=${this._cardSelected}>
                                                <option value="">-- Select a card --</option>
                                                ${this._cards.map(t=>{var e;return m`
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

                ${this._config.card_id?m`
                            <p class="info">
                                Selected card ID: <code>${this._config.card_id}</code>
                            </p>
                        `:m``}

                ${this._config.card_id&&this._slots.length?m`
                            <div class="slots-config">
                                <div class="slots-title">Slot entities</div>
                                ${this._slots.map(e=>{var a;const s=[e.description||"",e.domains&&e.domains.length>0?`Domains: ${e.domains.join(", ")}`:"",(null==(a=e.entityId)?void 0:a.trim())?`Default: ${e.entityId}`:""].filter(Boolean).join(" • ");return m`
                                                <div class="slot-row">
                                                    <div class="slot-label">
                                                        <div class="slot-name">${e.name||e.id}</div>
                                                        <div class="slot-id">${e.id}</div>
                                                    </div>
                                                    <ha-selector
                                                        .hass=${this.hass}
                                                        .selector=${{entity:{multiple:!1,domain:e.domains&&e.domains.length>0?e.domains:void 0}}}
                                                        .value=${t[e.id]??""}
                                                        @value-changed=${t=>this._slotEntityChanged(t,e)}
                                                        allow-custom-entity
                                                    ></ha-selector>
                                                    ${s?m`<div class="slot-helper">${s}</div>`:m``}
                                                </div>
                                            `})}
                            </div>
                        `:m``}
            </div>
        `}async _loadCards(){var t;if(this.hass){this._cardsService=c(this.hass),this._loading=!0;try{this._cards=await this._cardsService.listCards(),(null==(t=this._config)?void 0:t.card_id)&&await this._loadCardData(this._config.card_id)}catch(e){console.error("Failed to load cards:",e)}finally{this._loading=!1}}}async _subscribeToCardsUpdates(){if(this._cardsService)try{this.unsubscribe=await this._cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(t){console.error("Failed to subscribe to cards updates:",t)}}async _loadCardData(t){var e;const a=null==(e=this._cards)?void 0:e.find(e=>e.id===t);if(!a)return void(this._slots=[]);const s=a.config;s&&"object"==typeof s?(this._documentModel.loadFromConfig(s),this._slots=this._documentModel.getSlots()):this._slots=[]}_cardSelected(t){if(!this._config||!this.hass)return;const e=t.target.value;if(this._config.card_id===e)return;const a={...this._config,card_id:e,slot_entities:{}},s=new CustomEvent("config-changed",{detail:{config:a},bubbles:!0,composed:!0});this.dispatchEvent(s)}_slotEntityChanged(t,e){var a;if(!this._config||!this.hass)return;let s=(null==(a=t.detail)?void 0:a.value)??"";s="string"==typeof s?s.trim():"";const i={...this._config.slot_entities||{}};s?i[e.id]=s:delete i[e.id];const r={...this._config,slot_entities:i},o=new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0});this.dispatchEvent(o)}};U.styles=y`
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
    `;let T=U;I([C({attribute:!1})],T.prototype,"hass"),I([w()],T.prototype,"_config"),I([w()],T.prototype,"_cards"),I([w()],T.prototype,"_loading"),I([w()],T.prototype,"_slots"),F.define("card-builder-renderer-card-editor",T);const O="CARD-BUILDER-RENDERER",P="0.1.0",N="#1976d2",L="#FFFFFF",A="#ff7043",q="#FFFFFF";console.info(`%c ${O} %c v${P}`,`background: ${N}; color: ${L}; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;`,`background: ${A}; color: ${q}; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;`),F.boot();