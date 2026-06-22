/**
 * Property Configuration Types
 *
 * Types for the property visibility system that controls
 * which style properties are shown for each block type.
 */

// ============================================================================
// Property Group Types
// ============================================================================

/**
 * Predefined property group identifiers
 */
export type PropertyGroupId =
    | 'layout'      // Display, position, overflow
    | 'size'        // Width, height, min/max
    | 'spacing'     // Margin, padding
    | 'typography'  // Font, text properties
    | 'background'  // Background color, image
    | 'border'      // Border width, style, color, radius
    | 'svg'         // SVG stroke/fill properties
    | 'effects'     // Opacity, shadow, filters
    | 'echart'      // ECharts-specific properties
    | 'flex'        // Flex container and item properties
    | 'animations'; // Block-level animations

/**
 * List of all property groups
 */
export const ALL_PROPERTY_GROUPS: PropertyGroupId[] = [
    'layout',
    'size',
    'spacing',
    'typography',
    'background',
    'border',
    'svg',
    'effects',
    'flex',
    'animations',
];

// ============================================================================
// Panel Preset Types
// ============================================================================

/**
 * Predefined panel presets - common property configurations
 */
export type PanelPreset =
    | 'full'    // All properties
    | 'layout'
    | 'echart_text'
    | 'echart_box'
    | 'echart_stroke'
    | 'echart_fill'
    | 'echart_grid_spacing'
    | 'echart_grid_box'
    | 'echart_series_shape'
    | 'echart_line_area_series'
    | 'echart_bar_series'
    | 'echart_pie_donut_series';

export type StylePropertyInputType =
    | 'default'
    | 'color'
    | 'echart-color'
    | 'text'
    | 'textarea'
    | 'number'
    | 'slider'
    | 'select'
    | 'spacing'
    | 'toggle'
    | 'button-group'
    | 'background-image'
    | 'background-size'
    | 'background-position'
    | 'hint';

export interface StylePropertyEditorConfig {
    input?: StylePropertyInputType;
    label?: string;
    options?: Array<{ label?: string; value: string; icon?: string; tooltip?: string }>;
    [key: string]: unknown;
}

// ============================================================================
// Block Style Configuration
// ============================================================================

/**
 * Style configuration for a block type
 * Defines which properties should be visible in the style panel
 */
export interface BlockStyleConfig {
    /** Use a predefined preset as base */
    preset?: PanelPreset;
    /** Explicitly include these groups */
    groups?: PropertyGroupId[];
    /** Explicitly include these properties (format: "category.property") */
    properties?: string[];
    /** Custom editor configuration by property key (format: "category.property") */
    editors?: Record<string, StylePropertyEditorConfig>;
    /** Exclusions to apply after preset/groups */
    exclude?: {
        /** Groups to exclude */
        groups?: PropertyGroupId[];
        /** Properties to exclude (format: "category.property") */
        properties?: string[];
    };
}

// ============================================================================
// Property Definitions
// ============================================================================

/**
 * Properties in each group
 */
export const GROUP_PROPERTIES: Record<PropertyGroupId, string[]> = {
    layout: [
        'layout.display',
        'layout.show',
        'layout.overflow',
        'layout.overflowX',
        'layout.overflowY',
        'layout.zIndex',
        'layout.positionX',
        'layout.positionY',
    ],
    size: [
        'size.width',
        'size.height',
        'size.minWidth',
        'size.maxWidth',
        'size.minHeight',
        'size.maxHeight',
    ],
    spacing: [
        'spacing.margin',
        'spacing.marginTop',
        'spacing.marginRight',
        'spacing.marginBottom',
        'spacing.marginLeft',
        'spacing.padding',
        'spacing.paddingTop',
        'spacing.paddingRight',
        'spacing.paddingBottom',
        'spacing.paddingLeft',
    ],
    typography: [
        'typography.color',
        'typography.textAlign',
        'typography.fontSize',
        'typography.fontWeight',
        'typography.fontFamily',
        'typography.fontStyle',
        'typography.lineHeight',
        'typography.textTransform',
        'typography.textDecoration',
        'typography.textShadow',
        'typography.letterSpacing',
        'typography.whiteSpace',
    ],
    background: [
        'background.backgroundColor',
        'background.backgroundImage',
        'background.backgroundSize',
        'background.backgroundPosition',
        'background.backgroundRepeat',
        'background.boxShadow',
        'background.backgroundBlendMode',
    ],
    border: [
        'border.borderWidth',
        'border.borderStyle',
        'border.borderColor',
        'border.borderRadius',
        'border.borderTopWidth',
        'border.borderRightWidth',
        'border.borderBottomWidth',
        'border.borderLeftWidth',
        'border.borderTopLeftRadius',
        'border.borderTopRightRadius',
        'border.borderBottomRightRadius',
        'border.borderBottomLeftRadius',
    ],
    svg: [
        'svg.stroke',
        'svg.strokeWidth',
        'svg.strokeLinecap',
        'svg.strokeLinejoin',
        'svg.strokeDasharray',
        'svg.strokeDashoffset',
        'svg.strokeMiterlimit',
        'svg.strokeOpacity',
        'svg.fill',
        'svg.fillOpacity',
    ],
    effects: [
        'effects.opacity',
        'effects.boxShadow',
        'effects.filter',
        'effects.backdropFilter',
        'effects.mixBlendMode',
        'effects.rotate',
    ],
    echart: [
        'echart.lineColor',
        'echart.areaColor',
        'echart.lineWidth',
        'echart.lineSymbol',
        'echart.lineSymbolSize',
        'echart.barColor',
        'echart.barBorderRadius',
        'echart.pieSliceColor',
        'echart.pieSliceBorderRadius',
        'echart.pieLabelShow',
        'echart.pieLabelPosition',
        'echart.pieLabelLineShow',
        'echart.pieLabelLineLength',
        'echart.pieLabelLineLength2',
        'echart.pieLabelLineSmooth',
        'echart.pieLabelLineColor',
        'echart.pieLabelLineWidth',
        'echart.legendIcon',
        'echart.legendIconSize',
    ],
    flex: [
        'flex.flexDirection',
        'flex.flexWrap',
        'flex.justifyContent',
        'flex.alignItems',
        'flex.alignContent',
        'flex.gap',
        'flex.rowGap',
        'flex.columnGap',
        'flex.flexGrow',
        'flex.flexShrink',
        'flex.flexBasis',
        'flex.alignSelf',
        'flex.order',
    ],
    animations: [
        'animations.motion',
    ],
};

// ============================================================================
// Preset Configurations
// ============================================================================

/**
 * Predefined preset configurations
 */
export const PRESET_CONFIGS: Record<PanelPreset, Omit<BlockStyleConfig, 'preset'>> = {
    full: {
        groups: ALL_PROPERTY_GROUPS,
        exclude: {
            groups: ['svg'],
            properties: ['display.show']
        }
    },
    layout: {
        groups: ALL_PROPERTY_GROUPS,
        exclude: {
            properties: [
                'layout.display',
                'flex.rowGap',
                'flex.columnGap'
            ]
        }
    },
    echart_text: {
        properties: [
            'typography.color',
            'typography.fontSize',
            'typography.fontWeight',
            'typography.textAlign',
        ],
        editors: {
            'background.backgroundColor': {input: 'echart-color', label: 'Color'},
            'border.borderColor': {input: 'echart-color', label: 'Color'},
        },
    },
    echart_box: {
        properties: [
            'background.backgroundColor',
            'border.borderColor',
            'border.borderWidth',
        ],
        editors: {
            'background.backgroundColor': {input: 'echart-color', label: 'Color'},
            'border.borderColor': {input: 'echart-color', label: 'Color'},
        },
    },
    echart_stroke: {
        properties: [
            'typography.color',
            'border.borderColor',
            'border.borderWidth',
            'effects.opacity',
        ],
        editors: {
            'background.backgroundColor': {input: 'echart-color', label: 'Color'},
            'border.borderColor': {input: 'echart-color', label: 'Color'},
        },
    },
    echart_fill: {
        properties: [
            'typography.color',
            'border.borderColor',
            'border.borderWidth',
            'effects.opacity',
        ],
        editors: {
            'background.backgroundColor': {input: 'echart-color', label: 'Color'},
            'border.borderColor': {input: 'echart-color', label: 'Color'},
        },
    },
    echart_grid_spacing: {
        properties: [
            'spacing.padding',
            'spacing.paddingTop',
            'spacing.paddingRight',
            'spacing.paddingBottom',
            'spacing.paddingLeft',
        ],
    },
    echart_grid_box: {
        properties: [
            'background.backgroundColor',
            'border.borderColor',
            'border.borderWidth',
        ],
        editors: {
            'background.backgroundColor': {input: 'echart-color', label: 'Color'},
            'border.borderColor': {input: 'echart-color', label: 'Color'},
        },
    },
    echart_series_shape: {
        properties: [
            'border.borderRadius',
            'border.borderColor',
            'border.borderWidth',
        ],
        editors: {
            'border.borderColor': {input: 'echart-color', label: 'Color'},
        },
    },
    echart_line_area_series: {
        properties: [
            'echart.lineColor',
            'echart.lineWidth',
            'echart.lineSymbol',
            'echart.lineSymbolSize',
        ],
        editors: {
            'echart.lineColor': {input: 'echart-color', label: 'Line color'},
            'echart.areaColor': {input: 'echart-color', label: 'Area color'},
        },
    },
    echart_bar_series: {
        properties: [
            'echart.barColor',
            'echart.barBorderRadius',
            'border.borderColor',
            'border.borderWidth',
            'effects.opacity',
        ],
        editors: {
            'echart.barColor': {input: 'echart-color', label: 'Bar color'},
        },
    },
    echart_pie_donut_series: {
        properties: [
            'echart.pieSliceColor',
            'echart.pieSliceBorderRadius',
            'echart.pieLabelShow',
            'echart.pieLabelPosition',
            'echart.pieLabelLineShow',
            'echart.pieLabelLineLength',
            'echart.pieLabelLineLength2',
            'echart.pieLabelLineSmooth',
            'echart.pieLabelLineColor',
            'echart.pieLabelLineWidth',
            'typography.color',
            'typography.fontSize',
            'typography.fontWeight',
            'border.borderColor',
            'border.borderWidth',
            'effects.opacity',
        ],
        editors: {
            'echart.pieSliceColor': {input: 'echart-color', label: 'Slice color'},
            'echart.pieLabelLineColor': {input: 'echart-color', label: 'Label line color'},
            'echart.legendIcon': {input: 'select', label: 'Legend icon'},
            'echart.legendIconSize': {input: 'number', label: 'Icon size'},
        },
    },
};
