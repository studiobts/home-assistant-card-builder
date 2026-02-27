/**
 * Find the closest ancestor element matching a selector, traversing shadow DOM boundaries.
 *
 * @param element Starting element
 * @param selector CSS selector to match
 * @returns Matching element or null
 */
export function findClosestInShadowDOM(element: Element | null, selector: string): Element | null {
    if (!element) return null;

    let current: Element | null = element;

    while (current) {
        // Check if current element matches
        if (current.matches?.(selector)) {
            return current;
        }

        // Try to traverse up
        if (current.parentElement) {
            current = current.parentElement;
        } else {
            // We're at the root of a shadow tree, jump to host
            const root = current.getRootNode();
            if (root instanceof ShadowRoot && root.host) {
                current = root.host;
            } else {
                // Reached document root
                break;
            }
        }
    }

    return null;
}

/**
 * Inject CSS styles into a shadow root using adoptedStyleSheets API.
 *
 * @param root Shadow root to inject styles into
 * @param css CSS string
 */
export function injectStylesInShadowRoot(root: ShadowRoot, css: string): void {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);

    // Append to existing stylesheets
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
}

