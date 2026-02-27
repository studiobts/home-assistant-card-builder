/**
 * Shake Animator
 *
 * Provides visual feedback when drag operations are rejected.
 */

import { injectStylesInShadowRoot } from '../utils/shadow-dom';

const SHAKE_CSS = `
@keyframes dnd-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
}

.dnd-shaking {
  animation: dnd-shake 0.4s ease-in-out;
}
`;

export class ShakeAnimator {
    private injectedRoots = new WeakSet<ShadowRoot>();

    /**
     * Play shake animation on an element
     */
    playShake(element: HTMLElement): void {
        // Ensure styles are injected in the element's shadow root
        this._ensureStyles(element);

        // Add shake class
        element.classList.add('dnd-shaking');

        // Remove class after animation completes
        const removeShake = () => {
            element.classList.remove('dnd-shaking');
            element.removeEventListener('animationend', removeShake);
        };

        element.addEventListener('animationend', removeShake);
    }

    /**
     * Cleanup (currently no-op as we use WeakSet)
     */
    destroy(): void {
        // WeakSet will be garbage collected automatically
    }

    /**
     * Ensure animation styles are injected in the appropriate shadow root
     */
    private _ensureStyles(element: HTMLElement): void {
        const root = element.getRootNode();

        if (root instanceof ShadowRoot && !this.injectedRoots.has(root)) {
            injectStylesInShadowRoot(root, SHAKE_CSS);
            this.injectedRoots.add(root);
        } else if (root instanceof Document) {
            // Inject in document head if not in shadow root
            if (!document.getElementById('dnd-shake-styles')) {
                const style = document.createElement('style');
                style.id = 'dnd-shake-styles';
                style.textContent = SHAKE_CSS;
                document.head.appendChild(style);
            }
        }
    }
}

