import { css, LitElement } from 'lit';

/**
 * Base Panel - Common styling and structure for all panels
 * All panels should extend this class for consistent styling
 */
export abstract class PanelBase extends LitElement {
    static styles = [css`
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
    `];
}

