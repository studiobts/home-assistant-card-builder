/**
 * Drop Indicator Manager
 *
 * Manages visual drop indicators using pragmatic-drag-and-drop hitbox.
 */

import { injectStylesInShadowRoot } from '../utils/shadow-dom';

const INDENT_SIZE = 20; // pixels per nesting level

const INDICATOR_CSS = `
.dnd-drop-indicator {
  position: absolute;
  background: var(--dnd-indicator-color, #0078d4);
  pointer-events: none;
  z-index: 10000;
  border-radius: var(--dnd-indicator-radius, 2px);
  transition: margin-left 0.15s ease-out;
}

.dnd-drop-indicator.dnd-edge-top,
.dnd-drop-indicator.dnd-edge-bottom {
  height: var(--dnd-indicator-width, 2px);
  left: 0;
  right: 0;
}

.dnd-drop-indicator.dnd-edge-top {
  top: -1px;
}

.dnd-drop-indicator.dnd-edge-bottom {
  bottom: -1px;
}

.dnd-drop-indicator.dnd-edge-left,
.dnd-drop-indicator.dnd-edge-right {
  width: var(--dnd-indicator-width, 2px);
  top: 0;
  bottom: 0;
}

.dnd-drop-indicator.dnd-edge-left {
  left: -1px;
}

.dnd-drop-indicator.dnd-edge-right {
  right: -1px;
}

.dnd-drop-indicator-indented {
  box-shadow: 0 0 0 1px rgba(0, 120, 212, 0.3);
}
`;

export class DropIndicatorManager {
    private indicator: HTMLElement | null = null;
    private currentParent: HTMLElement | ShadowRoot | null = null;
    private injectedRoots = new WeakSet<ShadowRoot>();

    /**
     * Show drop indicator at the specified position with optional indent level
     * @param element - Element to show indicator relative to
     * @param edge - Which edge to show indicator on ('top' or 'bottom')
     * @param indentLevel - Optional nesting level for indented indicators (0 = no indent)
     */
    show(element: HTMLElement, edge: 'top' | 'bottom' | 'left' | 'right' | null, indentLevel: number = 0): void {
        if (!edge) {
            this.hide();
            return;
        }

        this._ensureStyles(element);

        // Create indicator if it doesn't exist
        if (!this.indicator) {
            this.indicator = document.createElement('div');
            this.indicator.className = 'dnd-drop-indicator';
        }

        // Update edge class and indented class
        this.indicator.className = `dnd-drop-indicator dnd-edge-${edge}`;
        if (indentLevel > 0) {
            this.indicator.className += ' dnd-drop-indicator-indented';
        }

        // Move indicator to element's parent if needed
        const parent = this._getIndicatorParent(element);

        if (parent && parent !== this.currentParent) {
            if (this.currentParent && this.indicator.parentNode === this.currentParent) {
                this.currentParent.removeChild(this.indicator);
            }
            this.currentParent = parent;
        }

        // Position indicator relative to element
        if (this.currentParent && !this.indicator.parentNode) {
            if (this.currentParent instanceof ShadowRoot) {
                // ShadowRoot doesn't expose parentElement; append is enough since we position absolutely
                this.currentParent.appendChild(this.indicator);
            } else {
                // Insert indicator as sibling to the element
                if (edge === 'top') {
                    this.currentParent.insertBefore(this.indicator, element);
                } else {
                    element.nextSibling ?
                        this.currentParent.insertBefore(this.indicator, element.nextSibling) :
                        this.currentParent.appendChild(this.indicator);
                }
            }
        }

        // Position indicator absolutely relative to element
        const rect = element.getBoundingClientRect();
        const parentRect = this.currentParent instanceof ShadowRoot
            ? this.currentParent.host.getBoundingClientRect()
            : this.currentParent?.getBoundingClientRect();

        if (parentRect) {
            const offsetLeft = rect.left - parentRect.left;
            const offsetTop = rect.top - parentRect.top;

            // Calculate indent offset
            const indentOffset = indentLevel * INDENT_SIZE;

            if (edge === 'top' || edge === 'bottom') {
                this.indicator.style.left = `${offsetLeft + indentOffset}px`;
                this.indicator.style.width = `${rect.width - indentOffset}px`;
                this.indicator.style.top = edge === 'top' ? `${offsetTop}px` : `${offsetTop + rect.height}px`;
            } else {
                this.indicator.style.top = `${offsetTop}px`;
                this.indicator.style.height = `${rect.height}px`;
                this.indicator.style.left = edge === 'left' ? `${offsetLeft}px` : `${offsetLeft + rect.width}px`;
            }
        }
    }

    /**
     * Hide the drop indicator
     */
    hide(): void {
        if (this.indicator && this.indicator.parentNode) {
            this.indicator.parentNode.removeChild(this.indicator);
        }
        this.currentParent = null;
    }

    /**
     * Cleanup
     */
    destroy(): void {
        this.hide();
        this.indicator = null;
    }

    /**
     * Ensure indicator styles are injected in the appropriate shadow root
     */
    private _ensureStyles(element: HTMLElement): void {
        const root = element.getRootNode();

        if (root instanceof ShadowRoot && !this.injectedRoots.has(root)) {
            injectStylesInShadowRoot(root, INDICATOR_CSS);
            this.injectedRoots.add(root);
        } else if (root instanceof Document) {
            // Inject in document head if not in shadow root
            if (!document.getElementById('dnd-indicator-styles')) {
                const style = document.createElement('style');
                style.id = 'dnd-indicator-styles';
                style.textContent = INDICATOR_CSS;
                document.head.appendChild(style);
            }
        }
    }

    private _getIndicatorParent(element: HTMLElement): HTMLElement | ShadowRoot | null {
        if (element.parentElement) {
            return element.parentElement;
        }

        const root = element.getRootNode();
        if (root instanceof ShadowRoot) {
            return root;
        }

        return null;
    }
}

