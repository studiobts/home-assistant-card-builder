import{C as t,F as i,G as e,I as o,A as a,E as s,n as r,S as n,Q as d,M as c,B as l,O as h,b as p,s as u,t as g,e as v,a as _,u as f}from"./card-builder-shared-u1WmmQKf.js";import{aD as b,aR as m,aB as y,aE as C,aS as $,aC as x,aH as w,aN as S,aM as k,aO as E,aQ as F}from"./card-builder-shared-BOSUXB7z.js";import"./card-builder-shared-CR_SzKoS.js";const B=new t;var M=Object.defineProperty,D=Object.getOwnPropertyDescriptor,R=(t,i,e,o)=>{for(var a,s=o>1?void 0:o?D(i,e):i,r=t.length-1;r>=0;r--)(a=t[r])&&(s=(o?a(i,e,s):a(s))||s);return o&&s&&M(i,e,s),s};const A={isBuilder:!1,blocksOutlineEnabled:!1,actionsEnabled:!0},T=class extends b{constructor(){super(...arguments),this.environment=A,this.blockRegistry=i,this.containerManager=new e,this.eventBus=new o,this.hassProvider=new m(this,{context:a}),this.documentModel=new s,this._loading=!1}set hass(t){this._hass=t,this.styleResolver&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator()),this.hassProvider.setValue(t)}static async getConfigElement(){return document.createElement("card-builder-renderer-card-editor")}static getStubConfig(){return{type:"custom:card-builder-renderer-card"}}async connectedCallback(){await this._initializeStyleResolver(),this._hass&&(await this._loadCards(),await this._subscribeToCardsUpdates()),super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}setConfig(t){var i;if(!t)throw new Error("Invalid configuration");const e=null==(i=this._config)?void 0:i.card_id;this._config=t,t.card_id&&t.card_id!==e?this._loadCardData(t.card_id):(this._applySlotEntitiesFromConfig(),this._applySlotActionsFromConfig())}getCardSize(){return 3}async updated(t){var i;super.updated(t),t.has("hass")&&this._hass&&!this._cardsService&&(await this._loadCards(),await this._subscribeToCardsUpdates()),t.has("cards")&&(null==(i=this._config)?void 0:i.card_id)&&!this._cardData&&!this._loading&&await this._loadCardData(this._config.card_id)}render(){if(!this._config||!this._hass)return C``;if(!this._config.card_id)return C`
                <ha-card>
                    <div class="card-content placeholder">
                        <p>No card selected. Configure this card to select a Card Builder card.</p>
                    </div>
                </ha-card>
            `;if(this._loading)return C`
                <ha-card>
                    <div class="card-content loading">
                        <ha-circular-progress indeterminate></ha-circular-progress>
                    </div>
                </ha-card>
            `;if(this._error)return C`
                <ha-card>
                    <div class="card-content error">${this._error}</div>
                </ha-card>
            `;const t=this.documentModel.blocks,i=Object.keys(t).length>1;return this._cardData&&i?C`
            <card-builder-renderer-card-canvas 
                .hass=${this._hass}
            >
            </card-builder-renderer-card-canvas>
        `:C`
                <ha-card>
                    <div class="card-content placeholder">No card data available</div>
                </ha-card>
            `}async _initializeStyleResolver(){try{const t=await r(this._hass);this.styleResolver=new n(this.documentModel,this.containerManager,t,this.blockRegistry),this._hass&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator())}catch(t){console.error("[CardBuilderRendererCard] Failed to initialize StyleResolver:",t)}}async _loadCards(){if(this._hass){this._cardsService=d(this._hass),this._loading=!0,this._error=void 0;try{this.cards=await this._cardsService.listCards()}catch(t){console.error("Failed to load cards:",t),this._error=`Failed to load cards: ${t}`}finally{this._loading=!1}}}async _loadCardData(t){var i;if(this._hass&&void 0!==this.cards){this._loading=!0,this._error=void 0;try{const e=null==(i=this.cards)?void 0:i.find(i=>i.id===t);if(e){this._cardData=e;const{config:t}=c(e.config);this.documentModel.loadFromConfig(t),this._applySlotEntitiesFromConfig(),this._applySlotActionsFromConfig()}else this._cardData=void 0,this._error=`Card not found: ${t}`}catch(e){console.error("Failed to load card:",e),this._cardData=void 0,this._error=`Failed to load card: ${e}`}finally{this._loading=!1}}}async _subscribeToCardsUpdates(){if(this._cardsService)try{this.unsubscribe=await this._cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(t){console.error("Failed to subscribe to cards updates:",t)}}_createBindingEvaluator(){return new l(this._hass,{resolveSlotEntity:t=>this.documentModel.resolveSlotEntity(t),onTemplateResult:()=>{this.eventBus.dispatchEvent("template-updated")}})}_applySlotEntitiesFromConfig(){var t;const i=null==(t=this._config)?void 0:t.slot_entities;if(i)for(const e of this.documentModel.getSlotEntities()){if(!(e.id in i))continue;const t=i[e.id].trim()||void 0;this.documentModel.updateSlotEntity(e.id,{entityId:t})}}_applySlotActionsFromConfig(){var t;const i=null==(t=this._config)?void 0:t.slot_actions;if(i)for(const e of this.documentModel.getSlotActions()){if(!(e.id in i))continue;const t=i[e.id];t&&"none"!==t.action&&this.documentModel.updateSlotAction(e.id,{action:t})}}};T.styles=y`
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
    `;let j=T;R([$({context:h})],j.prototype,"environment",2),R([$({context:p})],j.prototype,"blockRegistry",2),R([$({context:u})],j.prototype,"containerManager",2),R([$({context:g})],j.prototype,"styleResolver",2),R([$({context:v})],j.prototype,"eventBus",2),R([x({attribute:!1})],j.prototype,"hass",1),R([$({context:_})],j.prototype,"documentModel",2),R([w()],j.prototype,"cards",2),R([w()],j.prototype,"_cardData",2),R([w()],j.prototype,"_config",2),R([w()],j.prototype,"_loading",2),R([w()],j.prototype,"_error",2);window.customCards=window.customCards||[],window.customCards.push({type:"card-builder-renderer-card",name:"Card Builder Card",description:"Render a card created with Card Builder"}),B.define("card-builder-renderer-card",j),B.define("card-builder-renderer-card-canvas",class extends f{connectedCallback(){super.connectedCallback(),this.rootBlocks=Object.values(this.documentModel.blocks).filter(t=>t.parentId===this.documentModel.rootId)}render(){const{absoluteBlocks:t,staticBlocks:i,flowBlocks:e,haCardStyles:o,canvasStyles:a,canvasFlowContainerStyles:s}=this.getRenderData();return C`
            <ha-card style="${S(o)}">
                <div
                    class="canvas"
                    style="${S(a)}"
                    ${k(t=>this.canvas=t)}
                >
                    ${E(t,t=>t.id,t=>this.renderBlock(t))}
                    ${E(i,t=>t.id,t=>this.renderBlock(t))}
                    <div 
                        class="canvas-flow-container"
                        style="${S(s)}"
                        ${k(t=>this.canvasFlowContainer=t)}
                    >
                        ${E(e,t=>t.id,t=>this.renderBlock(t))}
                    </div>
                </div>
            </ha-card>
        `}doBlockRender(t,i){return F`
          <${i.tag}
            block-id="${t.id}"
            .block=${t}
            .renderer="${this}"
            .activeContainerId=${this.containerManager.getActiveContainer().id}
            ${k(i=>this.documentModel.registerElement(t.id,i))}
          ></${i.tag}>
      `}});var I=Object.defineProperty,z=(t,i,e,o)=>{for(var a,s=void 0,r=t.length-1;r>=0;r--)(a=t[r])&&(s=a(i,e,s)||s);return s&&I(i,e,s),s};const O={tap:"Tap",double_tap:"Double Tap",hold:"Hold"},U=class extends b{constructor(){super(...arguments),this._cards=[],this._loading=!0,this._slots=[],this._actionSlots=[],this._documentModel=new s}async connectedCallback(){super.connectedCallback(),this.hass&&(await this._loadCards(),await this._subscribeToCardsUpdates())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}setConfig(t){this._config=t,(null==t?void 0:t.card_id)?this._loadCardData(t.card_id):(this._slots=[],this._actionSlots=[])}async updated(t){t.has("hass")&&this.hass&&!this._cardsService&&(await this._loadCards(),await this._subscribeToCardsUpdates())}render(){if(!this._config)return C``;const t=this._config.slot_entities||{},i=this._config.slot_actions||{};return C`
            <div class="card-config">
                ${this._loading?C`
                <div class="loading">
                    <ha-circular-progress active></ha-circular-progress>
                    <p>Loading cards...</p>
                </div>
            `:C`
                            <label class="select-label">
                                Select Card
                                ${0===this._cards.length?C`
                                            <p class="no-cards">
                                                No cards available. Create a card in the Card Builder panel first.
                                            </p>
                                        `:C`
                                            <select @change=${this._cardSelected}>
                                                <option value="">-- Select a card --</option>
                                                ${this._cards.map(t=>{var i;return C`
                                                            <option
                                                                    value=${t.id}
                                                                    ?selected=${(null==(i=this._config)?void 0:i.card_id)===t.id}
                                                            >
                                                                ${t.name}${t.description?` - ${t.description}`:""}
                                                            </option>
                                                        `})}
                                            </select>
                                        `}
                            </label>
                        `}

                ${this._config.card_id?C`
                            <p class="info">
                                Selected card ID: <code>${this._config.card_id}</code>
                            </p>
                        `:C``}

                ${this._config.card_id&&this._slots.length?C`
                            <div class="slots-config">
                                <div class="slots-title">Slot entities</div>
                                ${this._slots.map(i=>{var e;const o=[i.description||"",i.domains&&i.domains.length>0?`Domains: ${i.domains.join(", ")}`:"",(null==(e=i.entityId)?void 0:e.trim())?`Default: ${i.entityId}`:""].filter(Boolean).join(" • ");return C`
                        <div class="slot-row">
                            <div class="slot-label">
                                <div class="slot-name">${i.name||i.id}</div>
                                <div class="slot-id">${i.id}</div>
                            </div>
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{entity:{multiple:!1,domain:i.domains&&i.domains.length>0?i.domains:void 0}}}
                                .value=${t[i.id]??""}
                                @value-changed=${t=>this._slotEntityChanged(t,i)}
                                allow-custom-entity
                            ></ha-selector>
                            ${o?C`<div class="slot-helper">${o}</div>`:C``}
                        </div>
                    `})}
                            </div>
                        `:C``}

                ${this._config.card_id&&this._actionSlots.length?C`
                            <div class="slots-config">
                                <div class="slots-title">Action slots</div>
                                ${this._actionSlots.map(t=>{const e=[t.description||"",`Trigger: ${O[t.trigger]??t.trigger}`,t.action?`Default: ${this._formatActionSummary(t.action)}`:""].filter(Boolean).join(" • ");return C`
                        <div class="slot-row">
                            <div class="slot-label">
                                <div class="slot-name">${t.name||t.id}</div>
                                <div class="slot-id">${t.id}</div>
                            </div>
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ui_action:{default_action:"none"}}}
                                .value=${i[t.id]??t.action??{action:"none"}}
                                @value-changed=${i=>this._slotActionChanged(i,t)}
                            ></ha-selector>
                            ${e?C`<div class="slot-helper">${e}</div>`:C``}
                        </div>
                    `})}
                            </div>
                        `:C``}
            </div>
        `}async _loadCards(){var t;if(this.hass){this._cardsService=d(this.hass),this._loading=!0;try{this._cards=await this._cardsService.listCards(),(null==(t=this._config)?void 0:t.card_id)&&await this._loadCardData(this._config.card_id)}catch(i){console.error("Failed to load cards:",i)}finally{this._loading=!1}}}async _subscribeToCardsUpdates(){if(this._cardsService)try{this.unsubscribe=await this._cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(t){console.error("Failed to subscribe to cards updates:",t)}}async _loadCardData(t){var i;const e=null==(i=this._cards)?void 0:i.find(i=>i.id===t);if(!e)return void(this._slots=[]);const{config:o}=c(e.config);this._documentModel.loadFromConfig(o),this._slots=this._documentModel.getSlotEntities(),this._actionSlots=this._documentModel.getSlotActions()}_cardSelected(t){if(!this._config||!this.hass)return;const i=t.target.value;if(this._config.card_id===i)return;const e={...this._config,card_id:i,slot_entities:{},slot_actions:{}},o=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(o)}_slotEntityChanged(t,i){var e;if(!this._config||!this.hass)return;let o=(null==(e=t.detail)?void 0:e.value)??"";o="string"==typeof o?o.trim():"";const a={...this._config.slot_entities||{}};o?a[i.id]=o:delete a[i.id];const s={...this._config,slot_entities:a},r=new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0});this.dispatchEvent(r)}_slotActionChanged(t,i){var e;if(!this._config||!this.hass)return;const o=(null==(e=t.detail)?void 0:e.value)||null,a={...this._config.slot_actions||{}};o&&"none"!==o.action?a[i.id]=o:delete a[i.id];const s={...this._config,slot_actions:a},r=new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0});this.dispatchEvent(r)}_formatActionSummary(t){const i=this._getActionLabel(t.action);if("call-service"===t.action||"perform-action"===t.action){const e=this._getServiceValue(t);return`${i}${e?`: ${e}`:""}`}return"navigate"===t.action&&"navigation_path"in t?`${i}: ${t.navigation_path||""}`:"url"===t.action&&"url_path"in t?`${i}: ${t.url_path||""}`:i}_getActionLabel(t){return{none:"None",toggle:"Toggle","call-service":"Call Service","perform-action":"Perform Action",navigate:"Navigate","more-info":"More Info",url:"Open URL","fire-dom-event":"Fire Event","toggle-menu":"Toggle Menu"}[t]??t}_getServiceValue(t){return"perform_action"in t&&"string"==typeof t.perform_action&&t.perform_action?t.perform_action:"service"in t&&"string"==typeof t.service&&t.service?t.service:"domain"in t&&"string"==typeof t.domain&&"service"in t&&"string"==typeof t.service?`${t.domain}.${t.service}`:void 0}};U.styles=y`
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
    `;let N=U;z([x({attribute:!1})],N.prototype,"hass"),z([w()],N.prototype,"_config"),z([w()],N.prototype,"_cards"),z([w()],N.prototype,"_loading"),z([w()],N.prototype,"_slots"),z([w()],N.prototype,"_actionSlots"),B.define("card-builder-renderer-card-editor",N);const P="CARD-BUILDER-RENDERER",L="1.0.0",V="#1976d2",H="#FFFFFF",Q="#ff7043",G="#FFFFFF";console.info(`%c ${P} %c v${L}`,`background: ${V}; color: ${H}; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;`,`background: ${Q}; color: ${G}; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;`),B.boot();