/**
 * Position System - Unified positioning system with anchor points and unit conversion
 *
 * This system provides a clean abstraction for positioning elements with different
 * anchor points and unit systems (px or %), while Moveable always works with top/left in px.
 *
 * Key Concepts:
 * - Container: The parent element (canvas or other container)
 * - Element: The positioned element with its own dimensions
 * - Anchor Point: Reference point on the container (9 positions: TL, TC, TR, ML, MC, MR, BL, BC, BR)
 * - Origin Point: Reference point on the element (defaults to anchor point, or custom)
 * - Unit System: px (pixels) or % (percentage of container)
 * - Moveable Space: Always uses top/left in px (absolute coordinates from container's top-left)
 */

export type AnchorPoint =
    | 'top-left' | 'top-center' | 'top-right'
    | 'middle-left' | 'middle-center' | 'middle-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type UnitSystem = 'px' | '%';

export interface Dimensions {
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

/**
 * Position Configuration - Saved in document
 * Contains all data needed to reconstruct the position
 */
export interface PositionConfig {
    x: number; // Value in the unit system (px or %)
    y: number; // Value in the unit system (px or %)
    anchor: AnchorPoint;
    unitSystem: UnitSystem; // 'px' or '%' - defaults to 'px' if not specified
    originPoint: AnchorPoint; // Origin point on element - defaults to anchor if not specified
}

/**
 * Runtime Position Parameters - Runtime only, never saved
 * Contains runtime dimensions needed to create PositionSystem instances
 */
export interface PositionRuntimeParams {
    /** Container dimensions (canvas or parent element) - runtime only */
    containerSize: Dimensions;
    /** Element dimensions - runtime only */
    elementSize: Dimensions;
    /** Anchor point on the container */
    anchorPoint: AnchorPoint;
    /** Origin point on the element (defaults to anchor point) */
    originPoint: AnchorPoint;
    /** Unit system: px or % */
    unitSystem: UnitSystem;
}

/**
 * Position Data - Intermediate format for conversions
 */
export interface PositionData {
    /** X coordinate in the configured unit system */
    x: number;
    /** Y coordinate in the configured unit system */
    y: number;
    /** Anchor point used */
    anchorPoint: AnchorPoint;
    /** Origin point used */
    originPoint: AnchorPoint;
    /** Unit system used */
    unitSystem: UnitSystem;
}

/**
 * Get the anchor point coordinates on a rectangle
 */
function getAnchorCoordinates(anchor: AnchorPoint, size: Dimensions): Point {
    const {width, height} = size;

    switch (anchor) {
        case 'top-left':
            return {x: 0, y: 0};
        case 'top-center':
            return {x: width / 2, y: 0};
        case 'top-right':
            return {x: width, y: 0};
        case 'middle-left':
            return {x: 0, y: height / 2};
        case 'middle-center':
            return {x: width / 2, y: height / 2};
        case 'middle-right':
            return {x: width, y: height / 2};
        case 'bottom-left':
            return {x: 0, y: height};
        case 'bottom-center':
            return {x: width / 2, y: height};
        case 'bottom-right':
            return {x: width, y: height};
    }
}

/**
 * Position System Class
 *
 * Handles all conversions between:
 * - Moveable space (top/left in px)
 * - User space (anchor point + unit system)
 */
export class PositionSystem {
    private config: PositionRuntimeParams;

    constructor(config: PositionRuntimeParams) {
        this.config = config;
    }

    /**
     * Update configuration (e.g., when container or element size changes)
     */
    updateConfig(config: Partial<PositionRuntimeParams>): void {
        this.config = {...this.config, ...config};
    }

    /**
     * Convert from user space (anchor + units) to Moveable space (top/left px)
     *
     * This is used when we need to position the element in the DOM or with Moveable
     */
    toMoveableSpace(position: PositionData): Point {
        const {anchorPoint, originPoint, unitSystem, x, y} = position;

        // Step 1: Convert user units to pixels if needed
        let xPx = x;
        let yPx = y;

        if (unitSystem === '%') {
            xPx = (x / 100) * this.config.containerSize.width;
            yPx = (y / 100) * this.config.containerSize.height;
        }

        // Step 1.5: For right/bottom anchors, the user provides positive distances
        // but we need to invert them for the calculation
        if (anchorPoint.includes('right')) {
            xPx = -xPx;
        }
        if (anchorPoint.includes('bottom')) {
            yPx = -yPx;
        }

        // Step 2: Get anchor point on container
        const containerAnchor = getAnchorCoordinates(anchorPoint, this.config.containerSize);
        // Step 3: Get origin point on element
        const elementOrigin = getAnchorCoordinates(originPoint, this.config.elementSize);
        // Step 4: Calculate absolute top/left position
        // Position = containerAnchor + userOffset - elementOrigin
        const absoluteX = containerAnchor.x + xPx - elementOrigin.x;
        const absoluteY = containerAnchor.y + yPx - elementOrigin.y;

        // NOTE: Don't round here! This causes 1px drift when converting back and forth.
        // Rounding happens in fromMoveableSpace when saving to positionConfig.
        // Here we need to preserve exact pixel values to avoid accumulating rounding errors.
        return {x: absoluteX, y: absoluteY};
    }

    /**
     * Convert from Moveable space (top/left px) to user space (anchor + units)
     *
     * This is used when Moveable updates the position and we need to save it
     */
    fromMoveableSpace(absolutePos: Point): PositionData {
        const {anchorPoint, originPoint, unitSystem} = this.config;

        // Step 1: Get anchor point on container
        const containerAnchor = getAnchorCoordinates(originPoint, this.config.containerSize);
        // Step 2: Get origin point on element
        const elementOrigin = getAnchorCoordinates(originPoint, this.config.elementSize);
        // Step 3: Calculate offset from anchor in pixels
        // userOffset = absolutePosition - containerAnchor + elementOrigin
        let offsetXPx = absolutePos.x - containerAnchor.x + elementOrigin.x;
        let offsetYPx = absolutePos.y - containerAnchor.y + elementOrigin.y;
        // Step 3.5: For right/bottom anchors, invert the offset so it's always a positive distance
        // This makes the UI more intuitive: values are always "distance from anchor point"
        if (anchorPoint.includes('right')) {
            offsetXPx = -offsetXPx;
        }
        if (anchorPoint.includes('bottom')) {
            offsetYPx = -offsetYPx;
        }

        // Step 4: Convert to target unit system
        let x = offsetXPx;
        let y = offsetYPx;

        if (unitSystem === '%') {
            x = (offsetXPx / this.config.containerSize.width) * 100;
            y = (offsetYPx / this.config.containerSize.height) * 100;
            // Round to 2 decimal places for percentages
            x = Math.round(x * 100) / 100;
            y = Math.round(y * 100) / 100;
        } else {
            // Round to whole pixels
            x = Math.round(x);
            y = Math.round(y);
        }

        return {x, y, anchorPoint, originPoint, unitSystem};
    }

    /**
     * Convert position data when changing unit system
     * Maintains the same visual position
     */
    convertUnits(position: PositionData, targetUnit: UnitSystem): PositionData {
        if (position.unitSystem === targetUnit) {
            return position;
        }

        // Convert to Moveable space first (absolute px)
        const absolutePos = this.toMoveableSpace(position);

        // Then convert back with new unit system
        const newConfig = {...this.config, unitSystem: targetUnit};
        const tempSystem = new PositionSystem(newConfig);

        return tempSystem.fromMoveableSpace(absolutePos);
    }

    /**
     * Convert position data when changing anchor point
     * Maintains the same visual position
     */
    convertAnchor(position: PositionData, targetAnchor: AnchorPoint, targetOrigin?: AnchorPoint): PositionData {
        // Convert to Moveable space first (absolute px)
        const absolutePos = this.toMoveableSpace(position);

        // Then convert back with new anchor
        const newConfig = {
            ...this.config,
            anchorPoint: targetAnchor,
            originPoint: targetOrigin || targetAnchor,
        };
        const tempSystem = new PositionSystem(newConfig);

        return tempSystem.fromMoveableSpace(absolutePos);
    }

    /**
     * Clamp position to stay within container bounds
     */
    clampToContainer(absolutePos: Point): Point {
        const maxX = this.config.containerSize.width - this.config.elementSize.width;
        const maxY = this.config.containerSize.height - this.config.elementSize.height;

        return {
            x: Math.max(0, Math.min(absolutePos.x, maxX)),
            y: Math.max(0, Math.min(absolutePos.y, maxY))
        };
    }

    /**
     * Get current configuration
     */
    getConfig(): Readonly<PositionRuntimeParams> {
        return {...this.config};
    }
}


