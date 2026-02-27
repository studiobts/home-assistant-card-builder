var e;import{aB as t,aC as i,aD as o,aE as r,aF as a,aG as s,aH as n,aI as l,aJ as d,aK as c,aL as p,aM as h,aN as u,aO as g,aP as v,aQ as b,aR as m,aS as y}from"./card-builder-shared-BOSUXB7z.js";import{i as f,g as x,b as _,d as k,a as w,c as $,D as S,e as C,l as E,f as I,C as P,B,v as M,h as T,j as z,H as R,k as D,m as O,n as A,o as L,P as V,p as N,q as F,r as j,s as U,t as H,u as G,w as W,x as q,y as Y,z as X,A as K,E as J,F as Q,G as Z,I as ee,J as te,L as ie,K as oe,M as re,S as ae,N as se,O as ne,Q as le,R as de,T as ce}from"./card-builder-shared-u1WmmQKf.js";import{M as pe}from"./card-builder-shared-D3fw64e2.js";import"./card-builder-shared-CR_SzKoS.js";const he=[{id:"air_quality",label:"Air Quality"},{id:"alarm_control_panel",label:"Alarm Control Panel"},{id:"assist_satellite",label:"Assist Satellite"},{id:"automation",label:"Automation"},{id:"binary_sensor",label:"Binary Sensor"},{id:"button",label:"Button"},{id:"calendar",label:"Calendar"},{id:"camera",label:"Camera"},{id:"climate",label:"Climate"},{id:"conversation",label:"Conversation"},{id:"cover",label:"Cover"},{id:"date",label:"Date"},{id:"datetime",label:"Date/Time"},{id:"device_tracker",label:"Device Tracker"},{id:"event",label:"Event"},{id:"fan",label:"Fan"},{id:"geo_location",label:"Geolocation"},{id:"group",label:"Group"},{id:"humidifier",label:"Humidifier"},{id:"image",label:"Image"},{id:"image_processing",label:"Image Processing"},{id:"input_boolean",label:"Input Boolean"},{id:"input_datetime",label:"Input Date/Time"},{id:"input_number",label:"Input Number"},{id:"input_select",label:"Input Select"},{id:"input_text",label:"Input Text"},{id:"lawn_mower",label:"Lawn Mower"},{id:"light",label:"Light"},{id:"lock",label:"Lock"},{id:"media_player",label:"Media Player"},{id:"number",label:"Number"},{id:"person",label:"Person"},{id:"persistent_notification",label:"Persistent Notification"},{id:"remote",label:"Remote"},{id:"scene",label:"Scene"},{id:"script",label:"Script"},{id:"select",label:"Select"},{id:"sensor",label:"Sensor"},{id:"siren",label:"Siren"},{id:"stt",label:"Speech-to-Text (STT)"},{id:"sun",label:"Sun"},{id:"switch",label:"Switch"},{id:"tag",label:"Tag"},{id:"text",label:"Text"},{id:"time",label:"Time"},{id:"todo",label:"To-Do List"},{id:"tts",label:"Text-to-Speech (TTS)"},{id:"timer",label:"Timer"},{id:"update",label:"Update"},{id:"valve",label:"Valve"},{id:"vacuum",label:"Vacuum"},{id:"wake_word",label:"Wake Word Detection"},{id:"water_heater",label:"Water Heater"},{id:"weather",label:"Weather"},{id:"zone",label:"Zone"}];var ue=Object.defineProperty,ge=Object.getOwnPropertyDescriptor,ve=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ge(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ue(t,i,a),a};let be=class extends o{constructor(){super(...arguments),this.value="top-left"}render(){return r`
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
    `}handleSelect(e){this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}};be.styles=t`
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
  `,ve([i({type:String})],be.prototype,"value",2),ve([i({type:String})],be.prototype,"label",2),be=ve([a("sm-anchor-selector")],be);var me=Object.defineProperty,ye=Object.getOwnPropertyDescriptor,fe=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ye(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&me(t,i,a),a};let xe=class extends o{constructor(){super(...arguments),this.value="",this.options=[]}render(){return r`
      <div class="container">
        ${this.label?r`<div class="label">${this.label}</div>`:""}
        <div class="button-group">
          ${this.options.map(e=>r`
            <button
              class="button ${this.value===e.value?"active":""}"
              @click=${()=>this.handleSelect(e.value)}
              data-tooltip="${e.tooltip||e.value}"
            >
                ${s(e.icon)}
            </button>
          `)}
        </div>
      </div>
    `}handleSelect(e){this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}};xe.styles=t`
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
  `,fe([i({type:String})],xe.prototype,"value",2),fe([i({type:String})],xe.prototype,"label",2),fe([i({type:Array})],xe.prototype,"options",2),xe=fe([a("sm-button-group-input")],xe);var _e=Object.defineProperty,ke=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&_e(t,i,a),a};const we=class extends o{render(){return r`
            ${this.renderLabel()}
            ${this.renderInput()}
        `}dispatchChange(e){this.dispatchEvent(new CustomEvent("change",{detail:e,bubbles:!0,composed:!0}))}renderLabel(){return this.label?r`
            <div class="label">${this.label}</div>`:""}};we.styles=[t`
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
                box-sizing: border-box;
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
        `];let $e=we;ke([i({type:String})],$e.prototype,"label"),ke([i()],$e.prototype,"value");var Se=Object.defineProperty,Ce=Object.getOwnPropertyDescriptor,Ee=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ce(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Se(t,i,a),a};let Ie=class extends $e{constructor(){super(...arguments),this.value="#000000"}renderInput(){return r`
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
    `}handleChange(e){const t=e.target;this.dispatchChange({value:t.value})}};Ie.styles=[...$e.styles,t`
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
    `],Ee([i({type:String})],Ie.prototype,"value",2),Ie=Ee([a("sm-color-input")],Ie);var Pe=Object.defineProperty,Be=Object.getOwnPropertyDescriptor,Me=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Be(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Pe(t,i,a),a};let Te=class extends $e{constructor(){super(...arguments),this.step=1,this.default=0,this.showUnitSelector=!1}renderInput(){const e=void 0===this.value||Number.isNaN(this.value)?"":String(this.value);return r`
            <div class="input-wrapper">
                <input
                        type="number"
                        placeholder=${this.placeholder}
                        .value=${e}
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
                        `:l}
                    </div>
                `:r`
                    ${this.unit?r`
                        <div class="unit-selector">
                            <div class="unit-button">${this.unit}</div>
                        </div>
                    `:l}
                `}
            </div>
        `}handleInput(e){const t=e.target,i=parseFloat(t.value)||0;this.dispatchChange({value:i,unit:this.unit})}increment(){const e=(this.value??this.default)+this.step,t=void 0!==this.max?Math.min(e,this.max):e;this.dispatchChange({value:t,unit:this.unit})}decrement(){const e=(this.value??this.default)-this.step,t=void 0!==this.min?Math.max(e,this.min):e;this.dispatchChange({value:t,unit:this.unit})}toggleUnitSelector(e){e.stopPropagation(),this.showUnitSelector=!this.showUnitSelector}selectUnit(e){this.unit=e,this.showUnitSelector=!1,void 0!==this.value&&this.dispatchChange({value:this.value,unit:e})}};Te.styles=[...$e.styles,t`
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
        `],Me([i({type:Number})],Te.prototype,"value",2),Me([i({type:Number})],Te.prototype,"min",2),Me([i({type:Number})],Te.prototype,"max",2),Me([i({type:Number})],Te.prototype,"step",2),Me([i({type:String})],Te.prototype,"unit",2),Me([i({type:Array})],Te.prototype,"units",2),Me([i({type:String})],Te.prototype,"placeholder",2),Me([i({type:Number})],Te.prototype,"default",2),Me([n()],Te.prototype,"showUnitSelector",2),Te=Me([a("sm-number-input")],Te);var ze=Object.defineProperty,Re=Object.getOwnPropertyDescriptor,De=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Re(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ze(t,i,a),a};const Oe={default:{label:"Default",shortLabel:"Default",color:"#666",bgColor:"#f0f0f0",icon:'<ha-icon icon="mdi:circle-outline"></ha-icon>'},"block-type-default":{label:"Block Default",shortLabel:"Block",color:"#0066cc",bgColor:"#e6f0ff",icon:'<ha-icon icon="mdi:code-brackets"></ha-icon>'},"canvas-default":{label:"Canvas Default",shortLabel:"Canvas",color:"#00a6a6",bgColor:"#e6f7f7",icon:'<ha-icon icon="mdi:card-outline"></ha-icon>'},"parent-inherited":{label:"Inherited",shortLabel:"Parent",color:"#2e8b2e",bgColor:"#e8f5e8",icon:'<ha-icon icon="mdi:arrow-collapse-up"></ha-icon>'},preset:{label:"Preset",shortLabel:"Preset",color:"#7b2d8e",bgColor:"#f5e6f8",icon:'<ha-icon icon="mdi:presentation"></ha-icon>'},"preset-fallback":{label:"Preset (fallback)",shortLabel:"Preset",color:"#9b5dae",bgColor:"#f5e6f8",icon:'<ha-icon icon="mdi:presentation"></ha-icon>'},inline:{label:"Custom",shortLabel:"Custom",color:"#cc6600",bgColor:"#fff5e6",icon:'<ha-icon icon="mdi:location-enter"></ha-icon>'},"inline-fallback":{label:"Custom (fallback)",shortLabel:"Fallback",color:"#cc9966",bgColor:"#fff8f0",icon:'<ha-icon icon="mdi:format-wrap-inline"></ha-icon>'}};let Ae=class extends o{constructor(){super(...arguments),this.origin="default",this.compact=!1,this.showTooltip=!0}render(){const e=this._getConfig(),t=this.showTooltip?this._getTooltip():void 0,i=this._getDisplayLabel();return r`
      <span
        class="badge ${this.compact?"compact":""}"
        style="color: ${e.color}; background: ${e.bgColor};"
        data-tooltip=${t||""}
      >
        <span class="icon">${s(e.icon)}</span>
        <span class="label">${i}</span>
      </span>
    `}_getConfig(){return Oe[this.origin]||Oe.default}_getTooltip(){let e=this._getConfig().label;return!this.presetName||"preset"!==this.origin&&"preset-fallback"!==this.origin||(e+=`: ${this.presetName}`),!this.originContainer||"inline-fallback"!==this.origin&&"preset-fallback"!==this.origin||(e+=` (from ${this.originContainer})`),e}_getDisplayLabel(){const e=this._getConfig();return!this.presetName||"preset"!==this.origin&&"preset-fallback"!==this.origin?!this.originContainer||"inline-fallback"!==this.origin&&"preset-fallback"!==this.origin?e.shortLabel:this.originContainer:this.presetName}};Ae.styles=t`
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
  `,De([i({type:String})],Ae.prototype,"origin",2),De([i({type:String})],Ae.prototype,"presetName",2),De([i({type:String})],Ae.prototype,"originContainer",2),De([i({type:Boolean})],Ae.prototype,"compact",2),De([i({type:Boolean})],Ae.prototype,"showTooltip",2),Ae=De([a("property-origin-badge")],Ae);var Le=Object.defineProperty,Ve=Object.getOwnPropertyDescriptor,Ne=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ve(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Le(t,i,a),a};let Fe=class extends $e{constructor(){super(...arguments),this.value="",this.options=[]}updated(e){e.has("value")&&this.selectElement&&(this.selectElement.value=this.value)}renderInput(){return r`
            <div class="select-wrapper">
                <select .value=${this.value} @change=${this.handleChange}>
                    ${this.options.map(e=>r`
                        <option value=${e.value} ?selected=${e.value===this.value}>${e.label}</option>
                    `)}
                </select>
            </div>
        `}handleChange(e){const t=e.target;this.dispatchChange({value:t.value})}};Fe.styles=[...$e.styles,t`
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
        `],Ne([i({type:String})],Fe.prototype,"value",2),Ne([i({type:Array})],Fe.prototype,"options",2),Ne([d("select")],Fe.prototype,"selectElement",2),Fe=Ne([a("sm-select-input")],Fe);var je=Object.defineProperty,Ue=Object.getOwnPropertyDescriptor,He=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ue(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&je(t,i,a),a};let Ge=class extends $e{constructor(){super(...arguments),this.value=0,this.min=0,this.max=100,this.step=1,this.unit="px",this.units=[],this.showUnitSelector=!1}renderInput(){const e=this.step<1?2:0;return r`
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
        `}handleInput(e){const t=e.target,i=parseFloat(t.value);this.dispatchChange({value:i,unit:this.unit})}toggleUnitSelector(e){e.stopPropagation(),this.showUnitSelector=!this.showUnitSelector}selectUnit(e){this.showUnitSelector=!1,this.unit=e,this.dispatchChange({value:this.value,unit:e})}};Ge.styles=[...$e.styles,t`
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
        `],He([i({type:Number})],Ge.prototype,"value",2),He([i({type:Number})],Ge.prototype,"min",2),He([i({type:Number})],Ge.prototype,"max",2),He([i({type:Number})],Ge.prototype,"step",2),He([i({type:String})],Ge.prototype,"unit",2),He([i({type:Array})],Ge.prototype,"units",2),He([n()],Ge.prototype,"showUnitSelector",2),Ge=He([a("sm-slider-input")],Ge);var We=Object.defineProperty,qe=Object.getOwnPropertyDescriptor,Ye=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?qe(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&We(t,i,a),a};let Xe=class extends $e{constructor(){super(...arguments),this.value=void 0,this.unit="px",this.units=["px"],this.showUnitSelector=!1}renderInput(){var e,t,i,o;return r`
            <div class="grid">
                <div class="item top">
                    <span class="item-label">Top</span>
                    <input
                        type="number"
                        .value=${String(null==(e=this.value)?void 0:e.top)}
                        @input=${e=>this.handleChange("top",e)}
                    />
                </div>
                <div class="item right">
                    <span class="item-label">Right</span>
                    <input
                        type="number"
                        .value=${String(null==(t=this.value)?void 0:t.right)}
                        @input=${e=>this.handleChange("right",e)}
                    />
                </div>
                <div class="item bottom">
                    <span class="item-label">Bottom</span>
                    <input
                        type="number"
                        .value=${String(null==(i=this.value)?void 0:i.bottom)}
                        @input=${e=>this.handleChange("bottom",e)}
                    />
                </div>
                <div class="item left">
                    <span class="item-label">Left</span>
                    <input
                        type="number"
                        .value=${String(null==(o=this.value)?void 0:o.left)}
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
        `}handleChange(e,t){const i=t.target,o=parseFloat(i.value)||0,r={...this.value||{top:o,right:o,bottom:o,left:o},[e]:o};this.dispatchChange({value:r,unit:this.unit})}toggleUnitSelector(e){e.stopPropagation(),this.showUnitSelector=!this.showUnitSelector}selectUnit(e){this.showUnitSelector=!1,this.unit=e,this.dispatchChange({value:this.value,unit:e})}};Xe.styles=[...$e.styles,t`
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
        `],Ye([i({type:Object})],Xe.prototype,"value",2),Ye([i({type:String})],Xe.prototype,"unit",2),Ye([i({type:Array})],Xe.prototype,"units",2),Ye([n()],Xe.prototype,"showUnitSelector",2),Xe=Ye([a("sm-spacing-input")],Xe);var Ke=Object.defineProperty,Je=Object.getOwnPropertyDescriptor,Qe=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Je(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ke(t,i,a),a};let Ze=class extends o{constructor(){super(...arguments),this.value=!1,this.labelOn="On",this.labelOff="Off"}render(){return r`
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
    `}handleToggle(){this.dispatchEvent(new CustomEvent("change",{detail:{value:!this.value},bubbles:!0,composed:!0}))}};Ze.styles=t`
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
  `,Qe([i({type:Boolean})],Ze.prototype,"value",2),Qe([i({type:String})],Ze.prototype,"label",2),Qe([i({type:String})],Ze.prototype,"labelOn",2),Qe([i({type:String})],Ze.prototype,"labelOff",2),Ze=Qe([a("sm-toggle-input")],Ze);class et{constructor(e){this.hass=e}async browse(e){if(!f(e))throw new Error("Unsupported media source.");const t=x(e);return await this.hass.callWS({type:"card_builder/media/list",path:t})}async resolve(e){return await this.hass.callWS({type:"media_source/resolve_media",media_content_id:e})}async uploadFile(e,t,i){if(!f(t))throw new Error("Upload supported only for Card Builder media.");const o=x(t),r=i||e.name,a=await async function(e){return await new Promise((t,i)=>{const o=new FileReader;o.onload=()=>{const e="string"==typeof o.result?o.result:"",i=e.indexOf(",");t(i>=0?e.slice(i+1):e)},o.onerror=()=>i(o.error??new Error("Failed to read file")),o.readAsDataURL(e)})}(e);return await this.hass.callWS({type:"card_builder/media/upload",path:o,filename:r,content:a})}async deleteFile(e){if(!f(e))throw new Error("Delete supported only for Card Builder media.");const t=x(e);return await this.hass.callWS({type:"card_builder/media/delete",path:t})}}const tt=c("overlay-host");var it=Object.defineProperty,ot=Object.getOwnPropertyDescriptor,rt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ot(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&it(t,i,a),a};let at=class extends o{constructor(){super(...arguments),this.tabs=[],this.activeTab=""}render(){return 0===this.tabs.length?r`<div class="empty-state">No tabs configured</div>`:r`
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
                ></panel-styles>`;case"panel-actions":return r`<panel-actions .hass=${t.hass}></panel-actions>`;default:return r`<div class="empty-state">Unknown component: ${e.component}</div>`}}_setActiveTab(e){this.activeTab=e}};at.styles=t`
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
  `,rt([i({type:Array})],at.prototype,"tabs",2),rt([n()],at.prototype,"activeTab",2),at=rt([a("sidebar-tabbed")],at);const st=class extends o{};st.styles=[t`
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

        .empty-state ha-icon {
            --mdc-icon-size: 48px;
            display: block;
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
            box-sizing: border-box;
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
            font-size: 12px;
        }

        /* Placeholder text */

        .placeholder-text {
            padding: 8px;
            color: var(--text-secondary);
            font-size: 12px;
            text-align: center;
        }
    `];let nt=st;var lt=Object.defineProperty,dt=Object.getOwnPropertyDescriptor,ct=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?dt(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&lt(t,i,a),a};let pt=class extends o{constructor(){super(...arguments),this.blockType="",this.icon="",this.label=""}render(){return r`
      <span class="icon">
        ${s(this.icon)}
      </span>
      <span class="label">${this.label}</span>
    `}};pt.styles=t`
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
  `,ct([i({type:String,attribute:"block-type"})],pt.prototype,"blockType",2),ct([i({type:String})],pt.prototype,"icon",2),ct([i({type:String})],pt.prototype,"label",2),pt=ct([a("draggable-block")],pt);var ht=Object.defineProperty,ut=Object.getOwnPropertyDescriptor,gt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ut(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ht(t,i,a),a};let vt=class extends nt{constructor(){super(...arguments),this.panelContent=null,this.sections={basic:{label:"Basic",expanded:!0},layout:{label:"Layout",expanded:!0},entities:{label:"Entities",expanded:!0},controls:{label:"Controls",expanded:!0},advanced:{label:"Advanced",expanded:!0}}}get sourceId(){return"main-sidebar"}get sourceElement(){return this.panelContent}get sourceAllowedBlockTypes(){return null}async firstUpdated(){await this.updateComplete,this.dragDropManager.registerSourceZone(this)}render(){const e=this.blockRegistry.getAllCategories();return r`
            <div class="panel-content" ${h(e=>this.panelContent=e)}>
                ${Object.entries(this.sections).map(([t,i])=>e.includes(t)?r`
                            <div class="block-section ${i.expanded?"expanded":""}">
                                <div class="block-section-header" @click=${()=>this._toggleSection(t)}>
                                    ${i.label}
                                </div>
                                <div class="block-section-content">
                                    ${this.blockRegistry.getByCategory(t).map(e=>r`
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
                        `:l)}
            </div>
        `}_toggleSection(e){this.sections={...this.sections,[e]:{...this.sections[e],expanded:!this.sections[e].expanded}}}};vt.styles=[...nt.styles,t`
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
        `],gt([p({context:_})],vt.prototype,"blockRegistry",2),gt([p({context:k})],vt.prototype,"dragDropManager",2),gt([n()],vt.prototype,"sections",2),vt=gt([a("panel-blocks")],vt);var bt=Object.defineProperty,mt=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&bt(t,i,a),a};const yt=class extends o{constructor(){super(...arguments),this.disabled=!1,this._dropdownOpen=!1,this._searchFilter=""}get showSearch(){return!1}get searchPlaceholder(){return"Search..."}connectedCallback(){super.connectedCallback(),this._handleClickOutside=this._handleClickOutside.bind(this)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._handleClickOutside)}render(){return r`
      ${this.renderTriggerButton()}
      ${this.renderDropdown()}
    `}_toggleDropdown(){this.disabled||(this._dropdownOpen?this._closeDropdown():this._openDropdown())}_openDropdown(){this._dropdownOpen=!0,this._searchFilter="",setTimeout(()=>{document.addEventListener("click",this._handleClickOutside)},0)}_closeDropdown(){this._dropdownOpen=!1,document.removeEventListener("click",this._handleClickOutside)}_handleSearchInput(e){this._searchFilter=e.target.value.toLowerCase()}renderTriggerIcon(){return l}renderTriggerButton(){return r`
      <button
        class="selector-button ${this._dropdownOpen?"open":""}"
        @click=${this._toggleDropdown}
        ?disabled=${this.disabled}
      >
        <span class="icon">${this.renderTriggerIcon()}</span>
        <span class="label">${this.renderTriggerLabel()}</span>
        <span class="arrow">&#9660;</span>
      </button>
    `}renderSearchBox(){return r`
      <div class="search-box">
        <input
          type="text"
          placeholder=${this.searchPlaceholder}
          .value=${this._searchFilter}
          @input=${this._handleSearchInput}
        />
      </div>
    `}renderDropdown(){return this._dropdownOpen?r`
      <div class="dropdown" @click=${e=>e.stopPropagation()}>
        ${this.showSearch?this.renderSearchBox():l}
        ${this.renderDropdownContent()}
      </div>
    `:l}_handleClickOutside(e){this.contains(e.target)||this._closeDropdown()}};yt.styles=t`
    :host {
      display: block;
      position: relative;
    }

    .selector-button {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .selector-button:hover:not(:disabled) {
      border-color: var(--accent-color, #0078d4);
    }

    .selector-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .selector-button .icon {
      color: #7b2d8e;
      font-size: 14px;
    }

    .selector-button .label {
      flex: 1;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .selector-button .placeholder {
      color: var(--text-secondary, #666);
    }

    .selector-button .arrow {
      color: var(--text-tertiary, #999);
      font-size: 10px;
      transition: transform 0.15s ease;
    }

    .selector-button.open .arrow {
      transform: rotate(180deg);
    }

    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 300px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .search-box {
      padding: 8px;
      border-bottom: 1px solid var(--border-color, #d4d4d4);
    }

    .search-box input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 3px;
      font-size: 12px;
      outline: none;
    }

    .search-box input:focus {
      border-color: var(--accent-color, #0078d4);
    }

    .option-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.1s ease;
    }

    .option-item:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    .option-item.selected {
      background: rgba(0, 120, 212, 0.1);
    }

    .option-item .icon {
      color: #7b2d8e;
      font-size: 12px;
      flex-shrink: 0;
    }

    .option-item .info {
      flex: 1;
      min-width: 0;
    }

    .option-item .name {
      font-size: 12px;
      color: var(--text-primary, #333);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .option-item .description {
      font-size: 10px;
      color: var(--text-secondary, #666);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 2px;
    }

    .option-item .meta {
      font-size: 9px;
      color: var(--text-tertiary, #999);
      margin-top: 2px;
    }

    .option-item .check {
      color: var(--accent-color, #0078d4);
      font-size: 14px;
      flex-shrink: 0;
    }

    .divider {
      height: 1px;
      background: var(--border-color, #d4d4d4);
      margin: 4px 0;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.1s ease;
      color: var(--text-primary, #333);
      font-size: 12px;
    }

    .action-item:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    .action-item .icon {
      font-size: 14px;
      color: var(--text-secondary, #666);
    }

    .empty-message {
      padding: 16px;
      text-align: center;
      color: var(--text-secondary, #666);
      font-size: 12px;
    }
  `;let ft=yt;mt([i({type:Boolean})],ft.prototype,"disabled"),mt([n()],ft.prototype,"_dropdownOpen"),mt([n()],ft.prototype,"_searchFilter");var xt=Object.defineProperty,_t=Object.getOwnPropertyDescriptor,kt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?_t(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&xt(t,i,a),a};let wt=class extends ft{constructor(){super(...arguments),this.slots=[],this.showManagement=!0}get showSearch(){return this.slots.length>5}get searchPlaceholder(){return"Search slots..."}renderTriggerIcon(){return r`<ha-icon icon="mdi:select-drag"></ha-icon>`}renderTriggerLabel(){const e=this._getSelectedSlot();return r`
            ${e?r`${e.name||e.id}`:r`<span class="placeholder">Select slot</span>`}
        `}renderDropdownContent(){const e=this._getFilteredSlots();return r`
            <div class="option-list">
                <!-- None option -->
                <div
                    class="option-item ${this.selectedSlotId?"":"selected"}"
                    @click=${()=>this._selectSlot(null)}
                >
                    <span class="icon">
                        <ha-icon icon="mdi:close-circle-outline"></ha-icon>
                    </span>
                    <div class="info">
                        <div class="name">No slot</div>
                        <div class="description">Clear slot selection</div>
                    </div>
                    ${this.selectedSlotId?l:r`<span class="check">✓</span>`}
                </div>

                ${e.length>0?r`
                    <div class="divider"></div>
                    ${e.map(e=>r`
                        <div
                            class="option-item ${e.id===this.selectedSlotId?"selected":""}"
                            @click=${()=>this._selectSlot(e.id)}
                        >
                            <span class="icon">
                                <ha-icon icon="mdi:select-drag"></ha-icon>
                            </span>
                            <div class="info">
                                <div class="name">${e.name||e.id}</div>
                                ${e.description?r`
                                    <div class="description">${e.description}</div>
                                `:l}
                                ${e.entityId?r`
                                    <div class="meta">Entity: ${e.entityId}</div>
                                `:r`
                                    <div class="meta">No entity set</div>
                                `}
                            </div>
                            ${e.id===this.selectedSlotId?r`<span class="check">✓</span>`:l}
                        </div>
                    `)}
                `:this._searchFilter?r`
                    <div class="empty-message">No slots match "${this._searchFilter}"</div>
                `:r`
                    <div class="empty-message">No slots available</div>
                `}
            </div>

            ${this.showManagement?r`
                <div class="divider"></div>
                <div class="action-item" @click=${this._handleManageSlots}>
                    <span class="icon">
                        <ha-icon icon="mdi:cog"></ha-icon>
                    </span>
                    <span>Manage slots...</span>
                </div>
            `:l}
        `}_selectSlot(e){this._closeDropdown(),this.dispatchEvent(new CustomEvent("slot-selected",{detail:{slotId:e},bubbles:!0,composed:!0}))}_handleManageSlots(){this._closeDropdown(),this.dispatchEvent(new CustomEvent("manage-entities-slots",{bubbles:!0,composed:!0}))}_getSelectedSlot(){if(this.selectedSlotId)return this.slots.find(e=>e.id===this.selectedSlotId)}_getFilteredSlots(){return this._searchFilter?this.slots.filter(e=>{var t,i,o;return e.id.toLowerCase().includes(this._searchFilter)||(null==(t=e.name)?void 0:t.toLowerCase().includes(this._searchFilter))||(null==(i=e.description)?void 0:i.toLowerCase().includes(this._searchFilter))||(null==(o=e.entityId)?void 0:o.toLowerCase().includes(this._searchFilter))}):this.slots}};kt([i({attribute:!1})],wt.prototype,"slots",2),kt([i({type:String})],wt.prototype,"selectedSlotId",2),kt([i({type:Boolean})],wt.prototype,"showManagement",2),wt=kt([a("slot-selector")],wt);var $t=Object.defineProperty,St=Object.getOwnPropertyDescriptor,Ct=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?St(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&$t(t,i,a),a};let Et=class extends o{constructor(){super(...arguments),this.slots=[],this.slotError=null,this._handleSlotsChanged=()=>{this._refreshSlots()}}connectedCallback(){super.connectedCallback(),this._refreshSlots(),this.documentModel.addEventListener("slots-changed",this._handleSlotsChanged)}disconnectedCallback(){super.disconnectedCallback(),this.documentModel.removeEventListener("slots-changed",this._handleSlotsChanged)}render(){var e;const t=(null==(e=this.config)?void 0:e.mode)||"inherited";return r`
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
        `}_refreshSlots(){this.slots=this.documentModel.getSlotEntities()}_renderFixedEntityPicker(){var e;const t=(null==(e=this.config)?void 0:e.entityId)||"";return r`
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
                `:l}
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
                ${t?l:r`
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
                `:l}
                <span class="section-label">Slot</span>
                <slot-selector
                    .slots=${this.slots}
                    .selectedSlotId=${t||void 0}
                    .showManagement=${!0}
                    @slot-selected=${this._onSlotSelected}
                    @manage-entities-slots=${this._onManageSlots}
                ></slot-selector>
                ${i?r`
                    <div class="slot-info">
                        <div class="slot-info-entity">
                            <span class="slot-info-entity-label">Slot entity:</span>
                            <span class="slot-info-entity-id">${i.entityId||"not set"}</span>
                        </div>
                        ${i.domains&&i.domains.length>0?r`
                            <div class="slot-info-entity">
                                <span class="slot-info-entity-label">Allowed domains:</span>
                                <span class="slot-info-entity-id">${i.domains.join(", ")}</span>
                            </div>
                        `:l}
                        ${i.description?r`
                            <div class="slot-info-description">${i.description}</div>
                        `:l}
                    </div>
                `:l}
                ${this.slotError?r`<span class="slot-id-hint">${this.slotError}</span>`:l}
            </div>
        `}_setMode(e){var t,i;const o={mode:e};"fixed"===e?o.entityId=null==(t=this.config)?void 0:t.entityId:"slot"===e&&(o.slotId=null==(i=this.config)?void 0:i.slotId),this._emitConfigChanged(o)}_onEntityChanged(e){const t={mode:"fixed",entityId:e.detail.value||""||void 0};this._emitConfigChanged(t)}_onSlotSelected(e){const t=e.detail.slotId;this.slotError=null;const i={mode:"slot",slotId:t||void 0};this._emitConfigChanged(i)}_onManageSlots(){this.dispatchEvent(new CustomEvent("manage-entities-slots",{bubbles:!0,composed:!0}))}_selectSourceBlock(e){this.dispatchEvent(new CustomEvent("select-source-block",{detail:{blockId:e},bubbles:!0,composed:!0}))}_emitConfigChanged(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:e,bubbles:!0,composed:!0}))}};Et.styles=t`
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

        .slot-info {
            padding: 8px 10px;
            background: var(--bg-secondary, #f9f9f9);
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 4px;
            font-size: 11px;
        }

        .slot-info-entity {
            font-size: 12px;
            margin-bottom: 4px;
        }

        .slot-info-entity-label {
            color: var(--text-secondary, #666);
        }

        .slot-info-entity-id {
            font-weight: bold;
            font-family: monospace;
            color: var(--text-primary, #333);
        }

        .slot-info-description {
            color: var(--text-secondary, #666);
            font-style: italic;
        }
    `,Ct([p({context:w})],Et.prototype,"documentModel",2),Ct([i({attribute:!1})],Et.prototype,"block",2),Ct([i({attribute:!1})],Et.prototype,"config",2),Ct([i({attribute:!1})],Et.prototype,"resolvedInfo",2),Ct([i({attribute:!1})],Et.prototype,"hass",2),Ct([n()],Et.prototype,"slots",2),Ct([n()],Et.prototype,"slotError",2),Et=Ct([a("entity-config-editor")],Et);const It=1,Pt=12,Bt=1,Mt=12,Tt=100,zt=["#4caf50","#2196f3","#ff9800","#9c27b0","#f44336","#00bcd4","#ff5722","#3f51b5","#8bc34a","#e91e63","#009688","#ffc107","#673ab7","#cddc39","#ff6f00","#03a9f4"];function Rt(e,t="fr",i,o){return{value:e,unit:t,minValue:i,maxValue:o}}var Dt=Object.defineProperty,Ot=Object.getOwnPropertyDescriptor,At=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ot(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Dt(t,i,a),a};let Lt=class extends o{constructor(){super(...arguments),this.selectedCells=null,this.isDragging=!1,this.dragStart=null}connectedCallback(){super.connectedCallback(),window.addEventListener("mouseup",this._handleMouseUp.bind(this))}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("mouseup",this._handleMouseUp.bind(this))}clearSelection(){this.selectedCells=null}render(){const e={gridTemplateRows:$(this.config.rowSizes),gridTemplateColumns:$(this.config.columnSizes),gap:`${this.config.gap.row}px ${this.config.gap.column}px`},t=[];for(let i=0;i<this.config.rows;i++)for(let e=0;e<this.config.columns;e++)t.push({row:i,column:e});return r`
      <div class="canvas-container">
        <div class="grid-preview" style=${u(e)}>
          ${g(t,e=>`${e.row}-${e.column}`,e=>{const t=(i=e.row,o=e.column,this.config.areas.find(e=>i>=e.rowStart&&i<e.rowEnd&&o>=e.columnStart&&o<e.columnEnd)||null);var i,o;const a=this._isCellSelected(e.row,e.column),s={"grid-cell":!0,selected:a,"in-area":!!t},n={};if(t&&t.color){const e=(e,t)=>`rgba(${parseInt(e.slice(1,3),16)}, ${parseInt(e.slice(3,5),16)}, ${parseInt(e.slice(5,7),16)}, ${t})`;a?(n.background=e(t.color,.9),n.borderColor=t.color):(n.background=e(t.color,.25),n.borderColor=e(t.color,.6))}return r`
                <div
                  class=${v(s)}
                  style=${u(n)}
                  @mousedown=${()=>this._handleCellMouseDown(e.row,e.column)}
                  @mouseenter=${()=>this._handleCellMouseEnter(e.row,e.column)}
                >
                  ${t&&e.row===t.rowStart&&e.column===t.columnStart?r`<span class="area-label">${t.name}</span>`:""}
                  <span class="cell-coordinates">${e.row+1},${e.column+1}</span>
                </div>
              `})}
        </div>
      </div>
    `}_isCellSelected(e,t){return!!this.selectedCells&&(e>=this.selectedCells.rowStart&&e<this.selectedCells.rowEnd&&t>=this.selectedCells.columnStart&&t<this.selectedCells.columnEnd)}_handleCellMouseDown(e,t){this.isDragging=!0,this.dragStart={row:e,column:t},this.selectedCells={rowStart:e,rowEnd:e+1,columnStart:t,columnEnd:t+1}}_handleCellMouseEnter(e,t){if(this.isDragging&&this.dragStart){const i=Math.min(this.dragStart.row,e),o=Math.max(this.dragStart.row,e)+1,r=Math.min(this.dragStart.column,t),a=Math.max(this.dragStart.column,t)+1;this.selectedCells={rowStart:i,rowEnd:o,columnStart:r,columnEnd:a}}}_handleMouseUp(){this.isDragging&&this.selectedCells&&this.dispatchEvent(new CustomEvent("cells-selected",{detail:{selection:this.selectedCells},bubbles:!0,composed:!0})),this.isDragging=!1,this.dragStart=null}};Lt.styles=t`
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
  `,At([i({type:Object})],Lt.prototype,"config",2),At([n()],Lt.prototype,"selectedCells",2),At([n()],Lt.prototype,"isDragging",2),At([n()],Lt.prototype,"dragStart",2),Lt=At([a("grid-visual-canvas")],Lt);var Vt=Object.defineProperty,Nt=Object.getOwnPropertyDescriptor,Ft=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Nt(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Vt(t,i,a),a};let jt=class extends o{render(){const e="auto"!==this.dimension.unit,t="minmax"===this.dimension.unit;return r`
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
    `}_handleValueChange(e){const t=e.target,i=parseFloat(t.value)||0;this.dispatchEvent(new CustomEvent("dimension-change",{detail:{index:this.index,type:this.type,dimension:{...this.dimension,value:i}},bubbles:!0,composed:!0}))}_handleUnitChange(e){const t=e.target.value,i={...this.dimension,unit:t};"minmax"===t&&(i.minValue=i.minValue??100,i.maxValue=i.maxValue??300),this.dispatchEvent(new CustomEvent("dimension-change",{detail:{index:this.index,type:this.type,dimension:i},bubbles:!0,composed:!0}))}_handleMinMaxChange(e,t){const i=e.target,o=parseFloat(i.value)||0,r={...this.dimension,["min"===t?"minValue":"maxValue"]:o};this.dispatchEvent(new CustomEvent("dimension-change",{detail:{index:this.index,type:this.type,dimension:r},bubbles:!0,composed:!0}))}};jt.styles=t`
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
  `,Ft([i({type:Object})],jt.prototype,"dimension",2),Ft([i({type:Number})],jt.prototype,"index",2),Ft([i({type:String})],jt.prototype,"type",2),jt=Ft([a("grid-size-input")],jt);var Ut=Object.defineProperty,Ht=Object.getOwnPropertyDescriptor,Gt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ht(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ut(t,i,a),a};let Wt=class extends o{constructor(){super(...arguments),this.areas=[],this.selectedCells=null}render(){const e=!!this.selectedCells,t=e?{rows:this.selectedCells.rowEnd-this.selectedCells.rowStart,cols:this.selectedCells.columnEnd-this.selectedCells.columnStart}:null,i=this._getSuggestedAreaName();return r`
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
                  ${g(this.areas,e=>e.name,e=>r`
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
    `}_handleCreateArea(){var e;if(!this.selectedCells)return;const t=null==(e=this.shadowRoot)?void 0:e.querySelector("#area-name-input"),i=(null==t?void 0:t.value.trim())||"";if(!i)return void alert("Please enter an area name");if(this.areas.some(e=>e.name===i))return void alert("An area with this name already exists");const o=(r=this.areas.length,zt[r%zt.length]);var r;const a={id:i.replaceAll(" ","-").toLowerCase(),name:i,rowStart:this.selectedCells.rowStart,rowEnd:this.selectedCells.rowEnd,columnStart:this.selectedCells.columnStart,columnEnd:this.selectedCells.columnEnd,color:o};this.dispatchEvent(new CustomEvent("area-created",{detail:{area:a},bubbles:!0,composed:!0}))}_handleDeleteArea(e){this.dispatchEvent(new CustomEvent("area-deleted",{detail:{area:e},bubbles:!0,composed:!0}))}_formatCoords(e){return`rows ${e.rowStart+1}-${e.rowEnd} / cols ${e.columnStart+1}-${e.columnEnd}`}_getSuggestedAreaName(){let e=1,t=`Area-${e}`;const i=new Set(this.areas.map(e=>e.name));for(;i.has(t);)e++,t=`Area-${e}`;return t}};Wt.styles=t`
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
  `,Gt([i({type:Array})],Wt.prototype,"areas",2),Gt([i({type:Object})],Wt.prototype,"selectedCells",2),Wt=Gt([a("grid-area-manager")],Wt);var qt=Object.defineProperty,Yt=Object.getOwnPropertyDescriptor,Xt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Yt(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&qt(t,i,a),a};let Kt=class extends o{constructor(){super(...arguments),this.config={...S},this.selectedCells=null,this.collapsedTabs=new Set}render(){return r`
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
                  min=${It}
                  max=${Pt}
                />
                <span class="dimension-info">
                  (${It}-${Pt})
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
                  min=${Bt}
                  max=${Mt}
                />
                <span class="dimension-info">
                  (${Bt}-${Mt})
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
                  ${g(this.config.rowSizes,(e,t)=>t,(e,t)=>r`
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
                  ${g(this.config.columnSizes,(e,t)=>t,(e,t)=>r`
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
                      max=${Tt}
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
                      max=${Tt}
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
    `}_handleRowsChange(e){const t=e.target;let i=parseInt(t.value)||1;i=Math.max(It,Math.min(Pt,i));const o={...this.config,rows:i};if(i>this.config.rowSizes.length){const e=i-this.config.rowSizes.length;o.rowSizes=[...this.config.rowSizes,...Array(e).fill(null).map(()=>Rt(1,"fr"))]}else i<this.config.rowSizes.length&&(o.rowSizes=this.config.rowSizes.slice(0,i));o.areas=this.config.areas.filter(e=>e.rowEnd<=i&&e.columnEnd<=this.config.columns),this.config=o,this._clearSelection()}_handleColumnsChange(e){const t=e.target;let i=parseInt(t.value)||1;i=Math.max(Bt,Math.min(Mt,i));const o={...this.config,columns:i};if(i>this.config.columnSizes.length){const e=i-this.config.columnSizes.length;o.columnSizes=[...this.config.columnSizes,...Array(e).fill(null).map(()=>Rt(1,"fr"))]}else i<this.config.columnSizes.length&&(o.columnSizes=this.config.columnSizes.slice(0,i));o.areas=this.config.areas.filter(e=>e.rowEnd<=this.config.rows&&e.columnEnd<=i),this.config=o,this._clearSelection()}_handleDimensionChange(e){const{index:t,type:i,dimension:o}=e.detail,r={...this.config};"row"===i?(r.rowSizes=[...this.config.rowSizes],r.rowSizes[t]=o):(r.columnSizes=[...this.config.columnSizes],r.columnSizes[t]=o),this.config=r}_handleGapChange(e,t){const i=e.target,o=Math.max(0,Math.min(Tt,parseInt(i.value)||0));this.config={...this.config,gap:{...this.config.gap,[t]:o}}}_handleCellsSelected(e){this.selectedCells=e.detail.selection}_handleAreaCreated(e){const{area:t}=e.detail;this.config={...this.config,areas:[...this.config.areas,t]},this._clearSelection()}_handleAreaDeleted(e){const{area:t}=e.detail;this.config={...this.config,areas:this.config.areas.filter(e=>e.name!==t.name)}}_clearSelection(){var e;this.selectedCells=null,null==(e=this.canvas)||e.clearSelection()}_toggleTab(e){this.collapsedTabs.has(e)?this.collapsedTabs.delete(e):this.collapsedTabs.add(e),this.requestUpdate()}_handleCancel(){this.dispatchEvent(new CustomEvent("editor-cancel",{bubbles:!0,composed:!0}))}_handleApply(){this.dispatchEvent(new CustomEvent("editor-apply",{detail:{config:this.config},bubbles:!0,composed:!0}))}};Kt.styles=t`
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
  `,Xt([i({type:Object})],Kt.prototype,"config",2),Xt([n()],Kt.prototype,"selectedCells",2),Xt([d("grid-visual-canvas")],Kt.prototype,"canvas",2),Kt=Xt([a("grid-layout-editor")],Kt);var Jt=Object.defineProperty,Qt=Object.getOwnPropertyDescriptor,Zt=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Qt(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Jt(t,i,a),a};let ei=class extends o{constructor(){super(...arguments),this.open=!1,this._escapeHandler=e=>{"Escape"===e.key&&this._handleCancel()}}connectedCallback(){super.connectedCallback(),this.config&&(this.editingConfig=JSON.parse(JSON.stringify(this.config)))}updated(e){super.updated(e),(e.has("open")&&this.open&&this.config||e.has("config")&&this.config&&this.open)&&(this.editingConfig=JSON.parse(JSON.stringify(this.config))),e.has("open")&&(this.open?this._addEscapeListener():this._removeEscapeListener())}disconnectedCallback(){super.disconnectedCallback(),this._removeEscapeListener()}render(){return this.editingConfig?r`
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
        `:r``}_addEscapeListener(){window.addEventListener("keydown",this._escapeHandler)}_removeEscapeListener(){window.removeEventListener("keydown",this._escapeHandler)}_handleBackdropClick(e){e.target===e.currentTarget&&this._handleCancel()}_handleCancel(){this.dispatchEvent(new CustomEvent("overlay-cancel",{bubbles:!0,composed:!0}))}_handleApply(e){this.dispatchEvent(new CustomEvent("overlay-apply",{detail:e.detail,bubbles:!0,composed:!0}))}};ei.styles=t`
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
    `,Zt([i({type:Boolean,reflect:!0})],ei.prototype,"open",2),Zt([i({type:Object})],ei.prototype,"config",2),Zt([n()],ei.prototype,"editingConfig",2),ei=Zt([a("grid-editor-overlay")],ei);var ti=Object.defineProperty,ii=Object.getOwnPropertyDescriptor,oi=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ii(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ti(t,i,a),a};let ri=class extends o{constructor(){super(...arguments),this.open=!1,this.title="",this.subtitle="",this.escapeHandler=e=>{"Escape"===e.key&&this.handleClose()}}updated(e){super.updated(e),e.has("open")&&(this.open?this.addEscapeListener():this.removeEscapeListener())}disconnectedCallback(){super.disconnectedCallback(),this.removeEscapeListener()}render(){return r`
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
    `}addEscapeListener(){window.addEventListener("keydown",this.escapeHandler)}removeEscapeListener(){window.removeEventListener("keydown",this.escapeHandler)}handleClose(){this.dispatchEvent(new CustomEvent("overlay-close",{bubbles:!0,composed:!0}))}};ri.styles=t`
    :host {
      display: block;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: var(--right-sidebar-width, 260px);
      z-index: 110;
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
  `,oi([i({type:Boolean,reflect:!0})],ri.prototype,"open",2),oi([i({type:String})],ri.prototype,"title",2),oi([i({type:String})],ri.prototype,"subtitle",2),ri=oi([a("property-editor-overlay")],ri);var ai=Object.defineProperty,si=Object.getOwnPropertyDescriptor,ni=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?si(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ai(t,i,a),a};const li=[{value:"top-left",label:"Top Left"},{value:"top-center",label:"Top Center"},{value:"top-right",label:"Top Right"},{value:"middle-left",label:"Middle Left"},{value:"middle-center",label:"Center"},{value:"middle-right",label:"Middle Right"},{value:"bottom-left",label:"Bottom Left"},{value:"bottom-center",label:"Bottom Center"},{value:"bottom-right",label:"Bottom Right"}];let di=class extends o{constructor(){super(...arguments),this.open=!1,this.linkModeState=null,this.selection=null,this.gridColor="#000000",this._handleLinkModeChanged=e=>{const t=e.detail;this.linkModeState=(null==t?void 0:t.state)??null},this._handleSelectionChanged=e=>{const t=e.detail;this.selection=(null==t?void 0:t.selection)??null},this._handleGridColorChanged=e=>{const t=e.detail;this.gridColor=(null==t?void 0:t.color)||"#000000"},this._handleClose=()=>{this.dispatchEvent(new CustomEvent("overlay-close",{bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),this.linkModeState=this.documentModel.getLinkModeState(),this.selection=this.documentModel.getLinkEditorSelection(),this.gridColor=this.documentModel.getLinkGridColor(),this.documentModel.addEventListener("link-mode-changed",this._handleLinkModeChanged),this.documentModel.addEventListener("link-editor-selection-changed",this._handleSelectionChanged),this.documentModel.addEventListener("link-grid-color-changed",this._handleGridColorChanged)}disconnectedCallback(){this.documentModel.removeEventListener("link-mode-changed",this._handleLinkModeChanged),this.documentModel.removeEventListener("link-editor-selection-changed",this._handleSelectionChanged),this.documentModel.removeEventListener("link-grid-color-changed",this._handleGridColorChanged),super.disconnectedCallback()}render(){var e,t,i,o,a,s,n;if(!this.block)return r``;const d=this._getPoints(),c=I(d,this._getSegments()),p=d.find(e=>{var t;return e.id===(null==(t=this.selection)?void 0:t.pointId)})??null,h=(null==(e=this.selection)?void 0:e.segmentIndex)??null,u=Boolean(this._getPropValue("smoothingEnabled",!1)),g=Number(this._getPropValue("smoothingTension",.15)),v=Boolean(null==(t=this.linkEditorPreferences)?void 0:t.showGrid),b=Boolean(null==(i=this.linkEditorPreferences)?void 0:i.snapToGrid),m=Boolean(null==(o=this.linkEditorPreferences)?void 0:o.snapToPoints),y=Boolean(null==(a=this.linkEditorPreferences)?void 0:a.snapToBlocks),f=Boolean(null==(s=this.linkEditorPreferences)?void 0:s.showPoints),x=this.gridColor,_=(null==(n=this.linkModeState)?void 0:n.mode)??"idle",k="draw"===_?"Drawing":"pick-anchor"===_?"Pick Anchor":"Editing";return r`
            <property-editor-overlay
                .open=${this.open}
                title="Link Editor"
                .subtitle=${this.block.label||this.block.id}
                @overlay-close=${this._handleClose}
            >
                <div class="section">
                    <div class="section-title">Mode</div>
                    <div class="mode-row">
                        <span class="mode-badge ${"idle"!==_?"active":""}">${k}</span>
                        ${"draw"===_?r`
                                <div class="mode-actions">
                                    <button class="action-button primary" @click=${this.controller.finishDrawing}>Finish Path</button>
                                </div>
                                <div class="hint">Click to add points. Right click or use Finish Path to complete.</div>
                              `:l}
                        ${"pick-anchor"===_?r`<div class="hint">Click a block on the canvas to anchor the selected point.</div>`:l}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Points</div>
                    ${0===d.length?r`<div class="empty">No points yet. Activate draw mode to add points.</div>`:r`
                            <div class="list">
                                ${d.map((e,t)=>{var i,o;const a=(null==(i=e.anchor)?void 0:i.blockId)?this.documentModel.getBlock(e.anchor.blockId):null,s=this._getBlockDisplayLabel(a);return r`
                                        <div
                                            class="list-item ${(null==(o=this.selection)?void 0:o.pointId)===e.id?"selected":""}"
                                            @click=${()=>this.controller.selectPoint(this.block.id,e.id)}
                                        >
                                            <span>P${t+1}</span>
                                            <span class="list-meta">
                                                ${s?r`<span class="anchor-chip">Anchor: ${s}</span>`:l}
                                                ${e.x.toFixed(1)}, ${e.y.toFixed(1)}
                                            </span>
                                        </div>
                                    `})}
                            </div>
                          `}

                    ${p?this._renderPointEditor(p,d):l}
                </div>

                <div class="section">
                    <div class="section-title">Segments</div>
                    ${0===c.length?r`<div class="empty">Add at least two points to edit segments.</div>`:r`
                            <div class="list">
                                ${c.map((e,t)=>r`
                                    <div
                                        class="list-item ${h===t?"selected":""}"
                                        @click=${()=>this.controller.selectSegment(this.block.id,t)}
                                    >
                                        <span>S${t+1}</span>
                                        <span class="list-meta">${e.type}</span>
                                    </div>
                                `)}
                            </div>
                            ${null!==h?this._renderSegmentEditor(h,c[h]):l}
                          `}
                </div>

                <div class="section">
                    <div class="section-title">Smoothing</div>
                    <sm-toggle-input
                        label="Smoothing"
                        .value=${u}
                        @change=${e=>this.controller.updateProp(this.block.id,"smoothingEnabled",e.detail.value)}
                    ></sm-toggle-input>
                    ${u?r`
                        <div class="row">
                            <sm-slider-input
                                label="Tension"
                                .value=${g}
                                .min=${0}
                                .max=${1}
                                .step=${.05}
                                @change=${e=>this.controller.updateProp(this.block.id,"smoothingTension",e.detail.value)}
                            ></sm-slider-input>
                        </div>
                    `:l}
                </div>

                <div class="section">
                    <div class="section-title">Grid & Snap</div>
                    <div class="row">
                        <sm-toggle-input
                            label="Show Points"
                            .value=${f}
                            @change=${e=>this._updatePreferences({showPoints:e.detail.value})}
                        ></sm-toggle-input>
                        <sm-toggle-input
                            label="Show Grid"
                            .value=${v}
                            @change=${e=>this._updatePreferences({showGrid:e.detail.value})}
                        ></sm-toggle-input>
                        ${v?r`
                            <sm-color-input
                                label="Grid Color"
                                .value=${x}
                                @change=${e=>this.documentModel.setLinkGridColor(e.detail.value)}
                            ></sm-color-input>
                        `:l}
                        ${v?r`
                            <sm-toggle-input
                                label="Snap to Grid"
                                .value=${b}
                                @change=${e=>this._updatePreferences({snapToGrid:e.detail.value})}
                            ></sm-toggle-input>
                        `:l}
                        <sm-toggle-input
                            label="Snap to Points"
                            .value=${m}
                            @change=${e=>this._updatePreferences({snapToPoints:e.detail.value})}
                        ></sm-toggle-input>
                        <sm-toggle-input
                            label="Snap to Blocks"
                            .value=${y}
                            @change=${e=>this._updatePreferences({snapToBlocks:e.detail.value})}
                        ></sm-toggle-input>
                    </div>
                </div>
            </property-editor-overlay>
        `}_renderPointEditor(e,t){var i,o,a,s,n,d,c,p;const h=Boolean(null==(i=e.anchor)?void 0:i.blockId),u="pick-anchor"===(null==(o=this.linkModeState)?void 0:o.mode)&&(null==(a=this.linkModeState)?void 0:a.anchorPickPointId)===e.id,g=h||u,v=(null==(s=e.anchor)?void 0:s.anchor)||"middle-center";return r`
            <div class="row">
                <div class="section-title">Selected Point</div>
                <div class="inline-grid">
                    <sm-number-input
                        label="X"
                        .value=${Number(e.x.toFixed(2))}
                        .min=${0}
                        .max=${100}
                        .step=${.1}
                        unit="%"
                        @change=${t=>this.controller.updatePointCoordinate(this.block.id,e.id,"x",t.detail.value)}
                    ></sm-number-input>
                    <sm-number-input
                        label="Y"
                        .value=${Number(e.y.toFixed(2))}
                        .min=${0}
                        .max=${100}
                        .step=${.1}
                        unit="%"
                        @change=${t=>this.controller.updatePointCoordinate(this.block.id,e.id,"y",t.detail.value)}
                    ></sm-number-input>
                </div>

                <sm-toggle-input
                    label="Anchor To Block"
                    .value=${g}
                    @change=${t=>this.controller.toggleAnchor(this.block.id,e.id,t.detail.value)}
                ></sm-toggle-input>

                ${g?r`
                    <div class="row">
                        <div class="anchor-actions">
                            <button class="action-button ${u?"active":""}" @click=${()=>this.controller.enterAnchorPick(this.block.id,e.id)}>
                                ${h?"Change Block":"Pick Block"}
                            </button>
                        </div>
                        <sm-select-input
                            label="Anchor Point"
                            .value=${v}
                            .options=${li}
                            @change=${t=>this.controller.updateAnchorPoint(this.block.id,e.id,t.detail.value)}
                        ></sm-select-input>
                        ${h?r`
                            <div class="inline-grid">
                                <sm-number-input
                                    label="Offset X"
                                    .value=${Number((null==(d=null==(n=e.anchor)?void 0:n.offset)?void 0:d.x.toFixed(2))??0)}
                                    .min=${-100}
                                    .max=${100}
                                    .step=${.1}
                                    unit="%"
                                    @change=${t=>this.controller.updateAnchorOffset(this.block.id,e.id,"x",t.detail.value)}
                                ></sm-number-input>
                                <sm-number-input
                                    label="Offset Y"
                                    .value=${Number((null==(p=null==(c=e.anchor)?void 0:c.offset)?void 0:p.y.toFixed(2))??0)}
                                    .min=${-100}
                                    .max=${100}
                                    .step=${.1}
                                    unit="%"
                                    @change=${t=>this.controller.updateAnchorOffset(this.block.id,e.id,"y",t.detail.value)}
                                ></sm-number-input>
                            </div>
                        `:l}
                    </div>
                `:l}

                ${t.length>2?r`
                    <div class="mode-actions">
                        <button class="action-button" @click=${()=>this.controller.deletePoint(this.block.id,e.id)}>Delete Point</button>
                    </div>
                `:l}
            </div>
        `}_renderSegmentEditor(e,t){const i=t.type||"line",o=t.curvePreset??"manual",a="number"==typeof t.curveBulge?t.curveBulge:.25,s=Boolean(t.curveAutoUpdate??!1);return r`
            <div class="row">
                <div class="section-title">Selected Segment</div>
                <sm-select-input
                    label="Type"
                    .value=${i}
                    .options=${[{value:"line",label:"Line"},{value:"curve",label:"Curve"}]}
                    @change=${t=>this.controller.setSegmentType(this.block.id,e,t.detail.value)}
                ></sm-select-input>
                ${"curve"===i?r`
                    <sm-select-input
                        label="Curve Preset"
                        .value=${o}
                        .options=${[{value:"smooth",label:"Smooth (No tension)"},{value:"arc",label:"Arc (Bulge)"},{value:"symmetric",label:"Symmetric"},{value:"manual",label:"Manual"}]}
                        @change=${t=>this.controller.setSegmentCurvePreset(this.block.id,e,t.detail.value)}
                    ></sm-select-input>
                    ${"arc"===o||"symmetric"===o?r`
                        <sm-slider-input
                            label="Bulge"
                            .value=${a}
                            .min=${-1}
                            .max=${1}
                            .step=${.05}
                            @change=${t=>this.controller.setSegmentCurveBulge(this.block.id,e,t.detail.value)}
                        ></sm-slider-input>
                    `:l}
                    <sm-toggle-input
                        label="Update on Move"
                        .value=${s}
                        @change=${t=>this.controller.setSegmentCurveAutoUpdate(this.block.id,e,t.detail.value)}
                    ></sm-toggle-input>
                    <div class="hint">Handles remain editable for full control.</div>
                `:r`<div class="hint">Curve segments expose handles on the canvas.</div>`}
            </div>
        `}_updatePreferences(e){this.eventBus.dispatchEvent("link-editor-preferences-changed",{preferences:e})}_getPoints(){var e,t;const i=null==(t=null==(e=this.block)?void 0:e.props)?void 0:t.points;return Array.isArray(i)?i:[]}_getSegments(){var e,t;const i=null==(t=null==(e=this.block)?void 0:e.props)?void 0:t.segments;return Array.isArray(i)?i:[]}_getBlockDisplayLabel(e){var t;if(!e)return null;if(e.label&&e.label.trim())return e.label.trim();const i=null==(t=this.blockRegistry)?void 0:t.getBlock(e.type);return(null==i?void 0:i.label)??e.type}_getPropValue(e,t){var i,o;const r=null==(o=null==(i=this.block)?void 0:i.props)?void 0:o[e];return r&&"object"==typeof r&&"value"in r?r.value??t:t}};di.styles=t`
        :host {
            display: contents;
        }

        .section {
            padding: 12px 8px;
            border-bottom: 1px solid var(--border-color, #d4d4d4);
        }

        .section-title {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary, #666);
            letter-spacing: 0.3px;
            margin-bottom: 10px;
        }

        .row > .section-title {
            margin-bottom: 0;
            margin-top: 10px;
        }

        .mode-row {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .mode-badge {
            align-self: flex-start;
            padding: 4px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            background: var(--bg-tertiary, #e8e8e8);
            color: var(--text-secondary, #666);
        }

        .mode-badge.active {
            background: rgba(0, 120, 212, 0.12);
            color: var(--accent-color, #0078d4);
        }

        .mode-actions {
            display: flex;
            gap: 8px;
        }

        .action-button {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid var(--border-color, #d4d4d4);
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
        }

        .action-button.primary {
            background: var(--accent-color, #0078d4);
            border-color: var(--accent-color, #0078d4);
            color: #fff;
        }

        .action-button.active {
            background: rgba(255, 193, 7, 0.15);
            border-color: #ffc107;
            color: #946200;
        }

        .hint {
            font-size: 11px;
            color: var(--text-secondary, #666);
        }

        .list {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 10px;
        }

        .list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 8px;
            border-radius: 4px;
            border: 1px solid transparent;
            background: var(--bg-secondary, #f5f5f5);
            cursor: pointer;
            font-size: 11px;
        }

        .list-item.selected {
            border-color: var(--accent-color, #0078d4);
            background: rgba(0, 120, 212, 0.08);
            color: var(--accent-color, #0078d4);
        }

        .list-meta {
            font-size: 10px;
            color: var(--text-secondary, #666);
        }

        .inline-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-top: 8px;
        }

        .row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 8px;
        }

        .anchor-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 12px;
        }

        .anchor-chip {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 999px;
            background: rgba(255, 193, 7, 0.2);
            color: #8a6d00;
            font-weight: 600;
        }

        .empty {
            font-size: 11px;
            color: var(--text-secondary, #666);
            font-style: italic;
        }
    `,ni([i({type:Boolean,reflect:!0})],di.prototype,"open",2),ni([i({type:Object})],di.prototype,"block",2),ni([i({attribute:!1})],di.prototype,"controller",2),ni([p({context:w})],di.prototype,"documentModel",2),ni([p({context:_})],di.prototype,"blockRegistry",2),ni([p({context:C})],di.prototype,"eventBus",2),ni([p({context:E,subscribe:!0})],di.prototype,"linkEditorPreferences",2),ni([n()],di.prototype,"linkModeState",2),ni([n()],di.prototype,"selection",2),ni([n()],di.prototype,"gridColor",2),di=ni([a("link-editor-overlay")],di);const ci=new P;var pi=Object.defineProperty,hi=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&pi(t,i,a),a};const ui=class extends o{constructor(){super(),this.label="",this.property="",this.category="",this.origin="default",this.hasLocalOverride=!1,this.bindingEnabled=!1,this.showBindingToggle=!0,this.showAnimationToggle=!0,this.showOriginBadge=!0,this.disabled=!1,this.showSlot=!0,this.controls=new Map,this.contents=new Map,this.controls.set("binding",()=>this._renderControlBinding()),this.controls.set("animation",()=>this._renderControlAnimation()),this.contents.set("binding",()=>this._renderBindingSummary())}render(){return r`
          <div class="property-header">
            <div class="label-group">
              <span class="label">${this.label}</span>
              ${this.showOriginBadge?r`
                <property-origin-badge
                  .origin=${this.origin}
                  .presetName=${this.presetName}
                  .originContainer=${this.originContainer}
                  compact
                ></property-origin-badge>
              `:l}
            </div>
            
            <div class="controls">
                ${this.hasLocalOverride?r`
                    <button
                        class="control-toggle"
                        @click=${this._handleReset}
                        ?disabled=${this.disabled}
                        data-tooltip="Reset to inherited value"
                        aria-label="Reset to inherited value"
                    >
                        <ha-icon icon="mdi:backup-restore"></ha-icon>
                    </button>
                `:l}
                ${Array.from(this.controls.values()).map(e=>e())}
            </div>
          </div>
    
          <div class="property-content">
              ${Array.from(this.contents.values()).map(e=>e())}
              ${this.showSlot?r`<slot></slot>`:l}
              ${this.helperText?r`<div class="helper-text">${this.helperText}</div>`:l}
          </div>
        `}_renderControlBinding(){const e=!!this.binding;return this.showSlot=!e,r`
            ${this.showBindingToggle?r`
            <button
              class="control-toggle ${e?"active":""}"
              @click=${this._requestBindingEdit}
              ?disabled=${this.disabled}
              data-tooltip=${e?"Edit binding":"Add binding"}
              aria-label=${e?"Edit binding":"Add binding"}
            >
              <ha-icon icon="mdi:link-plus"></ha-icon>
            </button>
          `:l}
        `}_renderControlAnimation(){return r`
            ${this.showAnimationToggle?r`
            <button
              class="control-toggle"
              @click=${this._requestAnimationEdit}
              ?disabled=${this.disabled}
              data-tooltip='Edit animation'
              aria-label='Edit animation'
            >
                <ha-icon icon="mdi:movie-open-play-outline"></ha-icon>
            </button>
          `:l}
        `}willUpdate(e){e.has("hass")&&(this._bindingEvaluator=this.hass?new B(this.hass,{resolveSlotEntity:e=>{var t;return null==(t=this.documentModel)?void 0:t.resolveSlotEntity(e)},onTemplateResult:()=>this.requestUpdate()}):void 0)}_requestBindingEdit(){this.disabled||this.dispatchEvent(new CustomEvent("property-binding-edit",{detail:{property:this.property,category:this.category,label:this.label},bubbles:!0,composed:!0}))}_emitBindingChange(e){this.dispatchEvent(new CustomEvent("property-binding-change",{detail:{property:this.property,category:this.category,binding:e},bubbles:!0,composed:!0}))}_requestAnimationEdit(){this.disabled||this.dispatchEvent(new CustomEvent("property-animation-edit",{detail:{property:this.property,category:this.category,label:this.label},bubbles:!0,composed:!0}))}_handleReset(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent("property-reset",{detail:{property:this.property,category:this.category},bubbles:!0,composed:!0}))}_handleRemoveBinding(e){e.stopPropagation(),this._emitBindingChange(null)}_evaluateBindingValue(){if(!this.binding)return{value:this.resolvedValue,success:!0};const e=this.resolvedValue??this.binding.default;return this._bindingEvaluator&&this.hass?this._bindingEvaluator.evaluate(this.binding,{defaultEntityId:this.defaultEntityId,defaultValue:e}):{value:e,success:!1}}_formatResolvedValue(e){if(null==e||""===e)return"--";const t={value:e,unit:this.resolvedUnit};return M(this.property,t)??String(e)}_formatBindingMode(e){return`${e.charAt(0).toUpperCase()}${e.slice(1)}`}_truncate(e,t){return e.length<=t?e:`${e.slice(0,t-3)}...`}_stringifyValue(e){if(null==e)return"unset";if("string"==typeof e)return e;if("number"==typeof e||"boolean"==typeof e)return String(e);try{return JSON.stringify(e)}catch(t){return String(e)}}_getBindingSummaryLines(e){var t,i,o,r,a,s;const n=[],l=(null==(t=e.entity)?void 0:t.slotId)??void 0,d=l?null==(i=this.documentModel)?void 0:i.resolveSlotEntity(l):void 0,c=l?d:(null==(o=e.entity)?void 0:o.entityId)??void 0,p=(null==(r=e.entity)?void 0:r.source)??"state";switch(l?(n.push(`Slot: ${l}`),c?n.push(`Entity: ${c}`):n.push("Entity: slot not set")):c?n.push(`Entity: ${c}`):this.defaultEntityId?n.push(`Entity: default (${this.defaultEntityId})`):n.push("Entity: default (not set)"),n.push("Source: "+("state"===p?"state":`attribute ${p}`)),n.push(`Mode: ${this._formatBindingMode(e.mode)}`),e.mode){case"direct":if(e.inputRange||e.outputRange){const t=e.inputRange?`${e.inputRange[0]}-${e.inputRange[1]}`:"auto",i=e.outputRange?`${e.outputRange[0]}-${e.outputRange[1]}`:"auto";n.push(`Range: ${t} -> ${i}`)}break;case"map":n.push(`Mappings: ${Object.keys(e.map??{}).length}`);break;case"threshold":n.push(`Thresholds: ${(null==(a=e.thresholds)?void 0:a.length)??0}`);break;case"template":e.template&&n.push(`Template: ${this._truncate(e.template,48)}`);break;case"condition":n.push(`Conditions: ${(null==(s=e.conditions)?void 0:s.length)??0}`)}return void 0!==e.default&&""!==e.default&&n.push(`Default: ${this._stringifyValue(e.default)}`),n}_renderBindingSummary(){if(!this.binding)return l;const e=this._evaluateBindingValue(),t=this._formatResolvedValue(e.value),i=this._getBindingSummaryLines(this.binding);return r`
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
    `}};ui.styles=t`
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
            flex-shrink: 0;
            --mdc-icon-size: 18px;
        }

        .control-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px 5px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 5px;
            background: transparent;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .control-toggle:has(+ .control-toggle) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        
        .control-toggle + .control-toggle {
            border-left: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }

        .control-toggle:hover:not(:disabled) {
            background: var(--bg-secondary, #f5f5f5);
            border-color: var(--border-color, #d4d4d4);
            color: var(--text-primary, #333);
        }

        .control-toggle.active {
            background: rgba(0, 120, 212, 0.1);
            outline: 1px solid var(--accent-color);
            outline-offset: -1px;
            color: var(--accent-color, #0078d4);
        }

        .control-toggle:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .property-content {
            /* Slot for the actual input */
        }

        .helper-text {
            margin-top: 6px;
            font-size: 10px;
            color: var(--text-secondary, #666);
        }

        /* Tooltip for binding toggle */

        .control-toggle[data-tooltip] {
            position: relative;
        }

        .control-toggle[data-tooltip]::after {
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

        .control-toggle[data-tooltip]:hover::after {
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
    `;let gi=ui;hi([i({attribute:!1})],gi.prototype,"hass"),hi([p({context:w})],gi.prototype,"documentModel"),hi([i({type:String})],gi.prototype,"label"),hi([i({type:String})],gi.prototype,"property"),hi([i({type:String})],gi.prototype,"category"),hi([i({type:String})],gi.prototype,"origin"),hi([i({type:String})],gi.prototype,"presetName"),hi([i({type:String})],gi.prototype,"originContainer"),hi([i({type:Boolean})],gi.prototype,"hasLocalOverride"),hi([i({attribute:!1})],gi.prototype,"binding"),hi([i({attribute:!1})],gi.prototype,"resolvedValue"),hi([i({type:String})],gi.prototype,"resolvedUnit"),hi([i({type:String})],gi.prototype,"helperText"),hi([i({type:Boolean})],gi.prototype,"bindingEnabled"),hi([i({type:Boolean})],gi.prototype,"showBindingToggle"),hi([i({type:Boolean})],gi.prototype,"showAnimationToggle"),hi([i({type:Boolean})],gi.prototype,"showOriginBadge"),hi([i({type:Boolean})],gi.prototype,"disabled"),hi([i({type:String})],gi.prototype,"defaultEntityId"),ci.define("property-row",gi);class vi{renderPropertyRow(e,t,i,o={}){const{description:a,resolvedValue:s,propertyValue:n}=o,l=o.classes?o.classes:[];if(!e.binding)return r`
                <div class="property-row ${l.join(" ")}">
                  <label class="property-label" title="${a||""}">${e.label}</label>
                  ${t}
                </div>
            `;const d=null==n?void 0:n.binding;return r`
            <property-row
                class="property-row ${l.join(" ")}"
                .hass=${i.hass}
                .label=${e.label}
                .property=${e.name}
                .category=${"props"}
                .origin=${"default"}
                .hasLocalOverride=${!1}
                .binding=${d}
                .resolvedValue=${s}
                .defaultEntityId=${i.defaultEntityId}
                .showBindingToggle=${!0}
                .showAnimationToggle=${!1}
                .showOriginBadge=${!1}
                title=${a||""}
            >
                ${t}
            </property-row>
            `}getPropertyValue(e,t){const i=this.getPropertyValueObject(e);return i?i.value??t:t}getPropertyValueObject(e){if(!e||"object"!=typeof e)return;return"value"in e||"binding"in e?e:void 0}getValue(e,t){return null==e?t:e}}class bi extends vi{render(e,t,i,o){var a;const s=null==(a=o.actionHandlers)?void 0:a.get(e.actionId);return r`
      <div class="property-row">
        <button
          class="edit-grid-button"
          @click=${()=>{s?s():console.warn(`[ActionTraitRenderer] No handler found for action: ${e.actionId}`)}}
        >
          ${e.icon?r`<span class="action-icon">${e.icon}</span>`:""}
          ${e.buttonLabel}
        </button>
      </div>
    `}}class mi extends vi{render(e,t,i,o){var a,s,n;const d=this.getPropertyValueObject(t),c=this.getPropertyValue(t,""),p=null==(a=o.documentModel)?void 0:a.resolveEntityForBlock(o.block.id),h=null==p?void 0:p.entityId;let u=[];if(h&&(null==(n=null==(s=o.hass)?void 0:s.states)?void 0:n[h])){const e=o.hass.states[h];u=["last_changed","last_updated",...Object.keys(e.attributes||{}).sort()]}const g=u.length>0&&""!==c&&!u.includes(c),v=g?"__custom__":c;return this.renderPropertyRow(e,r`
                ${0===u.length?r`
                    <!-- No attributes available - show text input -->
                    <input
                        type="text"
                        class="property-input"
                        .value=${c}
                        @input=${t=>{i(e.name,t.target.value)}}
                        placeholder=${e.placeholder||"Enter attribute name"}
                    />
                    ${h?r`
                        <div class="info-text" style="margin-top: 4px;">
                            This entity has no attributes
                        </div>
                    `:r`
                        <div class="info-text" style="margin-top: 4px;">
                            No entity configured - enter attribute name manually
                        </div>
                    `}
                `:r`
                    <!-- Attributes available - show dropdown with custom option -->
                    <select
                        class="property-input"
                        .value=${v}
                        @change=${t=>{const o=t.target.value;"__custom__"===o?g||i(e.name,"custom_attribute"):i(e.name,o)}}
                    >
                        ${""===c?r`
                            <option value="">Select attribute...</option>
                        `:l}
                        ${u.map(e=>r`
                            <option value=${e} ?selected=${c===e}>
                                ${e}
                            </option>
                        `)}
                        <option value="__custom__" ?selected=${g}>
                            Custom...
                        </option>
                    </select>
                    ${g?r`
                        <input
                            type="text"
                            class="property-input"
                            style="margin-top: 8px;"
                            .value=${c}
                            @input=${t=>{i(e.name,t.target.value)}}
                            placeholder=${e.placeholder||"Enter attribute name"}
                        />
                    `:l}
                `}
            `,o,{description:e.description,resolvedValue:c,propertyValue:d})}}class yi extends vi{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,!1);return this.renderPropertyRow(e,r`
            <label class="toggle-switch">
                <input
                    type="checkbox"
                    .checked=${Boolean(s)}
                    @change=${t=>{i(e.name,t.target.checked)}}
                />
                <span class="toggle-slider"></span>
            </label>
          `,o,{description:e.description,resolvedValue:s,propertyValue:a,classes:["property-row-inline"]})}}class fi extends vi{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"#000000");return this.renderPropertyRow(e,r`
        <input
          type="color"
          class="property-input"
          .value=${String(s)}
          @input=${t=>{i(e.name,t.target.value)}}
        />
      `,o,{description:e.description,resolvedValue:s,propertyValue:a})}}class xi extends vi{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,""),n=this._resolveOptions(e,o),l=this._ensureCurrentOption(n,s),d=l.length>0,c=e.emptyLabel??"No options available";return this.renderPropertyRow(e,r`
                <select
                    class="property-input"
                    .value=${String(s)}
                    ?disabled=${!d}
                    @change=${t=>{i(e.name,t.target.value)}}
                >
                    ${d?l.map(e=>r`
                            <option value="${e.value}" ?selected=${s===e.value}>
                                ${e.label}
                            </option>
                        `):r`<option value="">${c}</option>`}
                </select>
            `,o,{description:e.description,resolvedValue:s,propertyValue:a})}_resolveOptions(e,t){if("function"==typeof e.optionsProvider){const i=e.optionsProvider(t);if(Array.isArray(i))return i}return e.options??[]}_ensureCurrentOption(e,t){return t?e.some(e=>e.value===t)?e:[{value:t,label:t},...e]:e}}class _i extends vi{render(e,t,i,o){const a="slot"===this.getPropertyValue(t,"fixed"),s=e.slotIdProp||"slotId",n=o.props[s],l="object"==typeof n&&null!==n&&"value"in n?n.value??"":n||"";return r`
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
    `}}class ki extends vi{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return o.hass?this.renderPropertyRow(e,r`
        <ha-selector
          .hass=${o.hass}
          .selector=${{entity:{multiple:!1,domain:e.includeDomains,device_class:e.deviceClass}}}
          .value=${s}
          @value-changed=${t=>{i(e.name,t.detail.value)}}
        ></ha-selector>
      `,o,{description:e.description,resolvedValue:s,propertyValue:a}):r``}}class wi extends vi{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return o.hass?this.renderPropertyRow(e,r`
        <ha-icon-picker
          .hass=${o.hass}
          .value=${s}
          @value-changed=${t=>{i(e.name,t.detail.value)}}
        ></ha-icon-picker>
      `,o,{description:e.description,resolvedValue:s,propertyValue:a}):r``}}class $i extends vi{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return this.renderPropertyRow(e,r`
        <div class="property-info">
          ${s}
          ${e.description?r`
            <div class="info-text">${e.description}</div>
          `:""}
        </div>
      `,o,{resolvedValue:s,propertyValue:a})}}class Si extends vi{render(e,t,i,o){var a,s;const n=this.getPropertyValueObject(t),l=this.getPropertyValue(t,""),d=Boolean(l),c=d?T(l)||l:e.emptyLabel??"No media selected",p=`media-picker-open:${e.name}`,h=`media-picker-clear:${e.name}`,u=null==(a=o.actionHandlers)?void 0:a.get(p),g=null==(s=o.actionHandlers)?void 0:s.get(h),v=e.selectLabel??"Select media",b=e.editLabel??"Edit",m=e.removeLabel??"Remove",y=r`
            <div class="media-picker ${d?"has-value":"empty"}">
                <div class="media-chip" title=${d?l:""}>
                    ${c}
                </div>
                <div class="media-picker-actions">
                    ${d?r`
                        <button
                            class="media-action-btn"
                            @click=${()=>{u?u():console.warn(`[MediaPickerTrait] No handler for ${p}`)}}
                        >
                            ${b}
                        </button>
                        <button
                            class="media-action-btn danger"
                            @click=${()=>{g?g():console.warn(`[MediaPickerTrait] No handler for ${h}`)}}
                        >
                            ${m}
                        </button>
                    `:r`
                        <button
                            class="media-action-btn primary"
                            @click=${()=>{u?u():console.warn(`[MediaPickerTrait] No handler for ${p}`)}}
                        >
                            ${v}
                        </button>
                    `}
                </div>
            </div>
        `;return this.renderPropertyRow(e,y,o,{resolvedValue:l,propertyValue:n,classes:["media-picker-row"]})}}class Ci extends vi{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,0);return this.renderPropertyRow(e,r`
        <input
          type="number"
          class="property-input"
          .value=${String(s)}
          min="${e.min??""}"
          max="${e.max??""}"
          step="${e.step??1}"
          @input=${t=>{const o=t.target.value,r=e.step&&e.step<1?parseFloat(o):parseInt(o,10);i(e.name,isNaN(r)?0:r)}}
        />
      `,o,{description:e.description,resolvedValue:s,propertyValue:a})}}class Ei extends vi{render(e,t,i,o){const a=this.getPropertyValueObject(t),s=this.getPropertyValue(t,"");return this.renderPropertyRow(e,r`
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
      `,o,{description:e.description,resolvedValue:s,propertyValue:a})}}class Ii extends vi{render(e,t,i,o){var a;const s=this.getPropertyValueObject(t),n=this.getPropertyValue(t,""),l="object"==typeof n&&null!==n&&"isTemplate"in n?n.value:n,d=null==(a=o.templateErrors)?void 0:a[e.name],c=e.templateKeywords&&e.templateKeywords.length>0;return this.renderPropertyRow(e,r`
                <input
                        type="text"
                        class="property-input"
                        .value=${String(l)}
                        placeholder="${e.placeholder||""}"
                        @input=${t=>{i(e.name,t.target.value)}}
                />
                ${c?r`
                    <div class="template-legend">
                        ${e.templateKeywords.map(e=>r`
                            <div class="template-legend-row">
                                <code>{{${e.key}}}</code>
                                <span>${e.description}</span>
                            </div>
                        `)}
                    </div>
                `:""}
                ${d?r`
                    <div class="template-error">${d}</div>`:""}
            `,o,{description:e.description,resolvedValue:l,propertyValue:s})}}class Pi extends vi{render(e,t,i,o){var a;const s=this.getPropertyValueObject(t),n=this.getPropertyValue(t,""),l=null==(a=o.templateErrors)?void 0:a[e.name],d=e.templateKeywords&&e.templateKeywords.length>0;return this.renderPropertyRow(e,r`
        <textarea
          class="property-input"
          rows="${e.rows||3}"
          placeholder="${e.placeholder||""}"
          .value=${String(n)}
          @input=${t=>{i(e.name,t.target.value)}}
        ></textarea>
        ${d?r`
          <div class="template-legend">
            ${e.templateKeywords.map(e=>r`
              <div class="template-legend-row">
                <code>{{${e.key}}}</code>
                <span>${e.description}</span>
              </div>
            `)}
          </div>
        `:""}
        ${l?r`<div class="template-error">${l}</div>`:""}
      `,o,{description:e.description,resolvedValue:n,propertyValue:s})}}const Bi=class{static register(e,t){this.renderers.set(e,t)}static get(e){return this.initialize(),this.renderers.get(e)}static render(e,t,i,o){this.initialize();const a=this.renderers.get(e.type);return a?a.render(e,t,i,o):(console.warn(`[TraitRendererFactory] No renderer found for trait type: ${e.type}`),r`
        <div class="property-row">
          <span class="property-label">${e.label}</span>
          <span style="color: var(--error-color, red); font-size: 11px;">
            Unknown trait type: ${e.type}
          </span>
        </div>
      `)}static hasRenderer(e){return this.initialize(),this.renderers.has(e)}static initialize(){this.initialized||(this.register("text",new Ii),this.register("number",new Ci),this.register("color",new fi),this.register("checkbox",new yi),this.register("select",new Ei),this.register("context-select",new xi),this.register("textarea",new Pi),this.register("entity-picker",new ki),this.register("icon-picker",new wi),this.register("action",new bi),this.register("media-picker",new Si),this.register("info",new $i),this.register("entity-mode",new _i),this.register("attribute-picker",new mi),this.initialized=!0)}};Bi.renderers=new Map,Bi.initialized=!1;let Mi=Bi;class Ti{static evaluate(e,t){return void 0===e||this._evaluateCondition(e,t)}static _evaluateCondition(e,t){const{props:i}=t;if(function(e){return"prop"in e&&"eq"in e}(e)){return this._getNestedValue(i,e.prop)===e.eq}if(function(e){return"prop"in e&&"neq"in e}(e)){return this._getNestedValue(i,e.prop)!==e.neq}if(function(e){return"prop"in e&&"in"in e}(e)){const t=this._getNestedValue(i,e.prop);return e.in.includes(t)}if(function(e){return"prop"in e&&"exists"in e}(e)){const t=this._getNestedValue(i,e.prop),o=null!=t&&""!==t;return e.exists?o:!o}return function(e){return"and"in e}(e)?e.and.every(e=>this._evaluateCondition(e,t)):function(e){return"or"in e}(e)?e.or.some(e=>this._evaluateCondition(e,t)):function(e){return"not"in e}(e)?!this._evaluateCondition(e.not,t):(console.warn("[VisibilityEvaluator] Unknown condition type:",e),!0)}static _getNestedValue(e,t){const i=t.split(".");let o=e;for(const r of i){if(null==o)return;o=o[r]}return o}}var zi=Object.defineProperty,Ri=Object.getOwnPropertyDescriptor,Di=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ri(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&zi(t,i,a),a};let Oi=class extends o{constructor(){super(...arguments),this.label="",this.groupId="",this.collapsed=!1,this._isCollapsed=!1,this._hasRestoredState=!1}connectedCallback(){super.connectedCallback(),this._restoreState()}willUpdate(e){e.has("collapsed")&&!this._hasRestoredState&&(this._isCollapsed=this.collapsed)}render(){return r`
      <div class="property-group">
        <div class="group-header" @click=${this._toggleCollapsed}>
          <span class="group-label">${this.label}</span>
          <span class="collapse-icon ${this._isCollapsed?"":"expanded"}">▶</span>
        </div>
        <div class="group-content ${this._isCollapsed?"collapsed":""}">
          <slot></slot>
        </div>
      </div>
    `}_restoreState(){if(!this.groupId)return;const e=Oi.STORAGE_PREFIX+this.groupId,t=localStorage.getItem(e);null!==t?(this._isCollapsed="true"===t,this._hasRestoredState=!0):this._isCollapsed=this.collapsed}_saveState(){if(!this.groupId)return;const e=Oi.STORAGE_PREFIX+this.groupId;localStorage.setItem(e,String(this._isCollapsed))}_toggleCollapsed(){this._isCollapsed=!this._isCollapsed,this._saveState(),this.dispatchEvent(new CustomEvent("group-toggle",{detail:{groupId:this.groupId,collapsed:this._isCollapsed},bubbles:!0,composed:!0}))}};Oi.styles=t`
    :host {
      display: block;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--bg-secondary);
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease;
      border-bottom: 1px solid var(--border-color);
    }

    .group-header:hover {
      background: var(--bg-tertiary);
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
  `,Oi.STORAGE_PREFIX="card-builder-property-group-",Di([i({type:String})],Oi.prototype,"label",2),Di([i({type:String})],Oi.prototype,"groupId",2),Di([i({type:Boolean})],Oi.prototype,"collapsed",2),Di([n()],Oi.prototype,"_isCollapsed",2),Oi=Di([a("property-group")],Oi);var Ai=Object.defineProperty,Li=Object.getOwnPropertyDescriptor,Vi=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Li(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ai(t,i,a),a};const Ni=["unavailable","unknown"],Fi={alarm_control_panel:["disarmed","armed_home","armed_away","armed_night","armed_vacation","armed_custom_bypass","arming","disarming","pending","triggered"],automation:["on","off"],binary_sensor:["on","off"],cover:["open","closed","opening","closing","stopped"],device_tracker:["home","not_home"],fan:["on","off"],input_boolean:["on","off"],light:["on","off"],lock:["locked","unlocked","locking","unlocking","jammed"],media_player:["off","idle","playing","paused","standby","buffering"],person:["home","not_home"],script:["on","off"],siren:["on","off"],sun:["above_horizon","below_horizon"],switch:["on","off"],timer:["idle","active","paused"],update:["on","off"],vacuum:["idle","cleaning","paused","returning","docked","error"],weather:["clear-night","cloudy","exceptional","fog","hail","lightning","lightning-rainy","partlycloudy","pouring","rainy","snowy","snowy-rainy","sunny","windy","windy-variant"]},ji=new Set(["alarm_control_panel","automation","binary_sensor","climate","cover","device_tracker","fan","input_boolean","input_select","light","lock","media_player","person","script","select","siren","sun","switch","timer","update","vacuum","water_heater","weather"]),Ui=new Set(["counter","input_number","number","proximity","sensor"]);let Hi=class extends o{constructor(){super(...arguments),this.slots=[],this.disabled=!1,this._entityConfig={mode:"inherited"},this._resolvedEntityInfo=null,this._valueSource="state",this._availableAttributes=[],this._stateOptions=null,this._thresholdSupported=!0,this._mode="direct",this._mapEntries=[],this._thresholds=[],this._template="",this._defaultValue=void 0,this._defaultHasValue=!1,this._inputRange=[0,100],this._outputRange=[0,100],this._useRangeMapping=!1}get _effectiveEntityId(){return"inherited"===this._entityConfig.mode?this.defaultEntityId:"slot"===this._entityConfig.mode?this._getSlotEntityId(this._entityConfig.slotId):"fixed"===this._entityConfig.mode?this._entityConfig.entityId:void 0}connectedCallback(){super.connectedCallback(),this._syncFromBinding()}disconnectedCallback(){super.disconnectedCallback(),this._disposeTemplateSession()}shouldUpdate(e){return e.has("binding")&&this._syncFromBinding(),e.has("valueInputConfig")&&this._syncValueInputConfig(),e.has("defaultEntityId")&&!e.has("binding")&&(this._updateEntityOptions(),this._updateTemplatePreview()),e.has("slots")&&!e.has("binding")&&(this._loadAvailableAttributes(),this._updateEntityOptions(),this._updateTemplatePreview()),e.has("hass")&&this._updateTemplatePreview(),(!e.has("hass")||1!==e.size)&&super.shouldUpdate(e)}render(){return this.hass?r`
            ${this._renderEntitySourceSection()}
            ${this._renderValueSourceSection()}

            <div class="section">
                <div class="section-title">Binding Mode</div>
                <div class="mode-selector">
                    ${this._renderModeButton("direct","Direct")}
                    ${this._renderModeButton("map","Map")}
                    ${this._thresholdSupported?this._renderModeButton("threshold","Threshold"):l}
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
        `:r``}_syncFromBinding(){if(!this.binding)return this._mode="direct",this._defaultValue=void 0,this._defaultHasValue=!1,this._mapEntries=[],this._thresholds=[],this._template="",this._useRangeMapping=!1,this._entityConfig={mode:"inherited"},this._valueSource="state",this._syncValueInputConfig(),this._updateEntityOptions(),void this._updateResolvedEntityInfo();switch(this._mode=this.binding.mode,this._defaultHasValue=void 0!==this.binding.default,this._defaultValue=this._defaultHasValue?this.binding.default:this._getDefaultValueForInput(),this.binding.entity?(void 0!==this.binding.entity.slotId?this._entityConfig={mode:"slot",slotId:this.binding.entity.slotId||void 0}:void 0!==this.binding.entity.entityId?this._entityConfig={mode:"fixed",entityId:this.binding.entity.entityId||void 0}:this._entityConfig={mode:"inherited"},this._valueSource=this.binding.entity.source||"state",this._loadAvailableAttributes()):(this._entityConfig={mode:"inherited"},this._valueSource="state"),this.binding.mode){case"direct":{const e=this.binding;this._useRangeMapping=!(!e.inputRange&&!e.outputRange),this._inputRange=e.inputRange??[0,100],this._outputRange=e.outputRange??[0,100];break}case"map":{const e=this.binding;this._mapEntries=Object.entries(e.map).map(([e,t])=>({key:e,value:t}));break}case"threshold":{const e=this.binding;this._thresholds=[...e.thresholds];break}case"template":{const e=this.binding;this._template=e.template;break}}this._syncValueInputConfig(),this._updateEntityOptions(),this._updateResolvedEntityInfo(),this._updateTemplatePreview()}_buildBinding(){const e="inherited"===this._entityConfig.mode&&"state"===this._valueSource?void 0:{entityId:"fixed"===this._entityConfig.mode?this._entityConfig.entityId||null:void 0,slotId:"slot"===this._entityConfig.mode?this._entityConfig.slotId||null:void 0,source:this._valueSource},t={default:this._defaultHasValue?this._normalizeDefaultValue(this._defaultValue):void 0,entity:e};switch(this._mode){case"direct":{const e={...t,mode:"direct"};return this._useRangeMapping&&(e.inputRange=this._inputRange,e.outputRange=this._outputRange),e}case"map":{const e={};for(const t of this._mapEntries)t.key&&(e[t.key]=t.value);return{...t,mode:"map",map:e}}case"threshold":return{...t,mode:"threshold",thresholds:this._thresholds};case"condition":return{...t,mode:"condition",conditions:[]};case"template":return{...t,mode:"template",template:this._template}}}_emitChange(){const e=this._buildBinding();this.dispatchEvent(new CustomEvent("binding-change",{detail:{binding:e,unit:this._valueUnit},bubbles:!0,composed:!0}))}_handleModeChange(e){this._mode=e,this._emitChange(),this._updateTemplatePreview()}_handleDefaultValueChange(e,t){this._defaultValue=e,this._defaultHasValue=!this._isEmptyDefaultValue(e),this._setValueUnit(t),this._emitChange()}_clearDefaultValue(){this._defaultValue=this._getDefaultValueForInput(),this._defaultHasValue=!1,this._emitChange()}_addMapEntry(){this._mapEntries=[...this._mapEntries,{key:"",value:this._getDefaultValueForInput()}]}_updateMapEntryKey(e,t){this._mapEntries=this._mapEntries.map((i,o)=>o===e?{...i,key:t}:i),this._emitChange()}_updateMapEntryValue(e,t,i){this._mapEntries=this._mapEntries.map((i,o)=>o===e?{...i,value:t}:i),this._setValueUnit(i),this._emitChange()}_removeMapEntry(e){this._mapEntries=this._mapEntries.filter((t,i)=>i!==e),this._emitChange()}_addThreshold(){this._thresholds=[...this._thresholds,{min:0,max:100,value:this._getDefaultValueForInput()}]}_updateThreshold(e,t,i){this._thresholds=this._thresholds.map((o,r)=>r===e?{...o,[t]:i}:o),this._emitChange()}_updateThresholdValue(e,t,i){this._thresholds=this._thresholds.map((i,o)=>o===e?{...i,value:t}:i),this._setValueUnit(i),this._emitChange()}_removeThreshold(e){this._thresholds=this._thresholds.filter((t,i)=>i!==e),this._emitChange()}_toggleRangeMapping(e){this._useRangeMapping=e.target.checked,this._emitChange()}_updateRange(e,t,i){"input"===e?this._inputRange=0===t?[i,this._inputRange[1]]:[this._inputRange[0],i]:this._outputRange=0===t?[i,this._outputRange[1]]:[this._outputRange[0],i],this._emitChange()}_handleEntityConfigChange(e){this._entityConfig=e.detail,this._updateResolvedEntityInfo(),this._loadAvailableAttributes(),this._updateEntityOptions(),this._emitChange(),this._updateTemplatePreview()}_updateResolvedEntityInfo(){const e=this._effectiveEntityId;e?"inherited"===this._entityConfig.mode?this._resolvedEntityInfo={source:"inherited",entityId:e}:"fixed"===this._entityConfig.mode?this._resolvedEntityInfo={source:"fixed",entityId:e}:"slot"===this._entityConfig.mode?this._resolvedEntityInfo={source:"slot",entityId:e,slotId:this._entityConfig.slotId}:this._resolvedEntityInfo={source:"none",entityId:void 0}:this._resolvedEntityInfo={source:"none",entityId:void 0}}_handleManageSlots(){this.dispatchEvent(new CustomEvent("manage-entities-slots",{bubbles:!0,composed:!0}))}_handleValueSourceTypeChange(e){const t=e.target.value;this._valueSource="state"===t?"state":this._availableAttributes[0]||"",this._updateEntityOptions(),this._emitChange(),this._updateTemplatePreview()}_handleAttributeChange(e){const t=e.target.value;if("__custom__"===t){if(!this._availableAttributes.includes(this._valueSource)&&"state"!==this._valueSource)return;this._valueSource="custom_attribute"}else this._valueSource=t||"state";this._updateEntityOptions(),this._emitChange(),this._updateTemplatePreview()}_handleCustomAttributeInput(e){const t=e.target.value;t&&"state"!==t&&(this._valueSource=t,this._updateEntityOptions(),this._emitChange(),this._updateTemplatePreview())}_loadAvailableAttributes(){var e,t;const i=this._effectiveEntityId;if(!i||!(null==(t=null==(e=this.hass)?void 0:e.states)?void 0:t[i]))return void(this._availableAttributes=[]);const o=this.hass.states[i],r=Object.keys(o.attributes||{}).sort();this._availableAttributes=["last_changed","last_updated",...r]}_getSlotEntityId(e){var t;if(e)return null==(t=this.slots.find(t=>t.id===e))?void 0:t.entityId}_syncValueInputConfig(){var e;const t=this.valueInputConfig;if(t){if("number"===t.type||"slider"===t.type||"spacing"===t.type){const i=t.unit??(null==(e=t.units)?void 0:e[0]);return i?void((!this._valueUnit||t.units&&!t.units.includes(this._valueUnit))&&(this._valueUnit=i)):void(this._valueUnit=void 0)}this._valueUnit=void 0}else this._valueUnit=void 0}_setValueUnit(e){e&&e!==this._valueUnit&&(this._valueUnit=e)}_normalizeDefaultValue(e){if("string"!=typeof e||""!==e.trim())return e}_isEmptyDefaultValue(e){return null==e||"string"==typeof e&&""===e.trim()}_getDefaultValueForInput(){var e;const t=this.valueInputConfig;if(!t)return"";switch(t.type){case"color":return"#000000";case"number":case"slider":return t.min??0;case"select":return(null==(e=t.options[0])?void 0:e.value)??"";case"spacing":return{top:0,right:0,bottom:0,left:0};default:return""}}_getEntityState(){var e,t;const i=this._effectiveEntityId;if(i&&(null==(t=null==(e=this.hass)?void 0:e.states)?void 0:t[i]))return this.hass.states[i]}_getEntityDomain(e){if(!e)return;const[t]=e.split(".");return t||void 0}_buildStateOptions(e,t){const i=[],o=e=>{i.includes(e)||i.push(e)};for(const r of e)"string"==typeof r&&r&&o(r);null!=t&&o(String(t));for(const r of Ni)o(r);return i}_getAttributeStateOptions(e,t){if("input_select"===e||"select"===e){const e=t.options;if(Array.isArray(e))return e}if("climate"===e){const e=t.hvac_modes;if(Array.isArray(e))return e}if("water_heater"===e){const e=t.operation_list??t.available_modes;if(Array.isArray(e))return e}return null}_getStateOptions(){if("state"!==this._valueSource)return null;const e=this._getEntityState();if(!e)return null;const t=this._getEntityDomain(e.entity_id);if(!t)return null;const i=this._getAttributeStateOptions(t,e.attributes||{});if(i)return this._buildStateOptions(i,e.state);const o=Fi[t];return o?this._buildStateOptions(o,e.state):null}_isNumericValue(e){return"number"==typeof e?!Number.isNaN(e):"string"==typeof e&&""!==e.trim()&&!Number.isNaN(Number(e))}_isThresholdSupported(){if("state"===this._valueSource){if(this._stateOptions&&this._stateOptions.length>0)return!1;const e=this._getEntityDomain(this._effectiveEntityId);if(e&&ji.has(e))return!1;const t=this._getEntityState();return t&&this._isNumericValue(t.state)||e&&Ui.has(e),!0}const e=this._getEntityState();if(!e)return!0;const t=(e.attributes||{})[this._valueSource];return null==t||""===t||this._isNumericValue(t)}_updateEntityOptions(){this._stateOptions=this._getStateOptions(),this._thresholdSupported=this._isThresholdSupported()}_coerceSpacing(e){if(e&&"object"==typeof e){const t=e;return{top:Number(t.top??0),right:Number(t.right??0),bottom:Number(t.bottom??0),left:Number(t.left??0)}}}_coerceNumber(e,t){const i="number"==typeof e?e:Number(e);return Number.isFinite(i)?i:t}_renderValueInput(e,t,i){var o,a,s,n;const d=this.valueInputConfig;if(!d||"text"===d.type){const o=d&&"text"===d.type&&d.placeholder?d.placeholder:i??"";return r`
                <input
                    type="text"
                    class="entry-row-value-output"
                    .value=${"string"==typeof e?e:void 0===e?"":String(e)}
                    @input=${e=>t(e.target.value)}
                    placeholder=${o}
                    ?disabled=${this.disabled}
                />
            `}switch(d.type){case"icon-picker":{const i="string"==typeof e?e:"";return this.hass?r`
                    <ha-icon-picker
                        class="entry-row-value-output"   
                        .hass=${this.hass}
                        .value=${i}
                        .placeholder=${d.placeholder}
                        @value-changed=${e=>t(e.detail.value)}
                    ></ha-icon-picker>
                `:l}case"color":return r`
                    <sm-color-input
                        class="entry-row-value-output"
                        .value=${"string"==typeof e&&e?e:"#000000"}
                        @change=${e=>t(e.detail.value)}
                    ></sm-color-input>
                `;case"select":{const i=void 0!==e?String(e):(null==(o=d.options[0])?void 0:o.value)??"";return r`
                    <sm-select-input
                        class="entry-row-value-output"
                        .value=${i}
                        .options=${d.options}
                        @change=${e=>t(e.detail.value)}
                    ></sm-select-input>
                `}case"spacing":{const i=this._valueUnit??d.unit??(null==(a=d.units)?void 0:a[0])??"px",o=d.units??(d.unit?[d.unit]:["px"]);return r`
                    <sm-spacing-input
                        class="entry-row-value-output"
                        .value=${this._coerceSpacing(e)}
                        .unit=${i}
                        .units=${o}
                        @change=${e=>t(e.detail.value,e.detail.unit)}
                    ></sm-spacing-input>
                `}case"slider":{const i=this._valueUnit??d.unit??(null==(s=d.units)?void 0:s[0]),o=d.units??(d.unit?[d.unit]:[]);return r`
                    <sm-slider-input
                        class="entry-row-value-output"
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
                            class="entry-row-value-output"    
                            type="number"
                            .value=${String(this._coerceNumber(e,d.min??0))}
                            min=${d.min??""}
                            max=${d.max??""}
                            step=${d.step??1}
                            @input=${e=>t(Number(e.target.value))}
                            ?disabled=${this.disabled}
                        />
                    `;const i=this._valueUnit??d.unit??(null==(n=d.units)?void 0:n[0])??"px",o=d.units??(d.unit?[d.unit]:["px"]);return r`
                    <sm-number-input
                        class="entry-row-value-output"    
                        .value=${this._coerceNumber(e,d.min??0)}
                        min=${d.min??""}
                        max=${d.max??""}
                        step=${d.step??1}
                        .unit=${i}
                        .units=${o}
                        @change=${e=>t(e.detail.value,e.detail.unit)}
                    ></sm-number-input>
                `}default:return l}}_handleTemplateChange(e){this._template=e.target.value,this._emitChange(),this._updateTemplatePreview()}_updateTemplatePreview(){var e;if(!this.hass||"template"!==this._mode)return this._templateError=void 0,void this._disposeTemplateSession();const t=null==(e=this._template)?void 0:e.trim();if(!t)return this._templateError=void 0,void this._disposeTemplateSession();const i=this._buildTemplateVariables();this._getTemplateSession().update({template:t,variables:i,reportErrors:!0,debounceMs:250})}_buildTemplateVariables(){const e=this._getEntityState(),t=this._getTemplateValue(e);return z(e,t)}_getTemplateValue(e){if(e)return"state"===this._valueSource?e.state:"last_changed"===this._valueSource?e.last_changed:"last_updated"===this._valueSource?e.last_updated:(e.attributes||{})[this._valueSource]}_getTemplateSession(){return this._templateSession||(this._templateSession=new R(this.hass,{onResult:()=>{this._templateError=void 0,this.requestUpdate()},onError:e=>{this._templateError=e.error,this.requestUpdate()}})),this._templateSession}_disposeTemplateSession(){this._templateSession&&(this._templateSession.dispose(),this._templateSession=void 0)}_renderEntitySourceSection(){return r`
            <div class="section">
                <div class="section-title">Entity Source</div>
                <entity-config-editor
                    .config=${this._entityConfig}
                    .hass=${this.hass}
                    .block=${this.block}
                    .resolvedInfo=${this._resolvedEntityInfo}
                    .slots=${this.slots}
                    ?disabled=${this.disabled}
                    @config-changed=${this._handleEntityConfigChange}
                    @manage-entities-slots=${this._handleManageSlots}
                ></entity-config-editor>
            </div>
        `}_renderValueSourceSection(){const e=!!this._effectiveEntityId,t="state"!==this._valueSource,i=t&&this._availableAttributes.length>0&&!this._availableAttributes.includes(this._valueSource),o=i?"__custom__":this._valueSource;return r`
            <div class="section">
                <div class="section-title">Value Source</div>
                <div class="row">
                    <label>Source</label>
                    <select
                        .value=${t?"attribute":"state"}
                        @change=${this._handleValueSourceTypeChange}
                        ?disabled=${this.disabled||!e}
                    >
                        <option value="state">State</option>
                        <option value="attribute">Attribute</option>
                    </select>
                </div>
                ${t?r`
                    <div class="row" style="margin-top: 8px;">
                        <label>Attribute</label>
                        <select
                            .value=${o}
                            @change=${this._handleAttributeChange}
                            ?disabled=${this.disabled}
                        >
                            ${this._availableAttributes.length>0?this._availableAttributes.map(e=>r`
                                    <option value=${e} ?selected=${this._valueSource===e}>${e}</option>
                                `):l}
                            <option value="__custom__" ?selected=${i}>Custom...</option>
                        </select>
                    </div>
                    ${i?r`
                        <div class="row" style="margin-top: 8px;">
                            <label>Custom</label>
                            <input
                                type="text"
                                .value=${this._valueSource}
                                @input=${this._handleCustomAttributeInput}
                                placeholder="Enter attribute name"
                                ?disabled=${this.disabled}
                            />
                        </div>
                    `:l}
                `:l}
            </div>
        `}_renderModeButton(e,t){return r`
            <button
                    class="mode-btn ${this._mode===e?"active":""}"
                    @click=${()=>this._handleModeChange(e)}
                    ?disabled=${this.disabled}
            >
                ${t}
            </button>
        `}_renderModeConfig(){switch(this._mode){case"direct":return this._renderDirectConfig();case"map":return this._renderMapConfig();case"threshold":return this._renderThresholdConfig();case"template":return this._renderTemplateConfig();default:return l}}_renderDirectConfig(){return r`
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
                `:l}
            </div>
        `}_renderMapConfig(){const e=this._stateOptions;return r`
            <div class="section section-map">
                <div class="section-title">Value Mapping</div>
                <div class="entries-list">
                    ${this._mapEntries.map((t,i)=>r`
                        <div class="entry-row">
                            ${e&&e.length>0?r`
                                <select
                                    class="entry-row-value-input entry-row-map-input"    
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
                                    class="entry-row-value-input entry-row-map-input"
                                    .value=${t.key}
                                    @input=${e=>this._updateMapEntryKey(i,e.target.value)}
                                    placeholder="State value"
                                    ?disabled=${this.disabled}
                                />
                            `}
                            <span class="entry-row-map-separator">→</span>
                            ${this._renderValueInput(t.value,(e,t)=>this._updateMapEntryValue(i,e,t),"Output value")}
                            <button
                                class="entry-row-delete icon-btn danger"
                                @click=${()=>this._removeMapEntry(i)}
                                ?disabled=${this.disabled}
                            >×
                            </button>
                        </div>
                    `)}
                    <button class="add-btn entry-row-add" @click=${this._addMapEntry} ?disabled=${this.disabled}>
                        + Add Mapping
                    </button>
                </div>
            </div>
        `}_renderThresholdConfig(){return r`
            <div class="section section-thresholds">
                <div class="section-title">Thresholds</div>
                <div class="entries-list">
                    ${this._thresholds.map((e,t)=>r`
                        <div class="entry-row">
                            <input
                                type="number"
                                class="entry-row-value-input entry-row-threshold-input entry-row-threshold-input-min"
                                .value=${String(e.min??"")}
                                @input=${e=>this._updateThreshold(t,"min",Number(e.target.value))}
                                placeholder="Min"
                                style="width: 60px; flex: none;"
                                ?disabled=${this.disabled}
                            />
                            <span class="entry-row-threshold-minmax-separator">≤ X <</span>
                            <input
                                type="number"
                                class="entry-row-value-input entry-row-threshold-input entry-row-threshold-input-max"
                                .value=${String(e.max??"")}
                                @input=${e=>this._updateThreshold(t,"max",Number(e.target.value))}
                                placeholder="Max"
                                style="width: 60px; flex: none;"
                                ?disabled=${this.disabled}
                            />
                            <span class="entry-row-threshold-separator">→</span>
                            ${this._renderValueInput(e.value,(e,i)=>this._updateThresholdValue(t,e,i),"Output")}
                            <button
                                class="icon-btn danger entry-row-delete"
                                @click=${()=>this._removeThreshold(t)}
                                ?disabled=${this.disabled}
                            >×
                            </button>
                        </div>
                    `)}
                    <button class="add-btn entry-row-add" @click=${this._addThreshold} ?disabled=${this.disabled}>
                        + Add Threshold
                    </button>
                </div>
            </div>
        `}_renderTemplateConfig(){return r`
            <div class="section section-template">
                <div class="section-title">Template</div>
                <textarea
                        .value=${this._template}
                        @input=${this._handleTemplateChange}
                        placeholder="{{value | round(2)}}px"
                        ?disabled=${this.disabled}
                ></textarea>
                <div class="template-legend">
                    ${D.map(e=>r`
                        <div class="template-legend-row">
                            <code>{{${e.key}}}</code>
                            <span>${e.description}</span>
                        </div>
                    `)}
                </div>
                ${this._templateError?r`<div class="template-error">${this._templateError}</div>`:l}
            </div>
        `}};Hi.styles=t`
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
            align-items: stretch;
            margin-bottom: 8px;
        }
        
        .row > label {
            align-self: center;
        }

        .row:last-child {
            margin-bottom: 0;
        }

        label {
            font-size: 13px;
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
            font-size: 13px;
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
            font-size: 13px;
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
            align-items: stretch;
        }

        .entry-row input {
            flex: 1;
        }

        .entry-row select {
            flex: 1;
        }
        
        .entry-row-value-input {
            min-width: initial;
        }
        .entry-row-map-separator,
        .entry-row-threshold-separator,
        .entry-row-threshold-minmax-separator {
            align-self: center;
        }
        .entry-row-threshold-minmax-separator {
            white-space: nowrap;
        }
        .entry-row-value-output {
            min-width: 0;
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
            align-items: center;
            padding: 6px 10px;
            border: 1px dashed var(--border-color, #d4d4d4);
            border-radius: 3px;
            background: transparent;
            color: var(--text-secondary, #666);
            font-size: 12px;
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


        .attribute-select {
            margin-top: 4px;
        }

        .template-legend {
            margin-top: 6px;
            padding: 6px 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 4px;
            font-size: 10px;
            color: var(--text-secondary, #666);
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .template-legend-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .template-legend-row code {
            font-family: monospace;
            font-size: 10px;
            color: var(--primary-text-color, #333);
        }

        .template-error {
            margin-top: 4px;
            font-size: 10px;
            color: var(--error-color, #d32f2f);
            white-space: pre-wrap;
        }
    `,Vi([i({attribute:!1})],Hi.prototype,"hass",2),Vi([i({type:Object})],Hi.prototype,"block",2),Vi([i({attribute:!1})],Hi.prototype,"binding",2),Vi([i({type:String})],Hi.prototype,"defaultEntityId",2),Vi([i({attribute:!1})],Hi.prototype,"slots",2),Vi([i({type:Boolean})],Hi.prototype,"disabled",2),Vi([i({attribute:!1})],Hi.prototype,"valueInputConfig",2),Vi([n()],Hi.prototype,"_entityConfig",2),Vi([n()],Hi.prototype,"_resolvedEntityInfo",2),Vi([n()],Hi.prototype,"_valueSource",2),Vi([n()],Hi.prototype,"_availableAttributes",2),Vi([n()],Hi.prototype,"_stateOptions",2),Vi([n()],Hi.prototype,"_thresholdSupported",2),Vi([n()],Hi.prototype,"_valueUnit",2),Vi([n()],Hi.prototype,"_mode",2),Vi([n()],Hi.prototype,"_mapEntries",2),Vi([n()],Hi.prototype,"_thresholds",2),Vi([n()],Hi.prototype,"_template",2),Vi([n()],Hi.prototype,"_templateError",2),Vi([n()],Hi.prototype,"_defaultValue",2),Vi([n()],Hi.prototype,"_defaultHasValue",2),Vi([n()],Hi.prototype,"_inputRange",2),Vi([n()],Hi.prototype,"_outputRange",2),Vi([n()],Hi.prototype,"_useRangeMapping",2),Hi=Vi([a("property-binding-editor")],Hi);var Gi=Object.defineProperty,Wi=Object.getOwnPropertyDescriptor,qi=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Wi(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Gi(t,i,a),a};let Yi=class extends o{constructor(){super(...arguments),this.props={},this.bindingEditorOpen=!1,this.bindingEditorTarget=null,this.slots=[],this.templateErrors={},this.templateSessions=new Map,this._handleSlotsChanged=()=>{var e;this.slots=(null==(e=this.documentModel)?void 0:e.getSlotEntities())??[],this.requestUpdate()}}connectedCallback(){super.connectedCallback(),this.documentModel&&(this.slots=this.documentModel.getSlotEntities(),this.documentModel.addEventListener("slots-changed",this._handleSlotsChanged))}disconnectedCallback(){var e;super.disconnectedCallback(),null==(e=this.documentModel)||e.removeEventListener("slots-changed",this._handleSlotsChanged),this._disposeTemplateSessions()}render(){if(!this.config||!this.config.groups||0===this.config.groups.length)return r`
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
        `}openBindingEditor(e){const t=this._findTraitByName(e);(null==t?void 0:t.binding)&&(this.bindingEditorTarget={name:e,label:t.label},this.bindingEditorOpen=!0)}updated(e){var t,i;e.has("block")&&(null==(t=e.get("block"))?void 0:t.id)!==(null==(i=this.block)?void 0:i.id)&&(this._closeBindingEditor(!0),this._disposeTemplateSessions(),this.templateErrors={}),e.has("hass")&&(this._disposeTemplateSessions(),this.templateErrors={}),(e.has("props")||e.has("block")||e.has("hass"))&&this._syncTemplateSessions()}_isGroupVisible(e){const t=this._getVisibilityContext();return Ti.evaluate(e.visible,t)}_isTraitVisible(e){const t=this._getVisibilityContext();return Ti.evaluate(e.visible,t)}_getVisibilityContext(){var e,t,i;return{props:this._getRawProps(),blockContext:{parentManaged:null==(e=this.block)?void 0:e.parentManaged,type:null==(t=this.block)?void 0:t.type,id:null==(i=this.block)?void 0:i.id}}}_renderGroup(e){const t=e.traits.filter(e=>this._isTraitVisible(e));return 0===t.length?l:r`
            <property-group
                    .label=${e.label}
                    .groupId=${e.id}
                    ?collapsed=${e.collapsed??!1}
            >
                ${t.map(e=>this._renderTrait(e))}
            </property-group>
        `}_renderTrait(e){const t=this._getTraitPropertyValue(e.name),i={hass:this.hass,block:this.block,props:this.props,actionHandlers:this.actionHandlers,defaultEntityId:this.defaultEntityId,documentModel:this.documentModel,templateErrors:this.templateErrors};return Mi.render(e,t,this._handleTraitChange.bind(this),i)}_handleTraitChange(e,t){this._updateTemplateSession(e,t),this.dispatchEvent(new CustomEvent("trait-changed",{detail:{name:e,value:t},bubbles:!0,composed:!0}))}_syncTemplateSessions(){var e;const t=(null==(e=this.config)?void 0:e.groups)??[],i=new Set;for(const o of t)for(const e of o.traits){if(!this._isTraitVisible(e))continue;const t=this._getRawPropValue(e.name);this._updateTemplateSession(e.name,t,e)&&i.add(e.name)}for(const o of this.templateSessions.keys())i.has(o)||(this._disposeTemplateSession(o),this._clearTemplateError(o))}_updateTemplateSession(e,t,i){if(!this.hass||!this.block)return!1;const o=i??this._findTraitByName(e);if(!o)return!1;const r=this._extractTemplateInfo(o,t);if(!r)return this._clearTemplateError(e),this._disposeTemplateSession(e),!1;return this._getTemplateSession(e).update({template:r.template,variables:r.variables,reportErrors:!0,debounceMs:250}),!0}_extractTemplateInfo(e,t){const i=this._getTemplateString(e,t);if(!i)return null;return{template:i,variables:this._buildTemplateVariables(e)}}_getTemplateString(e,t){const i=e.templateKeywords;return i&&i.length>0?null==t?"":String(t):null}_buildTemplateVariables(e){var t,i,o,r,a;const s=null==(t=this.documentModel)?void 0:t.resolveEntityForBlock(this.block.id).entityId,n=s?null==(o=null==(i=this.hass)?void 0:i.states)?void 0:o[s]:void 0;let l=null==n?void 0:n.state;const d=this._getRawPropValue("attributeName");d&&(null==n?void 0:n.attributes)&&(l=n.attributes[String(d)]);const c=z(n,l);if("customName"===e.name){const e=(null==(r=null==n?void 0:n.attributes)?void 0:r.friendly_name)||s;c.name=e,c.value=e}if("customState"===e.name){const e=(null==(a=null==n?void 0:n.attributes)?void 0:a.friendly_name)||s;c.name=e}return c}_getRawPropValue(e){const t=this.props[e];return t&&"object"==typeof t&&"value"in t?t.value:t}_getTemplateSession(e){let t=this.templateSessions.get(e);return t||(t=new R(this.hass,{onResult:()=>this._clearTemplateError(e),onError:t=>this._setTemplateError(e,t.error)}),this.templateSessions.set(e,t)),t}_disposeTemplateSession(e){const t=this.templateSessions.get(e);t&&(t.dispose(),this.templateSessions.delete(e))}_disposeTemplateSessions(){for(const e of this.templateSessions.values())e.dispose();this.templateSessions.clear()}_setTemplateError(e,t){this.templateErrors[e]!==t&&(this.templateErrors={...this.templateErrors,[e]:t})}_clearTemplateError(e){if(!this.templateErrors[e])return;const t={...this.templateErrors};delete t[e],this.templateErrors=t}_handleBindingEdit(e){if("props"!==e.detail.category)return;const t=this._findTraitByName(e.detail.property);(null==t?void 0:t.binding)&&(this.bindingEditorTarget={name:e.detail.property,label:e.detail.label},this.bindingEditorOpen=!0)}_handleBindingChange(e){"props"===e.detail.category&&this.dispatchEvent(new CustomEvent("trait-binding-changed",{detail:{name:e.detail.property,binding:e.detail.binding},bubbles:!0,composed:!0}))}_closeBindingEditor(e=!1){this.bindingEditorOpen=!1,e&&(this.bindingEditorTarget=null)}_getTraitPropertyValue(e){const t=this.props[e];if(!t||"object"!=typeof t)return;return"value"in t||"binding"in t?t:void 0}_getRawProps(){const e={};for(const[t,i]of Object.entries(this.props))e[t]=i&&"object"==typeof i&&"value"in i?i.value:i;return e}_findTraitByName(e){var t;const i=(null==(t=this.config)?void 0:t.groups)??[];for(const o of i){const t=o.traits.find(t=>t.name===e);if(t)return t}}_renderBindingEditorOverlay(){if(!this.bindingEditorTarget)return l;const e=this._findTraitByName(this.bindingEditorTarget.name);if(!(null==e?void 0:e.binding))return l;const t=this._getTraitPropertyValue(this.bindingEditorTarget.name),i=null==t?void 0:t.binding;return r`
            <property-binding-editor-overlay
                    .open=${this.bindingEditorOpen}
                    .hass=${this.hass}
                    .label=${this.bindingEditorTarget.label}
                    .category=${"props"}
                    .propertyName=${this.bindingEditorTarget.name}
                    .block=${this.block}
                    .binding=${i}
                    .defaultEntityId=${this.defaultEntityId}
                    .slots=${this.slots}
                    .valueInputConfig=${e.binding}
                    @property-binding-change=${this._handleBindingChange}
                    @overlay-close=${()=>this._closeBindingEditor()}
            ></property-binding-editor-overlay>
        `}};Yi.styles=t`
        :host {
            display: block;
        }

        .traits-container {
            display: flex;
            flex-direction: column;
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

        .property-row.property-row-inline {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
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

        .media-picker-row {
            gap: 6px;
        }

        .media-picker {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .media-chip {
            padding: 6px 10px;
            border-radius: 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border: 1px solid var(--divider-color, #e0e0e0);
            font-size: 12px;
            color: var(--primary-text-color, #333);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .media-picker-actions {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        .media-action-btn {
            border: 1px solid var(--divider-color, #d4d4d4);
            background: var(--card-background-color, #fff);
            color: var(--text-primary, #333);
            border-radius: 4px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .media-action-btn.primary {
            background: var(--primary-color, #03a9f4);
            color: var(--text-primary-color, #fff);
            border-color: transparent;
        }

        .media-action-btn.danger {
            border: 1px solid rgba(211, 47, 47, 0.4);
            background: rgba(211, 47, 47, 0.1);
            color: #b71c1c;
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

        .template-legend {
            margin-top: 4px;
            padding: 6px 8px;
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 4px;
            font-size: 10px;
            color: var(--text-secondary, #666);
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .template-legend-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .template-legend-row code {
            font-family: monospace;
            font-size: 10px;
            color: var(--primary-text-color, #333);
        }

        .template-error {
            margin-top: 4px;
            font-size: 10px;
            color: var(--error-color, #d32f2f);
            white-space: pre-wrap;
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
    `,qi([p({context:w})],Yi.prototype,"documentModel",2),qi([i({attribute:!1})],Yi.prototype,"config",2),qi([i({attribute:!1})],Yi.prototype,"props",2),qi([i({attribute:!1})],Yi.prototype,"block",2),qi([i({attribute:!1})],Yi.prototype,"hass",2),qi([i({attribute:!1})],Yi.prototype,"actionHandlers",2),qi([i({type:String})],Yi.prototype,"defaultEntityId",2),qi([n()],Yi.prototype,"bindingEditorOpen",2),qi([n()],Yi.prototype,"bindingEditorTarget",2),qi([n()],Yi.prototype,"slots",2),qi([n()],Yi.prototype,"templateErrors",2),Yi=qi([a("traits-panel")],Yi);var Xi=Object.defineProperty,Ki=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&Xi(t,i,a),a};const Ji=class extends nt{constructor(){super(...arguments),this.selectedBlock=null,this.resolvedEntityInfo=null,this.pendingBlockId="",this.blockIdError=null,this.idDirty=!1,this.pendingMediaRequestId=null,this.pendingMediaTarget=null,this.gridEditorOpen=!1,this.linkEditorOpen=!1,this.gridEditorBlockId=null,this.linkEditorBlockId=null,this._handleGridEditorOpen=e=>{var t;const i=(null==e?void 0:e.blockId)??(null==(t=this.selectedBlock)?void 0:t.id)??null;if(!i)return;const o=this.documentModel.getBlock(i);o&&"block-grid"===o.type&&(this.gridEditorBlockId=i,this.gridEditorOpen=!0,this.overlayHost.invalidateOverlays())},this._handleGridEditorClose=()=>{this._closeGridEditor()},this._handleLinkEditorOpen=e=>{const t=(null==e?void 0:e.blockId)??this.documentModel.getLinkModeState().activeLinkId??null;if(!t)return;const i=this.documentModel.getBlock(t);i&&"block-link"===i.type&&(this.documentModel.select(t),this.linkEditorBlockId=t,this.linkEditorOpen=!0,this.overlayHost.invalidateOverlays())},this._handleLinkEditorClose=()=>{this.linkEditorOpen=!1,this.linkEditorBlockId=null,this.overlayHost.invalidateOverlays()},this._closeGridEditor=()=>{this.gridEditorOpen=!1,this.gridEditorBlockId=null,this.overlayHost.invalidateOverlays()},this._closeLinkEditor=()=>{var e;null==(e=this.linkModeController)||e.closeEditor()},this._applyGridConfig=e=>{const{config:t}=e.detail;this.gridEditorBlockId&&(this.documentModel.updateBlock(this.gridEditorBlockId,{props:{gridConfig:t}}),this._closeGridEditor())}}connectedCallback(){super.connectedCallback(),this.overlayHost.registerOverlay("grid-editor",()=>this._renderGridEditorOverlay()),this.overlayHost.registerOverlay("link-editor",()=>this._renderLinkEditorOverlay()),this.documentModel.addEventListener("selection-changed",e=>{var t;const i=e.detail;this.selectedBlock=i.selectedBlock||null,this.pendingBlockId=(null==(t=this.selectedBlock)?void 0:t.id)||"",this.blockIdError=null,this.idDirty=!1,this.pendingMediaRequestId=null,this.pendingMediaTarget=null,this._updateResolvedEntityInfo()}),this.documentModel.addEventListener("block-updated",e=>{const t=e.detail;this.selectedBlock&&t.block.id===this.selectedBlock.id&&(this.selectedBlock={...t.block},this._updateResolvedEntityInfo(),this.idDirty||(this.pendingBlockId=t.block.id)),this.gridEditorBlockId!==t.block.id&&this.linkEditorBlockId!==t.block.id||this.overlayHost.invalidateOverlays()}),this.documentModel.addEventListener("block-deleted",e=>{const t=e.detail;(null==t?void 0:t.blockId)&&(this.gridEditorBlockId===t.blockId&&this._closeGridEditor(),this.linkEditorBlockId===t.blockId&&this._closeLinkEditor())}),this.eventBus.addEventListener("grid-editor-open",this._handleGridEditorOpen),this.eventBus.addEventListener("grid-editor-close",this._handleGridEditorClose),this.eventBus.addEventListener("link-editor-open",this._handleLinkEditorOpen),this.eventBus.addEventListener("link-editor-close",this._handleLinkEditorClose),this.eventBus.addEventListener("media-manager-selected",e=>{var t;if(!e||e.requestId!==this.pendingMediaRequestId||!this.pendingMediaTarget)return;this.pendingMediaRequestId=null;const{prop:i,sourceProp:o,sourceValue:r}=this.pendingMediaTarget;this.pendingMediaTarget=null,(null==(t=e.selection)?void 0:t.reference)&&(this._updatePropWithBinding(i,e.selection.reference),o&&this._updatePropWithBinding(o,r??"media"))}),this.eventBus.addEventListener("media-manager-cancelled",e=>{e&&e.requestId===this.pendingMediaRequestId&&(this.pendingMediaRequestId=null,this.pendingMediaTarget=null)})}disconnectedCallback(){this.overlayHost.unregisterOverlay("grid-editor"),this.overlayHost.unregisterOverlay("link-editor"),this.eventBus.removeEventListener("grid-editor-open",this._handleGridEditorOpen),this.eventBus.removeEventListener("grid-editor-close",this._handleGridEditorClose),this.eventBus.removeEventListener("link-editor-open",this._handleLinkEditorOpen),this.eventBus.removeEventListener("link-editor-close",this._handleLinkEditorClose),super.disconnectedCallback()}render(){if(!this.selectedBlock)return r`
                <div class="empty-state">
                    <ha-icon icon="mdi:tag-outline"></ha-icon>
                    <div>Select an element to edit its properties</div>
                </div>
            `;const e=this.blockRegistry.getBlock(this.selectedBlock.type),t=this.selectedBlock.id===this.documentModel.rootId?"Card":(null==e?void 0:e.label)||this.selectedBlock.type,i=this.pendingBlockId.trim()!==this.selectedBlock.id&&""!==this.pendingBlockId.trim(),o=this.selectedBlock.id===this.documentModel.rootId;return r`
            <div class="info-row">
                <span class="info-label">Type</span>
                <span class="info-value">${t}</span>
            </div>
            
            ${o?l:r`
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
                            ?disabled=${!i}
                            @click=${this._applyBlockId}
                        >
                            Apply
                        </button>
                    </div>
                    ${this.blockIdError?r`<div class="id-error">${this.blockIdError}</div>`:l}
                </div>
            </div>`}
            
            <!-- Entity Configuration Section -->
            ${this._renderEntityConfigSection()}
            
            <div class="panel-content">
                ${this._renderProperties()}
            </div>
        `}openTraitBindingEditor(e){var t,i;const o=null==(t=this.shadowRoot)?void 0:t.querySelector("traits-panel");null==(i=null==o?void 0:o.openBindingEditor)||i.call(o,e)}_updateResolvedEntityInfo(){this.selectedBlock?this.resolvedEntityInfo=this.documentModel.resolveEntityForBlock(this.selectedBlock.id):this.resolvedEntityInfo=null}_onBlockLabelChanged(e){if(!this.selectedBlock)return;const t=e.target.value.trim();this.documentModel.updateBlock(this.selectedBlock.id,{label:t||void 0})}_onBlockIdInput(e){const t=e.target;this.pendingBlockId=t.value,this.blockIdError=null,this.idDirty=!!this.selectedBlock&&this.pendingBlockId.trim()!==this.selectedBlock.id}_applyBlockId(){if(!this.selectedBlock)return;const e=this.documentModel.updateBlockId(this.selectedBlock.id,this.pendingBlockId);e.success?(this.pendingBlockId=this.pendingBlockId.trim(),this.blockIdError=null,this.idDirty=!1):this.blockIdError=e.error||"Unable to update ID"}_renderEntityConfigSection(){if(!this.selectedBlock)return l;const e=this.selectedBlock.entityConfig||{mode:"inherited"};return r`
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
        `}_renderProperties(){var e;if(!this.selectedBlock)return r``;const t=this.documentModel.getElement(this.selectedBlock.id),i=null==t?void 0:t.getPanelConfig(),o=null==i?void 0:i.properties;return o?r`
            <traits-panel
                .config=${o}
                .props=${this.selectedBlock.props||{}}
                .block=${this.selectedBlock}
                .hass=${this.hass}
                .defaultEntityId=${null==(e=this.resolvedEntityInfo)?void 0:e.entityId}
                .actionHandlers=${this._getActionHandlers()}
                @trait-changed=${this._onTraitChanged}
                @trait-binding-changed=${this._onTraitBindingChanged}
            ></traits-panel>
        `:r`
                <div class="placeholder-text">
                    No editable properties available for this element
                </div>
            `}_getActionHandlers(){var e;const t=new Map([["open-grid-editor",()=>this._openGridEditor()],["open-link-editor",()=>this._openLinkEditor()]]),i=this._getPanelConfig(),o=(null==(e=null==i?void 0:i.properties)?void 0:e.groups)??[];for(const r of o)for(const e of r.traits??[])this._isMediaPickerTrait(e)&&(t.set(`media-picker-open:${e.name}`,()=>this._openMediaPicker(e)),t.set(`media-picker-clear:${e.name}`,()=>this._clearMediaPicker(e)));return t}_onTraitChanged(e){const{name:t,value:i}=e.detail,o=this._getTraitPropertyValue(t),r={value:i,binding:null==o?void 0:o.binding};this._updateProp(t,r)}_onTraitBindingChanged(e){if(!this.selectedBlock)return;const t=this._getTraitPropertyValue(e.detail.name),i={value:null==t?void 0:t.value,binding:e.detail.binding??void 0};this._updateProp(e.detail.name,i)}_getTraitPropertyValue(e){var t,i;const o=null==(i=null==(t=this.selectedBlock)?void 0:t.props)?void 0:i[e];if(!o||"object"!=typeof o)return;return"value"in o||"binding"in o?o:void 0}_getPanelConfig(){if(!this.selectedBlock)return;const e=this.documentModel.getElement(this.selectedBlock.id);return null==e?void 0:e.getPanelConfig()}_isMediaPickerTrait(e){return"media-picker"===e.type}_openMediaPicker(e){if(!this.eventBus)return;const t=`media-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;this.pendingMediaRequestId=t,this.pendingMediaTarget={prop:e.name,sourceProp:e.sourceProp,sourceValue:e.sourceValue},this.eventBus.dispatchEvent("media-manager-open",{mode:"select",requestId:t,title:"Select media",subtitle:"Choose or upload a file",confirmLabel:"Use media"})}_clearMediaPicker(e){this._updatePropWithBinding(e.name,"")}_updatePropWithBinding(e,t){const i=this._getTraitPropertyValue(e),o={value:t,binding:null==i?void 0:i.binding};this._updateProp(e,o)}_updateProp(e,t){this.selectedBlock&&this.documentModel.updateBlock(this.selectedBlock.id,{props:{[e]:t}})}_openGridEditor(){this.selectedBlock&&this.eventBus.dispatchEvent("grid-editor-open",{blockId:this.selectedBlock.id})}_openLinkEditor(){var e;this.selectedBlock&&"block-link"===this.selectedBlock.type&&(null==(e=this.linkModeController)||e.openEditor(this.selectedBlock.id))}_renderGridEditorOverlay(){var e;if(!this.gridEditorOpen||!this.gridEditorBlockId)return l;const t=this._getGridBlock(),i=(null==(e=null==t?void 0:t.props)?void 0:e.gridConfig)||null;return t&&i?r`
            <grid-editor-overlay
                .open=${this.gridEditorOpen}
                .config=${i}
                @overlay-cancel=${this._closeGridEditor}
                @overlay-apply=${this._applyGridConfig}
            ></grid-editor-overlay>
        `:l}_renderLinkEditorOverlay(){const e=this._getLinkBlock();return e?r`
            <link-editor-overlay
                .open=${this.linkEditorOpen}
                .block=${e}
                .controller=${this.linkModeController}
                @overlay-close=${this._closeLinkEditor}
            ></link-editor-overlay>
        `:l}_getGridBlock(){return this.gridEditorBlockId?this.documentModel.getBlock(this.gridEditorBlockId)??null:null}_getLinkBlock(){return this.linkEditorBlockId?this.documentModel.getBlock(this.linkEditorBlockId)??null:null}_onEntityConfigChanged(e){this.selectedBlock&&this.documentModel.updateBlock(this.selectedBlock.id,{entityConfig:e.detail})}_onSelectSourceBlock(e){const{blockId:t}=e.detail;this.documentModel.select(t)}};Ji.styles=[...nt.styles,t`
            .panel-content {
                padding: 0;
            }
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
        `];let Qi=Ji;Ki([p({context:w})],Qi.prototype,"documentModel"),Ki([p({context:_})],Qi.prototype,"blockRegistry"),Ki([p({context:C})],Qi.prototype,"eventBus"),Ki([p({context:O})],Qi.prototype,"linkModeController"),Ki([p({context:tt})],Qi.prototype,"overlayHost"),Ki([i({attribute:!1})],Qi.prototype,"hass"),Ki([n()],Qi.prototype,"selectedBlock"),Ki([n()],Qi.prototype,"resolvedEntityInfo"),Ki([n()],Qi.prototype,"pendingBlockId"),Ki([n()],Qi.prototype,"blockIdError"),Ki([n()],Qi.prototype,"idDirty"),Ki([n()],Qi.prototype,"pendingMediaRequestId"),Ki([n()],Qi.prototype,"pendingMediaTarget"),Ki([n()],Qi.prototype,"gridEditorOpen"),Ki([n()],Qi.prototype,"linkEditorOpen"),Ki([n()],Qi.prototype,"gridEditorBlockId"),Ki([n()],Qi.prototype,"linkEditorBlockId"),ci.define("panel-properties",Qi);const Zi=["layout","size","spacing","typography","background","border","svg","effects","flex","animations"],eo={layout:["layout.display","layout.show","layout.overflow","layout.overflowX","layout.overflowY","layout.zIndex","layout.positionX","layout.positionY"],size:["size.width","size.height","size.minWidth","size.maxWidth","size.minHeight","size.maxHeight"],spacing:["spacing.margin","spacing.marginTop","spacing.marginRight","spacing.marginBottom","spacing.marginLeft","spacing.padding","spacing.paddingTop","spacing.paddingRight","spacing.paddingBottom","spacing.paddingLeft"],typography:["typography.color","typography.textAlign","typography.fontSize","typography.fontWeight","typography.fontFamily","typography.fontStyle","typography.lineHeight","typography.textTransform","typography.textDecoration","typography.textShadow","typography.letterSpacing","typography.whiteSpace"],background:["background.backgroundColor","background.backgroundImage","background.backgroundSize","background.backgroundPosition","background.backgroundRepeat","background.boxShadow","background.backgroundBlendMode"],border:["border.borderWidth","border.borderStyle","border.borderColor","border.borderRadius","border.borderTopWidth","border.borderRightWidth","border.borderBottomWidth","border.borderLeftWidth","border.borderTopLeftRadius","border.borderTopRightRadius","border.borderBottomRightRadius","border.borderBottomLeftRadius"],svg:["svg.stroke","svg.strokeWidth","svg.strokeLinecap","svg.strokeLinejoin","svg.strokeDasharray","svg.strokeDashoffset","svg.strokeMiterlimit","svg.strokeOpacity","svg.fill","svg.fillOpacity"],effects:["effects.opacity","effects.boxShadow","effects.filter","effects.backdropFilter","effects.mixBlendMode","effects.rotate"],flex:["flex.flexDirection","flex.flexWrap","flex.justifyContent","flex.alignItems","flex.alignContent","flex.gap","flex.rowGap","flex.columnGap","flex.flexGrow","flex.flexShrink","flex.flexBasis","flex.alignSelf","flex.order"],animations:["animations.motion"]},to={full:{groups:Zi,exclude:{groups:["svg"],properties:["display.show"]}},layout:{groups:Zi,exclude:{properties:["layout.display","flex.rowGap","flex.columnGap"]}}};class io{resolve(e){return this.resolveConfig(e)}resolveConfig(e){if(!e)return this.createFullResolvedConfig();const t=this.createEmptyResolvedConfig();if(e.preset&&this.applyPreset(t,e.preset),e.groups)for(const i of e.groups)this.addGroup(t,i);if(e.properties)for(const i of e.properties){t.properties.add(i);const e=this.getGroupForProperty(i);e&&t.groups.add(e)}return e.exclude&&this.applyExclusions(t,e.exclude),t}createEmptyResolvedConfig(){return{groups:new Set,properties:new Set,excludedProperties:new Set}}createFullResolvedConfig(){const e=this.createEmptyResolvedConfig();for(const t of Zi){e.groups.add(t);for(const i of eo[t])e.properties.add(i)}return e}applyPreset(e,t){const i=to[t];if(i){if(i.groups)for(const t of i.groups)this.addGroup(e,t);if(i.properties)for(const t of i.properties){e.properties.add(t);const i=this.getGroupForProperty(t);i&&e.groups.add(i)}i.exclude&&this.applyExclusions(e,i.exclude)}else console.warn(`[PropertyConfigResolver] Unknown preset: ${t}`)}addGroup(e,t){e.groups.add(t);const i=eo[t];if(i)for(const o of i)e.properties.add(o)}applyExclusions(e,t){if(t.groups)for(const i of t.groups){e.groups.delete(i);const t=eo[i];if(t)for(const i of t)e.properties.delete(i)}if(t.properties)for(const i of t.properties)e.excludedProperties.add(i)}getGroupForProperty(e){for(const[t,i]of Object.entries(eo))if(i.includes(e))return t}}class oo extends EventTarget{constructor(e){super(),this._pendingUpdates=new Map,this._flushScheduled=!1,this._flushTimeoutId=null,this._presetUnsubscribe=null,this._stateSubscription=null,this._selectedBlockId=null,this._activeTargetId=null,this._resolvedStyles={},this._visibleProperties=null,this._presets=[],this.documentModel=e.documentModel,this.presetService=e.presetService,this.styleResolver=e.styleResolver,this.hass=e.hass,this._activeContainerId=e.initialContainerId,this.propertyConfigResolver=new io,this.hass&&(this.bindingEvaluator=new B(this.hass,{resolveSlotEntity:e=>this.documentModel.resolveSlotEntity(e),onTemplateResult:()=>{this._resolveStyles(),this._emitChange("styles")}}),this.styleResolver.setBindingEvaluator(this.bindingEvaluator)),this._presetUnsubscribe=this.presetService.subscribe(e=>{this._presets=e,this._emitChange("presets"),this._selectedBlockId&&this._resolveStyles()}),this.hass&&this._subscribeToStateChanges()}get selectedBlockId(){return this._selectedBlockId}get activeContainerId(){return this._activeContainerId}get activeTargetId(){return this._activeTargetId}get resolvedStyles(){return this._resolvedStyles}get visibleProperties(){return this._visibleProperties}get presets(){return this._presets}get selectedBlock(){return this._selectedBlockId&&this.documentModel.blocks[this._selectedBlockId]||null}get appliedPresetId(){var e,t;const i=this.selectedBlock;if(!i)return;const o=this._getActiveTargetStyle(i.id);return o?null==(t=null==(e=i.styles)?void 0:e[o.targetId])?void 0:t.stylePresetId:void 0}get appliedPreset(){const e=this.appliedPresetId;if(e)return this._presets.find(t=>t.id===e)}setHass(e){this.hass=e,this.bindingEvaluator=new B(e,{resolveSlotEntity:e=>this.documentModel.resolveSlotEntity(e),onTemplateResult:()=>{this._resolveStyles(),this._emitChange("styles")}}),this.styleResolver.setBindingEvaluator(this.bindingEvaluator),this._stateSubscription||this._subscribeToStateChanges(),this._selectedBlockId&&(this._resolveStyles(),this._emitChange("styles"))}setSelectedBlock(e){this._selectedBlockId!==e&&(this._selectedBlockId=e,this._activeTargetId=null,this._resolveVisibleProperties(),this._resolveStyles(),this._emitChange("selection"),this.documentModel.selectStyleTarget(null))}setActiveContainer(e){this._activeContainerId!==e&&(this._activeContainerId=e,this._resolveVisibleProperties(),this._resolveStyles(),this._emitChange("container"))}setActiveTarget(e){this._activeTargetId!==e&&(this._activeTargetId=e,this._resolveVisibleProperties(),this._resolveStyles(),this._emitChange("target"),this.documentModel.selectStyleTarget(e))}updateProperty(e,t,i,o){var r,a;const s=this._activeTargetId,n=`${s??"block"}:${e}.${t}`,l=this.isPositionUnitLocked(e,t)?void 0:o??(null==(a=null==(r=this._resolvedStyles[e])?void 0:r[t])?void 0:a.unit),d={value:i};void 0!==l&&(d.unit=l),this._pendingUpdates.set(n,{category:e,property:t,value:d,targetId:s}),this._scheduleFlush()}updateProperties(e,t=null){const i=this.selectedBlock;if(!i)return;const o=t??"block",r={...i.styles||{}},a={...r[o]||{}},s={...a.containers||{}},n={...s[this._activeContainerId]||{}};for(const l of e.values()){n[l.category]||(n[l.category]={});const e={value:l.value};void 0===l.unit||this.isPositionUnitLocked(l.category,l.property)||(e.unit=l.unit),n[l.category][l.property]=e}s[this._activeContainerId]=n,a.containers=s,r[o]=a,this.documentModel.updateBlock(i.id,{styles:r}),this._resolveStyles(),this._emitChange("styles")}updateBinding(e,t,i,o){var r;const a=this._activeTargetId,s=`${a??"block"}:${e}.${t}`,n=null==(r=this._resolvedStyles[e])?void 0:r[t],l=this.isPositionUnitLocked(e,t)?void 0:o??(null==n?void 0:n.unit);if(i){const o={binding:i};void 0!==l&&(o.unit=l),this._pendingUpdates.set(s,{category:e,property:t,value:o,targetId:a})}else{const i={value:null==n?void 0:n.value};void 0!==l&&(i.unit=l),this._pendingUpdates.set(s,{category:e,property:t,value:i,targetId:a})}this._scheduleFlush()}resetProperty(e,t){const i=this.selectedBlock;if(!i)return;const o=this._activeTargetId??"block",r={...i.styles||{}},a={...r[o]||{}},s={...a.containers||{}},n={...s[this._activeContainerId]||{}};if(n[e]){const i={...n[e]};delete i[t],0===Object.keys(i).length?delete n[e]:n[e]=i}0===Object.keys(n).length?delete s[this._activeContainerId]:s[this._activeContainerId]=n,0===Object.keys(s).length?a.stylePresetId?(delete a.containers,r[o]=a):delete r[o]:(a.containers=s,r[o]=a),this.documentModel.updateBlock(i.id,{styles:r}),this._resolveStyles(),this._emitChange("styles")}applyPreset(e){const t=this.selectedBlock;if(!t)return;const i=this._getActiveTargetStyle(t.id);if(!i)return;const o=i.targetId,r={...t.styles||{}},a={...r[o]||{}};e?a.stylePresetId=e:delete a.stylePresetId,a.stylePresetId||a.containers?r[o]=a:delete r[o],this.documentModel.updateBlock(t.id,{styles:r}),this._resolveStyles(),this._emitChange("styles")}async createPreset(e,t,i){const o=this._buildPresetData();return await this.presetService.createPreset({name:e,description:t,extendsPresetId:i,data:o})}async deletePreset(e){await this.presetService.deletePreset(e),this.appliedPresetId===e&&this.applyPreset(null)}flush(){null!==this._flushTimeoutId&&("cancelIdleCallback"in window?window.cancelIdleCallback(this._flushTimeoutId):cancelAnimationFrame(this._flushTimeoutId)),this._flush()}handleDocumentChange(e){this._selectedBlockId&&(this._resolveVisibleProperties(),this._emitChange("properties")),e===this._selectedBlockId&&(this._resolveStyles(),this._emitChange("styles"))}dispose(){null!==this._flushTimeoutId&&("cancelIdleCallback"in window?window.cancelIdleCallback(this._flushTimeoutId):cancelAnimationFrame(this._flushTimeoutId)),this._presetUnsubscribe&&(this._presetUnsubscribe(),this._presetUnsubscribe=null),this._stateSubscription&&(this._stateSubscription(),this._stateSubscription=null),this._selectedBlockId=null,this._activeTargetId=null,this._resolvedStyles={},this._visibleProperties=null,this._pendingUpdates.clear()}async _subscribeToStateChanges(){var e;if(null==(e=this.hass)?void 0:e.connection)try{const e=await this.hass.connection.subscribeEvents(()=>this._handleEntityStateChange(),"state_changed");this._stateSubscription=e}catch(t){console.warn("[StylePanelState] Failed to subscribe to state changes:",t)}}_handleEntityStateChange(){this._selectedBlockId&&this._hasBindingsInResolvedStyles()&&(this._resolveStyles(),this._emitChange("styles"))}_hasBindingsInResolvedStyles(){for(const e of Object.values(this._resolvedStyles))if(e)for(const t of Object.values(e))if(null==t?void 0:t.binding)return!0;return!1}_getPanelConfig(e){const t=this.documentModel.getElement(e);return(null==t?void 0:t.getPanelConfig())??null}_getTargetStyles(e){var t;return(null==(t=this._getPanelConfig(e))?void 0:t.targetStyles)??null}_getActiveTargetStyle(e){const t=this._getTargetStyles(e);if(!t||0===Object.keys(t).length)return null;const i=this._activeTargetId??"block",o=t[i];return o?{targetId:i,target:o}:null}_resolveVisibleProperties(){const e=this._selectedBlockId;if(!e)return void(this._visibleProperties=null);if(!this.documentModel.blocks[e])return void(this._visibleProperties=null);const t=this._getActiveTargetStyle(e);this._visibleProperties=t?this.propertyConfigResolver.resolve(t.target.styles):this.propertyConfigResolver.resolve({})}isPositionUnitLocked(e,t){return"layout"===e&&("positionX"===t||"positionY"===t)}_scheduleFlush(){this._flushScheduled||(this._flushScheduled=!0,"requestIdleCallback"in window?this._flushTimeoutId=window.requestIdleCallback(()=>this._flush(),{timeout:16}):this._flushTimeoutId=requestAnimationFrame(()=>this._flush()))}_flush(){this._flushScheduled=!1,this._flushTimeoutId=null;const e=this.selectedBlock;if(!e||0===this._pendingUpdates.size)return;const t=new Map;for(const r of this._pendingUpdates.values()){const e=r.targetId??null;t.has(e)||t.set(e,[]),t.get(e).push(r)}const i={...e.styles||{}};let o=!1;for(const[r,a]of t.entries()){const e=r??"block",t={...i[e]||{}},s={...t.containers||{}},n={...s[this._activeContainerId]||{}};for(const i of a)n[i.category]||(n[i.category]={}),n[i.category][i.property]=i.value;s[this._activeContainerId]=n,t.containers=s,i[e]=t,o=!0}o&&this.documentModel.updateBlock(e.id,{styles:i}),this._pendingUpdates.clear(),this._resolveStyles(),this._emitChange("styles")}_resolveStyles(){if(!this._selectedBlockId)return void(this._resolvedStyles={});const e={defaultEntityId:this.documentModel.resolveEntityForBlock(this._selectedBlockId).entityId};this._resolvedStyles=this.styleResolver.resolve(this._selectedBlockId,this._activeContainerId,e,!1,this._activeTargetId??void 0)}_buildPresetData(){const e={};for(const[t,i]of Object.entries(this._resolvedStyles))if(i){e[t]={};for(const[o,r]of Object.entries(i))this.isPositionUnitLocked(t,o)?e[t][o]={value:r.value,binding:r.binding}:e[t][o]={value:r.value,binding:r.binding,unit:r.unit}}return{containers:{[this._activeContainerId]:e}}}_emitChange(e){this.dispatchEvent(new CustomEvent("state-change",{detail:{type:e}}))}}var ro=Object.defineProperty,ao=Object.getOwnPropertyDescriptor,so=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ao(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ro(t,i,a),a};let no=class extends ft{constructor(){super(...arguments),this.options=[],this.value="",this.placeholder="Select target"}get showSearch(){return this.options.length>5}get searchPlaceholder(){return"Search targets..."}renderTriggerIcon(){return r`&#9678;`}renderTriggerLabel(){const e=this._getSelectedOption();return r`
      ${e?r`${e.label}`:r`<span class="placeholder">${this.placeholder}</span>`}
    `}renderDropdownContent(){const e=this._getFilteredOptions();return r`
      <div class="option-list">
        ${e.length>0?r`
          ${e.map(e=>r`
            <div
              class="option-item ${e.value===this.value?"selected":""}"
              @click=${()=>this._selectOption(e.value)}
            >
              <span class="icon">&#9673;</span>
              <div class="info">
                <div class="name">${e.label}</div>
                ${e.description?r`
                  <div class="description">${e.description}</div>
                `:l}
              </div>
              ${e.value===this.value?r`<span class="check">&#10003;</span>`:l}
            </div>
          `)}
        `:this._searchFilter?r`
          <div class="empty-message">No targets match "${this._searchFilter}"</div>
        `:r`
          <div class="empty-message">No targets available</div>
        `}
      </div>
    `}_selectOption(e){this._closeDropdown(),this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}_getSelectedOption(){return this.options.find(e=>e.value===this.value)}_getFilteredOptions(){return this._searchFilter?this.options.filter(e=>{var t;return e.label.toLowerCase().includes(this._searchFilter)||(null==(t=e.description)?void 0:t.toLowerCase().includes(this._searchFilter))}):this.options}};so([i({attribute:!1})],no.prototype,"options",2),so([i({type:String})],no.prototype,"value",2),so([i({type:String})],no.prototype,"placeholder",2),no=so([a("block-target-selector")],no);var lo=Object.defineProperty,co=Object.getOwnPropertyDescriptor,po=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?co(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&lo(t,i,a),a};let ho=class extends ft{constructor(){super(...arguments),this.presets=[],this.showManagement=!0}get showSearch(){return this.presets.length>5}get searchPlaceholder(){return"Search presets..."}renderTriggerIcon(){return"★"}renderTriggerLabel(){const e=this._getSelectedPreset();return r`
      ${e?r`${e.name}`:r`<span class="placeholder">No preset applied</span>`}
    `}renderDropdownContent(){const e=this._getFilteredPresets();return r`
      <div class="option-list">
        <!-- None option -->
        <div
          class="option-item ${this.selectedPresetId?"":"selected"}"
          @click=${()=>this._selectPreset(null)}
        >
          <span class="icon">○</span>
          <div class="info">
            <div class="name">No preset</div>
            <div class="description">Use default styles</div>
          </div>
          ${this.selectedPresetId?l:r`<span class="check">✓</span>`}
        </div>

        ${e.length>0?r`
          <div class="divider"></div>
          ${e.map(e=>r`
            <div
              class="option-item ${e.id===this.selectedPresetId?"selected":""}"
              @click=${()=>this._selectPreset(e.id)}
            >
              <span class="icon">★</span>
              <div class="info">
                <div class="name">${e.name}</div>
                ${e.description?r`
                  <div class="description">${e.description}</div>
                `:l}
                ${e.extendsPresetId?r`
                  <div class="meta">Extends: ${this._getExtendsName(e.extendsPresetId)}</div>
                `:l}
              </div>
              ${e.id===this.selectedPresetId?r`<span class="check">✓</span>`:l}
            </div>
          `)}
        `:this._searchFilter?r`
          <div class="empty-message">No presets match "${this._searchFilter}"</div>
        `:l}
      </div>

      ${this.showManagement?r`
        <div class="divider"></div>
        <div class="action-item" @click=${this._handleCreatePreset}>
          <span class="icon">+</span>
          <span>Save current as preset...</span>
        </div>
        <div class="action-item" @click=${this._handleManagePresets}>
          <span class="icon">⚙</span>
          <span>Manage presets...</span>
        </div>
      `:l}
    `}_selectPreset(e){this._closeDropdown(),this.dispatchEvent(new CustomEvent("preset-selected",{detail:{presetId:e},bubbles:!0,composed:!0}))}_handleCreatePreset(){this._closeDropdown(),this.dispatchEvent(new CustomEvent("create-preset",{bubbles:!0,composed:!0}))}_handleManagePresets(){this._closeDropdown(),this.dispatchEvent(new CustomEvent("manage-presets",{bubbles:!0,composed:!0}))}_getSelectedPreset(){if(this.selectedPresetId)return this.presets.find(e=>e.id===this.selectedPresetId)}_getFilteredPresets(){return this._searchFilter?this.presets.filter(e=>{var t;return e.name.toLowerCase().includes(this._searchFilter)||(null==(t=e.description)?void 0:t.toLowerCase().includes(this._searchFilter))}):this.presets}_getExtendsName(e){if(!e)return;const t=this.presets.find(t=>t.id===e);return null==t?void 0:t.name}};po([i({attribute:!1})],ho.prototype,"presets",2),po([i({type:String})],ho.prototype,"selectedPresetId",2),po([i({type:Boolean})],ho.prototype,"showManagement",2),ho=po([a("preset-selector")],ho);var uo=Object.defineProperty,go=Object.getOwnPropertyDescriptor,vo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?go(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&uo(t,i,a),a};let bo=class extends o{constructor(){super(...arguments),this.open=!1,this.presets=[],this.saving=!1,this._name="",this._description="",this._error=""}updated(e){e.has("open")&&this.open&&this._resetForm()}render(){if(!this.open)return l;const e=this._getPreviewItems();return r`
            <div class="overlay" @click=${this._handleOverlayClick}>
                <div class="dialog" @click=${e=>e.stopPropagation()}>
                    <div class="dialog-header">
                        <h2 class="dialog-title">Save as Preset</h2>
                        <button class="close-btn" @click=${this._handleCancel}>×</button>
                    </div>

                    <div class="dialog-content">
                        <div class="form-group">
                            <label class="form-label">
                                Name <span class="required">*</span>
                            </label>
                            <input
                                    type="text"
                                    .value=${this._name}
                                    @input=${this._handleNameInput}
                                    placeholder="My Custom Style"
                                    class=${this._error?"error":""}
                                    ?disabled=${this.saving}
                            />
                            ${this._error?r`
                                <div class="error-message">${this._error}</div>
                            `:l}
                        </div>

                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea
                                    .value=${this._description}
                                    @input=${this._handleDescriptionInput}
                                    placeholder="Optional description of this preset..."
                                    ?disabled=${this.saving}
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Extends</label>
                            <select
                                    .value=${this._extendsPresetId||""}
                                    @change=${this._handleExtendsChange}
                                    ?disabled=${this.saving}
                            >
                                <option value="">None (standalone preset)</option>
                                ${this.presets.map(e=>r`
                                    <option value=${e.id}>${e.name}</option>
                                `)}
                            </select>
                            <div class="form-hint">
                                Extend another preset to inherit its values. Only differences will be saved.
                            </div>
                        </div>

                        ${e.length>0?r`
                            <div class="preview-section">
                                <div class="preview-title">Values to save (${this.containerId})</div>
                                <div class="preview-list">
                                    ${e.map(e=>r`
                                        <div class="preview-item">
                                            <span class="key">${e.key}</span>
                                            <span class="value">${e.value}</span>
                                        </div>
                                    `)}
                                    ${this._getPreviewItems().length>8?r`
                                        <div class="preview-item">
                                            <span class="key">...</span>
                                            <span class="value">and more</span>
                                        </div>
                                    `:l}
                                </div>
                            </div>
                        `:l}
                    </div>

                    <div class="dialog-footer">
                        <button class="btn" @click=${this._handleCancel} ?disabled=${this.saving}>
                            Cancel
                        </button>
                        <button
                                class="btn btn-primary"
                                @click=${this._handleSave}
                                ?disabled=${this.saving||!this._name.trim()}
                        >
                            ${this.saving?r`<span class="spinner"></span>`:l}
                            ${this.saving?"Saving...":"Save Preset"}
                        </button>
                    </div>
                </div>
            </div>
        `}_resetForm(){this._name="",this._description="",this._extendsPresetId=void 0,this._error=""}_handleNameInput(e){this._name=e.target.value,this._error=""}_handleDescriptionInput(e){this._description=e.target.value}_handleExtendsChange(e){const t=e.target.value;this._extendsPresetId=t||void 0}_validate(){if(!this._name.trim())return this._error="Preset name is required",!1;return!this.presets.find(e=>e.name.toLowerCase()===this._name.trim().toLowerCase())||(this._error="A preset with this name already exists",!1)}_buildPresetData(){const e={};if(this.currentStyles)for(const[t,i]of Object.entries(this.currentStyles))if(i){e[t]={};for(const[o,r]of Object.entries(i))e[t][o]={value:r.value,binding:r.binding}}return{containers:{[this.containerId]:e}}}_handleSave(){if(!this._validate())return;const e={name:this._name.trim(),description:this._description.trim()||void 0,extendsPresetId:this._extendsPresetId,data:this._buildPresetData()};this.dispatchEvent(new CustomEvent("save",{detail:{input:e},bubbles:!0,composed:!0}))}_handleCancel(){this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}_handleOverlayClick(e){e.target===e.currentTarget&&this._handleCancel()}_getPreviewItems(){const e=[];if(this.currentStyles)for(const[t,i]of Object.entries(this.currentStyles))if(i)for(const[o,r]of Object.entries(i))void 0!==r.value&&e.push({key:`${t}.${o}`,value:String(r.value)});return e.slice(0,8)}};bo.styles=t`
        :host {
            display: contents;
        }

        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .dialog {
            background: var(--bg-primary, #fff);
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 450px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color, #d4d4d4);
        }

        .dialog-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary, #333);
            margin: 0;
        }

        .close-btn {
            width: 28px;
            height: 28px;
            padding: 0;
            border: none;
            border-radius: 4px;
            background: transparent;
            color: var(--text-secondary, #666);
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
        }

        .close-btn:hover {
            background: var(--bg-secondary, #f5f5f5);
            color: var(--text-primary, #333);
        }

        .dialog-content {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-group:last-child {
            margin-bottom: 0;
        }

        .form-label {
            display: block;
            margin-bottom: 6px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-primary, #333);
        }

        .form-label .required {
            color: #cc0000;
        }

        input, textarea, select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 4px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 13px;
            font-family: inherit;
            transition: border-color 0.15s ease;
            box-sizing: border-box;
        }

        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: var(--accent-color, #0078d4);
        }

        input.error, textarea.error, select.error {
            border-color: #cc0000;
        }

        textarea {
            min-height: 80px;
            resize: vertical;
        }

        .form-hint {
            margin-top: 4px;
            font-size: 11px;
            color: var(--text-secondary, #666);
        }

        .error-message {
            margin-top: 4px;
            font-size: 11px;
            color: #cc0000;
        }

        .preview-section {
            margin-top: 16px;
            padding: 12px;
            background: var(--bg-secondary, #f5f5f5);
            border-radius: 4px;
        }

        .preview-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary, #666);
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .preview-list {
            font-size: 11px;
            color: var(--text-primary, #333);
        }

        .preview-item {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
        }

        .preview-item .key {
            color: var(--text-secondary, #666);
        }

        .preview-item .value {
            font-family: monospace;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .dialog-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 16px 20px;
            border-top: 1px solid var(--border-color, #d4d4d4);
        }

        .btn {
            padding: 8px 16px;
            border: 1px solid var(--border-color, #d4d4d4);
            border-radius: 4px;
            background: var(--bg-primary, #fff);
            color: var(--text-primary, #333);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .btn:hover:not(:disabled) {
            background: var(--bg-secondary, #f5f5f5);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-primary {
            background: var(--accent-color, #0078d4);
            border-color: var(--accent-color, #0078d4);
            color: white;
        }

        .btn-primary:hover:not(:disabled) {
            background: #006cbd;
            border-color: #006cbd;
        }

        .btn-primary:disabled {
            background: #99c9ea;
            border-color: #99c9ea;
        }

        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid transparent;
            border-top-color: currentColor;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 6px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `,vo([i({type:Boolean})],bo.prototype,"open",2),vo([i({attribute:!1})],bo.prototype,"currentStyles",2),vo([i({type:String})],bo.prototype,"containerId",2),vo([i({attribute:!1})],bo.prototype,"presets",2),vo([i({type:Boolean})],bo.prototype,"saving",2),vo([n()],bo.prototype,"_name",2),vo([n()],bo.prototype,"_description",2),vo([n()],bo.prototype,"_extendsPresetId",2),vo([n()],bo.prototype,"_error",2),bo=vo([a("preset-save-dialog")],bo);var mo=Object.defineProperty,yo=Object.getOwnPropertyDescriptor,fo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?yo(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&mo(t,i,a),a};let xo=class extends o{constructor(){super(...arguments),this.open=!1,this.presets=[],this._searchFilter="",this._deleting=!1}render(){if(!this.open)return l;const e=this._getFilteredPresets();return r`
      <div class="overlay" @click=${this._handleOverlayClick}>
        <div class="dialog" @click=${e=>e.stopPropagation()}>
          <div class="dialog-header">
            <h2 class="dialog-title">Manage Presets</h2>
            <button class="close-btn" @click=${this._handleClose}>×</button>
          </div>

          ${this.presets.length>5?r`
            <div class="search-bar">
              <input
                type="text"
                placeholder="Search presets..."
                .value=${this._searchFilter}
                @input=${this._handleSearchInput}
              />
            </div>
          `:l}

          <div class="dialog-content">
            ${0===e.length?r`
              <div class="empty-state">
                <div class="icon">★</div>
                <div class="message">
                  ${this._searchFilter?`No presets match "${this._searchFilter}"`:"No presets yet"}
                </div>
                <div class="hint">
                  ${this._searchFilter?"Try a different search term":"Create your first preset from the style panel"}
                </div>
              </div>
            `:r`
              <ul class="preset-list">
                ${e.map(e=>r`
                  <li class="preset-item">
                    <div class="preset-icon">★</div>
                    <div class="preset-info">
                      <div class="preset-name">${e.name}</div>
                      ${e.description?r`
                        <div class="preset-description">${e.description}</div>
                      `:l}
                      <div class="preset-meta">
                        ${e.extendsPresetId?r`
                          <span>Extends: ${this._getExtendsName(e.extendsPresetId)}</span>
                        `:l}
                        <span>Created: ${this._formatDate(e.createdAt)}</span>
                        ${this._getUsageCount(e.id)>0?r`
                          <span>Used by: ${this._getUsageCount(e.id)} preset(s)</span>
                        `:l}
                      </div>
                      ${this._pendingDeleteId===e.id?r`
                        <div class="delete-confirm">
                          <span class="message">Delete this preset?</span>
                          <button
                            class="btn btn-small"
                            @click=${this._handleDeleteCancel}
                            ?disabled=${this._deleting}
                          >Cancel</button>
                          <button
                            class="btn btn-small btn-danger"
                            @click=${this._handleDeleteConfirm}
                            ?disabled=${this._deleting}
                          >
                            ${this._deleting?r`<span class="spinner"></span>`:"Delete"}
                          </button>
                        </div>
                      `:l}
                    </div>
                    <div class="preset-actions">
                      <button
                        class="action-btn"
                        @click=${()=>this._handleEdit(e.id)}
                        title="Edit preset"
                      >✎</button>
                      <button
                        class="action-btn danger"
                        @click=${()=>this._handleDeleteClick(e.id)}
                        title="Delete preset"
                      >🗑</button>
                    </div>
                  </li>
                `)}
              </ul>
            `}
          </div>

          <div class="dialog-footer">
            <button class="btn" @click=${this._handleClose}>Close</button>
          </div>
        </div>
      </div>
    `}_handleClose(){this._pendingDeleteId=void 0,this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_handleOverlayClick(e){e.target===e.currentTarget&&this._handleClose()}_handleSearchInput(e){this._searchFilter=e.target.value.toLowerCase()}_handleEdit(e){this.dispatchEvent(new CustomEvent("edit",{detail:{presetId:e},bubbles:!0,composed:!0}))}_handleDeleteClick(e){this._pendingDeleteId=e}_handleDeleteConfirm(){this._pendingDeleteId&&(this._deleting=!0,this.dispatchEvent(new CustomEvent("delete",{detail:{presetId:this._pendingDeleteId},bubbles:!0,composed:!0})),setTimeout(()=>{this._pendingDeleteId=void 0,this._deleting=!1},500))}_handleDeleteCancel(){this._pendingDeleteId=void 0}_getFilteredPresets(){return this._searchFilter?this.presets.filter(e=>{var t;return e.name.toLowerCase().includes(this._searchFilter)||(null==(t=e.description)?void 0:t.toLowerCase().includes(this._searchFilter))}):this.presets}_getExtendsName(e){if(!e)return;const t=this.presets.find(t=>t.id===e);return null==t?void 0:t.name}_formatDate(e){try{return new Date(e).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"})}catch{return e}}_getUsageCount(e){return this.presets.filter(t=>t.extendsPresetId===e).length}};xo.styles=t`
    :host {
      display: contents;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .dialog {
      background: var(--bg-primary, #fff);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 550px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color, #d4d4d4);
    }

    .dialog-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary, #333);
      margin: 0;
    }

    .close-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--text-secondary, #666);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .close-btn:hover {
      background: var(--bg-secondary, #f5f5f5);
      color: var(--text-primary, #333);
    }

    .search-bar {
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color, #d4d4d4);
    }

    .search-bar input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    }

    .search-bar input:focus {
      border-color: var(--accent-color, #0078d4);
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .preset-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .preset-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color-light, #eee);
      transition: background 0.1s ease;
    }

    .preset-item:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    .preset-item:last-child {
      border-bottom: none;
    }

    .preset-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, #7b2d8e 0%, #9b5dae 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .preset-info {
      flex: 1;
      min-width: 0;
    }

    .preset-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary, #333);
      margin-bottom: 2px;
    }

    .preset-description {
      font-size: 11px;
      color: var(--text-secondary, #666);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preset-meta {
      font-size: 10px;
      color: var(--text-tertiary, #999);
    }

    .preset-meta span {
      margin-right: 12px;
    }

    .preset-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 4px;
      background: transparent;
      color: var(--text-secondary, #666);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: var(--bg-tertiary, #e8e8e8);
      border-color: var(--border-color, #d4d4d4);
    }

    .action-btn.danger:hover {
      background: #fee;
      border-color: #f88;
      color: #c00;
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-secondary, #666);
    }

    .empty-state .icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.3;
    }

    .empty-state .message {
      font-size: 14px;
      margin-bottom: 4px;
    }

    .empty-state .hint {
      font-size: 12px;
      color: var(--text-tertiary, #999);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      padding: 16px 20px;
      border-top: 1px solid var(--border-color, #d4d4d4);
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid var(--border-color, #d4d4d4);
      border-radius: 4px;
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn:hover {
      background: var(--bg-secondary, #f5f5f5);
    }

    /* Delete confirmation */
    .delete-confirm {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #fee;
      border-radius: 4px;
      margin-top: 8px;
    }

    .delete-confirm .message {
      flex: 1;
      font-size: 12px;
      color: #900;
    }

    .delete-confirm .btn-small {
      padding: 4px 10px;
      font-size: 11px;
      border-radius: 3px;
    }

    .delete-confirm .btn-danger {
      background: #c00;
      border-color: #c00;
      color: white;
    }

    .delete-confirm .btn-danger:hover {
      background: #a00;
      border-color: #a00;
    }

    .spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,fo([i({type:Boolean})],xo.prototype,"open",2),fo([i({attribute:!1})],xo.prototype,"presets",2),fo([n()],xo.prototype,"_searchFilter",2),fo([n()],xo.prototype,"_pendingDeleteId",2),fo([n()],xo.prototype,"_deleting",2),xo=fo([a("preset-manager-dialog")],xo);var _o=Object.defineProperty,ko=Object.getOwnPropertyDescriptor,wo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ko(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&_o(t,i,a),a};let $o=class extends o{constructor(){super(...arguments),this.open=!1,this.label="",this.category="",this.propertyName="",this.slots=[]}render(){return r`
            <property-editor-overlay
                .open=${this.open}
                title="Binding"
                .subtitle=${this.label||this.propertyName}
                @overlay-close=${this._handleClose}
            >
                <property-binding-editor
                    .hass=${this.hass}
                    .binding=${this.binding}
                    .block=${this.block}
                    .defaultEntityId=${this.defaultEntityId}
                    .slots=${this.slots}
                    .valueInputConfig=${this.valueInputConfig}
                    @binding-change=${this._handleBindingChange}
                ></property-binding-editor>
            </property-editor-overlay>
        `}_handleBindingChange(e){this.dispatchEvent(new CustomEvent("property-binding-change",{detail:{category:this.category,property:this.propertyName,binding:e.detail.binding,unit:e.detail.unit},bubbles:!0,composed:!0}))}_handleClose(){this.dispatchEvent(new CustomEvent("overlay-close",{bubbles:!0,composed:!0}))}};$o.styles=t`
    :host {
      display: contents;
    }
  `,wo([i({type:Boolean,reflect:!0})],$o.prototype,"open",2),wo([i({attribute:!1})],$o.prototype,"hass",2),wo([i({type:String})],$o.prototype,"label",2),wo([i({type:String})],$o.prototype,"category",2),wo([i({type:String})],$o.prototype,"propertyName",2),wo([i({type:Object})],$o.prototype,"block",2),wo([i({attribute:!1})],$o.prototype,"binding",2),wo([i({type:String})],$o.prototype,"defaultEntityId",2),wo([i({attribute:!1})],$o.prototype,"slots",2),wo([i({attribute:!1})],$o.prototype,"valueInputConfig",2),$o=wo([a("property-binding-editor-overlay")],$o);var So=Object.defineProperty,Co=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&So(t,i,a),a};const Eo=class extends o{constructor(){super(...arguments),this.open=!1,this.label="",this.propertyName=""}render(){return r`
            <property-editor-overlay
                .open=${this.open}
                title="Animation"
                .subtitle=${this.label||this.propertyName}
                @overlay-close=${this.handleClose}
            >
                <div class="not-available">Animation Configuration is not available yet</div>
            </property-editor-overlay>
        `}handleClose(){this.dispatchEvent(new CustomEvent("overlay-close",{bubbles:!0,composed:!0}))}};Eo.styles=t`
        :host {
            display: contents;
        }
        .not-available {
            padding: 12px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
        }
    `;let Io=Eo;Co([i({type:Boolean,reflect:!0})],Io.prototype,"open"),Co([i({type:String})],Io.prototype,"label"),Co([i({type:String})],Io.prototype,"propertyName"),ci.define("property-animation-editor-overlay",Io);var Po=Object.defineProperty,Bo=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&Po(t,i,a),a};const Mo=["layout.show","layout.positionX","layout.positionY","animations.motion"],To="__custom__",zo=[{label:"None",value:"none"},{label:"Image URL",value:"image"},{label:"Media Library",value:"media"},{label:"Gradient",value:"gradient"},{label:"Custom",value:"custom"}],Ro=[{label:"Repeat",value:"repeat"},{label:"No Repeat",value:"no-repeat"},{label:"Repeat X",value:"repeat-x"},{label:"Repeat Y",value:"repeat-y"},{label:"Space",value:"space"},{label:"Round",value:"round"}],Do=[{label:"Auto",value:"auto"},{label:"Cover",value:"cover"},{label:"Contain",value:"contain"},{label:"Custom",value:To}],Oo=[{label:"Center",value:"center"},{label:"Top",value:"top"},{label:"Bottom",value:"bottom"},{label:"Left",value:"left"},{label:"Right",value:"right"},{label:"Top Left",value:"top left"},{label:"Top Center",value:"top center"},{label:"Top Right",value:"top right"},{label:"Center Left",value:"center left"},{label:"Center Right",value:"center right"},{label:"Bottom Left",value:"bottom left"},{label:"Bottom Center",value:"bottom center"},{label:"Bottom Right",value:"bottom right"},{label:"Custom",value:To}],Ao={"left top":"top left","right top":"top right","left bottom":"bottom left","right bottom":"bottom right","left center":"center left","right center":"center right","center top":"top center","center bottom":"bottom center"},Lo=[{label:"Color",value:"color"},{label:"Color Burn",value:"color-burn"},{label:"Color Dodge",value:"color-dodge"},{label:"Darken",value:"darken"},{label:"Difference",value:"difference"},{label:"Exclusion",value:"exclusion"},{label:"Hard Light",value:"hard-light"},{label:"Hue",value:"hue"},{label:"Lighten",value:"lighten"},{label:"Luminosity",value:"luminosity"},{label:"Multiply",value:"multiply"},{label:"Normal",value:"normal"},{label:"Overlay",value:"overlay"},{label:"Saturation",value:"saturation"},{label:"Screen",value:"screen"},{label:"Soft Light",value:"soft-light"}],Vo=["%","px","rem","em","vw","vh"],No=[{label:"None",value:"none"},{label:"Capitalize",value:"capitalize"},{label:"Uppercase",value:"uppercase"},{label:"Lowercase",value:"lowercase"}],Fo=[{label:"None",value:"none"},{label:"Underline",value:"underline"},{label:"Overline",value:"overline"},{label:"Line Through",value:"line-through"}],jo=[{label:"Normal",value:"normal"},{label:"No-Wrap",value:"nowrap"},{label:"Pre",value:"pre"},{label:"Pre-Wrap",value:"pre-wrap"},{label:"Pre-Line",value:"pre-line"},{label:"Break-Spaces",value:"break-spaces"}],Uo=class extends nt{constructor(){super(),this.selectedBlock=null,this.panelState=null,this.resolvedStyles={},this.visibleProperties=null,this.presets=[],this.activeTargetId=null,this.slots=[],this.saveDialogOpen=!1,this.managerDialogOpen=!1,this.bindingEditorOpen=!1,this.bindingEditorTarget=null,this.expandedSections=new Set,this.backgroundImageMode="none",this.pendingMediaRequestId=null,this.animationEditorOpen=!1,this.animationEditorTarget=null,this.sections=new Map,this.editors=new Map,this.computedStyleTarget=null,this.computedStyle=null,this._openMediaManagerForBackgroundImage=()=>{if(!this.eventBus)return;const e=`bg-media-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;this.pendingMediaRequestId=e,this.eventBus.dispatchEvent("media-manager-open",{mode:"select",requestId:e,title:"Select image",subtitle:"Choose or upload a background media",confirmLabel:"Use image"})},this._clearBackgroundMedia=()=>{this.pendingMediaRequestId=null,this.backgroundImageMode="media",this._handlePropertyChange("background","backgroundImage","")},this.sections.set("layout",()=>this._renderLayoutSection()),this.sections.set("flex",()=>this._renderFlexSection()),this.sections.set("size",()=>this._renderSizeSection()),this.sections.set("spacing",()=>this._renderSpacingSection()),this.sections.set("typography",()=>this._renderTypographySection()),this.sections.set("background",()=>this._renderBackgroundSection()),this.sections.set("border",()=>this._renderBorderSection()),this.sections.set("svg",()=>this._renderSvgSection()),this.sections.set("effects",()=>this._renderEffectsSection()),this.sections.set("animations",()=>this._renderAnimationsSection()),this.editors.set("binding",()=>this._renderBindingEditorOverlay()),this.editors.set("animation",()=>this._renderAnimationEditorOverlay())}get defaultEntityId(){if(!this.selectedBlock)return;return this.documentModel.resolveEntityForBlock(this.selectedBlock.id).entityId}async connectedCallback(){super.connectedCallback(),await this._initializePanelState(),this.documentModel.addEventListener("selection-changed",e=>{const t=e.detail;this.handleSelectionChange(t.selectedBlock)}),this.documentModel.addEventListener("element-registered",e=>{const t=e.detail;this.selectedBlock&&t.blockId===this.selectedBlock.id&&(this.panelState&&this.panelState.handleDocumentChange(t.blockId),this._ensureActiveTargetAvailable(),this.requestUpdate())}),this.slots=this.documentModel.getSlotEntities(),this.documentModel.addEventListener("slots-changed",()=>{this.slots=this.documentModel.getSlotEntities(),this.requestUpdate()}),this.documentModel.addEventListener("block-updated",e=>{const t=e.detail;this.selectedBlock&&t.block.id===this.selectedBlock.id&&(this.selectedBlock={...t.block},this.panelState&&this.panelState.handleDocumentChange(this.selectedBlock.id),this._ensureActiveTargetAvailable(),this.requestUpdate())}),this.documentModel.addEventListener("change",e=>{var t;const i=e.detail;if("update"!==i.action&&this.selectedBlock&&(null==(t=i.block)?void 0:t.id)===this.selectedBlock.id){const e=this.documentModel.getBlock(this.selectedBlock.id);e&&(this.selectedBlock={...e},this.panelState&&this.panelState.handleDocumentChange(this.selectedBlock.id),this._ensureActiveTargetAvailable(),this.requestUpdate())}}),this.eventBus.addEventListener("moveable-change",e=>{const{position:t,positionConfig:i,size:o}=e,r=[{category:"layout",property:"positionX",value:t.x},{category:"layout",property:"positionY",value:t.y},{category:"_internal",property:"position_config",value:i}];o&&(r.push({category:"size",property:"width",value:o.width}),r.push({category:"size",property:"height",value:o.height})),this.panelState.updateProperties(r,null)}),this.eventBus.addEventListener("media-manager-selected",e=>{var t;e&&e.requestId===this.pendingMediaRequestId&&(this.pendingMediaRequestId=null,(null==(t=e.selection)?void 0:t.reference)&&(this.backgroundImageMode="media",this._handlePropertyChange("background","backgroundImage",e.selection.reference)))}),this.eventBus.addEventListener("media-manager-cancelled",e=>{e&&e.requestId===this.pendingMediaRequestId&&(this.pendingMediaRequestId=null)})}openBindingEditor(e,t,i,o){void 0!==o&&this.panelState&&this.panelState.setActiveTarget(o??null),this.bindingEditorTarget={category:e,property:t,label:i??t},this.bindingEditorOpen=!0}render(){var e;if(!this.selectedBlock)return r`
                <div class="empty-state">
                    <ha-icon icon="mdi:palette-swatch-variant"></ha-icon>
                    <div>Select an element to edit its styles</div>
                </div>
            `;const t=this._hasStyleTargets(this.selectedBlock),i=this.containerManager.getActiveContainer(),o=i.width?`Max width: ${i.width}px`:"No width limit";return r`
            <!-- Container Indicator -->
            <div class="container-indicator">
                Editing for: <span class="container-name">${i.name} (${o})</span>
            </div>

            ${this._renderTargetSelector()}

            <!-- Preset Selector -->
            ${t?r`
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
            `:l}

            <div class="panel-content">
                ${Array.from(this.sections.values()).map(e=>e())}
            </div>

            <!-- Dialogs -->
            <preset-save-dialog
                    .open=${this.saveDialogOpen}
                    .currentStyles=${this.resolvedStyles}
                    .containerId=${this.containerManager.getActiveContainerId()}
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

            ${Array.from(this.editors.values()).map(e=>e())}
        `}disconnectedCallback(){super.disconnectedCallback(),this.panelState&&(this.panelState.dispose(),this.panelState=null)}updated(e){super.updated(e),(e.has("selectedBlock")||e.has("resolvedStyles")||e.has("activeTargetId"))&&this._resetComputedStyleCache(),e.has("selectedBlock")?this._updateBackgroundImageMode(!0):e.has("resolvedStyles")&&this._updateBackgroundImageMode(!1)}async _initializePanelState(){try{const e=await A(this.hass);this.panelState=new oo({documentModel:this.documentModel,presetService:e,styleResolver:this.styleResolver,hass:this.hass,initialContainerId:this.containerManager.getActiveContainerId()}),this.panelState.addEventListener("state-change",e=>{const t=e.detail;this._handleStateChange(t)}),this.resolvedStyles=this.panelState.resolvedStyles,this.visibleProperties=this.panelState.visibleProperties,this.presets=this.panelState.presets,this.activeTargetId=this.panelState.activeTargetId}catch(e){console.error("[PanelStyle] Failed to initialize panel state:",e)}}_handleStateChange(e){var t,i,o,r,a,s;switch(e.type){case"styles":this.resolvedStyles=(null==(t=this.panelState)?void 0:t.resolvedStyles)||{};break;case"presets":this.presets=(null==(i=this.panelState)?void 0:i.presets)||[];break;case"properties":this.visibleProperties=(null==(o=this.panelState)?void 0:o.visibleProperties)||null;break;case"selection":case"target":case"container":this.resolvedStyles=(null==(r=this.panelState)?void 0:r.resolvedStyles)||{},this.visibleProperties=(null==(a=this.panelState)?void 0:a.visibleProperties)||null,this.activeTargetId=(null==(s=this.panelState)?void 0:s.activeTargetId)||null}this._ensureActiveTargetAvailable(),this.requestUpdate()}handleSelectionChange(e){if(!e)return this.selectedBlock=null,this._closeBindingEditor(!0),this._closeAnimationEditor(!0),void(this.panelState&&this.panelState.setSelectedBlock(null));this._closeBindingEditor(!0),this._closeAnimationEditor(!0),this.selectedBlock={...e||{}},this.panelState&&this.panelState.setSelectedBlock(e.id),this._ensureActiveTargetAvailable()}toggleSection(e){this.expandedSections.has(e)?this.expandedSections.delete(e):this.expandedSections.add(e),this.requestUpdate()}switchLayoutMode(e){this.selectedBlock&&this.selectedBlock.layout!==e&&this.documentModel.updateBlock(this.selectedBlock.id,{layout:e})}getContainerDimensions(){let e=this.canvasWidth,t=this.canvasHeight;if(this.selectedBlock&&"root"!==this.selectedBlock.parentId){const i=this.documentModel.getElement(this.selectedBlock.parentId).getBoundingClientRect();e=i.width,t=i.height}return{width:e,height:t}}getLayoutData(){return this.selectedBlock?L(this.resolvedStyles):null}getRuntimeSize(e){var t;if(e.size.width&&e.size.height)return e.size;const i=this.documentModel.getElement(this.selectedBlock.id);if(!i)return e.size;const o=(null==(t=i.getBlockBoundingClientRect)?void 0:t.call(i))??i.getBoundingClientRect();return{width:o.width,height:o.height}}applyPositionUpdate(e,t){this.panelState&&this.panelState.updateProperties([{category:"layout",property:"positionX",value:e.x},{category:"layout",property:"positionY",value:e.y},{category:"_internal",property:"position_config",value:t}],null)}_handlePresetSelected(e){const{presetId:t}=e.detail;this.panelState&&this.panelState.applyPreset(t)}_openSaveDialog(){this.saveDialogOpen=!0}_closeSaveDialog(){this.saveDialogOpen=!1}async _handleSavePreset(e){const{input:t}=e.detail;if(this.panelState)try{await this.panelState.createPreset(t.name,t.description,t.extendsPresetId),this._closeSaveDialog()}catch(i){console.error("[PanelStyle] Failed to save preset:",i)}}_openManagerDialog(){this.managerDialogOpen=!0}_closeManagerDialog(){this.managerDialogOpen=!1}_handleEditPreset(e){e.detail.presetId}async _handleDeletePreset(e){const{presetId:t}=e.detail;if(this.panelState)try{await this.panelState.deletePreset(t)}catch(i){console.error("[PanelStyle] Failed to delete preset:",i)}}_handlePropertyChange(e,t,i,o){this.panelState&&this.panelState.updateProperty(e,t,i,o)}_handleBindingChange(e,t,i,o){this.panelState&&this.panelState.updateBinding(e,t,i,o)}_handleBindingEdit(e){const{category:t,property:i,label:o}=e.detail;this.bindingEditorTarget={category:t,property:i,label:o},this.bindingEditorOpen=!0}_closeBindingEditor(e=!1){this.bindingEditorOpen=!1,e&&(this.bindingEditorTarget=null)}_handlePropertyReset(e,t){this.panelState&&this.panelState.resetProperty(e,t)}updateLegacyProperty(e,t){if(!this.selectedBlock)return;const i=t.value,o="number"==typeof i?i:parseFloat(i);"layout"===e?this.documentModel.updateBlock(this.selectedBlock.id,{layout:i}):"zIndex"===e&&this.documentModel.updateBlock(this.selectedBlock.id,{zIndex:isNaN(o)?0:o})}_handleTargetChange(e){const t=e.detail.value,i="__block__"===t?null:t;this.panelState&&this.panelState.setActiveTarget(i)}_getTargetStyles(e){if(!e)return null;const t=this.documentModel.getElement(e.id),i=null==t?void 0:t.getPanelConfig();return(null==i?void 0:i.targetStyles)??null}_getAvailableTargetDefs(e){const t=this._getTargetStyles(e);if(!t)return null;const i=Object.fromEntries(Object.entries(t).filter(([e])=>"block"!==e));return Object.keys(i).length>0?i:null}_hasStyleTargets(e){const t=this._getTargetStyles(e);return!!t&&Object.keys(t).length>0}_ensureActiveTargetAvailable(){var e,t,i,o;if(!this.selectedBlock)return;const r=this._getTargetStyles(this.selectedBlock);if(!r||0===Object.keys(r).length)return void(null!==this.activeTargetId&&(null==(e=this.panelState)||e.setActiveTarget(null)));const a=Boolean(r.block),s=Object.keys(r).filter(e=>"block"!==e);!this.activeTargetId||r[this.activeTargetId]?!this.activeTargetId&&!a&&s.length>0&&(null==(o=this.panelState)||o.setActiveTarget(s[0])):a?null==(t=this.panelState)||t.setActiveTarget(null):s.length>0&&(null==(i=this.panelState)||i.setActiveTarget(s[0]))}_renderTargetSelector(){var e,t;if(!this.selectedBlock)return l;const i=this._getTargetStyles(this.selectedBlock),o=this._getAvailableTargetDefs(this.selectedBlock);if(!i||!o)return l;const a=Boolean(i.block),s=[...a?[{label:(null==(e=i.block)?void 0:e.label)??"Block",value:"__block__",description:null==(t=i.block)?void 0:t.description}]:[],...Object.entries(o).map(([e,t])=>({label:t.label??e,value:e,description:t.description}))],n=this.activeTargetId&&i[this.activeTargetId]?this.activeTargetId:a?"__block__":Object.keys(o)[0],d="__block__"===n?i.block??null:o[n]??null;return r`
            <div class="target-section">
                <span class="target-label">Style target</span>
                <block-target-selector
                        .value=${n}
                        .options=${s}
                        @change=${this._handleTargetChange}
                ></block-target-selector>
                ${(null==d?void 0:d.description)?r`
                    <div class="target-description">${d.description}</div>
                `:l}
            </div>
        `}_renderLayoutSection(){if(!this.selectedBlock)return l;if(!this._isSectionVisible("layout"))return l;const e=this.expandedSections.has("layout"),t=this._renderLayoutMode(),i=this.resolvedStyles.layout||{},o=this._getComputedNumberValue("layout","zIndex"),a=this._getCurrentValueText("layout","zIndex"),s=this._getCurrentValueText("layout","display");return r`
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
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${"absolute"===this.selectedBlock.layout?this._renderAbsolutePositionInputs():l}
                    ${this._renderPropertyRow("layout","zIndex","Z-Index",r`
                        <sm-number-input
                                .value=${this._getUserValue("layout","zIndex",this.selectedBlock.zIndex||0)}
                                .placeholder=${a}
                                .default=${o.value??0}
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
                    `,{helperText:s})}
                    ${this._renderPropertyRow("layout","show","Show",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.show)}
                                .options=${[{label:"Yes",value:"yes"},{label:"No",value:"no"}]}
                                @change=${e=>this._handlePropertyChange("layout","show",e.detail.value)}
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
        `:l}_renderAbsolutePositionInputs(){var e;const t=this.getLayoutData();if(!t)return l;if("absolute"!==(null==(e=this.selectedBlock)?void 0:e.layout))return l;const i=t.positionConfig;return r`
            <!-- Position Mode (no binding) -->
            <sm-toggle-input
                    label="Position Mode"
                    labelOn="Responsive"
                    labelOff="Static"
                    .value=${"%"===i.unitSystem}
                    @change=${e=>this._handlePositionModeChange(e)}
            ></sm-toggle-input>

            <!-- Anchor Point (no binding) -->
            <sm-anchor-selector
                    label="Anchor Point"
                    .value=${i.anchor}
                    @change=${e=>this._handleAnchorChange(e)}
            ></sm-anchor-selector>

            ${this._renderPropertyRow("layout","positionX","X",r`
                <sm-number-input
                        .value=${this._getPositionDisplayValue("x",i)}
                        step="1"
                        unit="${i.unitSystem}"
                        .units=${[i.unitSystem]}
                        @change=${e=>{const t=e.detail.value;this._handlePropertyChange("layout","positionX",t),this._handlePositionChange("x",t)}}
                ></sm-number-input>
            `)}
            ${this._renderPropertyRow("layout","positionY","Y",r`
                <sm-number-input
                        .value=${this._getPositionDisplayValue("y",i)}
                        step="1"
                        unit="${i.unitSystem}"
                        .units=${[i.unitSystem]}
                        @change=${e=>{const t=e.detail.value;this._handlePropertyChange("layout","positionY",t),this._handlePositionChange("y",t)}}
                ></sm-number-input>
            `)}
        `}_handlePositionModeChange(e){const t=this.getLayoutData();if(!t)return;const i=e.detail.value?"%":"px",o=t.positionConfig,r=this.getContainerDimensions(),a=this.getRuntimeSize(t),s=new V({containerSize:r,elementSize:a,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem}),n={x:o.x||0,y:o.y||0,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem},l=s.convertUnits(n,i);this.applyPositionUpdate(t.position,{anchor:l.anchorPoint,x:l.x,y:l.y,unitSystem:l.unitSystem,originPoint:l.originPoint??l.anchorPoint})}_handleAnchorChange(e){const t=this.getLayoutData();if(!t)return;const i=e.detail.value,o=t.positionConfig;if(i===o.anchor)return;const r=this.getContainerDimensions(),a=this.getRuntimeSize(t),s=new V({containerSize:r,elementSize:a,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem}),n={x:o.x||0,y:o.y||0,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem},l=s.convertAnchor(n,i);this.applyPositionUpdate(t.position,{x:l.x,y:l.y,anchor:l.anchorPoint,originPoint:l.originPoint??l.anchorPoint,unitSystem:o.unitSystem})}_handlePositionChange(e,t){const i=this.getLayoutData();if(!i)return;const o={...i.positionConfig,[e]:t},r=this.getContainerDimensions(),a=this.getRuntimeSize(i),s=new V({containerSize:r,elementSize:a,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem}).toMoveableSpace({x:o.x,y:o.y,anchorPoint:o.anchor,originPoint:o.originPoint,unitSystem:o.unitSystem});this.applyPositionUpdate({x:s.x,y:s.y},o)}_renderFlexSection(){var e,t;if(!this.selectedBlock)return l;if(!this._isSectionVisible("flex"))return l;const i=this.expandedSections.has("flex"),o=this.resolvedStyles.flex||{},a=this._getUnitConfig("flex","rowGap"),s=this._getUnitConfig("flex","columnGap"),n=this._getCurrentValueText("flex","flexDirection"),d=this._getCurrentValueText("flex","justifyContent"),c=this._getCurrentValueText("flex","alignItems"),p=this._getComputedNumberValue("flex","rowGap"),h=this._getComputedNumberValue("flex","columnGap"),u=p.unit&&(null==(e=null==a?void 0:a.units)?void 0:e.includes(p.unit))?p.unit:null==a?void 0:a.unit,g=h.unit&&(null==(t=null==s?void 0:s.units)?void 0:t.includes(h.unit))?h.unit:null==s?void 0:s.unit;return r`
            <div class="section ${i?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("flex")}>
                    <span class="section-title">
                        <span>Flex Options</span>
                        ${this._sectionHasInlineOverrides("flex")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("flex","flexDirection","Flex Direction",r`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(o.flexDirection)}
                                .options=${[{value:"row",tooltip:"Row",icon:'<ha-icon icon="mdi:transfer-right"></ha-icon>'},{value:"row-reverse",tooltip:"Row Reverse",icon:'<ha-icon icon="mdi:transfer-left"></ha-icon>'},{value:"column",tooltip:"Column",icon:'<ha-icon icon="mdi:transfer-down"></ha-icon>'},{value:"column-reverse",tooltip:"Column Reverse",icon:'<ha-icon icon="mdi:transfer-up"></ha-icon>'}]}
                                @change=${e=>this._handlePropertyChange("flex","flexDirection",e.detail.value)}
                        ></sm-button-group-input>
                    `,{helperText:n})}

                    ${this._renderPropertyRow("flex","justifyContent","Justify Content",r`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(o.justifyContent)}
                                .options=${[{value:"flex-start",tooltip:"Start",icon:'<ha-icon icon="mdi:format-horizontal-align-left"></ha-icon>'},{value:"center",tooltip:"Center",icon:'<ha-icon icon="mdi:format-horizontal-align-center"></ha-icon>'},{value:"flex-end",tooltip:"End",icon:'<ha-icon icon="mdi:format-horizontal-align-right"></ha-icon>'},{value:"space-between",tooltip:"Space Between",icon:'<ha-icon icon="mdi:align-horizontal-distribute"></ha-icon>'},{value:"space-around",tooltip:"Space Around",icon:'<div style="rotate: 90deg"><ha-icon icon="mdi:format-align-center"></ha-icon></div>'}]}
                                @change=${e=>this._handlePropertyChange("flex","justifyContent",e.detail.value)}
                        ></sm-button-group-input>
                    `,{helperText:d})}

                    ${this._renderPropertyRow("flex","alignItems","Align Items",r`
                        <sm-button-group-input
                                .value=${this._getResolvedValue(o.alignItems)}
                                .options=${[{value:"flex-start",tooltip:"Start",icon:'<ha-icon icon="mdi:align-vertical-top"></ha-icon>'},{value:"center",tooltip:"Center",icon:'<ha-icon icon="mdi:align-vertical-center"></ha-icon>'},{value:"flex-end",tooltip:"End",icon:'<ha-icon icon="mdi:align-vertical-bottom"></ha-icon>'},{value:"stretch",tooltip:"Stretch",icon:'<ha-icon icon="mdi:stretch-to-page-outline"></ha-icon>'}]}
                                @change=${e=>this._handlePropertyChange("flex","alignItems",e.detail.value)}
                        ></sm-button-group-input>
                    `,{helperText:c})}

                    <div class="property-grid">
                        ${this._renderPropertyRow("flex","rowGap","Row Gap",r`
                            <sm-number-input
                                    .value=${this._getUserValue("flex","rowGap")}
                                    .placeholder=${this._getCurrentValueText("flex","rowGap")}
                                    .default=${p.value??0}
                                    min="0"
                                    step="1"
                                    unit="${u??"px"}"
                                    .units=${(null==a?void 0:a.units)??["px"]}
                                    @change=${e=>this._handlePropertyChange("flex","rowGap",e.detail.value,e.detail.unit)}
                            ></sm-number-input>
                        `)}
                        ${this._renderPropertyRow("flex","columnGap","Column Gap",r`
                            <sm-number-input
                                    .value=${this._getUserValue("flex","columnGap")}
                                    .placeholder=${this._getCurrentValueText("flex","columnGap")}
                                    .default=${h.value??0}
                                    min="0"
                                    step="1"
                                    unit="${g??"px"}"
                                    .units=${(null==s?void 0:s.units)??["px"]}
                                    @change=${e=>this._handlePropertyChange("flex","columnGap",e.detail.value,e.detail.unit)}
                            ></sm-number-input>
                        `)}
                    </div>
                </div>
            </div>
        `}_renderSizeSection(){var e,t,i,o,a,s;if(!this.selectedBlock)return l;if(!this._isSectionVisible("size"))return l;const n=this.expandedSections.has("size"),d=this._getUnitConfig("size","width"),c=this._getUnitConfig("size","height"),p=this._getUnitConfig("size","minWidth"),h=this._getUnitConfig("size","maxWidth"),u=this._getUnitConfig("size","minHeight"),g=this._getUnitConfig("size","maxHeight"),v=this._getComputedNumberValue("size","width"),b=this._getComputedNumberValue("size","height"),m=this._getComputedNumberValue("size","minWidth"),y=this._getComputedNumberValue("size","maxWidth"),f=this._getComputedNumberValue("size","minHeight"),x=this._getComputedNumberValue("size","maxHeight"),_=v.unit&&(null==(e=null==d?void 0:d.units)?void 0:e.includes(v.unit))?v.unit:null==d?void 0:d.unit,k=b.unit&&(null==(t=null==c?void 0:c.units)?void 0:t.includes(b.unit))?b.unit:null==c?void 0:c.unit,w=m.unit&&(null==(i=null==p?void 0:p.units)?void 0:i.includes(m.unit))?m.unit:null==p?void 0:p.unit,$=y.unit&&(null==(o=null==h?void 0:h.units)?void 0:o.includes(y.unit))?y.unit:null==h?void 0:h.unit,S=f.unit&&(null==(a=null==u?void 0:u.units)?void 0:a.includes(f.unit))?f.unit:null==u?void 0:u.unit,C=x.unit&&(null==(s=null==g?void 0:g.units)?void 0:s.includes(x.unit))?x.unit:null==g?void 0:g.unit;return r`
            <div class="section ${n?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("size")}>
                    <span class="section-title">
                        <span>Size</span>
                        ${this._sectionHasInlineOverrides("size")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">

                    ${this._renderPropertyRow("size","width","Width",r`
                        <sm-number-input
                                .value=${this._getUserValue("size","width")}
                                .placeholder=${this._getCurrentValueText("size","width")}
                                .default=${v.value??0}
                                min="1"
                                step="1"
                                unit="${_??"px"}"
                                .units=${(null==d?void 0:d.units)??["px"]}
                                @change=${e=>{this._handlePropertyChange("size","width",e.detail.value,e.detail.unit)}}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","height","Height",r`
                        <sm-number-input
                                .value=${this._getUserValue("size","height")}
                                .placeholder=${this._getCurrentValueText("size","height")}
                                .default=${b.value??0}
                                min="1"
                                step="1"
                                unit="${k??"px"}"
                                .units=${(null==c?void 0:c.units)??["px"]}
                                @change=${e=>{this._handlePropertyChange("size","height",e.detail.value,e.detail.unit)}}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","minWidth","Min Width",r`
                        <sm-number-input
                                .value=${this._getUserValue("size","minWidth")}
                                .placeholder=${this._getCurrentValueText("size","minWidth")}
                                .default=${m.value??0}
                                min="0"
                                step="1"
                                unit="${w??"px"}"
                                .units=${(null==p?void 0:p.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("size","minWidth",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","maxWidth","Max Width",r`
                        <sm-number-input
                                .value=${this._getUserValue("size","maxWidth")}
                                .placeholder=${this._getCurrentValueText("size","maxWidth")}
                                .default=${y.value??0}
                                min="0"
                                step="1"
                                unit="${$??"px"}"
                                .units=${(null==h?void 0:h.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("size","maxWidth",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","minHeight","Min Height",r`
                        <sm-number-input
                                .value=${this._getUserValue("size","minHeight")}
                                .placeholder=${this._getCurrentValueText("size","minHeight")}
                                .default=${f.value??0}
                                min="0"
                                step="1"
                                unit="${S??"px"}"
                                .units=${(null==u?void 0:u.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("size","minHeight",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("size","maxHeight","Max Height",r`
                        <sm-number-input
                                .value=${this._getUserValue("size","maxHeight")}
                                .placeholder=${this._getCurrentValueText("size","maxHeight")}
                                .default=${x.value??0}
                                min="0"
                                step="1"
                                unit="${C??"px"}"
                                .units=${(null==g?void 0:g.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("size","maxHeight",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                </div>
            </div>
        `}_renderSpacingSection(){if(!this._isSectionVisible("spacing"))return l;const e=this.resolvedStyles.spacing||{},t=this.expandedSections.has("spacing"),i=this._getUnitConfig("spacing","margin"),o=this._getUnitConfig("spacing","padding"),a=this._getCurrentValueText("spacing","margin"),s=this._getCurrentValueText("spacing","padding");return r`
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
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("spacing","margin","Margin",r`
                        <sm-spacing-input
                                .value=${this._getResolvedValue(e.margin)}
                                unit="${(null==i?void 0:i.unit)??"px"}"
                                .units=${(null==i?void 0:i.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("spacing","margin",e.detail.value,e.detail.unit)}
                        ></sm-spacing-input>
                    `,{helperText:a})}
                    ${this._renderPropertyRow("spacing","padding","Padding",r`
                        <sm-spacing-input
                                .value=${this._getResolvedValue(e.padding)}
                                unit="${(null==o?void 0:o.unit)??"px"}"
                                .units=${(null==o?void 0:o.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("spacing","padding",e.detail.value,e.detail.unit)}
                        ></sm-spacing-input>
                    `,{helperText:s})}
                </div>
            </div>
        `}_renderTypographySection(){var e,t;if(!this._isSectionVisible("typography"))return l;const i=this.resolvedStyles.typography||{},o=this.expandedSections.has("typography"),a=this._getUnitConfig("typography","fontSize"),s=this._getUnitConfig("typography","letterSpacing"),n=this._getComputedNumberValue("typography","fontSize"),d=this._getComputedNumberValue("typography","lineHeight"),c=this._getComputedNumberValue("typography","letterSpacing"),p=!this._hasLocalOverride("typography","fontSize")&&n.unit&&(null==(e=null==a?void 0:a.units)?void 0:e.includes(n.unit))?n.unit:null==a?void 0:a.unit,h=!this._hasLocalOverride("typography","letterSpacing")&&c.unit&&(null==(t=null==s?void 0:s.units)?void 0:t.includes(c.unit))?c.unit:null==s?void 0:s.unit,u=this._hasLocalOverride("typography","fontSize")?this._getResolvedValue(i.fontSize,16):n.value??this._getResolvedValue(i.fontSize,16),g=this._getResolvedValue(i.lineHeight,1.5),v=this._hasLocalOverride("typography","lineHeight")?g:d.value??g,b=this._getResolvedValue(i.letterSpacing,0),m=this._hasLocalOverride("typography","letterSpacing")?b:c.value??b,y=this._getCurrentValueText("typography","textAlign"),f=this._getCurrentValueText("typography","fontWeight"),x=this._getCurrentValueText("typography","fontFamily"),_=this._getCurrentValueText("typography","textTransform"),k=this._getCurrentValueText("typography","textDecoration"),w=this._getCurrentValueText("typography","whiteSpace"),$=this._getCurrentValueText("typography","color");return r`
            <div class="section ${o?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("typography")}>
                    <span class="section-title">
                        <span>Typography</span>
                        ${this._sectionHasInlineOverrides("typography")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("typography","color","Text Color",r`
                        <sm-color-input
                                .value=${this._getResolvedValue(i.color,"")}
                                @change=${e=>this._handlePropertyChange("typography","color",e.detail.value)}
                        ></sm-color-input>
                    `,{helperText:$})}
                    ${this._renderPropertyRow("typography","textAlign","Text Align",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.textAlign)}
                                .options=${[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"},{label:"Justify",value:"justify"}]}
                                @change=${e=>this._handlePropertyChange("typography","textAlign",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:y})}
                    ${this._renderPropertyRow("typography","fontSize","Font Size",r`
                        <sm-slider-input
                                .value=${u??16}
                                min="8"
                                max="72"
                                step="1"
                                unit="${p??"px"}"
                                .units=${(null==a?void 0:a.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("typography","fontSize",e.detail.value,e.detail.unit)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow("typography","fontWeight","Font Weight",r`
                        <sm-select-input
                                .value=${String(this._getResolvedValue(i.fontWeight))}
                                .options=${[{label:"Thin (100)",value:"100"},{label:"Light (300)",value:"300"},{label:"Normal (400)",value:"400"},{label:"Medium (500)",value:"500"},{label:"Semi-Bold (600)",value:"600"},{label:"Bold (700)",value:"700"},{label:"Extra-Bold (800)",value:"800"}]}
                                @change=${e=>this._handlePropertyChange("typography","fontWeight",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:f})}
                    ${this._renderPropertyRow("typography","fontFamily","Font Family",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.fontFamily)}
                                .options=${[{label:"Arial",value:"Arial, sans-serif"},{label:"Helvetica",value:"Helvetica, sans-serif"},{label:"Times New Roman",value:'"Times New Roman", serif'},{label:"Georgia",value:"Georgia, serif"},{label:"Courier New",value:'"Courier New", monospace'},{label:"Verdana",value:"Verdana, sans-serif"}]}
                                @change=${e=>this._handlePropertyChange("typography","fontFamily",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:x})}
                    ${this._renderPropertyRow("typography","lineHeight","Line Height",r`
                        <sm-slider-input
                                .value=${v??1.5}
                                min="0.5"
                                max="3"
                                step="0.1"
                                @change=${e=>this._handlePropertyChange("typography","lineHeight",e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow("typography","textTransform","Text Transform",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.textTransform)}
                                .options=${No}
                                @change=${e=>this._handlePropertyChange("typography","textTransform",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:_})}
                    ${this._renderPropertyRow("typography","textDecoration","Text Decoration",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.textDecoration)}
                                .options=${Fo}
                                @change=${e=>this._handlePropertyChange("typography","textDecoration",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:k})}
                    ${this._renderPropertyRow("typography","textShadow","Text Shadow",r`
                        <sm-text-input
                                .value=${this._getUserValue("typography","textShadow","")??""}
                                placeholder=${this._getCurrentValueText("typography","textShadow")??"e.g. 2px 2px 4px rgba(0,0,0,0.3)"}
                                @change=${e=>this._handlePropertyChange("typography","textShadow",e.detail.value)}
                        ></sm-text-input>
                    `)}
                    ${this._renderPropertyRow("typography","letterSpacing","Letter Spacing",r`
                        <sm-slider-input
                                .value=${m??0}
                                min="-2"
                                max="10"
                                step="0.1"
                                unit="${h??"px"}"
                                .units=${(null==s?void 0:s.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("typography","letterSpacing",e.detail.value,e.detail.unit)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow("typography","whiteSpace","White Space",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.whiteSpace)}
                                .options=${jo}
                                @change=${e=>this._handlePropertyChange("typography","whiteSpace",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:w})}
                </div>
            </div>
        `}_renderBackgroundSection(){if(!this._isSectionVisible("background"))return l;const e=this.resolvedStyles.background||{},t=this.expandedSections.has("background"),i=String(this._getResolvedValue(e.backgroundImage,"")),o=i?this._getBackgroundImageMode(i):this.backgroundImageMode,a=this._extractBackgroundImageUrl(i),s=this._getUserValue("background","backgroundImage","")??"",n=this._extractBackgroundImageUrl(s),d="media"===o?a:"",c=N(d),p=c?T(d)||d:"",h=String(this._getResolvedValue(e.backgroundSize,"auto")),u=this._getBackgroundSizePreset(h),g=this._parseLengthPair(h,{x:{value:100,unit:"%"},y:{value:100,unit:"%"}}),v=String(this._getResolvedValue(e.backgroundPosition,"center")),b=this._getBackgroundPositionPreset(v),m=this._parseLengthPair(v,{x:{value:50,unit:"%"},y:{value:50,unit:"%"}}),y=String(this._getResolvedValue(e.backgroundRepeat)),f=this._getCurrentValueText("background","backgroundImage"),x="image"===o||"gradient"===o||"custom"===o?void 0:this._getCurrentValueText("background","backgroundImage"),_=this._getCurrentValueText("background","backgroundSize"),k=this._getCurrentValueText("background","backgroundPosition"),w=this._getCurrentValueText("background","backgroundRepeat"),$=this._getCurrentValueText("background","backgroundBlendMode"),S=this._getCurrentValueText("background","backgroundColor"),C=this._getCurrentValueText("background","boxShadow")??"0 6px 18px rgba(0, 0, 0, 0.2)";return r`
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
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("background","backgroundColor","Background Color",r`
                        <sm-color-input
                                .value=${this._getResolvedValue(e.backgroundColor,"")}
                                @change=${e=>this._handlePropertyChange("background","backgroundColor",e.detail.value)}
                        ></sm-color-input>
                    `,{helperText:S})}
                    ${this._renderPropertyRow("background","backgroundImage","Background Image",r`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${o}
                                    .options=${zo}
                                    @change=${e=>this._handleBackgroundImageModeChange(e.detail.value,i)}
                            ></sm-select-input>
                            ${"image"===o?r`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder=${f??"https://example.com/background.png"}
                                        .value=${n}
                                        @input=${e=>this._handlePropertyChange("background","backgroundImage",e.target.value)}
                                />
                            `:l}
                            ${"media"===o?r`
                                <div class="background-media">
                                    ${c?r`
                                        <div class="media-selected">
                                            <span class="media-name" title=${d}>${p}</span>
                                            <div class="media-actions">
                                                <button class="media-button" @click=${this._openMediaManagerForBackgroundImage}>
                                                    Edit
                                                </button>
                                                <button class="media-button danger" @click=${this._clearBackgroundMedia}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    `:r`
                                        <button class="media-button primary" @click=${this._openMediaManagerForBackgroundImage}>
                                            Select media
                                        </button>
                                    `}
                                </div>
                            `:l}
                            ${"gradient"===o?r`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder=${f??"linear-gradient(135deg, #111111, #999999)"}
                                        .value=${s}
                                        @input=${e=>this._handlePropertyChange("background","backgroundImage",e.target.value)}
                                />
                            `:l}
                            ${"custom"===o?r`
                                <input
                                        class="text-input"
                                        type="text"
                                        placeholder=${f??"url(...) or gradient"}
                                        .value=${s}
                                        @input=${e=>this._handlePropertyChange("background","backgroundImage",e.target.value)}
                                />
                            `:l}
                        </div>
                    `,{helperText:x})}
                    ${this._renderPropertyRow("background","backgroundSize","Background Size",r`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${u}
                                    .options=${Do}
                                    @change=${e=>this._handleBackgroundSizePresetChange(e.detail.value,u)}
                            ></sm-select-input>
                            ${u===To?r`
                                <div class="background-inline-grid">
                                    <div class="background-field">
                                        <span class="background-field-label">Width</span>
                                        <sm-number-input
                                                .value=${g.x.value}
                                                min="0"
                                                step="1"
                                                unit="${g.x.unit}"
                                                .units=${Vo}
                                                @change=${e=>this._handleBackgroundLengthPairChange("backgroundSize","x",e.detail.value,e.detail.unit,g)}
                                        ></sm-number-input>
                                    </div>
                                    <div class="background-field">
                                        <span class="background-field-label">Height</span>
                                        <sm-number-input
                                                .value=${g.y.value}
                                                min="0"
                                                step="1"
                                                unit="${g.y.unit}"
                                                .units=${Vo}
                                                @change=${e=>this._handleBackgroundLengthPairChange("backgroundSize","y",e.detail.value,e.detail.unit,g)}
                                        ></sm-number-input>
                                    </div>
                                </div>
                            `:l}
                        </div>
                    `,{helperText:_})}
                    ${this._renderPropertyRow("background","backgroundPosition","Background Position",r`
                        <div class="background-input">
                            <sm-select-input
                                    .value=${b}
                                    .options=${Oo}
                                    @change=${e=>this._handleBackgroundPositionPresetChange(e.detail.value,b)}
                            ></sm-select-input>
                            ${b===To?r`
                                <div class="background-inline-grid">
                                    <div class="background-field">
                                        <span class="background-field-label">X</span>
                                        <sm-number-input
                                                .value=${m.x.value}
                                                step="1"
                                                unit="${m.x.unit}"
                                                .units=${Vo}
                                                @change=${e=>this._handleBackgroundLengthPairChange("backgroundPosition","x",e.detail.value,e.detail.unit,m)}
                                        ></sm-number-input>
                                    </div>
                                    <div class="background-field">
                                        <span class="background-field-label">Y</span>
                                        <sm-number-input
                                                .value=${m.y.value}
                                                step="1"
                                                unit="${m.y.unit}"
                                                .units=${Vo}
                                                @change=${e=>this._handleBackgroundLengthPairChange("backgroundPosition","y",e.detail.value,e.detail.unit,m)}
                                        ></sm-number-input>
                                    </div>
                                </div>
                            `:l}
                        </div>
                    `,{helperText:k})}
                    ${this._renderPropertyRow("background","backgroundRepeat","Background Repeat",r`
                        <sm-select-input
                                .value=${y}
                                .options=${Ro}
                                @change=${e=>this._handlePropertyChange("background","backgroundRepeat",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:w})}
                    ${this._renderPropertyRow("background","boxShadow","Box Shadow",r`
                        <input
                                class="text-input"
                                type="text"
                                placeholder=${C}
                                .value=${this._getUserValue("background","boxShadow","")??""}
                                @input=${e=>this._handlePropertyChange("background","boxShadow",e.target.value)}
                        />
                    `)}
                    ${this._renderPropertyRow("background","backgroundBlendMode","Background Blend Mode",r`
                        <sm-select-input
                                .value=${String(this._getResolvedValue(e.backgroundBlendMode))}
                                .options=${Lo}
                                @change=${e=>this._handlePropertyChange("background","backgroundBlendMode",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:$})}
                </div>
            </div>
        `}_renderBorderSection(){var e,t;if(!this._isSectionVisible("border"))return l;const i=this.resolvedStyles.border||{},o=this.expandedSections.has("border"),a=this._getUnitConfig("border","borderWidth"),s=this._getUnitConfig("border","borderRadius"),n=this._getComputedNumberValue("border","borderWidth"),d=this._getComputedNumberValue("border","borderRadius"),c=n.unit&&(null==(e=null==a?void 0:a.units)?void 0:e.includes(n.unit))?n.unit:null==a?void 0:a.unit,p=d.unit&&(null==(t=null==s?void 0:s.units)?void 0:t.includes(d.unit))?d.unit:null==s?void 0:s.unit,h=this._getCurrentValueText("border","borderStyle"),u=this._getCurrentValueText("border","borderColor");return r`
            <div class="section ${o?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("border")}>
                    <span class="section-title">
                        <span>Border</span>
                        ${this._sectionHasInlineOverrides("border")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("border","borderWidth","Border Width",r`
                        <sm-number-input
                                .value=${this._getUserValue("border","borderWidth")}
                                .placeholder=${this._getCurrentValueText("border","borderWidth")}
                                .default=${n.value??0}
                                min="0"
                                step="1"
                                unit="${c??"px"}"
                                .units=${(null==a?void 0:a.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("border","borderWidth",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("border","borderStyle","Border Style",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.borderStyle)}
                                .options=${[{label:"None",value:"none"},{label:"Solid",value:"solid"},{label:"Dashed",value:"dashed"},{label:"Dotted",value:"dotted"},{label:"Double",value:"double"}]}
                                @change=${e=>this._handlePropertyChange("border","borderStyle",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:h})}
                    ${this._renderPropertyRow("border","borderColor","Border Color",r`
                        <sm-color-input
                                .value=${this._getResolvedValue(i.borderColor,"")}
                                @change=${e=>this._handlePropertyChange("border","borderColor",e.detail.value)}
                        ></sm-color-input>
                    `,{helperText:u})}
                    ${this._renderPropertyRow("border","borderRadius","Border Radius",r`
                        <sm-number-input
                                .value=${this._getUserValue("border","borderRadius")}
                                .placeholder=${this._getCurrentValueText("border","borderRadius")}
                                .default=${d.value??0}
                                min="0"
                                step="1"
                                unit="${p??"px"}"
                                .units=${(null==s?void 0:s.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("border","borderRadius",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                </div>
            </div>
        `}_renderEffectsSection(){var e;if(!this._isSectionVisible("effects"))return l;const t=this.resolvedStyles.effects||{},i=this.expandedSections.has("effects"),o=this._getComputedNumberValue("effects","opacity"),a=this._getComputedNumberValue("effects","rotate"),s=this._getUnitConfig("effects","rotate"),n=!this._hasLocalOverride("effects","rotate")&&a.unit&&(null==(e=null==s?void 0:s.units)?void 0:e.includes(a.unit))?a.unit:null==s?void 0:s.unit,d=this._getResolvedValue(t.opacity,1),c=this._hasLocalOverride("effects","opacity")?d:o.value??d,p=this._getResolvedValue(t.rotate,0),h=this._hasLocalOverride("effects","rotate")?p:a.value??p;return r`
            <div class="section ${i?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("effects")}>
                    <span class="section-title">
                        <span>Effects</span>
                        ${this._sectionHasInlineOverrides("effects")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("effects","opacity","Opacity",r`
                        <sm-slider-input
                                .value=${c??1}
                                min="0"
                                max="1"
                                step="0.01"
                                @change=${e=>this._handlePropertyChange("effects","opacity",e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow("effects","rotate","Rotate",r`
                        <sm-slider-input
                                .value=${h??0}
                                min="0"
                                max="360"
                                step="1"
                                unit="${n??"deg"}"
                                .units=${(null==s?void 0:s.units)??["deg"]}
                                @change=${e=>this._handlePropertyChange("effects","rotate",e.detail.value,e.detail.unit)}
                        ></sm-slider-input>
                    `)}
                </div>
            </div>
        `}_renderSvgSection(){var e,t;if(!this._isSectionVisible("svg"))return l;const i=this.resolvedStyles.svg||{},o=this.expandedSections.has("svg"),a=this._getUnitConfig("svg","strokeWidth"),s=this._getUnitConfig("svg","strokeDashoffset"),n=this._getComputedNumberValue("svg","strokeWidth"),d=this._getComputedNumberValue("svg","strokeDashoffset"),c=this._getComputedNumberValue("svg","strokeMiterlimit"),p=this._getComputedNumberValue("svg","strokeOpacity"),h=this._getComputedNumberValue("svg","fillOpacity"),u=n.unit&&(null==(e=null==a?void 0:a.units)?void 0:e.includes(n.unit))?n.unit:null==a?void 0:a.unit,g=d.unit&&(null==(t=null==s?void 0:s.units)?void 0:t.includes(d.unit))?d.unit:null==s?void 0:s.unit,v=this._getResolvedValue(i.strokeOpacity,1),b=this._hasLocalOverride("svg","strokeOpacity")?v:p.value??v,m=this._getResolvedValue(i.fillOpacity,1),y=this._hasLocalOverride("svg","fillOpacity")?m:h.value??m,f=this._getCurrentValueText("svg","stroke"),x=this._getCurrentValueText("svg","fill"),_=this._getCurrentValueText("svg","strokeLinecap"),k=this._getCurrentValueText("svg","strokeLinejoin");return r`
            <div class="section ${o?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("svg")}>
                    <span class="section-title">
                        <span>SVG</span>
                        ${this._sectionHasInlineOverrides("svg")?r`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("svg","stroke","Stroke Color",r`
                        <sm-color-input
                                .value=${this._getResolvedValue(i.stroke,"")}
                                @change=${e=>this._handlePropertyChange("svg","stroke",e.detail.value)}
                        ></sm-color-input>
                    `,{helperText:f})}
                    ${this._renderPropertyRow("svg","strokeWidth","Stroke Width",r`
                        <sm-number-input
                                .value=${this._getUserValue("svg","strokeWidth")}
                                .placeholder=${this._getCurrentValueText("svg","strokeWidth")}
                                .default=${n.value??0}
                                min="0"
                                step="1"
                                unit="${u??"px"}"
                                .units=${(null==a?void 0:a.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("svg","strokeWidth",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("svg","strokeLinecap","Line Cap",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.strokeLinecap)}
                                .options=${[{label:"Butt",value:"butt"},{label:"Round",value:"round"},{label:"Square",value:"square"}]}
                                @change=${e=>this._handlePropertyChange("svg","strokeLinecap",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:_})}
                    ${this._renderPropertyRow("svg","strokeLinejoin","Line Join",r`
                        <sm-select-input
                                .value=${this._getResolvedValue(i.strokeLinejoin)}
                                .options=${[{label:"Miter",value:"miter"},{label:"Round",value:"round"},{label:"Bevel",value:"bevel"}]}
                                @change=${e=>this._handlePropertyChange("svg","strokeLinejoin",e.detail.value)}
                        ></sm-select-input>
                    `,{helperText:k})}
                    ${this._renderPropertyRow("svg","strokeDasharray","Dash Array",r`
                        <sm-text-input
                                .value=${this._getUserValue("svg","strokeDasharray","")??""}
                                placeholder=${this._getCurrentValueText("svg","strokeDasharray")??"e.g. 8 6"}
                                @change=${e=>this._handlePropertyChange("svg","strokeDasharray",e.detail.value)}
                        ></sm-text-input>
                    `)}
                    ${this._renderPropertyRow("svg","strokeDashoffset","Dash Offset",r`
                        <sm-number-input
                                .value=${this._getUserValue("svg","strokeDashoffset")}
                                .placeholder=${this._getCurrentValueText("svg","strokeDashoffset")}
                                .default=${d.value??0}
                                step="1"
                                unit="${g??"px"}"
                                .units=${(null==s?void 0:s.units)??["px"]}
                                @change=${e=>this._handlePropertyChange("svg","strokeDashoffset",e.detail.value,e.detail.unit)}
                        ></sm-number-input>
                    `)}
                    ${this._renderPropertyRow("svg","strokeOpacity","Stroke Opacity",r`
                        <sm-slider-input
                                .value=${b??1}
                                min="0"
                                max="1"
                                step="0.01"
                                @change=${e=>this._handlePropertyChange("svg","strokeOpacity",e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow("svg","fill","Fill Color",r`
                        <sm-color-input
                                .value=${this._getResolvedValue(i.fill,"")}
                                @change=${e=>this._handlePropertyChange("svg","fill",e.detail.value)}
                        ></sm-color-input>
                    `,{helperText:x})}
                    ${this._renderPropertyRow("svg","fillOpacity","Fill Opacity",r`
                        <sm-slider-input
                                .value=${y??1}
                                min="0"
                                max="1"
                                step="0.01"
                                @change=${e=>this._handlePropertyChange("svg","fillOpacity",e.detail.value)}
                        ></sm-slider-input>
                    `)}
                    ${this._renderPropertyRow("svg","strokeMiterlimit","Miter Limit",r`
                        <sm-number-input
                                .value=${this._getUserValue("svg","strokeMiterlimit")}
                                .placeholder=${this._getCurrentValueText("svg","strokeMiterlimit")}
                                .default=${c.value??0}
                                min="1"
                                step="1"
                                @change=${e=>this._handlePropertyChange("svg","strokeMiterlimit",e.detail.value)}
                        ></sm-number-input>
                    `)}
                </div>
            </div>
        `}_renderAnimationsSection(){if(!this._isSectionVisible("animations"))return l;const e=this.expandedSections.has("animations");return r`
            <div class="section ${e?"expanded":""}">
                <div class="section-header" @click=${()=>this.toggleSection("animations")}>
                    <span class="section-title">
                        <span>Animations</span>
                        ${this._sectionHasInlineOverrides("animations")?r`
                            <span
                                class="section-indicator"
                                title="Inline overrides"
                                aria-label="Inline overrides"
                            ></span>
                        `:l}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow("animations","motion","Block motion",r`
                        <div class="animation-hint">
                            Use the animation editor to add motion to the block.
                        </div>
                    `,{showBindingToggle:!1})}
                </div>
            </div>
        `}_resetComputedStyleCache(){this.computedStyleTarget=null,this.computedStyle=null}_getStyleTargetElement(){var e;if(!this.selectedBlock)return null;const t=this.documentModel.getElement(this.selectedBlock.id);if(!t)return null;if(!this.activeTargetId)return t;const i=t.renderRoot??t.shadowRoot??t;return(null==(e=null==i?void 0:i.querySelector)?void 0:e.call(i,`[data-style-target="${this.activeTargetId}"]`))??t}_getComputedStyleDeclaration(){const e=this._getStyleTargetElement();return e?(this.computedStyleTarget!==e&&(this.computedStyleTarget=e,this.computedStyle=getComputedStyle(e)),this.computedStyle):(this.computedStyleTarget=null,this.computedStyle=null,null)}_getComputedStyleValueByCssProperty(e){const t=this._getComputedStyleDeclaration();if(!t)return;return t.getPropertyValue(e).trim()||void 0}_getCssPropertyName(e){if(e)return e.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`)}_hasLocalOverride(e,t){var i,o;return Boolean(null==(o=null==(i=this.resolvedStyles[e])?void 0:i[t])?void 0:o.hasLocalOverride)}_shouldUseComputedFallback(e,t){return!Mo.includes(`${e}.${t}`)&&!this._hasLocalOverride(e,t)}_getComputedStyleValue(e,t){if(!this._shouldUseComputedFallback(e,t))return;if("spacing"===e&&("margin"===t||"padding"===t)){const e="margin"===t?"margin":"padding",i=this._getComputedStyleValueByCssProperty(`${e}-top`),o=this._getComputedStyleValueByCssProperty(`${e}-right`),r=this._getComputedStyleValueByCssProperty(`${e}-bottom`),a=this._getComputedStyleValueByCssProperty(`${e}-left`);if(i&&o&&r&&a)return`${i} ${o} ${r} ${a}`;const s=this._getComputedStyleValueByCssProperty(e);if(s)return s;const n=[i,o,r,a].filter(Boolean);return n.length>0?n.join(" "):void 0}const i=this._getCssPropertyName(t);return i?this._getComputedStyleValueByCssProperty(i):void 0}_getCurrentValueText(e,t){const i=this._getComputedStyleValue(e,t);if(i)return`Current: ${i}`}_parseNumberWithUnit(e){const t=e.trim().split(/\s+/)[0].match(/^(-?\d*\.?\d+)([a-z%]*)$/i);if(!t)return null;const i=parseFloat(t[1]);if(Number.isNaN(i))return null;return{value:i,unit:t[2]?t[2]:void 0}}_getComputedNumberValue(e,t){if(!this._shouldUseComputedFallback(e,t))return{};if("typography.lineHeight"===`${e}.${t}`){const e=this._getComputedStyleValueByCssProperty("line-height"),t=this._getComputedStyleValueByCssProperty("font-size");if(!e||!t)return{};const i=this._parseNumberWithUnit(e),o=this._parseNumberWithUnit(t);return(null==i?void 0:i.value)&&(null==o?void 0:o.value)?{value:i.value/o.value,text:e}:{}}const i=this._getComputedStyleValue(e,t);if(!i)return{};const o=i.trim().toLowerCase();if("none"===o||"normal"===o)return{value:0,text:i};const r=this._parseNumberWithUnit(i);return r?{value:r.value,unit:r.unit,text:i}:{text:i}}_getUserValue(e,t,i){var o;if(this._hasLocalOverride(e,t))return this._getResolvedValue(null==(o=this.resolvedStyles[e])?void 0:o[t],i)}_renderPropertyRow(e,t,i,o,a={}){var s;if(!this._isPropertyVisible(e,t))return l;const n=null==(s=this.resolvedStyles[e])?void 0:s[t],{showBindingToggle:d=!0,showAnimationToggle:c=!0,helperText:p}=a;return r`
            <property-row
                    .hass=${this.hass}
                    .label=${i}
                    .property=${t}
                    .category=${e}
                    .origin=${(null==n?void 0:n.origin)||"default"}
                    .presetName=${(null==n?void 0:n.presetId)?this._getPresetName(n.presetId):void 0}
                    .originContainer=${null==n?void 0:n.originContainer}
                    .hasLocalOverride=${(null==n?void 0:n.hasLocalOverride)||!1}
                    .binding=${null==n?void 0:n.binding}
                    .animation=${null==n?void 0:n.animation}
                    .resolvedValue=${null==n?void 0:n.value}
                    .resolvedUnit=${null==n?void 0:n.unit}
                    .helperText=${p}
                    .defaultEntityId=${this.defaultEntityId}
                    .showBindingToggle=${d}
                    .showAnimationToggle=${c}
                    @property-binding-change=${e=>this._handleBindingChange(e.detail.category,e.detail.property,e.detail.binding,e.detail.unit)}
                    @property-binding-edit=${this._handleBindingEdit}
                    @property-animation-change=${e=>this._handleAnimationChange(e.detail.category,e.detail.property,e.detail.animation)}
                    @property-animation-edit=${this._handleAnimationEdit}
                    @property-reset=${e=>this._handlePropertyReset(e.detail.category,e.detail.property)}
            >
                ${o}
            </property-row>
        `}_renderBindingEditorOverlay(){var e,t;if(!this.bindingEditorTarget)return l;const{category:i,property:o,label:a}=this.bindingEditorTarget,s=null==(t=null==(e=this.resolvedStyles[i])?void 0:e[o])?void 0:t.binding,n=this._getBindingValueInputConfig(i,o);return r`
            <property-binding-editor-overlay
                .open=${this.bindingEditorOpen}
                .hass=${this.hass}
                .label=${a}
                .category=${i}
                .block=${this.selectedBlock}
                .propertyName=${o}
                .binding=${s}
                .defaultEntityId=${this.defaultEntityId}
                .slots=${this.slots}
                .valueInputConfig=${n}
                @property-binding-change=${e=>this._handleBindingChange(e.detail.category,e.detail.property,e.detail.binding,e.detail.unit)}
                @overlay-close=${()=>this._closeBindingEditor()}
            ></property-binding-editor-overlay>
        `}_renderAnimationEditorOverlay(){if(!this.animationEditorTarget)return l;const{property:e,label:t}=this.animationEditorTarget;return r`
            <property-animation-editor-overlay
                .open=${this.animationEditorOpen}
                .label=${t}
                .propertyName=${e}
                @property-animation-change=${e=>this._handleAnimationChange(e.detail.category,e.detail.property,e.detail.animation)}
                @overlay-close=${()=>this._closeAnimationEditor()}
            ></property-animation-editor-overlay>
        `}_getBindingValueInputConfig(e,t){const i=`${e}.${t}`,o=this._getUnitConfig(e,t);switch(i){case"layout.display":return{type:"select",options:[{label:"Block",value:"block"},{label:"Flex",value:"flex"},{label:"Grid",value:"grid"},{label:"Inline",value:"inline"},{label:"Inline Block",value:"inline-block"},{label:"Inline Flex",value:"inline-flex"},{label:"None",value:"none"}]};case"layout.positionX":case"layout.positionY":{const e=this.getLayoutData(),t=(null==e?void 0:e.positionConfig.unitSystem)??"px";return{type:"number",step:1,unit:t,units:[t]}}case"layout.zIndex":return{type:"number",min:0,step:1};case"size.width":case"size.height":return{type:"number",min:1,step:1,unit:null==o?void 0:o.unit,units:null==o?void 0:o.units};case"size.minWidth":case"size.maxWidth":case"size.minHeight":case"size.maxHeight":case"border.borderWidth":case"border.borderRadius":case"svg.strokeWidth":case"svg.strokeDashoffset":case"flex.rowGap":case"flex.columnGap":return{type:"number",min:0,step:1,unit:null==o?void 0:o.unit,units:null==o?void 0:o.units};case"spacing.margin":case"spacing.padding":return{type:"spacing",unit:null==o?void 0:o.unit,units:null==o?void 0:o.units};case"typography.fontFamily":return{type:"select",options:[{label:"Arial",value:"Arial, sans-serif"},{label:"Helvetica",value:"Helvetica, sans-serif"},{label:"Times New Roman",value:'"Times New Roman", serif'},{label:"Georgia",value:"Georgia, serif"},{label:"Courier New",value:'"Courier New", monospace'},{label:"Verdana",value:"Verdana, sans-serif"}]};case"typography.fontSize":return{type:"slider",min:8,max:72,step:1,unit:null==o?void 0:o.unit,units:null==o?void 0:o.units};case"typography.fontWeight":return{type:"select",options:[{label:"Thin (100)",value:"100"},{label:"Light (300)",value:"300"},{label:"Normal (400)",value:"400"},{label:"Medium (500)",value:"500"},{label:"Semi-Bold (600)",value:"600"},{label:"Bold (700)",value:"700"},{label:"Extra-Bold (800)",value:"800"}]};case"typography.lineHeight":return{type:"slider",min:.5,max:3,step:.1};case"typography.textAlign":return{type:"select",options:[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"},{label:"Justify",value:"justify"}]};case"typography.color":case"background.backgroundColor":case"border.borderColor":case"svg.stroke":case"svg.fill":return{type:"color"};case"background.backgroundImage":return{type:"text",placeholder:"https://... or linear-gradient(...)"};case"background.backgroundSize":return{type:"text",placeholder:"cover | contain | 100% 100%"};case"background.backgroundPosition":return{type:"text",placeholder:"center | 50% 50%"};case"background.backgroundRepeat":return{type:"select",options:Ro};case"border.borderStyle":return{type:"select",options:[{label:"None",value:"none"},{label:"Solid",value:"solid"},{label:"Dashed",value:"dashed"},{label:"Dotted",value:"dotted"},{label:"Double",value:"double"}]};case"svg.strokeLinecap":return{type:"select",options:[{label:"Butt",value:"butt"},{label:"Round",value:"round"},{label:"Square",value:"square"}]};case"svg.strokeLinejoin":return{type:"select",options:[{label:"Miter",value:"miter"},{label:"Round",value:"round"},{label:"Bevel",value:"bevel"}]};case"svg.strokeDasharray":return{type:"text",placeholder:"e.g. 8 6"};case"svg.strokeOpacity":case"svg.fillOpacity":case"effects.opacity":return{type:"slider",min:0,max:1,step:.01};case"svg.strokeMiterlimit":return{type:"number",min:1,step:1};case"flex.flexDirection":return{type:"select",options:[{label:"Row",value:"row"},{label:"Row Reverse",value:"row-reverse"},{label:"Column",value:"column"},{label:"Column Reverse",value:"column-reverse"}]};case"flex.justifyContent":return{type:"select",options:[{label:"Start",value:"flex-start"},{label:"Center",value:"center"},{label:"End",value:"flex-end"},{label:"Space Between",value:"space-between"},{label:"Space Around",value:"space-around"}]};case"flex.alignItems":return{type:"select",options:[{label:"Start",value:"flex-start"},{label:"Center",value:"center"},{label:"End",value:"flex-end"},{label:"Stretch",value:"stretch"}]};default:return}}_getResolvedValue(e,t=void 0){return e&&void 0!==e.value?e.value:t}_updateBackgroundImageMode(e){var t,i;if(e&&!this.selectedBlock)return void(this.backgroundImageMode="none");const o=null==(i=null==(t=this.resolvedStyles.background)?void 0:t.backgroundImage)?void 0:i.value,r="string"==typeof o?o.trim():"";if(!r)return void(e&&(this.backgroundImageMode="none"));const a=this._getBackgroundImageMode(r);a!==this.backgroundImageMode&&(this.backgroundImageMode=a)}_getBackgroundImageMode(e){const t=e.trim();if(!t||"none"===t)return"none";const i=this._extractBackgroundImageUrl(t);if(N(i))return"media";const o=t.toLowerCase();return o.includes("gradient(")?"gradient":o.startsWith("url(")||this._looksLikeUrl(t)?"image":"custom"}_looksLikeUrl(e){return!!/^(https?:\/\/|data:|\/)/i.test(e)||/^[^()\s]+\.[a-z0-9]{2,}$/i.test(e)}_extractBackgroundImageUrl(e){const t=e.trim();if(!t)return"";const i=t.match(/^url\((.*)\)$/i);if(!i)return t;let o=i[1].trim();return(o.startsWith('"')&&o.endsWith('"')||o.startsWith("'")&&o.endsWith("'"))&&(o=o.slice(1,-1)),o}_getBackgroundSizePreset(e){const t=e.trim().toLowerCase();return"auto"===t||"auto auto"===t?"auto":"cover"===t||"contain"===t?t:To}_getBackgroundPositionPreset(e){const t=e.trim().toLowerCase();if("center center"===t)return"center";const i=Ao[t];if(i)return i;const o=Oo.find(e=>e.value!==To&&e.value===t);return o?o.value:To}_parseLengthToken(e,t){if(!e)return t;const i=e.trim().match(/^(-?\d+(?:\.\d+)?)([a-z%]*)$/i);if(!i)return t;const o=Number(i[1]);if(!Number.isFinite(o))return t;const r=i[2]||t.unit;return Vo.includes(r)?{value:o,unit:r}:{value:o,unit:t.unit}}_parseLengthPair(e,t){const i=e.trim().split(/\s+/).filter(Boolean),o=i[0],r=i[1]??i[0];return{x:this._parseLengthToken(o,t.x),y:this._parseLengthToken(r,t.y)}}_formatLengthPair(e){return`${e.x.value}${e.x.unit} ${e.y.value}${e.y.unit}`}_handleBackgroundLengthPairChange(e,t,i,o,r){const a={x:"x"===t?{value:i,unit:o??r.x.unit}:r.x,y:"y"===t?{value:i,unit:o??r.y.unit}:r.y};this._handlePropertyChange("background",e,this._formatLengthPair(a))}_handleBackgroundImageModeChange(e,t){if(this.backgroundImageMode=e,"none"===e)return void this._handlePropertyChange("background","backgroundImage","none");const i=this._getBackgroundImageMode(t);if("media"===e){"media"!==i&&this._handlePropertyChange("background","backgroundImage","");const e=this._extractBackgroundImageUrl(t);return void(N(e)||this._openMediaManagerForBackgroundImage())}"gradient"!==e?"image"!==e?"custom"===e&&"custom"!==i&&this._handlePropertyChange("background","backgroundImage",""):"image"!==i&&this._handlePropertyChange("background","backgroundImage",""):"gradient"!==i&&this._handlePropertyChange("background","backgroundImage","linear-gradient(180deg, #000000, #ffffff)")}_handleBackgroundSizePresetChange(e,t){if(e!==To)this._handlePropertyChange("background","backgroundSize",e);else if(t!==To){const e={x:{value:100,unit:"%"},y:{value:100,unit:"%"}};this._handlePropertyChange("background","backgroundSize",this._formatLengthPair(e))}}_handleBackgroundPositionPresetChange(e,t){if(e!==To)this._handlePropertyChange("background","backgroundPosition",e);else if(t!==To){const e={x:{value:50,unit:"%"},y:{value:50,unit:"%"}};this._handlePropertyChange("background","backgroundPosition",this._formatLengthPair(e))}}_handleAnimationChange(e,t,i){}_handleAnimationEdit(e){const{category:t,property:i,label:o}=e.detail;this.animationEditorTarget={category:t,property:i,label:o},this.animationEditorOpen=!0}_closeAnimationEditor(e=!1){this.animationEditorOpen=!1,e&&(this.animationEditorTarget=null)}_getUnitConfig(e,t){var i,o;const r=F(e,t);if(!r||0===r.length)return null;const a=null==(o=null==(i=this.resolvedStyles[e])?void 0:i[t])?void 0:o.unit,s=j(e,t)??r[0];return{unit:a&&r.includes(a)?a:s,units:r}}_getPositionDisplayValue(e,t){var i,o;if(Boolean(null==(o=null==(i=this.resolvedStyles._internal)?void 0:i.position_config)?void 0:o.value))return"x"===e?t.x:t.y;const r=this.resolvedStyles.layout||{},a="x"===e?t.x:t.y;return this._getResolvedValue("x"===e?r.positionX:r.positionY,a)}_getPresetName(e){const t=this.presets.find(t=>t.id===e);return null==t?void 0:t.name}_sectionHasInlineOverrides(e){return this._getSectionGroups(e).some(e=>(eo[e]||[]).some(e=>{var t,i;if(!this._isPropertyKeyVisible(e))return!1;const o=e.indexOf(".");if(-1===o)return!1;const r=e.slice(0,o),a=e.slice(o+1);return Boolean(null==(i=null==(t=this.resolvedStyles[r])?void 0:t[a])?void 0:i.hasLocalOverride)}))}_getSectionGroups(e){return"layout"===e?["layout","flex"]:[e]}_isSectionVisible(e){if(!this.visibleProperties)return!0;const t=e;if(!this.visibleProperties.groups.has(t))return!1;return(eo[t]||[]).some(e=>this._isPropertyKeyVisible(e))}_isPropertyVisible(e,t){const i=`${e}.${t}`;return this._isPropertyKeyVisible(i)}_isPropertyKeyVisible(e){return!this.visibleProperties||this.visibleProperties.properties.has(e)&&!this.visibleProperties.excludedProperties.has(e)}};Uo.styles=[...nt.styles,t`

        .panel-content {
            padding: 0;
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

        .target-section {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
        }

        .target-label {
            display: block;
            margin-bottom: 8px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .target-description {
            margin-top: 8px;
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.4;
        }

        /* Sections */

        .section {
            margin-bottom: 0;
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

        .background-media {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .media-selected {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 8px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--bg-primary);
        }

        .media-name {
            font-size: 11px;
            color: var(--text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .media-actions {
            display: flex;
            gap: 6px;
            flex-shrink: 0;
        }

        .media-button {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            cursor: pointer;
        }

        .media-button.primary {
            background: var(--accent-color);
            border-color: transparent;
            color: #fff;
        }

        .media-button.danger {
            background: rgba(219, 68, 55, 0.12);
            border-color: rgba(219, 68, 55, 0.4);
            color: var(--error-color, #db4437);
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

        /* Container indicator */

        .container-indicator {
            padding: 8px 12px;
            background: var(--bg-tertiary);
            border-bottom: 1px solid var(--border-color);
            font-size: 13px;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .container-indicator .container-name {
            font-weight: 600;
            color: var(--accent-color);
        }

        .animation-hint {
            padding: 8px 10px;
            border: 1px dashed var(--border-color);
            border-radius: 4px;
            background: var(--bg-secondary);
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.4;
        }
    `];let Ho=Uo;Bo([p({context:w})],Ho.prototype,"documentModel"),Bo([p({context:U})],Ho.prototype,"containerManager"),Bo([p({context:H})],Ho.prototype,"styleResolver"),Bo([p({context:C})],Ho.prototype,"eventBus"),Bo([i({type:Object,attribute:!1})],Ho.prototype,"hass"),Bo([i({type:Number})],Ho.prototype,"canvasWidth"),Bo([i({type:Number})],Ho.prototype,"canvasHeight"),Bo([n()],Ho.prototype,"selectedBlock"),Bo([n()],Ho.prototype,"panelState"),Bo([n()],Ho.prototype,"resolvedStyles"),Bo([n()],Ho.prototype,"visibleProperties"),Bo([n()],Ho.prototype,"presets"),Bo([n()],Ho.prototype,"activeTargetId"),Bo([n()],Ho.prototype,"slots"),Bo([n()],Ho.prototype,"saveDialogOpen"),Bo([n()],Ho.prototype,"managerDialogOpen"),Bo([n()],Ho.prototype,"bindingEditorOpen"),Bo([n()],Ho.prototype,"bindingEditorTarget"),Bo([n()],Ho.prototype,"expandedSections"),Bo([n()],Ho.prototype,"backgroundImageMode"),Bo([n()],Ho.prototype,"pendingMediaRequestId"),Bo([n()],Ho.prototype,"animationEditorOpen"),Bo([n()],Ho.prototype,"animationEditorTarget"),ci.define("panel-styles",Ho);var Go=Object.defineProperty,Wo=Object.getOwnPropertyDescriptor,qo=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Wo(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Go(t,i,a),a};const Yo={tap:"Tap",double_tap:"Double Tap",hold:"Hold"};let Xo=class extends ft{constructor(){super(...arguments),this.slots=[],this.showManagement=!0}get showSearch(){return this.slots.length>5}get searchPlaceholder(){return"Search action slots..."}renderTriggerIcon(){return r`<ha-icon icon="mdi:flash"></ha-icon>`}renderTriggerLabel(){const e=this._getSelectedSlot();return r`
            ${e?r`${e.name||e.id} (${Yo[e.trigger]})`:r`<span class="placeholder">Select action slot</span>`}
        `}renderDropdownContent(){const e=this._getFilteredSlots();return r`
            <div class="option-list">
                <div
                    class="option-item ${this.selectedSlotId?"":"selected"}"
                    @click=${()=>this._selectSlot(null)}
                >
                    <span class="icon">
                        <ha-icon icon="mdi:close-circle-outline"></ha-icon>
                    </span>
                    <div class="info">
                        <div class="name">No slot</div>
                        <div class="description">Clear slot selection</div>
                    </div>
                    ${this.selectedSlotId?l:r`<span class="check">✓</span>`}
                </div>

                ${e.length>0?r`
                    <div class="divider"></div>
                    ${e.map(e=>r`
                        <div
                            class="option-item ${e.id===this.selectedSlotId?"selected":""}"
                            @click=${()=>this._selectSlot(e.id)}
                        >
                            <span class="icon">
                                <ha-icon icon="mdi:flash"></ha-icon>
                            </span>
                            <div class="info">
                                <div class="name">${e.name||e.id}</div>
                                ${e.description?r`
                                    <div class="description">${e.description}</div>
                                `:l}
                                <div class="meta">${this._formatAction(e)}</div>
                            </div>
                            ${e.id===this.selectedSlotId?r`<span class="check">✓</span>`:l}
                        </div>
                    `)}
                `:this._searchFilter?r`
                    <div class="empty-message">No slots match "${this._searchFilter}"</div>
                `:r`
                    <div class="empty-message">No action slots available</div>
                `}
            </div>

            ${this.showManagement?r`
                <div class="divider"></div>
                <div class="action-item" @click=${this._handleManageSlots}>
                    <span class="icon">
                        <ha-icon icon="mdi:cog"></ha-icon>
                    </span>
                    <span>Manage action slots...</span>
                </div>
            `:l}
        `}_selectSlot(e){this._closeDropdown(),this.dispatchEvent(new CustomEvent("action-slot-selected",{detail:{slotId:e},bubbles:!0,composed:!0}))}_handleManageSlots(){this._closeDropdown(),this.dispatchEvent(new CustomEvent("manage-action-slots",{bubbles:!0,composed:!0}))}_getSelectedSlot(){if(this.selectedSlotId)return this.slots.find(e=>e.id===this.selectedSlotId)}_getFilteredSlots(){return this._searchFilter?this.slots.filter(e=>{var t,i;return e.id.toLowerCase().includes(this._searchFilter)||(null==(t=e.name)?void 0:t.toLowerCase().includes(this._searchFilter))||(null==(i=e.description)?void 0:i.toLowerCase().includes(this._searchFilter))}):this.slots}_formatAction(e){return`${Yo[e.trigger]??e.trigger} • ${this._formatActionSummary(e.action)}`}_formatActionSummary(e){const t=this._getActionLabel(e.action);if("call-service"===e.action||"perform-action"===e.action){const i=this._getServiceValue(e);return i?`${t}: ${i}`:t}return"navigate"===e.action&&"navigation_path"in e?`${t}: ${e.navigation_path||""}`:"url"===e.action&&"url_path"in e?`${t}: ${e.url_path||""}`:t}_getActionLabel(e){return{none:"None",toggle:"Toggle","call-service":"Call Service","perform-action":"Perform Action",navigate:"Navigate","more-info":"More Info",url:"Open URL","fire-dom-event":"Fire Event","toggle-menu":"Toggle Menu"}[e]??e}_getServiceValue(e){return"perform_action"in e&&"string"==typeof e.perform_action&&e.perform_action?e.perform_action:"service"in e&&"string"==typeof e.service&&e.service?e.service:"domain"in e&&"string"==typeof e.domain&&"service"in e&&"string"==typeof e.service?`${e.domain}.${e.service}`:void 0}};qo([i({attribute:!1})],Xo.prototype,"slots",2),qo([i({type:String})],Xo.prototype,"selectedSlotId",2),qo([i({type:Boolean})],Xo.prototype,"showManagement",2),Xo=qo([a("action-slot-selector")],Xo);var Ko=Object.defineProperty,Jo=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&Ko(t,i,a),a};const Qo={tap:"Tap",double_tap:"Double Tap",hold:"Hold"},Zo=class extends nt{constructor(){super(...arguments),this.selectedBlock=null,this.activeTargetId="block",this.actionSlots=[],this.isAddOpen=!1,this._toggleAddAction=()=>{this.isAddOpen=!this.isAddOpen},this._onActionSlotSelected=e=>{var t;const i=e.detail.slotId;if(!i||!this.selectedBlock)return void(this.isAddOpen=!1);if(!this.activeTargetId)return void(this.isAddOpen=!1);const o={targets:{...(null==(t=this.selectedBlock.actions)?void 0:t.targets)||{}}},r=[...o.targets[this.activeTargetId]||[]];r.includes(i)||r.push(i),o.targets[this.activeTargetId]=r,this.documentModel.updateBlock(this.selectedBlock.id,{actions:o}),this.isAddOpen=!1}}connectedCallback(){super.connectedCallback(),this._refreshActionSlots(),this.documentModel.addEventListener("selection-changed",e=>{const t=e.detail;this.selectedBlock=t.selectedBlock||null,this.activeTargetId="block",this.isAddOpen=!1}),this.documentModel.addEventListener("block-updated",e=>{const t=e.detail;this.selectedBlock&&t.block.id===this.selectedBlock.id&&(this.selectedBlock={...t.block},this._ensureActiveTargetAvailable())}),this.documentModel.addEventListener("slot-actions-changed",()=>{this._refreshActionSlots()})}render(){return this.selectedBlock?r`
            <div class="panel-content">
                ${this._renderTargetSection()}
                ${this._renderActionsSection()}
            </div>
        `:r`
                <div class="empty-state">
                    <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
                    <div>Select an element to edit its actions</div>
                </div>
            `}_renderTargetSection(){if(!this.selectedBlock)return l;const e=this._getActionTargets(),t=Object.entries(e).filter(([e])=>"block"!==e).map(([e,t])=>({label:t.label,value:e,description:t.description}));return 0===t.length?l:r`
            <div class="panel-section">
                <span class="section-title">Action Target</span>
                <block-target-selector
                    .value=${this.activeTargetId}
                    .options=${t}
                    @change=${this._onTargetChanged}
                ></block-target-selector>
            </div>
        `}_renderActionsSection(){if(!this.selectedBlock)return l;const e=this._getActionTargets();if(!(Object.keys(e).length>0))return r`
                <div class="panel-section">
                    <span class="section-title">Actions</span>
                    <div class="no-targets">
                        This block does not expose any action targets.
                    </div>
                </div>
            `;const t=this._getAssignedActionSlots(),i=this.actionSlots.length>0;return r`
            <div class="panel-section">
                <span class="section-title">Actions</span>

                ${0===t.length?r`
                    <div class="empty-message">No actions configured for this target.</div>
                `:r`
                    ${t.map((e,t)=>this._renderActionSummary(e.slotId,e.slot,t))}
                `}

                <button class="add-btn" @click=${this._toggleAddAction} ?disabled=${!i}>
                    + Add Action
                </button>

                ${i?l:r`
                    <div class="info-text">No action slots defined. Use the header “Action Slots” to create one.</div>
                `}

                ${this.isAddOpen&&i?r`
                    <div class="add-action-picker">
                        <action-slot-selector
                            .slots=${this.actionSlots}
                            @action-slot-selected=${this._onActionSlotSelected}
                        ></action-slot-selector>
                    </div>
                `:l}
            </div>
        `}_renderActionSummary(e,t,i){const o=t?t.name||t.id:`Missing slot: ${e}`,a=t?this._formatActionSlotSummary(t):"Slot not found";return r`
            <div class="action-summary">
                <div class="action-summary-info">
                    <div class="action-summary-title">${o}</div>
                    <div class="action-summary-detail">${a}</div>
                </div>
                <div class="action-summary-controls">
                    <button class="icon-btn danger" @click=${()=>this._removeActionSlot(e,i)}>
                        <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                </div>
            </div>
        `}_getActionTargets(){return this.selectedBlock?this.blockRegistry.getBlockActionTargetsForBlock(this.selectedBlock):{block:{label:"Block"}}}_getAssignedActionSlots(){var e,t;if(!this.selectedBlock)return[];return((null==(t=null==(e=this.selectedBlock.actions)?void 0:e.targets)?void 0:t[this.activeTargetId])??[]).map(e=>({slotId:e,slot:this.actionSlots.find(t=>t.id===e)||null}))}_ensureActiveTargetAvailable(){if(!this.selectedBlock)return;const e=this._getActionTargets();if(0===Object.keys(e).length)return void(this.activeTargetId="");if(e[this.activeTargetId])return;const t=Object.keys(e)[0];this.activeTargetId=t??""}_removeActionSlot(e,t){var i;if(!this.selectedBlock)return;const o={targets:{...(null==(i=this.selectedBlock.actions)?void 0:i.targets)||{}}},r=[...o.targets[this.activeTargetId]||[]];if(0===r.length)return;if(r[t]===e)r.splice(t,1);else{const t=r.indexOf(e);t>=0&&r.splice(t,1)}0===r.length?delete o.targets[this.activeTargetId]:o.targets[this.activeTargetId]=r;const a=Object.keys(o.targets).length>0;this.documentModel.updateBlock(this.selectedBlock.id,{actions:a?o:void 0})}_onTargetChanged(e){const t=e.detail.value;this.activeTargetId=t||"block",this.isAddOpen=!1}_formatActionSlotSummary(e){return`${Qo[e.trigger]??e.trigger} • ${this._formatActionSummary(e.action)}`}_formatActionSummary(e){const t=this._getActionLabel(e.action);if("call-service"===e.action||"perform-action"===e.action){const i=this._getServiceValue(e);return`${t}${i?`: ${i}`:""}`}return"navigate"===e.action&&"navigation_path"in e?`${t}: ${e.navigation_path||""}`:"url"===e.action&&"url_path"in e?`${t}: ${e.url_path||""}`:t}_getActionLabel(e){return{none:"None",toggle:"Toggle","call-service":"Call Service","perform-action":"Perform Action",navigate:"Navigate","more-info":"More Info",url:"Open URL","fire-dom-event":"Fire Event","toggle-menu":"Toggle Menu"}[e]??e}_getServiceValue(e){return"perform_action"in e&&"string"==typeof e.perform_action&&e.perform_action?e.perform_action:"service"in e&&"string"==typeof e.service&&e.service?e.service:"domain"in e&&"string"==typeof e.domain&&"service"in e&&"string"==typeof e.service?`${e.domain}.${e.service}`:void 0}_refreshActionSlots(){this.actionSlots=this.documentModel.getSlotActions()}_onEntityConfigChanged(e){this.selectedBlock&&this.documentModel.updateBlock(this.selectedBlock.id,{entityConfig:e.detail})}_onSelectSourceBlock(e){const{blockId:t}=e.detail;this.documentModel.select(t)}};Zo.styles=[...nt.styles,t`
            .panel-content {
                padding: 0;
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

            .panel-section {
                padding: 12px;
                border-bottom: 1px solid var(--border-color, #e0e0e0);
                background: var(--bg-primary, #fff);
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .panel-section:last-child {
                border-bottom: none;
            }

            .info-text {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .add-btn {
                align-items: center;
                padding: 6px 10px;
                border: 1px dashed var(--border-color, #d4d4d4);
                border-radius: 3px;
                background: transparent;
                color: var(--text-secondary, #666);
                font-size: 12px;
                cursor: pointer;
            }

            .add-btn:hover {
                border-color: var(--accent-color, #0078d4);
                color: var(--accent-color, #0078d4);
            }

            .add-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .action-summary {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 8px 10px;
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 6px;
                background: var(--bg-secondary, #f9f9f9);
            }

            .action-summary-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
                min-width: 0;
            }

            .action-summary-title {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .action-summary-detail {
                font-size: 11px;
                color: var(--text-secondary, #666);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .action-summary-controls {
                display: flex;
                gap: 6px;
            }

            .icon-btn {
                padding: 4px 6px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 3px;
                background: var(--bg-primary, #fff);
                color: var(--text-secondary, #666);
                cursor: pointer;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .icon-btn:hover {
                background: var(--bg-secondary, #f5f5f5);
            }

            .icon-btn.danger:hover {
                background: #fee;
                border-color: #f88;
                color: #c00;
            }

            .empty-message {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .no-targets {
                font-size: 13px;
                color: var(--text-secondary, #666);
            }

            .add-action-picker {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
        `];let er=Zo;Jo([p({context:w})],er.prototype,"documentModel"),Jo([p({context:_})],er.prototype,"blockRegistry"),Jo([i({attribute:!1})],er.prototype,"hass"),Jo([n()],er.prototype,"selectedBlock"),Jo([n()],er.prototype,"activeTargetId"),Jo([n()],er.prototype,"actionSlots"),Jo([n()],er.prototype,"isAddOpen"),ci.define("panel-actions",er);var tr=Object.defineProperty,ir=Object.getOwnPropertyDescriptor,or=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ir(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&tr(t,i,a),a};let rr=class extends o{constructor(){super(...arguments),this.width=260,this._width=260,this._isResizing=!1,this._startX=0,this._startWidth=0}connectedCallback(){super.connectedCallback(),this._width=this.width,this._updateHostWidth()}render(){const e=[{id:"properties",label:"Properties",component:"panel-properties",props:{hass:this.hass}},{id:"styles",label:"Styles",component:"panel-style",props:{hass:this.hass,canvasWidth:this.canvasWidth,canvasHeight:this.canvasHeight,canvas:this.canvas}},{id:"actions",label:"Actions",component:"panel-actions",props:{hass:this.hass}}];return r`
            <div class="resize-handle ${this._isResizing?"resizing":""}"
                 @mousedown=${this._handleResizeStart}></div>
            <div class="sidebar-content">
                <sidebar-tabbed .tabs=${e}></sidebar-tabbed>
            </div>
        `}updated(e){super.updated(e),e.has("canvas")&&this.canvas&&this._updateStylePanelCanvas(),e.has("width")&&!this._isResizing&&(this._width=this.width,this._updateHostWidth())}_updateHostWidth(){this.style.width=`${this._width}px`}_handleResizeStart(e){e.preventDefault(),this._isResizing=!0,this._startX=e.clientX,this._startWidth=this._width;const t=e=>{if(!this._isResizing)return;const t=this._startX-e.clientX,i=Math.max(rr.MIN_WIDTH,Math.min(rr.MAX_WIDTH,this._startWidth+t));this._width=i,this._updateHostWidth(),this.dispatchEvent(new CustomEvent("right-sidebar-width-changed",{detail:{width:i},bubbles:!0,composed:!0}))},i=()=>{this._isResizing&&(this._isResizing=!1,document.removeEventListener("mousemove",t),document.removeEventListener("mouseup",i))};document.addEventListener("mousemove",t),document.addEventListener("mouseup",i)}_updateStylePanelCanvas(){var e;const t=null==(e=this.shadowRoot)?void 0:e.querySelector("sidebar-tabbed");if(null==t?void 0:t.shadowRoot){const e=t.shadowRoot.querySelector("panel-style");e&&this.canvas&&(e.canvas=this.canvas)}}};rr.styles=t`
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
    `,rr.MIN_WIDTH=200,rr.MAX_WIDTH=600,or([i({type:Number})],rr.prototype,"canvasWidth",2),or([i({type:Number})],rr.prototype,"canvasHeight",2),or([i({type:Object})],rr.prototype,"canvas",2),or([i({attribute:!1})],rr.prototype,"hass",2),or([i({type:Number})],rr.prototype,"width",2),or([n()],rr.prototype,"_width",2),or([n()],rr.prototype,"_isResizing",2),rr=or([a("sidebar-right")],rr);var ar=Object.defineProperty,sr=Object.getOwnPropertyDescriptor,nr=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?sr(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&ar(t,i,a),a};let lr=class extends nt{constructor(){super(...arguments),this.selectedId=null,this.blocks={},this.expandedBlocks=new Set,this.autoExpandedBlocks=new Set,this.showAbsoluteSeparated=!1}connectedCallback(){super.connectedCallback(),this._onModelChange(),this.documentModel.addEventListener("change",()=>this._onModelChange()),this.documentModel.addEventListener("selection-changed",e=>{const t=e.detail.selectedId;if(this.autoExpandedBlocks.forEach(e=>{this.expandedBlocks.has(e)}),this.autoExpandedBlocks.clear(),t){const e=this.blocks[t];if(this.showAbsoluteSeparated&&"absolute"===(null==e?void 0:e.layout))this.expandedBlocks.has("absolute-root")||this.autoExpandedBlocks.add("absolute-root");else{this._getParentChain(t).forEach(e=>{this.expandedBlocks.has(e)||this.autoExpandedBlocks.add(e)})}}this.selectedId=t,this.requestUpdate()}),this.expandedBlocks.add(this.documentModel.rootId)}render(){const e=this.blocks[this.documentModel.rootId],t=Object.values(this.blocks).filter(e=>"absolute"===e.layout&&e.id!==this.documentModel.rootId);return r`
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
        `}_onModelChange(){this.blocks={...this.documentModel.blocks},this.requestUpdate()}_getParentChain(e){var t;const i=[];let o=e;for(;o&&o!==this.documentModel.rootId;){let e=null;for(const[i,r]of Object.entries(this.blocks))if(null==(t=r.children)?void 0:t.includes(o)){e=i;break}if(!e)break;i.push(e),o=e}return i}_renderLayer(e,t){const i=this.blockRegistry.getBlock(e.type),o=e.id===this.documentModel.rootId?'<ha-icon icon="mdi:card-outline"></ha-icon>':(null==i?void 0:i.icon)||"?",{displayLabel:a,typeLabel:n,hasCustomLabel:l}=this._getLayerDisplay(e),d=(e.children||[]).reduce((e,t)=>{const i=this.blocks[t];let o=[i];return this.documentModel.isHidden(t)&&(o=(i.children||[]).map(e=>this.blocks[e])),o.forEach(t=>{this.showAbsoluteSeparated&&"flow"!==t.layout||e.push(t)}),e},[]),c=d.length>0,p=this.expandedBlocks.has(e.id)||this.autoExpandedBlocks.has(e.id),h=this.selectedId===e.id;return r`
            <div>
                <div
                    class="layer-item ${h?"selected":""}"
                    @click=${t=>this._onLayerClick(t,e.id)}
                >
            <span
                  class="layer-toggle ${c?p?"expanded":"":"empty"}"
                  @click=${t=>this._onToggleClick(t,e.id)}
            ></span>
                    <span class="layer-icon">${s(o)}</span>
                    <span class="layer-label">
                        <span class="layer-label-text">${a}</span>
                        ${l?r`<span class="layer-type">${n}</span>`:""}
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
        `}_renderAbsoluteBlock(e){const t=this.blockRegistry.getBlock(e.type),i=(null==t?void 0:t.icon)||"?",{displayLabel:o,typeLabel:a,hasCustomLabel:n}=this._getLayerDisplay(e),l=this.selectedId===e.id,d=e.parentId?this.blocks[e.parentId]:null,c=d?this._getLayerDisplay(d):null;return r`
            <div
                class="layer-item ${l?"selected":""}"
                @click=${t=>this._onLayerClick(t,e.id)}
            >
                <span class="layer-toggle empty"></span>
                <span class="layer-icon">${s(i)}</span>
                <span class="layer-label">
                    <span class="layer-label-text">${o}</span>
                    ${n?r`<span class="layer-type">${a}</span>`:""}
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
        `}};lr.styles=[...nt.styles,t`
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
        `],nr([p({context:w})],lr.prototype,"documentModel",2),nr([p({context:_})],lr.prototype,"blockRegistry",2),nr([n()],lr.prototype,"selectedId",2),nr([n()],lr.prototype,"blocks",2),nr([n()],lr.prototype,"expandedBlocks",2),nr([n()],lr.prototype,"autoExpandedBlocks",2),nr([n()],lr.prototype,"showAbsoluteSeparated",2),lr=nr([a("panel-layers")],lr);var dr=Object.getOwnPropertyDescriptor;let cr=class extends o{render(){return r`
      <sidebar-tabbed .tabs=${[{id:"blocks",label:"Blocks",component:"panel-blocks"},{id:"layers",label:"Layers",component:"panel-layers"}]}></sidebar-tabbed>
    `}};cr.styles=t`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `,cr=((e,t,i,o)=>{for(var r,a=o>1?void 0:o?dr(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(a)||a);return a})([a("sidebar-left")],cr);var pr=Object.defineProperty,hr=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&pr(t,i,a),a};const ur=class extends ft{constructor(){super(...arguments),this.containers=[]}get showSearch(){return this.containers.length>5}get searchPlaceholder(){return"Search containers..."}renderTriggerIcon(){const e=this._getActiveContainer();return e?this._renderContainerIcon(e):l}renderTriggerLabel(){const e=this._getActiveContainer();return e?r`${e.name}${this._formatWidth(e.width)}`:r`<span class="placeholder">Select container</span>`}renderDropdownContent(){const e=this._getFilteredContainers();return r`
            <div class="option-list">
                ${e.length>0?e.map(e=>r`
                    <div
                        class="option-item ${e.id===this.activeContainerId?"selected":""} ${e.disabled?"disabled":""}"
                        @click=${()=>{var t;return null==(t=this._selectContainer)?void 0:t.call(this,e)}}
                    >
                        <span class="icon">${this._renderContainerIcon(e)}</span>
                        <div class="info">
                            <div class="name">${e.name||e.id}</div>
                            <div class="description">${this._getContainerDescription(e)}</div>
                            <div class="meta">${this._getContainerMeta(e)}</div>
                        </div>
                        ${e.id===this.activeContainerId?r`<span class="check">✓</span>`:l}
                    </div>
                `):this._searchFilter?r`
                    <div class="empty-message">No containers match "${this._searchFilter}"</div>
                `:r`
                    <div class="empty-message">No containers available</div>
                `}
            </div>
        `}_selectContainer(e){}_renderContainerIcon(e){const t=e.icon||"mdi:border-radius";return r`<ha-icon icon=${t}></ha-icon>`}_getActiveContainer(){return this.containers.find(e=>e.id===this.activeContainerId)||this.containers[0]}_getFilteredContainers(){return this._searchFilter?this.containers.filter(e=>e.id.toLowerCase().includes(this._searchFilter)||e.name.toLowerCase().includes(this._searchFilter)):this.containers}_formatWidth(e){return e?` (${e}px)`:""}_getContainerDescription(e){return e.width?`Max width: ${e.width}px`:"No width limit"}_getContainerMeta(e){return`${e.isDefault?"Default":e.isDevice?"Device":"Container"} • ID: ${e.id}`}};ur.styles=[ft.styles,t`
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
        `];let gr=ur;hr([i({type:Array})],gr.prototype,"containers"),hr([i({type:String})],gr.prototype,"activeContainerId"),ci.define("container-selector",gr);var vr=Object.defineProperty;const br=class extends o{constructor(){super(...arguments),this.open=!1,this.handleClose=()=>{this.onBeforeClose(),this.dispatchEvent(new CustomEvent("overlay-close",{bubbles:!0,composed:!0}))},this._handleBackdropClick=e=>{this.closeOnBackdrop&&e.target===e.currentTarget&&this.handleClose()},this._handleEscape=e=>{this.closeOnEscape&&"Escape"===e.key&&this.handleClose()}}get dialogSubtitle(){return null}get closeLabel(){return"Close"}get showCloseButton(){return!0}get closeOnBackdrop(){return!0}get closeOnEscape(){return!0}renderDialogHeaderActions(){return l}renderDialogTop(){return l}renderDialogFooter(){return l}onBeforeClose(){}updated(e){e.has("open")&&(this.open&&this.closeOnEscape?this._addEscapeListener():this._removeEscapeListener())}disconnectedCallback(){super.disconnectedCallback(),this._removeEscapeListener()}render(){return this.open?r`
            <div class="overlay-backdrop" @click=${this._handleBackdropClick}></div>
            <div class="dialog">
                ${this.renderDialogHeader()}
                ${this.renderDialogTop()}
                <div class="dialog-body">
                    ${this.renderDialogBody()}
                </div>
                ${this.renderDialogFooter()}
            </div>
        `:r``}renderDialogHeader(){return r`
            <div class="dialog-header">
                <div class="dialog-header-text">
                    <div class="dialog-title">${this.dialogTitle}</div>
                    ${this.dialogSubtitle?r`
                        <div class="dialog-subtitle">${this.dialogSubtitle}</div>
                    `:l}
                </div>
                <div class="dialog-header-actions">
                    ${this.renderDialogHeaderActions()}
                    ${this.showCloseButton?r`
                        <button class="dialog-close" @click=${this.handleClose}>
                            ${this.closeLabel}
                        </button>
                    `:l}
                </div>
            </div>
        `}_addEscapeListener(){window.addEventListener("keydown",this._handleEscape)}_removeEscapeListener(){window.removeEventListener("keydown",this._handleEscape)}};br.styles=[t`
        :host {
            position: fixed;
            inset: 0;
            z-index: 190;
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
            width: var(--overlay-dialog-width, min(92vw, 1400px));
            height: var(--overlay-dialog-height, min(86vh, 860px));
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

        .dialog-header-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .dialog-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-primary, #333);
        }

        .dialog-subtitle {
            font-size: 12px;
            color: var(--text-secondary, #666);
        }

        .dialog-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
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
            overflow: hidden;
        }

        .dialog-footer {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            border-top: 1px solid var(--border-color, #e0e0e0);
            background: var(--bg-secondary, #f5f5f5);
        }

        .footer-spacer {
            flex: 1;
        }

        .primary-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            background: var(--accent-color, #2196f3);
            color: #fff;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            --mdc-icon-size: 18px;
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

        .primary-btn:disabled,
        .secondary-btn:disabled,
        .danger-btn:disabled,
        .dialog-close:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `];let mr=br;((e,t,i)=>{for(var o,r=void 0,a=e.length-1;a>=0;a--)(o=e[a])&&(r=o(t,i,r)||r);r&&vr(t,i,r)})([i({type:Boolean,reflect:!0})],mr.prototype,"open");var yr=Object.defineProperty,fr=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&yr(t,i,a),a};const xr=class extends mr{constructor(){super(...arguments),this.slots=[],this.referencesStates={},this.formMode=null,this.editingSlotId=null,this.formSlotId="",this.formSlotName="",this.formSlotDescription="",this.formError=null,this.toastMessage=null,this.toastTimeoutId=null,this._handleSlotsChanged=()=>{this._refreshSlots()},this._handleNewSlot=()=>{this.formMode="create",this.editingSlotId=null,this.formError=null,this._resetFormFields()},this._handleSaveForm=()=>{if(!this.formSlotId.trim())return void(this.formError="Slot ID cannot be empty");const e={...this._buildBasePayload(),...this.buildSpecificPayload()},t="edit"===this.formMode&&this.editingSlotId?this.updateSlot(this.editingSlotId,e):this.createSlot(e);if(t.success){if(this.formError=null,"edit"===this.formMode)return t.slot&&(this.editingSlotId=this.getSlotId(t.slot),this._loadFormFromSlot(t.slot)),void this.handleSaveSuccess("edit",t.slot);this.handleSaveSuccess("create",t.slot),this._resetFormFields()}else this.formError=t.error||"Unable to save slot"},this._handleCancelForm=()=>{this._resetFormState()}}handleSaveSuccess(e,t){}connectedCallback(){super.connectedCallback(),this._refreshSlots(),this.documentModel.addEventListener(this.slotsChangedEventName,this._handleSlotsChanged)}disconnectedCallback(){super.disconnectedCallback(),this.documentModel.removeEventListener(this.slotsChangedEventName,this._handleSlotsChanged),null!==this.toastTimeoutId&&(window.clearTimeout(this.toastTimeoutId),this.toastTimeoutId=null)}renderDialogTop(){return r`
            <div class="toast ${this.toastMessage?"show":""}">
                ${this.toastMessage??""}
            </div>
        `}renderDialogBody(){return r`
            <div class="slot-list-panel">
                <div class="slot-list-header">
                    <span>Existing Slots</span>
                    <button class="primary-btn" @click=${this._handleNewSlot}>
                        <ha-icon icon="mdi:plus-circle"></ha-icon>
                        New Slot
                    </button>
                </div>
                <div class="slot-list">
                    ${0===this.slots.length?r`
                        <div class="reference-meta">${this.emptyListMessage}</div>
                    `:l}
                    ${this.slots.map(e=>this._renderSlotItem(e))}
                </div>
            </div>
            <div class="slot-form-panel">
                ${this.formMode?this._renderForm():r`
                    <div class="empty-form">Select a slot to edit or create a new one.</div>
                `}
            </div>
        `}onBeforeClose(){this._resetFormState()}showToast(e){this.toastMessage=e,null!==this.toastTimeoutId&&window.clearTimeout(this.toastTimeoutId),this.toastTimeoutId=window.setTimeout(()=>{this.toastMessage=null,this.toastTimeoutId=null},1400)}_refreshSlots(){this.slots=this.getSlots();const e=new Set(this.slots.map(e=>this.getSlotId(e)));this.referencesStates=Object.fromEntries(Object.entries(this.referencesStates).filter(([t])=>e.has(t))),"edit"===this.formMode&&this.editingSlotId&&!e.has(this.editingSlotId)&&this._resetFormState()}_openEditForm(e){const t=this.slots.find(t=>this.getSlotId(t)===e);t&&(this.formMode="edit",this.editingSlotId=this.getSlotId(t),this.formError=null,this._loadFormFromSlot(t))}_resetFormState(){this.formMode=null,this.editingSlotId=null,this.formError=null,this._resetFormFields()}_resetFormFields(){this.formSlotId="",this.formSlotName="",this.formSlotDescription="",this.resetSpecificFields()}_loadFormFromSlot(e){this.formSlotId=this.getSlotId(e),this.formSlotName=this.getSlotName(e),this.formSlotDescription=this.getSlotDescription(e)||"",this.loadSpecificFields(e)}_buildBasePayload(){return{id:this.formSlotId.trim(),name:this.formSlotName.trim()||void 0,description:this.formSlotDescription.trim()||void 0}}_renderSlotItem(e){const t=this.getSlotId(e),i=this.getSlotDescription(e),o=this.referencesStates[t],a="edit"===this.formMode&&this.editingSlotId===t;return r`
            <div class="slot-item ${a?"active":""}">
                <div class="slot-item-title">
                    <span class="slot-item-name">${this.getSlotName(e)}</span>
                    ${a?r`<span class="slot-item-badge">Editing</span>`:l}
                </div>
                <div class="slot-item-id">${t}</div>
                ${i?r`
                    <div class="slot-item-description">${i}</div>
                `:l}
                <div class="slot-item-meta">${this.renderSlotMeta(e)}</div>
                <div class="slot-item-actions">
                    <button class="secondary-btn" @click=${()=>this._openEditForm(t)}>
                        Edit
                    </button>
                    <button class="secondary-btn" @click=${()=>this._handleFindReferences(t)}>
                        Find References
                    </button>
                    <button class="danger-btn" @click=${()=>this._handleDeleteSlot(t)}>
                        Delete
                    </button>
                </div>
                ${o?r`
                    <div class="references">
                        <div class="reference-meta">References found (${o.references.length})</div>
                        ${o.references.map(e=>r`
                            <div class="reference-item">
                                <button
                                        class="reference-link"
                                        @click=${()=>this._handleReferenceNavigate(e)}
                                >
                                    ${this._getBlockLabel(e.blockId)} - ${this.formatReference(e)}
                                </button>
                            </div>
                        `)}
                    </div>
                `:l}
            </div>
        `}_renderForm(){const e="edit"===this.formMode,t=e?"Update slot":"Create slot";return r`
            <div class="form-card">
                <div class="form-title">${e?"Edit slot":"New slot"}</div>
                <div class="form-group">
                    <span class="form-label">Slot ID</span>
                    <input
                            type="text"
                            .value=${this.formSlotId}
                            @input=${e=>{this.formSlotId=e.target.value}}
                    />
                </div>
                <div class="form-group">
                    <span class="form-label">Name</span>
                    <input
                            type="text"
                            .value=${this.formSlotName}
                            @input=${e=>{this.formSlotName=e.target.value}}
                    />
                </div>
                <div class="form-group">
                    <span class="form-label">Description</span>
                    <input
                            type="text"
                            .value=${this.formSlotDescription}
                            @input=${e=>{this.formSlotDescription=e.target.value}}
                    />
                </div>
                ${this.renderFormFields()}
                <div class="form-actions">
                    <button class="primary-btn" @click=${this._handleSaveForm}>
                        ${t}
                    </button>
                    <button class="secondary-btn" @click=${this._handleCancelForm}>
                        Cancel
                    </button>
                    ${this.formError?r`<span class="error-text">${this.formError}</span>`:l}
                </div>
            </div>
        `}_handleDeleteSlot(e){const t=this.getReferences(e);if(t.length>0)return void(this.referencesStates={...this.referencesStates,[e]:{references:t}});this.deleteSlot(e);const i={...this.referencesStates};delete i[e],this.referencesStates=i}_handleFindReferences(e){const t=this.getReferences(e);this.referencesStates={...this.referencesStates,[e]:{references:t}}}_handleReferenceNavigate(e){this.dispatchEvent(new CustomEvent("slot-reference-navigate",{detail:{reference:e},bubbles:!0,composed:!0}))}_getBlockLabel(e){const t=this.documentModel.getBlock(e);return this.documentModel.getBlockDisplayName(e,(null==t?void 0:t.type)||e)}};xr.styles=[...mr.styles,t`
            .dialog-body {
                flex: 1;
                padding: 16px 20px 24px;
                display: grid;
                grid-template-columns: minmax(220px, 1fr) minmax(0, 2fr);
                gap: 16px;
                overflow: hidden;
            }

            .slot-list-panel,
            .slot-form-panel {
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-height: 0;
                overflow: hidden;
            }

            .slot-list-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.4px;
                color: var(--text-secondary, #666);
            }

            .slot-list {
                flex: 1;
                overflow: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding-right: 4px;
            }

            .slot-item {
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                background: var(--bg-primary, #fff);
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .slot-item.active {
                border-color: var(--accent-color, #2196f3);
                box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.2);
            }

            .slot-item-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }

            .slot-item-name {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .slot-item-id {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .slot-item-badge {
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                padding: 2px 6px;
                border-radius: 10px;
                background: rgba(33, 150, 243, 0.1);
                color: var(--accent-color, #2196f3);
            }

            .slot-item-description {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .slot-item-meta {
                font-size: 11px;
                color: var(--text-secondary, #666);
            }

            .slot-item-actions {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }

            .slot-form-panel {
                overflow: auto;
                padding-left: 4px;
            }

            .form-card {
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                background: var(--bg-secondary, #f9f9f9);
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .form-title {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.4px;
                color: var(--text-primary, #333);
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .form-label {
                font-size: 11px;
                font-weight: 600;
                color: var(--text-secondary, #666);
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                padding: 6px 8px;
                border: 1px solid var(--border-color, #d4d4d4);
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
            }

            .form-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .error-text {
                font-size: 11px;
                color: var(--error-color, #d32f2f);
            }

            .empty-form {
                border: 1px dashed var(--border-color, #d4d4d4);
                border-radius: 8px;
                padding: 16px;
                font-size: 12px;
                color: var(--text-secondary, #666);
                text-align: center;
            }

            .references {
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

            .toast {
                position: absolute;
                top: 12px;
                left: 50%;
                transform: translateX(-50%) translateY(-10px);
                background: rgba(46, 125, 50, 0.95);
                color: #fff;
                padding: 6px 12px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 0.3px;
                text-transform: uppercase;
                box-shadow: 0 6px 18px rgba(46, 125, 50, 0.25);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }

            .toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        `];let _r=xr;fr([p({context:w})],_r.prototype,"documentModel"),fr([i({attribute:!1})],_r.prototype,"hass"),fr([n()],_r.prototype,"slots"),fr([n()],_r.prototype,"referencesStates"),fr([n()],_r.prototype,"formMode"),fr([n()],_r.prototype,"editingSlotId"),fr([n()],_r.prototype,"formSlotId"),fr([n()],_r.prototype,"formSlotName"),fr([n()],_r.prototype,"formSlotDescription"),fr([n()],_r.prototype,"formError"),fr([n()],_r.prototype,"toastMessage");var kr=Object.defineProperty,wr=Object.getOwnPropertyDescriptor,$r=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?wr(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&kr(t,i,a),a};let Sr=class extends _r{constructor(){super(...arguments),this.formSlotEntityId="",this.formSlotDomains=[]}get slotsChangedEventName(){return"slots-changed"}get dialogTitle(){return"Entity slots"}get emptyListMessage(){return"No slots defined yet"}getSlots(){return this.documentModel.getSlotEntities()}getSlotId(e){return e.id}getSlotName(e){return e.name||e.id}getSlotDescription(e){return e.description}renderSlotMeta(e){const t=e.domains&&e.domains.length>0?e.domains.join(", "):"Any",i=e.entityId?e.entityId:"None";return r`Domains: ${t} • Default: ${i}`}renderFormFields(){return r`
          <div class="form-group">
            <span class="form-label">Domains filter</span>
            <ha-selector
              .hass=${this.hass}
              .placeholder="Domains Filter (optional)"
              .selector=${{select:{multiple:!0,options:this._getAvailableDomains()}}}
              .value=${this.formSlotDomains}
              @value-changed=${e=>{this.formSlotDomains=e.detail.value||[]}}
            ></ha-selector>
          </div>
          <div class="form-group">
            <span class="form-label">Default entity</span>
            <ha-selector
              .hass=${this.hass}
              .label="Default Entity (optional)"
              .selector=${{entity:{multiple:!1,domain:this.formSlotDomains.length>0?this.formSlotDomains:void 0}}}
              .value=${this.formSlotEntityId}
              @value-changed=${e=>{this.formSlotEntityId=e.detail.value||""}}
              allow-custom-entity
            ></ha-selector>
          </div>
        `}createSlot(e){return this.documentModel.createSlotEntity(e)}updateSlot(e,t){return this.documentModel.updateSlotEntity(e,t)}deleteSlot(e){this.documentModel.deleteSlotEntity(e)}getReferences(e){return this.documentModel.findSlotEntityReferences(e)}formatReference(e){const t=e.styleTargetId?` (target ${e.styleTargetId})`:"";switch(e.kind){case"block-entity":return"Entity configuration";case"style-binding":return`Styles: ${e.category}.${e.property}${t}`;case"style-animation":return`Animation binding: ${e.category}.${e.property}${t}`;case"trait-binding":return`Property binding: ${e.propName}`;case"trait-slot":return`Property slot: ${e.propName}`;default:return"Reference"}}loadSpecificFields(e){this.formSlotEntityId=e.entityId||"",this.formSlotDomains=e.domains?[...e.domains]:[]}resetSpecificFields(){this.formSlotEntityId="",this.formSlotDomains=[]}buildSpecificPayload(){return{entityId:this.formSlotEntityId,domains:this.formSlotDomains}}_getAvailableDomains(){return Array.from(he).sort().map(({id:e,label:t})=>({label:t,value:e}))}};$r([n()],Sr.prototype,"formSlotEntityId",2),$r([n()],Sr.prototype,"formSlotDomains",2),Sr=$r([a("entity-slots-editor-overlay")],Sr);var Cr=Object.defineProperty,Er=Object.getOwnPropertyDescriptor,Ir=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Er(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Cr(t,i,a),a};const Pr=[{label:"Tap",value:"tap"},{label:"Double Tap",value:"double_tap"},{label:"Hold",value:"hold"}],Br={tap:"Tap",double_tap:"Double Tap",hold:"Hold"};let Mr=class extends _r{constructor(){super(...arguments),this.formSlotTrigger="tap",this.formSlotAction={action:"none"}}get slotsChangedEventName(){return"slot-actions-changed"}get dialogTitle(){return"Action slots"}get emptyListMessage(){return"No action slots defined yet"}getSlots(){return this.documentModel.getSlotActions()}getSlotId(e){return e.id}getSlotName(e){return e.name||e.id}getSlotDescription(e){return e.description}renderSlotMeta(e){return r`${this._formatActionSlotSummary(e)}`}renderFormFields(){return r`
          <div class="form-group">
            <span class="form-label">Trigger</span>
            <select
              .value=${this.formSlotTrigger}
              @change=${e=>{this.formSlotTrigger=e.target.value}}
            >
              ${Pr.map(e=>r`
                  <option value=${e.value}>${e.label}</option>
              `)}
            </select>
          </div>
          <div class="form-group">
            <span class="form-label">Action</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ui_action:{default_action:"none"}}}
              .value=${this.formSlotAction??{action:"none"}}
              @value-changed=${e=>{this.formSlotAction=e.detail.value}}
            ></ha-selector>
          </div>
        `}createSlot(e){return this.documentModel.createSlotAction(e)}updateSlot(e,t){return this.documentModel.updateSlotAction(e,t)}deleteSlot(e){this.documentModel.deleteSlotAction(e)}getReferences(e){return this.documentModel.findSlotActionReferences(e)}formatReference(e){return`Action slot (${e.actionTrigger||"trigger"}) on target ${e.propName||"block"}`}loadSpecificFields(e){this.formSlotTrigger=e.trigger,this.formSlotAction=e.action}resetSpecificFields(){this.formSlotTrigger="tap",this.formSlotAction={action:"none"}}buildSpecificPayload(){return{trigger:this.formSlotTrigger,action:this.formSlotAction??{action:"none"}}}handleSaveSuccess(e){"edit"!==e?this.showToast("Slot created"):this.showToast("Slot updated")}_formatActionSlotSummary(e){return`${Br[e.trigger]??e.trigger} • ${this._formatActionSummary(e.action)}`}_formatActionSummary(e){const t=this._getActionLabel(e.action);if("call-service"===e.action||"perform-action"===e.action){const i=this._getServiceValue(e);return i?`${t}: ${i}`:t}return"navigate"===e.action&&"navigation_path"in e?`${t}: ${e.navigation_path||""}`:"url"===e.action&&"url_path"in e?`${t}: ${e.url_path||""}`:t}_getActionLabel(e){return{none:"None",toggle:"Toggle","call-service":"Call Service","perform-action":"Perform Action",navigate:"Navigate","more-info":"More Info",url:"Open URL","fire-dom-event":"Fire Event","toggle-menu":"Toggle Menu"}[e]??e}_getServiceValue(e){return"perform_action"in e&&"string"==typeof e.perform_action&&e.perform_action?e.perform_action:"service"in e&&"string"==typeof e.service&&e.service?e.service:"domain"in e&&"string"==typeof e.domain&&"service"in e&&"string"==typeof e.service?`${e.domain}.${e.service}`:void 0}};Ir([n()],Mr.prototype,"formSlotTrigger",2),Ir([n()],Mr.prototype,"formSlotAction",2),Mr=Ir([a("action-slots-editor-overlay")],Mr);const Tr=t`
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
`;function zr(e,t){if("%"===t){return`${Math.round(100*e)/100}%`}return`${Math.round(e)}px`}function Rr(e){e&&e.root.setAttribute("hidden","")}var Dr=Object.defineProperty,Or=Object.getOwnPropertyDescriptor,Ar=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Or(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Dr(t,i,a),a};let Lr=class extends o{constructor(){super(...arguments),this.show=!0,this.selectedBlockId=null,this.selectedBlock=null,this.targetElement=null,this.position={top:0,left:0},this.canDelete=!1,this.canDuplicate=!1,this.canSelectParent=!1,this._updateCapabilities=()=>{this.canDelete=this.documentModel.canDeleteBlock(this.selectedBlockId),this.canDuplicate=this.documentModel.canDuplicateBlock(this.selectedBlockId),this.canSelectParent=null!==this.selectedBlock.parentId},this._updatePosition=()=>{this.targetElement&&requestAnimationFrame(()=>{if(!this.targetElement)return;const e=this.targetElement.getBoundingClientRect();this.position={top:e.top-25-5,left:e.left},this.style.top=`${this.position.top}px`,this.style.left=`${this.position.left}px`,this.style.width=`${e.width}px`,this.style.transform="none"})}}connectedCallback(){super.connectedCallback(),window.addEventListener("scroll",this._updatePosition,!0),window.addEventListener("resize",this._updatePosition),this.documentModel.addEventListener("selection-changed",e=>{const t=e.detail;this.selectedBlockId=t.selectedId}),this.eventBus.addEventListener("canvas-size-changed",()=>this._updatePosition())}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("scroll",this._updatePosition,!0),window.removeEventListener("resize",this._updatePosition)}render(){if(!this.show||!this.selectedBlockId)return l;this.selectedBlock=this.documentModel.getBlock(this.selectedBlockId),this.targetElement=this.selectedBlockId===this.documentModel.rootId?this.canvas:this.documentModel.getElement(this.selectedBlockId),this._updateCapabilities(),this._updatePosition();const e=this._getBlockLabel();return r`
            <div class="toolbar-container">
                <div class="block-label">${e}</div>
                <div class="toolbar">
                    <button
                            class="toolbar-button"
                            ?disabled=${!this.canSelectParent}
                            @click=${e=>this._handleSelectParent(e)}
                            title="Select parent (↑)"
                    >
                        <ha-icon icon="mdi:chevron-up"></ha-icon>
                    </button>

                    <button
                            class="toolbar-button"
                            ?disabled=${!this.canDuplicate}
                            @click=${this._handleDuplicate}
                            title="Duplicate (Ctrl+D)"
                    >
                        <ha-icon icon="mdi:content-duplicate"></ha-icon>
                    </button>

                    <button
                            class="toolbar-button delete"
                            ?disabled=${!this.canDelete}
                            @click=${this._handleDelete}
                            title="Delete"
                    >
                        <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                </div>
            </div>
        `}_handleSelectParent(e){if(e.stopPropagation(),!this.selectedBlock||!this.canSelectParent)return;let t=this.selectedBlock.parentId;for(;t&&this.documentModel.isHidden(t);)t=this.documentModel.getBlock(t).parentId;t&&this.documentModel.select(t)}_handleDuplicate(){this.selectedBlock&&this.canDuplicate&&this.documentModel.duplicateBlock(this.selectedBlock.id)}_handleDelete(){this.selectedBlock&&this.canDelete&&this.documentModel.deleteBlock(this.selectedBlock.id)}_getBlockLabel(){if(!this.selectedBlock)return"";const e=this.blockRegistry.getBlock(this.selectedBlock.type),t=(null==e?void 0:e.label)||this.selectedBlock.type.replace(/^ha-/,"").split("-").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");return this.documentModel.getBlockDisplayName(this.selectedBlock,t)}};Lr.styles=t`
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
            --mdc-icon-size: 16px;
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
    `,Ar([p({context:w})],Lr.prototype,"documentModel",2),Ar([p({context:_})],Lr.prototype,"blockRegistry",2),Ar([i({attribute:!1})],Lr.prototype,"show",2),Ar([i({attribute:!1})],Lr.prototype,"canvas",2),Ar([p({context:C})],Lr.prototype,"eventBus",2),Ar([n()],Lr.prototype,"selectedBlockId",2),Lr=Ar([a("contextual-block-toolbar")],Lr);var Vr=Object.defineProperty,Nr=(e,t,i,o)=>{for(var r,a=void 0,s=e.length-1;s>=0;s--)(r=e[s])&&(a=r(t,i,a)||a);return a&&Vr(t,i,a),a};const Fr=class extends G{constructor(){super(),this.showPositionGuides=!0,this.showSnapGuides=!0,this.isCanvasSelected=!1,this.showContextualBlockToolbar=!0,this.showControls=!1,this.overflowAllowBlocksOutside=!0,this.linkModeState=null,this.blocks={},this.selectedBlockId=null,this.moveable=null,this.guides=null,this._handleKeyDown=e=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;const t=this.selectedBlockId?this.documentModel.getBlock(this.selectedBlockId):null;return t&&(e.ctrlKey||e.metaKey)&&"d"===e.key?(e.preventDefault(),void(this.documentModel.canDuplicateBlock(t.id)&&this.documentModel.duplicateBlock(t.id))):void 0},this._handleLinkModeChanged=e=>{const t=e.detail;this.linkModeState=(null==t?void 0:t.state)??null,this._emitSelectionDisabledState(this.linkModeState)},this.addEventListener("click",e=>this._onBuilderClick(e))}get dropId(){return this.canvasId}get dropElement(){return this.canvasFlowContainer}shouldShowDropIndicator(){return!0}getPanelConfig(){return{properties:{groups:[{id:"overflow",label:"Overflow",traits:[{type:"checkbox",name:"overflow_allow_blocks_outside",label:"Allow blocks outside"},{type:"checkbox",name:"overflow_show",label:"Show overflow"}]}]},targetStyles:{block:{styles:{groups:["background","border","typography","animations"],properties:["size.height","size.minHeight","size.maxHeight","spacing.padding"]}}}}}getBlockEntities(){var e;const t=null==(e=this.documentModel)?void 0:e.resolveEntityForBlock(this.documentModel.rootId);return(null==t?void 0:t.entityId)?[t.entityId]:[]}getBlockBoundingClientRect(){return this.canvas.getBoundingClientRect()}connectedCallback(){super.connectedCallback(),this._onModelChange(),this._setupKeyboardShortcuts(),this.documentModel.registerElement(this.documentModel.rootId,this),this.linkModeState=this.documentModel.getLinkModeState(),this.documentModel.addEventListener("link-mode-changed",this._handleLinkModeChanged),this._emitSelectionDisabledState(this.linkModeState),this.documentModel.addEventListener("change",()=>this._onModelChange()),this.documentModel.addEventListener("selection-changed",e=>{var t,i;const o=e.detail;this.selectedBlockId=o.selectedId,this.isCanvasSelected=this.selectedBlockId===this.documentModel.rootId,this.isCanvasSelected?null==(t=this.canvas)||t.classList.add("canvas-selected"):null==(i=this.canvas)||i.classList.remove("canvas-selected");const r=this.selectedBlockId?this.documentModel.getBlock(this.selectedBlockId):null;this.showControls=Boolean("absolute"===(null==r?void 0:r.layout)),this._updateMoveable()}),this.documentModel.addEventListener("style-target-changed",()=>{}),this.documentModel.addEventListener("block-updated",e=>{e.detail.block.id===this.selectedBlockId&&requestAnimationFrame(()=>{this._updateMoveable()})}),this.eventBus.addEventListener("block-created",e=>{this._handleBlockCreated(e)}),this.eventBus.addEventListener("block-reordered",e=>{this._handleBlockReordered(e)}),this.eventBus.addEventListener("block-drag-on-generate-preview",()=>{this.documentModel.select(null)})}disconnectedCallback(){super.disconnectedCallback(),this.moveable&&this.moveable.destroy(),this._cleanupKeyboardShortcuts()}async firstUpdated(){await this.updateComplete,this.dragDropManager.registerCanvas(this)}async updated(e){await super.updated(e),await this.updateComplete,e.has("showPositionGuides")&&this._updateGuides(),e.has("showSnapGuides")&&await this._updateMoveable()}render(){const e=0===this.rootBlocks.length,t=this.containerManager.getActiveContainer(),i=t.width,o=t.isDefault?"100%":`${i+40}px`,{absoluteBlocks:a,staticBlocks:s,flowBlocks:n,haCardStyles:d,canvasStyles:c,canvasFlowContainerStyles:p}=this.getRenderData({width:(t.isDefault?"100%":`${i}px`)+" !important"});return r`
            <div
                class="canvas-viewport"
                style="width: ${o}"
                data-container-name="${t.name}"
                data-container-width="${i?`${i}px`:"Responsive"}"
            >
                
                    <ha-card style="${u(d)}">
                        <div
                            class="canvas ${e?"canvas-empty":""}"
                            style="${u(c)}"
                            ${h(e=>this.canvas=e)}
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
                            ${e?r`<div class="canvas-placeholder">Canvas is empty</div>`:l}
                            ${g(a,e=>e.id,e=>this.renderBlock(e))}
                            ${g(s,e=>e.id,e=>this.renderBlock(e))}
                            <div
                                class="canvas-flow-container ${0===n.length?"flow-empty":""}"
                                data-dnd-drop-target="true"
                                style="${u(p)}"
                                @click=${e=>this._onBuilderClick(e)}
                                ${h(e=>this.canvasFlowContainer=e)}
                            >
                                ${g(n,e=>e.id,e=>this.renderBlock(e))}
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
            .activeContainerId=${this.activeContainerId}
            @click=${t=>this._onBlockClick(t,e.id)}
            ${h(t=>this.documentModel.registerElement(e.id,t))}
          ></${t.tag}>
      `}_setupKeyboardShortcuts(){document.addEventListener("keydown",this._handleKeyDown)}_cleanupKeyboardShortcuts(){document.removeEventListener("keydown",this._handleKeyDown)}_ensureGuidesElements(){this.guides||(this.guides=function(e){const t=null==e?void 0:e.querySelector(".guides");if(!t)return null;const i=t.querySelector(".guides-axis-dot"),o=t.querySelector(".guides-axis.x"),r=t.querySelector(".guides-axis.y"),a=t.querySelector(".guides-origin-dot"),s=t.querySelector(".guides-line.h"),n=t.querySelector(".guides-line.v"),l=t.querySelector(".guides-label.h"),d=t.querySelector(".guides-label.v");return i&&o&&r&&a&&s&&n&&l&&d?{root:t,axisDot:i,axisX:o,axisY:r,originDot:a,lineH:s,lineV:n,labelH:l,labelV:d}:null}(this.shadowRoot))}_hideGuides(){this._ensureGuidesElements(),Rr(this.guides)}_togglePositionGuides(e){e.stopPropagation(),this.showPositionGuides=!this.showPositionGuides,this.dispatchEvent(new CustomEvent("position-guides-preference-changed",{detail:{status:this.showPositionGuides,selectedId:this.selectedBlockId},bubbles:!0,composed:!0}))}_toggleSnapGuides(e){e.stopPropagation(),this.showSnapGuides=!this.showSnapGuides,this.dispatchEvent(new CustomEvent("snap-guides-preference-changed",{detail:{status:this.showPositionGuides,selectedId:this.selectedBlockId},bubbles:!0,composed:!0}))}_calculateInsertIndexFromInstruction(e,t){if(!t)return 0;switch(t.operation){case"reorder-before":return this._getIndexInParent(e);case"reorder-after":return this._getIndexInParent(e)+1;case"combine":return 0;default:return console.warn(`[BuilderCanvas] Unknow instruction operation: ${t.operation}`),0}}_getIndexInParent(e){var t;const i=e.parentId;if(!i)return e.order;const o=this.documentModel.getBlock(i),r=(null==(t=null==o?void 0:o.children)?void 0:t.indexOf(e.id))??-1;return-1===r?e.order:r}_handleBlockCreated(e){var t,i;const o=this.documentModel.getBlock(e.targetBlockId||"root"),r=e.targetBlockId?e.targetIsContainer&&"combine"===(null==(t=e.instruction)?void 0:t.operation)?e.targetBlockId:this.documentModel.getBlock(e.targetBlockId).parentId:"root",a=this._calculateInsertIndexFromInstruction(o,e.instruction);e.blockType,null==(i=e.instruction)||i.operation;const s=this.blockRegistry.getDefaults(e.blockType),n=this.blockRegistry.getEntityDefaults(e.blockType),l=this.documentModel.createBlock(e.blockType,r,{...s,entityConfig:{mode:n.mode||"inherited",slotId:n.slotId}},{},a);this.documentModel.select(l.id)}_handleBlockReordered(e){var t,i;const o=this.documentModel.getBlock(e.targetBlockId||"root");let r=e.targetIsContainer&&"combine"===(null==(t=e.instruction)?void 0:t.operation)?e.targetBlockId:this.documentModel.getBlock(e.targetBlockId).parentId;const a=this._calculateInsertIndexFromInstruction(o,e.instruction);e.blockId,null==(i=e.instruction)||i.operation,this.documentModel.moveBlock(e.blockId,r,a)}_getSelectedBlockGuideData(e,t,i){if(!this.selectedBlockId)return null;const o=this.documentModel.getBlock(this.selectedBlockId);if(!o||"absolute"!==o.layout)return null;const r=this._getResolvedLayoutData(o);r.size=i??this.getRuntimeBlockSize(o,r);let a=this.canvasWidth,s=this.canvasHeight,n=0,l=0;if("root"!==o.parentId){const e=this._findInShadowDOM(this.shadowRoot,`[block-id="${o.parentId}"]`);if(e){let t=e;if(this.canvas&&t){const e=this.canvas.getBoundingClientRect(),i=t.getBoundingClientRect();n=i.left-e.left,l=i.top-e.top,a=i.width,s=i.height}}}const d=new V({containerSize:{width:a,height:s},elementSize:r.size,anchorPoint:r.positionConfig.anchor,originPoint:r.positionConfig.originPoint,unitSystem:r.positionConfig.unitSystem});let c,p;if(void 0!==e&&void 0!==t)c=e,p=t;else{const e=this.blockToMoveable(r,r.size,a,s);c=e.left+n,p=e.top+l}const h=c-n,u=p-l,g=d.fromMoveableSpace({x:h,y:u}),{axisX:v,axisY:b}=(m=r.positionConfig.anchor,y=a,f=s,{axisX:m.includes("right")?y:m.includes("center")?y/2:0,axisY:m.includes("bottom")?f:m.includes("middle")?f/2:0});var m,y,f;const x=v+n,_=b+l,{localOriginX:k,localOriginY:w}=($=r.positionConfig.originPoint,S=r.size.width,C=r.size.height,{localOriginX:$.includes("right")?S:$.includes("center")?S/2:0,localOriginY:$.includes("bottom")?C:$.includes("middle")?C/2:0});var $,S,C;return{axisX:x,axisY:_,blockOriginX:c+k,blockOriginY:p+w,unitSystem:r.positionConfig.unitSystem,xValue:g.x,yValue:g.y}}_updateGuides(e,t,i){if(!this.showPositionGuides)return void this._hideGuides();this._ensureGuidesElements();const o=this._getSelectedBlockGuideData(e,t,i);!function(e,t,i,o){if(!e)return;if(!t)return void Rr(e);e.root.removeAttribute("hidden"),e.axisDot.style.top=`calc(${t.axisY}px)`,e.axisDot.style.left=`calc(${t.axisX}px)`,e.axisX.style.top=`calc(${t.axisY}px - 2px)`,e.axisY.style.left=`calc(${t.axisX}px - 2px)`,e.originDot.style.left=`${t.blockOriginX}px`,e.originDot.style.top=`${t.blockOriginY}px`;const r=t.blockOriginY,a=Math.min(t.blockOriginX,t.axisX),s=Math.max(t.blockOriginX,t.axisX);e.lineH.style.top=`${r}px`,e.lineH.style.left=`${a}px`,e.lineH.style.width=`${Math.max(0,s-a)}px`;const n=t.blockOriginX,l=Math.min(t.blockOriginY,t.axisY),d=Math.max(t.blockOriginY,t.axisY);e.lineV.style.left=`${n}px`,e.lineV.style.top=`${l}px`,e.lineV.style.height=`${Math.max(0,d-l)}px`;const c=(a+s)/2;e.labelH.textContent=zr(t.xValue,t.unitSystem);const p=(l+d)/2;e.labelV.textContent=zr(t.yValue,t.unitSystem);const h=(e,t)=>Math.max(10,Math.min(e,t-10));e.labelH.style.left=`${h(c,i)}px`,e.labelH.style.top=`${h(r,o)}px`,e.labelV.style.left=`${h(n,i)}px`,e.labelV.style.top=`${h(p,o)}px`}(this.guides,o,this.canvasWidth,this.canvasHeight)}_getResolvedLayoutData(e){const t={defaultEntityId:this.documentModel.resolveEntityForBlock(e.id).entityId},i=this.styleResolver.resolve(e.id,this.activeContainerId,t);return L(i)}_onModelChange(){var e,t,i,o;this.blocks=this.documentModel.blocks;const r=this.documentModel.getBlock(this.documentModel.rootId);this.rootBlocks=Object.values(this.blocks).filter(e=>e.parentId===this.documentModel.rootId),this.overflowShow=null==(t=null==(e=r.props)?void 0:e.overflow_show)?void 0:t.value,this.overflowAllowBlocksOutside=null==(o=null==(i=r.props)?void 0:i.overflow_allow_blocks_outside)?void 0:o.value;for(const a of Object.values(this.blocks))this.subscribeBlockEntities(a.id,this.documentModel.getTrackedEntitiesFlat(a));this.requestUpdate()}_renderControls(){return this.showControls?r`
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
        `:r``}_onBuilderClick(e){const t=this.linkModeState;if(null==t?void 0:t.enabled)return void e.stopPropagation();e.stopPropagation();const i=e.target;i===this?this.documentModel.select(null):i!==this.canvas&&i!==this.canvasFlowContainer||this.documentModel.select(this.documentModel.rootId)}_onBlockClick(e,t){if(this.documentModel.isHidden(t))return;const i=this.linkModeState;(null==i?void 0:i.enabled)&&i.activeLinkId&&t!==i.activeLinkId?e.stopPropagation():(e.stopPropagation(),this.documentModel.select(t))}_findInShadowDOM(e,t){const i=e.querySelector(t);if(i)return i;const o=e.querySelectorAll("*");for(const r of o)if(r.shadowRoot){const e=this._findInShadowDOM(r.shadowRoot,t);if(e)return e}return null}_emitSelectionDisabledState(e){(null==e?void 0:e.enabled)&&"pick-anchor"!==e.mode?this.eventBus.dispatchEvent("block-selection-disabled",{disabled:!0,excluded:e.activeLinkId??void 0}):this.eventBus.dispatchEvent("block-selection-disabled",{disabled:!1})}async _updateMoveable(){await this.updateComplete,this.guides=null,this.moveable&&(this.moveable.destroy(),this.moveable=null);const e=this.selectedBlockId;if(!e)return void this._hideGuides();const t=this.documentModel.getBlock(e);if(!t||"absolute"!==t.layout)return void this._hideGuides();const i=this.documentModel.getElement(t);if(!i||!this.canvas)return;let o=this.canvas,r=this.canvasWidth,a=this.canvasHeight,s=0,n=0,l=!1;if("root"!==t.parentId){const e=this.documentModel.getElement(t.parentId);let d=i.parentElement||e;o=d,l=!0;const c=this.canvas.getBoundingClientRect(),p=d.getBoundingClientRect();s=p.left-c.left,n=p.top-c.top,r=p.width,a=p.height}await i.updateComplete;const d=this._getResolvedLayoutData(t),c=this.getRuntimeBlockSize(t,d),p=this.blockToMoveable(d,c,r,a),h=Object.values(this.blocks).filter(t=>"absolute"===t.layout&&t.id!==e),u=("root"!==t.parentId?h.filter(e=>e.parentId===t.parentId):h).map(e=>({element:this.documentModel.getElement(e.id),className:"moveable-snap-element"})),g=r/2,v=a/2;let b=null;if(!this.overflowAllowBlocksOutside)if(l){const e=this.canvas.getBoundingClientRect(),t=o.getBoundingClientRect();b={left:-(t.left-e.left),top:-(t.top-e.top),right:r+(e.right-t.right),bottom:a+(e.bottom-t.bottom)}}else b={left:0,top:0,right:this.canvasWidth,bottom:this.canvasHeight};this.moveable=new pe(o,{target:i,draggable:!0,resizable:!0,keepRatio:!1,throttleDrag:0,throttleResize:0,renderDirections:["nw","n","ne","w","e","sw","s","se"],edge:!1,origin:!1,bounds:b,snappable:!0,snapThreshold:5,isDisplaySnapDigit:this.showSnapGuides,snapGap:this.showSnapGuides,snapDirections:{top:!0,left:!0,bottom:!0,right:!0,center:!0,middle:!0},elementSnapDirections:{top:!0,left:!0,bottom:!0,right:!0,center:!0,middle:!0},elementGuidelines:this.showSnapGuides?u:[],snapContainer:o,verticalGuidelines:this.showSnapGuides?[{pos:0,className:"snap-canvas-edge"},{pos:g,className:"snap-canvas-center"},{pos:r,className:"snap-canvas-edge"}]:[],horizontalGuidelines:this.showSnapGuides?[{pos:0,className:"snap-canvas-edge"},{pos:v,className:"snap-canvas-center"},{pos:a,className:"snap-canvas-edge"}]:[],snapDigit:0}),this.moveable.updateRect();let m={left:p.left,top:p.top},y=new Set;const f=r,x=a,_=s,k=n;this.moveable.on("dragStart",()=>{this.showContextualBlockToolbar=!1,this.eventBus.dispatchEvent("block-drag-start",{block:t})}),this.moveable.on("drag",({target:t,left:i,top:o,transform:r})=>{if(!this.documentModel.getBlock(e))return;m={left:i,top:o},t.style.transform=r;const a=i+_,s=o+k;this._updateGuides(a,s)}),this.moveable.on("snap",({elements:e,gaps:t})=>{y.forEach(e=>e.classList.remove("snap-highlight")),y.clear(),e&&e.length>0&&e.forEach(e=>{e.element&&e.element instanceof HTMLElement&&(e.element.classList.add("snap-highlight"),y.add(e.element))}),t&&t.length>0&&t.forEach(e=>{e.element&&e.element instanceof HTMLElement&&(e.element.classList.add("snap-highlight"),y.add(e.element))})}),this.moveable.on("dragEnd",async({target:i})=>{const o=this.documentModel.getBlock(e);if(!o)return;y.forEach(e=>e.classList.remove("snap-highlight")),y.clear();const r=m.left,a=m.top,s=this.getRuntimeBlockSize(o,d),n=this.moveableToBlock({left:r,top:a},d.positionConfig,s,f,x);i.style.transform="",this.eventBus.dispatchEvent("moveable-change",n),this.showContextualBlockToolbar=!0,this.eventBus.dispatchEvent("block-drag-end",{block:t})});let w={left:p.left,top:p.top,width:d.size.width,height:d.size.height};this.moveable.on("resizeStart",()=>{this.showContextualBlockToolbar=!1,this.eventBus.dispatchEvent("block-resize-start",{block:t})}),this.moveable.on("resize",({target:e,width:t,height:i,drag:o})=>{const r=o.left,a=o.top,s=t,n=i;w={left:r,top:a,width:s,height:n},e.style.width=`${s}px`,e.style.height=`${n}px`,e.style.transform=o.transform;const l=r+_,d=a+k;this._updateGuides(l,d,{width:s,height:n})}),this.moveable.on("resizeEnd",({target:i})=>{y.forEach(e=>e.classList.remove("snap-highlight")),y.clear();if(!this.documentModel.getBlock(e))return;const o=w.left,r=w.top,a=w.width,s=w.height,n=this.moveableResizeToBlock({left:o,top:r},{width:a,height:s},d.positionConfig,f,x);i.style.transform="",this.eventBus.dispatchEvent("moveable-change",n),this.showContextualBlockToolbar=!0,this.eventBus.dispatchEvent("block-resize-end",{block:t})}),this._updateGuides()}};Fr.styles=[...G.styles,Tr,t`
            :host {
                display: flex;
                align-items: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                width: max-content;
            }

            :host(.container-desktop) {
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

            :host(.container-desktop) .canvas-viewport {
                background: none;
                border: none;
                border-radius: 0;
                padding: 0;
                box-shadow: none;
            }

            .canvas-viewport::before {
                content: attr(data-container-name);
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

            :host(.container-desktop) .canvas-viewport::before {
                display: none;
            }

            .canvas-viewport::after {
                content: attr(data-container-width);
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

            :host(.container-desktop) .canvas-viewport::after {
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
        `];let jr=Fr;Nr([p({context:k})],jr.prototype,"dragDropManager"),Nr([p({context:_})],jr.prototype,"blockRegistry"),Nr([i({type:String})],jr.prototype,"canvasId"),Nr([i({type:Boolean})],jr.prototype,"showPositionGuides"),Nr([i({type:Boolean})],jr.prototype,"showSnapGuides"),Nr([n()],jr.prototype,"isCanvasSelected"),Nr([n()],jr.prototype,"showContextualBlockToolbar"),Nr([n()],jr.prototype,"showControls"),Nr([n()],jr.prototype,"overflowAllowBlocksOutside"),Nr([n()],jr.prototype,"linkModeState"),ci.define("builder-canvas",jr);var Ur=Object.defineProperty,Hr=Object.getOwnPropertyDescriptor,Gr=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Hr(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ur(t,i,a),a};let Wr=class extends o{constructor(){super(...arguments),this.baseMediaId=W,this.selectionMode=!1,this.selectedReference=null,this.currentMediaId="",this.items=[],this.loading=!1,this.uploading=!1,this.uploadProgress={current:0,total:0},this.searchQuery="",this.errorMessage=null,this.dragActive=!1,this.previewErrors=new Set,this.selectedPreviewUrl=null,this.selectedPreviewName=null,this.selectedPreviewIsImage=!1,this.selectedPreviewType=null,this.errorTimeoutId=null,this.initialized=!1,this.initializing=!1}updated(e){e.has("hass")&&this.hass&&(this.mediaService=new et(this.hass)),e.has("baseMediaId")&&(this.initialized=!1),e.has("selectedReference")&&!this.selectedReference&&this.updatePreview(null,null,!1,null),!e.has("hass")&&!e.has("baseMediaId")||!this.hass||this.initialized||this.initializing||(this.initializing=!0,this.initialize().finally(()=>{this.initialized=!0,this.initializing=!1}))}render(){return this.hass?r`
            <div class="media-manager">
                <div class="toolbar">
                    <button class="button primary" @click=${this.handleUploadClick} ?disabled=${this.uploading}>
                        <ha-icon icon="mdi:upload"></ha-icon>
                        Upload
                    </button>
                    <button class="button" @click=${this.refresh} ?disabled=${this.loading||this.uploading}>
                        <ha-icon icon="mdi:refresh"></ha-icon>
                        Refresh
                    </button>
                    <div class="spacer"></div>
                    <input
                        class="search-input"
                        type="search"
                        placeholder="Search..."
                        .value=${this.searchQuery}
                        @input=${this.handleSearchInput}
                    />
                </div>

                ${this.errorMessage?r`<div class="error-banner">${this.errorMessage}</div>`:l}

                ${this.renderBreadcrumbs()}

                <div
                    class="drop-zone ${this.dragActive?"dragging":""}"
                    @dragenter=${this.handleDragEnter}
                    @dragover=${this.handleDragOver}
                    @dragleave=${this.handleDragLeave}
                    @drop=${this.handleDrop}
                >
                    Drag files here to upload or use the Upload button.
                </div>

                ${this.uploading?r`
                        <div class="upload-status">
                            <div class="spinner"></div>
                            <span>Uploading ${this.uploadProgress.current}/${this.uploadProgress.total}</span>
                        </div>
                    `:l}

                <input
                    type="file"
                    multiple
                    hidden
                    @change=${this.handleFileInput}
                />

                <div class="content ${this.selectedReference?"split":""}">
                    <div class="grid-panel">
                        <div class="grid">
                            ${this.loading?r`<div class="empty-state">Loading...</div>`:0===this.filteredItems.length?r`<div class="empty-state">No files found.</div>`:this.filteredItems.map(e=>this.renderItem(e))}
                        </div>
                    </div>
                    ${this.selectedReference?r`
                        <div class="preview-panel">
                            <div class="preview-title">Selected media</div>
                            <div class="preview-frame">
                                ${this.selectedPreviewIsImage&&this.selectedPreviewUrl?r`<img src="${this.selectedPreviewUrl}" alt="${this.selectedPreviewName??""}" />`:r`<ha-icon icon="mdi:image-off-outline"></ha-icon>`}
                            </div>
                            ${this.selectedPreviewName?r`
                                <div class="preview-meta">${this.selectedPreviewName}</div>
                            `:l}
                            ${this.selectedPreviewType?r`
                                <div class="preview-meta">${this.selectedPreviewType}</div>
                            `:l}
                        </div>
                    `:l}
                </div>
            </div>
        `:r`<div class="media-manager"><div class="empty-state">Home Assistant not available.</div></div>`}renderBreadcrumbs(){const e=this.getBreadcrumbs();return 0===e.length?l:r`
            <div class="breadcrumbs">
                ${e.map((t,i)=>r`
                    <button @click=${()=>this.navigateTo(t.mediaId)}>${t.label}</button>
                    ${i<e.length-1?r`<span class="separator">/</span>`:l}
                `)}
            </div>
        `}renderItem(e){const t=this.isFolder(e),i=this.isImage(e),o=this.getPreviewUrl(e),a=this.selectedReference===e.media_content_id;return r`
            <div class="item ${a?"selected":""}" @click=${()=>this.handleItemClick(e)}>
                ${t?l:r`
                    <div class="item-actions" @click=${e=>e.stopPropagation()}>
                        <button class="icon-button" @click=${t=>this.handleDelete(t,e)}>
                            <ha-icon icon="mdi:trash-can-outline"></ha-icon>
                        </button>
                    </div>
                `}
                <div class="thumbnail">
                    ${o&&i?r`<img src="${o}" @error=${()=>this.handlePreviewError(e)} />`:r`<ha-icon icon="${t?"mdi:folder":"mdi:image-off-outline"}"></ha-icon>`}
                </div>
                <div class="item-name" title=${e.title}>${e.title}</div>
            </div>
        `}get filteredItems(){if(!this.searchQuery)return this.items;const e=this.searchQuery.toLowerCase();return this.items.filter(t=>t.title.toLowerCase().includes(e))}async initialize(){if(!this.mediaService)return;const e=this.baseMediaId||W;this.currentMediaId=e,await this.loadCurrent()}async loadCurrent(){if(this.mediaService){this.loading=!0,this.errorMessage=null;try{const e=(await this.mediaService.browse(this.currentMediaId||this.baseMediaId)).children||[];this.items=this.sortItems(e)}catch(e){this.items=[],this.setError(this.getErrorMessage(e,"Failed to load media."))}finally{this.loading=!1}}}sortItems(e){return[...e].sort((e,t)=>{const i=this.isFolder(e);return i!==this.isFolder(t)?i?-1:1:e.title.localeCompare(t.title)})}getBreadcrumbs(){const e=this.baseMediaId||W,t=this.currentMediaId||e,i=x(t),o=[{label:"Card Builder",mediaId:e}];if(!i)return o;const r=i.split("/").filter(Boolean);let a="";for(const s of r)a=a?`${a}/${s}`:s,o.push({label:s,mediaId:q(a)});return o}isFolder(e){return Boolean(e.can_expand)||"directory"===e.media_class||"directory"===e.media_content_type}isImage(e){var t;return(null==(t=e.media_content_type)?void 0:t.startsWith("image/"))||"image"===e.media_class}getPreviewUrl(e){return this.previewErrors.has(e.media_content_id)?null:e.thumbnail?e.thumbnail:this.isImage(e)?Y(e.media_content_id):null}handlePreviewError(e){this.previewErrors=new Set(this.previewErrors).add(e.media_content_id)}async handleItemClick(e){if(this.isFolder(e))return this.clearSelection(),void this.navigateTo(e.media_content_id);const t=e.media_content_id;this.selectedReference=t;const i=await X(this.hass,t),o=i??Y(t);this.updatePreview(e.title,e.media_content_type,this.isImage(e),o),this.dispatchEvent(new CustomEvent("media-selected",{detail:{reference:t,url:i,name:e.title,contentType:e.media_content_type},bubbles:!0,composed:!0}))}navigateTo(e){this.clearSelection(),this.currentMediaId=e,this.loadCurrent()}handleUploadClick(){var e;null==(e=this.fileInput)||e.click()}handleFileInput(e){const t=e.target;t.files&&0!==t.files.length&&(this.uploadFiles(Array.from(t.files)),t.value="")}handleSearchInput(e){const t=e.target;this.searchQuery=t.value}async uploadFiles(e){var t;if(!this.mediaService||0===e.length)return;const i=this.currentMediaId||this.baseMediaId;if(!f(i))return void this.setError("Upload is available only for Card Builder media.");this.uploading=!0,this.uploadProgress={current:0,total:e.length};const o=[];let r=null;try{for(const a of e){this.uploadProgress={current:this.uploadProgress.current+1,total:this.uploadProgress.total};const e=await this.mediaService.uploadFile(a,i),s=[x(i),a.name].filter(Boolean).join("/"),n=(null==e?void 0:e.reference)||q(s);o.push(n),this.selectedReference=n,r={reference:n,name:a.name,isImage:(null==(t=a.type)?void 0:t.startsWith("image/"))??!1,contentType:a.type||null}}if(await this.loadCurrent(),r){const e=Y(r.reference);this.updatePreview(r.name,r.contentType,r.isImage,e)}o.length>0&&this.dispatchEvent(new CustomEvent("media-uploaded",{detail:{references:o,lastReference:o[o.length-1]},bubbles:!0,composed:!0}))}catch(a){this.setError(this.getErrorMessage(a,"Upload failed."))}finally{this.uploading=!1}}async handleDelete(e,t){if(e.stopPropagation(),!this.mediaService)return;if(this.isFolder(t))return;if(window.confirm(`Delete "${t.title}"?`))try{await this.mediaService.deleteFile(t.media_content_id),await this.loadCurrent()}catch(i){this.setError(this.getErrorMessage(i,"Delete failed."))}}handleDragEnter(e){e.preventDefault(),this.dragActive=!0}handleDragOver(e){e.preventDefault(),this.dragActive=!0}handleDragLeave(e){e.target===e.currentTarget&&(this.dragActive=!1)}handleDrop(e){var t;e.preventDefault(),this.dragActive=!1;const i=Array.from((null==(t=e.dataTransfer)?void 0:t.files)??[]);0!==i.length&&this.uploadFiles(i)}refresh(){this.clearSelection(),this.loadCurrent()}updatePreview(e,t,i,o){this.selectedPreviewName=e,this.selectedPreviewType=t,this.selectedPreviewIsImage=i,this.selectedPreviewUrl=o}clearSelection(){this.selectedReference=null,this.updatePreview(null,null,!1,null)}setError(e){this.errorMessage=e,null!==this.errorTimeoutId&&window.clearTimeout(this.errorTimeoutId),this.errorTimeoutId=window.setTimeout(()=>{this.errorMessage=null,this.errorTimeoutId=null},5e3)}getErrorMessage(e,t){var i;if(!e)return t;if("string"==typeof e)return e;if(e instanceof Error)return e.message||t;if("object"==typeof e){const o=e;return o.message||o.error||(null==(i=null==o?void 0:o.body)?void 0:i.message)||t}return t}};Wr.styles=t`
        :host {
            display: block;
            height: 100%;
            color: var(--primary-text-color);
            background: var(--primary-background-color);
            font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
        }

        .media-manager {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            box-sizing: border-box;
            height: 100%;
        }

        .toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .toolbar .spacer {
            flex: 1;
        }

        .button {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.2px;
        }

        .button.primary {
            background: var(--primary-color);
            color: var(--text-primary-color, #fff);
            border-color: transparent;
        }

        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .search-input {
            flex: 1;
            min-width: 160px;
            padding: 8px 10px;
            border-radius: 6px;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            font-size: 12px;
        }

        .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--secondary-text-color);
            flex-wrap: wrap;
        }

        .breadcrumbs button {
            border: none;
            background: none;
            color: var(--primary-color);
            cursor: pointer;
            padding: 0;
            font-size: 12px;
        }

        .breadcrumbs .separator {
            color: var(--secondary-text-color);
        }

        .drop-zone {
            border: 2px dashed var(--divider-color);
            border-radius: 10px;
            padding: 16px;
            text-align: center;
            background: var(--card-background-color);
            color: var(--secondary-text-color);
            transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .drop-zone.dragging {
            border-color: var(--primary-color);
            background: rgba(3, 169, 244, 0.08);
            color: var(--primary-text-color);
        }

        .upload-status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
            color: var(--primary-text-color);
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid var(--primary-color);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .error-banner {
            padding: 10px 12px;
            border-radius: 8px;
            background: rgba(219, 68, 55, 0.12);
            border: 1px solid var(--error-color, #db4437);
            color: var(--error-color, #db4437);
            font-size: 12px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
            flex: 1;
            overflow: auto;
            padding-bottom: 4px;
            align-content: start;
            align-items: start;
            grid-auto-rows: max-content;
        }

        .content {
            flex: 1;
            min-height: 0;
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
        }

        .content.split {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .grid-panel,
        .preview-panel {
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .preview-panel {
            border: 1px solid var(--divider-color);
            border-radius: 12px;
            background: var(--card-background-color);
            padding: 12px;
            gap: 12px;
        }

        .preview-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--primary-text-color);
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .preview-frame {
            flex: 1;
            border-radius: 10px;
            border: 1px solid var(--divider-color);
            background: var(--secondary-background-color);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            min-height: 0;
        }

        .preview-frame img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .preview-meta {
            font-size: 12px;
            color: var(--secondary-text-color);
            word-break: break-all;
        }

        .item {
            background: var(--card-background-color);
            border: 2px solid var(--divider-color);
            border-radius: 6px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            position: relative;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .item:hover,
        .item.selected {
            border-color: var(--primary-color);
        }

        .item-actions {
            position: absolute;
            top: 6px;
            right: 6px;
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 1;
        }

        .item:hover .item-actions {
            opacity: 1;
        }

        .icon-button {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: 1px solid var(--divider-color);
            background: var(--card-background-color);
            color: var(--primary-text-color);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            --mdc-icon-size: 16px;
        }

        .icon-button:hover {
            border-color: var(--error-color, #db4437);
            color: var(--error-color, #db4437);
        }

        .thumbnail {
            width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 8px;
            background: var(--secondary-background-color);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .item-name {
            font-size: 12px;
            color: var(--primary-text-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .empty-state {
            font-size: 13px;
            color: var(--secondary-text-color);
            text-align: center;
            padding: 24px 0;
        }
    `,Gr([i({attribute:!1})],Wr.prototype,"hass",2),Gr([i({type:String})],Wr.prototype,"baseMediaId",2),Gr([i({type:Boolean})],Wr.prototype,"selectionMode",2),Gr([i({type:String})],Wr.prototype,"selectedReference",2),Gr([n()],Wr.prototype,"currentMediaId",2),Gr([n()],Wr.prototype,"items",2),Gr([n()],Wr.prototype,"loading",2),Gr([n()],Wr.prototype,"uploading",2),Gr([n()],Wr.prototype,"uploadProgress",2),Gr([n()],Wr.prototype,"searchQuery",2),Gr([n()],Wr.prototype,"errorMessage",2),Gr([n()],Wr.prototype,"dragActive",2),Gr([n()],Wr.prototype,"previewErrors",2),Gr([n()],Wr.prototype,"selectedPreviewUrl",2),Gr([n()],Wr.prototype,"selectedPreviewName",2),Gr([n()],Wr.prototype,"selectedPreviewIsImage",2),Gr([n()],Wr.prototype,"selectedPreviewType",2),Gr([d('input[type="file"]')],Wr.prototype,"fileInput",2),Wr=Gr([a("media-manager")],Wr);var qr=Object.defineProperty,Yr=Object.getOwnPropertyDescriptor,Xr=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Yr(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&qr(t,i,a),a};let Kr=class extends mr{constructor(){super(...arguments),this.mode="manage",this.title="Media Manager",this.subtitle="Manage your media",this.confirmLabel="Use selected media",this.selection=null,this._handleMediaSelected=async e=>{const{reference:t,url:i,name:o,contentType:r}=e.detail||{};if(!t)return;const a=i??await X(this.hass,t);this.selection={reference:t,url:a??null,name:o||T(t)||t,contentType:r}},this._handleMediaUploaded=async e=>{if("select"!==this.mode)return;const t=e.detail;if(!(null==t?void 0:t.lastReference))return;const i=await X(this.hass,t.lastReference);this.selection={reference:t.lastReference,url:i??null,name:T(t.lastReference)||t.lastReference}}}get dialogTitle(){return this.title}get dialogSubtitle(){return this.subtitle||null}updated(e){super.updated(e),e.has("open")&&!this.open&&(this.selection=null),e.has("mode")&&"manage"===this.mode&&(this.selection=null)}renderDialogBody(){var e;return r`
            <media-manager
                .hass=${this.hass}
                .selectionMode=${"select"===this.mode}
                .selectedReference=${(null==(e=this.selection)?void 0:e.reference)??null}
                @media-selected=${this._handleMediaSelected}
                @media-uploaded=${this._handleMediaUploaded}
            ></media-manager>
        `}renderDialogFooter(){return"select"===this.mode?r`
                <div class="dialog-footer">
                    <div class="selection-chip">
                        ${this.selection?this.selection.name:"No media selected"}
                    </div>
                    <div class="footer-spacer"></div>
                    <button class="secondary-btn" @click=${this.handleClose}>Cancel</button>
                    <button class="primary-btn" ?disabled=${!this.selection} @click=${this._confirmSelection}>
                        ${this.confirmLabel}
                    </button>
                </div>
            `:r`
            <div class="dialog-footer">
                <div class="footer-spacer"></div>
                <button class="secondary-btn" @click=${this.handleClose}>Close</button>
            </div>
        `}_confirmSelection(){this.selection&&(this.dispatchEvent(new CustomEvent("media-confirm",{detail:this.selection,bubbles:!0,composed:!0})),this.handleClose())}onBeforeClose(){this.selection=null}};Kr.styles=[...mr.styles,t`
            .dialog-body {
                padding: 0;
            }

            media-manager {
                flex: 1;
                height: 100%;
            }

            .selection-chip {
                padding: 6px 10px;
                background: var(--bg-primary, #fff);
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 999px;
                font-size: 12px;
                color: var(--text-primary, #333);
                max-width: 260px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        `],Xr([i({attribute:!1})],Kr.prototype,"hass",2),Xr([i({type:String})],Kr.prototype,"mode",2),Xr([i({type:String})],Kr.prototype,"title",2),Xr([i({type:String})],Kr.prototype,"subtitle",2),Xr([i({type:String})],Kr.prototype,"confirmLabel",2),Xr([n()],Kr.prototype,"selection",2),Kr=Xr([a("media-manager-overlay")],Kr);var Jr=Object.defineProperty,Qr=Object.getOwnPropertyDescriptor,Zr=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Qr(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Jr(t,i,a),a};const ea=((e=class extends o{constructor(){super(),this.hassProvider=new m(this,{context:K}),this.theme="light",this.environment={isBuilder:!0,blocksOutlineEnabled:!0,actionsEnabled:!1},this.documentModel=new J,this.blockRegistry=Q,this.containerManager=new Z,this.eventBus=new ee,this.linkEditorPreferences={...te},this.overlayRegistry=new Map,this.overlayHost={registerOverlay:(e,t)=>{this.overlayRegistry.set(e,t),this.requestUpdate()},unregisterOverlay:e=>{this.overlayRegistry.delete(e)&&this.requestUpdate()},invalidateOverlays:()=>{this.requestUpdate()}},this.containers=[],this.canvasElement=null,this.styleResolverReady=!1,this.slotEntitiesManagerOpen=!1,this.slotActionsManagerOpen=!1,this.linkModeEnabled=!1,this.mediaManagerOpen=!1,this.rightSidebarWidth=260,this.mediaManagerMode="manage",this.mediaManagerRequestId=null,this.mediaManagerTitle="Media Manager",this.mediaManagerSubtitle="Manage your media",this.mediaManagerConfirmLabel="Use selected media",this._showPositionGuides=!0,this._showSnapGuides=!0,this.headerActions=new Map,this._openMediaManagerFromHeader=()=>{this._openMediaManager({mode:"manage"})},this._closeMediaManager=()=>{"select"===this.mediaManagerMode&&this.mediaManagerRequestId&&this.eventBus.dispatchEvent("media-manager-cancelled",{requestId:this.mediaManagerRequestId}),this.mediaManagerOpen=!1,this.mediaManagerMode="manage",this.mediaManagerRequestId=null},this._handleMediaConfirm=e=>{const t=e.detail;"select"===this.mediaManagerMode&&this.mediaManagerRequestId&&(null==t?void 0:t.reference)&&this.eventBus.dispatchEvent("media-manager-selected",{requestId:this.mediaManagerRequestId,selection:t}),this._closeMediaManager()},this._toggleActionsEnabled=()=>{this.environment={...this.environment,actionsEnabled:!this.environment.actionsEnabled}},this._toggleLinkMode=()=>{this.linkModeController.toggleLinkMode()},this._handleRightSidebarWidthChanged=e=>{(null==e?void 0:e.detail)&&"number"==typeof e.detail.width&&this._setRightSidebarWidth(e.detail.width,!0)},this.headerActions.set("link-mode-toggle",()=>this._renderHeaderActionLinkModeToggle()),this.headerActions.set("blocks-outline-toggle",()=>this._renderHeaderActionBlocksOutlineToggle()),this.headerActions.set("actions-toggle",()=>this._renderHeaderActionActionsToggle()),this.linkModeController=new ie({documentModel:this.documentModel,eventBus:this.eventBus,blockRegistry:this.blockRegistry,preferences:this.linkEditorPreferences}),this.style.setProperty("--right-sidebar-width",`${this.rightSidebarWidth}px`)}set hass(e){this._hass=e,this.styleResolver&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator()),this.hassProvider.setValue(e)}async connectedCallback(){super.connectedCallback(),this._loadCanvasUserPreferences(),this.dragDropManager=new oe(this.eventBus),await this._initializeStyleResolver(),this.documentModel.addEventListener("change",e=>{this._notifyConfigChange(e.detail)}),this.documentModel.addEventListener("link-mode-changed",e=>{var t;const i=e.detail;this.linkModeEnabled=Boolean(null==(t=null==i?void 0:i.state)?void 0:t.enabled)}),this.containers=this.containerManager.getContainers(),this.activeContainerId=this.containerManager.getActiveContainerId(),this.eventBus.addEventListener("canvas-size-changed",({width:e,height:t})=>this._onCanvasSizeChanged(e,t)),this.addEventListener("manage-entities-slots",()=>{this.slotEntitiesManagerOpen=!0}),this.addEventListener("manage-action-slots",()=>{this.slotActionsManagerOpen=!0}),this.eventBus.addEventListener("media-manager-open",e=>{this._openMediaManager(e)}),this.eventBus.addEventListener("link-editor-preferences-changed",e=>{this._updateLinkEditorPreferences((null==e?void 0:e.preferences)??{})})}async firstUpdated(){var e;await this.updateComplete,this.canvasElement=null==(e=this.shadowRoot)?void 0:e.querySelector("#builder-canvas")}updated(e){super.updated(e),e.has("hass")&&this._hass&&this.styleResolver&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator())}disconnectedCallback(){var e,t;super.disconnectedCallback(),null==(e=this.dragDropManager)||e.destroy(),null==(t=this.linkModeController)||t.destroy()}render(){return this.styleResolverReady&&this._hass?r`
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
                            .width=${this.rightSidebarWidth}
                            @right-sidebar-width-changed=${this._handleRightSidebarWidthChanged}
                        ></sidebar-right>
                    </aside>
                </div>
            </div>
            <entity-slots-editor-overlay
                .open=${this.slotEntitiesManagerOpen}
                .hass=${this._hass}
                @overlay-close=${()=>{this.slotEntitiesManagerOpen=!1}}
                @slot-reference-navigate=${this._handleSlotReferenceNavigate}
            ></entity-slots-editor-overlay>
            <action-slots-editor-overlay
                .open=${this.slotActionsManagerOpen}
                .hass=${this._hass}
                @overlay-close=${()=>{this.slotActionsManagerOpen=!1}}
                @slot-reference-navigate=${this._handleSlotReferenceNavigate}
            ></action-slots-editor-overlay>
            <media-manager-overlay
                .open=${this.mediaManagerOpen}
                .hass=${this._hass}
                .mode=${this.mediaManagerMode}
                .title=${this.mediaManagerTitle}
                .subtitle=${this.mediaManagerSubtitle}
                .confirmLabel=${this.mediaManagerConfirmLabel}
                @overlay-close=${this._closeMediaManager}
                @media-confirm=${this._handleMediaConfirm}
            ></media-manager-overlay>
            ${Array.from(this.overlayRegistry.values()).map(e=>e())}
        `:r``}_renderHeader(){return r`
            <header class="builder-header">
                <div class="builder-header-left">
                    <button
                        class="header-action ${this.slotEntitiesManagerOpen?"active":""}"
                        @click=${this._toggleSlotManager}
                        title="Manage Entities Slots"
                        aria-pressed=${this.slotEntitiesManagerOpen?"true":"false"}
                    >
                        Entities
                    </button>
                    <button
                        class="header-action ${this.slotActionsManagerOpen?"active":""}"
                        @click=${this._toggleSlotActionsManager}
                        title="Manage Action Slots"
                        aria-pressed=${this.slotActionsManagerOpen?"true":"false"}
                    >
                        Actions
                    </button>
                    <button
                        class="header-action ${this.mediaManagerOpen&&"manage"===this.mediaManagerMode?"active":""}"
                        @click=${this._openMediaManagerFromHeader}
                        title="Media Manager"
                        aria-pressed=${this.mediaManagerOpen&&"manage"===this.mediaManagerMode?"true":"false"}
                    >
                        Media
                    </button>
                </div>
                <div class="builder-header-center">
                    ${this._renderHeaderContainerSelector()}
                </div>
                <div class="builder-header-actions">
                    ${Array.from(this.headerActions.values()).map(e=>e())}
                </div>
            </header>
        `}_renderHeaderContainerSelector(){return r`
            <container-selector
                .containers=${this.containers}
                .activeContainerId=${this.activeContainerId}
            ></container-selector>
        `}_renderHeaderActionBlocksOutlineToggle(){return r`
            <button
                class="header-action header-toggle ${this.environment.blocksOutlineEnabled?"active":""}"
                @click=${this._toggleBlocksHighlight}
                title=${this.environment.blocksOutlineEnabled?"Disable Blocks Outline":"Enable Blocks Outline"}
                aria-pressed=${this.environment.blocksOutlineEnabled?"true":"false"}
            >
                <ha-icon icon="mdi:selection"></ha-icon>
            </button>
        `}_renderHeaderActionLinkModeToggle(){return r`
            <button
                class="header-action header-toggle ${this.linkModeEnabled?"active":""}"
                @click=${this._toggleLinkMode}
                title=${this.linkModeEnabled?"Exit Link Mode":"Enter Link Mode"}
                aria-pressed=${this.linkModeEnabled?"true":"false"}
            >
                <ha-icon icon="mdi:vector-line"></ha-icon>
            </button>
        `}_renderHeaderActionActionsToggle(){return r`
            <button
                class="header-action header-toggle ${this.environment.actionsEnabled?"active":""}"
                @click=${this._toggleActionsEnabled}
                title=${this.environment.actionsEnabled?"Disable Actions":"Enable Actions"}
                aria-pressed=${this.environment.actionsEnabled?"true":"false"}
            >
                <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            </button>
        `}_renderCanvas(){const e=this.containerManager.getActiveContainer();return r`
            <builder-canvas
                id="builder-canvas"
                class="container-${e.id}"
                .canvasId=${"main-canvas"}
                .showPositionGuides=${this._showPositionGuides}
                .showSnapGuides=${this._showSnapGuides}
                @position-guides-preference-changed=${this._onPositionGuidesPreferenceChanged}
                @snap-guides-preference-changed=${this._onSnapGuidesPreferenceChanged}
            ></builder-canvas>
        `}loadConfig(e){if(e&&"object"==typeof e){const{config:t}=re(e);this.documentModel.loadFromConfig(t)}}exportConfig(){return this.documentModel.exportToConfig()}clearDocument(){this.documentModel.clear()}async _initializeStyleResolver(){try{const e=await A(this._hass);this.styleResolver=new ae(this.documentModel,this.containerManager,e,this.blockRegistry),this._hass&&this.styleResolver.setBindingEvaluator(this._createBindingEvaluator()),this.styleResolverReady=!0}catch(e){console.error("[BuilderMain] Failed to initialize StyleResolver:",e)}}_toggleSlotManager(){this.slotEntitiesManagerOpen=!this.slotEntitiesManagerOpen}_toggleSlotActionsManager(){this.slotActionsManagerOpen=!this.slotActionsManagerOpen}_openMediaManager(e){const t=(null==e?void 0:e.mode)??"manage";this.mediaManagerMode=t,this.mediaManagerRequestId=(null==e?void 0:e.requestId)??null,this.mediaManagerTitle=(null==e?void 0:e.title)??("select"===t?"Select media":"Media Manager"),this.mediaManagerSubtitle=(null==e?void 0:e.subtitle)??("select"===t?"Choose or upload a file":"Manage your media"),this.mediaManagerConfirmLabel=(null==e?void 0:e.confirmLabel)??"Use selected media",this.mediaManagerOpen=!0}_toggleBlocksHighlight(){this.environment={...this.environment,blocksOutlineEnabled:!this.environment.blocksOutlineEnabled},localStorage.setItem(e.BLOCKS_OUTLINE_STORAGE_KEY,String(this.environment.blocksOutlineEnabled))}_loadCanvasUserPreferences(){var t,i;const o=localStorage.getItem(e.POSITION_GUIDES_STORAGE_KEY);null!==o&&(this._showPositionGuides="true"===o);const r=localStorage.getItem(e.SNAP_GUIDES_STORAGE_KEY);null!==r&&(this._showSnapGuides="true"===r);const a=localStorage.getItem(e.BLOCKS_OUTLINE_STORAGE_KEY);null!==a&&(this.environment={...this.environment,blocksOutlineEnabled:"true"===a});const s=localStorage.getItem(e.LINK_EDITOR_PREFS_STORAGE_KEY);if(s)try{const e=JSON.parse(s);this.linkEditorPreferences=se(e)}catch{this.linkEditorPreferences={...te}}null==(i=null==(t=this.linkModeController)?void 0:t.setPreferences)||i.call(t,this.linkEditorPreferences);const n=localStorage.getItem(e.RIGHT_SIDEBAR_WIDTH_STORAGE_KEY);if(null!==n){const e=parseInt(n,10);Number.isNaN(e)||this._setRightSidebarWidth(e,!1)}}_updateLinkEditorPreferences(t){var i,o;this.linkEditorPreferences={...this.linkEditorPreferences,...t},localStorage.setItem(e.LINK_EDITOR_PREFS_STORAGE_KEY,JSON.stringify(this.linkEditorPreferences)),null==(o=null==(i=this.linkModeController)?void 0:i.setPreferences)||o.call(i,this.linkEditorPreferences)}_onPositionGuidesPreferenceChanged(t){this._showPositionGuides=t.detail.status,localStorage.setItem(e.POSITION_GUIDES_STORAGE_KEY,String(this._showPositionGuides))}_onSnapGuidesPreferenceChanged(t){this._showSnapGuides=t.detail.status,localStorage.setItem(e.SNAP_GUIDES_STORAGE_KEY,String(this._showSnapGuides))}_onCanvasSizeChanged(e,t){this.canvasWidth=e,this.canvasHeight=t}_setRightSidebarWidth(t,i){const o=Math.max(e.RIGHT_SIDEBAR_MIN_WIDTH,Math.min(e.RIGHT_SIDEBAR_MAX_WIDTH,Math.round(t)));this.rightSidebarWidth!==o&&(this.rightSidebarWidth=o,this.style.setProperty("--right-sidebar-width",`${o}px`),i&&localStorage.setItem(e.RIGHT_SIDEBAR_WIDTH_STORAGE_KEY,String(o)))}async _handleSlotReferenceNavigate(e){const{reference:t}=e.detail;if(this.slotEntitiesManagerOpen=!1,this.slotActionsManagerOpen=!1,this.documentModel.select(t.blockId),"style-binding"===t.kind)return this._openSidebarTab("styles"),void(await this._openStyleBinding(t));this._openSidebarTab("properties"),"trait-binding"===t.kind&&await this._openTraitBinding(t)}_openSidebarTab(e){const t=this._getSidebarTabbed();(null==t?void 0:t.setActiveTab)&&t.setActiveTab(e)}_getSidebarTabbed(){var e,t;const i=null==(e=this.shadowRoot)?void 0:e.querySelector("sidebar-right");return null==(t=null==i?void 0:i.shadowRoot)?void 0:t.querySelector("sidebar-tabbed")}async _openStyleBinding(e){var t,i;if(!e.category||!e.property)return;await new Promise(e=>requestAnimationFrame(e));const o=null==(i=null==(t=this._getSidebarTabbed())?void 0:t.shadowRoot)?void 0:i.querySelector("panel-styles");o&&o.openBindingEditor&&o.openBindingEditor(e.category,e.property,e.property,e.styleTargetId??null)}async _openTraitBinding(e){var t,i;if(!e.propName)return;await new Promise(e=>requestAnimationFrame(e));const o=null==(i=null==(t=this._getSidebarTabbed())?void 0:t.shadowRoot)?void 0:i.querySelector("panel-properties");(null==o?void 0:o.openTraitBindingEditor)&&o.openTraitBindingEditor(e.propName)}_createBindingEvaluator(){return new B(this._hass,{resolveSlotEntity:e=>this.documentModel.resolveSlotEntity(e),onTemplateResult:()=>{this.eventBus.dispatchEvent("template-updated"),this.requestUpdate()}})}_notifyConfigChange(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:e,bubbles:!0,composed:!0}))}}).styles=t`
        :host {
            --sidebar-width: 260px;
            --right-sidebar-width: 260px;
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
            position: relative;
            z-index: 0;
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
            align-items: stretch;
            justify-content: space-between;
            padding: 10px 16px;
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
        }

        .builder-header-actions {
            display: flex;
            align-items: center;
            --mdc-icon-size: 16px;
        }

        .header-action {
            height: 100%;
            padding: 0 10px;
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
        
        .header-action:has( + .header-action ) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        .header-action + .header-action {
            border-left: none;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }

        .header-toggle.active {
            color: var(--accent-color);
            background: rgba(0, 120, 212, 0.08);
            outline: 1px solid var(--accent-color);
            outline-offset: -1px;
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
    `,e.POSITION_GUIDES_STORAGE_KEY="card-builder-position-guides",e.SNAP_GUIDES_STORAGE_KEY="card-builder-snap-guides",e.BLOCKS_OUTLINE_STORAGE_KEY="card-builder-blocks-outline",e.LINK_EDITOR_PREFS_STORAGE_KEY="card-builder-link-editor-preferences",e.RIGHT_SIDEBAR_WIDTH_STORAGE_KEY="card-builder-right-sidebar-width",e.RIGHT_SIDEBAR_MIN_WIDTH=200,e.RIGHT_SIDEBAR_MAX_WIDTH=600,e);Zr([i({type:String,reflect:!0})],ea.prototype,"theme",2),Zr([y({context:ne}),n()],ea.prototype,"environment",2),Zr([y({context:k})],ea.prototype,"dragDropManager",2),Zr([y({context:w})],ea.prototype,"documentModel",2),Zr([y({context:_})],ea.prototype,"blockRegistry",2),Zr([n(),y({context:U})],ea.prototype,"containerManager",2),Zr([y({context:H})],ea.prototype,"styleResolver",2),Zr([y({context:C})],ea.prototype,"eventBus",2),Zr([n(),y({context:E})],ea.prototype,"linkEditorPreferences",2),Zr([n(),y({context:tt})],ea.prototype,"overlayHost",2),Zr([n()],ea.prototype,"containers",2),Zr([n()],ea.prototype,"activeContainerId",2),Zr([n()],ea.prototype,"canvasWidth",2),Zr([n()],ea.prototype,"canvasHeight",2),Zr([n()],ea.prototype,"canvasElement",2),Zr([n()],ea.prototype,"styleResolverReady",2),Zr([n()],ea.prototype,"slotEntitiesManagerOpen",2),Zr([n()],ea.prototype,"slotActionsManagerOpen",2),Zr([n()],ea.prototype,"linkModeEnabled",2),Zr([n()],ea.prototype,"mediaManagerOpen",2),Zr([n()],ea.prototype,"rightSidebarWidth",2),Zr([n()],ea.prototype,"mediaManagerMode",2),Zr([n()],ea.prototype,"mediaManagerRequestId",2),Zr([n()],ea.prototype,"mediaManagerTitle",2),Zr([n()],ea.prototype,"mediaManagerSubtitle",2),Zr([n()],ea.prototype,"mediaManagerConfirmLabel",2),Zr([y({context:O})],ea.prototype,"linkModeController",2),Zr([i({attribute:!1})],ea.prototype,"hass",1);let ta=ea;ci.define("builder-main",ta);const ia="card-builder",oa={DASHBOARD:"dashboard",CARDS:"cards",EDITOR_CREATE:"editor/create",EDITOR_EDIT:"editor/edit"};class ra extends EventTarget{constructor(){super(),this.currentRoute=oa.DASHBOARD,this.currentParams={},this._initialize()}navigate(e,t){this.currentRoute=e,this.currentParams=t||{};const i=`/${ia}/${e}${t?"?"+new URLSearchParams(t).toString():""}`;window.history.pushState({route:e,params:t},"",i),this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.currentRoute,params:this.currentParams}}))}getCurrentRoute(){return{route:this.currentRoute,params:{...this.currentParams}}}parseRoute(e,t=""){let i=e.startsWith("/")?e.substring(1):e;if(i.startsWith(ia)&&(i=i.substring(12)),i=i.replace(/^\/+/,""),!i)return{route:oa.DASHBOARD,params:{}};const o=new URLSearchParams(t),r=Object.values(oa);for(const a of r)if(i===a)return{route:a,params:Object.fromEntries(o)};return{route:oa.DASHBOARD,params:{}}}_initialize(){window.addEventListener("popstate",e=>{this._handleLocationChange(e)}),this._handleLocationChange()}_handleLocationChange(e){const t=window.location.pathname,i=this.parseRoute(t,window.location.search);this._routesAreEqual(this.currentRoute,this.currentParams,(null==e?void 0:e.state.route)??"",(null==e?void 0:e.state.params)??{})||(this.currentRoute=i.route,this.currentParams=i.params,this.dispatchEvent(new CustomEvent("route-changed",{detail:{route:this.currentRoute,params:this.currentParams}})))}_routesAreEqual(e,t,i,o){return e===i&&this._routesParamsAreEqual(t,o)}_routesParamsAreEqual(e,t){if(e===t)return!0;if("object"!=typeof e||"object"!=typeof t||null==e||null==t)return!1;const i=Object.keys(e),o=Object.keys(t);return i.length===o.length&&i.every(i=>o.includes(i)&&this._routesParamsAreEqual(e[i],t[i]))}}let aa=null;function sa(){return aa||(aa=new ra),aa}var na=Object.defineProperty,la=Object.getOwnPropertyDescriptor,da=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?la(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&na(t,i,a),a};let ca=class extends o{constructor(){super(...arguments),this.activeRoute="dashboard",this.collapsed=!1,this.isFullscreen=!1,this.narrow=!1,this.menuItems=[{id:oa.DASHBOARD,icon:"mdi:view-dashboard",label:"Dashboard"},{id:oa.CARDS,icon:"mdi:cards",label:"Cards"},{id:oa.EDITOR_CREATE,icon:"mdi:plus-circle",label:"New Card"}]}render(){return r`
      <div class="sidebar-content">
        <div class="sidebar-header">
          <div class="sidebar-title">Card Builder</div>
          <button
            class="toggle-button"
            @click=${this._toggleCollapse}
            title=${this.collapsed?"Expand sidebar":"Collapse sidebar"}
          >
              <ha-icon icon="mdi:chevron-${this.collapsed?"right":"left"}"></ha-icon>
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
          <ha-icon icon="${e.icon}" class="menu-item-icon"></ha-icon>
        <span class="menu-item-label">${e.label}</span>
      </li>
    `}_renderFooter(){return this.isFullscreen?r`
        <div class="sidebar-footer">
          <button
            class="footer-button"
            @click=${this._handleExitDashboard}
            title=${this.collapsed?"Exit to dashboard":""}
          >
              <ha-icon icon="mdi:home" class="footer-button-icon"></ha-icon>
            <span class="footer-button-label">Exit to dashboard</span>
          </button>
          <button
            class="footer-button"
            @click=${this._handleToggleFullscreen}
            title=${this.collapsed?"Exit fullscreen":""}
          >
              <ha-icon icon="mdi:fullscreen-exit" class="footer-button-icon"></ha-icon>
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
              <ha-icon icon="mdi:fullscreen" class="footer-button-icon"></ha-icon>
            <span class="footer-button-label">Enter fullscreen</span>
          </button>
        </div>
      `}_toggleCollapse(){this.collapsed=!this.collapsed}_handleNavigate(e){this.dispatchEvent(new CustomEvent("navigate",{detail:{route:e}}))}_handleToggleFullscreen(){this.dispatchEvent(new CustomEvent("toggle-fullscreen"))}_handleExitDashboard(){this.dispatchEvent(new CustomEvent("exit-dashboard"))}};ca.styles=t`
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
  `,da([i({attribute:!1})],ca.prototype,"hass",2),da([i({type:String})],ca.prototype,"activeRoute",2),da([i({type:Boolean,reflect:!0})],ca.prototype,"collapsed",2),da([i({type:Boolean})],ca.prototype,"isFullscreen",2),da([i({type:Boolean})],ca.prototype,"narrow",2),ca=da([a("global-sidebar")],ca);var pa=Object.defineProperty,ha=Object.getOwnPropertyDescriptor,ua=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ha(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&pa(t,i,a),a};let ga=class extends o{constructor(){super(...arguments),this.currentRoute="dashboard",this.hideSidebar=!1,this.isFullscreen=!1,this.narrow=!1}render(){return r`
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
        `}_handleNavigate(e){this.dispatchEvent(new CustomEvent("navigate",{detail:e.detail}))}_handleToggleFullscreen(){this.dispatchEvent(new CustomEvent("toggle-fullscreen"))}_handleExitDashboard(){this.dispatchEvent(new CustomEvent("exit-dashboard"))}};ga.styles=t`
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
    `,ua([i({attribute:!1})],ga.prototype,"hass",2),ua([i({type:String})],ga.prototype,"currentRoute",2),ua([i({type:Boolean,reflect:!0})],ga.prototype,"hideSidebar",2),ua([i({type:Boolean})],ga.prototype,"isFullscreen",2),ua([i({type:Boolean})],ga.prototype,"narrow",2),ga=ua([a("app-layout")],ga);var va=Object.defineProperty,ba=Object.getOwnPropertyDescriptor,ma=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?ba(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&va(t,i,a),a};let ya=class extends o{constructor(){super(...arguments),this.cards=[],this.loading=!0,this.error=null,this.router=sa()}connectedCallback(){super.connectedCallback(),this.hass&&(this.cardsService=le(this.hass),this._loadCards(),this._subscribeToUpdates())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}updated(e){e.has("hass")&&this.hass&&!this.cardsService&&(this.cardsService=le(this.hass),this._loadCards(),this._subscribeToUpdates())}render(){if(this.loading)return this._renderLoading();if(this.error)return this._renderError();const e=this._getStats();return r`
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
                        <ha-icon icon="mdi:plus-circle"></ha-icon>
                        <span class="action-label">Create New Card</span>
                    </button>

                    <button class="action-button secondary" @click=${this._handleViewAll}>
                        <ha-icon icon="mdi:cards"></ha-icon>
                        <span class="action-label">View All Cards</span>
                    </button>
                </div>
            </div>
        `}_renderRecentCards(){const e=this._getRecentCards(5);return 0===e.length?r`
                <div class="recent-cards">
                    <h2 class="section-title">Recent Cards</h2>
                    <div class="empty-state">
                        <ha-icon icon="mdi:card-bulleted-off-outline"></ha-icon>
                        <h3 class="empty-state-title">No cards yet</h3>
                        <p class="empty-state-text">Get started by creating your first card</p>
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
                        <ha-icon icon="mdi:pencil"></ha-icon>
                    </button>
                    <button
                            class="icon-button delete"
                            @click=${()=>this._handleDeleteCard(e.id)}
                            title="Delete card"
                    >
                        <ha-icon icon="mdi:delete"></ha-icon>
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
        `}async _loadCards(){if(this.cardsService){this.loading=!0,this.error=null;try{this.cards=await this.cardsService.listCards()}catch(e){console.error("Failed to load cards:",e),this.error="Failed to load cards. Please try again."}finally{this.loading=!1}}}async _subscribeToUpdates(){if(this.cardsService)try{this.unsubscribe=await this.cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(e){console.error("Failed to subscribe to updates:",e)}}_getStats(){const e=this.cards.length,t=new Date;t.setDate(t.getDate()-7);return{total:e,recentlyModified:this.cards.filter(e=>new Date(e.updated_at)>=t).length,lastCreated:[...this.cards].sort((e,t)=>new Date(t.created_at).getTime()-new Date(e.created_at).getTime())[0]||null}}_getRecentCards(e){return[...this.cards].sort((e,t)=>new Date(t.updated_at).getTime()-new Date(e.updated_at).getTime()).slice(0,e)}_formatDate(e){const t=new Date(e),i=(new Date).getTime()-t.getTime(),o=Math.floor(i/6e4),r=Math.floor(i/36e5),a=Math.floor(i/864e5);return o<1?"just now":o<60?`${o} min ago`:r<24?`${r} hours ago`:a<7?`${a} days ago`:t.toLocaleDateString()}_handleViewAll(){this.router.navigate(oa.CARDS)}_handleCreateNew(){this.router.navigate(oa.EDITOR_CREATE)}_handleEditCard(e){this.router.navigate(oa.EDITOR_EDIT,{id:e})}async _handleDeleteCard(e){if(!this.cardsService)return;const t=this.cards.find(t=>t.id===e);if(t&&confirm(`Are you sure you want to delete "${t.name}"?`))try{await this.cardsService.deleteCard(e)}catch(i){console.error("Failed to delete card:",i),alert("Failed to delete card. Please try again.")}}};ya.styles=t`
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
            --mdc-icon-size: 36px;
        }

        .action-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
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

        .empty-state ha-icon {
            --mdc-icon-size: 64px;
            margin-bottom: 10px;
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
    `,ma([i({attribute:!1})],ya.prototype,"hass",2),ma([n()],ya.prototype,"cards",2),ma([n()],ya.prototype,"loading",2),ma([n()],ya.prototype,"error",2),ya=ma([a("dashboard-view")],ya);var fa=Object.defineProperty,xa=Object.getOwnPropertyDescriptor,_a=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?xa(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&fa(t,i,a),a};let ka=class extends o{constructor(){super(...arguments),this.cards=[],this.filteredCards=[],this.loading=!0,this.searchQuery="",this.sortColumn="updated_at",this.sortDirection="desc",this.currentPage=1,this.pageSize=10,this.deleteConfirmId=null,this.error=null,this.showImportDialog=!1,this.importMethod="paste",this.importJsonText="",this.importData=null,this.importError=null,this.importName="",this.importDescription="",this.isImporting=!1,this.migratingCardIds=new Set,this.router=sa()}connectedCallback(){super.connectedCallback(),this.hass&&(this.cardsService=le(this.hass),this._loadCards(),this._subscribeToUpdates())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe(),this.searchTimeout&&clearTimeout(this.searchTimeout)}updated(e){e.has("hass")&&this.hass&&!this.cardsService&&(this.cardsService=le(this.hass),this._loadCards(),this._subscribeToUpdates())}render(){return this.loading?this._renderLoading():r`
            ${this.error?r`
                <div class="error-message">
                    <strong>Error:</strong> ${this.error}
                </div>
            `:""}

            <div class="cards-header">
                <h1 class="cards-title">Cards</h1>
                <div class="header-actions">
                    <button class="secondary-button" @click=${this._handleImportClick}>
                        <ha-icon icon="mdi:file-download-outline"></ha-icon>
                        Import Card
                    </button>
                    <button class="primary-button" @click=${this._handleCreateNew}>
                        <ha-icon icon="mdi:plus-circle"></ha-icon>
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
        `}_renderTableRow(e){const t=de(e.config),i=this._isMigrating(e.id);return r`
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
                        ${t?r`
                            <button
                                    class="migrate-button"
                                    @click=${()=>this._handleMigrateCard(e.id)}
                                    ?disabled=${i}
                                    title="Migrate card to the latest data format"
                            >
                                ${i?"Migrating...":"Migrate"}
                            </button>
                        `:""}
                        <button
                                class="icon-button"
                                @click=${()=>this._handleEdit(e.id)}
                                title="Edit card"
                        >
                            <ha-icon icon="mdi:pencil"></ha-icon>
                        </button>
                        <button
                                class="icon-button delete"
                                @click=${()=>this._handleDeleteClick(e.id)}
                                title="Delete card"
                        >
                            <ha-icon icon="mdi:delete"></ha-icon>
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
                        <ha-icon icon="mdi:credit-card-search-outline"></ha-icon>
                        <h3 class="empty-state-title">No cards found</h3>
                        <p class="empty-state-text">Try adjusting your search query</p>
                    </div>
                </div>
            `:r`
            <div class="table-container">
                <div class="empty-state">
                    <ha-icon icon="mdi:card-bulleted-off-outline"></ha-icon>
                    <h3 class="empty-state-title">No cards yet</h3>
                    <p class="empty-state-text">Get started by creating your first card</p>
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
                                <ha-icon icon="mdi:clipboard-outline"></ha-icon>
                                Paste JSON
                            </button>
                            <button
                                    class="import-tab ${"file"===this.importMethod?"active":""}"
                                    @click=${()=>this._handleImportMethodChange("file")}
                            >
                                <ha-icon icon="mdi:file-download-outline"></ha-icon>
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
                                <ha-icon icon="mdi:file-download-outline"></ha-icon>
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
        `}async _loadCards(){if(this.cardsService){this.loading=!0,this.error=null;try{this.cards=await this.cardsService.listCards(),this._applyFilters()}catch(e){console.error("Failed to load cards:",e),this.error="Failed to load cards. Please try again."}finally{this.loading=!1}}}async _subscribeToUpdates(){if(this.cardsService)try{this.unsubscribe=await this.cardsService.subscribeToUpdates(()=>{this._loadCards()})}catch(e){console.error("Failed to subscribe to updates:",e)}}_applyFilters(){let e=[...this.cards];if(this.searchQuery){const t=this.searchQuery.toLowerCase();e=e.filter(e=>e.name.toLowerCase().includes(t)||e.description.toLowerCase().includes(t))}e.sort((e,t)=>{let i,o;return"name"===this.sortColumn?(i=e.name.toLowerCase(),o=t.name.toLowerCase()):(i=new Date(e.updated_at).getTime(),o=new Date(t.updated_at).getTime()),"asc"===this.sortDirection?i>o?1:-1:i<o?1:-1}),this.filteredCards=e;const t=Math.ceil(this.filteredCards.length/this.pageSize);this.currentPage>t&&t>0&&(this.currentPage=t)}_isMigrating(e){return this.migratingCardIds.has(e)}async _handleMigrateCard(e){if(!this.cardsService)return;const t=this.cards.find(t=>t.id===e);if(!t)return;const i=new Set(this.migratingCardIds);i.add(e),this.migratingCardIds=i,this.error=null;try{const{config:i}=re(t.config);await this.cardsService.updateCard(e,{config:i}),await this._loadCards()}catch(o){console.error("Failed to migrate card:",o),this.error="Failed to migrate card. Please try again."}finally{const t=new Set(this.migratingCardIds);t.delete(e),this.migratingCardIds=t}}_handleSearchInput(e){const t=e.target;this.searchQuery=t.value,this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=window.setTimeout(()=>{this._applyFilters(),this.currentPage=1},300)}_handleSort(e){this.sortColumn===e?this.sortDirection="asc"===this.sortDirection?"desc":"asc":(this.sortColumn=e,this.sortDirection="desc"),this._applyFilters()}_handlePageSizeChange(e){const t=e.target;this.pageSize=parseInt(t.value,10),this.currentPage=1,this._applyFilters()}_goToPage(e){const t=Math.ceil(this.filteredCards.length/this.pageSize);e>=1&&e<=t&&(this.currentPage=e)}_formatDate(e){const t=new Date(e),i=(new Date).getTime()-t.getTime(),o=Math.floor(i/6e4),r=Math.floor(i/36e5),a=Math.floor(i/864e5);return o<1?"just now":o<60?`${o} min ago`:r<24?`${r} hours ago`:a<7?`${a} days ago`:t.toLocaleDateString()}_handleCreateNew(){this.router.navigate(oa.EDITOR_CREATE)}_handleImportClick(){this.showImportDialog=!0,this.importMethod="paste",this.importJsonText="",this.importData=null,this.importError=null,this.importName="",this.importDescription="",this.isImporting=!1}_handleCloseImport(){this.showImportDialog=!1,this.importMethod="paste",this.importJsonText="",this.importData=null,this.importError=null,this.importName="",this.importDescription="",this.isImporting=!1}_handleImportMethodChange(e){this.importMethod=e,this.importJsonText="",this.importData=null,this.importError=null,this.importName="",this.importDescription=""}_handleJsonInput(e){const t=e.target;this.importJsonText=t.value,this._validateJson(t.value)}_handleFileClick(e){var t;const i=null==(t=e.currentTarget.parentElement)?void 0:t.querySelector(".file-input");i&&i.click()}_handleDragOver(e){e.preventDefault(),e.stopPropagation();e.currentTarget.classList.add("drag-over")}_handleDragLeave(e){e.preventDefault(),e.stopPropagation();e.currentTarget.classList.remove("drag-over")}_handleFileDrop(e){var t;e.preventDefault(),e.stopPropagation();e.currentTarget.classList.remove("drag-over");const i=null==(t=e.dataTransfer)?void 0:t.files;i&&i.length>0&&this._readFile(i[0])}_handleFileSelect(e){const t=e.target.files;t&&t.length>0&&this._readFile(t[0])}_readFile(e){if(!e.name.endsWith(".json"))return this.importError="Please select a JSON file",void(this.importData=null);const t=new FileReader;t.onload=e=>{var t;const i=null==(t=e.target)?void 0:t.result;this.importJsonText=i,this._validateJson(i)},t.onerror=()=>{this.importError="Failed to read file",this.importData=null},t.readAsText(e)}_validateJson(e){if(!e.trim())return this.importError=null,void(this.importData=null);try{const t=JSON.parse(e);if("object"!=typeof t||null===t)return this.importError="Invalid JSON: must be an object",void(this.importData=null);if(!t.config||"object"!=typeof t.config)return this.importError='Invalid card data: missing or invalid "config" field',void(this.importData=null);this.importData=t,this.importName=t.name||"",this.importDescription=t.description||"",this.importError=null}catch(t){this.importError=`Invalid JSON: ${t instanceof Error?t.message:"parsing error"}`,this.importData=null}}_handleNameInput(e){const t=e.target;this.importName=t.value}_handleDescriptionInput(e){const t=e.target;this.importDescription=t.value}async _handleConfirmImport(){if(this.importData&&this.cardsService&&this.importName.trim()){this.isImporting=!0;try{await this.cardsService.createCard({name:this.importName.trim(),description:this.importDescription.trim(),config:this.importData.config}),this._handleCloseImport(),await this._loadCards()}catch(e){console.error("Failed to import card:",e),this.importError=`Failed to import card: ${e instanceof Error?e.message:"unknown error"}`}finally{this.isImporting=!1}}}_handleEdit(e){this.router.navigate(oa.EDITOR_EDIT,{id:e})}_handleDeleteClick(e){this.deleteConfirmId=e}_cancelDelete(){this.deleteConfirmId=null}async _confirmDelete(){if(this.cardsService&&this.deleteConfirmId)try{await this.cardsService.deleteCard(this.deleteConfirmId),this.deleteConfirmId=null,await this._loadCards()}catch(e){console.error("Failed to delete card:",e),this.error="Failed to delete card. Please try again.",this.deleteConfirmId=null}}};ka.styles=t`
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

        .migrate-button {
            display: inline-flex;
            align-items: center;
            padding: 6px 10px;
            border: 1px solid var(--warning-color);
            border-radius: 6px;
            background: transparent;
            color: var(--warning-color);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease, opacity 0.2s ease;
            font-family: inherit;
        }

        .migrate-button:hover {
            background: rgba(255, 152, 0, 0.15);
        }

        .migrate-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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

        .empty-state ha-icon {
            --mdc-icon-size: 48px;
            margin-bottom: 16px;
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
            box-shadow: 0 11px 15px -7px rgba(0, 0, 0, .2), 0 24px 38px 3px rgba(0, 0, 0, .14), 0 9px 46px 8px rgba(0, 0, 0, .12);
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

        .file-upload-area ha-icon {
            --mdc-icon-size: 64px;
            display: block;
            margin-bottom: 16px;
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
    `,_a([i({attribute:!1})],ka.prototype,"hass",2),_a([n()],ka.prototype,"cards",2),_a([n()],ka.prototype,"filteredCards",2),_a([n()],ka.prototype,"loading",2),_a([n()],ka.prototype,"searchQuery",2),_a([n()],ka.prototype,"sortColumn",2),_a([n()],ka.prototype,"sortDirection",2),_a([n()],ka.prototype,"currentPage",2),_a([n()],ka.prototype,"pageSize",2),_a([n()],ka.prototype,"deleteConfirmId",2),_a([n()],ka.prototype,"error",2),_a([n()],ka.prototype,"showImportDialog",2),_a([n()],ka.prototype,"importMethod",2),_a([n()],ka.prototype,"importJsonText",2),_a([n()],ka.prototype,"importData",2),_a([n()],ka.prototype,"importError",2),_a([n()],ka.prototype,"importName",2),_a([n()],ka.prototype,"importDescription",2),_a([n()],ka.prototype,"isImporting",2),_a([n()],ka.prototype,"migratingCardIds",2),ka=_a([a("cards-list-view")],ka);var wa=Object.defineProperty,$a=Object.getOwnPropertyDescriptor,Sa=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?$a(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&wa(t,i,a),a};let Ca=class extends o{constructor(){super(...arguments),this.cardName="Untitled Card",this.cardDescription="",this.loading=!1,this.saving=!1,this.isDirty=!1,this.migrationRequired=!1,this.migrationInProgress=!1,this.error=null,this.router=sa(),this.pendingMigrationConfig=null}connectedCallback(){super.connectedCallback(),this.hass&&(this.cardsService=le(this.hass),this.cardId?this._loadCard():this._clearDocumentModel())}disconnectedCallback(){super.disconnectedCallback(),this.configChangeListener&&this.builderRef&&this.builderRef.removeEventListener("config-changed",this.configChangeListener),this._clearDocumentModel()}updated(e){e.has("hass")&&this.hass&&!this.cardsService&&(this.cardsService=le(this.hass),this.cardId&&this._loadCard()),e.has("cardId")&&(this.cardId?this._loadCard():(this.cardName="Untitled Card",this.cardDescription="",this.isDirty=!1,this.migrationRequired=!1,this.pendingMigrationConfig=null,this._clearDocumentModel()))}firstUpdated(){this.configChangeListener=e=>{"load"!==e.detail.action&&this._markDirty()},this.builderRef&&this.builderRef.addEventListener("config-changed",this.configChangeListener)}render(){return r`
      ${this.error?this._renderError():""}
      ${this._renderHeader()}
      <div class="builder-container">
        <builder-main
          .theme=${this._getTheme()}
          .hass=${this.hass}
        ></builder-main>
        ${this.loading?this._renderLoading():""}
        ${this.migrationRequired?this._renderMigrationOverlay():""}
      </div>
    `}_renderHeader(){return r`
      <div class="editor-header">
        <button class="back-button" @click=${this._handleBack} title="Back to cards">
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>

        <input type="text"
          class="name-input ${this.isDirty?"dirty":""}"
          .value=${this.cardName}
          @input=${this._handleNameChange}
          placeholder="Card name"
          ?disabled=${this.migrationRequired}
        />

        <div class="header-actions">
          ${this.isDirty?r`<div class="dirty-indicator" title="Unsaved changes"></div>`:""}
          
          <button
            class="save-button"
            @click=${this._handleSave}
            ?disabled=${this.saving||!this.isDirty||this.migrationRequired}
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
              <ha-icon icon="mdi:close"></ha-icon>
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
    `}_renderMigrationOverlay(){return r`
      <div class="migration-overlay">
        <div class="migration-content">
          <h3 class="migration-title">Migration Required</h3>
          <div class="migration-text">
            This card uses an older data format and must be migrated before it can be edited.
          </div>
          <div class="migration-version">
            Current version: v${this.pendingMigrationConfig.version||"unknown"} -> Target version: v${ce}
          </div>
          <div class="migration-actions">
            <button
              class="primary-button"
              @click=${this._handleMigrateCard}
              ?disabled=${this.migrationInProgress}
            >
              ${this.migrationInProgress?"Migrating...":"Migrate Card"}
            </button>
          </div>
        </div>
      </div>
    `}_getTheme(){var e,t;return(null==(t=null==(e=this.hass)?void 0:e.themes)?void 0:t.darkMode)?"dark":"light"}async _loadCard(){if(this.cardId&&this.cardsService){this.loading=!0,this.error=null,this.migrationRequired=!1,this.pendingMigrationConfig=null;try{const e=await this.cardsService.getCard(this.cardId);if(e){if(this.cardName=e.name,this.cardDescription=e.description,this.isDirty=!1,de(e.config))return this.migrationRequired=!0,this.pendingMigrationConfig=e.config,void this._clearDocumentModel();await this.updateComplete,this.builderRef&&"function"==typeof this.builderRef.loadConfig&&this.builderRef.loadConfig(e.config)}else this.error="Card not found",this.router.navigate(oa.CARDS)}catch(e){console.error("Failed to load card:",e),this.error="Failed to load card. Please try again."}finally{this.loading=!1}}}async _handleMigrateCard(){if(this.cardId&&this.cardsService&&this.pendingMigrationConfig){this.migrationInProgress=!0,this.error=null;try{const{config:e}=re(this.pendingMigrationConfig);await this.cardsService.updateCard(this.cardId,{config:e}),this.migrationRequired=!1,this.pendingMigrationConfig=null,await this._loadCard()}catch(e){console.error("Failed to migrate card:",e),this.error="Failed to migrate card. Please try again."}finally{this.migrationInProgress=!1}}}async _handleSave(){if(this.cardsService&&!this.saving&&!this.migrationRequired){this.saving=!0,this.error=null;try{const e=this._getConfigFromBuilder();if(this.cardId)await this.cardsService.updateCard(this.cardId,{name:this.cardName,description:this.cardDescription,config:e});else{const t=await this.cardsService.createCard({name:this.cardName,description:this.cardDescription,config:e});this.router.navigate(oa.EDITOR_EDIT,{id:t.id}),this.cardId=t.id}this.isDirty=!1}catch(e){console.error("Failed to save card:",e),this.error="Failed to save card. Please try again."}finally{this.saving=!1}}}_getConfigFromBuilder(){return this.builderRef&&"function"==typeof this.builderRef.exportConfig?this.builderRef.exportConfig():{}}_handleNameChange(e){const t=e.target;this.cardName=t.value,this._markDirty()}_markDirty(){this.isDirty||(this.isDirty=!0)}_handleBack(){this.isDirty?this._showUnsavedChangesDialog():this.router.navigate(oa.CARDS)}_handleClose(){this.isDirty?this._showUnsavedChangesDialog():this.router.navigate(oa.CARDS)}_showUnsavedChangesDialog(){confirm("You have unsaved changes. Are you sure you want to leave?")&&this.router.navigate(oa.CARDS)}_clearDocumentModel(){this.builderRef&&"function"==typeof this.builderRef.clearDocument&&this.builderRef.clearDocument()}};Ca.styles=t`
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

    .migration-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 110;
    }

    .migration-content {
      background: var(--card-background-color);
      padding: 28px;
      border-radius: 10px;
      max-width: 520px;
      width: 90%;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .migration-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin: 0;
    }

    .migration-text {
      color: var(--primary-text-color);
      line-height: 1.5;
      font-size: 14px;
    }

    .migration-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .migration-version {
      font-size: 12px;
      color: var(--secondary-text-color);
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
  `,Sa([i({attribute:!1})],Ca.prototype,"hass",2),Sa([i({type:String})],Ca.prototype,"cardId",2),Sa([n()],Ca.prototype,"cardName",2),Sa([n()],Ca.prototype,"cardDescription",2),Sa([n()],Ca.prototype,"loading",2),Sa([n()],Ca.prototype,"saving",2),Sa([n()],Ca.prototype,"isDirty",2),Sa([n()],Ca.prototype,"migrationRequired",2),Sa([n()],Ca.prototype,"migrationInProgress",2),Sa([n()],Ca.prototype,"error",2),Sa([d("builder-main")],Ca.prototype,"builderRef",2),Ca=Sa([a("editor-view")],Ca);var Ea=Object.defineProperty,Ia=Object.getOwnPropertyDescriptor,Pa=(e,t,i,o)=>{for(var r,a=o>1?void 0:o?Ia(t,i):t,s=e.length-1;s>=0;s--)(r=e[s])&&(a=(o?r(t,i,a):r(a))||a);return o&&a&&Ea(t,i,a),a};let Ba=class extends o{constructor(){super(...arguments),this.narrow=!1,this._isReady=!1,this._loadedHAComponents=!1,this._currentRoute=oa.DASHBOARD,this._routeParams={},this._isFullscreen=!1,this._router=sa(),this._originalDrawerWidth=null}async connectedCallback(){super.connectedCallback(),await this._initialize(),this._loadFullscreenPreference(),this._router.addEventListener("route-changed",this._handleRouteChanged.bind(this));const{route:e,params:t}=this._router.getCurrentRoute();this._currentRoute=e,this._routeParams=t}render(){if(!this.hass||!this._isReady)return r`
        <div class="panel-container">
          <div class="loading">
            <div class="loading-content">
              <div class="spinner"></div>
              <div>Loading Card Builder...</div>
            </div>
          </div>
        </div>
      `;const e=[oa.EDITOR_CREATE,oa.EDITOR_EDIT].includes(this._currentRoute);return r`
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
    `}async firstUpdated(e){super.firstUpdated(e),await this._loadHAComponents()}async _loadHAComponents(){this._loadedHAComponents||(customElements.get("ha-selector")||(await window.loadFragment("ha-selector"),customElements.get("ha-selector")||console.warn("Unable to load custom element: ha-selector.")),this._loadedHAComponents=!0)}async updated(e){if(super.updated(e),e.has("hass")&&this.hass&&await this._loadHAComponents(),e.has("narrow")){if(this.narrow&&this._isFullscreen)return void(this._isFullscreen=!1);this._applyFullscreen()}e.has("_isFullscreen")&&this._applyFullscreen()}async _initialize(){await this._waitForHass(),await this.hass.loadFragmentTranslation("lovelace"),await this.hass.loadBackendTranslation("services"),this._isReady=!0}async _waitForHass(){return new Promise(e=>{if(this.hass)return void e();const t=()=>{this.hass?e():setTimeout(t,50)};t()})}_loadFullscreenPreference(){if(!this.narrow){"true"===localStorage.getItem(Ba.FULLSCREEN_STORAGE_KEY)&&(this._isFullscreen=!0,this._applyFullscreen())}}_applyFullscreen(){this._isFullscreen&&!this.narrow?this._hideHASidebar():this._showHASidebar()}_hideHASidebar(){const e=document.querySelector("home-assistant");if(null==e?void 0:e.shadowRoot){const t=e.shadowRoot.querySelector("home-assistant-main");if(null==t?void 0:t.shadowRoot){const e=t.shadowRoot.querySelector("ha-drawer");if(e){const t=getComputedStyle(e).getPropertyValue("--mdc-drawer-width");null===this._originalDrawerWidth&&t&&(this._originalDrawerWidth=t.trim()),e.style.setProperty("--mdc-drawer-width","0px")}}}}_showHASidebar(){const e=document.querySelector("home-assistant");if(null==e?void 0:e.shadowRoot){const t=e.shadowRoot.querySelector("home-assistant-main");if(null==t?void 0:t.shadowRoot){const e=t.shadowRoot.querySelector("ha-drawer");e&&null!==this._originalDrawerWidth&&(e.style.setProperty("--mdc-drawer-width",this._originalDrawerWidth),this._originalDrawerWidth=null)}}}_toggleFullscreen(){this.narrow||(this._isFullscreen=!this._isFullscreen,localStorage.setItem(Ba.FULLSCREEN_STORAGE_KEY,String(this._isFullscreen)))}_exitToDefaultDashboard(){window.location.href="/"}_handleRouteChanged(e){const t=e;this._currentRoute=t.detail.route,this._routeParams=t.detail.params}_handleNavigate(e){const{route:t}=e.detail;this._router.navigate(t)}_renderCurrentView(){switch(this._currentRoute){case oa.DASHBOARD:return r`<dashboard-view .hass=${this.hass}></dashboard-view>`;case oa.CARDS:return r`<cards-list-view .hass=${this.hass}></cards-list-view>`;case oa.EDITOR_CREATE:return r`<editor-view .hass=${this.hass}></editor-view>`;case oa.EDITOR_EDIT:return r`<editor-view .hass=${this.hass} .cardId=${this._routeParams.id}></editor-view>`;default:return r`<dashboard-view .hass=${this.hass}></dashboard-view>`}}};Ba.styles=t`
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
  `,Ba.FULLSCREEN_STORAGE_KEY="card-builder-fullscreen",Pa([i({attribute:!1})],Ba.prototype,"hass",2),Pa([i({attribute:!1})],Ba.prototype,"narrow",2),Pa([i({attribute:!1})],Ba.prototype,"route",2),Pa([i({attribute:!1})],Ba.prototype,"panel",2),Pa([n()],Ba.prototype,"_isReady",2),Pa([n()],Ba.prototype,"_loadedHAComponents",2),Pa([n()],Ba.prototype,"_currentRoute",2),Pa([n()],Ba.prototype,"_routeParams",2),Pa([n()],Ba.prototype,"_isFullscreen",2),Ba=Pa([a("card-builder-panel")],Ba),ci.boot();