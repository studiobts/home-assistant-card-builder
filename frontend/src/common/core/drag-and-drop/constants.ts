/**
 * Drag and Drop Constants
 *
 * Shared constants for the drag-and-drop system.
 */

/**
 * Data attribute used to mark draggable elements.
 * This attribute is used to identify draggable blocks across shadow DOM boundaries.
 */
export const DRAGGABLE_ATTRIBUTE = 'data-dnd-draggable';
export const DRAGGABLE_SELECTOR = `[${DRAGGABLE_ATTRIBUTE}="true"]`;

/**
 * Data attribute used to mark drop target elements (canvases).
 */
export const DROP_TARGET_ATTRIBUTE = 'data-dnd-drop-target';
export const DROP_TARGET_SELECTOR = `[${DROP_TARGET_ATTRIBUTE}="true"]`;
