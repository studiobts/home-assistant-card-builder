var e;import{aB as t,aC as i,aD as o,aE as r,aF as a,aG as s,aH as n,aI as l,aJ as d,aK as c,aL as p,aM as h,aN as u,aO as g,aP as b,aQ as v,aR as y}from"./card-builder-shared-DM_W7S1D.js";import{b as m,d as f,a as x,g as _,D as k,B as w,v as $,c as S,e as C,f as I,P as E,h as B,i as P,j as z,s as D,k as M,l as R,m as V,n as L,o as O,E as T,p as A,S as H,q as j}from"./card-builder-shared-Bd8OtdC0.js";import{M as N}from"./card-builder-shared-CWH4dwV9.js";import"./card-builder-shared-Ky8KdkrL.js";var U=Object.defineProperty,F=Object.getOwnPropertyDescriptor,G=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?F(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&U(t,i,a),a};let W=class extends o{constructor(){super(...arguments),this.value="top-left"}render(){return r`
      ${this.label?r`<div class="label">${this.label}</div>`:""}
      <div class="anchor-grid">
        ${[{value:"top-left",label:"Top Left"},{value:"top-center",label:"Top Center"},{value:"top-right",label:"Top Right"},{value:"middle-left",label:"Middle Left"},{value:"middle-center",label:"Middle Center"},{value:"middle-right",label:"Middle Right"},{value:"bottom-left",label:"Bottom Left"},{value:"bottom-center",label:"Bottom Center"},{value:"bottom-right",label:"Bottom Right"}].map(e=>r`
          <div
            class="anchor-point ${this.value===e.value?"active":""}"
            @click=${()=>this.handleSelect(e.value)}
            title="${e.label}"
          ></div>
        `)}
      </div>
    `}handleSelect(e){this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}};W.styles=t`
    :host {
      display: block;
    }

    .label {
      display: block;
      margin-bottom: 5px;
      font-size: 10px;
      font-weight: 500;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .anchor-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 8px;
      background: var(--bg-secondary, #f5f5f5);
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 3px;
      position: relative;
    }

    .anchor-point {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: var(--bg-tertiary, #e8e8e8);
      border: 2px solid transparent;
      border-radius: 3px;
      transition: all 0.15s ease;
    }

    .anchor-point:hover {
      background: var(--bg-primary, #fff);
      border-color: var(--accent-color, #0078d4);
    }

    .anchor-point.active {
      background: var(--accent-color, #0078d4);
      border-color: var(--accent-color, #0078d4);
    }

    .anchor-point::before {
      content: '';
      width: 6px;
      height: 6px;
      background: var(--text-secondary, #666);
      border-radius: 50%;
      transition: background 0.15s ease;
    }

    .anchor-point.active::before {
      background: white;
    }
  `,G([i({type:String})],W.prototype,"value",2),G([i({type:String})],W.prototype,"label",2),W=G([a("sm-anchor-selector")],W);var q=Object.defineProperty,X=Object.getOwnPropertyDescriptor,Y=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?X(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&q(t,i,a),a};let Z=class extends o{constructor(){super(...arguments),this.value="",this.options=[]}render(){return r`
      <div class="container">
        ${this.label?r`<div class="label">${this.label}</div>`:""}
        <div class="button-group">
          ${this.options.map(e=>r`
            <button
              class="button ${this.value===e.value?"active":""}"
              @click=${()=>this.handleSelect(e.value)}
              data-tooltip="${e.tooltip||e.value}"
            >
              ${e.svgContent?r`<div .innerHTML=${e.svgContent}></div>`:e.icon?r`<svg viewBox="0 0 24 24"><path d="${e.icon}"/></svg>`:r`${e.value}`}
            </button>
          `)}
        </div>
      </div>
    `}handleSelect(e){this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}};Z.styles=t`
    :host {
      display: block;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .button-group {
      display: flex;
      gap: 4px;
      background: var(--bg-tertiary, #f0f0f0);
      padding: 4px;
      border-radius: 6px;
    }

    .button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px 5px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: var(--text-secondary, #666);
      position: relative;
    }

    .button:hover {
      background: var(--bg-secondary, #e0e0e0);
      color: var(--text-primary, #333);
    }

    .button.active {
      background: var(--accent-color, #0078d4);
      color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }

    .button svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .button::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 10px;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      margin-bottom: 4px;
    }

    .button:hover::after {
      opacity: 1;
    }
  `,Y([i({type:String})],Z.prototype,"value",2),Y([i({type:String})],Z.prototype,"label",2),Y([i({type:Array})],Z.prototype,"options",2),Z=Y([a("sm-button-group-input")],Z);var J=Object.defineProperty,K=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&J(t,i,a),a};const Q=class extends o{render(){return r`
            ${this.renderLabel()}
            ${this.renderInput()}
        `}dispatchChange(e){this.dispatchEvent(new CustomEvent("change",{detail:e,bubbles:!0,composed:!0}))}renderLabel(){return this.label?r`
            <div class="label">${this.label}</div>`:""}};Q.styles=[t`
            :host {
                display: block;
            }

            .label {
                display: block;
                margin-bottom: 5px;
                font-size: 10px;
                font-weight: 500;
                color: var(--text-secondary, #666);
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            .input-wrapper {
                display: flex;
                align-items: stretch;
                background: var(--bg-secondary, #f5f5f5);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                transition: border-color 0.15s ease;
            }

            .input-wrapper:focus-within {
                border-color: var(--accent-color, #0078d4);
            }

            input,
            select {
                flex: 1;
                padding: 5px 8px;
                border: none;
                background: transparent;
                color: var(--text-primary, #333);
                font-size: 11px;
                outline: none;
                min-width: 0;
            }

            input::-webkit-inner-spin-button,
            input::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            /* Common button styles */

            .button {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 8px;
                background: var(--bg-tertiary, #e8e8e8);
                border-left: 1px solid var(--border-color, #d4d4d4);
                color: var(--text-secondary, #666);
                font-size: 10px;
                cursor: pointer;
                user-select: none;
                transition: all 0.1s ease;
            }

            .button:hover {
                background: var(--bg-primary, #fff);
                color: var(--accent-color, #0078d4);
            }

            .button:active {
                background: var(--accent-color, #0078d4);
                color: white;
            }
        `];let ee=Q;K([i({type:String})],ee.prototype,"label"),K([i()],ee.prototype,"value");var te=Object.defineProperty,ie=Object.getOwnPropertyDescriptor,oe=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ie(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&te(t,i,a),a};let re=class extends ee{constructor(){super(...arguments),this.value="#000000"}renderInput(){return r`
      <div class="input-wrapper">
        <div class="preview">
          <div class="swatch" style="background: ${this.value}"></div>
          <input
            type="color"
            .value=${this.value}
            @input=${this.handleChange}
          />
        </div>
        <input
          type="text"
          .value=${this.value}
          @input=${this.handleChange}
        />
      </div>
    `}handleChange(e){const t=e.target;this.dispatchChange({value:t.value})}};re.styles=[...ee.styles,t`
      .preview {
        width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-tertiary, #e8e8e8);
        cursor: pointer;
        position: relative;
        border-right: 1px solid var(--border-color, #d4d4d4);
      }

      .preview::before {
        content: '';
        position: absolute;
        inset: 4px;
        background: linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 8px 8px;
        background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        border-radius: 2px;
      }

      .swatch {
        position: absolute;
        inset: 4px;
        border-radius: 2px;
        border: 1px solid rgba(0,0,0,0.1);
      }

      input[type="color"] {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }

      input[type="text"] {
        flex: 1;
        padding: 5px 8px;
        border: none;
        background: transparent;
        color: var(--text-primary, #333);
        font-size: 11px;
        font-family: 'Courier New', monospace;
        outline: none;
      }
    `],oe([i({type:String})],re.prototype,"value",2),re=oe([a("sm-color-input")],re);var ae=Object.defineProperty,se=Object.getOwnPropertyDescriptor,ne=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?se(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ae(t,i,a),a};let le=class extends ee{constructor(){super(...arguments),this.value=0,this.step=1,this.showUnitSelector=!1}renderInput(){return r`
            <div class="input-wrapper">
                <input
                        type="number"
                        .value=${String(this.value)}
                        min=${this.min??""}
                        max=${this.max??""}
                        step=${this.step}
                        @input=${this.handleInput}
                />
                <div class="arrows">
                    <div class="arrow" @click=${this.increment}>▲</div>
                    <div class="arrow" @click=${this.decrement}>▼</div>
                </div>
                ${this.units&&this.units.length>1?r`
                    <div class="unit-selector">
                        <div class="unit-button" @click=${this.toggleUnitSelector}>
                            ${this.unit}
                        </div>
                        ${this.showUnitSelector?r`
                            <div class="unit-options">
                                ${this.units.map(e=>r`
                                    <div
                                            class="unit-option ${e===this.unit?"active":""}"
                                            @click=${()=>this.selectUnit(e)}
                                    >
                                        ${e}
                                    </div>
                                `)}
                            </div>
                        `:n}
                    </div>
                `:r`
                    ${this.unit?r`
                        <div class="unit-selector">
                            <div class="unit-button">${this.unit}</div>
                        </div>
                    `:n}
                `}
            </div>
        `}handleInput(e){const t=e.target,i=parseFloat(t.value)||0;this.dispatchChange({value:i,unit:this.unit})}increment(){const e=this.value+this.step,t=void 0!==this.max?Math.min(e,this.max):e;this.dispatchChange({value:t,unit:this.unit})}decrement(){const e=this.value-this.step,t=void 0!==this.min?Math.max(e,this.min):e;this.dispatchChange({value:t,unit:this.unit})}toggleUnitSelector(e){e.stopPropagation(),this.showUnitSelector=!this.showUnitSelector}selectUnit(e){this.showUnitSelector=!1,this.dispatchChange({value:this.value,unit:e})}};le.styles=[...ee.styles,t`
            .arrows {
                display: flex;
                flex-direction: column;
                background: var(--bg-tertiary, #e8e8e8);
                border-left: 1px solid var(--border-color, #d4d4d4);
            }

            .arrow {
                flex: 1;
                width: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-secondary, #666);
                font-size: 8px;
                transition: all 0.1s ease;
                user-select: none;
            }

            .arrow:hover {
                background: var(--bg-primary, #fff);
                color: var(--accent-color, #0078d4);
            }

            .arrow:active {
                background: var(--accent-color, #0078d4);
                color: white;
            }

            .arrow:first-child {
                border-bottom: 1px solid var(--border-color, #d4d4d4);
            }

            .unit-selector {
                position: relative;
            }

            .unit-button {
                padding: 0 8px;
                display: flex;
                align-items: center;
                background: var(--bg-tertiary, #e8e8e8);
                border-left: 1px solid var(--border-color, #d4d4d4);
                color: var(--text-secondary, #666);
                font-size: 10px;
                cursor: pointer;
                user-select: none;
                min-width: 36px;
                height: 100%;
                justify-content: center;
                transition: all 0.1s ease;
            }

            .unit-button:hover {
                background: var(--bg-primary, #fff);
                color: var(--accent-color, #0078d4);
            }

            .unit-options {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--bg-primary, #fff);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                min-width: 60px;
                margin-top: 2px;
            }

            .unit-option {
                padding: 6px 12px;
                font-size: 10px;
                cursor: pointer;
                transition: background 0.1s ease;
            }

            .unit-option:hover {
                background: var(--bg-tertiary, #e8e8e8);
            }

            .unit-option.active {
                background: var(--accent-color, #0078d4);
                color: white;
            }
        `],ne([i({type:Number})],le.prototype,"value",2),ne([i({type:Number})],le.prototype,"min",2),ne([i({type:Number})],le.prototype,"max",2),ne([i({type:Number})],le.prototype,"step",2),ne([i({type:String})],le.prototype,"unit",2),ne([i({type:Array})],le.prototype,"units",2),ne([s()],le.prototype,"showUnitSelector",2),le=ne([a("sm-number-input")],le);var de=Object.defineProperty,ce=Object.getOwnPropertyDescriptor,pe=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ce(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&de(t,i,a),a};const he={default:{label:"Default",shortLabel:"Default",color:"#666",bgColor:"#f0f0f0",icon:'<ha-icon icon="mdi:circle-outline"></ha-icon>'},"block-type-default":{label:"Block Default",shortLabel:"Block",color:"#0066cc",bgColor:"#e6f0ff",icon:'<ha-icon icon="mdi:code-brackets"></ha-icon>'},"canvas-default":{label:"Canvas Default",shortLabel:"Canvas",color:"#00a6a6",bgColor:"#e6f7f7",icon:'<ha-icon icon="mdi:card-outline"></ha-icon>'},"parent-inherited":{label:"Inherited",shortLabel:"Parent",color:"#2e8b2e",bgColor:"#e8f5e8",icon:'<ha-icon icon="mdi:arrow-collapse-up"></ha-icon>'},preset:{label:"Preset",shortLabel:"Preset",color:"#7b2d8e",bgColor:"#f5e6f8",icon:'<ha-icon icon="mdi:presentation"></ha-icon>'},"preset-fallback":{label:"Preset (fallback)",shortLabel:"Preset",color:"#9b5dae",bgColor:"#f5e6f8",icon:'<ha-icon icon="mdi:presentation"></ha-icon>'},inline:{label:"Custom",shortLabel:"Custom",color:"#cc6600",bgColor:"#fff5e6",icon:'<ha-icon icon="mdi:location-enter"></ha-icon>'},"inline-fallback":{label:"Custom (fallback)",shortLabel:"Fallback",color:"#cc9966",bgColor:"#fff8f0",icon:'<ha-icon icon="mdi:format-wrap-inline"></ha-icon>'}};let ue=class extends o{constructor(){super(...arguments),this.origin="default",this.compact=!1,this.showTooltip=!0}render(){const e=this._getConfig(),t=this.showTooltip?this._getTooltip():void 0,i=this._getDisplayLabel();return r`
      <span
        class="badge ${this.compact?"compact":""}"
        style="color: ${e.color}; background: ${e.bgColor};"
        data-tooltip=${t||""}
      >
        <span class="icon">${l(e.icon)}</span>
        <span class="label">${i}</span>
      </span>
    `}_getConfig(){return he[this.origin]||he.default}_getTooltip(){let e=this._getConfig().label;return!this.presetName||"preset"!==this.origin&&"preset-fallback"!==this.origin||(e+=`: ${this.presetName}`),!this.originDevice||"inline-fallback"!==this.origin&&"preset-fallback"!==this.origin||(e+=` (from ${this.originDevice})`),e}_getDisplayLabel(){const e=this._getConfig();return!this.presetName||"preset"!==this.origin&&"preset-fallback"!==this.origin?!this.originDevice||"inline-fallback"!==this.origin&&"preset-fallback"!==this.origin?e.shortLabel:this.originDevice:this.presetName}};ue.styles=t`
    :host {
      display: inline-flex;
        --mdc-icon-size: 12px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      cursor: default;
      transition: opacity 0.15s ease;
    }

    .badge:hover {
      opacity: 0.85;
    }

    .icon {
      font-size: 8px;
    }

    .label {
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge.compact {
      padding: 2px 4px;
    }

    .badge.compact .label {
      display: none;
    }

    /* Tooltip */
    .badge[data-tooltip] {
      position: relative;
    }

    .badge[data-tooltip]::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 8px;
      background: #333;
      color: white;
      font-size: 10px;
      font-weight: normal;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      pointer-events: none;
      z-index: 100;
      margin-bottom: 4px;
    }

    .badge[data-tooltip]::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: #333;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      pointer-events: none;
      z-index: 100;
    }

    .badge[data-tooltip]:hover::after,
    .badge[data-tooltip]:hover::before {
      opacity: 1;
      visibility: visible;
    }
  `,pe([i({type:String})],ue.prototype,"origin",2),pe([i({type:String})],ue.prototype,"presetName",2),pe([i({type:String})],ue.prototype,"originDevice",2),pe([i({type:Boolean})],ue.prototype,"compact",2),pe([i({type:Boolean})],ue.prototype,"showTooltip",2),ue=pe([a("property-origin-badge")],ue);var ge=Object.defineProperty,be=Object.getOwnPropertyDescriptor,ve=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?be(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ge(t,i,a),a};let ye=class extends o{constructor(){super(...arguments),this.canReset=!1,this.disabled=!1,this.tooltip="Reset to inherited value"}render(){return this.canReset?r`
      <button
        class="reset-btn ${this.canReset?"can-reset":""}"
        @click=${this._handleClick}
        ?disabled=${this.disabled}
        data-tooltip=${this.tooltip}
        aria-label=${this.tooltip}
      >
        <span class="icon"></span>
      </button>
    `:n}_handleClick(e){e.stopPropagation(),!this.disabled&&this.canReset&&this.dispatchEvent(new CustomEvent("reset",{bubbles:!0,composed:!0}))}};ye.styles=t`
    :host {
      display: inline-flex;
    }

    :host([hidden]) {
      display: none;
    }

    .reset-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 3px;
      background: transparent;
      color: var(--text-tertiary, #999);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
    }

    .reset-btn:hover:not(:disabled) {
      background: var(--bg-secondary, #f5f5f5);
      border-color: var(--border-color, #d4d4d4);
      color: var(--text-primary, #333);
    }

    .reset-btn:active:not(:disabled) {
      background: var(--bg-tertiary, #e8e8e8);
    }

    .reset-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .reset-btn.can-reset {
      color: var(--accent-color, #0078d4);
    }

    .reset-btn.can-reset:hover:not(:disabled) {
      background: rgba(0, 120, 212, 0.1);
      border-color: var(--accent-color, #0078d4);
    }

    /* Tooltip */
    .reset-btn[data-tooltip] {
      position: relative;
    }

    .reset-btn[data-tooltip]::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 8px;
      background: #333;
      color: white;
      font-size: 10px;
      font-weight: normal;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      pointer-events: none;
      z-index: 100;
      margin-bottom: 4px;
    }

    .reset-btn[data-tooltip]::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: #333;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      pointer-events: none;
      z-index: 100;
    }

    .reset-btn[data-tooltip]:hover::after,
    .reset-btn[data-tooltip]:hover::before {
      opacity: 1;
      visibility: visible;
    }

    /* Icon - using CSS for reset symbol */
    .icon {
      display: block;
      width: 12px;
      height: 12px;
      position: relative;
    }

    .icon::before {
      content: '↺';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      line-height: 1;
    }
  `,ve([i({type:Boolean})],ye.prototype,"canReset",2),ve([i({type:Boolean})],ye.prototype,"disabled",2),ve([i({type:String})],ye.prototype,"tooltip",2),ye=ve([a("property-reset-button")],ye);var me=Object.defineProperty,fe=Object.getOwnPropertyDescriptor,xe=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?fe(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&me(t,i,a),a};let _e=class extends ee{constructor(){super(...arguments),this.value="",this.options=[]}updated(e){e.has("value")&&this.selectElement&&(this.selectElement.value=this.value)}renderInput(){return r`
            <div class="select-wrapper">
                <select .value=${this.value} @change=${this.handleChange}>
                    ${this.options.map(e=>r`
                        <option value=${e.value} ?selected=${e.value===this.value}>${e.label}</option>
                    `)}
                </select>
            </div>
        `}handleChange(e){const t=e.target;this.dispatchChange({value:t.value})}};_e.styles=[...ee.styles,t`
            .select-wrapper {
                position: relative;
            }

            select {
                width: 100%;
                padding: 5px 24px 5px 8px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                background: var(--bg-secondary, #f5f5f5);
                color: var(--text-primary, #333);
                font-size: 11px;
                outline: none;
                cursor: pointer;
                appearance: none;
                transition: border-color 0.15s ease;
            }

            select:focus {
                border-color: var(--accent-color, #0078d4);
            }

            .select-wrapper::after {
                content: '▼';
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 8px;
                color: var(--text-secondary, #666);
                pointer-events: none;
            }
        `],xe([i({type:String})],_e.prototype,"value",2),xe([i({type:Array})],_e.prototype,"options",2),xe([d("select")],_e.prototype,"selectElement",2),_e=xe([a("sm-select-input")],_e);var ke=Object.defineProperty,we=Object.getOwnPropertyDescriptor,$e=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?we(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ke(t,i,a),a};let Se=class extends ee{constructor(){super(...arguments),this.value=0,this.min=0,this.max=100,this.step=1,this.unit="px",this.units=[],this.showUnitSelector=!1}renderInput(){const e=this.step<1?2:0;return r`
            <div class="slider-wrapper">
                <input
                        type="range"
                        min=${this.min}
                        max=${this.max}
                        step=${this.step}
                        .value=${String(this.value)}
                        @input=${this.handleInput}
                />
                <span class="value">${this.value.toFixed(e)}</span>
                ${this.units.length>1?r`
                    <div class="unit-selector">
                        <div class="unit-button" @click=${this.toggleUnitSelector}>
                            ${this.unit}
                        </div>
                        ${this.showUnitSelector?r`
                            <div class="unit-options">
                                ${this.units.map(e=>r`
                                    <div
                                            class="unit-option ${e===this.unit?"active":""}"
                                            @click=${()=>this.selectUnit(e)}
                                    >
                                        ${e}
                                    </div>
                                `)}
                            </div>
                        `:""}
                    </div>
                `:1===this.units.length?r`
                    <div class="unit-button">${this.unit}</div>
                `:""}
            </div>
        `}handleInput(e){const t=e.target,i=parseFloat(t.value);this.dispatchChange({value:i,unit:this.unit})}toggleUnitSelector(e){e.stopPropagation(),this.showUnitSelector=!this.showUnitSelector}selectUnit(e){this.showUnitSelector=!1,this.unit=e,this.dispatchChange({value:this.value,unit:e})}};Se.styles=[...ee.styles,t`
            .slider-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            input[type="range"] {
                flex: 1;
                height: 4px;
                -webkit-appearance: none;
                appearance: none;
                background: var(--bg-tertiary, #e8e8e8);
                border-radius: 2px;
                outline: none;
            }

            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 12px;
                height: 12px;
                background: var(--accent-color, #0078d4);
                border-radius: 50%;
                cursor: pointer;
                transition: transform 0.1s ease;
            }

            input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
            }

            input[type="range"]::-moz-range-thumb {
                width: 12px;
                height: 12px;
                background: var(--accent-color, #0078d4);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                transition: transform 0.1s ease;
            }

            input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.2);
            }

            .value {
                min-width: 36px;
                text-align: right;
                font-size: 10px;
                color: var(--text-secondary, #666);
                font-weight: 500;
            }

            .unit-selector {
                position: relative;
            }

            .unit-button {
                padding: 0 8px;
                display: flex;
                align-items: center;
                background: var(--bg-tertiary, #e8e8e8);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                color: var(--text-secondary, #666);
                font-size: 10px;
                cursor: pointer;
                user-select: none;
                min-width: 36px;
                height: 100%;
                justify-content: center;
                transition: all 0.1s ease;
            }

            .unit-button:hover {
                background: var(--bg-primary, #fff);
                color: var(--accent-color, #0078d4);
            }

            .unit-options {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--bg-primary, #fff);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                min-width: 60px;
                margin-top: 2px;
            }

            .unit-option {
                padding: 6px 12px;
                font-size: 10px;
                cursor: pointer;
                transition: background 0.1s ease;
            }

            .unit-option:hover {
                background: var(--bg-tertiary, #e8e8e8);
            }

            .unit-option.active {
                background: var(--accent-color, #0078d4);
                color: white;
            }
        `],$e([i({type:Number})],Se.prototype,"value",2),$e([i({type:Number})],Se.prototype,"min",2),$e([i({type:Number})],Se.prototype,"max",2),$e([i({type:Number})],Se.prototype,"step",2),$e([i({type:String})],Se.prototype,"unit",2),$e([i({type:Array})],Se.prototype,"units",2),$e([s()],Se.prototype,"showUnitSelector",2),Se=$e([a("sm-slider-input")],Se);var Ce=Object.defineProperty,Ie=Object.getOwnPropertyDescriptor,Ee=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ie(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ce(t,i,a),a};let Be=class extends ee{constructor(){super(...arguments),this.value={top:0,right:0,bottom:0,left:0},this.unit="px",this.units=["px"],this.showUnitSelector=!1}renderInput(){return r`
            <div class="grid">
                <div class="item top">
                    <span class="item-label">Top</span>
                    <input
                        type="number"
                        .value=${String(this.value.top)}
                        @input=${e=>this.handleChange("top",e)}
                    />
                </div>
                <div class="item right">
                    <span class="item-label">Right</span>
                    <input
                        type="number"
                        .value=${String(this.value.right)}
                        @input=${e=>this.handleChange("right",e)}
                    />
                </div>
                <div class="item bottom">
                    <span class="item-label">Bottom</span>
                    <input
                        type="number"
                        .value=${String(this.value.bottom)}
                        @input=${e=>this.handleChange("bottom",e)}
                    />
                </div>
                <div class="item left">
                    <span class="item-label">Left</span>
                    <input
                        type="number"
                        .value=${String(this.value.left)}
                        @input=${e=>this.handleChange("left",e)}
                    />
                </div>
                <div class="item center">
                    ${this.units.length>1?r`
                        <div class="unit-selector">
                            <div class="unit-button" @click=${this.toggleUnitSelector}>
                                ${this.unit}
                            </div>
                            ${this.showUnitSelector?r`
                                <div class="unit-options">
                                    ${this.units.map(e=>r`
                                        <div
                                                class="unit-option ${e===this.unit?"active":""}"
                                                @click=${()=>this.selectUnit(e)}
                                        >
                                            ${e}
                                        </div>
                                    `)}
                                </div>
                            `:""}
                        </div>
                    `:r`
                        <div class="unit-button">${this.unit}</div>
                    `}
                </div>
            </div>
        `}handleChange(e,t){const i=t.target,o={...this.value,[e]:parseFloat(i.value)||0};this.dispatchChange({value:o,unit:this.unit})}toggleUnitSelector(e){e.stopPropagation(),this.showUnitSelector=!this.showUnitSelector}selectUnit(e){this.showUnitSelector=!1,this.unit=e,this.dispatchChange({value:this.value,unit:e})}};Be.styles=[...ee.styles,t`
            .grid {
                display: grid;
                grid-template-areas:
                  ". top ."
                  "left center right"
                  ". bottom .";
                grid-template-columns: 1fr 1fr 1fr;
                gap: 4px;
            }

            .item {
                position: relative;
            }

            .item.top {
                grid-area: top;
            }

            .item.right {
                grid-area: right;
            }

            .item.bottom {
                grid-area: bottom;
            }

            .item.left {
                grid-area: left;
            }

            .item.center {
                grid-area: center;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .item-label {
                position: absolute;
                top: 2px;
                left: 4px;
                font-size: 8px;
                color: var(--text-secondary, #666);
                text-transform: uppercase;
                pointer-events: none;
                z-index: 1;
            }

            .item input {
                width: 100%;
                padding: 14px 6px 4px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                box-sizing: border-box;
                background: var(--bg-secondary, #f5f5f5);
                color: var(--text-primary, #333);
                font-size: 12px;
                outline: none;
                text-align: center;
                transition: border-color 0.15s ease;
            }

            .item input:focus {
                border-color: var(--accent-color, #0078d4);
            }

            .unit-selector {
                position: relative;
            }

            .unit-button {
                padding: 4px 8px;
                display: flex;
                align-items: center;
                background: var(--bg-tertiary, #e8e8e8);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                color: var(--text-secondary, #666);
                font-size: 13px;
                cursor: pointer;
                user-select: none;
                min-width: 36px;
                justify-content: center;
                transition: all 0.1s ease;
            }

            .unit-button:hover {
                background: var(--bg-primary, #fff);
                color: var(--accent-color, #0078d4);
            }

            .unit-options {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--bg-primary, #fff);
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                min-width: 60px;
                margin-top: 2px;
            }

            .unit-option {
                padding: 6px 12px;
                font-size: 10px;
                cursor: pointer;
                transition: background 0.1s ease;
            }

            .unit-option:hover {
                background: var(--bg-tertiary, #e8e8e8);
            }

            .unit-option.active {
                background: var(--accent-color, #0078d4);
                color: white;
            }
        `],Ee([i({type:Object})],Be.prototype,"value",2),Ee([i({type:String})],Be.prototype,"unit",2),Ee([i({type:Array})],Be.prototype,"units",2),Ee([s()],Be.prototype,"showUnitSelector",2),Be=Ee([a("sm-spacing-input")],Be);var Pe=Object.defineProperty,ze=Object.getOwnPropertyDescriptor,De=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ze(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Pe(t,i,a),a};let Me=class extends o{constructor(){super(...arguments),this.value=!1,this.labelOn="On",this.labelOff="Off"}render(){return r`
      <div class="container">
        ${this.label?r`<div class="label">${this.label}</div>`:""}
        <div class="toggle-wrapper">
          <div class="toggle-label">${this.value?this.labelOn:this.labelOff}</div>
          <div
            class="toggle ${this.value?"active":""}"
            @click=${this.handleToggle}
          >
            <div class="toggle-handle"></div>
          </div>
        </div>
      </div>
    `}handleToggle(){this.dispatchEvent(new CustomEvent("change",{detail:{value:!this.value},bubbles:!0,composed:!0}))}};Me.styles=t`
    :host {
      display: block;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .label {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .toggle-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-label {
      font-size: 11px;
      color: var(--text-secondary, #666);
      min-width: 45px;
      text-align: right;
    }

    .toggle {
      position: relative;
      width: 40px;
      height: 20px;
      background: var(--bg-tertiary, #e0e0e0);
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .toggle.active {
      background: var(--accent-color, #0078d4);
    }

    .toggle-handle {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .toggle.active .toggle-handle {
      transform: translateX(20px);
    }
  `,De([i({type:Boolean})],Me.prototype,"value",2),De([i({type:String})],Me.prototype,"label",2),De([i({type:String})],Me.prototype,"labelOn",2),De([i({type:String})],Me.prototype,"labelOff",2),Me=De([a("sm-toggle-input")],Me);var Re=Object.defineProperty,Ve=Object.getOwnPropertyDescriptor,Le=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ve(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Re(t,i,a),a};let Oe=class extends o{constructor(){super(...arguments),this.tabs=[],this.activeTab=""}render(){return 0===this.tabs.length?r`<div class="empty-state">No tabs configured</div>`:r`
      <div class="tabs">
        ${this.tabs.map(e=>r`
            <button
              class="tab ${this.activeTab===e.id?"active":""}"
              @click=${()=>this._setActiveTab(e.id)}
            >
              ${e.label}
            </button>
          `)}
      </div>
      ${this.tabs.map(e=>r`
          <div class="tab-content ${this.activeTab===e.id?"active":""}">
            ${this._renderTabContent(e)}
          </div>
        `)}
    `}setActiveTab(e){this._setActiveTab(e)}firstUpdated(e){super.firstUpdated(e),this.tabs.length>0&&!this.activeTab&&(this.activeTab=this.tabs[0].id)}updated(e){if(super.updated(e),e.has("tabs")&&this.tabs.length>0){this.tabs.some(e=>e.id===this.activeTab)||(this.activeTab=this.tabs[0].id)}}_renderTabContent(e){const t=e.props||{};switch(e.component){case"panel-blocks":return r`<panel-blocks></panel-blocks>`;case"panel-layers":return r`<panel-layers></panel-layers>`;case"panel-properties":return r`<panel-properties .hass=${t.hass}></panel-properties>`;case"panel-style":return r`<panel-styles
          .hass=${t.hass}      
          .canvasWidth=${t.canvasWidth}
          .canvasHeight=${t.canvasHeight}
          .canvas=${t.canvas}
        ></panel-styles>`;default:return r`<div class="empty-state">Unknown component: ${e.component}</div>`}}_setActiveTab(e){this.activeTab=e}};Oe.styles=t`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .tabs {
      display: flex;
      background: var(--cb-sidebar-background);
      border-bottom: 1px solid var(--cb-sidebar-section-border-color);
      height: var(--header-height);
      box-sizing: border-box;
    }
    .tab {
      flex: 1;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      border-bottom: 2px solid transparent;
    }
    .tab:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .tab.active {
      color: var(--accent-color);
      border-bottom-color: var(--accent-color);
    }
    .tab-content {
      flex: 1;
      overflow: hidden;
      display: none;
    }
    .tab-content.active {
      display: flex;
      flex-direction: column;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: var(--text-secondary);
      font-size: 12px;
    }
  `,Le([i({type:Array})],Oe.prototype,"tabs",2),Le([s()],Oe.prototype,"activeTab",2),Oe=Le([a("sidebar-tabbed")],Oe);const Te=class extends o{};Te.styles=[t`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            font-size: 12px;
        }

        /* Panel structure */

        .panel-header {
            padding: 10px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-size: 11px;
            font-weight: 600;
            color: var(--text-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .panel-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 12px;
        }

        /* Empty state */

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 40px 20px;
            text-align: center;
            color: var(--text-secondary);
            font-size: 13px;
        }

        .empty-state-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
            opacity: 0.3;
        }

        /* Sections */

        .section {
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 8px;
        }

        .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            cursor: pointer;
            user-select: none;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-primary);
            background: var(--bg-secondary);
            transition: background 0.15s ease;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .section-header:hover {
            background: var(--bg-tertiary);
        }

        .section-icon {
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 5px solid var(--text-secondary);
            transition: transform 0.2s ease;
        }

        .section.expanded .section-icon {
            transform: rotate(180deg);
        }

        .section-content {
            display: none;
            padding: 12px;
            background: var(--bg-primary);
            gap: 10px;
        }

        .section.expanded .section-content {
            display: flex;
            flex-direction: column;
        }

        /* Property rows */

        .property-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 12px;
        }

        .property-row:last-child {
            margin-bottom: 0;
        }

        .property-label {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .property-input {
            width: 100%;
            padding: 6px 8px;
            font-size: 12px;
            color: var(--text-primary);
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            outline: none;
            transition: all 0.15s ease;
        }

        .property-input:hover {
            border-color: var(--text-secondary);
        }

        .property-input:focus {
            border-color: var(--accent-color);
            background: var(--bg-primary);
        }

        /* Property grid for side-by-side inputs */

        .property-grid {
            display: grid;
            grid-template-columns: 50% 50%;
            gap: 8px;
        }

        /* Info display */

        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-size: 10px;
            line-height: 1.6;
        }

        .info-label {
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-weight: 600;
        }

        .info-value {
            color: var(--text-primary);
            font-family: 'Courier New', monospace;
            font-size: 11px;
        }

        /* Placeholder text */

        .placeholder-text {
            padding: 8px;
            color: var(--text-secondary);
            font-size: 12px;
            text-align: center;
        }
    `];let Ae=Te;var He=Object.defineProperty,je=Object.getOwnPropertyDescriptor,Ne=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?je(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&He(t,i,a),a};let Ue=class extends o{constructor(){super(...arguments),this.blockType="",this.icon="",this.label=""}render(){return r`
      <span class="icon">
        ${l(this.icon)}
      </span>
      <span class="label">${this.label}</span>
    `}};Ue.styles=t`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border: 1px solid var(--border-color);
      border-radius: 2px;
      user-select: none;
      transition: all 0.3s ease;
    }
    :host(:hover) {
      border-color: var(--border-color);
      background: var(--bg-secondary);
      cursor: move;
    }
    .icon {
      font-size: 20px;
      margin-bottom: 4px;
    }
    .label {
      font-size: 12px;
      font-family: var(--cb-font-family), sans-serif;
      color: #515858;
    }
  `,Ne([i({type:String,attribute:"block-type"})],Ue.prototype,"blockType",2),Ne([i({type:String})],Ue.prototype,"icon",2),Ne([i({type:String})],Ue.prototype,"label",2),Ue=Ne([a("draggable-block")],Ue);var Fe=Object.defineProperty,Ge=Object.getOwnPropertyDescriptor,We=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ge(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Fe(t,i,a),a};let qe=class extends Ae{constructor(){super(...arguments),this.panelContent=null,this.sections={basic:{label:"Basic",expanded:!0},layout:{label:"Layout",expanded:!0},entities:{label:"Entities",expanded:!0},advanced:{label:"Advanced",expanded:!0}}}get sourceId(){return"main-sidebar"}get sourceElement(){return this.panelContent}get sourceAllowedBlockTypes(){return null}async firstUpdated(){await this.updateComplete,this.dragDropManager.registerSourceZone(this)}render(){return r`
            <div class="panel-content" ${p(e=>this.panelContent=e)}>
                ${Object.entries(this.sections).map(([e,t])=>r`
                            <div class="block-section ${t.expanded?"expanded":""}">
                                <div class="block-section-header" @click=${()=>this._toggleSection(e)}>
                                    ${t.label}
                                </div>
                                <div class="block-section-content">
                                    ${this.blockRegistry.getByCategory(e).map(e=>r`
                                                <draggable-block
                                                        block-type="${e.type}"
                                                        icon="${e.icon}"
                                                        label="${e.label}"
                                                        data-block-type="${e.type}"
                                                        data-type="${e.type}"
                                                        data-dnd-draggable="true"
                                                ></draggable-block>
                                            `)}
                                </div>
                            </div>
                        `)}
            </div>
        `}_toggleSection(e){this.sections={...this.sections,[e]:{...this.sections[e],expanded:!this.sections[e].expanded}}}};qe.styles=[...Ae.styles,t`
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
        `],We([c({context:m})],qe.prototype,"blockRegistry",2),We([c({context:f})],qe.prototype,"dragDropManager",2),We([s()],qe.prototype,"sections",2),qe=We([a("panel-blocks")],qe);var Xe=Object.defineProperty,Ye=Object.getOwnPropertyDescriptor,Ze=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ye(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Xe(t,i,a),a};let Je=class extends o{constructor(){super(...arguments),this.label="",this.value=null,this.unit="px",this.units=["px","%","em","rem","vw","vh"],this.min=0,this.max=9999,this.step=1,this.property="",this.defaultValue=0,this.defaultUnit="px",this.customized=!1}render(){return r`
      <div class="dimension-label-row">
        <span class="dimension-label ${this.customized?"customized":""}">${this.label}</span>
        <button
          class="dimension-reset ${this.customized?"visible":""}"
          @click=${this._onReset}
          title="Reset to default"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1L9 9M9 1L1 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
      <div class="dimension-input-group">
        <input
          type="number"
          class="dimension-value"
          .value=${this.customized?String(this.value??""):""}
          placeholder=${String(this.defaultValue)}
          min=${this.min}
          max=${this.max}
          step=${this.step}
          @input=${this._onValueChange}
        />
        <select class="dimension-unit" @change=${this._onUnitChange}>
          ${this.units.map(e=>r`
              <option value=${e} ?selected=${e===(this.customized?this.unit:this.defaultUnit)}>
                ${e}
              </option>
            `)}
        </select>
      </div>
    `}_onValueChange(e){const t=e.target.value;""===t||null===t?(this.customized=!1,this.value=null):(this.customized=!0,this.value=parseFloat(t)||0),this._dispatchChange()}_onUnitChange(e){const t=e.target;this.unit=t.value,this.customized&&this._dispatchChange()}_onReset(){this.customized=!1,this.value=null,this.unit=this.defaultUnit,this._dispatchChange()}_dispatchChange(){const e=this.customized?this.value??this.defaultValue:this.defaultValue,t=this.customized?this.unit:this.defaultUnit,i={property:this.property,value:e,unit:t,cssValue:`${e}${t}`,customized:this.customized};this.dispatchEvent(new CustomEvent("dimension-change",{detail:i,bubbles:!0,composed:!0}))}};Je.styles=t`
    :host {
      display: block;
      margin-bottom: 12px;
    }
    .dimension-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .dimension-label {
      font-size: 11px;
      color: var(--text-secondary);
      transition: color 0.15s ease;
    }
    .dimension-label.customized {
      color: var(--accent-color);
      font-weight: 500;
    }
    .dimension-reset {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 3px;
      padding: 0;
      opacity: 0;
      transition: opacity 0.15s ease, background 0.15s ease;
    }
    .dimension-reset.visible {
      opacity: 1;
    }
    .dimension-reset:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    .dimension-input-group {
      display: flex;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      overflow: hidden;
      background: var(--bg-primary);
    }
    .dimension-input-group:focus-within {
      border-color: var(--accent-color);
    }
    .dimension-value {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 12px;
      outline: none;
    }
    .dimension-value::placeholder {
      color: var(--text-secondary);
      opacity: 0.7;
    }
    .dimension-value::-webkit-inner-spin-button,
    .dimension-value::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .dimension-value[type='number'] {
      -moz-appearance: textfield;
    }
    .dimension-unit {
      padding: 6px 8px;
      border: none;
      border-left: 1px solid var(--border-color);
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-size: 11px;
      cursor: pointer;
      outline: none;
    }
    .dimension-unit:hover {
      background: var(--bg-secondary);
    }
  `,Ze([i({type:String})],Je.prototype,"label",2),Ze([i({type:Number})],Je.prototype,"value",2),Ze([i({type:String})],Je.prototype,"unit",2),Ze([i({type:Array})],Je.prototype,"units",2),Ze([i({type:Number})],Je.prototype,"min",2),Ze([i({type:Number})],Je.prototype,"max",2),Ze([i({type:Number})],Je.prototype,"step",2),Ze([i({type:String})],Je.prototype,"property",2),Ze([i({type:Number})],Je.prototype,"defaultValue",2),Ze([i({type:String})],Je.prototype,"defaultUnit",2),Ze([s()],Je.prototype,"customized",2),Je=Ze([a("dimension-input")],Je);var Ke=Object.defineProperty,Qe=Object.getOwnPropertyDescriptor,et=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Qe(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ke(t,i,a),a};let tt=class extends o{constructor(){super(...arguments),this.slots=[],this.slotError=null,this._handleSlotsChanged=()=>{this._refreshSlots()}}connectedCallback(){super.connectedCallback(),this._refreshSlots(),this.documentModel.addEventListener("slots-changed",this._handleSlotsChanged)}disconnectedCallback(){super.disconnectedCallback(),this.documentModel.removeEventListener("slots-changed",this._handleSlotsChanged)}render(){var e;const t=(null==(e=this.config)?void 0:e.mode)||"inherited";return r`
            <div class="entity-config-container">
                <!-- Mode Selector -->
                <div class="config-section">
                    <span class="section-label">Entity Mode</span>
                    <div class="mode-selector">
                        <div
                            class="mode-option ${"inherited"===t?"active":""}"
                            @click=${()=>this._setMode("inherited")}
                        >
                            <ha-icon icon="mdi:arrow-down-right-bold"></ha-icon>
                            Inherited
                        </div>
                        <div
                            class="mode-option ${"slot"===t?"active":""}"
                            @click=${()=>this._setMode("slot")}
                        >
                            <ha-icon icon="mdi:select-drag"></ha-icon>
                            Slot
                        </div>
                        <div
                            class="mode-option ${"fixed"===t?"active":""}"
                            @click=${()=>this._setMode("fixed")}
                        >
                            <ha-icon icon="mdi:pin"></ha-icon>
                            Fixed
                        </div>
                    </div>
                </div>

                <!-- Entity Selection / Info based on mode -->
                <div class="config-section">
                    ${"fixed"===t?this._renderFixedEntityPicker():"slot"===t?this._renderSlotConfig():this._renderInheritedInfo()}
                </div>
            </div>
        `}_refreshSlots(){this.slots=this.documentModel.getSlots()}_renderFixedEntityPicker(){var e;const t=(null==(e=this.config)?void 0:e.entityId)||"";return r`
            <span class="section-label">Entity</span>
            <ha-selector
                    .hass=${this.hass}
                    .selector=${{entity:{multiple:!1}}}
                    .value=${t}
                    @value-changed=${this._onEntityChanged}
                    allow-custom-entity
                    label="Select entity"
            ></ha-selector>
        `}_renderInheritedInfo(){const e=this.resolvedInfo;return e&&"none"!==e.source?r`
            <div class="inherited-info">
                <div class="inherited-header">
                    <ha-icon icon="mdi:arrow-down-right-bold"></ha-icon>
                    <span>Inherited Entity</span>
                </div>
                <div class="inherited-entity" title="${e.entityId}">
                    ${e.entityId}
                </div>
                ${e.inheritedFromId?r`
                    <div class="inherited-source">
                        <span>From:</span>
                        <span
                                class="source-link"
                                @click=${()=>this._selectSourceBlock(e.inheritedFromId)}
                        >
                            ${e.inheritedFromDisplayName||e.inheritedFromType}
                        </span>
                    </div>
                `:n}
            </div>
        `:this.documentModel.isEntityRequired(this.block.id)?r`
                    <div class="no-entity-warning">
                        <ha-icon icon="mdi:alert"></ha-icon>
                        <span>No parent entity found. Set an entity on a parent block or switch to static mode.</span>
                    </div>
                `:r`
                <div class="inherited-info">
                    <div class="inherited-header">
                        <ha-icon icon="mdi:arrow-down-right-bold"></ha-icon>
                        <span>Inherited Entity</span>
                    </div>
                    <div class="inherited-entity">
                        No Entity Inherited from Parents
                    </div>
                </div>
            `}_renderSlotConfig(){var e;const t=(null==(e=this.config)?void 0:e.slotId)||"",i=t?this.slots.find(e=>e.id===t):void 0;return r`
            <div class="slot-config">
                ${t?n:r`
                    <div class="no-entity-warning">
                        <ha-icon icon="mdi:alert"></ha-icon>
                        <span>No Slot ID. Please, select a Slot for the entity.</span>
                    </div>
                `}
                ${t&&!i?r`
                    <div class="no-entity-warning">
                        <ha-icon icon="mdi:alert"></ha-icon>
                        <span>Slot not found. Select a valid slot or create a new one.</span>
                    </div>
                `:n}
                <span class="section-label">Slot</span>
                <select
                        class="slot-id-input"
                        .value=${t}
                        @change=${this._onSlotSelectionChanged}
                >
                    <option value="" disabled ?selected=${!t}>Select slot</option>
                    ${this.slots.map(e=>r`
                        <option value=${e.id} ?selected=${e.id===t}>
                            ${e.name?`${e.name} (${e.id})`:e.id}
                        </option>
                    `)}
                </select>
                ${i?r`
                    <span class="slot-id-hint slot-id-hint-entity">Slot entity: <span class="slot-id-hint-entity-id">${i.entityId||"not set"}</span></span>
                    ${i.description?r`<span class="slot-id-hint slot-id-hint-description">${i.description}</span>`:n}
                `:r`<span class="slot-id-hint">Select an existing slot for this block</span>`}
                ${this.slotError?r`<span class="slot-id-hint">${this.slotError}</span>`:n}
            </div>
        `}_setMode(e){var t,i;const o={mode:e};"fixed"===e?o.entityId=null==(t=this.config)?void 0:t.entityId:"slot"===e&&(o.slotId=null==(i=this.config)?void 0:i.slotId),this._emitConfigChanged(o)}_onEntityChanged(e){const t={mode:"fixed",entityId:e.detail.value||""||void 0};this._emitConfigChanged(t)}_onSlotSelectionChanged(e){const t=e.target.value.trim();this.slotError=null;const i={mode:"slot",slotId:t||void 0};this._emitConfigChanged(i)}_selectSourceBlock(e){this.dispatchEvent(new CustomEvent("select-source-block",{detail:{blockId:e},bubbles:!0,composed:!0}))}_emitConfigChanged(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:e,bubbles:!0,composed:!0}))}};tt.styles=t`
        :host {
            display: block;
        }

        .entity-config-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .config-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .section-label {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary, #666);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        /* Mode Selector */

        .mode-selector {
            display: flex;
            background: var(--bg-tertiary, #f5f5f5);
            border-radius: 6px;
            padding: 2px;
            height: 32px;
        }

        .mode-option {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 500;
            color: var(--text-secondary, #666);
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
            user-select: none;
        }

        .mode-option ha-icon {
            --mdc-icon-size: 14px;
        }

        .mode-option:hover {
            color: var(--text-primary, #333);
        }

        .mode-option.active {
            background: var(--accent-color, #2196f3);
            color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .entity-input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            box-sizing: border-box;
        }

        .entity-input:focus {
            outline: none;
            border-color: var(--accent-color, #2196f3);
        }

        /* Inherited Info */

        .inherited-info {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 10px 12px;
            background: var(--bg-secondary, #f9f9f9);
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 6px;
        }

        .inherited-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-secondary, #666);
            --mdc-icon-size: 16px;
        }

        .inherited-icon {
            font-size: 14px;
        }

        .inherited-entity {
            font-family: monospace;
            font-size: 12px;
            color: var(--text-primary, #333);
            font-weight: 500;
            text-overflow: ellipsis;
            display: inline-block;
            overflow: hidden;
        }

        .inherited-source {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 10px;
            color: var(--text-secondary, #666);
        }

        .source-link {
            color: var(--accent-color, #2196f3);
            cursor: pointer;
            text-decoration: underline;
            font-weight: 500;
        }

        .source-link:hover {
            color: var(--accent-dark, #1976d2);
        }

        .no-entity-warning {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            background: rgba(255, 152, 0, 0.1);
            border: 1px solid rgba(255, 152, 0, 0.3);
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            color: var(--warning-color, #ff9800);
        }

        .warning-icon {
            font-size: 16px;
        }

        /* Slot Configuration */

        .slot-config {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-top: 8px;
            border-top: 1px solid var(--border-color, #e0e0e0);
        }

        .slot-toggle-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .slot-label {
            flex: 1;
            font-size: 11px;
            color: var(--text-secondary, #666);
        }

        .toggle-switch {
            position: relative;
            width: 40px;
            height: 20px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.3s;
            border-radius: 20px;
        }

        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
        }

        .toggle-switch input:checked + .toggle-slider {
            background-color: var(--accent-color, #2196f3);
        }

        .toggle-switch input:checked + .toggle-slider:before {
            transform: translateX(20px);
        }

        .slot-id-input {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 4px;
            font-size: 11px;
            font-family: monospace;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            box-sizing: border-box;
        }

        .slot-id-input:focus {
            outline: none;
            border-color: var(--accent-color, #2196f3);
        }

        .slot-id-hint {
            font-size: 10px;
            color: var(--text-secondary, #666);
            font-style: italic;
        }
        .slot-id-hint-entity {
            font-size: 12px;
        }
        .slot-id-hint-entity-id {
            font-weight: bold;
        }

        .slot-add-button {
            padding: 6px 10px;
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 4px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 11px;
            cursor: pointer;
        }

        .slot-add-button:hover {
            background: var(--bg-tertiary, #f0f0f0);
        }
    `,et([c({context:x})],tt.prototype,"documentModel",2),et([i({attribute:!1})],tt.prototype,"block",2),et([i({attribute:!1})],tt.prototype,"config",2),et([i({attribute:!1})],tt.prototype,"resolvedInfo",2),et([i({attribute:!1})],tt.prototype,"hass",2),et([s()],tt.prototype,"slots",2),et([s()],tt.prototype,"slotError",2),tt=et([a("entity-config-editor")],tt);const it=1,ot=12,rt=1,at=12,st=100,nt=["#4caf50","#2196f3","#ff9800","#9c27b0","#f44336","#00bcd4","#ff5722","#3f51b5","#8bc34a","#e91e63","#009688","#ffc107","#673ab7","#cddc39","#ff6f00","#03a9f4"];function lt(e,t="fr",i,o){return{value:e,unit:t,minValue:i,maxValue:o}}var dt=Object.defineProperty,ct=Object.getOwnPropertyDescriptor,pt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ct(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&dt(t,i,a),a};let ht=class extends o{constructor(){super(...arguments),this.selectedCells=null,this.isDragging=!1,this.dragStart=null}connectedCallback(){super.connectedCallback(),window.addEventListener("mouseup",this._handleMouseUp.bind(this))}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("mouseup",this._handleMouseUp.bind(this))}clearSelection(){this.selectedCells=null}render(){const e={gridTemplateRows:_(this.config.rowSizes),gridTemplateColumns:_(this.config.columnSizes),gap:`${this.config.gap.row}px ${this.config.gap.column}px`},t=[];for(let i=0;i<this.config.rows;i++)for(let e=0;e<this.config.columns;e++)t.push({row:i,column:e});return r`
      <div class="canvas-container">
        <div class="grid-preview" style=${h(e)}>
          ${u(t,e=>`${e.row}-${e.column}`,e=>{const t=(i=e.row,o=e.column,this.config.areas.find(e=>i>=e.rowStart&&i<e.rowEnd&&o>=e.columnStart&&o<e.columnEnd)||null);var i,o;const a=this._isCellSelected(e.row,e.column),s={"grid-cell":!0,selected:a,"in-area":!!t},n={};if(t&&t.color){const e=(e,t)=>`rgba(${parseInt(e.slice(1,3),16)}, ${parseInt(e.slice(3,5),16)}, ${parseInt(e.slice(5,7),16)}, ${t})`;a?(n.background=e(t.color,.9),n.borderColor=t.color):(n.background=e(t.color,.25),n.borderColor=e(t.color,.6))}return r`
                <div
                  class=${g(s)}
                  style=${h(n)}
                  @mousedown=${()=>this._handleCellMouseDown(e.row,e.column)}
                  @mouseenter=${()=>this._handleCellMouseEnter(e.row,e.column)}
                >
                  ${t&&e.row===t.rowStart&&e.column===t.columnStart?r`<span class="area-label">${t.name}</span>`:""}
                  <span class="cell-coordinates">${e.row+1},${e.column+1}</span>
                </div>
              `})}
        </div>
      </div>
    `}_isCellSelected(e,t){return!!this.selectedCells&&(e>=this.selectedCells.rowStart&&e<this.selectedCells.rowEnd&&t>=this.selectedCells.columnStart&&t<this.selectedCells.columnEnd)}_handleCellMouseDown(e,t){this.isDragging=!0,this.dragStart={row:e,column:t},this.selectedCells={rowStart:e,rowEnd:e+1,columnStart:t,columnEnd:t+1}}_handleCellMouseEnter(e,t){if(this.isDragging&&this.dragStart){const i=Math.min(this.dragStart.row,e),o=Math.max(this.dragStart.row,e)+1,r=Math.min(this.dragStart.column,t),a=Math.max(this.dragStart.column,t)+1;this.selectedCells={rowStart:i,rowEnd:o,columnStart:r,columnEnd:a}}}_handleMouseUp(){this.isDragging&&this.selectedCells&&this.dispatchEvent(new CustomEvent("cells-selected",{detail:{selection:this.selectedCells},bubbles:!0,composed:!0})),this.isDragging=!1,this.dragStart=null}};ht.styles=t`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: auto;
      background: var(--bg-primary, #fff);
    }

    .canvas-container {
      padding: 20px;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .grid-preview {
      display: grid;
      border: 2px solid var(--border-color, #ddd);
      background: var(--bg-secondary, #f9f9f9);
      min-width: 400px;
      min-height: 300px;
      position: relative;
    }

    .grid-cell {
      border: 1px solid var(--border-color, #ddd);
      background: var(--bg-primary, #fff);
      position: relative;
      cursor: pointer;
      transition: all 0.15s ease;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: var(--text-secondary, #999);
      user-select: none;
    }

    .grid-cell:hover {
      background: var(--accent-light, #e3f2fd);
      border-color: var(--accent-color, #2196f3);
    }

    .grid-cell.selected {
      background: var(--accent-color, #2196f3);
      color: white;
      border-color: var(--accent-color, #2196f3);
      z-index: 1;
    }

    .grid-cell.in-area {
      /* Color set via inline style with area-specific color */
      border-width: 2px;
    }

    .grid-cell.in-area.selected {
      /* Darker version when selected, set via inline style */
      color: white;
    }

    .area-label {
      position: absolute;
      top: 2px;
      left: 4px;
      font-size: 9px;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 4px;
      border-radius: 2px;
      pointer-events: none;
      z-index: 1;
    }

    .cell-coordinates {
      opacity: 0.5;
      font-size: 9px;
    }
  `,pt([i({type:Object})],ht.prototype,"config",2),pt([s()],ht.prototype,"selectedCells",2),pt([s()],ht.prototype,"isDragging",2),pt([s()],ht.prototype,"dragStart",2),ht=pt([a("grid-visual-canvas")],ht);var ut=Object.defineProperty,gt=Object.getOwnPropertyDescriptor,bt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?gt(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ut(t,i,a),a};let vt=class extends o{render(){const e="auto"!==this.dimension.unit,t="minmax"===this.dimension.unit;return r`
      <div class="size-input-container">
        <span class="index-label">${this.index+1}</span>
        ${e?r`
              <input
                type="number"
                class="value-input"
                .value=${this.dimension.value.toString()}
                @input=${this._handleValueChange}
                min="0"
                step=${"fr"===this.dimension.unit?"0.1":"1"}
              />
            `:""}
        <select class="unit-select" .value=${this.dimension.unit} @change=${this._handleUnitChange}>
          <option value="fr">fr</option>
          <option value="px">px</option>
          <option value="%">%</option>
          <option value="auto">auto</option>
          <option value="minmax">minmax</option>
        </select>
      </div>
      ${t?r`
            <div class="minmax-inputs">
              <span class="minmax-label">min:</span>
              <input
                type="number"
                class="minmax-input"
                .value=${(this.dimension.minValue??100).toString()}
                @input=${e=>this._handleMinMaxChange(e,"min")}
                min="0"
              />
              <span class="minmax-label">max:</span>
              <input
                type="number"
                class="minmax-input"
                .value=${(this.dimension.maxValue??300).toString()}
                @input=${e=>this._handleMinMaxChange(e,"max")}
                min="0"
              />
            </div>
          `:""}
    `}_handleValueChange(e){const t=e.target,i=parseFloat(t.value)||0;this.dispatchEvent(new CustomEvent("dimension-change",{detail:{index:this.index,type:this.type,dimension:{...this.dimension,value:i}},bubbles:!0,composed:!0}))}_handleUnitChange(e){const t=e.target.value,i={...this.dimension,unit:t};"minmax"===t&&(i.minValue=i.minValue??100,i.maxValue=i.maxValue??300),this.dispatchEvent(new CustomEvent("dimension-change",{detail:{index:this.index,type:this.type,dimension:i},bubbles:!0,composed:!0}))}_handleMinMaxChange(e,t){const i=e.target,o=parseFloat(i.value)||0,r={...this.dimension,["min"===t?"minValue":"maxValue"]:o};this.dispatchEvent(new CustomEvent("dimension-change",{detail:{index:this.index,type:this.type,dimension:r},bubbles:!0,composed:!0}))}};vt.styles=t`
    :host {
      display: block;
    }

    .size-input-container {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .index-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      min-width: 20px;
    }

    .value-input {
      flex: 1;
      padding: 4px 6px;
      font-size: 11px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 3px;
      background: var(--bg-primary, #fff);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .value-input:focus {
      border-color: var(--accent-color, #2196f3);
    }

    .unit-select {
      padding: 4px 6px;
      font-size: 11px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 3px;
      background: var(--bg-primary, #fff);
      outline: none;
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .unit-select:focus {
      border-color: var(--accent-color, #2196f3);
    }

    .minmax-inputs {
      display: flex;
      gap: 4px;
      margin-top: 4px;
      padding-left: 24px;
    }

    .minmax-label {
      font-size: 9px;
      color: var(--text-secondary, #999);
      min-width: 30px;
      display: flex;
      align-items: center;
    }

    .minmax-input {
      flex: 1;
      padding: 3px 5px;
      font-size: 10px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 2px;
      background: var(--bg-primary, #fff);
    }
  `,bt([i({type:Object})],vt.prototype,"dimension",2),bt([i({type:Number})],vt.prototype,"index",2),bt([i({type:String})],vt.prototype,"type",2),vt=bt([a("grid-size-input")],vt);var yt=Object.defineProperty,mt=Object.getOwnPropertyDescriptor,ft=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?mt(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&yt(t,i,a),a};let xt=class extends o{constructor(){super(...arguments),this.areas=[],this.selectedCells=null}render(){const e=!!this.selectedCells,t=e?{rows:this.selectedCells.rowEnd-this.selectedCells.rowStart,cols:this.selectedCells.columnEnd-this.selectedCells.columnStart}:null,i=this._getSuggestedAreaName();return r`
      <div class="area-manager">
        <!-- Create area section -->
        <div class="create-area-section">
          <div class="section-title">Create Grid Area</div>
          
          ${e?r`
                <div class="selection-info">
                  Selected: 
                  <span class="selection-coords">
                    ${t.rows} row${t.rows>1?"s":""} × 
                    ${t.cols} column${t.cols>1?"s":""}
                  </span>
                </div>
                <div class="create-area-form">
                  <div class="form-group">
                    <label class="form-label">Area Name</label>
                    <input
                      id="area-name-input"
                      type="text"
                      class="form-input"
                      .value=${i}
                      placeholder="e.g., header, sidebar"
                    />
                  </div>
                  <button
                    class="btn btn-primary"
                    @click=${this._handleCreateArea}
                  >
                    Create
                  </button>
                </div>
              `:r`
                <div class="selection-info">
                  Select cells in the grid to create an area
                </div>
              `}
        </div>

        <!-- Areas list -->
        <div>
          <div class="section-title">Defined Areas (${this.areas.length})</div>
          ${this.areas.length>0?r`
                <div class="areas-list">
                  ${u(this.areas,e=>e.name,e=>r`
                      <div class="area-item" style="border-left-color: ${e.color||"#ddd"}">
                        <div 
                          class="area-color-indicator" 
                          style="background-color: ${e.color||"#ddd"}"
                        ></div>
                        <div class="area-info">
                          <div class="area-name">${e.name}</div>
                          <div class="area-coords">${this._formatCoords(e)}</div>
                        </div>
                        <button
                          class="btn btn-danger"
                          @click=${()=>this._handleDeleteArea(e)}
                          title="Delete area"
                        >
                          Delete
                        </button>
                      </div>
                    `)}
                </div>
              `:r`
                <div class="no-areas">
                  No areas defined yet. Select cells to create one.
                </div>
              `}
        </div>
      </div>
    `}_handleCreateArea(){var e;if(!this.selectedCells)return;const t=null==(e=this.shadowRoot)?void 0:e.querySelector("#area-name-input"),i=(null==t?void 0:t.value.trim())||"";if(!i)return void alert("Please enter an area name");if(this.areas.some(e=>e.name===i))return void alert("An area with this name already exists");const o=(r=this.areas.length,nt[r%nt.length]);var r;const a={id:i.replaceAll(" ","-").toLowerCase(),name:i,rowStart:this.selectedCells.rowStart,rowEnd:this.selectedCells.rowEnd,columnStart:this.selectedCells.columnStart,columnEnd:this.selectedCells.columnEnd,color:o};this.dispatchEvent(new CustomEvent("area-created",{detail:{area:a},bubbles:!0,composed:!0}))}_handleDeleteArea(e){this.dispatchEvent(new CustomEvent("area-deleted",{detail:{area:e},bubbles:!0,composed:!0}))}_formatCoords(e){return`rows ${e.rowStart+1}-${e.rowEnd} / cols ${e.columnStart+1}-${e.columnEnd}`}_getSuggestedAreaName(){let e=1,t=`Area-${e}`;const i=new Set(this.areas.map(e=>e.name));for(;i.has(t);)e++,t=`Area-${e}`;return t}};xt.styles=t`
    :host {
      display: block;
    }

    .area-manager {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }

    .create-area-section {
      padding: 12px;
      background: var(--bg-secondary, #f5f5f5);
      border-radius: 4px;
      border: 1px solid var(--border-color, #ddd);
    }

    .selection-info {
      font-size: 11px;
      color: var(--text-secondary, #666);
      margin-bottom: 8px;
      padding: 6px 8px;
      background: var(--bg-primary, #fff);
      border-radius: 3px;
      border: 1px solid var(--border-color, #ddd);
    }

    .selection-coords {
      font-weight: 600;
      color: var(--text-primary, #333);
    }

    .create-area-form {
      display: flex;
      gap: 6px;
      align-items: flex-end;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
    }

    .form-input {
      padding: 6px 8px;
      font-size: 11px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 3px;
      background: var(--bg-primary, #fff);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .form-input:focus {
      border-color: var(--accent-color, #2196f3);
    }

    .btn {
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--accent-color, #2196f3);
      color: white;
    }

    .btn-primary:hover {
      background: var(--accent-dark, #1976d2);
    }

    .btn-primary:disabled {
      background: var(--border-color, #ddd);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-danger {
      background: var(--error-color, #f44336);
      color: white;
      padding: 4px 8px;
      font-size: 10px;
    }

    .btn-danger:hover {
      background: var(--error-dark, #d32f2f);
    }

    .areas-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .area-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      gap: 8px;
      border-left-width: 4px;
    }

    .area-color-indicator {
      width: 20px;
      height: 20px;
      border-radius: 3px;
      flex-shrink: 0;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .area-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .area-name {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary, #333);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .area-coords {
      font-size: 9px;
      color: var(--text-secondary, #999);
      font-family: monospace;
    }

    .no-areas {
      padding: 16px;
      text-align: center;
      font-size: 11px;
      color: var(--text-secondary, #999);
      background: var(--bg-secondary, #f5f5f5);
      border-radius: 4px;
      border: 1px dashed var(--border-color, #ddd);
    }
  `,ft([i({type:Array})],xt.prototype,"areas",2),ft([i({type:Object})],xt.prototype,"selectedCells",2),xt=ft([a("grid-area-manager")],xt);var _t=Object.defineProperty,kt=Object.getOwnPropertyDescriptor,wt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?kt(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&_t(t,i,a),a};let $t=class extends o{constructor(){super(...arguments),this.config={...k},this.selectedCells=null,this.collapsedTabs=new Set}render(){return r`
      <div class="editor-container">
        <!-- Header with grid dimensions -->
        <div class="editor-header">
          <h3 class="editor-title">Grid Layout Editor</h3>
          <div class="grid-dimensions">
            <div class="dimension-group">
              <label class="dimension-label">Rows</label>
              <div class="dimension-input">
                <input
                  type="number"
                  .value=${this.config.rows.toString()}
                  @input=${this._handleRowsChange}
                  min=${it}
                  max=${ot}
                />
                <span class="dimension-info">
                  (${it}-${ot})
                </span>
              </div>
            </div>
            <div class="dimension-group">
              <label class="dimension-label">Columns</label>
              <div class="dimension-input">
                <input
                  type="number"
                  .value=${this.config.columns.toString()}
                  @input=${this._handleColumnsChange}
                  min=${rt}
                  max=${at}
                />
                <span class="dimension-info">
                  (${rt}-${at})
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Body with canvas and sidebar -->
        <div class="editor-body">
          <!-- Canvas section -->
          <div class="canvas-section">
            <grid-visual-canvas
              .config=${this.config}
              @cells-selected=${this._handleCellsSelected}
            ></grid-visual-canvas>
          </div>

          <!-- Sidebar section -->
          <div class="sidebar-section">
            <!-- Row sizes tab -->
            <div class="sidebar-tab">
              <div
                class="tab-header ${this.collapsedTabs.has("rows")?"collapsed":""}"
                @click=${()=>this._toggleTab("rows")}
              >
                <span>Row Sizes</span>
                <div class="tab-icon"></div>
              </div>
              <div class="tab-content ${this.collapsedTabs.has("rows")?"hidden":""}">
                <div class="sizes-list">
                  ${u(this.config.rowSizes,(e,t)=>t,(e,t)=>r`
                      <grid-size-input
                        .dimension=${e}
                        .index=${t}
                        .type=${"row"}
                        @dimension-change=${this._handleDimensionChange}
                      ></grid-size-input>
                    `)}
                </div>
              </div>
            </div>

            <!-- Column sizes tab -->
            <div class="sidebar-tab">
              <div
                class="tab-header ${this.collapsedTabs.has("columns")?"collapsed":""}"
                @click=${()=>this._toggleTab("columns")}
              >
                <span>Column Sizes</span>
                <div class="tab-icon"></div>
              </div>
              <div class="tab-content ${this.collapsedTabs.has("columns")?"hidden":""}">
                <div class="sizes-list">
                  ${u(this.config.columnSizes,(e,t)=>t,(e,t)=>r`
                      <grid-size-input
                        .dimension=${e}
                        .index=${t}
                        .type=${"column"}
                        @dimension-change=${this._handleDimensionChange}
                      ></grid-size-input>
                    `)}
                </div>
              </div>
            </div>

            <!-- Gap tab -->
            <div class="sidebar-tab">
              <div
                class="tab-header ${this.collapsedTabs.has("gap")?"collapsed":""}"
                @click=${()=>this._toggleTab("gap")}
              >
                <span>Gap</span>
                <div class="tab-icon"></div>
              </div>
              <div class="tab-content ${this.collapsedTabs.has("gap")?"hidden":""}">
                <div class="gap-controls">
                  <div class="gap-group">
                    <label class="gap-label">Row Gap (px)</label>
                    <input
                      type="number"
                      class="gap-input"
                      .value=${this.config.gap.row.toString()}
                      @input=${e=>this._handleGapChange(e,"row")}
                      min="0"
                      max=${st}
                    />
                  </div>
                  <div class="gap-group">
                    <label class="gap-label">Column Gap (px)</label>
                    <input
                      type="number"
                      class="gap-input"
                      .value=${this.config.gap.column.toString()}
                      @input=${e=>this._handleGapChange(e,"column")}
                      min="0"
                      max=${st}
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Areas tab -->
            <div class="sidebar-tab">
              <div
                class="tab-header ${this.collapsedTabs.has("areas")?"collapsed":""}"
                @click=${()=>this._toggleTab("areas")}
              >
                <span>Grid Areas</span>
                <div class="tab-icon"></div>
              </div>
              <div class="tab-content ${this.collapsedTabs.has("areas")?"hidden":""}">
                <grid-area-manager
                  .areas=${this.config.areas}
                  .selectedCells=${this.selectedCells}
                  @area-created=${this._handleAreaCreated}
                  @area-deleted=${this._handleAreaDeleted}
                ></grid-area-manager>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="action-buttons">
          <button class="btn btn-cancel" @click=${this._handleCancel}>Cancel</button>
          <button class="btn btn-apply" @click=${this._handleApply}>Apply</button>
        </div>
      </div>
    `}_handleRowsChange(e){const t=e.target;let i=parseInt(t.value)||1;i=Math.max(it,Math.min(ot,i));const o={...this.config,rows:i};if(i>this.config.rowSizes.length){const e=i-this.config.rowSizes.length;o.rowSizes=[...this.config.rowSizes,...Array(e).fill(null).map(()=>lt(1,"fr"))]}else i<this.config.rowSizes.length&&(o.rowSizes=this.config.rowSizes.slice(0,i));o.areas=this.config.areas.filter(e=>e.rowEnd<=i&&e.columnEnd<=this.config.columns),this.config=o,this._clearSelection()}_handleColumnsChange(e){const t=e.target;let i=parseInt(t.value)||1;i=Math.max(rt,Math.min(at,i));const o={...this.config,columns:i};if(i>this.config.columnSizes.length){const e=i-this.config.columnSizes.length;o.columnSizes=[...this.config.columnSizes,...Array(e).fill(null).map(()=>lt(1,"fr"))]}else i<this.config.columnSizes.length&&(o.columnSizes=this.config.columnSizes.slice(0,i));o.areas=this.config.areas.filter(e=>e.rowEnd<=this.config.rows&&e.columnEnd<=i),this.config=o,this._clearSelection()}_handleDimensionChange(e){const{index:t,type:i,dimension:o}=e.detail,r={...this.config};"row"===i?(r.rowSizes=[...this.config.rowSizes],r.rowSizes[t]=o):(r.columnSizes=[...this.config.columnSizes],r.columnSizes[t]=o),this.config=r}_handleGapChange(e,t){const i=e.target,o=Math.max(0,Math.min(st,parseInt(i.value)||0));this.config={...this.config,gap:{...this.config.gap,[t]:o}}}_handleCellsSelected(e){this.selectedCells=e.detail.selection}_handleAreaCreated(e){const{area:t}=e.detail;this.config={...this.config,areas:[...this.config.areas,t]},this._clearSelection()}_handleAreaDeleted(e){const{area:t}=e.detail;this.config={...this.config,areas:this.config.areas.filter(e=>e.name!==t.name)}}_clearSelection(){var e;this.selectedCells=null,null==(e=this.canvas)||e.clearSelection()}_toggleTab(e){this.collapsedTabs.has(e)?this.collapsedTabs.delete(e):this.collapsedTabs.add(e),this.requestUpdate()}_handleCancel(){this.dispatchEvent(new CustomEvent("editor-cancel",{bubbles:!0,composed:!0}))}_handleApply(){this.dispatchEvent(new CustomEvent("editor-apply",{detail:{config:this.config},bubbles:!0,composed:!0}))}};$t.styles=t`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-primary, #fff);
    }

    .editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .editor-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color, #ddd);
      background: var(--bg-secondary, #f5f5f5);
    }

    .editor-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #333);
      margin: 0 0 12px 0;
    }

    .grid-dimensions {
      display: flex;
      gap: 16px;
      align-items: flex-end;
    }

    .dimension-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .dimension-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .dimension-input {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dimension-input input {
      width: 60px;
      padding: 6px 8px;
      font-size: 12px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      background: var(--bg-primary, #fff);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .dimension-input input:focus {
      border-color: var(--accent-color, #2196f3);
    }

    .dimension-info {
      font-size: 10px;
      color: var(--text-secondary, #999);
    }

    .editor-body {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .canvas-section {
      flex: 1;
      overflow: auto;
      border-right: 1px solid var(--border-color, #ddd);
    }

    .sidebar-section {
      width: 260px;
      overflow-y: auto;
      background: var(--bg-secondary, #f9f9f9);
      display: flex;
      flex-direction: column;
    }

    .sidebar-tab {
      border-bottom: 1px solid var(--border-color, #ddd);
    }

    .tab-header {
      padding: 12px 16px;
      background: var(--bg-tertiary, #e0e0e0);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-primary, #333);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.15s ease;
    }

    .tab-header:hover {
      background: var(--bg-secondary, #d0d0d0);
    }

    .tab-header.collapsed {
      border-bottom: 1px solid var(--border-color, #ddd);
    }

    .tab-icon {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid var(--text-secondary, #666);
      transition: transform 0.2s ease;
    }

    .tab-header.collapsed .tab-icon {
      transform: rotate(-90deg);
    }

    .tab-content {
      padding: 12px;
      background: var(--bg-primary, #fff);
    }

    .tab-content.hidden {
      display: none;
    }

    .sizes-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .gap-controls {
      display: flex;
      gap: 12px;
    }

    .gap-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .gap-label {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
    }

    .gap-input {
      width: 100%;
      padding: 6px 8px;
      font-size: 11px;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 3px;
      background: var(--bg-primary, #fff);
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--border-color, #ddd);
      background: var(--bg-secondary, #f5f5f5);
    }

    .btn {
      flex: 1;
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-cancel {
      background: var(--bg-tertiary, #e0e0e0);
      color: var(--text-primary, #333);
    }

    .btn-cancel:hover {
      background: var(--bg-secondary, #d0d0d0);
    }

    .btn-apply {
      background: var(--accent-color, #2196f3);
      color: white;
    }

    .btn-apply:hover {
      background: var(--accent-dark, #1976d2);
    }
  `,wt([i({type:Object})],$t.prototype,"config",2),wt([s()],$t.prototype,"selectedCells",2),wt([d("grid-visual-canvas")],$t.prototype,"canvas",2),$t=wt([a("grid-layout-editor")],$t);var St=Object.defineProperty,Ct=Object.getOwnPropertyDescriptor,It=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ct(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&St(t,i,a),a};let Et=class extends o{constructor(){super(...arguments),this.open=!1,this._escapeHandler=e=>{"Escape"===e.key&&this._handleCancel()}}connectedCallback(){super.connectedCallback(),this.config&&(this.editingConfig=JSON.parse(JSON.stringify(this.config)))}updated(e){super.updated(e),(e.has("open")&&this.open&&this.config||e.has("config")&&this.config&&this.open)&&(this.editingConfig=JSON.parse(JSON.stringify(this.config))),e.has("open")&&(this.open?this._addEscapeListener():this._removeEscapeListener())}disconnectedCallback(){super.disconnectedCallback(),this._removeEscapeListener()}render(){return this.editingConfig?r`
            <div class="overlay-backdrop" @click=${this._handleBackdropClick}></div>
            <div class="editor-panel">
                <div class="editor-content">
                    <grid-layout-editor
                            .config=${this.editingConfig}
                            @editor-cancel=${this._handleCancel}
                            @editor-apply=${this._handleApply}
                    ></grid-layout-editor>
                </div>
            </div>
        `:r``}_addEscapeListener(){window.addEventListener("keydown",this._escapeHandler)}_removeEscapeListener(){window.removeEventListener("keydown",this._escapeHandler)}_handleBackdropClick(e){e.target===e.currentTarget&&this._handleCancel()}_handleCancel(){this.dispatchEvent(new CustomEvent("overlay-cancel",{bubbles:!0,composed:!0}))}_handleApply(e){this.dispatchEvent(new CustomEvent("overlay-apply",{detail:e.detail,bubbles:!0,composed:!0}))}};Et.styles=t`
        :host {
            display: block;
            position: fixed;
            width: 100vw;
            top: 0;
            left: 100%;
            bottom: 0;
            z-index: 1000;
            pointer-events: none;
        }

        :host([open]) {
            pointer-events: auto;
            left: 0;
        }

        .overlay-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            opacity: 0;
            transition: opacity 0.8s ease;
            backdrop-filter: blur(3px);
        }

        :host([open]) .overlay-backdrop {
            opacity: 1;
        }


        .editor-panel {
            position: absolute;
            top: 0;
            left: 100%;
            bottom: 0;
            width: min(85vw, 1400px);
            background: var(--bg-primary, #fff);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 1;
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(0);
        }

        :host([open]) .editor-panel {
            transform: translateX(-100%);
        }

        .editor-content {
            flex: 1;
            overflow: hidden;
        }
    `,It([i({type:Boolean,reflect:!0})],Et.prototype,"open",2),It([i({type:Object})],Et.prototype,"config",2),It([s()],Et.prototype,"editingConfig",2),Et=It([a("grid-editor-overlay")],Et);const Bt=new class{constructor(){this._registry=new Map,this._isBooted=!1}define(e,t){this._registry.set(e,t),this._isBooted&&this.registerTag(e,t)}boot(){this._isBooted=!0,this._registry.forEach((e,t)=>{this.registerTag(t,e)})}registerTag(e,t){customElements.get(e)||customElements.define(e,t)}};var Pt=Object.defineProperty,zt=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&Pt(t,i,a),a};const Dt=class extends o{constructor(){super(...arguments),this.label="",this.property="",this.category="",this.origin="default",this.hasLocalOverride=!1,this.bindingEnabled=!1,this.showBindingToggle=!0,this.showOriginBadge=!0,this.disabled=!1}render(){const e=!!this.binding;return r`
      <div class="property-header">
        <div class="label-group">
          <span class="label">${this.label}</span>
          ${this.showOriginBadge?r`
            <property-origin-badge
              .origin=${this.origin}
              .presetName=${this.presetName}
              .originDevice=${this.originDevice}
              compact
            ></property-origin-badge>
          `:n}
        </div>
        
        <div class="controls">
          ${this.showBindingToggle?r`
            <button
              class="binding-toggle ${e?"active":""}"
              @click=${this._requestBindingEdit}
              ?disabled=${this.disabled}
              data-tooltip=${e?"Edit binding":"Add binding"}
              aria-label=${e?"Edit binding":"Add binding"}
            >
              <ha-icon icon="mdi:link-plus"></ha-icon>
            </button>
          `:n}

          <property-reset-button
            .canReset=${this.hasLocalOverride}
            .disabled=${this.disabled}
            @reset=${this._handleReset}
          ></property-reset-button>
        </div>
      </div>

      <div class="property-content">
        ${e?this._renderBindingSummary():n}
        ${e?n:r`<slot></slot>`}
      </div>
    `}willUpdate(e){e.has("hass")&&(this._bindingEvaluator=this.hass?new w(this.hass,{resolveSlotEntity:e=>{var t;return null==(t=this.documentModel)?void 0:t.resolveSlotEntity(e)}}):void 0)}_requestBindingEdit(){this.disabled||this.dispatchEvent(new CustomEvent("property-binding-edit",{detail:{property:this.property,category:this.category,label:this.label},bubbles:!0,composed:!0}))}_emitBindingChange(e){this.dispatchEvent(new CustomEvent("property-binding-change",{detail:{property:this.property,category:this.category,binding:e},bubbles:!0,composed:!0}))}_handleReset(){this.dispatchEvent(new CustomEvent("property-reset",{detail:{property:this.property,category:this.category},bubbles:!0,composed:!0}))}_handleRemoveBinding(e){e.stopPropagation(),this._emitBindingChange(null)}_evaluateBindingValue(){if(!this.binding)return{value:this.resolvedValue,success:!0};const e=this.resolvedValue??this.binding.default;return this._bindingEvaluator&&this.hass?this._bindingEvaluator.evaluate(this.binding,{defaultEntityId:this.defaultEntityId,defaultValue:e}):{value:e,success:!1}}_formatResolvedValue(e){if(null==e||""===e)return"--";const t={value:e,unit:this.resolvedUnit};return $(this.property,t)??String(e)}_formatBindingMode(e){return`${e.charAt(0).toUpperCase()}${e.slice(1)}`}_truncate(e,t){return e.length<=t?e:`${e.slice(0,t-3)}...`}_stringifyValue(e){if(null==e)return"unset";if("string"==typeof e)return e;if("number"==typeof e||"boolean"==typeof e)return String(e);try{return JSON.stringify(e)}catch(t){return String(e)}}_getBindingSummaryLines(e){var t,i,o,r,a,s;const n=[],l=(null==(t=e.entity)?void 0:t.slotId)??void 0,d=l?null==(i=this.documentModel)?void 0:i.resolveSlotEntity(l):void 0,c=l?d:(null==(o=e.entity)?void 0:o.entityId)??void 0,p=(null==(r=e.entity)?void 0:r.source)??"state";switch(l?(n.push(`Slot: ${l}`),c?n.push(`Entity: ${c}`):n.push("Entity: slot not set")):c?n.push(`Entity: ${c}`):this.defaultEntityId?n.push(`Entity: default (${this.defaultEntityId})`):n.push("Entity: default (not set)"),n.push("Source: "+("state"===p?"state":`attribute ${p}`)),n.push(`Mode: ${this._formatBindingMode(e.mode)}`),e.mode){case"direct":if(e.inputRange||e.outputRange){const t=e.inputRange?`${e.inputRange[0]}-${e.inputRange[1]}`:"auto",i=e.outputRange?`${e.outputRange[0]}-${e.outputRange[1]}`:"auto";n.push(`Range: ${t} -> ${i}`)}break;case"map":n.push(`Mappings: ${Object.keys(e.map??{}).length}`);break;case"threshold":n.push(`Thresholds: ${(null==(a=e.thresholds)?void 0:a.length)??0}`);break;case"template":e.template&&n.push(`Template: ${this._truncate(e.template,48)}`);break;case"condition":n.push(`Conditions: ${(null==(s=e.conditions)?void 0:s.length)??0}`)}return void 0!==e.default&&""!==e.default&&n.push(`Default: ${this._stringifyValue(e.default)}`),n}_renderBindingSummary(){if(!this.binding)return n;const e=this._evaluateBindingValue(),t=this._formatResolvedValue(e.value),i=this._getBindingSummaryLines(this.binding);return r`
      <div class="binding-summary">
        <div class="binding-value">
          <span class="binding-value-label">Resolved value</span>
          <div class="binding-value-field">
            <span title=${t}>${t}</span>
            <div class="binding-actions">
              <button class="binding-action" @click=${this._requestBindingEdit} ?disabled=${this.disabled}>Edit</button>
              <button class="binding-action danger" @click=${this._handleRemoveBinding} ?disabled=${this.disabled}>Remove</button>
            </div>
          </div>
        </div>
        <div class="binding-details">
          ${i.map(e=>r`<div class="binding-detail">${e}</div>`)}
        </div>
      </div>
    `}};Dt.styles=t`
        :host {
            display: block;
            margin-bottom: 12px;
        }

        .property-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
        }

        .label-group {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
            min-width: 0;
        }

        .label {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-primary, #333);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .controls {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
        }

        .binding-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: transparent;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.15s ease;
            --mdc-icon-size: 22px;
        }

        .binding-toggle:hover:not(:disabled) {
            background: var(--bg-secondary, #f5f5f5);
            border-color: var(--border-color, #d4d4d4);
            color: var(--text-primary, #333);
        }

        .binding-toggle.active {
            background: rgba(0, 120, 212, 0.1);
            border-color: var(--accent-color, #0078d4);
            color: var(--accent-color, #0078d4);
        }

        .binding-toggle:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .property-content {
            /* Slot for the actual input */
        }

        /* Tooltip for binding toggle */

        .binding-toggle[data-tooltip] {
            position: relative;
        }

        .binding-toggle[data-tooltip]::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 4px 8px;
            background: #333;
            color: white;
            font-size: 10px;
            font-weight: normal;
            border-radius: 4px;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.15s ease, visibility 0.15s ease;
            pointer-events: none;
            z-index: 100;
            margin-bottom: 4px;
        }

        .binding-toggle[data-tooltip]:hover::after {
            opacity: 1;
            visibility: visible;
        }

        .binding-summary {
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-secondary, #f5f5f5);
            border-radius: 4px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .binding-value {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .binding-value-label {
            font-size: 9px;
            font-weight: 600;
            color: var(--text-secondary, #666);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .binding-value-field {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 8px;
            background: var(--bg-primary, #fff);
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            font-size: 11px;
            color: var(--text-primary, #333);
            font-weight: 600;
            min-height: 28px;
            box-sizing: border-box;
        }

        .binding-value-field span {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .binding-actions {
            display: flex;
            gap: 6px;
        }

        .binding-action {
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            border-radius: 3px;
            padding: 4px 8px;
            font-size: 10px;
            cursor: pointer;
            white-space: nowrap;
        }

        .binding-action:hover {
            border-color: var(--accent-color, #0078d4);
            color: var(--accent-color, #0078d4);
        }

        .binding-action.danger:hover {
            border-color: #d32f2f;
            color: #d32f2f;
        }

        .binding-action:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .binding-details {
            display: grid;
            gap: 2px;
            font-size: 10px;
            color: var(--text-secondary, #666);
        }

        .binding-detail {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;let Mt=Dt;zt([i({attribute:!1})],Mt.prototype,"hass"),zt([c({context:x})],Mt.prototype,"documentModel"),zt([i({type:String})],Mt.prototype,"label"),zt([i({type:String})],Mt.prototype,"property"),zt([i({type:String})],Mt.prototype,"category"),zt([i({type:String})],Mt.prototype,"origin"),zt([i({type:String})],Mt.prototype,"presetName"),zt([i({type:String})],Mt.prototype,"originDevice"),zt([i({type:Boolean})],Mt.prototype,"hasLocalOverride"),zt([i({attribute:!1})],Mt.prototype,"binding"),zt([i({attribute:!1})],Mt.prototype,"resolvedValue"),zt([i({type:String})],Mt.prototype,"resolvedUnit"),zt([i({type:Boolean})],Mt.prototype,"bindingEnabled"),zt([i({type:Boolean})],Mt.prototype,"showBindingToggle"),zt([i({type:Boolean})],Mt.prototype,"showOriginBadge"),zt([i({type:Boolean})],Mt.prototype,"disabled"),zt([i({type:String})],Mt.prototype,"defaultEntityId"),Bt.define("property-row",Mt);class Rt{renderPropertyRow(e,t,i,o={}){const{description:a,resolvedValue:s,propertyValue:n}=o;if(!e.binding)return r`
        <div class="property-row">
          <label class="property-label" title="${a||""}">${e.label}</label>
          ${t}
        </div>
      `;const l=null==n?void 0:n.binding;return r`
      <property-row
        class="property-row"
        .hass=${i.hass}
        .label=${e.label}
        .property=${e.name}
        .category=${"props"}
        .origin=${"default"}
        .hasLocalOverride=${!1}
        .binding=${l}
        .resolvedValue=${s}
        .defaultEntityId=${i.defaultEntityId}
        .showBindingToggle=${!0}
        .showOriginBadge=${!1}
        title=${a||""}
      >
        ${t}
      </property-row>
    `}getPropertyValue(e,t){const i=this.getPropertyValueObject(e);return i?i.value??t:t}getPropertyValueObject(e){if(!e||"object"!=typeof e)return;return"value"in e||"binding"in e?e:void 0}getValue(e,t){return null==e?t:e}}class Vt extends Rt{render(e,t,i,o){var a;const s=null==(a=o.actionHandlers)?void 0:a.get(e.actionId);return r`
      <div class="property-row">
        <button
          class="edit-grid-button"
          @click=${()=>{s?s():console.warn(`[ActionTraitRenderer] No handler found for action: ${e.actionId}`)}}
        >
          ${e.icon?r`<span class="action-icon">${e.icon}</span>`:""}
          ${e.buttonLabel}
        </button>
      </div>
    `}}class Lt extends Rt{constructor(){super(...arguments),this.expandedAttributes=new Set}render(e,t,i,o){const r=this.getPropertyValue(t,[]),a=e.entityProp||"entity",s=o.props[a],n=o.props.entityMode,l="object"==typeof s&&null!==s&&"value"in s?s.value??"":s||"";return"fixed"===("object"==typeof n&&null!==n&&"value"in n?n.value??"fixed":n||"fixed")?this._renderFixedAttributeList(e,r,l,i,o):this._renderSlotAttributeList(e,r,i)}_renderFixedAttributeList(e,t,i,o,a){var s,l;const d=null==(l=null==(s=a.hass)?void 0:s.states)?void 0:l[i];if(!d)return r`
        <div class="slot-info">Select an entity to configure attributes</div>
      `;const c=Object.keys(d.attributes||{});return 0===c.length?r`
        <div class="slot-info">This entity has no attributes</div>
      `:r`
      <div class="attribute-list">
        ${c.map(i=>{const a=t.find(e=>e.name===i),s=(null==a?void 0:a.visible)??!1,l=(null==a?void 0:a.label)??"",d=(null==a?void 0:a.showLabel)??!0,c=this.expandedAttributes.has(i);return r`
            <div class="attribute-item">
              <div class="attribute-header">
                <input
                  type="checkbox"
                  class="attribute-checkbox"
                  .checked=${s}
                  @change=${r=>{this._toggleAttributeVisibility(e.name,i,r.target.checked,t,o)}}
                />
                <span class="attribute-name">${i}</span>
                ${s?r`
                  <button
                    class="attribute-toggle"
                    @click=${()=>this._toggleExpanded(i)}
                  >
                    <span class="attribute-toggle-icon ${c?"expanded":""}">▶</span>
                  </button>
                `:n}
              </div>
              ${s&&c?r`
                <div class="attribute-options">
                  <div class="attribute-option-row">
                    <span class="attribute-label-hint">Show label:</span>
                    <input
                      type="checkbox"
                      .checked=${d}
                      @change=${r=>{this._updateAttributeProperty(e.name,i,"showLabel",r.target.checked,t,o)}}
                    />
                  </div>
                  ${d?r`
                    <div class="attribute-option-row">
                      <span class="attribute-label-hint">Label:</span>
                      <input
                        type="text"
                        class="attribute-label-input"
                        .value=${l}
                        placeholder="Auto-generated"
                        @input=${r=>{this._updateAttributeProperty(e.name,i,"label",r.target.value||void 0,t,o)}}
                      />
                    </div>
                  `:n}
                </div>
              `:n}
            </div>
          `})}
      </div>
    `}_renderSlotAttributeList(e,t,i){return r`
      <div class="slot-info">Define which attributes will be displayed</div>
      
      ${t.length>0?r`
        <div class="attribute-list">
          ${t.map((o,a)=>{const s=o.showLabel??!0,l=this.expandedAttributes.has(`slot-${a}`);return r`
              <div class="attribute-item">
                <div class="attribute-header">
                  <span class="attribute-name">${o.name}</span>
                  <button
                    class="attribute-toggle"
                    @click=${()=>this._toggleExpanded(`slot-${a}`)}
                  >
                    <span class="attribute-toggle-icon ${l?"expanded":""}">▶</span>
                    <span>Options</span>
                  </button>
                  <button
                    class="attribute-remove-btn"
                    @click=${()=>this._removeSlotAttribute(e.name,a,t,i)}
                  >
                    Remove
                  </button>
                </div>
                ${l?r`
                  <div class="attribute-options">
                    <div class="attribute-option-row">
                      <span class="attribute-label-hint">Label:</span>
                      <input
                        type="text"
                        class="attribute-label-input"
                        .value=${o.label??""}
                        placeholder="Auto-generated"
                        @input=${o=>{this._updateSlotAttributeProperty(e.name,a,"label",o.target.value||void 0,t,i)}}
                      />
                    </div>
                    <div class="attribute-option-row">
                      <span class="attribute-label-hint">Show label:</span>
                      <input
                        type="checkbox"
                        .checked=${s}
                        @change=${o=>{this._updateSlotAttributeProperty(e.name,a,"showLabel",o.target.checked,t,i)}}
                      />
                    </div>
                  </div>
                `:n}
              </div>
            `})}
        </div>
      `:r`
        <div class="slot-info">No attributes configured yet</div>
      `}

      <div class="attribute-add-section">
        <input
          type="text"
          class="attribute-add-input"
          placeholder="attribute_name"
          id="new-attribute-input-${e.name}"
        />
        <button
          class="attribute-add-btn"
          @click=${o=>this._addSlotAttribute(o,e.name,t,i)}
        >
          Add
        </button>
      </div>
    `}_toggleExpanded(e){this.expandedAttributes.has(e)?this.expandedAttributes.delete(e):this.expandedAttributes.add(e),this.expandedAttributes=new Set(this.expandedAttributes)}_toggleAttributeVisibility(e,t,i,o,r){const a=o.findIndex(e=>e.name===t);let s;a>=0?(s=[...o],s[a]={...s[a],visible:i}):s=[...o,{name:t,visible:i}],r(e,s)}_updateAttributeProperty(e,t,i,o,r,a){const s=r.findIndex(e=>e.name===t);if(s<0)return;const n=[...r];n[s]={...n[s],[i]:o},a(e,n)}_updateSlotAttributeProperty(e,t,i,o,r,a){if(t<0||t>=r.length)return;const s=[...r];s[t]={...s[t],[i]:o},a(e,s)}_removeSlotAttribute(e,t,i,o){o(e,i.filter((e,i)=>i!==t))}_addSlotAttribute(e,t,i,o){const r=e.target.parentElement,a=null==r?void 0:r.querySelector(`#new-attribute-input-${t}`);if(!a)return;const s=a.value.trim();if(!s)return;if(i.some(e=>e.name===s))return;o(t,[...i,{name:s,visible:!0}]),a.value=""}}class Ot extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,!1);return this.renderPropertyRow(e,r`
        <input
          type="checkbox"
          .checked=${Boolean(s)}
          @change=${t=>{i(e.name,t.target.checked)}}
        />
      `,o,{description:e.description,resolvedValue:s,propertyValue:a})}}class Tt extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"#000000");return this.renderPropertyRow(e,r`
        <input
          type="color"
          class="property-input"
          .value=${String(s)}
          @input=${t=>{i(e.name,t.target.value)}}
        />
      `,o,{description:e.description,resolvedValue:s,propertyValue:a})}}class At extends Rt{render(e,t,i,o){const a="slot"===this.getPropertyValue(t,"fixed"),s=e.slotIdProp||"slotId",n=o.props[s],l="object"==typeof n&&null!==n&&"value"in n?n.value??"":n||"";return r`
      <div class="entity-mode-toggle">
        <span class="entity-mode-label">
          ${a?"Entity slot":"Fixed entity"}
        </span>
        <label class="toggle-switch">
          <input
            type="checkbox"
            .checked=${a}
            @change=${t=>{const o=t.target.checked;i(e.name,o?"slot":"fixed")}}
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
      ${a?r`
        <div class="property-row">
          <label class="property-label">Slot ID</label>
          <input
            type="text"
            class="property-input"
            .value=${l}
            @input=${e=>{i(s,e.target.value)}}
          />
          <div class="slot-info">This entity will be configurable when the card is used</div>
        </div>
      `:""}
    `}}class Ht extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return o.hass?this.renderPropertyRow(e,r`
        <ha-selector
          .hass=${o.hass}
          .selector=${{entity:{multiple:!1,domain:e.includeDomains,device_class:e.deviceClass}}}
          .value=${s}
          @value-changed=${t=>{i(e.name,t.detail.value)}}
        ></ha-selector>
      `,o,{description:e.description,resolvedValue:s,propertyValue:a}):r``}}class jt extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return o.hass?this.renderPropertyRow(e,r`
        <ha-icon-picker
          .hass=${o.hass}
          .value=${s}
          @value-changed=${t=>{i(e.name,t.detail.value)}}
        ></ha-icon-picker>
      `,o,{description:e.description,resolvedValue:s,propertyValue:a}):r``}}class Nt extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return this.renderPropertyRow(e,r`
        <div class="property-info">
          ${s}
          ${e.description?r`
            <div class="info-text">${e.description}</div>
          `:""}
        </div>
      `,o,{resolvedValue:s,propertyValue:a})}}class Ut extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,0);return this.renderPropertyRow(e,r`
        <input
          type="number"
          class="property-input"
          .value=${String(s)}
          min="${e.min??""}"
          max="${e.max??""}"
          step="${e.step??1}"
          @input=${t=>{const o=t.target.value,r=e.step&&e.step<1?parseFloat(o):parseInt(o,10);i(e.name,isNaN(r)?0:r)}}
        />
      `,o,{description:e.description,resolvedValue:s,propertyValue:a})}}class Ft extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return this.renderPropertyRow(e,r`
        <select
          class="property-input"
          .value=${String(s)}
          @change=${t=>{i(e.name,t.target.value)}}
        >
          ${e.options.map(e=>r`
            <option value="${e.value}" ?selected=${s===e.value}>
              ${e.label}
            </option>
          `)}
        </select>
      `,o,{description:e.description,resolvedValue:s,propertyValue:a})}}class Gt extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,""),n="object"==typeof s&&null!==s&&"isTemplate"in s,l=n?s.value:s,d=n&&s.isTemplate;return e.templateSupport?this.renderPropertyRow(e,r`
          <div class="property-with-template">
            ${d?r`
              <textarea
                class="property-input template-textarea"
                .value=${l}
                @input=${t=>{const o=t.target.value;i(e.name,{value:o,isTemplate:!0})}}
                placeholder="Enter Jinja2 template..."
              ></textarea>
            `:r`
              <input
                type="text"
                class="property-input"
                .value=${l}
                placeholder="${e.placeholder||""}"
                @input=${t=>{const o=t.target.value;i(e.name,{value:o,isTemplate:!1})}}
              />
            `}
            <button
              class="template-toggle ${d?"active":""}"
              @click=${()=>{i(e.name,{value:l,isTemplate:!d})}}
              title="${d?"Switch to visual mode":"Switch to template mode"}"
            >
              ${d?"T":"V"}
            </button>
          </div>
        `,o,{description:e.description,resolvedValue:l,propertyValue:a}):this.renderPropertyRow(e,r`
        <input
          type="text"
          class="property-input"
          .value=${String(l)}
          placeholder="${e.placeholder||""}"
          @input=${t=>{i(e.name,t.target.value)}}
        />
      `,o,{description:e.description,resolvedValue:l,propertyValue:a})}}class Wt extends Rt{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return this.renderPropertyRow(e,r`
        <textarea
          class="property-input"
          rows="${e.rows||3}"
          placeholder="${e.placeholder||""}"
          .value=${String(s)}
          @input=${t=>{i(e.name,t.target.value)}}
        ></textarea>
      `,o,{description:e.description,resolvedValue:s,propertyValue:a})}}const qt=class{static register(e,t){this.renderers.set(e,t)}static get(e){return this.initialize(),this.renderers.get(e)}static render(e,t,i,o){this.initialize();const a=this.renderers.get(e.type);return a?a.render(e,t,i,o):(console.warn(`[TraitRendererFactory] No renderer found for trait type: ${e.type}`),r`
        <div class="property-row">
          <span class="property-label">${e.label}</span>
          <span style="color: var(--error-color, red); font-size: 11px;">
            Unknown trait type: ${e.type}
          </span>
        </div>
      `)}static hasRenderer(e){return this.initialize(),this.renderers.has(e)}static initialize(){this.initialized||(this.register("text",new Gt),this.register("number",new Ut),this.register("color",new Tt),this.register("checkbox",new Ot),this.register("select",new Ft),this.register("textarea",new Wt),this.register("entity-picker",new Ht),this.register("icon-picker",new jt),this.register("action",new Vt),this.register("info",new Nt),this.register("entity-mode",new At),this.register("attribute-list",new Lt),this.initialized=!0)}};qt.renderers=new Map,qt.initialized=!1;let Xt=qt;class Yt{static evaluate(e,t){return void 0===e||this._evaluateCondition(e,t)}static _evaluateCondition(e,t){const{props:i}=t;if(function(e){return"prop"in e&&"eq"in e}(e)){return this._getNestedValue(i,e.prop)===e.eq}if(function(e){return"prop"in e&&"neq"in e}(e)){return this._getNestedValue(i,e.prop)!==e.neq}if(function(e){return"prop"in e&&"in"in e}(e)){const t=this._getNestedValue(i,e.prop);return e.in.includes(t)}if(function(e){return"prop"in e&&"exists"in e}(e)){const t=this._getNestedValue(i,e.prop),o=null!=t&&""!==t;return e.exists?o:!o}return function(e){return"and"in e}(e)?e.and.every(e=>this._evaluateCondition(e,t)):function(e){return"or"in e}(e)?e.or.some(e=>this._evaluateCondition(e,t)):function(e){return"not"in e}(e)?!this._evaluateCondition(e.not,t):(console.warn("[VisibilityEvaluator] Unknown condition type:",e),!0)}static _getNestedValue(e,t){const i=t.split(".");let o=e;for(const r of i){if(null==o)return;o=o[r]}return o}}var Zt=Object.defineProperty,Jt=Object.getOwnPropertyDescriptor,Kt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Jt(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Zt(t,i,a),a};let Qt=class extends o{constructor(){super(...arguments),this.label="",this.groupId="",this.collapsed=!1,this._isCollapsed=!1,this._hasRestoredState=!1}connectedCallback(){super.connectedCallback(),this._restoreState()}willUpdate(e){e.has("collapsed")&&!this._hasRestoredState&&(this._isCollapsed=this.collapsed)}render(){return r`
      <div class="property-group">
        <div class="group-header" @click=${this._toggleCollapsed}>
          <span class="collapse-icon ${this._isCollapsed?"":"expanded"}">▶</span>
          <span class="group-label">${this.label}</span>
        </div>
        <div class="group-content ${this._isCollapsed?"collapsed":""}">
          <slot></slot>
        </div>
      </div>
    `}_restoreState(){if(!this.groupId)return;const e=Qt.STORAGE_PREFIX+this.groupId,t=localStorage.getItem(e);null!==t?(this._isCollapsed="true"===t,this._hasRestoredState=!0):this._isCollapsed=this.collapsed}_saveState(){if(!this.groupId)return;const e=Qt.STORAGE_PREFIX+this.groupId;localStorage.setItem(e,String(this._isCollapsed))}_toggleCollapsed(){this._isCollapsed=!this._isCollapsed,this._saveState(),this.dispatchEvent(new CustomEvent("group-toggle",{detail:{groupId:this.groupId,collapsed:this._isCollapsed},bubbles:!0,composed:!0}))}};Qt.styles=t`
    :host {
      display: block;
      margin-bottom: 8px;
    }

    .property-group {
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      overflow: hidden;
      background: var(--card-background-color, #fff);
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--secondary-background-color, #f5f5f5);
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease;
    }

    .group-header:hover {
      background: var(--divider-color, #e0e0e0);
    }

    .collapse-icon {
      font-size: 10px;
      color: var(--secondary-text-color, #666);
      transition: transform 0.2s ease;
      width: 12px;
      text-align: center;
    }

    .collapse-icon.expanded {
      transform: rotate(90deg);
    }

    .group-label {
      flex: 1;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--primary-text-color, #333);
    }

    .group-content {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }

    .group-content.collapsed {
      display: none;
    }

    /* Slot content styling */
    ::slotted(.property-row) {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `,Qt.STORAGE_PREFIX="card-builder-property-group-",Kt([i({type:String})],Qt.prototype,"label",2),Kt([i({type:String})],Qt.prototype,"groupId",2),Kt([i({type:Boolean})],Qt.prototype,"collapsed",2),Kt([s()],Qt.prototype,"_isCollapsed",2),Qt=Kt([a("property-group")],Qt);var ei=Object.defineProperty,ti=Object.getOwnPropertyDescriptor,ii=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ti(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ei(t,i,a),a};const oi=["unavailable","unknown"],ri={alarm_control_panel:["disarmed","armed_home","armed_away","armed_night","armed_vacation","armed_custom_bypass","arming","disarming","pending","triggered"],automation:["on","off"],binary_sensor:["on","off"],cover:["open","closed","opening","closing","stopped"],device_tracker:["home","not_home"],fan:["on","off"],input_boolean:["on","off"],light:["on","off"],lock:["locked","unlocked","locking","unlocking","jammed"],media_player:["off","idle","playing","paused","standby","buffering"],person:["home","not_home"],script:["on","off"],siren:["on","off"],sun:["above_horizon","below_horizon"],switch:["on","off"],timer:["idle","active","paused"],update:["on","off"],vacuum:["idle","cleaning","paused","returning","docked","error"],weather:["clear-night","cloudy","exceptional","fog","hail","lightning","lightning-rainy","partlycloudy","pouring","rainy","snowy","snowy-rainy","sunny","windy","windy-variant"]},ai=new Set(["alarm_control_panel","automation","binary_sensor","climate","cover","device_tracker","fan","input_boolean","input_select","light","lock","media_player","person","script","select","siren","sun","switch","timer","update","vacuum","water_heater","weather"]),si=new Set(["counter","input_number","number","proximity","sensor"]);let ni=class extends o{constructor(){super(...arguments),this.slots=[],this.disabled=!1,this._entityMode="default",this._customEntityId="",this._slotId="",this._valueSource="state",this._availableAttributes=[],this._stateOptions=null,this._thresholdSupported=!0,this._mode="direct",this._mapEntries=[],this._thresholds=[],this._template="",this._defaultValue=void 0,this._defaultHasValue=!1,this._inputRange=[0,100],this._outputRange=[0,100],this._useRangeMapping=!1}get _effectiveEntityId(){return"default"===this._entityMode?this.defaultEntityId:"slot"===this._entityMode?this._getSlotEntityId(this._slotId):this._customEntityId}connectedCallback(){super.connectedCallback(),this._syncFromBinding()}shouldUpdate(e){return e.has("binding")&&this._syncFromBinding(),e.has("valueInputConfig")&&this._syncValueInputConfig(),e.has("defaultEntityId")&&!e.has("binding")&&this._updateEntityOptions(),e.has("slots")&&!e.has("binding")&&(this._loadAvailableAttributes(),this._updateEntityOptions()),(!e.has("hass")||1!==e.size)&&super.shouldUpdate(e)}render(){return this.hass?r`
            ${this._renderEntitySourceSection()}
            ${this._renderValueSourceSection()}

            <div class="section">
                <div class="section-title">Binding Mode</div>
                <div class="mode-selector">
                    ${this._renderModeButton("direct","Direct")}
                    ${this._renderModeButton("map","Map")}
                    ${this._thresholdSupported?this._renderModeButton("threshold","Threshold"):n}
                    ${this._renderModeButton("template","Template")}
                </div>
            </div>

            ${this._renderModeConfig()}

            <div class="section">
                <div class="row">
                    <label>Default</label>
                    <div class="default-input">
                        ${this._renderValueInput(this._defaultValue,(e,t)=>this._handleDefaultValueChange(e,t),"Fallback value")}
                    </div>
                    <button
                            class="icon-btn"
                            @click=${this._clearDefaultValue}
                            ?disabled=${this.disabled||!this._defaultHasValue}
                    >×
                    </button>
                </div>
            </div>
        `:r``}_syncFromBinding(){if(!this.binding)return this._mode="direct",this._defaultValue=void 0,this._defaultHasValue=!1,this._mapEntries=[],this._thresholds=[],this._template="",this._useRangeMapping=!1,this._entityMode="default",this._customEntityId="",this._slotId="",this._valueSource="state",this._syncValueInputConfig(),void this._updateEntityOptions();switch(this._mode=this.binding.mode,this._defaultHasValue=void 0!==this.binding.default,this._defaultValue=this._defaultHasValue?this.binding.default:this._getDefaultValueForInput(),this.binding.entity?(this.binding.entity.slotId?(this._entityMode="slot",this._slotId=this.binding.entity.slotId||"",this._customEntityId=""):void 0!==this.binding.entity.entityId?(this._entityMode="custom",this._customEntityId=this.binding.entity.entityId||"",this._slotId=""):(this._entityMode="default",this._customEntityId="",this._slotId=""),this._valueSource=this.binding.entity.source||"state",this._loadAvailableAttributes()):(this._entityMode="default",this._customEntityId="",this._slotId="",this._valueSource="state"),this.binding.mode){case"direct":{const e=this.binding;this._useRangeMapping=!(!e.inputRange&&!e.outputRange),this._inputRange=e.inputRange??[0,100],this._outputRange=e.outputRange??[0,100];break}case"map":{const e=this.binding;this._mapEntries=Object.entries(e.map).map(([e,t])=>({key:e,value:t}));break}case"threshold":{const e=this.binding;this._thresholds=[...e.thresholds];break}case"template":{const e=this.binding;this._template=e.template;break}}this._syncValueInputConfig(),this._updateEntityOptions()}_buildBinding(){const e="default"===this._entityMode&&"state"===this._valueSource?void 0:{entityId:"custom"===this._entityMode?this._customEntityId||null:void 0,slotId:"slot"===this._entityMode?this._slotId||null:void 0,source:this._valueSource},t={default:this._defaultHasValue?this._normalizeDefaultValue(this._defaultValue):void 0,entity:e};switch(this._mode){case"direct":{const e={...t,mode:"direct"};return this._useRangeMapping&&(e.inputRange=this._inputRange,e.outputRange=this._outputRange),e}case"map":{const e={};for(const t of this._mapEntries)t.key&&(e[t.key]=t.value);return{...t,mode:"map",map:e}}case"threshold":return{...t,mode:"threshold",thresholds:this._thresholds};case"condition":return{...t,mode:"condition",conditions:[]};case"template":return{...t,mode:"template",template:this._template}}}_emitChange(){const e=this._buildBinding();this.dispatchEvent(new CustomEvent("binding-change",{detail:{binding:e,unit:this._valueUnit},bubbles:!0,composed:!0}))}_handleModeChange(e){this._mode=e,this._emitChange()}_handleDefaultValueChange(e,t){this._defaultValue=e,this._defaultHasValue=!this._isEmptyDefaultValue(e),this._setValueUnit(t),this._emitChange()}_clearDefaultValue(){this._defaultValue=this._getDefaultValueForInput(),this._defaultHasValue=!1,this._emitChange()}_addMapEntry(){this._mapEntries=[...this._mapEntries,{key:"",value:this._getDefaultValueForInput()}]}_updateMapEntryKey(e,t){this._mapEntries=this._mapEntries.map((i,o)=>o===e?{...i,key:t}:i),this._emitChange()}_updateMapEntryValue(e,t,i){this._mapEntries=this._mapEntries.map((i,o)=>o===e?{...i,value:t}:i),this._setValueUnit(i),this._emitChange()}_removeMapEntry(e){this._mapEntries=this._mapEntries.filter((t,i)=>i!==e),this._emitChange()}_addThreshold(){this._thresholds=[...this._thresholds,{min:0,max:100,value:this._getDefaultValueForInput()}]}_updateThreshold(e,t,i){this._thresholds=this._thresholds.map((o,r)=>r===e?{...o,[t]:i}:o),this._emitChange()}_updateThresholdValue(e,t,i){this._thresholds=this._thresholds.map((i,o)=>o===e?{...i,value:t}:i),this._setValueUnit(i),this._emitChange()}_removeThreshold(e){this._thresholds=this._thresholds.filter((t,i)=>i!==e),this._emitChange()}_toggleRangeMapping(e){this._useRangeMapping=e.target.checked,this._emitChange()}_updateRange(e,t,i){"input"===e?this._inputRange=0===t?[i,this._inputRange[1]]:[this._inputRange[0],i]:this._outputRange=0===t?[i,this._outputRange[1]]:[this._outputRange[0],i],this._emitChange()}_handleEntityModeChange(e){this._entityMode=e,"custom"!==e&&(this._customEntityId=""),"slot"!==e?this._slotId="":!this._slotId&&this.slots.length>0&&(this._slotId=this.slots[0].id),this._loadAvailableAttributes(),this._updateEntityOptions(),this._emitChange()}_handleCustomEntityChange(e){this._customEntityId=e.detail.value||"",this._loadAvailableAttributes(),this._updateEntityOptions(),this._emitChange()}_handleSlotSelectionChange(e){const t=e.target;this._slotId=t.value||"",this._loadAvailableAttributes(),this._updateEntityOptions(),this._emitChange()}_handleValueSourceChange(e){this._valueSource=e,this._updateEntityOptions(),this._emitChange()}_handleAttributeChange(e){this._valueSource=e.target.value||"state",this._updateEntityOptions(),this._emitChange()}_loadAvailableAttributes(){var e,t;const i=this._effectiveEntityId;if(!i||!(null==(t=null==(e=this.hass)?void 0:e.states)?void 0:t[i]))return void(this._availableAttributes=[]);const o=this.hass.states[i];this._availableAttributes=Object.keys(o.attributes||{}).sort()}_getSlotEntityId(e){var t;if(e)return null==(t=this.slots.find(t=>t.id===e))?void 0:t.entityId}_syncValueInputConfig(){var e;const t=this.valueInputConfig;if(t){if("number"===t.type||"slider"===t.type||"spacing"===t.type){const i=t.unit??(null==(e=t.units)?void 0:e[0]);return i?void((!this._valueUnit||t.units&&!t.units.includes(this._valueUnit))&&(this._valueUnit=i)):void(this._valueUnit=void 0)}this._valueUnit=void 0}else this._valueUnit=void 0}_setValueUnit(e){e&&e!==this._valueUnit&&(this._valueUnit=e)}_normalizeDefaultValue(e){if("string"!=typeof e||""!==e.trim())return e}_isEmptyDefaultValue(e){return null==e||"string"==typeof e&&""===e.trim()}_getDefaultValueForInput(){var e;const t=this.valueInputConfig;if(!t)return"";switch(t.type){case"color":return"#000000";case"number":case"slider":return t.min??0;case"select":return(null==(e=t.options[0])?void 0:e.value)??"";case"spacing":return{top:0,right:0,bottom:0,left:0};default:return""}}_getEntityState(){var e,t;const i=this._effectiveEntityId;if(i&&(null==(t=null==(e=this.hass)?void 0:e.states)?void 0:t[i]))return this.hass.states[i]}_getEntityDomain(e){if(!e)return;const[t]=e.split(".");return t||void 0}_buildStateOptions(e,t){const i=[],o=e=>{i.includes(e)||i.push(e)};for(const r of e)"string"==typeof r&&r&&o(r);null!=t&&o(String(t));for(const r of oi)o(r);return i}_getAttributeStateOptions(e,t){if("input_select"===e||"select"===e){const e=t.options;if(Array.isArray(e))return e}if("climate"===e){const e=t.hvac_modes;if(Array.isArray(e))return e}if("water_heater"===e){const e=t.operation_list??t.available_modes;if(Array.isArray(e))return e}return null}_getStateOptions(){if("state"!==this._valueSource)return null;const e=this._getEntityState();if(!e)return null;const t=this._getEntityDomain(e.entity_id);if(!t)return null;const i=this._getAttributeStateOptions(t,e.attributes||{});if(i)return this._buildStateOptions(i,e.state);const o=ri[t];return o?this._buildStateOptions(o,e.state):null}_isNumericValue(e){return"number"==typeof e?!Number.isNaN(e):"string"==typeof e&&""!==e.trim()&&!Number.isNaN(Number(e))}_isThresholdSupported(){if("state"===this._valueSource){if(this._stateOptions&&this._stateOptions.length>0)return!1;const e=this._getEntityDomain(this._effectiveEntityId);if(e&&ai.has(e))return!1;const t=this._getEntityState();return t&&this._isNumericValue(t.state)||e&&si.has(e),!0}const e=this._getEntityState();if(!e)return!0;const t=(e.attributes||{})[this._valueSource];return null==t||""===t||this._isNumericValue(t)}_updateEntityOptions(){this._stateOptions=this._getStateOptions(),this._thresholdSupported=this._isThresholdSupported()}_coerceSpacing(e){if(e&&"object"==typeof e){const t=e;return{top:Number(t.top??0),right:Number(t.right??0),bottom:Number(t.bottom??0),left:Number(t.left??0)}}return{top:0,right:0,bottom:0,left:0}}_coerceNumber(e,t){const i="number"==typeof e?e:Number(e);return Number.isFinite(i)?i:t}_renderValueInput(e,t,i){var o,a,s,l;const d=this.valueInputConfig;if(!d||"text"===d.type){const o=d&&"text"===d.type&&d.placeholder?d.placeholder:i??"";return r`
                <input
                        type="text"
                        .value=${"string"==typeof e?e:void 0===e?"":String(e)}
                        @input=${e=>t(e.target.value)}
                        placeholder=${o}
                        ?disabled=${this.disabled}
                />
            `}switch(d.type){case"color":return r`
                    <sm-color-input
                            .value=${"string"==typeof e&&e?e:"#000000"}
                            @change=${e=>t(e.detail.value)}
                    ></sm-color-input>
                `;case"select":{const i=void 0!==e?String(e):(null==(o=d.options[0])?void 0:o.value)??"";return r`
                    <sm-select-input
                            .value=${i}
                            .options=${d.options}
                            @change=${e=>t(e.detail.value)}
                    ></sm-select-input>
                `}case"spacing":{const i=this._valueUnit??d.unit??(null==(a=d.units)?void 0:a[0])??"px",o=d.units??(d.unit?[d.unit]:["px"]);return r`
                    <sm-spacing-input
                            .value=${this._coerceSpacing(e)}
                            .unit=${i}
                            .units=${o}
                            @change=${e=>t(e.detail.value,e.detail.unit)}
                    ></sm-spacing-input>
                `}case"slider":{const i=this._valueUnit??d.unit??(null==(s=d.units)?void 0:s[0]),o=d.units??(d.unit?[d.unit]:[]);return r`
                    <sm-slider-input
                            .value=${this._coerceNumber(e,d.min)}
                            min=${d.min}
                            max=${d.max}
                            step=${d.step??1}
                            .unit=${i}
                            .units=${o}
                            @change=${e=>t(e.detail.value,e.detail.unit)}
                    ></sm-slider-input>
                `}case"number":{if(!Boolean(d.unit||d.units&&d.units.length>0))return r`
                        <input
                                type="number"
                                .value=${String(this._coerceNumber(e,d.min??0))}
                                min=${d.min??""}
                                max=${d.max??""}
                                step=${d.step??1}
                                @input=${e=>t(Number(e.target.value))}
                                ?disabled=${this.disabled}
                        />
                    `;const i=this._valueUnit??d.unit??(null==(l=d.units)?void 0:l[0])??"px",o=d.units??(d.unit?[d.unit]:["px"]);return r`
                    <sm-number-input
                            .value=${this._coerceNumber(e,d.min??0)}
                            min=${d.min??""}
                            max=${d.max??""}
                            step=${d.step??1}
                            .unit=${i}
                            .units=${o}
                            @change=${e=>t(e.detail.value,e.detail.unit)}
                    ></sm-number-input>
                `}default:return n}}_handleTemplateChange(e){this._template=e.target.value,this._emitChange()}_renderEntitySourceSection(){const e="slot"===this._entityMode?this._getSlotEntityId(this._slotId):void 0;return r`
            <div class="section">
                <div class="section-title">Entity Source</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input
                                type="radio"
                                name="entity-source"
                                .checked=${"default"===this._entityMode}
                                @change=${()=>this._handleEntityModeChange("default")}
                                ?disabled=${this.disabled}
                        />
                        <div class="radio-option-content">
                            <span class="radio-label">Use default entity</span>
                            ${this.defaultEntityId?r`<span class="radio-sublabel">${this.defaultEntityId}</span>`:r`<span class="radio-sublabel">(no default entity set)</span>`}
                        </div>
                    </label>
                    <label class="radio-option">
                        <input
                                type="radio"
                                name="entity-source"
                                .checked=${"custom"===this._entityMode}
                                @change=${()=>this._handleEntityModeChange("custom")}
                                ?disabled=${this.disabled}
                        />
                        <div class="radio-option-content">
                            <span class="radio-label">Custom entity</span>
                            ${"custom"===this._entityMode?r`
                                <div class="entity-picker-wrapper">
                                    <ha-selector
                                            .hass=${this.hass}
                                            .selector=${{entity:{multiple:!1}}}
                                            .value=${this._customEntityId}
                                            ?disabled=${this.disabled}
                                            @value-changed=${this._handleCustomEntityChange}
                                            allow-custom-entity
                                    ></ha-selector>
                                </div>
                            `:n}
                        </div>
                    </label>
                    <label class="radio-option">
                        <input
                                type="radio"
                                name="entity-source"
                                .checked=${"slot"===this._entityMode}
                                @change=${()=>this._handleEntityModeChange("slot")}
                                ?disabled=${this.disabled}
                        />
                        <div class="radio-option-content">
                            <span class="radio-label">Slot entity</span>
                            ${"slot"===this._entityMode?r`
                                <div class="entity-picker-wrapper">
                                    <select
                                            .value=${this._slotId}
                                            ?disabled=${this.disabled}
                                            @change=${this._handleSlotSelectionChange}
                                    >
                                        <option value="" disabled ?selected=${!this._slotId}>Select slot</option>
                                        ${this.slots.map(e=>r`
                                            <option value=${e.id} ?selected=${this._slotId===e.id}>
                                                ${e.name?`${e.name} (${e.id})`:e.id}
                                            </option>
                                        `)}
                                    </select>
                                    ${e?r`
                                                <div class="radio-sublabel">${e}</div>`:r`
                                                <div class="radio-sublabel">(no entity set for slot)</div>`}
                                </div>
                            `:n}
                        </div>
                    </label>
                </div>
            </div>
        `}_renderValueSourceSection(){const e=!!this._effectiveEntityId;return r`
            <div class="section">
                <div class="section-title">Value Source</div>
                <div class="radio-group">
                    <label class="radio-option">
                        <input
                                type="radio"
                                name="value-source"
                                .checked=${"state"===this._valueSource}
                                @change=${()=>this._handleValueSourceChange("state")}
                                ?disabled=${this.disabled||!e}
                        />
                        <span class="radio-label">State</span>
                    </label>
                    <label class="radio-option">
                        <input
                                type="radio"
                                name="value-source"
                                .checked=${"state"!==this._valueSource}
                                @change=${()=>this._handleValueSourceChange(this._availableAttributes[0]||"brightness")}
                                ?disabled=${this.disabled||!e}
                        />
                        <div class="radio-option-content">
                            <span class="radio-label">Attribute</span>
                            ${"state"!==this._valueSource?r`
                                <select
                                        class="attribute-select"
                                        .value=${this._valueSource}
                                        @change=${this._handleAttributeChange}
                                        ?disabled=${this.disabled}
                                >
                                    ${this._availableAttributes.length>0?this._availableAttributes.map(e=>r`
                                                <option value=${e} ?selected=${this._valueSource===e}>${e}
                                                </option>
                                            `):r`
                                                <option value=${this._valueSource}>${this._valueSource}</option>
                                            `}
                                </select>
                            `:n}
                        </div>
                    </label>
                </div>
            </div>
        `}_renderModeButton(e,t){return r`
            <button
                    class="mode-btn ${this._mode===e?"active":""}"
                    @click=${()=>this._handleModeChange(e)}
                    ?disabled=${this.disabled}
            >
                ${t}
            </button>
        `}_renderModeConfig(){switch(this._mode){case"direct":return this._renderDirectConfig();case"map":return this._renderMapConfig();case"threshold":return this._renderThresholdConfig();case"template":return this._renderTemplateConfig();default:return n}}_renderDirectConfig(){return r`
            <div class="section">
                <div class="section-title">Range Mapping</div>
                <div class="checkbox-row">
                    <input
                            type="checkbox"
                            id="range-toggle"
                            .checked=${this._useRangeMapping}
                            @change=${this._toggleRangeMapping}
                            ?disabled=${this.disabled}
                    />
                    <label for="range-toggle">Enable range mapping</label>
                </div>
                ${this._useRangeMapping?r`
                    <div class="range-inputs" style="margin-top: 8px;">
                        <div class="range-group">
                            <label>Input Range</label>
                            <div class="row">
                                <input
                                        type="number"
                                        .value=${String(this._inputRange[0])}
                                        @input=${e=>this._updateRange("input",0,Number(e.target.value))}
                                        ?disabled=${this.disabled}
                                />
                                <span>to</span>
                                <input
                                        type="number"
                                        .value=${String(this._inputRange[1])}
                                        @input=${e=>this._updateRange("input",1,Number(e.target.value))}
                                        ?disabled=${this.disabled}
                                />
                            </div>
                        </div>
                        <div class="range-group">
                            <label>Output Range</label>
                            <div class="row">
                                <input
                                        type="number"
                                        .value=${String(this._outputRange[0])}
                                        @input=${e=>this._updateRange("output",0,Number(e.target.value))}
                                        ?disabled=${this.disabled}
                                />
                                <span>to</span>
                                <input
                                        type="number"
                                        .value=${String(this._outputRange[1])}
                                        @input=${e=>this._updateRange("output",1,Number(e.target.value))}
                                        ?disabled=${this.disabled}
                                />
                            </div>
                        </div>
                    </div>
                `:n}
            </div>
        `}_renderMapConfig(){const e=this._stateOptions;return r`
            <div class="section">
                <div class="section-title">Value Mapping</div>
                <div class="entries-list">
                    ${this._mapEntries.map((t,i)=>r`
                        <div class="entry-row">
                            ${e&&e.length>0?r`
                                <select
                                        .value=${t.key}
                                        @change=${e=>this._updateMapEntryKey(i,e.target.value)}
                                        ?disabled=${this.disabled}
                                >
                                    <option value="" ?selected=${""===t.key} disabled>Select state</option>
                                    ${e.map(e=>r`
                                        <option value=${e} ?selected=${t.key===e}>${e}</option>
                                    `)}
                                </select>
                            `:r`
                                <input
                                        type="text"
                                        .value=${t.key}
                                        @input=${e=>this._updateMapEntryKey(i,e.target.value)}
                                        placeholder="State value"
                                        ?disabled=${this.disabled}
                                />
                            `}
                            <span>→</span>
                            ${this._renderValueInput(t.value,(e,t)=>this._updateMapEntryValue(i,e,t),"Output value")}
                            <button
                                    class="icon-btn danger"
                                    @click=${()=>this._removeMapEntry(i)}
                                    ?disabled=${this.disabled}
                            >×
                            </button>
                        </div>
                    `)}
                    <button class="add-btn" @click=${this._addMapEntry} ?disabled=${this.disabled}>
                        + Add Mapping
                    </button>
                </div>
            </div>
        `}_renderThresholdConfig(){return r`
            <div class="section">
                <div class="section-title">Thresholds</div>
                <div class="entries-list">
                    ${this._thresholds.map((e,t)=>r`
                        <div class="entry-row">
                            <input
                                    type="number"
                                    .value=${String(e.min??"")}
                                    @input=${e=>this._updateThreshold(t,"min",Number(e.target.value))}
                                    placeholder="Min"
                                    style="width: 60px; flex: none;"
                                    ?disabled=${this.disabled}
                            />
                            <span>-</span>
                            <input
                                    type="number"
                                    .value=${String(e.max??"")}
                                    @input=${e=>this._updateThreshold(t,"max",Number(e.target.value))}
                                    placeholder="Max"
                                    style="width: 60px; flex: none;"
                                    ?disabled=${this.disabled}
                            />
                            <span>→</span>
                            ${this._renderValueInput(e.value,(e,i)=>this._updateThresholdValue(t,e,i),"Output")}
                            <button
                                    class="icon-btn danger"
                                    @click=${()=>this._removeThreshold(t)}
                                    ?disabled=${this.disabled}
                            >×
                            </button>
                        </div>
                    `)}
                    <button class="add-btn" @click=${this._addThreshold} ?disabled=${this.disabled}>
                        + Add Threshold
                    </button>
                </div>
            </div>
        `}_renderTemplateConfig(){return r`
            <div class="section">
                <div class="section-title">Template</div>
                <textarea
                        .value=${this._template}
                        @input=${this._handleTemplateChange}
                        placeholder="{{value | round(2)}}px"
                        ?disabled=${this.disabled}
                ></textarea>
                <div style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">
                    Use {{value}}, {{state}}, {{attributes.name}} with filters like | round(2), | upper
                </div>
            </div>
        `}};ni.styles=t`
        .section {
            margin-bottom: 25px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary, #666);
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
        }

        .row {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 8px;
        }

        .row:last-child {
            margin-bottom: 0;
        }

        label {
            font-size: 11px;
            color: var(--text-primary, #333);
            min-width: 70px;
        }

        input, select, textarea {
            flex: 1;
            box-sizing: border-box;
            padding: 6px 8px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 11px;
            font-family: inherit;
            min-width: 0;
        }

        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--accent-color, #0078d4);
        }

        textarea {
            font-size: 13px;
            min-height: 60px;
            resize: vertical;
            width: 100%;
        }

        .mode-selector {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }

        .mode-btn {
            flex: 1;
            padding: 4px 10px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .mode-btn:hover {
            background: var(--bg-secondary, #f5f5f5);
        }

        .mode-btn.active {
            background: var(--accent-color, #0078d4);
            border-color: var(--accent-color, #0078d4);
            color: white;
            font-weight: bold;
        }

        .entries-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .entry-row {
            display: flex;
            gap: 6px;
            align-items: center;
        }

        .entry-row input {
            flex: 1;
        }

        .entry-row select {
            flex: 1;
        }

        .entry-row sm-number-input,
        .entry-row sm-slider-input,
        .entry-row sm-color-input,
        .entry-row sm-select-input,
        .entry-row sm-spacing-input,
        .default-input sm-number-input,
        .default-input sm-slider-input,
        .default-input sm-color-input,
        .default-input sm-select-input,
        .default-input sm-spacing-input {
            flex: 1;
        }

        .default-input {
            flex: 1;
        }

        .icon-btn {
            padding: 4px 8px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: var(--bg-primary, #fff);
            color: var(--text-secondary, #666);
            cursor: pointer;
            font-size: 14px;
            line-height: 1;
        }

        .icon-btn:hover {
            background: var(--bg-secondary, #f5f5f5);
        }

        .icon-btn.danger:hover {
            background: #fee;
            border-color: #f88;
            color: #c00;
        }

        .icon-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .add-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border: 1px dashed var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: transparent;
            color: var(--text-secondary, #666);
            font-size: 11px;
            cursor: pointer;
        }

        .add-btn:hover {
            border-color: var(--accent-color, #0078d4);
            color: var(--accent-color, #0078d4);
        }

        .checkbox-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .checkbox-row input[type="checkbox"] {
            width: auto;
            flex: none;
        }

        .range-inputs {
            gap: 8px;
            display: flex;
            flex-direction: column;
        }

        .range-group label {
            display: block;
            margin-bottom: 4px;
        }

        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .radio-option {
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }

        .radio-option input[type="radio"] {
            margin-top: 2px;
            flex: none;
        }

        .radio-option-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .radio-label {
            font-size: 14px;
            color: var(--text-primary, #333);
        }

        .radio-sublabel {
            font-size: 12px;
            color: var(--text-secondary, #666);
        }

        .entity-picker-wrapper {
            margin-top: 4px;
        }

        .attribute-select {
            margin-top: 4px;
        }
    `,ii([i({attribute:!1})],ni.prototype,"hass",2),ii([i({attribute:!1})],ni.prototype,"binding",2),ii([i({type:String})],ni.prototype,"defaultEntityId",2),ii([i({attribute:!1})],ni.prototype,"slots",2),ii([i({type:Boolean})],ni.prototype,"disabled",2),ii([i({attribute:!1})],ni.prototype,"valueInputConfig",2),ii([s()],ni.prototype,"_entityMode",2),ii([s()],ni.prototype,"_customEntityId",2),ii([s()],ni.prototype,"_slotId",2),ii([s()],ni.prototype,"_valueSource",2),ii([s()],ni.prototype,"_availableAttributes",2),ii([s()],ni.prototype,"_stateOptions",2),ii([s()],ni.prototype,"_thresholdSupported",2),ii([s()],ni.prototype,"_valueUnit",2),ii([s()],ni.prototype,"_mode",2),ii([s()],ni.prototype,"_mapEntries",2),ii([s()],ni.prototype,"_thresholds",2),ii([s()],ni.prototype,"_template",2),ii([s()],ni.prototype,"_defaultValue",2),ii([s()],ni.prototype,"_defaultHasValue",2),ii([s()],ni.prototype,"_inputRange",2),ii([s()],ni.prototype,"_outputRange",2),ii([s()],ni.prototype,"_useRangeMapping",2),ni=ii([a("property-binding-editor")],ni);var li=Object.defineProperty,di=Object.getOwnPropertyDescriptor,ci=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?di(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&li(t,i,a),a};let pi=class extends o{constructor(){super(...arguments),this.props={},this.bindingEditorOpen=!1,this.bindingEditorTarget=null,this.slots=[],this._handleSlotsChanged=()=>{var e;this.slots=(null==(e=this.documentModel)?void 0:e.getSlots())??[],this.requestUpdate()}}connectedCallback(){super.connectedCallback(),this.documentModel&&(this.slots=this.documentModel.getSlots(),this.documentModel.addEventListener("slots-changed",this._handleSlotsChanged))}disconnectedCallback(){var e;super.disconnectedCallback(),null==(e=this.documentModel)||e.removeEventListener("slots-changed",this._handleSlotsChanged)}render(){if(!this.config||!this.config.groups||0===this.config.groups.length)return r`
        <div class="empty-state">
          No editable properties available for this element
        </div>
      `;const e=this.config.groups.filter(e=>this._isGroupVisible(e));return 0===e.length?r`
        <div class="empty-state">
          No editable properties available for this element
        </div>
      `:r`
      <div
        class="traits-container"
        @property-binding-edit=${this._handleBindingEdit}
        @property-binding-change=${this._handleBindingChange}
      >
        ${e.map(e=>this._renderGroup(e))}
      </div>
      ${this._renderBindingEditorOverlay()}
    `}openBindingEditor(e){const t=this._findTraitByName(e);(null==t?void 0:t.binding)&&(this.bindingEditorTarget={name:e,label:t.label},this.bindingEditorOpen=!0)}updated(e){var t,i;e.has("block")&&(null==(t=e.get("block"))?void 0:t.id)!==(null==(i=this.block)?void 0:i.id)&&this._closeBindingEditor(!0)}_isGroupVisible(e){const t=this._getVisibilityContext();return Yt.evaluate(e.visible,t)}_isTraitVisible(e){const t=this._getVisibilityContext();return Yt.evaluate(e.visible,t)}_getVisibilityContext(){var e,t,i;return{props:this._getRawProps(),blockContext:{parentManaged:null==(e=this.block)?void 0:e.parentManaged,type:null==(t=this.block)?void 0:t.type,id:null==(i=this.block)?void 0:i.id}}}_renderGroup(e){const t=e.traits.filter(e=>this._isTraitVisible(e));return 0===t.length?n:r`
      <property-group
        .label=${e.label}
        .groupId=${e.id}
        ?collapsed=${e.collapsed??!1}
      >
        ${t.map(e=>this._renderTrait(e))}
      </property-group>
    `}_renderTrait(e){const t=this._getTraitPropertyValue(e.name),i={hass:this.hass,block:this.block,props:this.props,actionHandlers:this.actionHandlers,defaultEntityId:this.defaultEntityId};return Xt.render(e,t,this._handleTraitChange.bind(this),i)}_handleTraitChange(e,t){this.dispatchEvent(new CustomEvent("trait-changed",{detail:{name:e,value:t},bubbles:!0,composed:!0}))}_handleBindingEdit(e){if("props"!==e.detail.category)return;const t=this._findTraitByName(e.detail.property);(null==t?void 0:t.binding)&&(this.bindingEditorTarget={name:e.detail.property,label:e.detail.label},this.bindingEditorOpen=!0)}_handleBindingChange(e){"props"===e.detail.category&&this.dispatchEvent(new CustomEvent("trait-binding-changed",{detail:{name:e.detail.property,binding:e.detail.binding},bubbles:!0,composed:!0}))}_closeBindingEditor(e=!1){this.bindingEditorOpen=!1,e&&(this.bindingEditorTarget=null)}_getTraitPropertyValue(e){const t=this.props[e];if(!t||"object"!=typeof t)return;return"value"in t||"binding"in t?t:void 0}_getRawProps(){const e={};for(const[t,i]of Object.entries(this.props))e[t]=i&&"object"==typeof i&&"value"in i?i.value:i;return e}_findTraitByName(e){var t;const i=(null==(t=this.config)?void 0:t.groups)??[];for(const o of i){const t=o.traits.find(t=>t.name===e);if(t)return t}}_renderBindingEditorOverlay(){if(!this.bindingEditorTarget)return n;const e=this._findTraitByName(this.bindingEditorTarget.name);if(!(null==e?void 0:e.binding))return n;const t=this._getTraitPropertyValue(this.bindingEditorTarget.name),i=null==t?void 0:t.binding;return r`
      <property-binding-editor-overlay
        .open=${this.bindingEditorOpen}
        .hass=${this.hass}
        .label=${this.bindingEditorTarget.label}
        .category=${"props"}
        .propertyName=${this.bindingEditorTarget.name}
        .binding=${i}
        .defaultEntityId=${this.defaultEntityId}
        .slots=${this.slots}
        .valueInputConfig=${e.binding}
        @property-binding-change=${this._handleBindingChange}
        @overlay-close=${()=>this._closeBindingEditor()}
      ></property-binding-editor-overlay>
    `}};pi.styles=t`
    :host {
      display: block;
    }

    .traits-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .empty-state {
      padding: 16px;
      text-align: center;
      color: var(--secondary-text-color, #666);
      font-size: 12px;
      font-style: italic;
    }

    /* Property row styles - used by trait renderers */
    .property-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .property-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--secondary-text-color, #666);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .property-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      font-size: 13px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #333);
      box-sizing: border-box;
      transition: border-color 0.15s ease;
    }

    .property-input:focus {
      outline: none;
      border-color: var(--primary-color, #03a9f4);
    }

    .property-input[type="number"] {
      width: 100%;
    }

    .property-input[type="color"] {
      width: 100%;
      height: 36px;
      cursor: pointer;
      padding: 4px;
    }

    .property-input[type="checkbox"] {
      width: auto;
    }

    select.property-input {
      cursor: pointer;
    }

    textarea.property-input {
      min-height: 60px;
      resize: vertical;
      font-family: inherit;
    }

    /* Template support styles */
    .property-with-template {
      display: flex;
      gap: 4px;
      align-items: flex-start;
    }

    .property-with-template .property-input {
      flex: 1;
    }

    .template-toggle {
      padding: 6px 8px;
      background: var(--secondary-background-color, #f5f5f5);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .template-toggle:hover {
      background: var(--primary-color, #03a9f4);
      color: white;
    }

    .template-toggle.active {
      background: var(--accent-color, #ff9800);
      color: white;
      border-color: var(--accent-color, #ff9800);
    }

    .template-textarea {
      width: 100%;
      min-height: 60px;
      font-family: monospace;
      font-size: 12px;
      resize: vertical;
    }

    /* Entity mode toggle styles */
    .entity-mode-toggle {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      padding: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 4px;
      align-items: center;
    }

    .entity-mode-label {
      font-size: 11px;
      opacity: 0.7;
      margin-right: auto;
    }

    .toggle-switch {
      position: relative;
      width: 40px;
      height: 20px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.3s;
      border-radius: 20px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    .toggle-switch input:checked + .toggle-slider {
      background-color: var(--primary-color, #03a9f4);
    }

    .toggle-switch input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }

    .slot-info {
      font-size: 10px;
      opacity: 0.6;
      margin-top: 4px;
      font-style: italic;
    }

    /* Info display styles */
    .property-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }

    .info-text {
      font-size: 10px;
      opacity: 0.6;
      font-style: italic;
      font-family: var(--font-family, sans-serif), sans-serif;
    }

    /* Action button styles */
    .edit-grid-button {
      width: 100%;
      padding: 10px 16px;
      background: var(--accent-color, #2196f3);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .edit-grid-button:hover {
      background: var(--accent-dark, #1976d2);
    }

    .action-icon {
      font-size: 14px;
    }

    /* Attribute list styles */
    .attribute-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
      padding: 4px;
    }

    .attribute-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px 8px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 4px;
    }

    .attribute-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .attribute-checkbox {
      cursor: pointer;
    }

    .attribute-name {
      flex: 1;
      font-size: 12px;
      font-family: monospace;
    }

    .attribute-toggle {
      padding: 2px 6px;
      background: transparent;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .attribute-toggle:hover {
      background: var(--divider-color, #e0e0e0);
    }

    .attribute-toggle-icon {
      transition: transform 0.2s;
      display: inline-block;
    }

    .attribute-toggle-icon.expanded {
      transform: rotate(90deg);
    }

    .attribute-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      background: var(--card-background-color, #fff);
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
    }

    .attribute-option-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .attribute-label-input {
      flex: 1;
      padding: 4px 6px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      font-size: 11px;
    }

    .attribute-label-hint {
      font-size: 10px;
      opacity: 0.6;
      white-space: nowrap;
      min-width: 40px;
    }

    .attribute-remove-btn {
      padding: 4px 8px;
      background: var(--error-color, #f44336);
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 10px;
    }

    .attribute-remove-btn:hover {
      opacity: 0.8;
    }

    .attribute-add-section {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .attribute-add-input {
      flex: 1;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }

    .attribute-add-btn {
      padding: 6px 12px;
      background: var(--primary-color, #03a9f4);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: opacity 0.2s;
    }

    .attribute-add-btn:hover {
      opacity: 0.8;
    }

    .attribute-add-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,ci([c({context:x})],pi.prototype,"documentModel",2),ci([i({attribute:!1})],pi.prototype,"config",2),ci([i({attribute:!1})],pi.prototype,"props",2),ci([i({attribute:!1})],pi.prototype,"block",2),ci([i({attribute:!1})],pi.prototype,"hass",2),ci([i({attribute:!1})],pi.prototype,"actionHandlers",2),ci([i({type:String})],pi.prototype,"defaultEntityId",2),ci([s()],pi.prototype,"bindingEditorOpen",2),ci([s()],pi.prototype,"bindingEditorTarget",2),ci([s()],pi.prototype,"slots",2),pi=ci([a("traits-panel")],pi);var hi=Object.defineProperty,ui=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&hi(t,i,a),a};const gi=class extends Ae{constructor(){super(...arguments),this.selectedBlock=null,this.resolvedEntityInfo=null,this.gridEditorOpen=!1,this.pendingBlockId="",this.blockIdError=null,this.idDirty=!1}connectedCallback(){super.connectedCallback(),this.documentModel.addEventListener("selection-changed",e=>{var t;const i=e.detail;this.selectedBlock=i.selectedBlock||null,this.pendingBlockId=(null==(t=this.selectedBlock)?void 0:t.id)||"",this.blockIdError=null,this.idDirty=!1,this._updateResolvedEntityInfo()}),this.documentModel.addEventListener("block-updated",e=>{const t=e.detail;this.selectedBlock&&t.block.id===this.selectedBlock.id&&(this.selectedBlock={...t.block},this._updateResolvedEntityInfo(),this.idDirty||(this.pendingBlockId=t.block.id))})}render(){if(!this.selectedBlock)return r`
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L12,15H9V10H13V14L11,18H14V20H10V19Z"/>
                    </svg>
                    <div>Select an element to edit its properties</div>
                </div>
            `;const e=this.pendingBlockId.trim()!==this.selectedBlock.id&&""!==this.pendingBlockId.trim(),t=this.selectedBlock.id===this.documentModel.rootId;return r`
            <div class="info-row">
                <span class="info-label">Type</span>
                <span class="info-value">${this.selectedBlock.type}</span>
            </div>
            
            ${t?n:r`
            <div class="block-meta">
                <div class="property-row">
                    <span class="property-label">Block name</span>
                    <input
                        class="property-input"
                        type="text"
                        .value=${this.selectedBlock.label||""}
                        placeholder="Optional name"
                        @change=${this._onBlockLabelChanged}
                    />
                </div>
                <div class="property-row">
                    <span class="property-label">Block ID</span>
                    <div class="id-row">
                        <input
                            class="property-input"
                            type="text"
                            .value=${this.pendingBlockId}
                            @input=${this._onBlockIdInput}
                        />
                        <button
                            class="id-apply"
                            ?disabled=${!e}
                            @click=${this._applyBlockId}
                        >
                            Apply
                        </button>
                    </div>
                    ${this.blockIdError?r`<div class="id-error">${this.blockIdError}</div>`:n}
                </div>
            </div>`}
            
            <!-- Entity Configuration Section -->
            ${this._renderEntityConfigSection()}
            
            <div class="panel-content">
                ${this._renderProperties()}
            </div>
            ${this._renderOverlays()}
        `}openTraitBindingEditor(e){var t,i;const o=null==(t=this.shadowRoot)?void 0:t.querySelector("traits-panel");null==(i=null==o?void 0:o.openBindingEditor)||i.call(o,e)}_updateResolvedEntityInfo(){this.selectedBlock?this.resolvedEntityInfo=this.documentModel.resolveEntityForBlock(this.selectedBlock.id):this.resolvedEntityInfo=null}_onBlockLabelChanged(e){if(!this.selectedBlock)return;const t=e.target.value.trim();this.documentModel.updateBlock(this.selectedBlock.id,{label:t||void 0})}_onBlockIdInput(e){const t=e.target;this.pendingBlockId=t.value,this.blockIdError=null,this.idDirty=!!this.selectedBlock&&this.pendingBlockId.trim()!==this.selectedBlock.id}_applyBlockId(){if(!this.selectedBlock)return;const e=this.documentModel.updateBlockId(this.selectedBlock.id,this.pendingBlockId);e.success?(this.pendingBlockId=this.pendingBlockId.trim(),this.blockIdError=null,this.idDirty=!1):this.blockIdError=e.error||"Unable to update ID"}_renderEntityConfigSection(){if(!this.selectedBlock)return n;const e=this.selectedBlock.entityConfig||{mode:"inherited"};return r`
            <div class="entity-config-section">
                <span class="section-title">Entity Configuration</span>
                <entity-config-editor
                    .block=${this.selectedBlock}    
                    .config=${e}
                    .resolvedInfo=${this.resolvedEntityInfo}
                    .hass=${this.hass}
                    @config-changed=${this._onEntityConfigChanged}
                    @select-source-block=${this._onSelectSourceBlock}
                ></entity-config-editor>
            </div>
        `}_renderProperties(){var e,t;if(!this.selectedBlock)return r``;const i=this.documentModel.getElement(this.selectedBlock.id),o=null==(e=null==i?void 0:i.getPanelConfig)?void 0:e.call(i),a=null==o?void 0:o.properties;return a?r`
            <traits-panel
                .config=${a}
                .props=${this.selectedBlock.props||{}}
                .block=${this.selectedBlock}
                .hass=${this.hass}
                .defaultEntityId=${null==(t=this.resolvedEntityInfo)?void 0:t.entityId}
                .actionHandlers=${this._getActionHandlers()}
                @trait-changed=${this._onTraitChanged}
                @trait-binding-changed=${this._onTraitBindingChanged}
            ></traits-panel>
        `:r`
                <div class="placeholder-text">
                    No editable properties available for this element
                </div>
            `}_renderOverlays(){if(!this.selectedBlock)return r``;const{type:e,props:t}=this.selectedBlock,i=[];if("block-grid"===e){const e=(null==t?void 0:t.gridConfig)||null;i.push(r`
                <grid-editor-overlay
                    .open=${this.gridEditorOpen}
                    .config=${e}
                    @overlay-cancel=${this._closeGridEditor}
                    @overlay-apply=${this._applyGridConfig}
                ></grid-editor-overlay>
            `)}return i}_getActionHandlers(){return new Map([["open-grid-editor",()=>this._openGridEditor()]])}_onTraitChanged(e){const{name:t,value:i}=e.detail,o=this._getTraitPropertyValue(t),r={value:i,binding:null==o?void 0:o.binding};this._updateProp(t,r)}_onTraitBindingChanged(e){if(!this.selectedBlock)return;const t=this._getTraitPropertyValue(e.detail.name),i={value:null==t?void 0:t.value,binding:e.detail.binding??void 0};this._updateProp(e.detail.name,i)}_getTraitPropertyValue(e){var t,i;const o=null==(i=null==(t=this.selectedBlock)?void 0:t.props)?void 0:i[e];if(!o||"object"!=typeof o)return;return"value"in o||"binding"in o?o:void 0}_updateProp(e,t){this.selectedBlock&&this.documentModel.updateBlock(this.selectedBlock.id,{props:{[e]:t}})}_openGridEditor(){this.gridEditorOpen=!0}_closeGridEditor(){this.gridEditorOpen=!1}_applyGridConfig(e){const{config:t}=e.detail;this._updateProp("gridConfig",t),this.gridEditorOpen=!1}_onEntityConfigChanged(e){this.selectedBlock&&this.documentModel.updateBlock(this.selectedBlock.id,{entityConfig:e.detail})}_onSelectSourceBlock(e){const{blockId:t}=e.detail;this.documentModel.select(t)}};gi.styles=[...Ae.styles,t`
            /* Entity Config Section */
            .entity-config-section {
                padding: 12px;
                background: var(--bg-secondary, #f9f9f9);
                border-bottom: 1px solid var(--border-color, #e0e0e0);
            }

            .section-title {
                display: block;
                margin-bottom: 12px;
                font-size: 11px;
                font-weight: 600;
                color: var(--text-primary, #333);
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            /* Overlay trigger styles */
            .edit-grid-button {
                width: 100%;
                padding: 10px 16px;
                background: var(--accent-color, #2196f3);
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .edit-grid-button:hover {
                background: var(--accent-dark, #1976d2);
            }

            .edit-grid-button::before {
                content: '⊞';
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: opacity 0.2s;
            }

            .block-meta {
                padding: 12px;
                border-bottom: 1px solid var(--border-color, #e0e0e0);
                background: var(--bg-secondary, #f9f9f9);
            }

            .id-row {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .id-apply {
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 4px;
                background: var(--bg-primary, #fff);
                color: var(--text-primary, #333);
                cursor: pointer;
                transition: background 0.15s ease;
            }

            .id-apply:hover {
                background: var(--bg-tertiary, #f0f0f0);
            }

            .id-apply:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .id-error {
                margin-top: 4px;
                font-size: 10px;
                color: var(--error-color, #d32f2f);
            }
        `];let bi=gi;ui([c({context:x})],bi.prototype,"documentModel"),ui([i({attribute:!1})],bi.prototype,"hass"),ui([s()],bi.prototype,"selectedBlock"),ui([s()],bi.prototype,"resolvedEntityInfo"),ui([s()],bi.prototype,"gridEditorOpen"),ui([s()],bi.prototype,"pendingBlockId"),ui([s()],bi.prototype,"blockIdError"),ui([s()],bi.prototype,"idDirty"),Bt.define("panel-properties",bi);const vi=["layout","size","spacing","typography","background","border","effects","flex"],yi={layout:["layout.display","layout.overflow","layout.overflowX","layout.overflowY","layout.zIndex","layout.positionX","layout.positionY"],size:["size.width","size.height","size.minWidth","size.maxWidth","size.minHeight","size.maxHeight"],spacing:["spacing.margin","spacing.marginTop","spacing.marginRight","spacing.marginBottom","spacing.marginLeft","spacing.padding","spacing.paddingTop","spacing.paddingRight","spacing.paddingBottom","spacing.paddingLeft"],typography:["typography.fontFamily","typography.fontSize","typography.fontWeight","typography.fontStyle","typography.lineHeight","typography.letterSpacing","typography.textAlign","typography.textDecoration","typography.textTransform","typography.color"],background:["background.backgroundColor","background.backgroundImage","background.backgroundSize","background.backgroundPosition","background.backgroundRepeat","background.boxShadow","background.backgroundBlendMode"],border:["border.borderWidth","border.borderStyle","border.borderColor","border.borderRadius","border.borderTopWidth","border.borderRightWidth","border.borderBottomWidth","border.borderLeftWidth","border.borderTopLeftRadius","border.borderTopRightRadius","border.borderBottomRightRadius","border.borderBottomLeftRadius"],effects:["effects.opacity","effects.boxShadow","effects.filter","effects.backdropFilter","effects.mixBlendMode"],flex:["flex.flexDirection","flex.flexWrap","flex.justifyContent","flex.alignItems","flex.alignContent","flex.gap","flex.rowGap","flex.columnGap","flex.flexGrow","flex.flexShrink","flex.flexBasis","flex.alignSelf","flex.order"]},mi={full:{groups:vi}};class fi{resolve(e){return this.resolveConfig(e)}resolveConfig(e){if(!e)return this.createFullResolvedConfig();const t=this.createEmptyResolvedConfig();if(e.preset&&this.applyPreset(t,e.preset),e.groups)for(const i of e.groups)this.addGroup(t,i);if(e.properties)for(const i of e.properties){t.properties.add(i);const e=this.getGroupForProperty(i);e&&t.groups.add(e)}return e.exclude&&this.applyExclusions(t,e.exclude),t}createEmptyResolvedConfig(){return{groups:new Set,properties:new Set,excludedProperties:new Set}}createFullResolvedConfig(){const e=this.createEmptyResolvedConfig();for(const t of vi){e.groups.add(t);for(const i of yi[t])e.properties.add(i)}return e}applyPreset(e,t){const i=mi[t];if(i){if(i.groups)for(const t of i.groups)this.addGroup(e,t);if(i.properties)for(const t of i.properties){e.properties.add(t);const i=this.getGroupForProperty(t);i&&e.groups.add(i)}}else console.warn(`[PropertyConfigResolver] Unknown preset: ${t}`)}addGroup(e,t){e.groups.add(t);const i=yi[t];if(i)for(const o of i)e.properties.add(o)}applyExclusions(e,t){if(t.groups)for(const i of t.groups){e.groups.delete(i);const t=yi[i];if(t)for(const i of t)e.properties.delete(i)}if(t.properties)for(const i of t.properties)e.excludedProperties.add(i)}getGroupForProperty(e){for(const[t,i]of Object.entries(yi))if(i.includes(e))return t}}class xi extends EventTarget{constructor(e){super(),this._pendingUpdates=new Map,this._flushScheduled=!1,this._flushTimeoutId=null,this._presetUnsubscribe=null,this._stateSubscription=null,this._evaluateBindings=!1,this._selectedBlockId=null,this._activeDeviceId="desktop",this._activeSlotId=null,this._resolvedStyles={},this._visibleProperties=null,this._presets=[],this.documentModel=e.documentModel,this.presetService=e.presetService,this.styleResolver=e.styleResolver,this.hass=e.hass,this._activeDeviceId=e.initialDeviceId||"desktop",this._evaluateBindings=e.evaluateBindings??!1,this.propertyConfigResolver=new fi,this.hass&&this._evaluateBindings&&(this.bindingEvaluator=new w(this.hass,{resolveSlotEntity:e=>this.documentModel.resolveSlotEntity(e)}),this.styleResolver.setBindingEvaluator(this.bindingEvaluator),this.styleResolver.setEvaluateBindings(!0)),this._presetUnsubscribe=this.presetService.subscribe(e=>{this._presets=e,this._emitChange("presets"),this._selectedBlockId&&this._resolveStyles()}),this.hass&&this._evaluateBindings&&this._subscribeToStateChanges()}get selectedBlockId(){return this._selectedBlockId}get activeDeviceId(){return this._activeDeviceId}get activeSlotId(){return this._activeSlotId}get resolvedStyles(){return this._resolvedStyles}get visibleProperties(){return this._visibleProperties}get presets(){return this._presets}get selectedBlock(){return this._selectedBlockId&&this.documentModel.blocks[this._selectedBlockId]||null}get appliedPresetId(){var e,t,i,o;return this._activeSlotId?null==(i=null==(t=null==(e=this.selectedBlock)?void 0:e.styleSlots)?void 0:t[this._activeSlotId])?void 0:i.stylePresetId:null==(o=this.selectedBlock)?void 0:o.stylePresetId}get appliedPreset(){const e=this.appliedPresetId;if(e)return this._presets.find(t=>t.id===e)}setHass(e){this.hass=e,this.bindingEvaluator=new w(e,{resolveSlotEntity:e=>this.documentModel.resolveSlotEntity(e)}),this.styleResolver.setBindingEvaluator(this.bindingEvaluator),this._evaluateBindings&&!this._stateSubscription&&this._subscribeToStateChanges(),this._selectedBlockId&&(this._resolveStyles(),this._emitChange("styles"))}setEvaluateBindings(e){this._evaluateBindings!==e&&(this._evaluateBindings=e,this.styleResolver.setEvaluateBindings(e),e&&this.hass&&!this._stateSubscription?this._subscribeToStateChanges():!e&&this._stateSubscription&&(this._stateSubscription(),this._stateSubscription=null),this._selectedBlockId&&(this._resolveStyles(),this._emitChange("styles")))}setSelectedBlock(e){this._selectedBlockId!==e&&(this._selectedBlockId=e,this._activeSlotId=null,this._resolveVisibleProperties(),this._resolveStyles(),this._emitChange("selection"),this.documentModel.selectStyleSlot(null))}setActiveDevice(e){this._activeDeviceId!==e&&(this._activeDeviceId=e,this._resolveVisibleProperties(),this._resolveStyles(),this._emitChange("device"))}setActiveSlot(e){this._activeSlotId!==e&&(this._activeSlotId=e,this._resolveVisibleProperties(),this._resolveStyles(),this._emitChange("slot"),this.documentModel.selectStyleSlot(e))}updateProperty(e,t,i,o){var r,a;const s=this._activeSlotId,n=`${s??"block"}:${e}.${t}`,l=this.isPositionUnitLocked(e,t)?void 0:o??(null==(a=null==(r=this._resolvedStyles[e])?void 0:r[t])?void 0:a.unit),d={value:i};void 0!==l&&(d.unit=l),this._pendingUpdates.set(n,{category:e,property:t,value:d,slotId:s}),this._scheduleFlush()}updateProperties(e,t=null){const i=this.selectedBlock;if(i){if(t){const o={...i.styleSlots||{}},r={...o[t]||{}},a={...r.deviceStyles||{}},s={...a[this._activeDeviceId]||{}};for(const t of e.values()){s[t.category]||(s[t.category]={});const e={value:t.value};void 0===t.unit||this.isPositionUnitLocked(t.category,t.property)||(e.unit=t.unit),s[t.category][t.property]=e}a[this._activeDeviceId]=s,r.deviceStyles=a,o[t]=r,this.documentModel.updateBlock(i.id,{styleSlots:o})}else{const t={...i.deviceStyles||{}},o={...t[this._activeDeviceId]||{}};for(const i of e.values()){o[i.category]||(o[i.category]={});const e={value:i.value};void 0===i.unit||this.isPositionUnitLocked(i.category,i.property)||(e.unit=i.unit),o[i.category][i.property]=e}t[this._activeDeviceId]=o,this.documentModel.updateBlock(i.id,{deviceStyles:t})}this.styleResolver.invalidate({level:"block",blockId:i.id,deviceId:this._activeDeviceId}),this._resolveStyles(),this._emitChange("styles")}}updateBinding(e,t,i,o){var r;const a=this._activeSlotId,s=`${a??"block"}:${e}.${t}`,n=null==(r=this._resolvedStyles[e])?void 0:r[t],l=this.isPositionUnitLocked(e,t)?void 0:o??(null==n?void 0:n.unit);if(i){const o={binding:i};void 0!==l&&(o.unit=l),this._pendingUpdates.set(s,{category:e,property:t,value:o,slotId:a})}else{const i={value:null==n?void 0:n.value};void 0!==l&&(i.unit=l),this._pendingUpdates.set(s,{category:e,property:t,value:i,slotId:a})}this._scheduleFlush()}resetProperty(e,t){const i=this.selectedBlock;if(!i)return;const o=this._activeSlotId;if(o){const r={...i.styleSlots||{}},a={...r[o]||{}},s={...a.deviceStyles||{}},n={...s[this._activeDeviceId]||{}};if(n[e]){const i={...n[e]};delete i[t],0===Object.keys(i).length?delete n[e]:n[e]=i}0===Object.keys(n).length?delete s[this._activeDeviceId]:s[this._activeDeviceId]=n,0===Object.keys(s).length?delete r[o]:(a.deviceStyles=s,r[o]=a),this.documentModel.updateBlock(i.id,{styleSlots:r})}else{const o={...i.deviceStyles||{}},r={...o[this._activeDeviceId]||{}};if(r[e]){const i={...r[e]};delete i[t],0===Object.keys(i).length?delete r[e]:r[e]=i}0===Object.keys(r).length?delete o[this._activeDeviceId]:o[this._activeDeviceId]=r,this.documentModel.updateBlock(i.id,{deviceStyles:o})}this.styleResolver.invalidate({level:"block",blockId:i.id,deviceId:this._activeDeviceId}),this._resolveStyles(),this._emitChange("styles")}applyPreset(e){const t=this.selectedBlock;t&&(this._activeSlotId?this.documentModel.updateBlock(t.id,{styleSlots:{[this._activeSlotId]:{stylePresetId:e||void 0}}}):this.documentModel.updateBlock(t.id,{stylePresetId:e||void 0}),this.styleResolver.invalidate({level:"block",blockId:t.id}),this._resolveStyles(),this._emitChange("styles"))}async createPreset(e,t,i){const o=this._buildPresetData();return await this.presetService.createPreset({name:e,description:t,extendsPresetId:i,data:o})}async deletePreset(e){await this.presetService.deletePreset(e),this.appliedPresetId===e&&this.applyPreset(null)}flush(){null!==this._flushTimeoutId&&("cancelIdleCallback"in window?window.cancelIdleCallback(this._flushTimeoutId):cancelAnimationFrame(this._flushTimeoutId)),this._flush()}handleDocumentChange(e){this.styleResolver.invalidate({level:"block",blockId:e}),this._selectedBlockId&&(this._resolveVisibleProperties(),this._emitChange("properties")),e===this._selectedBlockId&&(this._resolveStyles(),this._emitChange("styles"))}dispose(){null!==this._flushTimeoutId&&("cancelIdleCallback"in window?window.cancelIdleCallback(this._flushTimeoutId):cancelAnimationFrame(this._flushTimeoutId)),this._presetUnsubscribe&&(this._presetUnsubscribe(),this._presetUnsubscribe=null),this._stateSubscription&&(this._stateSubscription(),this._stateSubscription=null),this.styleResolver.clearCache(),this._selectedBlockId=null,this._activeSlotId=null,this._resolvedStyles={},this._visibleProperties=null,this._pendingUpdates.clear()}async _subscribeToStateChanges(){var e;if(null==(e=this.hass)?void 0:e.connection)try{const e=await this.hass.connection.subscribeEvents(()=>this._handleEntityStateChange(),"state_changed");this._stateSubscription=e}catch(t){console.warn("[StylePanelState] Failed to subscribe to state changes:",t)}}_handleEntityStateChange(){this._selectedBlockId&&this._hasBindingsInResolvedStyles()&&(this._resolveStyles(),this._emitChange("styles"))}_hasBindingsInResolvedStyles(){for(const e of Object.values(this._resolvedStyles))if(e)for(const t of Object.values(e))if(null==t?void 0:t.binding)return!0;return!1}_getPanelConfig(e){var t;const i=this.documentModel.getElement(e);return(null==(t=null==i?void 0:i.getPanelConfig)?void 0:t.call(i))??null}_resolveVisibleProperties(){const e=this._selectedBlockId;if(!e)return void(this._visibleProperties=null);const t=this.documentModel.blocks[e];if(!t)return void(this._visibleProperties=null);const i=this._getPanelConfig(e),o=this._activeSlotId?S.getBlockSlotStyleConfig(t.type,this._activeSlotId):null==i?void 0:i.styles;this._visibleProperties=this.propertyConfigResolver.resolve(o)}isPositionUnitLocked(e,t){return"layout"===e&&("positionX"===t||"positionY"===t)}_scheduleFlush(){this._flushScheduled||(this._flushScheduled=!0,"requestIdleCallback"in window?this._flushTimeoutId=window.requestIdleCallback(()=>this._flush(),{timeout:16}):this._flushTimeoutId=requestAnimationFrame(()=>this._flush()))}_flush(){this._flushScheduled=!1,this._flushTimeoutId=null;const e=this.selectedBlock;if(!e||0===this._pendingUpdates.size)return;const t=new Map;for(const n of this._pendingUpdates.values()){const e=n.slotId??null;t.has(e)||t.set(e,[]),t.get(e).push(n)}const i={...e.deviceStyles||{}},o={...e.styleSlots||{}};let r=!1,a=!1;for(const[n,l]of t.entries())if(n){const e={...o[n]||{}},t={...e.deviceStyles||{}},i={...t[this._activeDeviceId]||{}};for(const o of l)i[o.category]||(i[o.category]={}),i[o.category][o.property]=o.value;t[this._activeDeviceId]=i,e.deviceStyles=t,o[n]=e,a=!0}else{const e={...i[this._activeDeviceId]||{}};for(const t of l)e[t.category]||(e[t.category]={}),e[t.category][t.property]=t.value;i[this._activeDeviceId]=e,r=!0}const s={};r&&(s.deviceStyles=i),a&&(s.styleSlots=o),Object.keys(s).length>0&&this.documentModel.updateBlock(e.id,s),this._pendingUpdates.clear(),this.styleResolver.invalidate({level:"block",blockId:e.id,deviceId:this._activeDeviceId}),this._resolveStyles(),this._emitChange("styles")}_resolveStyles(){if(!this._selectedBlockId)return void(this._resolvedStyles={});const e=this.documentModel.resolveEntityForBlock(this._selectedBlockId).entityId,t=e?{defaultEntityId:e}:void 0;this._resolvedStyles=this._activeSlotId?this.styleResolver.resolveSlot(this._selectedBlockId,this._activeSlotId,this._activeDeviceId,t):this.styleResolver.resolve(this._selectedBlockId,this._activeDeviceId,t)}_buildPresetData(){const e={};for(const[t,i]of Object.entries(this._resolvedStyles))if(i){e[t]={};for(const[o,r]of Object.entries(i))this.isPositionUnitLocked(t,o)?e[t][o]={value:r.value,binding:r.binding}:e[t][o]={value:r.value,binding:r.binding,unit:r.unit}}return{devices:{[this._activeDeviceId]:e}}}_emitChange(e){this.dispatchEvent(new CustomEvent("state-change",{detail:{type:e}}))}}var _i=Object.defineProperty,ki=Object.getOwnPropertyDescriptor,wi=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ki(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&_i(t,i,a),a};let $i=class extends o{constructor(){super(...arguments),this.open=!1,this.title="",this.subtitle="",this.escapeHandler=e=>{"Escape"===e.key&&this.handleClose()}}updated(e){super.updated(e),e.has("open")&&(this.open?this.addEscapeListener():this.removeEscapeListener())}disconnectedCallback(){super.disconnectedCallback(),this.removeEscapeListener()}render(){return r`
      <div class="editor-panel">
        <div class="editor-header">
          <div class="header-text">
            <span class="header-title">${this.title}</span>
            <span class="header-subtitle">${this.subtitle}</span>
          </div>
          <button class="close-button" @click=${this.handleClose}>Close</button>
        </div>
        <div class="editor-content">
          <slot></slot>
        </div>
      </div>
    `}addEscapeListener(){window.addEventListener("keydown",this.escapeHandler)}removeEscapeListener(){window.removeEventListener("keydown",this.escapeHandler)}handleClose(){this.dispatchEvent(new CustomEvent("overlay-close",{bubbles:!0,composed:!0}))}};$i.styles=t`
    :host {
      display: block;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--right-sidebar-width, 260px);
      z-index: 1100;
      pointer-events: none;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host([open]) {
      pointer-events: auto;
      transform: translateX(0);
    }

    .editor-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary, #fff);
      border-left: 1px solid var(--border-color, #d4d4d4);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
    }

    .editor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: var(--bg-secondary, #f5f5f5);
      border-bottom: 1px solid var(--border-color, #d4d4d4);
      gap: 12px;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .header-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .header-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #333);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .close-button {
      border: 1px solid var(--border-color, #d4d4d4);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 11px;
      cursor: pointer;
    }

    .close-button:hover {
      border-color: var(--accent-color, #0078d4);
      color: var(--accent-color, #0078d4);
    }

    .editor-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
  `,wi([i({type:Boolean,reflect:!0})],$i.prototype,"open",2),wi([i({type:String})],$i.prototype,"title",2),wi([i({type:String})],$i.prototype,"subtitle",2),$i=wi([a("property-editor-overlay")],$i);var Si=Object.defineProperty,Ci=Object.getOwnPropertyDescriptor,Ii=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ci(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Si(t,i,a),a};let Ei=class extends o{constructor(){super(...arguments),this.open=!1,this.label="",this.category="",this.propertyName="",this.slots=[]}render(){return r`
            <property-editor-overlay
                .open=${this.open}
                title="Binding"
                .subtitle=${this.label||this.propertyName}
                @overlay-close=${this._handleClose}
            >
                <property-binding-editor
                    .hass=${this.hass}
                    .binding=${this.binding}
                    .defaultEntityId=${this.defaultEntityId}
                    .slots=${this.slots}
                    .valueInputConfig=${this.valueInputConfig}
                    @binding-change=${this._handleBindingChange}
                ></property-binding-editor>
            </property-editor-overlay>
        `}_handleBindingChange(e){this.dispatchEvent(new CustomEvent("property-binding-change",{detail:{category:this.category,property:this.propertyName,binding:e.detail.binding,unit:e.detail.unit},bubbles:!0,composed:!0}))}_handleClose(){this.dispatchEvent(new CustomEvent("overlay-close",{bubbles:!0,composed:!0}))}};Ei.styles=t`
    :host {
      display: contents;
    }
  `,Ii([i({type:Boolean,reflect:!0})],Ei.prototype,"open",2),Ii([i({attribute:!1})],Ei.prototype,"hass",2),Ii([i({type:String})],Ei.prototype,"label",2),Ii([i({type:String})],Ei.prototype,"category",2),Ii([i({type:String})],Ei.prototype,"propertyName",2),Ii([i({attribute:!1})],Ei.prototype,"binding",2),Ii([i({type:String})],Ei.prototype,"defaultEntityId",2),Ii([i({attribute:!1})],Ei.prototype,"slots",2),Ii([i({attribute:!1})],Ei.prototype,"valueInputConfig",2),Ei=Ii([a("property-binding-editor-overlay")],Ei);var Bi=Object.defineProperty,Pi=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&Bi(t,i,a),a};const zi="__custom__",Di=[{label:"None",value:"none"},{label:"Image URL",value:"image"},{label:"Gradient",value:"gradient"},{label:"Custom",value:"custom"}],Mi=[{label:"Repeat",value:"repeat"},{label:"No Repeat",value:"no-repeat"},{label:"Repeat X",value:"repeat-x"},{label:"Repeat Y",value:"repeat-y"},{label:"Space",value:"space"},{label:"Round",value:"round"}],Ri=[{label:"Auto",value:"auto"},{label:"Cover",value:"cover"},{label:"Contain",value:"contain"},{label:"Custom",value:zi}],Vi=[{label:"Center",value:"center"},{label:"Top",value:"top"},{label:"Bottom",value:"bottom"},{label:"Left",value:"left"},{label:"Right",value:"right"},{label:"Top Left",value:"top left"},{label:"Top Center",value:"top center"},{label:"Top Right",value:"top right"},{label:"Center Left",value:"center left"},{label:"Center Right",value:"center right"},{label:"Bottom Left",value:"bottom left"},{label:"Bottom Center",value:"bottom center"},{label:"Bottom Right",value:"bottom right"},{label:"Custom",value:zi}],Li={"left top":"top left","right top":"top right","left bottom":"bottom left","right bottom":"bottom right","left center":"center left","right center":"center right","center top":"top center","center bottom":"bottom center"},Oi=[{label:"Color",value:"color"},{label:"Color Burn",value:"color-burn"},{label:"Color Dodge",value:"color-dodge"},{label:"Darken",value:"darken"},{label:"Difference",value:"difference"},{label:"Exclusion",value:"exclusion"},{label:"Hard Light",value:"hard-light"},{label:"Hue",value:"hue"},{label:"Lighten",value:"lighten"},{label:"Luminosity",value:"luminosity"},{label:"Multiply",value:"multiply"},{label:"Normal",value:"normal"},{label:"Overlay",value:"overlay"},{label:"Saturation",value:"saturation"},{label:"Screen",value:"screen"},{label:"Soft Light",value:"soft-light"}],Ti=["%","px","rem","em","vw","vh"],Ai=class extends o{constructor(){super(...arguments),this.selectedBlock=null,this.activeDeviceId="desktop",this.panelState=null,this.resolvedStyles={},this.visibleProperties=null,this.presets=[],this.activeSlotId=null,this.slots=[],this.saveDialogOpen=!1,this.managerDialogOpen=!1,this.bindingEditorOpen=!1,this.bindingEditorTarget=null,this.expandedSections=new Set,this.backgroundImageMode="none"}get defaultEntityId(){if(!this.selectedBlock)return;return this.documentModel.resolveEntityForBlock(this.selectedBlock.id).entityId}async connectedCallback(){super.connectedCallback(),this.activeDeviceId=this.deviceManager.getActiveDevice().id,await this._initializePanelState(),this.deviceManager.on("device-changed",e=>{this.activeDeviceId=e.deviceId,this.panelState&&this.panelState.setActiveDevice(e.deviceId),this.requestUpdate()}),this.documentModel.addEventListener("selection-changed",e=>{const t=e.detail;this.handleSelectionChange(t.selectedBlock)}),this.slots=this.documentModel.getSlots(),this.documentModel.addEventListener("slots-changed",()=>{this.slots=this.documentModel.getSlots(),this.requestUpdate()}),this.documentModel.addEventListener("change",e=>{var t;const i=e.detail;if(this.selectedBlock&&(null==(t=i.block)?void 0:t.id)===this.selectedBlock.id&&i.styleChanged){const e=this.documentModel.getBlock(this.selectedBlock.id);e&&(this.selectedBlock={...e},this.panelState&&this.panelState.handleDocumentChange(this.selectedBlock.id),this._ensureActiveSlotAvailable(),this.requestUpdate())}}),this.eventBus.addEventListener("moveable-change",e=>{const{position:t,positionConfig:i,size:o}=e,r=[{category:"layout",property:"positionX",value:t.x},{category:"layout",property:"positionY",value:t.y},{category:"_internal",property:"position_config",value:i}];o&&(r.push({category:"size",property:"width",value:o.width}),r.push({category:"size",property:"height",value:o.height})),this.panelState.updateProperties(r,null)})}openBindingEditor(e,t,i,o){void 0!==o&&this.panelState&&this.panelState.setActiveSlot(o??null),this.bindingEditorTarget={category:e,property:t,label:i??t},this.bindingEditorOpen=!0}render(){var e;return this.selectedBlock?r`
            <!-- Device Indicator -->
            <div class="device-indicator">
                Editing for: <span class="device-name">${this.activeDeviceId}</span>
            </div>

            <!-- Block Info -->
            <div class="block-info">
                <div class="block-info-row">
                    <span class="block-info-label">Type</span>
                    <span class="block-info-value">${this.selectedBlock.type}</span>
                </div>
                <div class="block-info-row">
                    <span class="block-info-label">ID</span>
                    <span class="block-info-value">${this.selectedBlock.id}</span>
                </div>
            </div>

            ${this._renderSlotSelector()}

            <!-- Preset Selector -->
            <div class="preset-section">
                <span class="preset-label">Style Preset</span>
                <preset-selector
                        .presets=${this.presets}
                        .selectedPresetId=${null==(e=this.panelState)?void 0:e.appliedPresetId}
                        @preset-selected=${this._handlePresetSelected}
                        @create-preset=${this._openSaveDialog}
                        @manage-presets=${this._openManagerDialog}
                ></preset-selector>
            </div>

            <div class="panel-content">
                ${this._renderLayoutSection()}
                ${this._renderFlexSection()}
                ${this._renderSizeSection()}
                ${this._renderSpacingSection()}
                ${this._renderTypographySection()}
                ${this._renderBackgroundSection()}
                ${this._renderBorderSection()}
                ${this._renderEffectsSection()}
            </div>

            <!-- Dialogs -->
            <preset-save-dialog
                    .open=${this.saveDialogOpen}
                    .currentStyles=${this.resolvedStyles}
                    .deviceId=${this.activeDeviceId}
                    .presets=${this.presets}
                    @save=${this._handleSavePreset}
                    @cancel=${this._closeSaveDialog}
            ></preset-save-dialog>

            <preset-manager-dialog
                    .open=${this.managerDialogOpen}
                    .presets=${this.presets}
                    @edit=${this._handleEditPreset}
                    @delete=${this._handleDeletePreset}
                    @close=${this._closeManagerDialog}
            ></preset-manager-dialog>

            ${this._renderBindingEditorOverlay()}
        `:r`
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
                    </svg>
                    <div>Select an element to edit its styles</div>
                </div>
            `}disconnectedCallback(){super.disconnectedCallback(),this.panelState&&(this.panelState.dispose(),this.panelState=null)}updated(e){super.updated(e),e.has("selectedBlock")?this._updateBackgroundImageMode(!0):e.has("resolvedStyles")&&this._updateBackgroundImageMode(!1)}async _initializePanelState(){try{const e=await C(this.hass);this.panelState=new xi({documentModel:this.documentModel,presetService:e,styleResolver:this.styleResolver,hass:this.hass,initialDeviceId:this.activeDeviceId,evaluateBindings:!1}),this.panelState.addEventListener("state-change",e=>{const t=e.detail;this._handleStateChange(t)}),this.resolvedStyles=this.panelState.resolvedStyles,this.visibleProperties=this.panelState.visibleProperties,this.presets=this.panelState.presets,this.activeSlotId=this.panelState.activeSlotId}catch(e){console.error("[PanelStyle] Failed to initialize panel state:",e)}}_handleStateChange(e){var t,i,o,r,a,s;switch(e.type){case"styles":this.resolvedStyles=(null==(t=this.panelState)?void 0:t.resolvedStyles)||{};break;case"presets":this.presets=(null==(i=this.panelState)?void 0:i.presets)||[];break;case"properties":this.visibleProperties=(null==(o=this.panelState)?void 0:o.visibleProperties)||null;break;case"selection":case"slot":case"device":this.resolvedStyles=(null==(r=this.panelState)?void 0:r.resolvedStyles)||{},this.visibleProperties=(null==(a=this.panelState)?void 0:a.visibleProperties)||null,this.activeSlotId=(null==(s=this.panelState)?void 0:s.activeSlotId)||null}this.requestUpdate()}handleSelectionChange(e){if(!e)return this.selectedBlock=null,this._closeBindingEditor(!0),void(this.panelState&&this.panelState.setSelectedBlock(null));this._closeBindingEditor(!0),this.selectedBlock={...e||{}},this.panelState&&this.panelState.setSelectedBlock(e.id)}toggleSection(e){this.expandedSections.has(e)?this.expandedSections.delete(e):this.expandedSections.add(e),this.requestUpdate()}switchLayoutMode(e){this.selectedBlock&&this.selectedBlock.layout!==e&&this.documentModel.updateBlock(this.selectedBlock.id,{layout:e})}getContainerDimensions(){let e=this.canvasWidth,t=this.canvasHeight;if(this.selectedBlock&&"root"!==this.selectedBlock.parentId){const i=this.documentModel.getElement(this.selectedBlock.parentId).getBoundingClientRect();e=i.width,t=i.height}return{width:e,height:t}}getLayoutData(){return this.selectedBlock?I(this.resolvedStyles):null}getRuntimeSize(e){if(e.size.width&&e.size.height)return e.size;const t=this.documentModel.getElement(this.selectedBlock.id);if(!t)return e.size;const i=t.getBoundingClientRect();return{width:i.width,height:i.height}}applyPositionUpdate(e,t){this.panelState&&this.panelState.updateProperties([{category:"layout",property:"positionX",value:e.x},{category:"layout",property:"positionY",value:e.y},{category:"_internal",property:"position_config",value:t}],null)}_handlePresetSelected(e){const{presetId:t}=e.detail;this.panelState&&this.panelState.applyPreset(t)}_openSaveDialog(){this.saveDialogOpen=!0}_closeSaveDialog(){this.saveDialogOpen=!1}async _handleSavePreset(e){const{input:t}=e.detail;if(this.panelState)try{await this.panelState.createPreset(t.name,t.description,t.extendsPresetId),this._closeSaveDialog()}catch(i){console.error("[PanelStyle] Failed to save preset:",i)}}_openManagerDialog(){this.managerDialogOpen=!0}_closeManagerDialog(){this.managerDialogOpen=!1}_handleEditPreset(e){e.detail.presetId}async _handleDeletePreset(e){const{presetId:t}=e.detail;if(this.panelState)try{await this.panelState.deletePreset(t)}catch(i){console.error("[PanelStyle] Failed to delete preset:",i)}}_handlePropertyChange(e,t,i,o){this.panelState&&this.panelState.updateProperty(e,t,i,o)}_handleBindingChange(e,t,i,o){this.panelState&&this.panelState.updateBinding(e,t,i,o)}_handleBindingEdit(e){const{category:t,property:i,label:o}=e.detail;this.bindingEditorTarget={category:t,property:i,label:o},this.bindingEditorOpen=!0}_closeBindingEditor(e=!1){this.bindingEditorOpen=!1,e&&(this.bindingEditorTarget=null)}_handlePropertyReset(e,t){this.panelState&&this.panelState.resetProperty(e,t)}updateLegacyProperty(e,t){if(!this.selectedBlock)return;const i=t.value,o="number"==typeof i?i:parseFloat(i);"layout"===e?this.documentModel.updateBlock(this.selectedBlock.id,{layout:i}):"zIndex"===e&&this.documentModel.updateBlock(this.selectedBlock.id,{zIndex:isNaN(o)?0:o})}_handleSlotChange(e){const t=e.detail.value,i="__block__"===t?null:t;this.panelState&&this.panelState.setActiveSlot(i)}_getAvailableSlotDefs(e){return e&&this.blockRegistry.getBlockStyleSlotsForBlock(e)||null}_ensureActiveSlotAvailable(){var e;if(!this.selectedBlock||!this.activeSlotId)return;const t=this._getAvailableSlotDefs(this.selectedBlock);t&&t[this.activeSlotId]||null==(e=this.panelState)||e.setActiveSlot(null)}_renderSlotSelector(){if(!this.selectedBlock)return n;const e=this._getAvailableSlotDefs(this.selectedBlock);if(!e||0===Object.keys(e).length)return n;const t=[{label:"Block",value:"__block__"},...Object.entries(e).map(([e,t])=>({label:t.label,value:e,description:t.description}))],i=this.activeSlotId&&e[this.activeSlotId]?this.activeSlotId:"__block__",o=this.activeSlotId&&e[this.activeSlotId]?e[this.activeSlotId]:null;return r`
            <div class="slot-section">
                <span class="slot-label">Style target</span>
                <style-target-selector
                        .value=${i}
                        .options=${t}
                        @change=${this._handleSlotChange}
                ></style-target-selector>
                ${(null==o?void 0:o.description)?r`
                    <div class="slot-description">${o.description}</div>
                `:n}
            </div>
        `}_renderLayoutSection(){if(!this.selectedBlock)return n;if(!this._isSectionVisible("layout"))return n;const e=this.expandedSections.has("layout"),t=this._renderLayoutMode(),i=this.resolvedStyles.layout||{};return r`
            ${t}
            <!-- Layout Properties Section -->
            <div class="section ${e?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("layout")}>
                    <span class="section-title">
                        <span>Layout</span>
                        ${this._sectionHasInlineOverrides("layout")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:n}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${"absolute"===this.selectedBlock.layout?this._renderAbsolutePositionInputs():n}
                    ${this._renderPropertyRow("layout","zIndex","Z-Index",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(i.zIndex,this.selectedBlock.zIndex||0)}
                                min="0"
                                step="1"
                                @change=${e=>{this._handlePropertyChange("layout","zIndex",e.detail.value),this.updateLegacyProperty("zIndex",e.detail)}}
                        ></sm-number-input>
                    `)}

                    ${this._renderPropertyRow("layout","display","Display",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.display)}
                                .options=${[{label:"Block",value:"block"},{label:"Flex",value:"flex"},{label:"Grid",value:"grid"},{label:"Inline",value:"inline"},{label:"Inline Block",value:"inline-block"},{label:"Inline Flex",value:"inline-flex"},{label:"None",value:"none"}]}
                                @change=${e=>this._handlePropertyChange("layout","display",e.detail.value)}
                        ></sm-select-input>
                    `)}
                </div>
            </div>
        `}_renderLayoutMode(){return this.documentModel.canChangeLayoutMode(this.selectedBlock.id)?r`
            <!-- Layout Mode Toggle (no binding) -->
            <div class="layout-mode-container">
                <div class="layout-mode-label">Layout Mode</div>
                <div class="layout-mode-toggle" data-mode="${this.selectedBlock.layout}">
                    <div class="layout-mode-slider"></div>
                    <div
                        class="layout-mode-option ${"flow"===this.selectedBlock.layout?"active":""}"
                        @click=${()=>this.switchLayoutMode("flow")}
                    >
                        <ha-icon icon="mdi:format-align-left"></ha-icon>
                        <span>Flow</span>
                    </div>
                    <div
                        class="layout-mode-option ${"absolute"===this.selectedBlock.layout?"active":""}"
                        @click=${()=>this.switchLayoutMode("absolute")}
                    >
                        <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
                        <span>Absolute</span>
                    </div>
                </div>
            </div>
        `:n}_renderAbsolutePositionInputs(){const e=this.getLayoutData();if(!e)return n;const t=e.positionConfig;return r`
            <!-- Position Mode (no binding) -->
            <sm-toggle-input
                    label="Position Mode"
                    labelOn="Responsive"
                    labelOff="Static"
                    .value=${"%"===t.unitSystem}
                    @change=${e=>this._handlePositionModeChange(e)}
            ></sm-toggle-input>

            <!-- Anchor Point (no binding) -->
            <sm-anchor-selector
                    label="Anchor Point"
                    .value=${t.anchor}
                    @change=${e=>this._handleAnchorChange(e)}
            ></sm-anchor-selector>

            ${this._renderPropertyRow("layout","positionX","X",r`
                <sm-number-input
                        .value=${this._getPositionDisplayValue("x",t)}
                        step="1"
                        unit="${t.unitSystem}"
                        .units=${[t.unitSystem]}
                        @change=${e=>{const t=e.detail.value;this._handlePropertyChange("layout","positionX",t),this._handlePositionChange("x",t)}}
                ></sm-number-input>
            `)}
            ${this._renderPropertyRow("layout","positionY","Y",r`
                <sm-number-input
                        .value=${this._getPositionDisplayValue("y",t)}
                        step="1"
                        unit="${t.unitSystem}"
                        .units=${[t.unitSystem]}
                        @change=${e=>{const t=e.detail.value;this._handlePropertyChange("layout","positionY",t),this._handlePositionChange("y",t)}}
                ></sm-number-input>
            `)}
        `}_handlePositionModeChange(e){const t=this.getLayoutData();if(!t)return;const i=e.detail.value?"%":"px",o=t.positionConfig,r=this.getContainerDimensions(),a=this.getRuntimeSize(t),s=new E({containerSize:r,elementSize:a,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem}),n={x:o.x||0,y:o.y||0,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem},l=s.convertUnits(n,i);this.applyPositionUpdate(t.position,{anchor:l.anchorPoint,x:l.x,y:l.y,unitSystem:l.unitSystem,originPoint:l.originPoint??l.anchorPoint})}_handleAnchorChange(e){const t=this.getLayoutData();if(!t)return;const i=e.detail.value,o=t.positionConfig;if(i===o.anchor)return;const r=this.getContainerDimensions(),a=this.getRuntimeSize(t),s=new E({containerSize:r,elementSize:a,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem}),n={x:o.x||0,y:o.y||0,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem},l=s.convertAnchor(n,i);this.applyPositionUpdate(t.position,{x:l.x,y:l.y,anchor:l.anchorPoint,originPoint:l.originPoint??l.anchorPoint,unitSystem:o.unitSystem})}_handlePositionChange(e,t){const i=this.getLayoutData();if(!i)return;const o={...i.positionConfig,[e]:t},r=this.getContainerDimensions(),a=this.getRuntimeSize(i),s=new E({containerSize:r,elementSize:a,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem}).toMoveableSpace({x:o.x,y:o.y,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem});this.applyPositionUpdate({x:s.x,y:s.y},o)}_renderFlexSection(){if(!this.selectedBlock)return n;if(!this._isSectionVisible("flex"))return n;const e=this.expandedSections.has("flex"),t=this.resolvedStyles.flex||{},i=this._getUnitConfig("flex","rowGap"),o=this._getUnitConfig("flex","columnGap");return r`
            <div class="section ${e?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("flex")}>
                    <span class="section-title">
                        <span>Flex Options</span>
                        ${this._sectionHasInlineOverrides("flex")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:n}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("flex","flexDirection","Flex Direction",r`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(t.flexDirection)}
                                .options=${[{value:"row",tooltip:"Row",svgContent:'<ha-icon icon="mdi:transfer-right"></ha-icon>'},{value:"row-reverse",tooltip:"Row Reverse",svgContent:'<ha-icon icon="mdi:transfer-left"></ha-icon>'},{value:"column",tooltip:"Column",svgContent:'<ha-icon icon="mdi:transfer-down"></ha-icon>'},{value:"column-reverse",tooltip:"Column Reverse",svgContent:'<ha-icon icon="mdi:transfer-up"></ha-icon>'}]}
                                @change=${e=>this._handlePropertyChange("flex","flexDirection",e.detail.value)}
                        ></sm-button-group-input>
                    `)}

                    ${this._renderPropertyRow("flex","justifyContent","Justify Content",r`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(t.justifyContent)}
                                .options=${[{value:"flex-start",tooltip:"Start",svgContent:'<ha-icon icon="mdi:format-horizontal-align-left"></ha-icon>'},{value:"center",tooltip:"Center",svgContent:'<ha-icon icon="mdi:format-horizontal-align-center"></ha-icon>'},{value:"flex-end",tooltip:"End",svgContent:'<ha-icon icon="mdi:format-horizontal-align-right"></ha-icon>'},{value:"space-between",tooltip:"Space Between",svgContent:'<ha-icon icon="mdi:align-horizontal-distribute"></ha-icon>'},{value:"space-around",tooltip:"Space Around",svgContent:'<div style="rotate: 90deg"><ha-icon icon="mdi:format-align-center"></ha-icon></div>'}]}
                                @change=${e=>this._handlePropertyChange("flex","justifyContent",e.detail.value)}
                        ></sm-button-group-input>
                    `)}

                    ${this._renderPropertyRow("flex","alignItems","Align Items",r`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(t.alignItems)}
                                .options=${[{value:"flex-start",tooltip:"Start",svgContent:'<ha-icon icon="mdi:align-vertical-top"></ha-icon>'},{value:"center",tooltip:"Center",svgContent:'<ha-icon icon="mdi:align-vertical-center"></ha-icon>'},{value:"flex-end",tooltip:"End",svgContent:'<ha-icon icon="mdi:align-vertical-bottom"></ha-icon>'},{value:"stretch",tooltip:"Stretch",svgContent:'<ha-icon icon="mdi:stretch-to-page-outline"></ha-icon>'}]}
                                @change=${e=>this._handlePropertyChange("flex","alignItems",e.detail.value)}
                        ></sm-button-group-input>
                    `)}

                    <div class="property-grid">
                        ${this._renderPropertyRow("flex","rowGap","Row Gap",r`
                            <sm-number-input
                                    .value=${this._getResolvedValue(t.rowGap)}
                                    min="0"
                                    step="1"
                                    unit="${(null==i?void 0:i.unit)??"px"}"
                                    .units=${(null==i?void 0:i.units)??["px"]}
                                    @change=${e=>this._handlePropertyChange("flex","rowGap",e.detail.value,e.detail.unit)}
                            ></sm-number-input>
                        `)}
                        ${this._renderPropertyRow("flex","columnGap","Column Gap",r`
                            <sm-number-input
                                    .value=${this._getResolvedValue(t.columnGap)}
                                    min="0"
                                    step="1"
                                    unit="${(null==o?void 0:o.unit)??"px"}"
                                    .units=${(null==o?void 0:o.units)??["px"]}
                                    @change=${e=>this._handlePropertyChange("flex","columnGap",e.detail.value,e.detail.unit)}
                            ></sm-number-input>
                        `)}
                    </div>
                </div>
            </div>
        `}_renderSizeSection(){if(!this.selectedBlock)return n;if(!this._isSectionVisible("size"))return n;const e=this.resolvedStyles.size||{},t=this.getLayoutData(),i=t?this.getRuntimeSize(t):{width:0,height:0},o=this.expandedSections.has("size"),a=this._getUnitConfig("size","width"),s=this._getUnitConfig("size","height"),l=this._getUnitConfig("size","minWidth"),d=this._getUnitConfig("size","maxWidth"),c=this._getUnitConfig("size","minHeight"),p=this._getUnitConfig("size","maxHeight");return r`
            <div class="section ${o?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("size")}>
                    <span class="section-title">
                        <span>Size</span>
                        ${this._sectionHasInlineOverrides("size")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:n}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">

                    ${this._renderPropertyRow("size","width","Width",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(e.width,i.width)}
                                min="1"
                                step="1"
                                unit="${(null==a?void 0:a.unit)??"px"}"
                                .units=${(null==a?void 0:a.units)??["px"]}
                                @change=${e=>{this._handlePropertyChange("size","width",e.detail.value,e.detail.unit)}}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","height","Height",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(e.height,i.height)}
                                min="1"
                                step="1"
                                unit="${(null==s?void 0:s.unit)??"px"}"
                                .units=${(null==s?void 0:s.units)??["px"]}
                                @change=${e=>{this._handlePropertyChange("size","height",e.detail.value,e.detail.unit)}}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","minWidth","Min Width",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(e.minWidth)}
                                min="0"
                                step="1"
                                unit="${(null==l?void 0:l.unit)??"px"}"
                                .units=${(null==l?void 0:l.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("size","minWidth",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","maxWidth","Max Width",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(e.maxWidth)}
                                min="0"
                                step="1"
                                unit="${(null==d?void 0:d.unit)??"px"}"
                                .units=${(null==d?void 0:d.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("size","maxWidth",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","minHeight","Min Height",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(e.minHeight)}
                                min="0"
                                step="1"
                                unit="${(null==c?void 0:c.unit)??"px"}"
                                .units=${(null==c?void 0:c.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("size","minHeight",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","maxHeight","Max Height",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(e.maxHeight)}
                                min="0"
                                step="1"
                                unit="${(null==p?void 0:p.unit)??"px"}"
                                .units=${(null==p?void 0:p.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("size","maxHeight",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                </div>
            </div>
        `}_renderSpacingSection(){if(!this._isSectionVisible("spacing"))return n;const e=this.resolvedStyles.spacing||{},t=this.expandedSections.has("spacing"),i=this._getUnitConfig("spacing","margin"),o=this._getUnitConfig("spacing","padding");return r`
            <div class="section ${t?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("spacing")}>
                    <span class="section-title">
                        <span>Spacing</span>
                        ${this._sectionHasInlineOverrides("spacing")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:n}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("spacing","margin","Margin",r`
                        <sm-spacing-input
                                .value=${this._getResolvedValue(e.margin,{top:0,right:0,bottom:0,left:0})}
                                unit="${(null==i?void 0:i.unit)??"px"}"
                                .units=${(null==i?void 0:i.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("spacing","margin",e.detail.value,e.detail.unit)}
                        ></sm-spacing-input>
                    `)}
                    ${this._renderPropertyRow("spacing","padding","Padding",r`
                        <sm-spacing-input
                                .value=${this._getResolvedValue(e.padding,{top:0,right:0,bottom:0,left:0})}
                                unit="${(null==o?void 0:o.unit)??"px"}"
                                .units=${(null==o?void 0:o.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("spacing","padding",e.detail.value,e.detail.unit)}
                        ></sm-spacing-input>
                    `)}
                </div>
            </div>
        `}_renderTypographySection(){if(!this._isSectionVisible("typography"))return n;const e=this.resolvedStyles.typography||{},t=this.expandedSections.has("typography"),i=this._getUnitConfig("typography","fontSize");return r`
            <div class="section ${t?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("typography")}>
                    <span class="section-title">
                        <span>Typography</span>
                        ${this._sectionHasInlineOverrides("typography")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:n}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("typography","fontFamily","Font Family",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(e.fontFamily)}
                                .options=${[{label:"Arial",value:"Arial, sans-serif"},{label:"Helvetica",value:"Helvetica, sans-serif"},{label:"Times New Roman",value:'"Times New Roman", serif'},{label:"Georgia",value:"Georgia, serif"},{label:"Courier New",value:'"Courier New", monospace'},{label:"Verdana",value:"Verdana, sans-serif"}]}
                                @change=${e=>this._handlePropertyChange("typography","fontFamily",e.detail.value)}
                        ></sm-select-input>
                    `)}
                    ${this._renderPropertyRow("typography","fontSize","Font Size",r`
                        <sm-slider-input
                                .value=${this._getResolvedValue(e.fontSize,16)}
                                min="8"
                                max="72"
                                step="1"
                                unit="${(null==i?void 0:i.unit)??"px"}"
                                .units=${(null==i?void 0:i.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("typography","fontSize",e.detail.value,e.detail.unit)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow("typography","fontWeight","Font Weight",r`
                        <sm-select-input
                                .value=${String(this._getResolvedValue(e.fontWeight))}
                                .options=${[{label:"Thin (100)",value:"100"},{label:"Light (300)",value:"300"},{label:"Normal (400)",value:"400"},{label:"Medium (500)",value:"500"},{label:"Semi-Bold (600)",value:"600"},{label:"Bold (700)",value:"700"},{label:"Extra-Bold (800)",value:"800"}]}
                                @change=${e=>this._handlePropertyChange("typography","fontWeight",e.detail.value)}
                        ></sm-select-input>
                    `)}
                    ${this._renderPropertyRow("typography","lineHeight","Line Height",r`
                        <sm-slider-input
                                .value=${this._getResolvedValue(e.lineHeight,1.5)}
                                min="0.5"
                                max="3"
                                step="0.1"
                                @change=${e=>this._handlePropertyChange("typography","lineHeight",e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow("typography","textAlign","Text Align",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(e.textAlign)}
                                .options=${[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"},{label:"Justify",value:"justify"}]}
                                @change=${e=>this._handlePropertyChange("typography","textAlign",e.detail.value)}
                        ></sm-select-input>
                    `)}
                    ${this._renderPropertyRow("typography","color","Text Color",r`
                        <sm-color-input
                                .value=${this._getResolvedValue(e.color,"")}
                                @change=${e=>this._handlePropertyChange("typography","color",e.detail.value)}
                        ></sm-color-input>
                    `)}
                </div>
            </div>
        `}_renderBackgroundSection(){if(!this._isSectionVisible("background"))return n;const e=this.resolvedStyles.background||{},t=this.expandedSections.has("background"),i=String(this._getResolvedValue(e.backgroundImage,"")),o=i?this._getBackgroundImageMode(i):this.backgroundImageMode,a=this._extractBackgroundImageUrl(i),s=String(this._getResolvedValue(e.backgroundSize,"auto")),l=this._getBackgroundSizePreset(s),d=this._parseLengthPair(s,{x:{value:100,unit:"%"},y:{value:100,unit:"%"}}),c=String(this._getResolvedValue(e.backgroundPosition,"center")),p=this._getBackgroundPositionPreset(c),h=this._parseLengthPair(c,{x:{value:50,unit:"%"},y:{value:50,unit:"%"}}),u=String(this._getResolvedValue(e.backgroundRepeat));return r`
            <div class="section ${t?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("background")}>
                    <span class="section-title">
                        <span>Background</span>
                        ${this._sectionHasInlineOverrides("background")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:n}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("background","backgroundColor","Background Color",r`
                        <sm-color-input
                                .value=${this._getResolvedValue(e.backgroundColor,"")}
                                @change=${e=>this._handlePropertyChange("background","backgroundColor",e.detail.value)}
                        ></sm-color-input>
                    `)}
                    ${this._renderPropertyRow("background","backgroundImage","Background Image",r`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${o}
                                    .options=${Di}
                                    @change=${e=>this._handleBackgroundImageModeChange(e.detail.value,i)}
                            ></sm-select-input>
                            ${"image"===o?r`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder="https://example.com/background.png"
                                        .value=${a}
                                        @input=${e=>this._handlePropertyChange("background","backgroundImage",e.target.value)}
                                />
                            `:n}
                            ${"gradient"===o?r`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder="linear-gradient(135deg, #111111, #999999)"
                                        .value=${i}
                                        @input=${e=>this._handlePropertyChange("background","backgroundImage",e.target.value)}
                                />
                            `:n}
                            ${"custom"===o?r`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder="url(...) or gradient"
                                        .value=${i}
                                        @input=${e=>this._handlePropertyChange("background","backgroundImage",e.target.value)}
                                />
                            `:n}
                        </div>
                    `)}
                    ${this._renderPropertyRow("background","backgroundSize","Background Size",r`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${l}
                                    .options=${Ri}
                                    @change=${e=>this._handleBackgroundSizePresetChange(e.detail.value,l)}
                            ></sm-select-input>
                            ${l===zi?r`
                                <div class="background-inline-grid">
                                    <div class="background-field">
                                        <span class="background-field-label">Width</span>
                                        <sm-number-input
                                                .value=${d.x.value}
                                                min="0"
                                                step="1"
                                                unit="${d.x.unit}"
                                                .units=${Ti}
                                                @change=${e=>this._handleBackgroundLengthPairChange("backgroundSize","x",e.detail.value,e.detail.unit,d)}
                                        ></sm-number-input>
                                    </div>
                                    <div class="background-field">
                                        <span class="background-field-label">Height</span>
                                        <sm-number-input
                                                .value=${d.y.value}
                                                min="0"
                                                step="1"
                                                unit="${d.y.unit}"
                                                .units=${Ti}
                                                @change=${e=>this._handleBackgroundLengthPairChange("backgroundSize","y",e.detail.value,e.detail.unit,d)}
                                        ></sm-number-input>
                                    </div>
                                </div>
                            `:n}
                        </div>
                    `)}
                    ${this._renderPropertyRow("background","backgroundPosition","Background Position",r`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${p}
                                    .options=${Vi}
                                    @change=${e=>this._handleBackgroundPositionPresetChange(e.detail.value,p)}
                            ></sm-select-input>
                            ${p===zi?r`
                                <div class="background-inline-grid">
                                    <div class="background-field">
                                        <span class="background-field-label">X</span>
                                        <sm-number-input
                                                .value=${h.x.value}
                                                step="1"
                                                unit="${h.x.unit}"
                                                .units=${Ti}
                                                @change=${e=>this._handleBackgroundLengthPairChange("backgroundPosition","x",e.detail.value,e.detail.unit,h)}
                                        ></sm-number-input>
                                    </div>
                                    <div class="background-field">
                                        <span class="background-field-label">Y</span>
                                        <sm-number-input
                                                .value=${h.y.value}
                                                step="1"
                                                unit="${h.y.unit}"
                                                .units=${Ti}
                                                @change=${e=>this._handleBackgroundLengthPairChange("backgroundPosition","y",e.detail.value,e.detail.unit,h)}
                                        ></sm-number-input>
                                    </div>
                                </div>
                            `:n}
                        </div>
                    `)}
                    ${this._renderPropertyRow("background","backgroundRepeat","Background Repeat",r`
                        <sm-select-input
                                .value=${u}
                                .options=${Mi}
                                @change=${e=>this._handlePropertyChange("background","backgroundRepeat",e.detail.value)}
                        ></sm-select-input>
                    `)}
                    ${this._renderPropertyRow("background","boxShadow","Box Shadow",r`
                        <input
                                class="text-input"
                                type="text"
                                placeholder="0 6px 18px rgba(0, 0, 0, 0.2)"
                                .value=${String(this._getResolvedValue(e.boxShadow,""))}
                                @input=${e=>this._handlePropertyChange("background","boxShadow",e.target.value)}
                        />
                    `)}
                    ${this._renderPropertyRow("background","backgroundBlendMode","Background Blend Mode",r`
                                <sm-select-input
                                        .value=${String(this._getResolvedValue(e.backgroundBlendMode))}
                                        .options=${Oi}
                                        @change=${e=>this._handlePropertyChange("background","backgroundBlendMode",e.detail.value)}
                                ></sm-select-input>
                            `)}
                </div>
            </div>
        `}_renderBorderSection(){if(!this._isSectionVisible("border"))return n;const e=this.resolvedStyles.border||{},t=this.expandedSections.has("border"),i=this._getUnitConfig("border","borderWidth"),o=this._getUnitConfig("border","borderRadius");return r`
            <div class="section ${t?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("border")}>
                    <span class="section-title">
                        <span>Border</span>
                        ${this._sectionHasInlineOverrides("border")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:n}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("border","borderWidth","Border Width",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(e.borderWidth)}
                                min="0"
                                step="1"
                                unit="${(null==i?void 0:i.unit)??"px"}"
                                .units=${(null==i?void 0:i.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("border","borderWidth",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("border","borderStyle","Border Style",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(e.borderStyle)}
                                .options=${[{label:"None",value:"none"},{label:"Solid",value:"solid"},{label:"Dashed",value:"dashed"},{label:"Dotted",value:"dotted"},{label:"Double",value:"double"}]}
                                @change=${e=>this._handlePropertyChange("border","borderStyle",e.detail.value)}
                        ></sm-select-input>
                    `)}
                    ${this._renderPropertyRow("border","borderColor","Border Color",r`
                        <sm-color-input
                                .value=${this._getResolvedValue(e.borderColor,"")}
                                @change=${e=>this._handlePropertyChange("border","borderColor",e.detail.value)}
                        ></sm-color-input>
                    `)}
                    ${this._renderPropertyRow("border","borderRadius","Border Radius",r`
                        <sm-number-input
                                .value=${this._getResolvedValue(e.borderRadius)}
                                min="0"
                                step="1"
                                unit="${(null==o?void 0:o.unit)??"px"}"
                                .units=${(null==o?void 0:o.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("border","borderRadius",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                </div>
            </div>
        `}_renderEffectsSection(){if(!this._isSectionVisible("effects"))return n;const e=this.resolvedStyles.effects||{},t=this.expandedSections.has("effects");return r`
            <div class="section ${t?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("effects")}>
                    <span class="section-title">
                        <span>Effects</span>
                        ${this._sectionHasInlineOverrides("effects")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:n}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("effects","opacity","Opacity",r`
                        <sm-slider-input
                                .value=${this._getResolvedValue(e.opacity,1)}
                                min="0"
                                max="1"
                                step="0.01"
                                @change=${e=>this._handlePropertyChange("effects","opacity",e.detail.value)}
                        ></sm-slider-input>
                    `)}
                </div>
            </div>
        `}_renderPropertyRow(e,t,i,o,a={}){var s;if(!this._isPropertyVisible(e,t))return n;const l=null==(s=this.resolvedStyles[e])?void 0:s[t],{showBindingToggle:d=!0}=a;return r`
            <property-row
                    .hass=${this.hass}
                    .label=${i}
                    .property=${t}
                    .category=${e}
                    .origin=${(null==l?void 0:l.origin)||"default"}
                    .presetName=${(null==l?void 0:l.presetId)?this._getPresetName(l.presetId):void 0}
                    .originDevice=${null==l?void 0:l.originDevice}
                    .hasLocalOverride=${(null==l?void 0:l.hasLocalOverride)||!1}
                    .binding=${null==l?void 0:l.binding}
                    .resolvedValue=${null==l?void 0:l.value}
                    .resolvedUnit=${null==l?void 0:l.unit}
                    .defaultEntityId=${this.defaultEntityId}
                    .showBindingToggle=${d}
                    @property-binding-change=${e=>this._handleBindingChange(e.detail.category,e.detail.property,e.detail.binding,e.detail.unit)}
                    @property-binding-edit=${this._handleBindingEdit}
                    @property-reset=${e=>this._handlePropertyReset(e.detail.category,e.detail.property)}
            >
                ${o}
            </property-row>
        `}_renderBindingEditorOverlay(){var e,t;if(!this.bindingEditorTarget)return n;const{category:i,property:o,label:a}=this.bindingEditorTarget,s=null==(t=null==(e=this.resolvedStyles[i])?void 0:e[o])?void 0:t.binding,l=this._getBindingValueInputConfig(i,o);return r`
            <property-binding-editor-overlay
                .open=${this.bindingEditorOpen}
                .hass=${this.hass}
                .label=${a}
                .category=${i}
                .propertyName=${o}
                .binding=${s}
                .defaultEntityId=${this.defaultEntityId}
                .slots=${this.slots}
                .valueInputConfig=${l}
                @property-binding-change=${e=>this._handleBindingChange(e.detail.category,e.detail.property,e.detail.binding,e.detail.unit)}
                @overlay-close=${()=>this._closeBindingEditor()}
            ></property-binding-editor-overlay>
        `}_getBindingValueInputConfig(e,t){const i=`${e}.${t}`,o=this._getUnitConfig(e,t);switch(i){case"layout.display":return{type:"select",options:[{label:"Block",value:"block"},{label:"Flex",value:"flex"},{label:"Grid",value:"grid"},{label:"Inline",value:"inline"},{label:"Inline Block",value:"inline-block"},{label:"Inline Flex",value:"inline-flex"},{label:"None",value:"none"}]};case"layout.positionX":case"layout.positionY":{const e=this.getLayoutData(),t=(null==e?void 0:e.positionConfig.unitSystem)??"px";return{type:"number",step:1,unit:t,units:[t]}}case"layout.zIndex":return{type:"number",min:0,step:1};case"size.width":case"size.height":return{type:"number",min:1,step:1,unit:null==o?void 0:o.unit,units:null==o?void 0:o.units};case"size.minWidth":case"size.maxWidth":case"size.minHeight":case"size.maxHeight":case"border.borderWidth":case"border.borderRadius":case"flex.rowGap":case"flex.columnGap":return{type:"number",min:0,step:1,unit:null==o?void 0:o.unit,units:null==o?void 0:o.units};case"spacing.margin":case"spacing.padding":return{type:"spacing",unit:null==o?void 0:o.unit,units:null==o?void 0:o.units};case"typography.fontFamily":return{type:"select",options:[{label:"Arial",value:"Arial, sans-serif"},{label:"Helvetica",value:"Helvetica, sans-serif"},{label:"Times New Roman",value:'"Times New Roman", serif'},{label:"Georgia",value:"Georgia, serif"},{label:"Courier New",value:'"Courier New", monospace'},{label:"Verdana",value:"Verdana, sans-serif"}]};case"typography.fontSize":return{type:"slider",min:8,max:72,step:1,unit:null==o?void 0:o.unit,units:null==o?void 0:o.units};case"typography.fontWeight":return{type:"select",options:[{label:"Thin (100)",value:"100"},{label:"Light (300)",value:"300"},{label:"Normal (400)",value:"400"},{label:"Medium (500)",value:"500"},{label:"Semi-Bold (600)",value:"600"},{label:"Bold (700)",value:"700"},{label:"Extra-Bold (800)",value:"800"}]};case"typography.lineHeight":return{type:"slider",min:.5,max:3,step:.1};case"typography.textAlign":return{type:"select",options:[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"},{label:"Justify",value:"justify"}]};case"typography.color":case"background.backgroundColor":case"border.borderColor":return{type:"color"};case"background.backgroundImage":return{type:"text",placeholder:"https://... or linear-gradient(...)"};case"background.backgroundSize":return{type:"text",placeholder:"cover | contain | 100% 100%"};case"background.backgroundPosition":return{type:"text",placeholder:"center | 50% 50%"};case"background.backgroundRepeat":return{type:"select",options:Mi};case"border.borderStyle":return{type:"select",options:[{label:"None",value:"none"},{label:"Solid",value:"solid"},{label:"Dashed",value:"dashed"},{label:"Dotted",value:"dotted"},{label:"Double",value:"double"}]};case"effects.opacity":return{type:"slider",min:0,max:1,step:.01};case"flex.flexDirection":return{type:"select",options:[{label:"Row",value:"row"},{label:"Row Reverse",value:"row-reverse"},{label:"Column",value:"column"},{label:"Column Reverse",value:"column-reverse"}]};case"flex.justifyContent":return{type:"select",options:[{label:"Start",value:"flex-start"},{label:"Center",value:"center"},{label:"End",value:"flex-end"},{label:"Space Between",value:"space-between"},{label:"Space Around",value:"space-around"}]};case"flex.alignItems":return{type:"select",options:[{label:"Start",value:"flex-start"},{label:"Center",value:"center"},{label:"End",value:"flex-end"},{label:"Stretch",value:"stretch"}]};default:return}}_getResolvedValue(e,t=void 0){return e&&void 0!==e.value?e.value:t}_updateBackgroundImageMode(e){var t,i;if(e&&!this.selectedBlock)return void(this.backgroundImageMode="none");const o=null==(i=null==(t=this.resolvedStyles.background)?void 0:t.backgroundImage)?void 0:i.value,r="string"==typeof o?o.trim():"";if(!r)return void(e&&(this.backgroundImageMode="none"));const a=this._getBackgroundImageMode(r);a!==this.backgroundImageMode&&(this.backgroundImageMode=a)}_getBackgroundImageMode(e){const t=e.trim();if(!t||"none"===t)return"none";const i=t.toLowerCase();return i.includes("gradient(")?"gradient":i.startsWith("url(")||this._looksLikeUrl(t)?"image":"custom"}_looksLikeUrl(e){return!!/^(https?:\/\/|data:|\/)/i.test(e)||/^[^()\s]+\.[a-z0-9]{2,}$/i.test(e)}_extractBackgroundImageUrl(e){const t=e.trim();if(!t)return"";const i=t.match(/^url\((.*)\)$/i);if(!i)return t;let o=i[1].trim();return(o.startsWith('"')&&o.endsWith('"')||o.startsWith("'")&&o.endsWith("'"))&&(o=o.slice(1,-1)),o}_getBackgroundSizePreset(e){const t=e.trim().toLowerCase();return"auto"===t||"auto auto"===t?"auto":"cover"===t||"contain"===t?t:zi}_getBackgroundPositionPreset(e){const t=e.trim().toLowerCase();if("center center"===t)return"center";const i=Li[t];if(i)return i;const o=Vi.find(e=>e.value!==zi&&e.value===t);return o?o.value:zi}_parseLengthToken(e,t){if(!e)return t;const i=e.trim().match(/^(-?\d+(?:\.\d+)?)([a-z%]*)$/i);if(!i)return t;const o=Number(i[1]);if(!Number.isFinite(o))return t;const r=i[2]||t.unit;return Ti.includes(r)?{value:o,unit:r}:{value:o,unit:t.unit}}_parseLengthPair(e,t){const i=e.trim().split(/\s+/).filter(Boolean),o=i[0],r=i[1]??i[0];return{x:this._parseLengthToken(o,t.x),y:this._parseLengthToken(r,t.y)}}_formatLengthPair(e){return`${e.x.value}${e.x.unit} ${e.y.value}${e.y.unit}`}_handleBackgroundLengthPairChange(e,t,i,o,r){const a={x:"x"===t?{value:i,unit:o??r.x.unit}:r.x,y:"y"===t?{value:i,unit:o??r.y.unit}:r.y};this._handlePropertyChange("background",e,this._formatLengthPair(a))}_handleBackgroundImageModeChange(e,t){if(this.backgroundImageMode=e,"none"===e)return void this._handlePropertyChange("background","backgroundImage","none");const i=this._getBackgroundImageMode(t);"gradient"!==e?"image"!==e?"custom"===e&&"custom"!==i&&this._handlePropertyChange("background","backgroundImage",""):"image"!==i&&this._handlePropertyChange("background","backgroundImage",""):"gradient"!==i&&this._handlePropertyChange("background","backgroundImage","linear-gradient(180deg, #000000, #ffffff)")}_handleBackgroundSizePresetChange(e,t){if(e!==zi)this._handlePropertyChange("background","backgroundSize",e);else if(t!==zi){const e={x:{value:100,unit:"%"},y:{value:100,unit:"%"}};this._handlePropertyChange("background","backgroundSize",this._formatLengthPair(e))}}_handleBackgroundPositionPresetChange(e,t){if(e!==zi)this._handlePropertyChange("background","backgroundPosition",e);else if(t!==zi){const e={x:{value:50,unit:"%"},y:{value:50,unit:"%"}};this._handlePropertyChange("background","backgroundPosition",this._formatLengthPair(e))}}_getUnitConfig(e,t){var i,o;const r=B(e,t);if(!r||0===r.length)return null;const a=null==(o=null==(i=this.resolvedStyles[e])?void 0:i[t])?void 0:o.unit,s=P(e,t)??r[0];return{unit:a&&r.includes(a)?a:s,units:r}}_getPositionDisplayValue(e,t){var i,o;if(Boolean(null==(o=null==(i=this.resolvedStyles._internal)?void 0:i.position_config)?void 0:o.value))return"x"===e?t.x:t.y;const r=this.resolvedStyles.layout||{},a="x"===e?t.x:t.y;return this._getResolvedValue("x"===e?r.positionX:r.positionY,a)}_getPresetName(e){const t=this.presets.find(t=>t.id===e);return null==t?void 0:t.name}_sectionHasInlineOverrides(e){return this._getSectionGroups(e).some(e=>(yi[e]||[]).some(e=>{var t,i;if(!this._isPropertyKeyVisible(e))return!1;const o=e.indexOf(".");if(-1===o)return!1;const r=e.slice(0,o),a=e.slice(o+1);return Boolean(null==(i=null==(t=this.resolvedStyles[r])?void 0:t[a])?void 0:i.hasLocalOverride)}))}_getSectionGroups(e){return"layout"===e?["layout","flex"]:[e]}_isSectionVisible(e){if(!this.visibleProperties)return!0;const t=e;if(!this.visibleProperties.groups.has(t))return!1;return(yi[t]||[]).some(e=>this._isPropertyKeyVisible(e))}_isPropertyVisible(e,t){const i=`${e}.${t}`;return this._isPropertyKeyVisible(i)}_isPropertyKeyVisible(e){return!this.visibleProperties||this.visibleProperties.properties.has(e)&&!this.visibleProperties.excludedProperties.has(e)}};Ai.styles=[t`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            font-size: 12px;
        }

        .panel-header {
            padding: 10px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-size: 11px;
            font-weight: 600;
            color: var(--text-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .panel-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 40px 20px;
            text-align: center;
            color: var(--text-secondary);
            font-size: 13px;
        }

        .empty-state-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
            opacity: 0.3;
        }

        /* Preset Section */

        .preset-section {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
        }

        .preset-label {
            display: block;
            margin-bottom: 8px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .slot-section {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
        }

        .slot-label {
            display: block;
            margin-bottom: 8px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .slot-description {
            margin-top: 8px;
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.4;
        }

        /* Sections */

        .section {
            border-bottom: 1px solid var(--border-color);
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            cursor: pointer;
            user-select: none;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            background: var(--bg-secondary);
            transition: background 0.15s ease;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }

        .section-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--accent-color);
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.15);
            flex-shrink: 0;
        }

        .section-header:hover {
            background: var(--bg-tertiary);
        }

        .section-icon {
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 5px solid var(--text-secondary);
            transition: transform 0.2s ease;
        }

        .section.expanded .section-icon {
            transform: rotate(180deg);
        }

        .section-content {
            display: none;
            padding: 12px;
            background: var(--bg-primary);
            gap: 10px;
        }

        .section.expanded .section-content {
            display: flex;
            flex-direction: column;
        }

        .property-grid {
            display: grid;
            grid-template-columns: 50% 50%;
            gap: 8px;
        }

        .background-input {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .background-inline-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
        }

        .background-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .background-field-label {
            font-size: 9px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .text-input {
            width: 100%;
            box-sizing: border-box;
            padding: 6px 8px;
            border: 1px solid var(--border-color);
            border-radius: 3px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 11px;
            font-family: inherit;
        }

        .text-input:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        .block-info {
            padding: 8px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-size: 10px;
            line-height: 1.6;
        }

        .block-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .block-info-row:last-child {
            margin-bottom: 0;
        }

        .block-info-label {
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-weight: 600;
        }

        .block-info-value {
            color: var(--text-primary);
            font-family: 'Courier New', monospace;
            font-size: 9px;
        }

        /* Layout Mode Toggle */

        .layout-mode-container {
            padding: 12px;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            --mdc-icon-size: 20px;
        }

        .layout-mode-label {
            display: block;
            margin-bottom: 8px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .layout-mode-toggle {
            display: flex;
            position: relative;
            background: var(--bg-tertiary);
            border-radius: 6px;
            padding: 2px;
            height: 36px;
        }

        .layout-mode-option {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 500;
            color: var(--text-secondary);
            cursor: pointer;
            z-index: 1;
            transition: color 0.2s ease;
            user-select: none;
        }

        .layout-mode-option:hover {
            color: var(--text-primary);
        }

        .layout-mode-option.active {
            color: white;
        }

        .layout-mode-option svg {
            width: 14px;
            height: 14px;
        }

        .layout-mode-slider {
            position: absolute;
            top: 2px;
            bottom: 2px;
            width: calc(50% - 2px);
            background: var(--accent-color);
            border-radius: 4px;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .layout-mode-toggle[data-mode="flow"] .layout-mode-slider {
            transform: translateX(0);
        }

        .layout-mode-toggle[data-mode="absolute"] .layout-mode-slider {
            transform: translateX(calc(100% + 4px));
        }

        /* Device indicator */

        .device-indicator {
            padding: 6px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-size: 10px;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .device-indicator .device-name {
            font-weight: 600;
            color: var(--accent-color);
        }
    `];let Hi=Ai;Pi([c({context:x})],Hi.prototype,"documentModel"),Pi([c({context:m})],Hi.prototype,"blockRegistry"),Pi([c({context:z})],Hi.prototype,"deviceManager"),Pi([c({context:D})],Hi.prototype,"styleResolver"),Pi([c({context:M})],Hi.prototype,"eventBus"),Pi([i({type:Object,attribute:!1})],Hi.prototype,"hass"),Pi([i({type:Number})],Hi.prototype,"canvasWidth"),Pi([i({type:Number})],Hi.prototype,"canvasHeight"),Pi([s()],Hi.prototype,"selectedBlock"),Pi([s()],Hi.prototype,"activeDeviceId"),Pi([s()],Hi.prototype,"panelState"),Pi([s()],Hi.prototype,"resolvedStyles"),Pi([s()],Hi.prototype,"visibleProperties"),Pi([s()],Hi.prototype,"presets"),Pi([s()],Hi.prototype,"activeSlotId"),Pi([s()],Hi.prototype,"slots"),Pi([s()],Hi.prototype,"saveDialogOpen"),Pi([s()],Hi.prototype,"managerDialogOpen"),Pi([s()],Hi.prototype,"bindingEditorOpen"),Pi([s()],Hi.prototype,"bindingEditorTarget"),Pi([s()],Hi.prototype,"expandedSections"),Pi([s()],Hi.prototype,"backgroundImageMode"),Bt.define("panel-styles",Hi);var ji=Object.defineProperty,Ni=Object.getOwnPropertyDescriptor,Ui=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ni(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ji(t,i,a),a};let Fi=class extends o{constructor(){super(...arguments),this._width=260,this._isResizing=!1,this._startX=0,this._startWidth=0}connectedCallback(){super.connectedCallback(),this._loadWidthPreference(),this._updateHostWidth()}render(){const e=[{id:"properties",label:"Properties",component:"panel-properties",props:{hass:this.hass}},{id:"styles",label:"Styles",component:"panel-style",props:{hass:this.hass,canvasWidth:this.canvasWidth,canvasHeight:this.canvasHeight,canvas:this.canvas}}];return r`
      <div
        class="resize-handle ${this._isResizing?"resizing":""}"
        @mousedown=${this._handleResizeStart}
      ></div>
      <div class="sidebar-content">
        <sidebar-tabbed .tabs=${e}></sidebar-tabbed>
      </div>
    `}updated(e){super.updated(e),e.has("canvas")&&this.canvas&&this._updateStylePanelCanvas()}_loadWidthPreference(){const e=localStorage.getItem(Fi.WIDTH_STORAGE_KEY);if(e){const t=parseInt(e,10);!isNaN(t)&&t>=Fi.MIN_WIDTH&&t<=Fi.MAX_WIDTH&&(this._width=t,this._updateHostWidth())}}_saveWidthPreference(){localStorage.setItem(Fi.WIDTH_STORAGE_KEY,String(this._width))}_updateHostWidth(){this.style.width=`${this._width}px`,this.style.setProperty("--right-sidebar-width",`${this._width}px`)}_handleResizeStart(e){e.preventDefault(),this._isResizing=!0,this._startX=e.clientX,this._startWidth=this._width;const t=e=>{if(!this._isResizing)return;const t=this._startX-e.clientX,i=Math.max(Fi.MIN_WIDTH,Math.min(Fi.MAX_WIDTH,this._startWidth+t));this._width=i,this._updateHostWidth()},i=()=>{this._isResizing&&(this._isResizing=!1,this._saveWidthPreference(),document.removeEventListener("mousemove",t),document.removeEventListener("mouseup",i))};document.addEventListener("mousemove",t),document.addEventListener("mouseup",i)}_updateStylePanelCanvas(){var e;const t=null==(e=this.shadowRoot)?void 0:e.querySelector("sidebar-tabbed");if(null==t?void 0:t.shadowRoot){const e=t.shadowRoot.querySelector("panel-style");e&&this.canvas&&(e.canvas=this.canvas)}}};Fi.styles=t`
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
  `,Fi.WIDTH_STORAGE_KEY="card-builder-right-sidebar-width",Fi.MIN_WIDTH=200,Fi.MAX_WIDTH=600,Ui([i({type:Number})],Fi.prototype,"canvasWidth",2),Ui([i({type:Number})],Fi.prototype,"canvasHeight",2),Ui([i({type:Object})],Fi.prototype,"canvas",2),Ui([i({attribute:!1})],Fi.prototype,"hass",2),Ui([s()],Fi.prototype,"_width",2),Ui([s()],Fi.prototype,"_isResizing",2),Fi=Ui([a("sidebar-right")],Fi);var Gi=Object.defineProperty,Wi=Object.getOwnPropertyDescriptor,qi=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Wi(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Gi(t,i,a),a};let Xi=class extends Ae{constructor(){super(...arguments),this.selectedId=null,this.blocks={},this.expandedBlocks=new Set(["root"]),this.autoExpandedBlocks=new Set,this.showAbsoluteSeparated=!1}connectedCallback(){super.connectedCallback(),this._onModelChange(),this.documentModel.addEventListener("change",()=>this._onModelChange()),this.documentModel.addEventListener("selection-changed",e=>{const t=e.detail.selectedId;if(this.autoExpandedBlocks.forEach(e=>{this.expandedBlocks.has(e)}),this.autoExpandedBlocks.clear(),t){const e=this.blocks[t];if(this.showAbsoluteSeparated&&"absolute"===(null==e?void 0:e.layout))this.expandedBlocks.has("absolute-root")||this.autoExpandedBlocks.add("absolute-root");else{this._getParentChain(t).forEach(e=>{this.expandedBlocks.has(e)||this.autoExpandedBlocks.add(e)})}}this.selectedId=t,this.requestUpdate()})}render(){const e=this.blocks.root;if(!e)return r`
                <div class="panel-content">
                    <div class="empty-state">
                        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
                        </svg>
                        <div>No layers available</div>
                    </div>
                </div>
            `;const t=Object.values(this.blocks).filter(e=>"absolute"===e.layout&&"root"!==e.id);return r`
            <div class="layers-header">
                <div class="layers-title">Layers</div>
                <div 
                    class="toggle-absolute ${this.showAbsoluteSeparated?"active":""}"
                    @click=${this._toggleAbsoluteMode}
                    title="Toggle absolute blocks visualization"
                >
                    <span class="toggle-icon"><ha-icon icon="mdi:crosshairs-gps"></ha-icon></span>
                    <span>${this.showAbsoluteSeparated?"Separated":"Nested"}</span>
                </div>
            </div>
            <div class="panel-content">
                ${this._renderLayer(e,0)}
                ${this.showAbsoluteSeparated&&t.length>0?r`
                    <div class="absolute-root">
                        ${this._renderAbsoluteRoot(t)}
                    </div>
                `:""}
            </div>
        `}_onModelChange(){this.blocks={...this.documentModel.blocks},this.requestUpdate()}_getParentChain(e){var t;const i=[];let o=e;for(;o&&"root"!==o;){let e=null;for(const[i,r]of Object.entries(this.blocks))if(null==(t=r.children)?void 0:t.includes(o)){e=i;break}if(!e)break;i.push(e),o=e}return i}_renderLayer(e,t){const i=this.blockRegistry.getBlock(e.type),o=e.id===this.documentModel.rootId?'<ha-icon icon="mdi:card-outline"></ha-icon>':(null==i?void 0:i.icon)||"?",{displayLabel:a,typeLabel:s,hasCustomLabel:n}=this._getLayerDisplay(e),d=e.children?e.children.map(e=>this.blocks[e]).filter(e=>!!e&&(this.showAbsoluteSeparated?"flow"===e.layout:"flow"===e.layout||"absolute"===e.layout)):[],c=d.length>0,p=this.expandedBlocks.has(e.id)||this.autoExpandedBlocks.has(e.id),h=this.selectedId===e.id;return r`
            <div>
                <div
                        class="layer-item ${h?"selected":""}"
                        @click=${t=>this._onLayerClick(t,e.id)}
                >
          <span
                  class="layer-toggle ${c?p?"expanded":"":"empty"}"
                  @click=${t=>this._onToggleClick(t,e.id)}
          ></span>
                    <span class="layer-icon">${l(o)}</span>
                    <span class="layer-label">
                        <span class="layer-label-text">${a}</span>
                        ${n?r`<span class="layer-type">${s}</span>`:""}
                    </span>
                    ${this.showAbsoluteSeparated||"absolute"!==e.layout||e.id===this.documentModel.rootId?"":r`
                        <span class="layer-absolute-badge">Abs</span>
                    `}
                </div>
                ${c&&p?r`
                            <div class="layer-children">
                                ${d.map(e=>this._renderLayer(e,t+1))}
                            </div>
                        `:""}
            </div>
        `}_onLayerClick(e,t){e.stopPropagation(),this.documentModel.select(t)}_onToggleClick(e,t){e.stopPropagation();const i=this.blocks[t];i.children&&i.children.some(e=>{const t=this.blocks[e];return t&&"flow"===t.layout})&&(this.expandedBlocks.has(t)?this.expandedBlocks.delete(t):this.expandedBlocks.add(t),this.requestUpdate())}_toggleAbsoluteMode(){this.showAbsoluteSeparated=!this.showAbsoluteSeparated,this.requestUpdate()}_getLayerDisplay(e){const t=this.blockRegistry.getBlock(e.type),i=e.id===this.documentModel.rootId?"Card":(null==t?void 0:t.label)||e.type;return{displayLabel:this.documentModel.getBlockDisplayName(e,i),typeLabel:i,hasCustomLabel:Boolean(this.documentModel.getBlockLabel(e))}}_renderAbsoluteRoot(e){const t=this.expandedBlocks.has("absolute-root")||this.autoExpandedBlocks.has("absolute-root");return r`
            <div>
                <div
                    class="layer-item"
                    @click=${e=>{e.stopPropagation(),this.expandedBlocks.has("absolute-root")?this.expandedBlocks.delete("absolute-root"):this.expandedBlocks.add("absolute-root"),this.requestUpdate()}}
                >
                    <span class="layer-toggle ${t?"expanded":""}"></span>
                    <span class="layer-icon"><ha-icon icon="mdi:crosshairs-gps"></span>
                    <span class="layer-label">Absolute Blocks</span>
                </div>
                ${t?r`
                    <div class="layer-children">
                        ${e.map(e=>this._renderAbsoluteBlock(e))}
                    </div>
                `:""}
            </div>
        `}_renderAbsoluteBlock(e){const t=this.blockRegistry.getBlock(e.type),i=(null==t?void 0:t.icon)||"?",{displayLabel:o,typeLabel:a,hasCustomLabel:s}=this._getLayerDisplay(e),n=this.selectedId===e.id,d=e.parentId?this.blocks[e.parentId]:null,c=d?this._getLayerDisplay(d):null;return r`
            <div
                class="layer-item ${n?"selected":""}"
                @click=${t=>this._onLayerClick(t,e.id)}
            >
                <span class="layer-toggle empty"></span>
                <span class="layer-icon">${l(i)}</span>
                <span class="layer-label">
                    <span class="layer-label-text">${o}</span>
                    ${s?r`<span class="layer-type">${a}</span>`:""}
                </span>
                ${c?r`
                    <span class="layer-parent-ref">
                        in: 
                        <span 
                            class="parent-link"
                            @click=${t=>{t.stopPropagation(),e.parentId&&this.documentModel.select(e.parentId)}}
                        >
                            ${c.displayLabel}
                            ${c.hasCustomLabel?r`<span class="layer-type">${c.typeLabel}</span>`:""}
                        </span>
                    </span>
                `:""}
            </div>
        `}};Xi.styles=[...Ae.styles,t`
            :host {
                --mdc-icon-size: 18px;
            }
            .layers-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                border-bottom: 1px solid var(--divider-color);
                background: var(--bg-secondary);
            }

            .layers-title {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                color: var(--text-secondary);
                letter-spacing: 0.5px;
            }

            .toggle-absolute {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                color: var(--text-secondary);
                background: var(--bg-primary);
                border: 1px solid var(--divider-color);
                transition: all 0.15s ease;
            }

            .toggle-absolute:hover {
                background: var(--bg-tertiary);
                border-color: var(--accent-color);
            }

            .toggle-absolute.active {
                background: var(--accent-color);
                color: white;
                border-color: var(--accent-color);
            }

            .toggle-icon {
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .layer-item {
                display: flex;
                align-items: center;
                padding: 6px 8px;
                cursor: pointer;
                user-select: none;
                border-radius: 4px;
                font-size: 12px;
                color: var(--text-primary);
                transition: background 0.15s ease;
            }

            .layer-item:hover {
                background: var(--bg-tertiary);
            }

            .layer-item.selected {
                background: var(--accent-color);
                color: white;
                font-weight: 500;
            }

            .layer-item.selected:hover {
                background: var(--accent-color);
                opacity: 0.95;
            }

            .layer-parent-ref {
                margin-left: auto;
                padding-left: 8px;
                font-size: 10px;
                color: var(--text-tertiary);
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .layer-item.selected .layer-parent-ref {
                color: rgba(255, 255, 255, 0.7);
            }

            .parent-link {
                text-decoration: underline;
                cursor: pointer;
                transition: opacity 0.15s ease;
            }

            .parent-link:hover {
                opacity: 0.7;
            }

            .layer-toggle {
                width: 16px;
                height: 16px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 4px;
                cursor: pointer;
                flex-shrink: 0;
            }

            .layer-toggle::before {
                content: '';
                display: inline-block;
                width: 0;
                height: 0;
                border-left: 4px solid var(--text-secondary);
                border-top: 3px solid transparent;
                border-bottom: 3px solid transparent;
                transition: transform 0.2s;
            }

            .layer-item.selected .layer-toggle::before {
                border-left-color: white;
            }

            .layer-toggle.expanded::before {
                transform: rotate(90deg);
            }

            .layer-toggle.empty {
                visibility: hidden;
            }

            .layer-icon {
                width: 18px;
                height: 18px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 8px;
                font-size: 14px;
                flex-shrink: 0;
            }

            .layer-label {
                flex: 1;
                min-width: 0;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .layer-label-text {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .layer-type {
                margin-left: 6px;
                font-size: 9px;
                letter-spacing: 0.3px;
                color: var(--text-tertiary);
            }

            .layer-item.selected .layer-type {
                color: rgba(255, 255, 255, 0.7);
            }

            .layer-absolute-badge {
                margin-left: 6px;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: 600;
                text-transform: uppercase;
                background: var(--accent-color);
                color: white;
                letter-spacing: 0.3px;
                flex-shrink: 0;
            }

            .layer-item.selected .layer-absolute-badge {
                background: rgba(255, 255, 255, 0.3);
            }

            .layer-children {
                padding-left: 16px;
            }

            .absolute-root {
                margin-top: 8px;
            }
        `],qi([c({context:x})],Xi.prototype,"documentModel",2),qi([c({context:m})],Xi.prototype,"blockRegistry",2),qi([s()],Xi.prototype,"selectedId",2),qi([s()],Xi.prototype,"blocks",2),qi([s()],Xi.prototype,"expandedBlocks",2),qi([s()],Xi.prototype,"autoExpandedBlocks",2),qi([s()],Xi.prototype,"showAbsoluteSeparated",2),Xi=qi([a("panel-layers")],Xi);var Yi=Object.getOwnPropertyDescriptor;let Zi=class extends o{render(){return r`
      <sidebar-tabbed .tabs=${[{id:"blocks",label:"Blocks",component:"panel-blocks"},{id:"layers",label:"Layers",component:"panel-layers"}]}></sidebar-tabbed>
    `}};Zi.styles=t`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `,Zi=((e,t,i,o)=>{for(var r,a=o>1?void 0:o?Yi(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(a)||a);return a})([a("sidebar-left")],Zi);var Ji=Object.defineProperty,Ki=Object.getOwnPropertyDescriptor,Qi=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ki(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ji(t,i,a),a};let eo=class extends o{constructor(){super(...arguments),this.devices=[],this.activeDeviceId="desktop"}render(){const e=this.devices.find(e=>e.id===this.activeDeviceId)||this.devices[0];return r`
      <div class="selector-container">
        ${e?this.getDeviceIcon(e):""}
        <select class="device-select" .value=${this.activeDeviceId} @change=${this.handleChange}>
          ${this.devices.map(e=>r`
            <option value=${e.id}>
              ${e.name}${e.width?` (${e.width}px)`:""}
            </option>
          `)}
        </select>
      </div>
    `}handleChange(e){const t=e.target;this.dispatchEvent(new CustomEvent("device-change",{detail:{deviceId:t.value},bubbles:!0,composed:!0}))}getDeviceIcon(e){return e.isDefault?r`
        <svg class="device-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" />
        </svg>
      `:e.width&&e.width<=768?r`
        <svg class="device-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" />
        </svg>
      `:r`
        <svg class="device-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z" />
        </svg>
      `}};eo.styles=t`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .selector-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
    }

    .device-icon {
      width: 18px;
      height: 18px;
      color: var(--text-secondary);
    }

    .device-select {
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 13px;
      font-weight: 500;
      outline: none;
      cursor: pointer;
      padding: 0;
    }

    .device-select option {
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .device-width {
      font-size: 11px;
      color: var(--text-secondary);
      margin-left: 4px;
    }

    .device-width::before {
      content: '(';
    }

    .device-width::after {
      content: ')';
    }
  `,Qi([i({type:Array})],eo.prototype,"devices",2),Qi([i({type:String})],eo.prototype,"activeDeviceId",2),eo=Qi([a("device-selector")],eo);var to=Object.defineProperty,io=Object.getOwnPropertyDescriptor,oo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?io(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&to(t,i,a),a};let ro=class extends o{constructor(){super(...arguments),this.open=!1,this.slots=[],this.deleteStates={},this.slotErrors={},this.createError=null,this.newSlotId="",this.newSlotName="",this.newSlotDescription="",this.newSlotEntityId="",this._handleSlotsChanged=()=>{this._refreshSlots()},this._handleEscape=e=>{"Escape"===e.key&&this._handleClose()}}connectedCallback(){super.connectedCallback(),this._refreshSlots(),this.documentModel.addEventListener("slots-changed",this._handleSlotsChanged)}disconnectedCallback(){super.disconnectedCallback(),this.documentModel.removeEventListener("slots-changed",this._handleSlotsChanged),this._removeEscapeListener()}render(){return this.open?r`
      <div class="overlay-backdrop" @click=${this._handleBackdropClick}></div>
      <div class="dialog">
        <div class="dialog-header">
          <div class="dialog-title">Entity slots</div>
          <button class="dialog-close" @click=${this._handleClose}>Close</button>
        </div>
        <div class="dialog-body">
          <div class="slot-form">
            <input
              type="text"
              placeholder="Slot ID"
              .value=${this.newSlotId}
              @input=${e=>{this.newSlotId=e.target.value}}
            />
            <input
              type="text"
              placeholder="Name"
              .value=${this.newSlotName}
              @input=${e=>{this.newSlotName=e.target.value}}
            />
            <input
              type="text"
              placeholder="Description"
              .value=${this.newSlotDescription}
              @input=${e=>{this.newSlotDescription=e.target.value}}
            />
            ${this.hass?r`
              <ha-selector
                .hass=${this.hass}
                .selector=${{entity:{multiple:!1}}}
                .value=${this.newSlotEntityId}
                @value-changed=${e=>{this.newSlotEntityId=e.detail.value||""}}
                allow-custom-entity
              ></ha-selector>
            `:n}
            <div class="slot-form-actions">
              <button class="primary-btn" @click=${this._handleCreateSlot}>Create slot</button>
              ${this.createError?r`<span class="error-text">${this.createError}</span>`:n}
            </div>
          </div>

          <div class="slot-list">
            ${0===this.slots.length?r`
              <div class="reference-meta">No slots defined yet</div>
            `:n}
            ${this.slots.map(e=>{const t=this.deleteStates[e.id],i=this.slotErrors[e.id];return r`
                <div class="slot-row">
                  <input
                    type="text"
                    .value=${e.id}
                    @change=${t=>this._handleSlotIdChange(e.id,t)}
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    .value=${e.name||""}
                    @change=${t=>this._handleSlotNameChange(e.id,t)}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    .value=${e.description||""}
                    @change=${t=>this._handleSlotDescriptionChange(e.id,t)}
                  />
                  ${this.hass?r`
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{entity:{multiple:!1}}}
                      .value=${e.entityId||""}
                      @value-changed=${t=>this._handleSlotEntityChange(e.id,t)}
                      allow-custom-entity
                    ></ha-selector>
                  `:n}
                  <div class="slot-actions">
                    <button class="secondary-btn" @click=${()=>this._handleRecheck(e.id)}>
                      Recheck
                    </button>
                    <button class="danger-btn" @click=${()=>this._handleDeleteSlot(e.id)}>
                      Delete
                    </button>
                  </div>
                  ${i?r`
                    <div class="references">
                      <span class="error-text">${i}</span>
                    </div>
                  `:n}
                  ${t?r`
                    <div class="references">
                      <div class="reference-meta">References found (${t.references.length})</div>
                      ${t.references.map(e=>r`
                        <div class="reference-item">
                          <button
                            class="reference-link"
                            @click=${()=>this._handleReferenceNavigate(e)}
                          >
                            ${this._getBlockLabel(e.blockId)} - ${this._formatReference(e)}
                          </button>
                        </div>
                      `)}
                    </div>
                  `:n}
                </div>
              `})}
          </div>
        </div>
      </div>
    `:r``}updated(e){e.has("open")&&(this.open?this._addEscapeListener():this._removeEscapeListener())}_refreshSlots(){this.slots=this.documentModel.getSlots();const e=new Set(this.slots.map(e=>e.id));this.deleteStates=Object.fromEntries(Object.entries(this.deleteStates).filter(([t])=>e.has(t))),this.slotErrors=Object.fromEntries(Object.entries(this.slotErrors).filter(([t])=>e.has(t)))}_addEscapeListener(){window.addEventListener("keydown",this._handleEscape)}_removeEscapeListener(){window.removeEventListener("keydown",this._handleEscape)}_handleBackdropClick(e){e.target===e.currentTarget&&this._handleClose()}_handleClose(){this.dispatchEvent(new CustomEvent("overlay-close",{bubbles:!0,composed:!0}))}_handleCreateSlot(){const e=this.newSlotId.trim();if(!e)return void(this.createError="Slot ID cannot be empty");const t=this.documentModel.createSlot({id:e,name:this.newSlotName,description:this.newSlotDescription,entityId:this.newSlotEntityId});t.success?(this.createError=null,this.newSlotId="",this.newSlotName="",this.newSlotDescription="",this.newSlotEntityId=""):this.createError=t.error||"Unable to create slot"}_handleSlotIdChange(e,t){const i=t.target.value;if(!i||i===e){const t={...this.slotErrors};return delete t[e],void(this.slotErrors=t)}const o=this.documentModel.updateSlot(e,{id:i});if(!o.success)return this.slotErrors={...this.slotErrors,[e]:o.error||"Unable to update slot ID"},void this.requestUpdate();const r={...this.slotErrors};delete r[e],this.slotErrors=r}_handleSlotNameChange(e,t){const i=t.target.value;this.documentModel.updateSlot(e,{name:i})}_handleSlotDescriptionChange(e,t){const i=t.target.value;this.documentModel.updateSlot(e,{description:i})}_handleSlotEntityChange(e,t){const i=t.detail.value||"";this.documentModel.updateSlot(e,{entityId:i})}_handleDeleteSlot(e){const t=this.documentModel.findSlotReferences(e);if(t.length>0)return void(this.deleteStates={...this.deleteStates,[e]:{references:t,error:"Slot is still referenced"}});this.documentModel.deleteSlot(e);const i={...this.deleteStates};delete i[e],this.deleteStates=i}_handleRecheck(e){const t=this.documentModel.findSlotReferences(e);if(0===t.length){this.documentModel.deleteSlot(e);const t={...this.deleteStates};return delete t[e],void(this.deleteStates=t)}this.deleteStates={...this.deleteStates,[e]:{references:t,error:"Slot is still referenced"}}}_handleReferenceNavigate(e){this.dispatchEvent(new CustomEvent("slot-reference-navigate",{detail:{reference:e},bubbles:!0,composed:!0}))}_formatReference(e){const t=e.styleSlotId?` (slot ${e.styleSlotId})`:"";switch(e.kind){case"block-entity":return"Entity configuration";case"style-binding":return`Styles: ${e.category}.${e.property}${t}`;case"style-animation":return`Animation binding: ${e.category}.${e.property}${t}`;case"trait-binding":return`Property binding: ${e.propName}`;case"trait-slot":return`Property slot: ${e.propName}`;default:return"Reference"}}_getBlockLabel(e){const t=this.documentModel.getBlock(e);return this.documentModel.getBlockDisplayName(e,(null==t?void 0:t.type)||e)}};ro.styles=t`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1200;
      pointer-events: none;
      display: block;
    }

    :host([open]) {
      pointer-events: auto;
    }

    .overlay-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    :host([open]) .overlay-backdrop {
      opacity: 1;
    }

    .dialog {
      position: absolute;
      top: 50%;
      left: 50%;
      width: min(92vw, 1400px);
      height: min(86vh, 860px);
      transform: translate(-50%, -48%) scale(0.98);
      background: var(--bg-primary, #fff);
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      opacity: 0;
      transition: transform 0.25s ease, opacity 0.25s ease;
      overflow: hidden;
    }

    :host([open]) .dialog {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }

    .dialog-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #e0e0e0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: var(--bg-secondary, #f5f5f5);
    }

    .dialog-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-primary, #333);
    }

    .dialog-close {
      border: 1px solid var(--border-color, #d4d4d4);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: 4px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .dialog-body {
      flex: 1;
      overflow: auto;
      padding: 16px 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .slot-form {
      display: grid;
      grid-template-columns: 160px 1fr 1fr 1fr;
      gap: 10px;
      align-items: center;
      padding: 12px;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      background: var(--bg-secondary, #f9f9f9);
    }

    .slot-form input {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      height: 100%;
    }

    .slot-form-actions {
      grid-column: 1 / -1;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .primary-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      background: var(--accent-color, #2196f3);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
    }

    .secondary-btn {
      padding: 6px 12px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
    }

    .error-text {
      font-size: 11px;
      color: var(--error-color, #d32f2f);
    }

    .slot-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .slot-row {
      display: grid;
      grid-template-columns: 160px 1fr 1fr 1fr auto;
      gap: 10px;
      align-items: center;
      padding: 12px;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      background: var(--bg-primary, #fff);
    }

    .slot-row input,
    .slot-row select {
      width: 100%;
      padding: 0 8px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
        height: 100%;
    }

    .slot-actions {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .danger-btn {
      border: 1px solid rgba(211, 47, 47, 0.4);
      background: rgba(211, 47, 47, 0.1);
      color: #b71c1c;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
    }

    .references {
      grid-column: 1 / -1;
      margin-top: 8px;
      padding: 10px;
      border-radius: 6px;
      background: rgba(255, 152, 0, 0.1);
      border: 1px solid rgba(255, 152, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .reference-item {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .reference-link {
      border: none;
      background: none;
      padding: 0;
      color: var(--accent-color, #2196f3);
      cursor: pointer;
      text-decoration: underline;
      font-size: 11px;
      text-align: left;
    }

    .reference-meta {
      font-size: 11px;
      color: var(--text-secondary, #666);
    }
  `,oo([c({context:x})],ro.prototype,"documentModel",2),oo([i({type:Boolean,reflect:!0})],ro.prototype,"open",2),oo([i({attribute:!1})],ro.prototype,"hass",2),oo([s()],ro.prototype,"slots",2),oo([s()],ro.prototype,"deleteStates",2),oo([s()],ro.prototype,"slotErrors",2),oo([s()],ro.prototype,"createError",2),oo([s()],ro.prototype,"newSlotId",2),oo([s()],ro.prototype,"newSlotName",2),oo([s()],ro.prototype,"newSlotDescription",2),oo([s()],ro.prototype,"newSlotEntityId",2),ro=oo([a("entity-slots-editor-overlay")],ro);const ao=t`
    .guides {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
    }

    .guides-axis-dot,
    .guides-origin-dot {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(212, 70, 0, 0.95);
        border: 2px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        transform: translate(-50%, -50%);
    }

    .guides-axis {
        position: absolute;
        background: transparent;
        opacity: 0.55;
    }

    .guides-axis.x {
        left: 0;
        right: 0;
        height: 2px;
        border-top: 2px dashed rgba(212, 28, 0, 0.55);
    }

    .guides-axis.y {
        top: 0;
        bottom: 0;
        width: 2px;
        border-left: 2px dashed rgba(212, 28, 0, 0.55);
    }

    .guides-line {
        position: absolute;
        border-color: rgba(212, 28, 0, 0.55);
        border-style: dashed;
        border-width: 0;
    }

    .guides-line.h {
        border-top-width: 1px;
    }

    .guides-line.v {
        border-left-width: 1px;
    }

    .guides-label {
        position: absolute;
        transform: translate(-50%, -50%);
        font-size: 10px;
        line-height: 1;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgb(197, 74, 55);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.18);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }

    .guides[hidden] {
        display: none;
    }
`;function so(e,t){if("%"===t){return`${Math.round(100*e)/100}%`}return`${Math.round(e)}px`}function no(e){e&&e.root.setAttribute("hidden","")}var lo=Object.defineProperty,co=Object.getOwnPropertyDescriptor,po=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?co(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&lo(t,i,a),a};let ho=class extends o{constructor(){super(...arguments),this.show=!0,this.selectedBlockId=null,this.selectedBlock=null,this.targetElement=null,this.position={top:0,left:0},this.canDelete=!1,this.canDuplicate=!1,this.canSelectParent=!1,this._updateCapabilities=()=>{this.canDelete=this.documentModel.canDeleteBlock(this.selectedBlockId),this.canDuplicate=this.documentModel.canDuplicateBlock(this.selectedBlockId),this.canSelectParent=null!==this.selectedBlock.parentId},this._updatePosition=()=>{this.targetElement&&requestAnimationFrame(()=>{if(!this.targetElement)return;const e=this.targetElement.getBoundingClientRect();this.position={top:e.top-25-5,left:e.left},this.style.top=`${this.position.top}px`,this.style.left=`${this.position.left}px`,this.style.width=`${e.width}px`,this.style.transform="none"})}}connectedCallback(){super.connectedCallback(),window.addEventListener("scroll",this._updatePosition,!0),window.addEventListener("resize",this._updatePosition),this.documentModel.addEventListener("selection-changed",e=>{const t=e.detail;this.selectedBlockId=t.selectedId}),this.eventBus.addEventListener("canvas-size-changed",()=>this._updatePosition())}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("scroll",this._updatePosition,!0),window.removeEventListener("resize",this._updatePosition)}render(){if(!this.show||!this.selectedBlockId)return n;this.selectedBlock=this.documentModel.getBlock(this.selectedBlockId),this.targetElement=this.selectedBlockId===this.documentModel.rootId?this.canvas:this.documentModel.getElement(this.selectedBlockId),this._updateCapabilities(),this._updatePosition();const e=this._getBlockLabel();return r`
            <div class="toolbar-container">
                <div class="block-label">${e}</div>
                <div class="toolbar">
                    <button
                            class="toolbar-button"
                            ?disabled=${!this.canSelectParent}
                            @click=${e=>this._handleSelectParent(e)}
                            title="Select parent (↑)"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                        </svg>
                    </button>

                    <button
                            class="toolbar-button"
                            ?disabled=${!this.canDuplicate}
                            @click=${this._handleDuplicate}
                            title="Duplicate (Ctrl+D)"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                    </button>

                    <button
                            class="toolbar-button delete"
                            ?disabled=${!this.canDelete}
                            @click=${this._handleDelete}
                            title="Delete"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `}_handleSelectParent(e){e.stopPropagation(),this.selectedBlock&&this.canSelectParent&&this.selectedBlock.parentId&&this.documentModel.select(this.selectedBlock.parentId)}_handleDuplicate(){this.selectedBlock&&this.canDuplicate&&this.documentModel.duplicateBlock(this.selectedBlock.id)}_handleDelete(){this.selectedBlock&&this.canDelete&&this.documentModel.deleteBlock(this.selectedBlock.id)}_getBlockLabel(){if(!this.selectedBlock)return"";const e=this.blockRegistry.getBlock(this.selectedBlock.type),t=(null==e?void 0:e.label)||this.selectedBlock.type.replace(/^ha-/,"").split("-").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");return this.documentModel.getBlockDisplayName(this.selectedBlock,t)}};ho.styles=t`
        :host {
            position: fixed;
            z-index: 100;
            pointer-events: none;
        }

        .toolbar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            width: 100%;
        }

        .block-label {
            background: var(--accent-color, #1976d2);
            color: white;
            padding: 5px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            pointer-events: auto;
            box-shadow: 0 0 0 0, 0 0 0 0, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }

        .toolbar {
            display: flex;
            gap: 2px;
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 6px;
            box-shadow: 0 0 0 0, 0 0 0 0, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
            pointer-events: auto;
        }

        .toolbar-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 21px;
            border: none;
            background: transparent;
            cursor: pointer;
            color: var(--text-primary, #333333);
            transition: all 0.15s ease;
        }

        .toolbar-button:hover {
            background: var(--bg-secondary, #f5f5f5);
        }

        .toolbar-button:active {
            background: var(--bg-tertiary, #e8e8e8);
            transform: scale(0.95);
        }

        .toolbar-button svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .toolbar-button.delete:hover {
            background: #fee;
            color: #d32f2f;
        }

        .toolbar-button:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .toolbar-button:disabled:hover {
            background: transparent;
        }
    `,po([c({context:x})],ho.prototype,"documentModel",2),po([c({context:m})],ho.prototype,"blockRegistry",2),po([i({attribute:!1})],ho.prototype,"show",2),po([i({attribute:!1})],ho.prototype,"canvas",2),po([c({context:M})],ho.prototype,"eventBus",2),po([s()],ho.prototype,"selectedBlockId",2),ho=po([a("contextual-block-toolbar")],ho);var uo=Object.defineProperty,go=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&uo(t,i,a),a};const bo=class extends R{constructor(){super(),this.showPositionGuides=!0,this.showSnapGuides=!0,this.isCanvasSelected=!1,this.showContextualBlockToolbar=!0,this.showControls=!1,this.blocks={},this.selectedBlockId=null,this.moveable=null,this.guides=null,this.flowContainer=null,this.overflowAllowBlocksOutside=!1,this._handleKeyDown=e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;const t=this.selectedBlockId?this.documentModel.getBlock(this.selectedBlockId):null;return t&&(e.ctrlKey||e.metaKey)&&"d"===e.key?(e.preventDefault(),void(this.documentModel.canDuplicateBlock(t.id)&&this.documentModel.duplicateBlock(t.id))):void 0},this.addEventListener("click",e=>this._onBuilderClick(e))}get dropId(){return this.canvasId}get dropElement(){return this.flowContainer}getPanelConfig(){return{properties:{groups:[{id:"overflow",label:"Overflow",traits:[{type:"checkbox",name:"overflow_allow_blocks_outside",label:"Allow blocks outside"},{type:"checkbox",name:"overflow_show",label:"Show overflow"}]}]},styles:{groups:["background","border"],properties:["spacing.padding"]}}}connectedCallback(){super.connectedCallback(),this._onModelChange(),this._setupKeyboardShortcuts(),this.documentModel.addEventListener("change",e=>this._onModelChange(e)),this.documentModel.addEventListener("selection-changed",e=>{var t,i;const o=e.detail;this.selectedBlockId=o.selectedId,this.isCanvasSelected=this.selectedBlockId===this.documentModel.rootId,this.isCanvasSelected?null==(t=this.canvas)||t.classList.add("canvas-selected"):null==(i=this.canvas)||i.classList.remove("canvas-selected");const r=this.selectedBlockId?this.documentModel.getBlock(this.selectedBlockId):null;this.showControls="absolute"===(null==r?void 0:r.layout),this._updateMoveable()}),this.documentModel.addEventListener("style-slot-changed",()=>{}),this.documentModel.addEventListener("block-updated",e=>{var t,i,o,r,a;const s=e.detail;s.block.id===this.selectedBlockId&&requestAnimationFrame(()=>{this._updateMoveable()}),s.block.id===this.documentModel.rootId&&(this.overflowAllowBlocksOutside=(null==(i=null==(t=s.block.props)?void 0:t.overflow_allow_blocks_outside)?void 0:i.value)??!1,null==(a=this.canvas)||a.style.setProperty("overflow",(null==(r=null==(o=s.block.props)?void 0:o.overflow_show)?void 0:r.value)?"visible":"hidden"),this.requestUpdate())}),this.dragDropManager.addEventListener("block-created",e=>{e.detail,this._handleBlockCreated(e.detail)}),this.dragDropManager.addEventListener("block-reordered",e=>{e.detail,this._handleBlockReordered(e.detail)}),this.dragDropManager.addEventListener("block-drag-on-generate-preview",()=>{this.selectedBlockId&&(this.selectedBlockId=null,this.requestUpdate())})}disconnectedCallback(){super.disconnectedCallback(),this.moveable&&this.moveable.destroy(),this._cleanupKeyboardShortcuts()}async firstUpdated(){await this.updateComplete,this.dragDropManager.registerCanvas(this)}async updated(e){await super.updated(e),await this.updateComplete,e.has("showPositionGuides")&&this._updateGuides(),e.has("showSnapGuides")&&await this._updateMoveable()}render(){const e=0===this.rootBlocks.length,t=this.deviceManager.getActiveDevice(),i=(null==t?void 0:t.width)??null,o=(null==t?void 0:t.name)||"Desktop",a=i?`${i}px`:"Responsive",s=null===i,l=s?"100%":`${i+40}px`,{absoluteBlocks:d,flowBlocks:c,haCardStyles:g,canvasStyles:b,canvasFlowContainerStyles:v}=this.getRenderData({width:(s?"100%":`${i}px`)+" !important"});return r`
            <div
                class="canvas-viewport"
                style="width: ${l}"
                data-device-name="${o}"
                data-device-width="${a}"
            >
                
                    <ha-card style="${h(g)}">
                        <div
                            class="canvas ${e?"canvas-empty":""}"
                            style="${h(b)}"
                            ${p(e=>this.canvas=e)}
                        >
                            ${r`
        <div class="guides" hidden>
            <div class="guides-axis-dot"></div>
            <div class="guides-axis x"></div>
            <div class="guides-axis y"></div>
            <div class="guides-origin-dot"></div>
            <div class="guides-line h"></div>
            <div class="guides-line v"></div>
            <div class="guides-label h"></div>
            <div class="guides-label v"></div>
        </div>
    `}
                            ${e?r`<div class="canvas-placeholder">Canvas is empty</div>`:n}
                            ${u(d,e=>e.id,e=>this.renderBlock(e))}
                            <div
                                class="canvas-flow-container ${0===c.length?"flow-empty":""}"
                                data-dnd-drop-target="true"
                                style="${h(v)}"
                                @click=${e=>this._onBuilderClick(e)}
                                ${p(e=>this.flowContainer=e)}
                            >
                                ${u(c,e=>e.id,e=>this.renderBlock(e))}
                            </div>
                        </div>
                    </ha-card>
                

                ${this._renderControls()}
            </div>
            <contextual-block-toolbar
                    .canvas=${this.canvas}
                    .show=${this.showContextualBlockToolbar}
            >
            </contextual-block-toolbar>
        `}canvasSizeChanged(){this.selectedBlockId&&this._updateGuides(),this.moveable&&this.moveable.updateRect()}doBlockRender(e,t){return b`
          <${t.tag}
            block-id="${e.id}"
            data-dnd-draggable="${"flow"===e.layout}"
            data-dnd-drop-target="${"flow"===e.layout}"
            .block=${e}
            .canvasId=${this.canvasId}
            .activeDeviceId=${this.activeDeviceId}
            @click=${t=>this._onBlockClick(t,e.id)}
            ${p(t=>this.documentModel.registerElement(e.id,t))}
          ></${t.tag}>
      `}_setupKeyboardShortcuts(){document.addEventListener("keydown",this._handleKeyDown)}_cleanupKeyboardShortcuts(){document.removeEventListener("keydown",this._handleKeyDown)}_ensureGuidesElements(){this.guides||(this.guides=function(e){const t=null==e?void 0:e.querySelector(".guides");if(!t)return null;const i=t.querySelector(".guides-axis-dot"),o=t.querySelector(".guides-axis.x"),r=t.querySelector(".guides-axis.y"),a=t.querySelector(".guides-origin-dot"),s=t.querySelector(".guides-line.h"),n=t.querySelector(".guides-line.v"),l=t.querySelector(".guides-label.h"),d=t.querySelector(".guides-label.v");return i&&o&&r&&a&&s&&n&&l&&d?{root:t,axisDot:i,axisX:o,axisY:r,originDot:a,lineH:s,lineV:n,labelH:l,labelV:d}:null}(this.shadowRoot))}_hideGuides(){this._ensureGuidesElements(),no(this.guides)}_togglePositionGuides(e){e.stopPropagation(),this.showPositionGuides=!this.showPositionGuides,this.dispatchEvent(new CustomEvent("position-guides-preference-changed",{detail:{status:this.showPositionGuides,selectedId:this.selectedBlockId},bubbles:!0,composed:!0}))}_toggleSnapGuides(e){e.stopPropagation(),this.showSnapGuides=!this.showSnapGuides,this.dispatchEvent(new CustomEvent("snap-guides-preference-changed",{detail:{status:this.showPositionGuides,selectedId:this.selectedBlockId},bubbles:!0,composed:!0}))}_calculateInsertIndexFromInstruction(e,t){if(!t)return 0;switch(t.operation){case"reorder-before":return e.order;case"reorder-after":return e.order+1;case"combine":return 0;default:return console.warn(`[BuilderCanvas] Unknow instruction operation: ${t.operation}`),0}}_handleBlockCreated(e){var t;const i=this.documentModel.getBlock(e.targetBlockId||"root"),o=e.targetBlockId?e.targetIsContainer?e.targetBlockId:this.documentModel.getBlock(e.targetBlockId).parentId:"root",r=this._calculateInsertIndexFromInstruction(i,e.instruction);e.blockType,null==(t=e.instruction)||t.operation;const a=this.blockRegistry.getDefaults(e.blockType),s=this.blockRegistry.getEntityDefaults(e.blockType),n=this.documentModel.createBlock(e.blockType,o,{...a,entityConfig:{mode:s.mode||"inherited",slotId:s.slotId}},{},r);this.documentModel.select(n.id)}_handleBlockReordered(e){var t;const i=this.documentModel.getBlock(e.targetBlockId||"root");let o=e.targetIsContainer?e.targetBlockId:this.documentModel.getBlock(e.targetBlockId).parentId;const r=this._calculateInsertIndexFromInstruction(i,e.instruction);e.blockId,null==(t=e.instruction)||t.operation,this.documentModel.moveBlock(e.blockId,o,r)}_getSelectedBlockGuideData(e,t,i){if(!this.selectedBlockId)return null;const o=this.documentModel.getBlock(this.selectedBlockId);if(!o||"absolute"!==o.layout)return null;const r=this._getResolvedLayoutData(o);r.size=i??this.getRuntimeBlockSize(o,r);let a=this.canvasWidth,s=this.canvasHeight,n=0,l=0;if("root"!==o.parentId){const e=this._findInShadowDOM(this.shadowRoot,`[block-id="${o.parentId}"]`);if(e){let t=e;if(this.canvas&&t){const e=this.canvas.getBoundingClientRect(),i=t.getBoundingClientRect();n=i.left-e.left,l=i.top-e.top,a=i.width,s=i.height}}}const d=new E({containerSize:{width:a,height:s},elementSize:r.size,anchorPoint:r.positionConfig.anchor,originPoint:r.positionConfig.originPoint,unitSystem:r.positionConfig.unitSystem});let c,p;if(void 0!==e&&void 0!==t)c=e,p=t;else{const e=this.blockToMoveable(r,a,s);c=e.left+n,p=e.top+l}const h=c-n,u=p-l,g=d.fromMoveableSpace({x:h,y:u}),{axisX:b,axisY:v}=(y=r.positionConfig.anchor,m=a,f=s,{axisX:y.includes("right")?m:y.includes("center")?m/2:0,axisY:y.includes("bottom")?f:y.includes("middle")?f/2:0});var y,m,f;const x=b+n,_=v+l,{localOriginX:k,localOriginY:w}=($=r.positionConfig.originPoint,S=r.size.width,C=r.size.height,{localOriginX:$.includes("right")?S:$.includes("center")?S/2:0,localOriginY:$.includes("bottom")?C:$.includes("middle")?C/2:0});var $,S,C;return{axisX:x,axisY:_,blockOriginX:c+k,blockOriginY:p+w,unitSystem:r.positionConfig.unitSystem,xValue:g.x,yValue:g.y}}_updateGuides(e,t,i){if(!this.showPositionGuides)return void this._hideGuides();this._ensureGuidesElements();const o=this._getSelectedBlockGuideData(e,t,i);!function(e,t,i,o){if(!e)return;if(!t)return void no(e);e.root.removeAttribute("hidden"),e.axisDot.style.top=`calc(${t.axisY}px)`,e.axisDot.style.left=`calc(${t.axisX}px)`,e.axisX.style.top=`calc(${t.axisY}px - 2px)`,e.axisY.style.left=`calc(${t.axisX}px - 2px)`,e.originDot.style.left=`${t.blockOriginX}px`,e.originDot.style.top=`${t.blockOriginY}px`;const r=t.blockOriginY,a=Math.min(t.blockOriginX,t.axisX),s=Math.max(t.blockOriginX,t.axisX);e.lineH.style.top=`${r}px`,e.lineH.style.left=`${a}px`,e.lineH.style.width=`${Math.max(0,s-a)}px`;const n=t.blockOriginX,l=Math.min(t.blockOriginY,t.axisY),d=Math.max(t.blockOriginY,t.axisY);e.lineV.style.left=`${n}px`,e.lineV.style.top=`${l}px`,e.lineV.style.height=`${Math.max(0,d-l)}px`;const c=(a+s)/2;e.labelH.textContent=so(t.xValue,t.unitSystem);const p=(l+d)/2;e.labelV.textContent=so(t.yValue,t.unitSystem);const h=(e,t)=>Math.max(10,Math.min(e,t-10));e.labelH.style.left=`${h(c,i)}px`,e.labelH.style.top=`${h(r,o)}px`,e.labelV.style.left=`${h(n,i)}px`,e.labelV.style.top=`${h(p,o)}px`}(this.guides,o,this.canvasWidth,this.canvasHeight)}_getResolvedLayoutData(e){const t=this.documentModel.resolveEntityForBlock(e.id),i=t.entityId?{defaultEntityId:t.entityId}:void 0,o=this.styleResolver.resolve(e.id,this.activeDeviceId,i);return I(o)}_onModelChange(e=void 0){this.documentModel.buildTree();this.blocks=this.documentModel.blocks;const t=null==e?void 0:e.detail,i=null==t?void 0:t.block;(!e||i&&i.parentId===this.documentModel.rootId)&&(this.rootBlocks=Object.values(this.blocks).filter(e=>e.parentId===this.documentModel.rootId));for(const o of Object.values(this.blocks))this.subscribeBlockEntities(o.id,this.documentModel.getTrackedEntitiesFlat(o))}_renderControls(){return this.showControls?r`
            <div class="canvas-controls">
                <button
                        class="toggle-button"
                        aria-pressed=${this.showPositionGuides?"true":"false"}
                        title="Toggle position guides and axes"
                        @click=${e=>this._togglePositionGuides(e)}
                >
                    Position guides
                </button>
                <button
                        class="toggle-button"
                        aria-pressed=${this.showSnapGuides?"true":"false"}
                        title="Toggle snap lines"
                        @click=${e=>this._toggleSnapGuides(e)}
                >
                    Snap lines
                </button>
            </div>
        `:r``}_onBuilderClick(e){e.stopPropagation();const t=e.target;t===this?this.documentModel.select(null):t!==this.canvas&&t!==this.flowContainer||this.documentModel.select(this.documentModel.rootId)}_onBlockClick(e,t){e.stopPropagation(),this.documentModel.select(t)}_findInShadowDOM(e,t){const i=e.querySelector(t);if(i)return i;const o=e.querySelectorAll("*");for(const r of o)if(r.shadowRoot){const e=this._findInShadowDOM(r.shadowRoot,t);if(e)return e}return null}async _updateMoveable(){await this.updateComplete,this.guides=null,this.moveable&&(this.moveable.destroy(),this.moveable=null);const e=this.selectedBlockId;if(!e)return void this._hideGuides();const t=this.documentModel.getBlock(e);if(!t||"absolute"!==t.layout)return void this._hideGuides();const i=this.documentModel.getElement(t);if(!i||!this.canvas)return;let o=this.canvas,r=this.canvasWidth,a=this.canvasHeight,s=0,n=0,l=!1;if("root"!==t.parentId){const e=this.documentModel.getElement(t.parentId);let d=i.parentElement||e;o=d,l=!0;const c=this.canvas.getBoundingClientRect(),p=d.getBoundingClientRect();s=p.left-c.left,n=p.top-c.top,r=p.width,a=p.height}await i.updateComplete;const d=this._getResolvedLayoutData(t);d.size=this.getRuntimeBlockSize(t,d);const c=this.blockToMoveable(d,r,a),p=Object.values(this.blocks).filter(t=>"absolute"===t.layout&&t.id!==e),h=("root"!==t.parentId?p.filter(e=>e.parentId===t.parentId):p).map(e=>({element:this.documentModel.getElement(e.id),className:"moveable-snap-element"})),u=r/2,g=a/2;let b=null;if(!this.overflowAllowBlocksOutside)if(l){const e=this.canvas.getBoundingClientRect(),t=o.getBoundingClientRect();b={left:-(t.left-e.left),top:-(t.top-e.top),right:r+(e.right-t.right),bottom:a+(e.bottom-t.bottom)}}else b={left:0,top:0,right:this.canvasWidth,bottom:this.canvasHeight};this.moveable=new N(o,{target:i,draggable:!0,resizable:!0,keepRatio:!1,throttleDrag:0,throttleResize:0,renderDirections:["nw","n","ne","w","e","sw","s","se"],edge:!1,origin:!1,bounds:b,snappable:!0,snapThreshold:5,isDisplaySnapDigit:this.showSnapGuides,snapGap:this.showSnapGuides,snapDirections:{top:!0,left:!0,bottom:!0,right:!0,center:!0,middle:!0},elementSnapDirections:{top:!0,left:!0,bottom:!0,right:!0,center:!0,middle:!0},elementGuidelines:this.showSnapGuides?h:[],snapContainer:o,verticalGuidelines:this.showSnapGuides?[{pos:0,className:"snap-canvas-edge"},{pos:u,className:"snap-canvas-center"},{pos:r,className:"snap-canvas-edge"}]:[],horizontalGuidelines:this.showSnapGuides?[{pos:0,className:"snap-canvas-edge"},{pos:g,className:"snap-canvas-center"},{pos:a,className:"snap-canvas-edge"}]:[],snapDigit:0}),this.moveable.updateRect();let v={left:c.left,top:c.top},y=new Set;const m=r,f=a,x=s,_=n;this.moveable.on("dragStart",()=>{this.showContextualBlockToolbar=!1,this.eventBus.emit("block-drag-start",{block:t})}),this.moveable.on("drag",({target:t,left:i,top:o,transform:r})=>{if(!this.documentModel.getBlock(e))return;v={left:i,top:o},t.style.transform=r;const a=i+x,s=o+_;this._updateGuides(a,s)}),this.moveable.on("snap",({elements:e,gaps:t})=>{y.forEach(e=>e.classList.remove("snap-highlight")),y.clear(),e&&e.length>0&&e.forEach(e=>{e.element&&e.element instanceof HTMLElement&&(e.element.classList.add("snap-highlight"),y.add(e.element))}),t&&t.length>0&&t.forEach(e=>{e.element&&e.element instanceof HTMLElement&&(e.element.classList.add("snap-highlight"),y.add(e.element))})}),this.moveable.on("dragEnd",async({target:i})=>{if(!this.documentModel.getBlock(e))return;y.forEach(e=>e.classList.remove("snap-highlight")),y.clear();const o=v.left,r=v.top,a=this.moveableToBlock({left:o,top:r},d.positionConfig,d.size,m,f);i.style.transform="",this.eventBus.dispatchEvent("moveable-change",a),this.showContextualBlockToolbar=!0,this.eventBus.emit("block-drag-end",{block:t})});let k={left:c.left,top:c.top,width:d.size.width,height:d.size.height};this.moveable.on("resizeStart",()=>{this.showContextualBlockToolbar=!1,this.eventBus.emit("block-resize-start",{block:t})}),this.moveable.on("resize",({target:e,width:t,height:i,drag:o})=>{const r=o.left,a=o.top,s=t,n=i;k={left:r,top:a,width:s,height:n},e.style.width=`${s}px`,e.style.height=`${n}px`,e.style.transform=o.transform;const l=r+x,d=a+_;this._updateGuides(l,d,{width:s,height:n})}),this.moveable.on("resizeEnd",({target:i})=>{y.forEach(e=>e.classList.remove("snap-highlight")),y.clear();if(!this.documentModel.getBlock(e))return;const o=k.left,r=k.top,a=k.width,s=k.height,n=this.moveableResizeToBlock({left:o,top:r},{width:a,height:s},d.positionConfig,m,f);i.style.transform="",this.eventBus.dispatchEvent("moveable-change",n),this.showContextualBlockToolbar=!0,this.eventBus.emit("block-resize-end",{block:t})}),this._updateGuides()}};bo.styles=[...R.styles,ao,t`
            :host {
                display: flex;
                align-items: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                width: max-content;
            }

            :host(.desktop) {
                min-width: 100%;
            }

            .canvas-viewport {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                background: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(0, 0, 0, 0.02) 10px,
                        rgba(0, 0, 0, 0.02) 20px
                );
                border: 2px dashed var(--border-color);
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
            }

            :host(.desktop) .canvas-viewport {
                background: none;
                border: none;
                border-radius: 0;
                padding: 0;
                box-shadow: none;
            }

            .canvas-viewport::before {
                content: attr(data-device-name);
                position: absolute;
                top: -10px;
                left: 20px;
                background: var(--bg-primary);
                padding: 2px 12px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border: 1px solid var(--border-color);
            }

            :host(.desktop) .canvas-viewport::before {
                display: none;
            }

            .canvas-viewport::after {
                content: attr(data-device-width);
                position: absolute;
                top: -10px;
                right: 20px;
                background: var(--accent-color);
                color: white;
                padding: 2px 12px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 0.3px;
            }

            :host(.desktop) .canvas-viewport::after {
                display: none;
            }

            .canvas {
                outline: 2px solid transparent;
            }

            .canvas.canvas-selected {
                outline-color: var(--accent-color, #0078d4);
            }

            .canvas.canvas-empty .canvas-flow-container,
            .canvas-flow-container.flow-empty {
                height: 300px;
            }

            .canvas-flow-container > * {
                pointer-events: auto;
            }

            .canvas-placeholder {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--text-secondary);
                font-size: 13px;
                text-align: center;
                pointer-events: none;
            }

            .canvas-controls {
                position: absolute;
                bottom: calc(100% + 15px);
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
            }

            .toggle-button {
                border: 1px solid var(--border-color);
                background: var(--bg-primary);
                color: var(--text-secondary);
                font-size: 12px;
                border-radius: 6px;
                padding: 6px 10px;
                cursor: pointer;
                transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            }

            .toggle-button:hover {
                color: var(--text-primary);
            }

            .toggle-button[aria-pressed='true'] {
                background: var(--accent-color);
                border-color: var(--accent-color);
                color: #ffffff;
            }

            .snap-highlight {
                outline: 1px solid #ff4081 !important;
                outline-offset: 1px !important;
                box-shadow: 0 0 0 4px rgba(255, 64, 129, 0.15) !important;
                transition: none !important;
                z-index: 999;
            }

            .moveable-control-box .moveable-control.moveable-resizable {
                border: none;
                height: 4px;
                border-radius: 3px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction^=n] {
                margin-top: -4px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction^=s] {
                margin-top: 0;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=e] {
                margin-left: 0;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=w] {
                margin-left: -4px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=e],
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=w] {
                width: 4px;
                height: 14px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=ne],
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=se] {
                margin-left: -11px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=nw],
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=sw] {
                margin-left: -4px;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=ne]:before,
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=nw]:before,
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=se]:before,
            .moveable-control-box .moveable-control.moveable-resizable[data-direction=sw]:before {
                display: block;
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                background: var(--moveable-color);
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=ne]:before {
                transform-origin: top right;
                bottom: 0;
                right: 4px;
                rotate: 270deg;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=nw]:before {
                transform-origin: top left;
                bottom: 0;
                left: 4px;
                rotate: 90deg;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=se]:before {
                transform-origin: bottom right;
                bottom: 0;
                right: 4px;
                rotate: 90deg;
            }

            .moveable-control-box .moveable-control.moveable-resizable[data-direction=sw]:before {
                transform-origin: bottom left;
                bottom: 0;
                left: 4px;
                rotate: 270deg;
            }

            /* Snap guide lines - Default style */

            .moveable-guideline-group .moveable-line {
                border-style: dashed;
                border-width: 0;
                border-color: rgba(212, 28, 0, 0.55);
            }

            .moveable-guideline-group .moveable-line.moveable-horizontal {
                border-top-width: 1px;
            }

            .moveable-guideline-group .moveable-size-value.moveable-gap {
                background: rgb(197, 74, 55) !important;
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.18);
                white-space: nowrap;
                font-size: 10px;
                line-height: 1;
                padding: 2px 6px;
                border-radius: 4px;
                bottom: initial !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 3;
                font-weight: normal;
            }
        `];let vo=bo;go([c({context:f})],vo.prototype,"dragDropManager"),go([c({context:m})],vo.prototype,"blockRegistry"),go([i({type:String})],vo.prototype,"canvasId"),go([i({type:Boolean})],vo.prototype,"showPositionGuides"),go([i({type:Boolean})],vo.prototype,"showSnapGuides"),go([s()],vo.prototype,"isCanvasSelected"),go([s()],vo.prototype,"showContextualBlockToolbar"),go([s()],vo.prototype,"showControls"),Bt.define("builder-canvas",vo);var yo=Object.defineProperty,mo=Object.getOwnPropertyDescriptor,fo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?mo(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&yo(t,i,a),a};const xo=((e=class extends o{constructor(){super(...arguments),this.hassProvider=new v(this,{context:V}),this.theme="light",this.documentModel=new L,this.blockRegistry=S,this.deviceManager=new O,this.eventBus=new T,this.devices=[],this.activeDeviceId="desktop",this.canvasElement=null,this.styleResolverReady=!1,this.slotManagerOpen=!1,this._showPositionGuides=!0,this._showSnapGuides=!0}set hass(e){this._hass=e,this.styleResolver&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator()),this.hassProvider.setValue(e)}async connectedCallback(){super.connectedCallback(),this._loadCanvasGuidePreferences(),this.dragDropManager=new A,await this._initializeStyleResolver(),this.documentModel.addEventListener("change",e=>{this._notifyConfigChange(e.detail),e.detail.block&&this.styleResolver&&this.styleResolver.invalidate({level:"block",blockId:e.detail.block.id})}),this.devices=this.deviceManager.getDevices(),this.activeDeviceId=this.deviceManager.getActiveDevice().id,this.deviceManager.on("device-changed",e=>{this.activeDeviceId=e.deviceId,this.requestUpdate()}),this.deviceManager.on("devices-updated",()=>{this.devices=this.deviceManager.getDevices(),this.requestUpdate()}),this.eventBus.addEventListener("canvas-size-changed",({width:e,height:t})=>this._onCanvasSizeChanged(e,t))}async firstUpdated(){var e;await this.updateComplete,this.canvasElement=null==(e=this.shadowRoot)?void 0:e.querySelector("#builder-canvas")}updated(e){super.updated(e),e.has("hass")&&this._hass&&this.styleResolver&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator())}disconnectedCallback(){var e;super.disconnectedCallback(),null==(e=this.dragDropManager)||e.destroy()}render(){return this.styleResolverReady&&this._hass?r`
            <div class="builder-container">
                <div class="builder-body">
                    <aside class="sidebar sidebar-left">
                        <sidebar-left></sidebar-left>
                    </aside>
                    <div class="builder-center">
                        ${this._renderHeader()}
                        <div class="builder-center-scroll">
                            ${this._renderCanvas()}
                        </div>
                    </div>
                    <aside class="sidebar sidebar-right">
                        <sidebar-right
                                .canvasWidth=${this.canvasWidth}
                                .canvasHeight=${this.canvasHeight}
                                .canvas=${this.canvasElement}
                                .hass=${this._hass}
                        ></sidebar-right>
                    </aside>
                </div>
            </div>
            <entity-slots-editor-overlay
                    .open=${this.slotManagerOpen}
                    .hass=${this._hass}
                    @overlay-close=${()=>{this.slotManagerOpen=!1}}
                    @slot-reference-navigate=${this._handleSlotReferenceNavigate}
            ></entity-slots-editor-overlay>
        `:r``}_renderHeader(){return r`
            <header class="builder-header">
                <div class="builder-header-left">
                    <button
                            class="header-toggle ${this.slotManagerOpen?"active":""}"
                            @click=${this._toggleSlotManager}
                            title="Manage slots"
                            aria-pressed=${this.slotManagerOpen?"true":"false"}
                    >
                        Slots
                    </button>
                </div>
                <div class="builder-header-center">
                    <device-selector
                            .devices=${this.devices}
                            .activeDeviceId=${this.activeDeviceId}
                            @device-change=${this._onDeviceChange}
                    ></device-selector>
                </div>
            </header>
        `}_renderCanvas(){const e=this.deviceManager.getActiveDevice(),t=null===((null==e?void 0:e.width)??null);return r`
            <builder-canvas
                    id="builder-canvas"
                    class="${t?"desktop":""}"
                    .canvasId=${"main-canvas"}
                    .showPositionGuides=${this._showPositionGuides}
                    .showSnapGuides=${this._showSnapGuides}
                    @position-guides-preference-changed=${this._onPositionGuidesPreferenceChanged}
                    @snap-guides-preference-changed=${this._onSnapGuidesPreferenceChanged}
            ></builder-canvas>
        `}loadConfig(e){e&&"object"==typeof e&&this.documentModel.loadFromConfig(e)}exportConfig(){return this.documentModel.exportToConfig()}clearDocument(){this.documentModel.clear()}async _initializeStyleResolver(){try{const e=await C(this._hass);this.styleResolver=new H(this.documentModel,e,this.blockRegistry,{enableCache:!0,evaluateBindings:!0}),this._hass&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator()),this.styleResolverReady=!0}catch(e){console.error("[BuilderMain] Failed to initialize StyleResolver:",e)}}_toggleSlotManager(){this.slotManagerOpen=!this.slotManagerOpen}_loadCanvasGuidePreferences(){const t=localStorage.getItem(e.POSITION_GUIDES_STORAGE_KEY);null!==t&&(this._showPositionGuides="true"===t);const i=localStorage.getItem(e.SNAP_GUIDES_STORAGE_KEY);null!==i&&(this._showSnapGuides="true"===i)}_onPositionGuidesPreferenceChanged(t){this._showPositionGuides=t.detail.status,localStorage.setItem(e.POSITION_GUIDES_STORAGE_KEY,String(this._showPositionGuides))}_onSnapGuidesPreferenceChanged(t){this._showSnapGuides=t.detail.status,localStorage.setItem(e.SNAP_GUIDES_STORAGE_KEY,String(this._showSnapGuides))}_onCanvasSizeChanged(e,t){this.canvasWidth=e,this.canvasHeight=t}_onDeviceChange(e){const{deviceId:t}=e.detail;this.deviceManager.setActiveDevice(t)}async _handleSlotReferenceNavigate(e){const{reference:t}=e.detail;if(this.slotManagerOpen=!1,this.documentModel.select(t.blockId),"style-binding"===t.kind)return this._openSidebarTab("styles"),void(await this._openStyleBinding(t));this._openSidebarTab("properties"),"trait-binding"===t.kind&&await this._openTraitBinding(t)}_openSidebarTab(e){const t=this._getSidebarTabbed();(null==t?void 0:t.setActiveTab)&&t.setActiveTab(e)}_getSidebarTabbed(){var e,t;const i=null==(e=this.shadowRoot)?void 0:e.querySelector("sidebar-right");return null==(t=null==i?void 0:i.shadowRoot)?void 0:t.querySelector("sidebar-tabbed")}async _openStyleBinding(e){var t,i;if(!e.category||!e.property)return;await new Promise(e=>requestAnimationFrame(e));const o=null==(i=null==(t=this._getSidebarTabbed())?void 0:t.shadowRoot)?void 0:i.querySelector("panel-styles");o&&o.openBindingEditor&&o.openBindingEditor(e.category,e.property,e.property,e.styleSlotId??null)}async _openTraitBinding(e){var t,i;if(!e.propName)return;await new Promise(e=>requestAnimationFrame(e));const o=null==(i=null==(t=this._getSidebarTabbed())?void 0:t.shadowRoot)?void 0:i.querySelector("panel-properties");(null==o?void 0:o.openTraitBindingEditor)&&o.openTraitBindingEditor(e.propName)}_createBindingEvaluator(){return new w(this._hass,{resolveSlotEntity:e=>this.documentModel.resolveSlotEntity(e)})}_notifyConfigChange(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:e,bubbles:!0,composed:!0}))}}).styles=t`
        :host {
            --sidebar-width: 260px;
            --header-height: 48px;
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --bg-tertiary: #e8e8e8;
            --border-color: #d4d4d4;
            --text-primary: #333333;
            --text-secondary: #666666;
            --accent-color: #0078d4;
            display: block;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        :host([theme='dark']) {
            --bg-primary: #1e1e1e;
            --bg-secondary: #252526;
            --bg-tertiary: #2d2d2d;
            --border-color: #3c3c3c;
            --text-primary: #cccccc;
            --text-secondary: #969696;
        }

        /* Global Moveable styles */

        :host ::slotted(*),
        * {
            --moveable-color: var(--accent-color);
        }

        .builder-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: var(--bg-primary);
            color: var(--text-primary);
        }

        .builder-center {
            display: flex;
            flex: 1 1 0;
            flex-direction: column;
            min-width: 0;
            overflow: hidden;
        }

        .builder-center-scroll {
            flex: 1 1 auto;
            overflow: auto;
            padding: 40px;
            background: var(--bg-tertiary);
            display: flex;
        }

        .builder-header {
            height: var(--header-height);
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            gap: 16px;
            box-sizing: border-box;
        }

        .builder-header-center {
            flex: 1;
            display: flex;
            justify-content: center;
        }

        .builder-header-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .builder-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .header-toggle {
            padding: 6px 10px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.2px;
            text-transform: uppercase;
            border-radius: 4px;
            cursor: pointer;
            transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
        }

        .header-toggle.active {
            border-color: var(--accent-color);
            color: var(--accent-color);
            background: rgba(0, 120, 212, 0.08);
        }

        .builder-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .sidebar {
            width: var(--sidebar-width);
            flex: 0 0 var(--sidebar-width);
            background: var(--cb-sidebar-background);
            border-right: 1px solid var(--border-color);
            overflow: hidden;
        }

        .sidebar-right {
            width: auto;
            flex: 0 0 auto;
            border-right: none;
            border-left: 1px solid var(--border-color);
        }
    `,e.POSITION_GUIDES_STORAGE_KEY="card-builder-position-guides",e.SNAP_GUIDES_STORAGE_KEY="card-builder-snap-guides",e);fo([i({type:String,reflect:!0})],xo.prototype,"theme",2),fo([y({context:f})],xo.prototype,"dragDropManager",2),fo([y({context:x})],xo.prototype,"documentModel",2),fo([y({context:m})],xo.prototype,"blockRegistry",2),fo([s(),y({context:z})],xo.prototype,"deviceManager",2),fo([y({context:D})],xo.prototype,"styleResolver",2),fo([y({context:M})],xo.prototype,"eventBus",2),fo([s()],xo.prototype,"devices",2),fo([s()],xo.prototype,"activeDeviceId",2),fo([s()],xo.prototype,"canvasWidth",2),fo([s()],xo.prototype,"canvasHeight",2),fo([s()],xo.prototype,"canvasElement",2),fo([s()],xo.prototype,"styleResolverReady",2),fo([s()],xo.prototype,"slotManagerOpen",2),fo([i({attribute:!1})],xo.prototype,"hass",1);let _o=xo;Bt.define("builder-main",_o);const ko="card-builder",wo={DASHBOARD:"dashboard",CARDS:"cards",EDITOR_CREATE:"editor/create",EDITOR_EDIT:"editor/edit"};class $o extends EventTarget{constructor(){super(),this.currentRoute=wo.DASHBOARD,this.currentParams={},this._initialize()}navigate(e,t){this.currentRoute=e,this.currentParams=t||{};const i=`/${ko}/${e}${t?"?"+new URLSearchParams(t).toString():""}`;window.history.pushState({route:e,params:t},"",i),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.currentRoute,params:this.currentParams}}))}getCurrentRoute(){return{route:this.currentRoute,params:{...this.currentParams}}}parseRoute(e){let t=e.startsWith("/")?e.substring(1):e;if(e.startsWith(ko)&&(t=e.substring(12)),t=t.replace(/^\/+/,""),!t)return{route:wo.DASHBOARD,params:{}};const i=new URLSearchParams(t),o=Object.values(wo);for(const r of o)if(t===r)return{route:r,params:Object.fromEntries(i)};return{route:wo.DASHBOARD,params:{}}}_initialize(){window.addEventListener("popstate",()=>{this._handleLocationChange()}),this._handleLocationChange()}_handleLocationChange(){const e=window.location.pathname,t=this.parseRoute(e);this.currentRoute=t.route,this.currentParams=t.params,this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.currentRoute,params:this.currentParams}}))}}let So=null;function Co(){return So||(So=new $o),So}var Io=Object.defineProperty,Eo=Object.getOwnPropertyDescriptor,Bo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Eo(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Io(t,i,a),a};let Po=class extends o{constructor(){super(...arguments),this.activeRoute="dashboard",this.collapsed=!1,this.isFullscreen=!1,this.narrow=!1,this.menuItems=[{id:wo.DASHBOARD,icon:"mdi:view-dashboard",label:"Dashboard"},{id:wo.CARDS,icon:"mdi:cards",label:"Cards"},{id:wo.EDITOR_CREATE,icon:"mdi:plus-circle",label:"New Card"}]}render(){return r`
      <div class="sidebar-content">
        <div class="sidebar-header">
          <div class="sidebar-title">Card Builder</div>
          <button
            class="toggle-button"
            @click=${this._toggleCollapse}
            title=${this.collapsed?"Expand sidebar":"Collapse sidebar"}
          >
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d=${this.collapsed?"M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z":"M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"} />
            </svg>
          </button>
        </div>

        <nav>
          <ul class="menu">
            ${this.menuItems.map(e=>this._renderMenuItem(e))}
          </ul>
        </nav>

        ${this.narrow?"":this._renderFooter()}
      </div>
    `}_renderMenuItem(e){const t=this.activeRoute===e.id;return r`
      <li
        class="menu-item ${t?"active":""}"
        @click=${()=>this._handleNavigate(e.id)}
        title=${this.collapsed?e.label:""}
      >
        <svg class="menu-item-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d=${this._getIconPath(e.icon)} />
        </svg>
        <span class="menu-item-label">${e.label}</span>
      </li>
    `}_renderFooter(){return this.isFullscreen?r`
        <div class="sidebar-footer">
          <button
            class="footer-button"
            @click=${this._handleExitDashboard}
            title=${this.collapsed?"Exit to dashboard":""}
          >
            <svg class="footer-button-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d=${this._getIconPath("mdi:home")} />
            </svg>
            <span class="footer-button-label">Exit to dashboard</span>
          </button>
          <button
            class="footer-button"
            @click=${this._handleToggleFullscreen}
            title=${this.collapsed?"Exit fullscreen":""}
          >
            <svg class="footer-button-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d=${this._getIconPath("mdi:fullscreen-exit")} />
            </svg>
            <span class="footer-button-label">Exit fullscreen</span>
          </button>
        </div>
      `:r`
        <div class="sidebar-footer">
          <button
            class="footer-button"
            @click=${this._handleToggleFullscreen}
            title=${this.collapsed?"Enter fullscreen":""}
          >
            <svg class="footer-button-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d=${this._getIconPath("mdi:fullscreen")} />
            </svg>
            <span class="footer-button-label">Enter fullscreen</span>
          </button>
        </div>
      `}_getIconPath(e){return{"mdi:view-dashboard":"M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z","mdi:cards":"M21.47 4.35L20.13 3.79V12.82L22.56 6.96C22.97 5.94 22.5 4.77 21.47 4.35M1.97 8.05L6.93 20C7.24 20.77 7.97 21.24 8.74 21.26C9 21.26 9.27 21.21 9.53 21.1L16.9 18.05C17.65 17.74 18.11 17 18.13 16.26C18.14 16 18.09 15.71 18 15.45L13.07 3.5C12.75 2.73 12 2.26 11.26 2.25C11 2.25 10.73 2.3 10.47 2.4L3.1 5.45C2.35 5.76 1.89 6.5 1.87 7.24C1.86 7.5 1.91 7.78 2 8.05M10.1 4.58L14.96 16.29L7.58 19.35L2.72 7.64L10.1 4.58Z","mdi:plus-circle":"M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z","mdi:fullscreen":"M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z","mdi:fullscreen-exit":"M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z","mdi:home":"M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"}[e]||""}_toggleCollapse(){this.collapsed=!this.collapsed}_handleNavigate(e){this.dispatchEvent(new CustomEvent("navigate",{detail:{route:e}}))}_handleToggleFullscreen(){this.dispatchEvent(new CustomEvent("toggle-fullscreen"))}_handleExitDashboard(){this.dispatchEvent(new CustomEvent("exit-dashboard"))}};Po.styles=t`
    :host {
      display: block;
      height: 100%;
      width: 200px;
      background-color: var(--sidebar-background-color, var(--card-background-color));
      border-right: 1px solid var(--divider-color);
      transition: width 0.3s ease;
      overflow: hidden;
    }

    :host([collapsed]) {
      width: 56px;
    }

    .sidebar-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid var(--divider-color);
      box-sizing: border-box;
      height: calc(var(--header-height) + var(--safe-area-inset-top, var(--ha-space-0)))
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.3s ease;
    }
      
    :host([collapsed]) .sidebar-header {
        justify-content: center;
    }  

    :host([collapsed]) .sidebar-title {
      opacity: 0;
      width: 0;
    }

    .toggle-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .toggle-button:hover {
      background-color: var(--secondary-background-color);
    }

    .menu {
      list-style: none;
      margin: 0;
      padding: 8px 0;
      flex: 1;
      overflow-y: auto;
    }

    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      color: var(--primary-text-color);
      text-decoration: none;
      transition: background-color 0.2s ease;
    }

    .menu-item.active {
      background-color: var(--primary-color);
      color: var(--text-primary-color, white);
    }

    .menu-item-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      margin-right: 12px;
      transition: margin-right 0.3s ease;
    }

    :host([collapsed]) .menu-item-icon {
      margin-right: 0;
    }

    .menu-item-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.3s ease;
    }

    :host([collapsed]) .menu-item-label {
      opacity: 0;
      width: 0;
    }

    .icon {
      width: 24px;
      height: 24px;
    }

    .sidebar-footer {
      border-top: 1px solid var(--divider-color);
      padding: 8px 0;
    }

    .footer-button {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      color: var(--primary-text-color);
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      transition: background-color 0.2s ease;
    }

    .footer-button:hover {
      background-color: var(--secondary-background-color);
    }

    .footer-button-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      margin-right: 12px;
      transition: margin-right 0.3s ease;
    }

    :host([collapsed]) .footer-button-icon {
      margin-right: 0;
    }

    .footer-button-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.3s ease;
    }

    :host([collapsed]) .footer-button-label {
      opacity: 0;
      width: 0;
    }
  `,Bo([i({attribute:!1})],Po.prototype,"hass",2),Bo([i({type:String})],Po.prototype,"activeRoute",2),Bo([i({type:Boolean,reflect:!0})],Po.prototype,"collapsed",2),Bo([i({type:Boolean})],Po.prototype,"isFullscreen",2),Bo([i({type:Boolean})],Po.prototype,"narrow",2),Po=Bo([a("global-sidebar")],Po);var zo=Object.defineProperty,Do=Object.getOwnPropertyDescriptor,Mo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Do(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&zo(t,i,a),a};let Ro=class extends o{constructor(){super(...arguments),this.currentRoute="dashboard",this.hideSidebar=!1,this.isFullscreen=!1,this.narrow=!1}render(){return r`
            ${this.hideSidebar?"":r`
                <div class="sidebar-container">
                    <global-sidebar
                            .hass=${this.hass}
                            .activeRoute=${this.currentRoute}
                            ?isFullscreen=${this.isFullscreen}
                            ?narrow=${this.narrow}
                            @navigate=${this._handleNavigate}
                            @toggle-fullscreen=${this._handleToggleFullscreen}
                            @exit-dashboard=${this._handleExitDashboard}
                    ></global-sidebar>
                </div>
            `}

            <div class="content-area">
                <slot></slot>
            </div>
        `}_handleNavigate(e){this.dispatchEvent(new CustomEvent("navigate",{detail:e.detail}))}_handleToggleFullscreen(){this.dispatchEvent(new CustomEvent("toggle-fullscreen"))}_handleExitDashboard(){this.dispatchEvent(new CustomEvent("exit-dashboard"))}};Ro.styles=t`
        :host {
            display: flex;
            height: 100vh;
            width: 100%;
            background-color: var(--primary-background-color);
            overflow: hidden;
        }

        .sidebar-container {
            flex-shrink: 0;
            height: 100%;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }

        :host([hideSidebar]) .sidebar-container {
            transform: translateX(-100%);
            opacity: 0;
            pointer-events: none;
            position: absolute;
        }

        .content-area {
            flex: 1;
            height: 100%;
            overflow: auto;
            transition: margin-left 0.3s ease;
        }

        :host([hideSidebar]) .content-area {
            margin-left: 0;
        }

        /* Scrollbar styling for dark/light mode */

        .content-area::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        .content-area::-webkit-scrollbar-track {
            background: var(--primary-background-color);
        }

        .content-area::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb-color);
            border-radius: 4px;
        }

        .content-area::-webkit-scrollbar-thumb:hover {
            background: var(--primary-color);
        }
    `,Mo([i({attribute:!1})],Ro.prototype,"hass",2),Mo([i({type:String})],Ro.prototype,"currentRoute",2),Mo([i({type:Boolean,reflect:!0})],Ro.prototype,"hideSidebar",2),Mo([i({type:Boolean})],Ro.prototype,"isFullscreen",2),Mo([i({type:Boolean})],Ro.prototype,"narrow",2),Ro=Mo([a("app-layout")],Ro);var Vo=Object.defineProperty,Lo=Object.getOwnPropertyDescriptor,Oo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Lo(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Vo(t,i,a),a};let To=class extends o{constructor(){super(...arguments),this.cards=[],this.loading=!0,this.error=null,this.router=Co()}connectedCallback(){super.connectedCallback(),this.hass&&(this.cardsService=j(this.hass),this._loadCards(),this._subscribeToUpdates())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}updated(e){e.has("hass")&&this.hass&&!this.cardsService&&(this.cardsService=j(this.hass),this._loadCards(),this._subscribeToUpdates())}render(){if(this.loading)return this._renderLoading();if(this.error)return this._renderError();const e=this._getStats();return r`
      <div class="dashboard-header">
        <h1 class="dashboard-title">Card Builder Dashboard</h1>
        <p class="dashboard-subtitle">Manage and create your custom cards</p>
      </div>

      ${this._renderStats(e)}
      ${this._renderQuickActions()}
      ${this._renderRecentCards()}
    `}_renderStats(e){return r`
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Cards</div>
          <div class="stat-value">${e.total}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Recently Modified</div>
          <div class="stat-value">${e.recentlyModified}</div>
          <div class="stat-subtitle">Last 7 days</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Last Created</div>
          <div class="stat-value">
            ${e.lastCreated?e.lastCreated.name:"None"}
          </div>
          ${e.lastCreated?r`
            <div class="stat-subtitle">
              ${this._formatDate(e.lastCreated.created_at)}
            </div>
          `:""}
        </div>
      </div>
    `}_renderQuickActions(){return r`
      <div class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-button" @click=${this._handleCreateNew}>
            <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span class="action-label">Create New Card</span>
          </button>

          <button class="action-button secondary" @click=${this._handleViewAll}>
            <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.47 4.35L20.13 3.79V12.82L22.56 6.96C22.97 5.94 22.5 4.77 21.47 4.35M1.97 8.05L6.93 20C7.24 20.77 7.97 21.24 8.74 21.26C9 21.26 9.27 21.21 9.53 21.1L16.9 18.05C17.65 17.74 18.11 17 18.13 16.26C18.14 16 18.09 15.71 18 15.45L13.07 3.5C12.75 2.73 12 2.26 11.26 2.25C11 2.25 10.73 2.3 10.47 2.4L3.1 5.45C2.35 5.76 1.89 6.5 1.87 7.24C1.86 7.5 1.91 7.78 2 8.05M10.1 4.58L14.96 16.29L7.58 19.35L2.72 7.64L10.1 4.58Z" />
            </svg>
            <span class="action-label">View All Cards</span>
          </button>
        </div>
      </div>
    `}_renderRecentCards(){const e=this._getRecentCards(5);return 0===e.length?r`
        <div class="recent-cards">
          <h2 class="section-title">Recent Cards</h2>
          <div class="empty-state">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.47 4.35L20.13 3.79V12.82L22.56 6.96C22.97 5.94 22.5 4.77 21.47 4.35M1.97 8.05L6.93 20C7.24 20.77 7.97 21.24 8.74 21.26C9 21.26 9.27 21.21 9.53 21.1L16.9 18.05C17.65 17.74 18.11 17 18.13 16.26C18.14 16 18.09 15.71 18 15.45L13.07 3.5C12.75 2.73 12 2.26 11.26 2.25C11 2.25 10.73 2.3 10.47 2.4L3.1 5.45C2.35 5.76 1.89 6.5 1.87 7.24C1.86 7.5 1.91 7.78 2 8.05M10.1 4.58L14.96 16.29L7.58 19.35L2.72 7.64L10.1 4.58Z" />
            </svg>
            <h3 class="empty-state-title">No cards yet</h3>
            <p class="empty-state-text">Get started by creating your first card</p>
            <button class="action-button" @click=${this._handleCreateNew}>
              <svg class="action-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <span class="action-label">Create New Card</span>
            </button>
          </div>
        </div>
      `:r`
      <div class="recent-cards">
        <h2 class="section-title">Recent Cards</h2>
        <ul class="cards-list">
          ${e.map(e=>this._renderCardItem(e))}
        </ul>
      </div>
    `}_renderCardItem(e){return r`
      <li class="card-item">
        <div class="card-info">
          <h3 
            class="card-name"
            @click=${()=>this._handleEditCard(e.id)}
          >${e.name}
          </h3>
          <div class="card-meta">
            ${e.description||"No description"} • 
            Updated ${this._formatDate(e.updated_at)}
          </div>
        </div>
        <div class="card-actions">
          <button
            class="icon-button"
            @click=${()=>this._handleEditCard(e.id)}
            title="Edit card"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
            </svg>
          </button>
          <button
            class="icon-button delete"
            @click=${()=>this._handleDeleteCard(e.id)}
            title="Delete card"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </button>
        </div>
      </li>
    `}_renderLoading(){return r`
      <div class="loading">
        <div class="spinner"></div>
        <div>Loading dashboard...</div>
      </div>
    `}_renderError(){return r`
      <div class="error-message">
        <strong>Error:</strong> ${this.error}
      </div>
      <button class="action-button" @click=${this._loadCards}>
        Retry
      </button>
    `}async _loadCards(){if(this.cardsService){this.loading=!0,this.error=null;try{this.cards=await this.cardsService.listCards()}catch(e){console.error("Failed to load cards:",e),this.error="Failed to load cards. Please try again."}finally{this.loading=!1}}}async _subscribeToUpdates(){if(this.cardsService)try{this.unsubscribe=await this.cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(e){console.error("Failed to subscribe to updates:",e)}}_getStats(){const e=this.cards.length,t=new Date;t.setDate(t.getDate()-7);return{total:e,recentlyModified:this.cards.filter(e=>new Date(e.updated_at)>=t).length,lastCreated:[...this.cards].sort((e,t)=>new Date(t.created_at).getTime()-new Date(e.created_at).getTime())[0]||null}}_getRecentCards(e){return[...this.cards].sort((e,t)=>new Date(t.updated_at).getTime()-new Date(e.updated_at).getTime()).slice(0,e)}_formatDate(e){const t=new Date(e),i=(new Date).getTime()-t.getTime(),o=Math.floor(i/6e4),r=Math.floor(i/36e5),a=Math.floor(i/864e5);return o<1?"just now":o<60?`${o} min ago`:r<24?`${r} hours ago`:a<7?`${a} days ago`:t.toLocaleDateString()}_handleViewAll(){this.router.navigate(wo.CARDS)}_handleCreateNew(){this.router.navigate(wo.EDITOR_CREATE)}_handleEditCard(e){this.router.navigate(wo.EDITOR_EDIT,{id:e})}async _handleDeleteCard(e){if(!this.cardsService)return;const t=this.cards.find(t=>t.id===e);if(t&&confirm(`Are you sure you want to delete "${t.name}"?`))try{await this.cardsService.deleteCard(e)}catch(i){console.error("Failed to delete card:",i),alert("Failed to delete card. Please try again.")}}};To.styles=t`
    :host {
      display: block;
      padding: 24px;
      background-color: var(--primary-background-color);
      min-height: 100%;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-title {
      font-size: 32px;
      font-weight: 300;
      color: var(--primary-text-color);
      margin: 0 0 8px 0;
    }

    .dashboard-subtitle {
      font-size: 14px;
      color: var(--secondary-text-color);
      margin: 0;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .stat-label {
      font-size: 14px;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 300;
      color: var(--primary-text-color);
      margin: 0;
    }

    .stat-subtitle {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 8px;
    }

    /* Quick Actions */
    .quick-actions {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    .section-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin: 0 0 16px 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s ease, opacity 0.2s ease;
      text-decoration: none;
      font-family: inherit;
    }

    .action-button:hover {
      transform: scale(1.05);
      opacity: 0.9;
    }

    .action-button.secondary {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }

    .action-label {
      font-size: 16px;
      font-weight: 500;
    }

    /* Recent Cards */
    .recent-cards {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    .cards-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .card-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--divider-color);
      transition: background-color 0.2s ease;
    }

    .card-item:last-child {
      border-bottom: none;
    }

    .card-info {
      flex: 1;
      min-width: 0;
    }

    .card-name {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .card-name:hover {
      text-decoration: underline;
      cursor: pointer;
      color: var(--primary-color);
    }

    .card-meta {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .card-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .icon-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--primary-text-color);
      border-radius: 4px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-button:hover {
      background-color: var(--secondary-background-color);
    }

    .icon-button.delete {
      color: var(--error-color);
    }

    .icon {
      width: 20px;
      height: 20px;
    }

    /* Loading State */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      color: var(--secondary-text-color);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 64px 16px;
      color: var(--secondary-text-color);
    }

    .empty-state-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      opacity: 0.3;
    }

    .empty-state-title {
      font-size: 20px;
      color: var(--primary-text-color);
      margin: 0 0 8px 0;
    }

    .empty-state-text {
      font-size: 14px;
      margin: 0 0 24px 0;
    }

    /* Error State */
    .error-message {
      background: var(--error-color);
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      :host {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `,Oo([i({attribute:!1})],To.prototype,"hass",2),Oo([s()],To.prototype,"cards",2),Oo([s()],To.prototype,"loading",2),Oo([s()],To.prototype,"error",2),To=Oo([a("dashboard-view")],To);var Ao=Object.defineProperty,Ho=Object.getOwnPropertyDescriptor,jo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ho(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ao(t,i,a),a};let No=class extends o{constructor(){super(...arguments),this.cards=[],this.filteredCards=[],this.loading=!0,this.searchQuery="",this.sortColumn="updated_at",this.sortDirection="desc",this.currentPage=1,this.pageSize=10,this.deleteConfirmId=null,this.error=null,this.showImportDialog=!1,this.importMethod="paste",this.importJsonText="",this.importData=null,this.importError=null,this.importName="",this.importDescription="",this.isImporting=!1,this.router=Co()}connectedCallback(){super.connectedCallback(),this.hass&&(this.cardsService=j(this.hass),this._loadCards(),this._subscribeToUpdates())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe(),this.searchTimeout&&clearTimeout(this.searchTimeout)}updated(e){e.has("hass")&&this.hass&&!this.cardsService&&(this.cardsService=j(this.hass),this._loadCards(),this._subscribeToUpdates())}render(){return this.loading?this._renderLoading():r`
      ${this.error?r`
        <div class="error-message">
          <strong>Error:</strong> ${this.error}
        </div>
      `:""}

      <div class="cards-header">
        <h1 class="cards-title">Cards</h1>
        <div class="header-actions">
          <button class="secondary-button" @click=${this._handleImportClick}>
            <svg class="icon-small" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L8,15H10.5V12H13.5V15H16L12,19Z" />
            </svg>
            Import Card
          </button>
          <button class="primary-button" @click=${this._handleCreateNew}>
            <svg class="icon-small" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            New Card
          </button>
        </div>
      </div>

      ${this._renderFilters()}
      ${0===this.filteredCards.length?this._renderEmptyState():this._renderTable()}
      ${this.filteredCards.length>0?this._renderPagination():""}
      ${this.deleteConfirmId?this._renderDeleteDialog():""}
      ${this.showImportDialog?this._renderImportDialog():""}
    `}_renderFilters(){return r`
      <div class="filters-bar">
        <input
          type="text"
          class="search-input"
          placeholder="Search by name or description..."
          .value=${this.searchQuery}
          @input=${this._handleSearchInput}
        />
        <select
          class="page-size-select"
          .value=${this.pageSize.toString()}
          @change=${this._handlePageSizeChange}
        >
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>
    `}_renderTable(){const e=(this.currentPage-1)*this.pageSize,t=e+this.pageSize,i=this.filteredCards.slice(e,t);return r`
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th
                class="sortable ${"name"===this.sortColumn?`sort-${this.sortDirection}`:""}"
                @click=${()=>this._handleSort("name")}
              >
                Name
              </th>
              <th>Description</th>
              <th
                class="sortable ${"updated_at"===this.sortColumn?`sort-${this.sortDirection}`:""}"
                @click=${()=>this._handleSort("updated_at")}
              >
                Modified
              </th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${i.map(e=>this._renderTableRow(e))}
          </tbody>
        </table>
      </div>
    `}_renderTableRow(e){return r`
      <tr>
        <td>
          <div 
              class="card-name"
              @click=${()=>this._handleEdit(e.id)}
          >${e.name}
          </div>
        </td>
        <td>
          <div class="card-description">
            ${e.description||r`<em>No description</em>`}
          </div>
        </td>
        <td>
          <div class="card-date">${this._formatDate(e.updated_at)}</div>
        </td>
        <td>
          <div class="actions-cell">
            <button
              class="icon-button"
              @click=${()=>this._handleEdit(e.id)}
              title="Edit card"
            >
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
              </svg>
            </button>
            <button
              class="icon-button delete"
              @click=${()=>this._handleDeleteClick(e.id)}
              title="Delete card"
            >
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `}_renderPagination(){const e=Math.ceil(this.filteredCards.length/this.pageSize),t=(this.currentPage-1)*this.pageSize+1,i=Math.min(this.currentPage*this.pageSize,this.filteredCards.length),o=[];let a=Math.max(1,this.currentPage-Math.floor(2.5)),s=Math.min(e,a+5-1);s-a<4&&(a=Math.max(1,s-5+1));for(let r=a;r<=s;r++)o.push(r);return r`
      <div class="pagination">
        <div class="pagination-info">
          Showing ${t}-${i} of ${this.filteredCards.length}
        </div>
        <div class="pagination-controls">
          <button
            class="page-button"
            @click=${()=>this._goToPage(this.currentPage-1)}
            ?disabled=${1===this.currentPage}
          >
            ‹
          </button>
          ${o.map(e=>r`
            <button
              class="page-button ${e===this.currentPage?"active":""}"
              @click=${()=>this._goToPage(e)}
            >
              ${e}
            </button>
          `)}
          <button
            class="page-button"
            @click=${()=>this._goToPage(this.currentPage+1)}
            ?disabled=${this.currentPage===e}
          >
            ›
          </button>
        </div>
      </div>
    `}_renderLoading(){return r`
      <div class="loading">
        <div class="spinner"></div>
        <div>Loading cards...</div>
      </div>
    `}_renderEmptyState(){return this.searchQuery?r`
        <div class="table-container">
          <div class="empty-state">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
            <h3 class="empty-state-title">No cards found</h3>
            <p class="empty-state-text">Try adjusting your search query</p>
          </div>
        </div>
      `:r`
      <div class="table-container">
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.47 4.35L20.13 3.79V12.82L22.56 6.96C22.97 5.94 22.5 4.77 21.47 4.35M1.97 8.05L6.93 20C7.24 20.77 7.97 21.24 8.74 21.26C9 21.26 9.27 21.21 9.53 21.1L16.9 18.05C17.65 17.74 18.11 17 18.13 16.26C18.14 16 18.09 15.71 18 15.45L13.07 3.5C12.75 2.73 12 2.26 11.26 2.25C11 2.25 10.73 2.3 10.47 2.4L3.1 5.45C2.35 5.76 1.89 6.5 1.87 7.24C1.86 7.5 1.91 7.78 2 8.05M10.1 4.58L14.96 16.29L7.58 19.35L2.72 7.64L10.1 4.58Z" />
          </svg>
          <h3 class="empty-state-title">No cards yet</h3>
          <p class="empty-state-text">Get started by creating your first card</p>
          <button class="primary-button" @click=${this._handleCreateNew}>
            <svg class="icon-small" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            Create New Card
          </button>
        </div>
      </div>
    `}_renderDeleteDialog(){if(!this.deleteConfirmId)return null;const e=this.cards.find(e=>e.id===this.deleteConfirmId);return e?r`
      <div class="dialog-overlay" @click=${this._cancelDelete}>
        <div class="dialog" @click=${e=>e.stopPropagation()}>
          <h2 class="dialog-header">Delete Card</h2>
          <div class="dialog-content">
            Are you sure you want to delete <strong>"${e.name}"</strong>?
            This action cannot be undone.
          </div>
          <div class="dialog-actions">
            <button class="secondary-button" @click=${this._cancelDelete}>
              Cancel
            </button>
            <button class="danger-button" @click=${this._confirmDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    `:null}_renderImportDialog(){const e=null!==this.importData&&!this.importError&&""!==this.importName.trim();return r`
      <div class="dialog-overlay" @click=${this._handleCloseImport}>
        <div class="dialog import-dialog" @click=${e=>e.stopPropagation()}>
          <h2 class="dialog-header">Import Card</h2>
          
          <div class="dialog-content">
            <!-- Tabs -->
            <div class="import-tabs">
              <button
                class="import-tab ${"paste"===this.importMethod?"active":""}"
                @click=${()=>this._handleImportMethodChange("paste")}
              >
                <svg class="icon-small" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                  <path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z" />
                </svg>
                Paste JSON
              </button>
              <button
                class="import-tab ${"file"===this.importMethod?"active":""}"
                @click=${()=>this._handleImportMethodChange("file")}
              >
                <svg class="icon-small" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L8,15H10.5V12H13.5V15H16L12,19Z" />
                </svg>
                Upload File
              </button>
            </div>

            <!-- Paste JSON -->
            ${"paste"===this.importMethod?r`
              <textarea
                class="import-textarea"
                placeholder="Paste your card JSON here..."
                .value=${this.importJsonText}
                @input=${this._handleJsonInput}
              ></textarea>
            `:""}

            <!-- File Upload -->
            ${"file"===this.importMethod?r`
              <div
                class="file-upload-area"
                @click=${this._handleFileClick}
                @dragover=${this._handleDragOver}
                @dragleave=${this._handleDragLeave}
                @drop=${this._handleFileDrop}
              >
                <svg class="file-upload-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L8,15H10.5V12H13.5V15H16L12,19Z" />
                </svg>
                <div class="file-upload-text">Click to select or drag and drop</div>
                <div class="file-upload-hint">JSON files only</div>
              </div>
              <input
                type="file"
                class="file-input"
                accept=".json"
                @change=${this._handleFileSelect}
              />
            `:""}

            <!-- Error Display -->
            ${this.importError?r`
              <div class="error-box">
                ${this.importError}
              </div>
            `:""}

            <!-- Success / Form Fields -->
            ${this.importData&&!this.importError?r`
              <div class="success-box">
                ✓ JSON is valid and ready to import
              </div>

              <div class="form-field">
                <label class="form-label">Card Name *</label>
                <input
                  type="text"
                  class="form-input"
                  .value=${this.importName}
                  @input=${this._handleNameInput}
                  placeholder="Enter card name"
                />
              </div>

              <div class="form-field">
                <label class="form-label">Description</label>
                <textarea
                  class="form-input form-textarea"
                  .value=${this.importDescription}
                  @input=${this._handleDescriptionInput}
                  placeholder="Enter card description (optional)"
                ></textarea>
              </div>
            `:""}
          </div>

          <div class="dialog-actions">
            <button class="secondary-button" @click=${this._handleCloseImport}>
              Cancel
            </button>
            <button
              class="primary-button"
              @click=${this._handleConfirmImport}
              ?disabled=${!e||this.isImporting}
            >
              ${this.isImporting?"Importing...":"Import Card"}
            </button>
          </div>
        </div>
      </div>
    `}async _loadCards(){if(this.cardsService){this.loading=!0,this.error=null;try{this.cards=await this.cardsService.listCards(),this._applyFilters()}catch(e){console.error("Failed to load cards:",e),this.error="Failed to load cards. Please try again."}finally{this.loading=!1}}}async _subscribeToUpdates(){if(this.cardsService)try{this.unsubscribe=await this.cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(e){console.error("Failed to subscribe to updates:",e)}}_applyFilters(){let e=[...this.cards];if(this.searchQuery){const t=this.searchQuery.toLowerCase();e=e.filter(e=>e.name.toLowerCase().includes(t)||e.description.toLowerCase().includes(t))}e.sort((e,t)=>{let i,o;return"name"===this.sortColumn?(i=e.name.toLowerCase(),o=t.name.toLowerCase()):(i=new Date(e.updated_at).getTime(),o=new Date(t.updated_at).getTime()),"asc"===this.sortDirection?i>o?1:-1:i<o?1:-1}),this.filteredCards=e;const t=Math.ceil(this.filteredCards.length/this.pageSize);this.currentPage>t&&t>0&&(this.currentPage=t)}_handleSearchInput(e){const t=e.target;this.searchQuery=t.value,this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=window.setTimeout(()=>{this._applyFilters(),this.currentPage=1},300)}_handleSort(e){this.sortColumn===e?this.sortDirection="asc"===this.sortDirection?"desc":"asc":(this.sortColumn=e,this.sortDirection="desc"),this._applyFilters()}_handlePageSizeChange(e){const t=e.target;this.pageSize=parseInt(t.value,10),this.currentPage=1,this._applyFilters()}_goToPage(e){const t=Math.ceil(this.filteredCards.length/this.pageSize);e>=1&&e<=t&&(this.currentPage=e)}_formatDate(e){const t=new Date(e),i=(new Date).getTime()-t.getTime(),o=Math.floor(i/6e4),r=Math.floor(i/36e5),a=Math.floor(i/864e5);return o<1?"just now":o<60?`${o} min ago`:r<24?`${r} hours ago`:a<7?`${a} days ago`:t.toLocaleDateString()}_handleCreateNew(){this.router.navigate(wo.EDITOR_CREATE)}_handleImportClick(){this.showImportDialog=!0,this.importMethod="paste",this.importJsonText="",this.importData=null,this.importError=null,this.importName="",this.importDescription="",this.isImporting=!1}_handleCloseImport(){this.showImportDialog=!1,this.importMethod="paste",this.importJsonText="",this.importData=null,this.importError=null,this.importName="",this.importDescription="",this.isImporting=!1}_handleImportMethodChange(e){this.importMethod=e,this.importJsonText="",this.importData=null,this.importError=null,this.importName="",this.importDescription=""}_handleJsonInput(e){const t=e.target;this.importJsonText=t.value,this._validateJson(t.value)}_handleFileClick(e){var t;const i=null==(t=e.currentTarget.parentElement)?void 0:t.querySelector(".file-input");i&&i.click()}_handleDragOver(e){e.preventDefault(),e.stopPropagation();e.currentTarget.classList.add("drag-over")}_handleDragLeave(e){e.preventDefault(),e.stopPropagation();e.currentTarget.classList.remove("drag-over")}_handleFileDrop(e){var t;e.preventDefault(),e.stopPropagation();e.currentTarget.classList.remove("drag-over");const i=null==(t=e.dataTransfer)?void 0:t.files;i&&i.length>0&&this._readFile(i[0])}_handleFileSelect(e){const t=e.target.files;t&&t.length>0&&this._readFile(t[0])}_readFile(e){if(!e.name.endsWith(".json"))return this.importError="Please select a JSON file",void(this.importData=null);const t=new FileReader;t.onload=e=>{var t;const i=null==(t=e.target)?void 0:t.result;this.importJsonText=i,this._validateJson(i)},t.onerror=()=>{this.importError="Failed to read file",this.importData=null},t.readAsText(e)}_validateJson(e){if(!e.trim())return this.importError=null,void(this.importData=null);try{const t=JSON.parse(e);if("object"!=typeof t||null===t)return this.importError="Invalid JSON: must be an object",void(this.importData=null);if(!t.config||"object"!=typeof t.config)return this.importError='Invalid card data: missing or invalid "config" field',void(this.importData=null);this.importData=t,this.importName=t.name||"",this.importDescription=t.description||"",this.importError=null}catch(t){this.importError=`Invalid JSON: ${t instanceof Error?t.message:"parsing error"}`,this.importData=null}}_handleNameInput(e){const t=e.target;this.importName=t.value}_handleDescriptionInput(e){const t=e.target;this.importDescription=t.value}async _handleConfirmImport(){if(this.importData&&this.cardsService&&this.importName.trim()){this.isImporting=!0;try{await this.cardsService.createCard({name:this.importName.trim(),description:this.importDescription.trim(),config:this.importData.config}),this._handleCloseImport(),await this._loadCards()}catch(e){console.error("Failed to import card:",e),this.importError=`Failed to import card: ${e instanceof Error?e.message:"unknown error"}`}finally{this.isImporting=!1}}}_handleEdit(e){this.router.navigate(wo.EDITOR_EDIT,{id:e})}_handleDeleteClick(e){this.deleteConfirmId=e}_cancelDelete(){this.deleteConfirmId=null}async _confirmDelete(){if(this.cardsService&&this.deleteConfirmId)try{await this.cardsService.deleteCard(this.deleteConfirmId),this.deleteConfirmId=null,await this._loadCards()}catch(e){console.error("Failed to delete card:",e),this.error="Failed to delete card. Please try again.",this.deleteConfirmId=null}}};No.styles=t`
    :host {
      display: block;
      padding: 24px;
      background-color: var(--primary-background-color);
      min-height: 100%;
    }

    .cards-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .cards-title {
      font-size: 32px;
      font-weight: 300;
      color: var(--primary-text-color);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .primary-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
    }

    .primary-button:hover {
      opacity: 0.9;
    }
    
    .secondary-button {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s ease;
      font-family: inherit;
    }

    .secondary-button:hover {
      background: var(--divider-color);
    }

    .secondary-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .icon-small {
      width: 20px;
      height: 20px;
    }

    /* Filters Bar */
    .filters-bar {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 10px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      font-family: inherit;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .page-size-select {
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
    }

    /* Table */
    .table-container {
      background: var(--card-background-color);
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: var(--secondary-background-color);
    }

    th {
      padding: 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    th:hover {
      background: var(--divider-color);
    }

    th.sortable::after {
      content: '';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      opacity: 0.3;
    }

    th.sort-asc::after {
      border-bottom: 6px solid var(--primary-text-color);
      opacity: 1;
    }

    th.sort-desc::after {
      border-top: 6px solid var(--primary-text-color);
      opacity: 1;
    }

    td {
      padding: 5px 10px;
      border-top: 1px solid var(--divider-color);
      color: var(--primary-text-color);
    }

    .card-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .card-name:hover {
      color: var(--primary-color);
      text-decoration: underline;
      cursor: pointer;
    }

    .card-description {
      font-size: 12px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 300px;
    }

    .card-date {
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .actions-cell {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .icon-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--primary-text-color);
      border-radius: 4px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-button:hover {
      background-color: var(--secondary-background-color);
    }

    .icon-button.delete {
      color: var(--error-color);
    }

    .icon {
      width: 20px;
      height: 20px;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--card-background-color);
      border-radius: 8px;
      margin-top: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      flex-wrap: wrap;
      gap: 16px;
    }

    .pagination-info {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .pagination-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .page-button {
      padding: 8px 12px;
      background: var(--primary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      cursor: pointer;
      color: var(--primary-text-color);
      font-size: 14px;
      transition: background-color 0.2s ease;
      min-width: 36px;
      font-family: inherit;
    }

    .page-button:hover:not(:disabled) {
      background: var(--secondary-background-color);
    }

    .page-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border-color: var(--primary-color);
    }

    /* Loading State */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      color: var(--secondary-text-color);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 64px 16px;
      color: var(--secondary-text-color);
    }

    .empty-state-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      opacity: 0.3;
    }

    .empty-state-title {
      font-size: 20px;
      color: var(--primary-text-color);
      margin: 0 0 8px 0;
    }

    .empty-state-text {
      font-size: 14px;
      margin: 0 0 24px 0;
    }

    /* Delete Dialog */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .dialog {
      background: var(--card-background-color, var(--primary-background-color));
      border-radius: 8px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12);
    }

    .import-dialog {
      max-width: 700px;
    }

    .dialog-header {
      font-size: 24px;
      font-weight: 400;
      margin: 0;
      padding: 24px 24px 16px;
      color: var(--primary-text-color);
    }

    .dialog-content {
      padding: 0 24px 24px;
      color: var(--primary-text-color);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid var(--divider-color);
    }

    .import-tabs {
      display: flex;
      gap: 0;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--divider-color);
    }

    .import-tab {
      flex: 1;
      padding: 12px 16px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text-color);
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .import-tab:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .import-tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .import-textarea {
      width: 100%;
      min-height: 200px;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      resize: vertical;
      box-sizing: border-box;
    }

    .import-textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .file-upload-area {
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      background: var(--secondary-background-color);
    }

    .file-upload-area:hover {
      border-color: var(--primary-color);
      background: var(--primary-background-color);
    }

    .file-upload-area.drag-over {
      border-color: var(--primary-color);
      background: var(--primary-color);
      opacity: 0.1;
    }

    .file-upload-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      color: var(--secondary-text-color);
    }

    .file-upload-text {
      color: var(--primary-text-color);
      font-size: 16px;
      margin-bottom: 8px;
    }

    .file-upload-hint {
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .file-input {
      display: none;
    }

    .selected-file {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 4px;
      margin-top: 12px;
    }

    .selected-file-icon {
      width: 32px;
      height: 32px;
      color: var(--primary-color);
    }

    .selected-file-info {
      flex: 1;
    }

    .selected-file-name {
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .selected-file-size {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .error-box {
      padding: 12px;
      background: var(--error-color, #f44336);
      color: white;
      border-radius: 4px;
      margin: 16px 0;
      font-size: 14px;
    }

    .success-box {
      padding: 12px;
      background: var(--success-color, #4caf50);
      color: white;
      border-radius: 4px;
      margin: 16px 0;
      font-size: 14px;
    }

    .form-field {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 500;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 14px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font-family: inherit;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .form-textarea {
      min-height: 80px;
      resize: vertical;
    }

    .danger-button {
      padding: 10px 20px;
      background: var(--error-color, #f44336);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
    }

    .danger-button:hover {
      opacity: 0.9;
    }

    .danger-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Error Message */
    .error-message {
      background: var(--error-color);
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      :host {
        padding: 16px;
      }

      .cards-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        width: 100%;
      }

      table {
        font-size: 12px;
      }

      th, td {
        padding: 12px 8px;
      }

      .card-description {
        display: none;
      }

      .pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-controls {
        justify-content: center;
      }
    }
  `,jo([i({attribute:!1})],No.prototype,"hass",2),jo([s()],No.prototype,"cards",2),jo([s()],No.prototype,"filteredCards",2),jo([s()],No.prototype,"loading",2),jo([s()],No.prototype,"searchQuery",2),jo([s()],No.prototype,"sortColumn",2),jo([s()],No.prototype,"sortDirection",2),jo([s()],No.prototype,"currentPage",2),jo([s()],No.prototype,"pageSize",2),jo([s()],No.prototype,"deleteConfirmId",2),jo([s()],No.prototype,"error",2),jo([s()],No.prototype,"showImportDialog",2),jo([s()],No.prototype,"importMethod",2),jo([s()],No.prototype,"importJsonText",2),jo([s()],No.prototype,"importData",2),jo([s()],No.prototype,"importError",2),jo([s()],No.prototype,"importName",2),jo([s()],No.prototype,"importDescription",2),jo([s()],No.prototype,"isImporting",2),No=jo([a("cards-list-view")],No);var Uo=Object.defineProperty,Fo=Object.getOwnPropertyDescriptor,Go=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Fo(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Uo(t,i,a),a};let Wo=class extends o{constructor(){super(...arguments),this.cardName="Untitled Card",this.cardDescription="",this.loading=!1,this.saving=!1,this.isDirty=!1,this.error=null,this.router=Co()}connectedCallback(){super.connectedCallback(),this.hass&&(this.cardsService=j(this.hass),this.cardId?this._loadCard():this._clearDocumentModel())}disconnectedCallback(){super.disconnectedCallback(),this.configChangeListener&&this.builderRef&&this.builderRef.removeEventListener("config-changed",this.configChangeListener),this._clearDocumentModel()}updated(e){e.has("hass")&&this.hass&&!this.cardsService&&(this.cardsService=j(this.hass),this.cardId&&this._loadCard()),e.has("cardId")&&(this.cardId?this._loadCard():(this.cardName="Untitled Card",this.cardDescription="",this.isDirty=!1,this._clearDocumentModel()))}firstUpdated(){this.configChangeListener=e=>{"load"!==e.detail.action&&this._markDirty()},this.builderRef&&this.builderRef.addEventListener("config-changed",this.configChangeListener)}render(){return r`
      ${this.error?this._renderError():""}
      ${this._renderHeader()}
      <div class="builder-container">
        <builder-main
          .theme=${this._getTheme()}
          .hass=${this.hass}
        ></builder-main>
        ${this.loading?this._renderLoading():""}
      </div>
    `}_renderHeader(){return r`
      <div class="editor-header">
        <button class="back-button" @click=${this._handleBack} title="Back to cards">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
        </button>

        <input type="text"
          class="name-input ${this.isDirty?"dirty":""}"
          .value=${this.cardName}
          @input=${this._handleNameChange}
          placeholder="Card name"
        />

        <div class="header-actions">
          ${this.isDirty?r`<div class="dirty-indicator" title="Unsaved changes"></div>`:""}
          
          <button
            class="save-button"
            @click=${this._handleSave}
            ?disabled=${this.saving||!this.isDirty}
          >
            ${this.saving?r`
              <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            `:""}
            ${this.saving?"Saving...":"Save"}
          </button>

          <button
            class="close-button"
            @click=${this._handleClose}
            title="Close"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      </div>
    `}_renderError(){return r`
      <div class="error-banner">
        <div class="error-text">
          <strong>Error:</strong> ${this.error}
        </div>
        <button class="dismiss-button" @click=${()=>this.error=null}>
          Dismiss
        </button>
      </div>
    `}_renderLoading(){return r`
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <div class="loading-text">Loading card...</div>
        </div>
      </div>
    `}_getTheme(){var e,t;return(null==(t=null==(e=this.hass)?void 0:e.themes)?void 0:t.darkMode)?"dark":"light"}async _loadCard(){if(this.cardId&&this.cardsService){this.loading=!0,this.error=null;try{const e=await this.cardsService.getCard(this.cardId);e?(this.cardName=e.name,this.cardDescription=e.description,this.isDirty=!1,await this.updateComplete,this.builderRef&&"function"==typeof this.builderRef.loadConfig&&this.builderRef.loadConfig(e.config)):(this.error="Card not found",this.router.navigate(wo.CARDS))}catch(e){console.error("Failed to load card:",e),this.error="Failed to load card. Please try again."}finally{this.loading=!1}}}async _handleSave(){if(this.cardsService&&!this.saving){this.saving=!0,this.error=null;try{const e=this._getConfigFromBuilder();if(this.cardId)await this.cardsService.updateCard(this.cardId,{name:this.cardName,description:this.cardDescription,config:e});else{const t=await this.cardsService.createCard({name:this.cardName,description:this.cardDescription,config:e});this.router.navigate(wo.EDITOR_EDIT,{id:t.id}),this.cardId=t.id}this.isDirty=!1}catch(e){console.error("Failed to save card:",e),this.error="Failed to save card. Please try again."}finally{this.saving=!1}}}_getConfigFromBuilder(){return this.builderRef&&"function"==typeof this.builderRef.exportConfig?this.builderRef.exportConfig():{}}_handleNameChange(e){const t=e.target;this.cardName=t.value,this._markDirty()}_markDirty(){this.isDirty||(this.isDirty=!0)}_handleBack(){this.isDirty?this._showUnsavedChangesDialog():this.router.navigate(wo.CARDS)}_handleClose(){this.isDirty?this._showUnsavedChangesDialog():this.router.navigate(wo.CARDS)}_showUnsavedChangesDialog(){confirm("You have unsaved changes. Are you sure you want to leave?")&&this.router.navigate(wo.CARDS)}_clearDocumentModel(){this.builderRef&&"function"==typeof this.builderRef.clearDocument&&this.builderRef.clearDocument()}};Wo.styles=t`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--primary-background-color);
    }

    .editor-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: var(--card-background-color);
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .back-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--primary-text-color);
      border-radius: 4px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .back-button:hover {
      background-color: var(--secondary-background-color);
    }

    .icon {
      width: 24px;
      height: 24px;
    }

    .name-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      font-weight: 500;
      font-family: inherit;
      min-width: 200px;
    }

    .name-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .name-input.dirty {
      border-color: var(--warning-color);
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .save-button {
      padding: 10px 20px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .save-button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .save-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: var(--primary-text-color);
      border-radius: 4px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      background-color: var(--secondary-background-color);
    }

    .dirty-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--warning-color);
    }

    .builder-container {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    builder-main {
      width: 100%;
      height: 100%;
    }

    /* Loading State */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .loading-content {
      background: var(--card-background-color);
      padding: 32px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      color: var(--primary-text-color);
      font-size: 14px;
    }

    /* Error Message */
    .error-banner {
      background: var(--error-color);
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .error-text {
      flex: 1;
    }

    .dismiss-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 14px;
      text-decoration: underline;
    }

    /* Confirm Dialog */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      font-size: 20px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin: 0 0 16px 0;
    }

    .dialog-content {
      color: var(--primary-text-color);
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .secondary-button {
      padding: 10px 20px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
    }

    .secondary-button:hover {
      opacity: 0.8;
    }

    .primary-button {
      padding: 10px 20px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s ease;
      font-family: inherit;
    }

    .primary-button:hover {
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .editor-header {
        flex-wrap: wrap;
      }

      .name-input {
        min-width: 150px;
        font-size: 14px;
      }
    }
  `,Go([i({attribute:!1})],Wo.prototype,"hass",2),Go([i({type:String})],Wo.prototype,"cardId",2),Go([s()],Wo.prototype,"cardName",2),Go([s()],Wo.prototype,"cardDescription",2),Go([s()],Wo.prototype,"loading",2),Go([s()],Wo.prototype,"saving",2),Go([s()],Wo.prototype,"isDirty",2),Go([s()],Wo.prototype,"error",2),Go([d("builder-main")],Wo.prototype,"builderRef",2),Wo=Go([a("editor-view")],Wo);var qo=Object.defineProperty,Xo=Object.getOwnPropertyDescriptor,Yo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Xo(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&qo(t,i,a),a};let Zo=class extends o{constructor(){super(...arguments),this.narrow=!1,this._isReady=!1,this._loadedHAComponents=!1,this._currentRoute=wo.DASHBOARD,this._routeParams={},this._isFullscreen=!1,this._router=Co(),this._originalDrawerWidth=null}connectedCallback(){super.connectedCallback(),this._initialize(),this._loadFullscreenPreference(),this._router.addEventListener("route-changed",this._handleRouteChanged.bind(this));const{route:e,params:t}=this._router.getCurrentRoute();this._currentRoute=e,this._routeParams=t}render(){if(!this.hass||!this._isReady)return r`
        <div class="panel-container">
          <div class="loading">
            <div class="loading-content">
              <div class="spinner"></div>
              <div>Loading Card Builder...</div>
            </div>
          </div>
        </div>
      `;const e=[wo.EDITOR_CREATE,wo.EDITOR_EDIT].includes(this._currentRoute);return r`
      <app-layout
        .hass=${this.hass}
        .currentRoute=${this._currentRoute}
        ?hideSidebar=${e}
        ?isFullscreen=${this._isFullscreen}
        ?narrow=${this.narrow}
        @navigate=${this._handleNavigate}
        @toggle-fullscreen=${this._toggleFullscreen}
        @exit-dashboard=${this._exitToDefaultDashboard}
      >
        ${this._renderCurrentView()}
      </app-layout>
    `}async firstUpdated(e){super.firstUpdated(e),await this._loadHAComponents()}async _loadHAComponents(){this._loadedHAComponents||(customElements.get("ha-selector")||(await window.loadFragment("ha-selector"),customElements.get("ha-selector")||console.warn("Unable to load custom element: ha-selector.")),this._loadedHAComponents=!0)}async updated(e){if(super.updated(e),e.has("hass")&&this.hass&&await this._loadHAComponents(),e.has("narrow")){if(this.narrow&&this._isFullscreen)return void(this._isFullscreen=!1);this._applyFullscreen()}e.has("_isFullscreen")&&this._applyFullscreen()}async _initialize(){await this._waitForHass(),this._isReady=!0}async _waitForHass(){return new Promise(e=>{if(this.hass)return void e();const t=()=>{this.hass?e():setTimeout(t,50)};t()})}_loadFullscreenPreference(){if(!this.narrow){"true"===localStorage.getItem(Zo.FULLSCREEN_STORAGE_KEY)&&(this._isFullscreen=!0,this._applyFullscreen())}}_applyFullscreen(){this._isFullscreen&&!this.narrow?this._hideHASidebar():this._showHASidebar()}_hideHASidebar(){const e=document.querySelector("home-assistant");if(null==e?void 0:e.shadowRoot){const t=e.shadowRoot.querySelector("home-assistant-main");if(null==t?void 0:t.shadowRoot){const e=t.shadowRoot.querySelector("ha-drawer");if(e){const t=getComputedStyle(e).getPropertyValue("--mdc-drawer-width");null===this._originalDrawerWidth&&t&&(this._originalDrawerWidth=t.trim()),e.style.setProperty("--mdc-drawer-width","0px")}}}}_showHASidebar(){const e=document.querySelector("home-assistant");if(null==e?void 0:e.shadowRoot){const t=e.shadowRoot.querySelector("home-assistant-main");if(null==t?void 0:t.shadowRoot){const e=t.shadowRoot.querySelector("ha-drawer");e&&null!==this._originalDrawerWidth&&(e.style.setProperty("--mdc-drawer-width",this._originalDrawerWidth),this._originalDrawerWidth=null)}}}_toggleFullscreen(){this.narrow||(this._isFullscreen=!this._isFullscreen,localStorage.setItem(Zo.FULLSCREEN_STORAGE_KEY,String(this._isFullscreen)))}_exitToDefaultDashboard(){window.location.href="/"}_handleRouteChanged(e){const t=e;this._currentRoute=t.detail.route,this._routeParams=t.detail.params}_handleNavigate(e){const{route:t}=e.detail;this._router.navigate(t)}_renderCurrentView(){switch(this._currentRoute){case wo.DASHBOARD:return r`<dashboard-view .hass=${this.hass}></dashboard-view>`;case wo.CARDS:return r`<cards-list-view .hass=${this.hass}></cards-list-view>`;case wo.EDITOR_CREATE:return r`<editor-view .hass=${this.hass}></editor-view>`;case wo.EDITOR_EDIT:return r`<editor-view .hass=${this.hass} .cardId=${this._routeParams.id}></editor-view>`;default:return r`<dashboard-view .hass=${this.hass}></dashboard-view>`}}};Zo.styles=t`
    :host {
      --cb-font-family: Roboto, Arial, Helvetica, sans-serif;
      --cb-sidebar-background: white;
      --cb-sidebar-section-border-color: #e6e8ee
    }
    
    :host {
      display: block;
      height: 100%;
      width: 100%;
      position: relative;
      overflow: hidden;
      background: var(--card-background-color, #ffffff);
    }

    .panel-container {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .builder-wrapper {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    builder-main {
      width: 100%;
      height: 100%;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
      font-size: var(--paper-font-body1_-_font-size, 14px);
      color: var(--primary-text-color, #212121);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--primary-color, #03a9f4);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .error {
      padding: 16px;
      color: var(--error-color, #db4437);
      background: var(--card-background-color, #ffffff);
      border-radius: 8px;
      margin: 16px;
      border: 1px solid var(--error-color, #db4437);
    }
  `,Zo.FULLSCREEN_STORAGE_KEY="card-builder-fullscreen",Yo([i({attribute:!1})],Zo.prototype,"hass",2),Yo([i({attribute:!1})],Zo.prototype,"narrow",2),Yo([i({attribute:!1})],Zo.prototype,"route",2),Yo([i({attribute:!1})],Zo.prototype,"panel",2),Yo([s()],Zo.prototype,"_isReady",2),Yo([s()],Zo.prototype,"_loadedHAComponents",2),Yo([s()],Zo.prototype,"_currentRoute",2),Yo([s()],Zo.prototype,"_routeParams",2),Yo([s()],Zo.prototype,"_isFullscreen",2),Zo=Yo([a("card-builder-panel")],Zo),Bt.boot();
