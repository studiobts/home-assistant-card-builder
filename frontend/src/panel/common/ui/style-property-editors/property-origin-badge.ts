/**
 * PropertyOriginBadge - Display value origin with color coding
 *
 * Shows where a style value comes from in the resolution chain.
 */

import type { ValueOrigin } from '@/common/core/style-resolver/style-resolution-types';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from "lit/directives/unsafe-html.js";

/**
 * Origin configuration for display
 */
interface OriginConfig {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    icon: string;
}

/**
 * Origin display configurations
 */
const ORIGIN_CONFIGS: Record<ValueOrigin, OriginConfig> = {
    'default': {
        label: 'Default',
        shortLabel: 'Default',
        color: '#666',
        bgColor: '#f0f0f0',
        icon: '<ha-icon icon="mdi:circle-outline"></ha-icon>',
    },
    'block-type-default': {
        label: 'Block Default',
        shortLabel: 'Block',
        color: '#0066cc',
        bgColor: '#e6f0ff',
        icon: '<ha-icon icon="mdi:code-brackets"></ha-icon>',
    },
    'canvas-default': {
        label: 'Canvas Default',
        shortLabel: 'Canvas',
        color: '#00a6a6',
        bgColor: '#e6f7f7',
        icon: '<ha-icon icon="mdi:card-outline"></ha-icon>',
    },
    'parent-inherited': {
        label: 'Inherited',
        shortLabel: 'Parent',
        color: '#2e8b2e',
        bgColor: '#e8f5e8',
        icon: '<ha-icon icon="mdi:arrow-collapse-up"></ha-icon>',
    },
    'preset': {
        label: 'Preset',
        shortLabel: 'Preset',
        color: '#7b2d8e',
        bgColor: '#f5e6f8',
        icon: '<ha-icon icon="mdi:presentation"></ha-icon>',
    },
    'preset-fallback': {
        label: 'Preset (fallback)',
        shortLabel: 'Preset',
        color: '#9b5dae',
        bgColor: '#f5e6f8',
        icon: '<ha-icon icon="mdi:presentation"></ha-icon>',
    },
    'inline': {
        label: 'Custom',
        shortLabel: 'Custom',
        color: '#cc6600',
        bgColor: '#fff5e6',
        icon: '<ha-icon icon="mdi:location-enter"></ha-icon>',
    },
    'inline-fallback': {
        label: 'Custom (fallback)',
        shortLabel: 'Fallback',
        color: '#cc9966',
        bgColor: '#fff8f0',
        icon: '<ha-icon icon="mdi:format-wrap-inline"></ha-icon>',
    },
};

/**
 * Property origin badge component
 */
@customElement('property-origin-badge')
export class PropertyOriginBadge extends LitElement {
    static styles = css`
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
  `;
    /** Value origin type */
    @property({type: String}) origin: ValueOrigin = 'default';
    /** Preset name (when origin is preset) */
    @property({type: String}) presetName?: string;
    /** Container name (when origin is fallback) */
    @property({type: String}) originContainer?: string;
    /** Whether to show compact version */
    @property({type: Boolean}) compact = false;
    /** Whether to show tooltip on hover */
    @property({type: Boolean}) showTooltip = true;

    render() {
        const config = this._getConfig();
        const tooltip = this.showTooltip ? this._getTooltip() : undefined;
        const displayLabel = this._getDisplayLabel();

        return html`
      <span
        class="badge ${this.compact ? 'compact' : ''}"
        style="color: ${config.color}; background: ${config.bgColor};"
        data-tooltip=${tooltip || ''}
      >
        <span class="icon">${unsafeHTML(config.icon)}</span>
        <span class="label">${displayLabel}</span>
      </span>
    `;
    }

    private _getConfig(): OriginConfig {
        return ORIGIN_CONFIGS[this.origin] || ORIGIN_CONFIGS['default'];
    }

    private _getTooltip(): string {
        const config = this._getConfig();
        let tooltip = config.label;

        if (this.presetName && (this.origin === 'preset' || this.origin === 'preset-fallback')) {
            tooltip += `: ${this.presetName}`;
        }

        if (this.originContainer && (this.origin === 'inline-fallback' || this.origin === 'preset-fallback')) {
            tooltip += ` (from ${this.originContainer})`;
        }

        return tooltip;
    }

    private _getDisplayLabel(): string {
        const config = this._getConfig();

        // Show preset name if available
        if (this.presetName && (this.origin === 'preset' || this.origin === 'preset-fallback')) {
            return this.presetName;
        }

        // Show container name for fallback
        if (this.originContainer && (this.origin === 'inline-fallback' || this.origin === 'preset-fallback')) {
            return this.originContainer;
        }

        return config.shortLabel;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'property-origin-badge': PropertyOriginBadge;
    }
}
