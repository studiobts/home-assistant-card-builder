/**
 * Style Panel - Properties editor using Style Manager components
 *
 * Uses the new style resolution system with container fallback,
 * preset support, and property binding capabilities.
 */

import { getStylePresentsService } from '@/common/api';
import type { BindingValueInputConfig } from '@/common/blocks/core/properties';
import type { BlockPanelTargetStyles } from '@/common/blocks/types';
import {
    type AnchorPoint,
    getStyleLayoutData,
    type PositionConfig,
    PositionSystem,
    resolveAbsolutePositioningSize,
    type StyleLayoutData,
    type UnitSystem
} from '@/common/blocks/core/renderer';
import {
    GROUP_PROPERTIES,
    type PropertyGroupId,
    type StylePropertyEditorConfig,
    type StylePropertyInputType
} from '@/common/blocks/style';
import type { ValueBinding } from '@/common/core/binding';
import { type ContainerManager, containerManagerContext } from '@/common/core/container-manager/container-manager';
import { type EventBus, eventBusContext } from "@/common/core/event-bus";
import {
    type BlockChangeDetail,
    type BlockData,
    type BlockElementRegisteredDetail,
    type BlockPosition,
    type BlockSelectionChangedDetail,
    type BlockSize,
    type BlockUpdatedDetail,
    type DocumentModel,
    documentModelContext
} from '@/common/core/model';
import type { DocumentSlot } from '@/common/core/model/types';
import {
    getDefaultUnitForProperty,
    getUnitsForProperty,
    type StyleResolver,
    styleResolverContext
} from '@/common/core/style-resolver';
import type { ResolvedStyleData, ResolvedValue } from '@/common/core/style-resolver/style-resolution-types';
import type { CSSUnit } from '@/common/types';
import type { ContainerStyleData, StylePreset, StylePropertyValue } from '@/common/types/style-preset';
import { PanelBase } from "@/panel/designer/components";
import { getMediaReferenceName, isManagedMediaReference } from '@/common/media';
import { consume } from "@lit/context";
import type { HomeAssistant } from "custom-card-helpers";
import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { PanelStylesState, type StateChangeDetail } from '@/panel/designer/components/panels/panel-styles/panel-styles-state';

import '@/panel/common/ui/property-editor/property-row'
import '@/panel/common/ui/block-target-selector';
import '@/panel/common/ui/style-presets/style-preset-selector';
import '@/panel/common/ui/style-presets/style-preset-save-dialog';
import '@/panel/common/ui/style-presets/style-presets-manager-dialog';
import '@/panel/designer/components/editors/property-binding-editor/property-binding-editor-overlay';
import '@/panel/designer/components/editors/property-animation-editor/property-animation-editor-overlay';
import { PropertyConfigResolver, type ResolvedPropertyConfig } from '@/panel/designer/components/panels/panel-styles/property-config-resolver';

type BackgroundImageMode = 'none' | 'image' | 'media' | 'gradient' | 'custom';

type LengthValue = { value: number; unit: CSSUnit };
type LengthPair = { x: LengthValue; y: LengthValue };

interface InlineCopyTargetData {
    containers: Record<string, ContainerStyleData>;
}

interface InlineCopyCandidate {
    targets: Record<string, InlineCopyTargetData>;
    targetIds: string[];
    containerIds: string[];
}

interface InlineStyleClipboard {
    sourceBlockId: string;
    sourceBlockType: string;
    data: Record<string, InlineCopyTargetData>;
}

interface InlineStyleApplyUpdate {
    targetId: string;
    containerId: string;
    category: string;
    property: string;
    value: StylePropertyValue;
}

type StyleEditorChangeHandler = (
    value: unknown,
    unit: CSSUnit | undefined,
    event?: CustomEvent
) => void;

type PanelStyleEditorConfig = StylePropertyEditorConfig & {
    input: StylePropertyInputType;
    value?: unknown;
    default?: unknown;
    placeholder?: string;
    rows?: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: CSSUnit;
    units?: CSSUnit[];
    onChange?: StyleEditorChangeHandler;
    afterChange?: StyleEditorChangeHandler;
    text?: string;
};

interface StylePropertyRowConfig {
    label: string;
    editor?: StylePropertyEditorConfig;
    showBindingToggle?: boolean;
    showAnimationToggle?: boolean;
    helperText?: string;
}

const VIRTUAL_PROPERTIES = [
    'layout.show',
    'layout.positionX',
    'layout.positionY',
    'animations.motion',
];

const INLINE_COPY_EXCLUDED_PROPERTIES = new Set([
    'layout.positionX',
    'layout.positionY',
    'layout.zIndex',
    '_internal.position_config',
]);

const BACKGROUND_CUSTOM_VALUE = '__custom__';

const BACKGROUND_IMAGE_OPTIONS = [
    {label: 'None', value: 'none'},
    {label: 'Image URL', value: 'image'},
    {label: 'Media Library', value: 'media'},
    {label: 'Gradient', value: 'gradient'},
    {label: 'Custom', value: 'custom'},
];

const BACKGROUND_REPEAT_OPTIONS = [
    {label: 'Repeat', value: 'repeat'},
    {label: 'No Repeat', value: 'no-repeat'},
    {label: 'Repeat X', value: 'repeat-x'},
    {label: 'Repeat Y', value: 'repeat-y'},
    {label: 'Space', value: 'space'},
    {label: 'Round', value: 'round'},
];

const BACKGROUND_SIZE_OPTIONS = [
    {label: 'Auto', value: 'auto'},
    {label: 'Cover', value: 'cover'},
    {label: 'Contain', value: 'contain'},
    {label: 'Custom', value: BACKGROUND_CUSTOM_VALUE},
];

const BACKGROUND_POSITION_OPTIONS = [
    {label: 'Center', value: 'center'},
    {label: 'Top', value: 'top'},
    {label: 'Bottom', value: 'bottom'},
    {label: 'Left', value: 'left'},
    {label: 'Right', value: 'right'},
    {label: 'Top Left', value: 'top left'},
    {label: 'Top Center', value: 'top center'},
    {label: 'Top Right', value: 'top right'},
    {label: 'Center Left', value: 'center left'},
    {label: 'Center Right', value: 'center right'},
    {label: 'Bottom Left', value: 'bottom left'},
    {label: 'Bottom Center', value: 'bottom center'},
    {label: 'Bottom Right', value: 'bottom right'},
    {label: 'Custom', value: BACKGROUND_CUSTOM_VALUE},
];

const BACKGROUND_POSITION_ALIASES: Record<string, string> = {
    'left top': 'top left',
    'right top': 'top right',
    'left bottom': 'bottom left',
    'right bottom': 'bottom right',
    'left center': 'center left',
    'right center': 'center right',
    'center top': 'top center',
    'center bottom': 'bottom center',
};

const BACKGROUND_BLEND_MODE_OPTIONS = [
    {label: 'Color', value: 'color'},
    {label: 'Color Burn', value: 'color-burn'},
    {label: 'Color Dodge', value: 'color-dodge'},
    {label: 'Darken', value: 'darken'},
    {label: 'Difference', value: 'difference'},
    {label: 'Exclusion', value: 'exclusion'},
    {label: 'Hard Light', value: 'hard-light'},
    {label: 'Hue', value: 'hue'},
    {label: 'Lighten', value: 'lighten'},
    {label: 'Luminosity', value: 'luminosity'},
    {label: 'Multiply', value: 'multiply'},
    {label: 'Normal', value: 'normal'},
    {label: 'Overlay', value: 'overlay'},
    {label: 'Saturation', value: 'saturation'},
    {label: 'Screen', value: 'screen'},
    {label: 'Soft Light', value: 'soft-light'}
];

const BACKGROUND_LENGTH_UNITS: CSSUnit[] = ['%', 'px', 'rem', 'em', 'vw', 'vh'];

const TEXT_TRANSFORM_OPTIONS = [
    {label: 'None', value: 'none'},
    {label: 'Capitalize', value: 'capitalize'},
    {label: 'Uppercase', value: 'uppercase'},
    {label: 'Lowercase', value: 'lowercase'},
];

const TEXT_DECORATION_OPTIONS = [
    {label: 'None', value: 'none'},
    {label: 'Underline', value: 'underline'},
    {label: 'Overline', value: 'overline'},
    {label: 'Line Through', value: 'line-through'},
];

const WHITE_SPACE_OPTIONS = [
    {label: 'Normal', value: 'normal'},
    {label: 'No-Wrap', value: 'nowrap'},
    {label: 'Pre', value: 'pre'},
    {label: 'Pre-Wrap', value: 'pre-wrap'},
    {label: 'Pre-Line', value: 'pre-line'},
    {label: 'Break-Spaces', value: 'break-spaces'},
];

const DISPLAY_OPTIONS = [
    {label: 'Block', value: 'block'},
    {label: 'Flex', value: 'flex'},
    {label: 'Grid', value: 'grid'},
    {label: 'Inline', value: 'inline'},
    {label: 'Inline Block', value: 'inline-block'},
    {label: 'Inline Flex', value: 'inline-flex'},
    {label: 'None', value: 'none'},
];

const SHOW_OPTIONS = [
    {label: 'Yes', value: 'yes'},
    {label: 'No', value: 'no'},
];

const TEXT_ALIGN_OPTIONS = [
    {label: 'Left', value: 'left'},
    {label: 'Center', value: 'center'},
    {label: 'Right', value: 'right'},
    {label: 'Justify', value: 'justify'},
];

const FONT_WEIGHT_OPTIONS = [
    {label: 'Thin (100)', value: '100'},
    {label: 'Light (300)', value: '300'},
    {label: 'Normal (400)', value: '400'},
    {label: 'Medium (500)', value: '500'},
    {label: 'Semi-Bold (600)', value: '600'},
    {label: 'Bold (700)', value: '700'},
    {label: 'Extra-Bold (800)', value: '800'},
];

const FONT_FAMILY_OPTIONS = [
    {label: 'Arial', value: 'Arial, sans-serif'},
    {label: 'Helvetica', value: 'Helvetica, sans-serif'},
    {label: 'Times New Roman', value: '"Times New Roman", serif'},
    {label: 'Georgia', value: 'Georgia, serif'},
    {label: 'Courier New', value: '"Courier New", monospace'},
    {label: 'Verdana', value: 'Verdana, sans-serif'},
];

const BORDER_STYLE_OPTIONS = [
    {label: 'None', value: 'none'},
    {label: 'Solid', value: 'solid'},
    {label: 'Dashed', value: 'dashed'},
    {label: 'Dotted', value: 'dotted'},
    {label: 'Double', value: 'double'},
];

const ECHART_LINE_SYMBOL_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'None', value: 'none'},
    {label: 'Circle', value: 'circle'},
    {label: 'Empty Circle', value: 'emptyCircle'},
    {label: 'Rect', value: 'rect'},
    {label: 'Round Rect', value: 'roundRect'},
    {label: 'Triangle', value: 'triangle'},
    {label: 'Diamond', value: 'diamond'},
    {label: 'Pin', value: 'pin'},
    {label: 'Arrow', value: 'arrow'},
];

const ECHART_LEGEND_ICON_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'None', value: 'none'},
    {label: 'Circle', value: 'circle'},
    {label: 'Rect', value: 'rect'},
    {label: 'Round Rect', value: 'roundRect'},
    {label: 'Triangle', value: 'triangle'},
    {label: 'Diamond', value: 'diamond'},
    {label: 'Pin', value: 'pin'},
    {label: 'Arrow', value: 'arrow'},
];

const ECHART_PIE_LABEL_POSITION_OPTIONS = [
    {label: 'Default', value: ''},
    {label: 'Outside', value: 'outside'},
    {label: 'Inside', value: 'inside'},
    {label: 'Center', value: 'center'},
];

const STROKE_LINECAP_OPTIONS = [
    {label: 'Butt', value: 'butt'},
    {label: 'Round', value: 'round'},
    {label: 'Square', value: 'square'},
];

const STROKE_LINEJOIN_OPTIONS = [
    {label: 'Miter', value: 'miter'},
    {label: 'Round', value: 'round'},
    {label: 'Bevel', value: 'bevel'},
];

const FLEX_DIRECTION_BUTTON_OPTIONS = [
    {
        value: 'row',
        tooltip: 'Row',
        icon: '<ha-icon icon="mdi:transfer-right"></ha-icon>'
    },
    {
        value: 'row-reverse',
        tooltip: 'Row Reverse',
        icon: '<ha-icon icon="mdi:transfer-left"></ha-icon>'
    },
    {
        value: 'column',
        tooltip: 'Column',
        icon: '<ha-icon icon="mdi:transfer-down"></ha-icon>'
    },
    {
        value: 'column-reverse',
        tooltip: 'Column Reverse',
        icon: '<ha-icon icon="mdi:transfer-up"></ha-icon>'
    }
];

const FLEX_JUSTIFY_BUTTON_OPTIONS = [
    {
        value: 'flex-start',
        tooltip: 'Start',
        icon: '<ha-icon icon="mdi:format-horizontal-align-left"></ha-icon>'
    },
    {
        value: 'center',
        tooltip: 'Center',
        icon: '<ha-icon icon="mdi:format-horizontal-align-center"></ha-icon>'
    },
    {
        value: 'flex-end',
        tooltip: 'End',
        icon: '<ha-icon icon="mdi:format-horizontal-align-right"></ha-icon>'
    },
    {
        value: 'space-between',
        tooltip: 'Space Between',
        icon: '<ha-icon icon="mdi:align-horizontal-distribute"></ha-icon>'
    },
    {
        value: 'space-around',
        tooltip: 'Space Around',
        icon: '<div style="rotate: 90deg"><ha-icon icon="mdi:format-align-center"></ha-icon></div>'
    }
];

const FLEX_ALIGN_BUTTON_OPTIONS = [
    {
        value: 'flex-start',
        tooltip: 'Start',
        icon: '<ha-icon icon="mdi:align-vertical-top"></ha-icon>'
    },
    {
        value: 'center',
        tooltip: 'Center',
        icon: '<ha-icon icon="mdi:align-vertical-center"></ha-icon>'
    },
    {
        value: 'flex-end',
        tooltip: 'End',
        icon: '<ha-icon icon="mdi:align-vertical-bottom"></ha-icon>'
    },
    {
        value: 'stretch',
        tooltip: 'Stretch',
        icon: '<ha-icon icon="mdi:stretch-to-page-outline"></ha-icon>'
    }
];

const DEFAULT_STYLE_EDITOR_CONFIGS: Record<string, StylePropertyEditorConfig> = {
    'layout.zIndex': {input: 'number', min: 0, step: 1, default: 0},
    'layout.display': {input: 'select', options: DISPLAY_OPTIONS},
    'layout.show': {input: 'select', options: SHOW_OPTIONS},
    'layout.positionX': {input: 'number', step: 1},
    'layout.positionY': {input: 'number', step: 1},
    'size.width': {input: 'number', min: 1, step: 1, default: 0},
    'size.height': {input: 'number', min: 1, step: 1, default: 0},
    'size.minWidth': {input: 'number', min: 0, step: 1, default: 0},
    'size.maxWidth': {input: 'number', min: 0, step: 1, default: 0},
    'size.minHeight': {input: 'number', min: 0, step: 1, default: 0},
    'size.maxHeight': {input: 'number', min: 0, step: 1, default: 0},
    'spacing.margin': {input: 'spacing'},
    'spacing.padding': {input: 'spacing'},
    'flex.flexDirection': {input: 'button-group', options: FLEX_DIRECTION_BUTTON_OPTIONS},
    'flex.justifyContent': {input: 'button-group', options: FLEX_JUSTIFY_BUTTON_OPTIONS},
    'flex.alignItems': {input: 'button-group', options: FLEX_ALIGN_BUTTON_OPTIONS},
    'flex.rowGap': {input: 'number', min: 0, step: 1, default: 0},
    'flex.columnGap': {input: 'number', min: 0, step: 1, default: 0},
    'typography.color': {input: 'color'},
    'typography.textAlign': {input: 'select', options: TEXT_ALIGN_OPTIONS},
    'typography.fontSize': {input: 'slider', min: 8, max: 72, step: 1, default: 16},
    'typography.fontWeight': {input: 'select', options: FONT_WEIGHT_OPTIONS},
    'typography.fontFamily': {input: 'select', options: FONT_FAMILY_OPTIONS},
    'typography.lineHeight': {input: 'slider', min: 0.5, max: 3, step: 0.1, default: 1.5},
    'typography.textTransform': {input: 'select', options: TEXT_TRANSFORM_OPTIONS},
    'typography.textDecoration': {input: 'select', options: TEXT_DECORATION_OPTIONS},
    'typography.textShadow': {input: 'textarea', rows: 3, placeholder: 'e.g. 2px 2px 4px rgba(0,0,0,0.3)'},
    'typography.letterSpacing': {input: 'slider', min: -2, max: 10, step: 0.1, default: 0},
    'typography.whiteSpace': {input: 'select', options: WHITE_SPACE_OPTIONS},
    'background.backgroundColor': {input: 'color'},
    'background.backgroundImage': {input: 'background-image'},
    'background.backgroundSize': {input: 'background-size'},
    'background.backgroundPosition': {input: 'background-position'},
    'background.backgroundRepeat': {input: 'select', options: BACKGROUND_REPEAT_OPTIONS},
    'background.boxShadow': {input: 'textarea', rows: 3, placeholder: '0 6px 18px rgba(0, 0, 0, 0.2)'},
    'background.backgroundBlendMode': {input: 'select', options: BACKGROUND_BLEND_MODE_OPTIONS},
    'border.borderWidth': {input: 'number', min: 0, step: 1, default: 0},
    'border.borderStyle': {input: 'select', options: BORDER_STYLE_OPTIONS},
    'border.borderColor': {input: 'color'},
    'border.borderRadius': {input: 'number', min: 0, step: 1, default: 0},
    'echart.lineColor': {input: 'echart-color', label: 'Line color'},
    'echart.areaColor': {input: 'echart-color', label: 'Area color'},
    'echart.lineWidth': {input: 'number', min: 0, step: 1, default: 2},
    'echart.lineSymbol': {input: 'select', options: ECHART_LINE_SYMBOL_OPTIONS},
    'echart.lineSymbolSize': {input: 'slider', min: 1, max: 32, step: 1, default: 7},
    'echart.barColor': {input: 'echart-color', label: 'Bar color'},
    'echart.barBorderRadius': {input: 'number', min: 0, step: 1, default: 0},
    'echart.pieSliceColor': {input: 'echart-color', label: 'Slice color'},
    'echart.pieSliceBorderRadius': {input: 'number', min: 0, step: 1, default: 0},
    'echart.pieLabelShow': {input: 'toggle', default: true, labelOn: 'Show', labelOff: 'Hide'},
    'echart.pieLabelPosition': {input: 'select', options: ECHART_PIE_LABEL_POSITION_OPTIONS},
    'echart.pieLabelLineShow': {input: 'toggle', default: true, labelOn: 'Show', labelOff: 'Hide'},
    'echart.pieLabelLineLength': {input: 'number', min: 0, step: 1, default: 15},
    'echart.pieLabelLineLength2': {input: 'number', min: 0, step: 1, default: 15},
    'echart.pieLabelLineSmooth': {input: 'toggle', default: false, labelOn: 'On', labelOff: 'Off'},
    'echart.pieLabelLineColor': {input: 'echart-color', label: 'Label line color'},
    'echart.pieLabelLineWidth': {input: 'number', min: 0, step: 1, default: 1},
    'echart.legendIcon': {input: 'select', label: 'Legend icon', options: ECHART_LEGEND_ICON_OPTIONS},
    'echart.legendIconSize': {input: 'number', label: 'Icon size', min: 0, step: 1, default: 14},
    'svg.stroke': {input: 'color'},
    'svg.strokeWidth': {input: 'number', min: 0, step: 1, default: 0},
    'svg.strokeLinecap': {input: 'select', options: STROKE_LINECAP_OPTIONS},
    'svg.strokeLinejoin': {input: 'select', options: STROKE_LINEJOIN_OPTIONS},
    'svg.strokeDasharray': {input: 'text', placeholder: 'e.g. 8 6'},
    'svg.strokeDashoffset': {input: 'number', step: 1, default: 0},
    'svg.strokeOpacity': {input: 'slider', min: 0, max: 1, step: 0.01, default: 1},
    'svg.fill': {input: 'color'},
    'svg.fillOpacity': {input: 'slider', min: 0, max: 1, step: 0.01, default: 1},
    'svg.strokeMiterlimit': {input: 'number', min: 1, step: 1, default: 1},
    'effects.opacity': {input: 'slider', min: 0, max: 1, step: 0.01, default: 1},
    'effects.rotate': {input: 'slider', min: 0, max: 360, step: 1, default: 0},
    'animations.motion': {input: 'hint', text: 'Use the animation editor to add motion to the block.'},
};

export class PanelStyles extends PanelBase {
    static styles = [
        ...PanelBase.styles,
        css`

        .panel-content {
            padding: 0;
        }

        /* Preset Section */

        .preset-section {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
        }

        .inline-copy-bar {
            padding: 6px 12px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .inline-copy-bar-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: nowrap;
        }

        .inline-copy-label {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .inline-copy-btn {
            padding: 4px 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-radius: 3px;
            cursor: pointer;
        }

        .inline-copy-btn.primary {
            background: var(--accent-color);
            border-color: var(--accent-color);
            color: #fff;
        }

        .inline-copy-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .inline-dialog-overlay {
            position: fixed;
            inset: 0;
            z-index: 220;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
        }

        .inline-dialog {
            width: min(92vw, 520px);
            max-height: 80vh;
            background: var(--bg-primary);
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .inline-dialog-header {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .inline-dialog-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-primary);
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .inline-dialog-body {
            padding: 12px 16px;
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .inline-dialog-footer {
            padding: 10px 16px;
            border-top: 1px solid var(--border-color);
            background: var(--bg-secondary);
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }

        .inline-dialog-message {
            font-size: 12px;
            color: var(--text-primary);
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .inline-dialog-warning {
            border: 1px solid rgba(255, 152, 0, 0.5);
            background: rgba(255, 152, 0, 0.08);
            padding: 10px;
            border-radius: 6px;
        }

        .inline-copy-dialog-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 10px;
        }

        .inline-copy-dialog-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--text-primary);
        }

        .inline-copy-dialog-item small {
            color: var(--text-secondary);
            font-size: 10px;
        }

        .inline-dialog-hint {
            font-size: 11px;
            color: var(--text-secondary);
            background: var(--bg-tertiary);
            border-radius: 4px;
            padding: 6px 8px;
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

        .text-input.textarea-input {
            min-height: 64px;
            line-height: 1.4;
            resize: vertical;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
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
    `];

    @consume({context: documentModelContext})
    documentModel!: DocumentModel;

    @consume({context: containerManagerContext})
    containerManager!: ContainerManager;

    @consume({context: styleResolverContext})
    styleResolver!: StyleResolver;

    @consume({context: eventBusContext})
    eventBus!: EventBus;

    @property({type: Object, attribute: false})
    hass?: HomeAssistant;

    @property({type: Number}) canvasWidth!: number;
    @property({type: Number}) canvasHeight!: number;
    @state() protected selectedBlock: BlockData | null = null;
    @state() protected panelState: PanelStylesState | null = null;
    @state() protected resolvedStyles: ResolvedStyleData = {};
    @state() protected visibleProperties: ResolvedPropertyConfig | null = null;
    @state() protected presets: StylePreset[] = [];
    @state() protected activeTargetId: string | null = null;
    @state() protected slots: DocumentSlot[] = [];
    @state() protected styleClipboard: InlineStyleClipboard | null = null;
    @state() protected copyDialogOpen = false;
    @state() protected copyCandidate: InlineCopyCandidate | null = null;
    @state() protected copySelectedTargets: Set<string> = new Set();
    @state() protected copySelectedContainers: Set<string> = new Set();
    @state() protected copySelectedApplyWarning: {
        conflictCount: number;
        typeMismatch: boolean;
        updates: InlineStyleApplyUpdate[];
    } | null = null;
    // Dialog states
    @state() protected saveDialogOpen = false;
    @state() protected managerDialogOpen = false;
    @state() protected bindingEditorOpen = false;
    @state() protected bindingEditorTarget: { category: string; property: string; label: string } | null = null;
    // Expanded sections
    @state() protected expandedSections: Set<string> = new Set();
    @state() protected backgroundImageMode: BackgroundImageMode = 'none';
    @state() protected pendingMediaRequestId: string | null = null;

    @state() protected animationEditorOpen = false;
    @state() protected animationEditorTarget: { category: string; property: string; label: string } | null = null;

    protected sections: Map<string, () => TemplateResult | typeof nothing> = new Map();
    protected editors: Map<string, () => TemplateResult | typeof nothing> = new Map();
    protected propertyConfigResolver = new PropertyConfigResolver();

    protected computedStyleTarget: Element | null = null;
    protected computedStyle: CSSStyleDeclaration | null = null;

    /**
     * Get the effective default entity ID for bindings.
     * Uses the new entity resolution system from DocumentModel.
     */
    protected get defaultEntityId(): string | undefined {
        if (!this.selectedBlock) return undefined;
        const resolved = this.documentModel.resolveEntityForBlock(this.selectedBlock.id);
        return resolved.entityId;
    }

    constructor() {
        super();

        this.sections.set('layout', () => this._renderLayoutSection());
        this.sections.set('size', () => this._renderSizeSection());
        this.sections.set('spacing', () => this._renderSpacingSection());
        this.sections.set('flex', () => this._renderFlexSection());
        this.sections.set('typography', () => this._renderTypographySection());
        this.sections.set('background', () => this._renderBackgroundSection());
        this.sections.set('border', () => this._renderBorderSection());
        this.sections.set('echart', () => this._renderEchartSection());
        this.sections.set('svg', () => this._renderSvgSection());
        this.sections.set('effects', () => this._renderEffectsSection());
        this.sections.set('animations', () => this._renderAnimationsSection());

        this.editors.set('binding', () => this._renderBindingEditorOverlay());
        this.editors.set('animation', () => this._renderAnimationEditorOverlay());
    }

    async connectedCallback() {
        super.connectedCallback();

        // Initialize panel state with preset service
        await this._initializePanelState();

        // Listen for selection changes
        this.documentModel.addEventListener('selection-changed', (e: Event) => {
            const detail = (e as CustomEvent).detail as BlockSelectionChangedDetail;
            this.handleSelectionChange(detail.selectedBlock);
        });

        this.documentModel.addEventListener('element-registered', (e: Event) => {
            const detail = (e as CustomEvent<BlockElementRegisteredDetail>).detail;
            if (!this.selectedBlock || detail.blockId !== this.selectedBlock.id) return;
            if (this.panelState) {
                this.panelState.handleDocumentChange(detail.blockId);
            }
            this._ensureActiveTargetAvailable();
            this.requestUpdate();
        });

        this.slots = this.documentModel.getSlotEntities();
        this.documentModel.addEventListener('slots-changed', () => {
            this.slots = this.documentModel.getSlotEntities();
            this.requestUpdate();
        });

        // Listen for block updates
        this.documentModel.addEventListener('block-updated', (e: Event) => {
            const detail = (e as CustomEvent<BlockUpdatedDetail>).detail;
            if (!this.selectedBlock || detail.block.id !== this.selectedBlock.id) return;

            this.selectedBlock = {...detail.block};
            if (this.panelState) {
                this.panelState.handleDocumentChange(this.selectedBlock.id);
            }
            this._ensureActiveTargetAvailable();
            this.requestUpdate();
        });

        // Listen for non-update block changes
        this.documentModel.addEventListener('change', (e: Event) => {
            const detail = (e as CustomEvent<BlockChangeDetail>).detail;
            if (detail.action === 'update') return;

            if (this.selectedBlock && detail.block?.id === this.selectedBlock.id) {
                const updatedBlock = this.documentModel.getBlock(this.selectedBlock.id);
                if (updatedBlock) {
                    this.selectedBlock = {...updatedBlock};
                    if (this.panelState) {
                        this.panelState.handleDocumentChange(this.selectedBlock.id);
                    }
                    this._ensureActiveTargetAvailable();
                    this.requestUpdate();
                }
            }
        });

        // FIXME: add event type
        this.eventBus.addEventListener('moveable-change', (data: {
            position: BlockPosition,
            positionConfig: PositionConfig,
            size?: BlockSize
        }) => {
            const {position, positionConfig, size} = data; // TODO: create interface
            const properties = [
                {category: 'layout', property: 'positionX', value: position.x},
                {category: 'layout', property: 'positionY', value: position.y},
                {category: '_internal', property: 'position_config', value: positionConfig},
            ];

            if (size) {
                properties.push({category: 'size', property: 'width', value: size.width});
                properties.push({category: 'size', property: 'height', value: size.height});
            }

            this.panelState!.updateProperties(properties, null);
        });

        this.eventBus.addEventListener('media-manager-selected', (data: {
            requestId: string;
            selection: { reference: string };
        }) => {
            if (!data || data.requestId !== this.pendingMediaRequestId) return;
            this.pendingMediaRequestId = null;
            if (data.selection?.reference) {
                this.backgroundImageMode = 'media';
                this._handlePropertyChange('background', 'backgroundImage', data.selection.reference);
            }
        });

        this.eventBus.addEventListener('media-manager-cancelled', (data: { requestId: string }) => {
            if (!data || data.requestId !== this.pendingMediaRequestId) return;
            this.pendingMediaRequestId = null;
        });

        this.eventBus.addEventListener('style-clipboard-clear', () => {
            this._clearStyleClipboard();
        });
    }

    public openBindingEditor(
        category: string,
        property: string,
        label?: string,
        styleTargetId?: string | null
    ): void {
        if (styleTargetId !== undefined && this.panelState) {
            this.panelState.setActiveTarget(styleTargetId ?? null);
        }
        this.bindingEditorTarget = {
            category,
            property,
            label: label ?? property,
        };
        this.bindingEditorOpen = true;
    }

    render() {
        if (!this.selectedBlock) {
            return html`
                <div class="empty-state">
                    <ha-icon icon="mdi:palette-swatch-variant"></ha-icon>
                    <div>Select an element to edit its styles</div>
                </div>
            `;
        }

        const hasStyleTargets = this._hasStyleTargets(this.selectedBlock);
        const container = this.containerManager.getActiveContainer();
        const containerInfo = !container.width ? 'No width limit' : `Max width: ${container.width}px`;

        return html`
            <!-- Container Indicator -->
            <div class="container-indicator">
                Editing for: <span class="container-name">${container.name} (${containerInfo})</span>
            </div>

            ${this._renderInlineClipboardActions()}

            ${this._renderTargetSelector()}

            <!-- Preset Selector -->
            ${hasStyleTargets ? html`
                <div class="preset-section">
                    <span class="preset-label">Style Preset</span>
                    <preset-selector
                            .presets=${this.presets}
                            .selectedPresetId=${this.panelState?.appliedPresetId}
                            @preset-selected=${this._handlePresetSelected}
                            @create-preset=${this._openSaveDialog}
                            @manage-presets=${this._openManagerDialog}
                    ></preset-selector>
                </div>
            ` : nothing}

            <div class="panel-content">
                ${Array.from(this.sections.values()).map((section) => section())}
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

            ${Array.from(this.editors.values()).map((editor) => editor())}
            ${this._renderCopyDialogOverlay()}
            ${this._renderApplyWarningOverlay()}
        `;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.panelState) {
            this.panelState.dispose();
            this.panelState = null;
        }
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        if (changedProps.has('selectedBlock') || changedProps.has('resolvedStyles') || changedProps.has('activeTargetId')) {
            this._resetComputedStyleCache();
        }

        if (changedProps.has('selectedBlock')) {
            this._updateBackgroundImageMode(true);
            return;
        }

        if (changedProps.has('resolvedStyles')) {
            this._updateBackgroundImageMode(false);
        }
    }

    protected async _initializePanelState(): Promise<void> {
        try {
            const presetService = await getStylePresentsService(this.hass!);

            this.panelState = new PanelStylesState({
                documentModel: this.documentModel,
                presetService,
                styleResolver: this.styleResolver, // Use shared resolver from context
                hass: this.hass,
                initialContainerId: this.containerManager.getActiveContainerId(),
            });

            // Listen for state changes
            this.panelState.addEventListener('state-change', (e: Event) => {
                const detail = (e as CustomEvent<StateChangeDetail>).detail;
                this._handleStateChange(detail);
            });

            // Update local state
            this.resolvedStyles = this.panelState.resolvedStyles;
            this.visibleProperties = this.panelState.visibleProperties;
            this.presets = this.panelState.presets;
            this.activeTargetId = this.panelState.activeTargetId;
        } catch (error) {
            console.error('[PanelStyle] Failed to initialize panel state:', error);
        }
    }

    protected _handleStateChange(detail: StateChangeDetail): void {
        switch (detail.type) {
            case 'styles':
                this.resolvedStyles = this.panelState?.resolvedStyles || {};
                break;
            case 'presets':
                this.presets = this.panelState?.presets || [];
                break;
            case 'properties':
                this.visibleProperties = this.panelState?.visibleProperties || null;
                break;
            case 'selection':
            case 'target':
            case 'container':
                this.resolvedStyles = this.panelState?.resolvedStyles || {};
                this.visibleProperties = this.panelState?.visibleProperties || null;
                this.activeTargetId = this.panelState?.activeTargetId || null;
                break;
        }
        this._ensureActiveTargetAvailable();
        this.requestUpdate();
    }

    protected handleSelectionChange(block?: BlockData) {
        this.copyDialogOpen = false;
        this.copyCandidate = null;
        this.copySelectedApplyWarning = null;

        if (!block) {
            this.selectedBlock = null;
            this._closeBindingEditor(true);
            this._closeAnimationEditor(true);
            if (this.panelState) {
                this.panelState.setSelectedBlock(null);
            }
            return;
        }

        this._closeBindingEditor(true);
        this._closeAnimationEditor(true);
        this.selectedBlock = {...(block || {})};

        if (this.panelState) {
            this.panelState.setSelectedBlock(block.id);
        }

        this._ensureActiveTargetAvailable();
    }

    protected toggleSection(sectionId: string) {
        if (this.expandedSections.has(sectionId)) {
            this.expandedSections.delete(sectionId);
        } else {
            this.expandedSections.add(sectionId);
        }
        this.requestUpdate();
    }

    protected switchLayoutMode(mode: 'absolute' | 'flow') {
        if (!this.selectedBlock || this.selectedBlock.layout === mode) return;
        this.documentModel.updateBlock(this.selectedBlock.id, {layout: mode});
    }

    // =========================================================================
    // Preset Handlers
    // =========================================================================

    protected getContainerDimensions(): { width: number; height: number } {
        if (!this.selectedBlock) {
            return {width: this.canvasWidth, height: this.canvasHeight};
        }

        const size = resolveAbsolutePositioningSize(
            this.selectedBlock,
            this.documentModel,
            {width: this.canvasWidth, height: this.canvasHeight}
        );

        return size ?
            {width: size.width, height: size.height} :
            {width: 0, height: 0};
    }

    protected getLayoutData(): StyleLayoutData | null {
        if (!this.selectedBlock) return null;
        return getStyleLayoutData(this.resolvedStyles);
    }

    protected getRuntimeSize(layoutData: StyleLayoutData): BlockSize {
        if (layoutData.size.width && layoutData.size.height) {
            return layoutData.size;
        }

        const element = this.documentModel.getElement(this.selectedBlock!.id);
        if (!element) return layoutData.size;

        const rect = element.getBlockBoundingClientRect?.() ?? element.getBoundingClientRect();
        return {width: rect.width, height: rect.height};
    }

    protected getCurrentMoveablePosition(
        layoutData: StyleLayoutData,
        containerSize: {width: number; height: number},
        elementSize: BlockSize
    ): BlockPosition {
        const currentConfig = layoutData.positionConfig;

        if (currentConfig.unitSystem === 'px') {
            return layoutData.position;
        }

        const system = new PositionSystem({
            containerSize,
            elementSize,
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: currentConfig.unitSystem
        });

        const absolutePos = system.toMoveableSpace({
            x: currentConfig.x,
            y: currentConfig.y,
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: currentConfig.unitSystem
        });

        return {x: absolutePos.x, y: absolutePos.y};
    }

    protected applyPositionUpdate(position: BlockPosition, positionConfig: PositionConfig): void {
        if (!this.panelState) return;

        this.panelState.updateProperties([
            {category: 'layout', property: 'positionX', value: position.x},
            {category: 'layout', property: 'positionY', value: position.y},
            {category: '_internal', property: 'position_config', value: positionConfig},
        ], null);
    }

    protected _handlePresetSelected(e: CustomEvent): void {
        const {presetId} = e.detail;
        if (this.panelState) {
            this.panelState.applyPreset(presetId);
        }
    }

    protected _openSaveDialog(): void {
        this.saveDialogOpen = true;
    }

    protected _closeSaveDialog(): void {
        this.saveDialogOpen = false;
    }

    protected async _handleSavePreset(e: CustomEvent): Promise<void> {
        const {input} = e.detail;
        if (this.panelState) {
            try {
                await this.panelState.createPreset(
                    input.name,
                    input.description,
                    input.extendsPresetId
                );
                this._closeSaveDialog();
            } catch (error) {
                console.error('[PanelStyle] Failed to save preset:', error);
            }
        }
    }

    // =========================================================================
    // Property Handlers
    // =========================================================================

    protected _openManagerDialog(): void {
        this.managerDialogOpen = true;
    }

    protected _closeManagerDialog(): void {
        this.managerDialogOpen = false;
    }

    protected _handleEditPreset(e: CustomEvent): void {
        // TODO: Open edit dialog
        console.log('Edit preset:', e.detail.presetId);
    }

    protected async _handleDeletePreset(e: CustomEvent): Promise<void> {
        const {presetId} = e.detail;
        if (this.panelState) {
            try {
                await this.panelState.deletePreset(presetId);
            } catch (error) {
                console.error('[PanelStyle] Failed to delete preset:', error);
            }
        }
    }

    // =========================================================================
    // Inline Copy/Paste
    // =========================================================================

    protected _renderInlineClipboardActions(): TemplateResult | typeof nothing {
        if (!this.selectedBlock) return nothing;

        const candidate = this._getInlineCopyCandidate(this.selectedBlock);
        const canCopy = Boolean(candidate);
        const canApply = Boolean(
            this.styleClipboard
            && this.selectedBlock
            && this.styleClipboard.sourceBlockId !== this.selectedBlock.id
        );

        return html`
            <div class="inline-copy-bar">
                <div class="inline-copy-bar-actions">
                    <button class="inline-copy-btn" ?disabled=${!canCopy} @click=${this._handleCopyClick}>
                        Copy inline styles
                    </button>
                    ${canApply ? html`
                        <button class="inline-copy-btn primary" @click=${this._handleApplyClipboardClick}>
                            Apply copied styles
                        </button>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    protected _renderCopyDialogOverlay(): TemplateResult | typeof nothing {
        if (!this.copyDialogOpen || !this.copyCandidate || !this.selectedBlock) return nothing;

        const targetStyles = this._getTargetStyles(this.selectedBlock);
        const containerMap = new Map(this.containerManager.getContainers().map((container) => [container.id, container.name]));
        const targetOptions = this.copyCandidate.targetIds.map((targetId) => {
            if (targetId === 'block') {
                return {
                    id: targetId,
                    label: targetStyles?.block?.label ?? 'Block',
                    description: targetStyles?.block?.description,
                };
            }
            return {
                id: targetId,
                label: targetStyles?.[targetId]?.label ?? targetId,
                description: targetStyles?.[targetId]?.description,
            };
        });
        const containerOptions = this.copyCandidate.containerIds.map((containerId) => ({
            id: containerId,
            label: containerMap.get(containerId) ?? containerId,
        }));

        const canConfirm = this._hasCopySelectionData(
            this.copyCandidate,
            this.copySelectedTargets,
            this.copySelectedContainers
        );

        return html`
            <div class="inline-dialog-overlay" @click=${this._closeCopyDialog}>
                <div class="inline-dialog" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="inline-dialog-header">
                        <div class="inline-dialog-title">Copy inline styles</div>
                        <button class="inline-copy-btn" @click=${this._closeCopyDialog}>
                            Close
                        </button>
                    </div>
                    <div class="inline-dialog-body">
                        <div>
                            <div class="inline-copy-label">Style targets</div>
                            <div class="inline-copy-dialog-grid">
                                ${targetOptions.map((option) => html`
                                    <label class="inline-copy-dialog-item">
                                        <input
                                            type="checkbox"
                                            .checked=${this.copySelectedTargets.has(option.id)}
                                            @change=${(e: Event) => this._toggleCopyTarget(option.id, e)}
                                        />
                                        <span>${option.label}</span>
                                        ${option.description ? html`<small>${option.description}</small>` : nothing}
                                    </label>
                                `)}
                            </div>
                        </div>
                        <div>
                            <div class="inline-copy-label">Containers</div>
                            <div class="inline-copy-dialog-grid">
                                ${containerOptions.map((option) => html`
                                    <label class="inline-copy-dialog-item">
                                        <input
                                            type="checkbox"
                                            .checked=${this.copySelectedContainers.has(option.id)}
                                            @change=${(e: Event) => this._toggleCopyContainer(option.id, e)}
                                        />
                                        <span>${option.label}</span>
                                    </label>
                                `)}
                            </div>
                        </div>
                        ${!canConfirm ? html`
                            <div class="inline-dialog-hint">
                                No inline styles match this target/container combination.
                            </div>
                        ` : nothing}
                    </div>
                    <div class="inline-dialog-footer">
                        <button class="inline-copy-btn" @click=${this._closeCopyDialog}>Cancel</button>
                        <button class="inline-copy-btn primary" ?disabled=${!canConfirm} @click=${this._confirmCopyDialog}>
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    protected _renderApplyWarningOverlay(): TemplateResult | typeof nothing {
        if (!this.copySelectedApplyWarning) return nothing;

        const conflictMessage = this.copySelectedApplyWarning.conflictCount > 0
            ? `${this.copySelectedApplyWarning.conflictCount} inline ${this.copySelectedApplyWarning.conflictCount === 1 ? 'property' : 'properties'} would be overwritten.`
            : null;
        const typeMessage = this.copySelectedApplyWarning.typeMismatch
            ? 'The destination block type is different. Some styles may not apply as expected.'
            : null;
        const applyLabel = this.copySelectedApplyWarning.conflictCount > 0 ? 'Overwrite all' : 'Apply styles';

        return html`
            <div class="inline-dialog-overlay" @click=${this._cancelApplyWarning}>
                <div class="inline-dialog" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="inline-dialog-header">
                        <div class="inline-dialog-title">Apply copied styles</div>
                        <button class="inline-copy-btn" @click=${this._cancelApplyWarning}>
                            Close
                        </button>
                    </div>
                    <div class="inline-dialog-body">
                        <strong>Warning: There are potential issues to address.</strong>
                        ${typeMessage ? html`
                            <div class="inline-dialog-message inline-dialog-warning">
                                <div>${typeMessage}</div>
                            </div>
                        ` : nothing}
                        ${conflictMessage ? html`
                            <div class="inline-dialog-message inline-dialog-warning">
                                <div>${conflictMessage}</div>
                            </div>
                        ` : nothing}
                    </div>
                    <div class="inline-dialog-footer">
                        <button class="inline-copy-btn" @click=${this._cancelApplyWarning}>Cancel</button>
                        ${this.copySelectedApplyWarning.conflictCount > 0 ? html`
                            <button class="inline-copy-btn" @click=${this._confirmApplyWithoutOverwrite}>
                                Copy non-conflicting
                            </button>
                        ` : nothing}
                        <button class="inline-copy-btn primary" @click=${this._confirmApplyOverwrite}>
                            ${applyLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    protected _handleCopyClick = (): void => {
        if (!this.selectedBlock) return;
        const candidate = this._getInlineCopyCandidate(this.selectedBlock);
        if (!candidate) return;

        const needsSelection = candidate.targetIds.length > 1 || candidate.containerIds.length > 1;
        if (!needsSelection) {
            this._setClipboardFromSelection(candidate, new Set(candidate.targetIds), new Set(candidate.containerIds));
            return;
        }

        this.copyCandidate = candidate;
        this._initializeCopySelection(candidate);
        this.copyDialogOpen = true;
    };

    protected _initializeCopySelection(candidate: InlineCopyCandidate): void {
        const nextTargets = new Set<string>();
        const nextContainers = new Set<string>();

        const activeTarget = this.activeTargetId ?? 'block';
        if (candidate.targetIds.includes(activeTarget)) {
            nextTargets.add(activeTarget);
        } else if (candidate.targetIds.length > 0) {
            nextTargets.add(candidate.targetIds[0]);
        }

        const activeContainer = this.containerManager.getActiveContainerId();
        if (candidate.containerIds.includes(activeContainer)) {
            nextContainers.add(activeContainer);
        } else if (candidate.containerIds.length > 0) {
            nextContainers.add(candidate.containerIds[0]);
        }

        this.copySelectedTargets = nextTargets;
        this.copySelectedContainers = nextContainers;
    }

    protected _toggleCopyTarget(targetId: string, e: Event): void {
        const checked = (e.target as HTMLInputElement).checked;
        const nextTargets = new Set(this.copySelectedTargets);
        checked ? nextTargets.add(targetId) : nextTargets.delete(targetId);
        this.copySelectedTargets = nextTargets;
    }

    protected _toggleCopyContainer(containerId: string, e: Event): void {
        const checked = (e.target as HTMLInputElement).checked;
        const nextContainers = new Set(this.copySelectedContainers);
        checked ? nextContainers.add(containerId) : nextContainers.delete(containerId);
        this.copySelectedContainers = nextContainers;
    }

    protected _hasCopySelectionData(
        candidate: InlineCopyCandidate,
        targets: Set<string>,
        containers: Set<string>
    ): boolean {
        for (const targetId of targets) {
            const targetData = candidate.targets[targetId];
            if (!targetData) continue;
            for (const containerId of containers) {
                if (targetData.containers[containerId]) {
                    return true;
                }
            }
        }
        return false;
    }

    protected _confirmCopyDialog = (): void => {
        if (!this.copyCandidate) return;
        this._setClipboardFromSelection(this.copyCandidate, this.copySelectedTargets, this.copySelectedContainers);
        this._closeCopyDialog();
    };

    protected _closeCopyDialog = (): void => {
        this.copyDialogOpen = false;
        this.copyCandidate = null;
    };

    protected _setClipboardFromSelection(
        candidate: InlineCopyCandidate,
        selectedTargets: Set<string>,
        selectedContainers: Set<string>
    ): void {
        if (!this.selectedBlock) return;

        const data: Record<string, InlineCopyTargetData> = {};
        for (const targetId of selectedTargets) {
            const targetData = candidate.targets[targetId];
            if (!targetData) continue;

            const containers: Record<string, ContainerStyleData> = {};
            for (const containerId of selectedContainers) {
                const containerStyles = targetData.containers[containerId];
                if (!containerStyles) continue;
                containers[containerId] = this._cloneContainerStyleData(containerStyles);
            }

            if (Object.keys(containers).length > 0) {
                data[targetId] = {containers};
            }
        }

        if (Object.keys(data).length === 0) {
            return;
        }

        this.styleClipboard = {
            sourceBlockId: this.selectedBlock.id,
            sourceBlockType: this.selectedBlock.type,
            data,
        };
        this._emitClipboardChanged();
    }

    protected _handleApplyClipboardClick = (): void => {
        if (!this.selectedBlock || !this.styleClipboard) return;
        if (this.styleClipboard.sourceBlockId === this.selectedBlock.id) return;

        const {updates, conflictCount} = this._buildApplyUpdates(this.selectedBlock, this.styleClipboard);
        if (updates.length === 0) return;

        const typeMismatch = this.selectedBlock.type !== this.styleClipboard.sourceBlockType;

        if (conflictCount > 0 || typeMismatch) {
            this.copySelectedApplyWarning = {
                conflictCount,
                typeMismatch,
                updates,
            };
            return;
        }

        this._applyClipboardUpdates(updates, false);
    };

    protected _confirmApplyOverwrite = (): void => {
        if (!this.copySelectedApplyWarning) return;
        this._applyClipboardUpdates(this.copySelectedApplyWarning.updates, false);
        this.copySelectedApplyWarning = null;
    };

    protected _confirmApplyWithoutOverwrite = (): void => {
        if (!this.copySelectedApplyWarning) return;
        this._applyClipboardUpdates(this.copySelectedApplyWarning.updates, true);
        this.copySelectedApplyWarning = null;
    };

    protected _cancelApplyWarning = (): void => {
        this.copySelectedApplyWarning = null;
    };

    protected _applyClipboardUpdates(updates: InlineStyleApplyUpdate[], skipExisting: boolean): void {
        if (!this.panelState) return;

        this.panelState.applyInlineOverrides(
            updates.map((update) => ({
                category: update.category,
                property: update.property,
                value: update.value,
                targetId: update.targetId,
                containerId: update.containerId,
            })),
            {skipExisting}
        );
    }

    protected _buildApplyUpdates(
        block: BlockData,
        clipboard: InlineStyleClipboard
    ): { updates: InlineStyleApplyUpdate[]; conflictCount: number } {
        const updates: InlineStyleApplyUpdate[] = [];
        let conflictCount = 0;

        const targetStyles = this._getTargetStyles(block);
        const targetExists = (targetId: string): boolean => {
            if (!targetStyles) {
                return targetId === 'block';
            }
            return Boolean(targetStyles[targetId]);
        };

        for (const [targetId, targetData] of Object.entries(clipboard.data)) {
            if (!targetExists(targetId)) continue;
            for (const [containerId, containerStyles] of Object.entries(targetData.containers)) {
                for (const [category, properties] of Object.entries(containerStyles)) {
                    if (!properties) continue;
                    for (const [property, value] of Object.entries(properties)) {
                        if (
                            block.styles?.[targetId]?.containers?.[containerId]?.[category]?.[property]
                            !== undefined
                        ) {
                            conflictCount += 1;
                        }
                        updates.push({
                            targetId,
                            containerId,
                            category,
                            property,
                            value: value as StylePropertyValue,
                        });
                    }
                }
            }
        }

        return {updates, conflictCount};
    }

    protected _emitClipboardChanged(): void {
        this.eventBus?.dispatchEvent('style-clipboard-changed', {
            hasClipboard: Boolean(this.styleClipboard),
        });
    }

    protected _clearStyleClipboard(): void {
        this.styleClipboard = null;
        this.copyDialogOpen = false;
        this.copyCandidate = null;
        this.copySelectedApplyWarning = null;
        this._emitClipboardChanged();
    }

    protected _handlePropertyChange(
        category: string,
        property: string,
        value: unknown,
        unit?: CSSUnit
    ): void {
        if (this.panelState) {
            this.panelState.updateProperty(category, property, value, unit);
        }
    }

    protected _handleBindingChange(
        category: string,
        property: string,
        binding: ValueBinding | null,
        unit?: CSSUnit
    ): void {
        if (this.panelState) {
            this.panelState.updateBinding(category, property, binding, unit);
        }
    }

    protected _handleBindingEdit(e: CustomEvent): void {
        const {category, property, label} = e.detail;
        this.bindingEditorTarget = {category, property, label};
        this.bindingEditorOpen = true;
    }

    protected _closeBindingEditor(clearTarget = false): void {
        this.bindingEditorOpen = false;
        if (clearTarget) {
            this.bindingEditorTarget = null;
        }
    }

    // =========================================================================
    // Legacy property update (for layout/position)
    // =========================================================================

    protected _handlePropertyReset(category: string, property: string): void {
        if (this.panelState) {
            this.panelState.resetProperty(category, property);
        }
    }

    protected updateLegacyProperty(property: string, detail: { value: any, unit?: CSSUnit }) {
        // FIXME: this method must be removed when position system is fully migrated to panel state
        if (!this.selectedBlock) return;

        const value = detail.value;
        const numValue = typeof value === 'number' ? value : parseFloat(value);

        if (property === 'layout') {
            this.documentModel.updateBlock(this.selectedBlock.id, {layout: value as 'absolute' | 'flow'});
        } else if (property === 'zIndex') {
            this.documentModel.updateBlock(this.selectedBlock.id, {zIndex: isNaN(numValue) ? 0 : numValue});
        }
    }

    protected _handleTargetChange(e: CustomEvent): void {
        const value = e.detail.value as string;
        const nextTargetId = value === '__block__' ? null : value;
        if (this.panelState) {
            this.panelState.setActiveTarget(nextTargetId);
        }
    }

    protected _getTargetStyles(block: BlockData | null): BlockPanelTargetStyles | null {
        if (!block) return null;
        const element = this.documentModel.getElement(block.id);
        const panelConfig = element?.getPanelConfig();
        return panelConfig?.targetStyles ?? null;
    }

    protected _getAvailableTargetDefs(block: BlockData | null): BlockPanelTargetStyles | null {
        const targetStyles = this._getTargetStyles(block);
        if (!targetStyles) return null;
        const filtered = Object.fromEntries(
            Object.entries(targetStyles).filter(([targetId]) => targetId !== 'block')
        );
        return Object.keys(filtered).length > 0 ? filtered : null;
    }

    protected _hasStyleTargets(block: BlockData | null): boolean {
        const targetStyles = this._getTargetStyles(block);
        return !!targetStyles && Object.keys(targetStyles).length > 0;
    }

    // =========================================================================
    // Render Methods
    // =========================================================================

    protected _ensureActiveTargetAvailable(): void {
        if (!this.selectedBlock) return;

        const targetStyles = this._getTargetStyles(this.selectedBlock);
        if (!targetStyles || Object.keys(targetStyles).length === 0) {
            if (this.activeTargetId !== null) {
                this.panelState?.setActiveTarget(null);
            }
            return;
        }

        const hasBlockTarget = Boolean(targetStyles.block);
        const targetIds = Object.keys(targetStyles).filter((targetId) => targetId !== 'block');

        if (this.activeTargetId && !targetStyles[this.activeTargetId]) {
            if (hasBlockTarget) {
                this.panelState?.setActiveTarget(null);
            } else if (targetIds.length > 0) {
                this.panelState?.setActiveTarget(targetIds[0]);
            }
            return;
        }

        if (!this.activeTargetId && !hasBlockTarget && targetIds.length > 0) {
            this.panelState?.setActiveTarget(targetIds[0]);
        }
    }

    protected _renderTargetSelector() {
        if (!this.selectedBlock) return nothing;

        const targetStyles = this._getTargetStyles(this.selectedBlock);
        const targetDefs = this._getAvailableTargetDefs(this.selectedBlock);
        if (!targetStyles || !targetDefs) {
            return nothing;
        }

        const hasBlockTarget = Boolean(targetStyles.block);

        const options = [
            ...(hasBlockTarget ? [{
                label: targetStyles.block?.label ?? 'Block',
                value: '__block__',
                description: targetStyles.block?.description,
            }] : []),
            ...Object.entries(targetDefs).map(([targetId, target]) => ({
                label: target.label ?? targetId,
                value: targetId,
                description: target.description,
            })),
        ];

        const selectedValue =
            this.activeTargetId && targetStyles[this.activeTargetId]
                ? this.activeTargetId
                : (hasBlockTarget ? '__block__' : Object.keys(targetDefs)[0]);
        const activeTarget =
            selectedValue === '__block__'
                ? targetStyles.block ?? null
                : targetDefs[selectedValue] ?? null;

        return html`
            <div class="target-section">
                <span class="target-label">Style target</span>
                <block-target-selector
                        .value=${selectedValue}
                        .options=${options}
                        @change=${this._handleTargetChange}
                ></block-target-selector>
                ${activeTarget?.description ? html`
                    <div class="target-description">${activeTarget.description}</div>
                ` : nothing}
            </div>
        `;
    }

    protected _renderLayoutSection() {
        if (!this.selectedBlock) return nothing;
        if (!this._isSectionVisible('layout')) return nothing;

        const isExpanded = this.expandedSections.has('layout');
        const layoutMode = this._renderLayoutMode();

        return html`
            ${layoutMode}
            <!-- Layout Properties Section -->
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('layout')}>
                    <span class="section-title">
                        <span>Layout</span>
                        ${this._sectionHasInlineOverrides('layout') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this.selectedBlock.layout === 'absolute' ? this._renderAbsolutePositionInputs() : nothing}
                    ${this._renderPropertyRow('layout', 'zIndex', {
                        label: 'Z-Index',
                        editor: {
                            value: this._getUserValue('layout', 'zIndex', this.selectedBlock.zIndex || 0),
                            afterChange: (_value: unknown, _unit: CSSUnit | undefined, event?: CustomEvent) =>
                                this.updateLegacyProperty('zIndex', event?.detail),
                        },
                    })}

                    ${this._renderPropertyRow('layout', 'display', {
                        label: 'Display',
                        helperText: this._getCurrentValueText('layout', 'display'),
                    })}
                    ${this._renderPropertyRow('layout', 'show', {
                        label: 'Show',
                    })}
                </div>
            </div>
        `;
    }

    protected _renderLayoutMode() {
        const layoutMode = this.documentModel.canChangeLayoutMode(this.selectedBlock!.id);
        return layoutMode ? html`
            <!-- Layout Mode Toggle (no binding) -->
            <div class="layout-mode-container">
                <div class="layout-mode-label">Layout Mode</div>
                <div class="layout-mode-toggle" data-mode="${this.selectedBlock!.layout}">
                    <div class="layout-mode-slider"></div>
                    <div
                        class="layout-mode-option ${this.selectedBlock!.layout === 'flow' ? 'active' : ''}"
                        @click=${() => this.switchLayoutMode('flow')}
                    >
                        <ha-icon icon="mdi:format-align-left"></ha-icon>
                        <span>Flow</span>
                    </div>
                    <div
                        class="layout-mode-option ${this.selectedBlock!.layout === 'absolute' ? 'active' : ''}"
                        @click=${() => this.switchLayoutMode('absolute')}
                    >
                        <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
                        <span>Absolute</span>
                    </div>
                </div>
            </div>
        ` : nothing;
    }

    protected _renderAbsolutePositionInputs() {
        const layoutData = this.getLayoutData();
        if (!layoutData) return nothing;
        if (this.selectedBlock?.layout !== 'absolute') return nothing;

        const positionConfig = layoutData.positionConfig;

        return html`
            <!-- Position Mode (no binding) -->
            <sm-toggle-input
                    label="Position Mode"
                    labelOn="Responsive"
                    labelOff="Static"
                    .value=${positionConfig.unitSystem === '%'}
                    @change=${(e: CustomEvent) => this._handlePositionModeChange(e)}
            ></sm-toggle-input>

            <!-- Anchor Point (no binding) -->
            <sm-anchor-selector
                    label="Anchor Point"
                    .value=${positionConfig.anchor}
                    @change=${(e: CustomEvent) => this._handleAnchorChange(e)}
            ></sm-anchor-selector>

            ${this._renderPropertyRow('layout', 'positionX', {
                label: 'X',
                editor: {
                    value: this._getPositionDisplayValue('x', positionConfig),
                    unit: positionConfig.unitSystem,
                    units: [positionConfig.unitSystem],
                    afterChange: (value: unknown) => this._handlePositionChange('x', Number(value)),
                },
            })}
            ${this._renderPropertyRow('layout', 'positionY', {
                label: 'Y',
                editor: {
                    value: this._getPositionDisplayValue('y', positionConfig),
                    unit: positionConfig.unitSystem,
                    units: [positionConfig.unitSystem],
                    afterChange: (value: unknown) => this._handlePositionChange('y', Number(value)),
                },
            })}
        `;
    }

    protected _handlePositionModeChange(e: CustomEvent): void {
        const layoutData = this.getLayoutData();
        if (!layoutData) return;

        const targetUnit: UnitSystem = e.detail.value ? '%' : 'px';
        const currentConfig = layoutData.positionConfig;
        const containerSize = this.getContainerDimensions();
        const elementSize = this.getRuntimeSize(layoutData);
        const absolutePos = this.getCurrentMoveablePosition(layoutData, containerSize, elementSize);

        const system = new PositionSystem({
            containerSize,
            elementSize,
            anchorPoint: currentConfig.anchor,
            originPoint: currentConfig.originPoint,
            unitSystem: targetUnit
        });

        const newData = system.fromMoveableSpace(absolutePos);

        this.applyPositionUpdate(
            {x: Math.round(absolutePos.x), y: Math.round(absolutePos.y)},
            {
                anchor: newData.anchorPoint,
                x: newData.x,
                y: newData.y,
                unitSystem: newData.unitSystem,
                originPoint: newData.originPoint ?? newData.anchorPoint,
            }
        );
    }

    protected _handleAnchorChange(e: CustomEvent): void {
        const layoutData = this.getLayoutData();
        if (!layoutData) return;

        const newAnchor = e.detail.value as AnchorPoint;
        const currentConfig = layoutData.positionConfig;

        if (newAnchor === currentConfig.anchor) return;

        const containerSize = this.getContainerDimensions();
        const elementSize = this.getRuntimeSize(layoutData);
        const absolutePos = this.getCurrentMoveablePosition(layoutData, containerSize, elementSize);

        const system = new PositionSystem({
            containerSize,
            elementSize,
            anchorPoint: newAnchor,
            originPoint: newAnchor,
            unitSystem: currentConfig.unitSystem
        });

        const newData = system.fromMoveableSpace(absolutePos);

        this.applyPositionUpdate(
            {x: Math.round(absolutePos.x), y: Math.round(absolutePos.y)},
            {
                x: newData.x,
                y: newData.y,
                anchor: newData.anchorPoint,
                originPoint: newData.originPoint ?? newData.anchorPoint,
                unitSystem: currentConfig.unitSystem,
            }
        );
    }

    protected _handlePositionChange(axis: 'x' | 'y', value: number): void {
        const layoutData = this.getLayoutData();
        if (!layoutData) return;

        const newConfig = {
            ...layoutData.positionConfig,
            [axis]: value
        };

        const containerSize = this.getContainerDimensions();
        const elementSize = this.getRuntimeSize(layoutData);

        const system = new PositionSystem({
            containerSize,
            elementSize,
            anchorPoint: newConfig.anchor,
            originPoint: newConfig.originPoint,
            unitSystem: newConfig.unitSystem
        });

        const absolutePos = system.toMoveableSpace({
            x: newConfig.x,
            y: newConfig.y,
            anchorPoint: newConfig.anchor,
            originPoint: newConfig.originPoint,
            unitSystem: newConfig.unitSystem
        });

        this.applyPositionUpdate({x: absolutePos.x, y: absolutePos.y}, newConfig);
    }

    protected _renderFlexSection() {
        if (!this.selectedBlock) return nothing;
        if (!this._isSectionVisible('flex')) return nothing;

        // const layout = this.resolvedStyles.layout || {};
        // if (layout.display !== 'flex') return nothing;

        const isExpanded = this.expandedSections.has('flex');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('flex')}>
                    <span class="section-title">
                        <span>Arrangement</span>
                        ${this._sectionHasInlineOverrides('flex') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('flex', 'flexDirection', {
                        label: 'Direction',
                        helperText: this._getCurrentValueText('flex', 'flexDirection'),
                    })}

                    ${this._renderPropertyRow('flex', 'justifyContent', {
                        label: 'Justify Content',
                        helperText: this._getCurrentValueText('flex', 'justifyContent'),
                    })}

                    ${this._renderPropertyRow('flex', 'alignItems', {
                        label: 'Align Items',
                        helperText: this._getCurrentValueText('flex', 'alignItems'),
                    })}

                    <div class="property-grid">
                        ${this._renderPropertyRow('flex', 'rowGap', {label: 'Row Gap'})}
                        ${this._renderPropertyRow('flex', 'columnGap', {label: 'Column Gap'})}
                    </div>
                </div>
            </div>
        `;
    }

    protected _renderSizeSection() {
        if (!this.selectedBlock) return nothing;
        if (!this._isSectionVisible('size')) return nothing;

        // const size = this.resolvedStyles.size || {};
        // const layoutData = this.getLayoutData();
        // const runtimeSize = layoutData ? this.getRuntimeSize(layoutData) : {width: 0, height: 0};

        const isExpanded = this.expandedSections.has('size');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('size')}>
                    <span class="section-title">
                        <span>Size</span>
                        ${this._sectionHasInlineOverrides('size') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('size', 'width', {label: 'Width'})}
                    ${this._renderPropertyRow('size', 'height', {label: 'Height'})}
                    ${this._renderPropertyRow('size', 'minWidth', {label: 'Min Width'})}
                    ${this._renderPropertyRow('size', 'maxWidth', {label: 'Max Width'})}
                    ${this._renderPropertyRow('size', 'minHeight', {label: 'Min Height'})}
                    ${this._renderPropertyRow('size', 'maxHeight', {label: 'Max Height'})}
                </div>
            </div>
        `;
    }

    protected _renderSpacingSection() {
        if (!this._isSectionVisible('spacing')) return nothing;

        const isExpanded = this.expandedSections.has('spacing');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('spacing')}>
                    <span class="section-title">
                        <span>Spacing</span>
                        ${this._sectionHasInlineOverrides('spacing') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('spacing', 'margin', {
                        label: 'Margin',
                        helperText: this._getCurrentValueText('spacing', 'margin'),
                    })}
                    ${this._renderPropertyRow('spacing', 'padding', {
                        label: 'Padding',
                        helperText: this._getCurrentValueText('spacing', 'padding'),
                    })}
                </div>
            </div>
        `;
    }

    protected _renderTypographySection() {
        if (!this._isSectionVisible('typography')) return nothing;

        const isExpanded = this.expandedSections.has('typography');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('typography')}>
                    <span class="section-title">
                        <span>Typography</span>
                        ${this._sectionHasInlineOverrides('typography') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('typography', 'color', {
                        label: 'Text Color',
                        helperText: this._getCurrentValueText('typography', 'color'),
                    })}
                    ${this._renderPropertyRow('typography', 'textAlign', {
                        label: 'Text Align',
                        helperText: this._getCurrentValueText('typography', 'textAlign'),
                    })}
                    ${this._renderPropertyRow('typography', 'fontSize', {label: 'Font Size'})}
                    ${this._renderPropertyRow('typography', 'fontWeight', {
                        label: 'Font Weight',
                        helperText: this._getCurrentValueText('typography', 'fontWeight'),
                    })}
                    ${this._renderPropertyRow('typography', 'fontFamily', {
                        label: 'Font Family',
                        helperText: this._getCurrentValueText('typography', 'fontFamily'),
                    })}
                    ${this._renderPropertyRow('typography', 'lineHeight', {label: 'Line Height'})}
                    ${this._renderPropertyRow('typography', 'textTransform', {
                        label: 'Text Transform',
                        helperText: this._getCurrentValueText('typography', 'textTransform'),
                    })}
                    ${this._renderPropertyRow('typography', 'textDecoration', {
                        label: 'Text Decoration',
                        helperText: this._getCurrentValueText('typography', 'textDecoration'),
                    })}
                    ${this._renderPropertyRow('typography', 'textShadow', {label: 'Text Shadow'})}
                    ${this._renderPropertyRow('typography', 'letterSpacing', {label: 'Letter Spacing'})}
                    ${this._renderPropertyRow('typography', 'whiteSpace', {
                        label: 'White Space',
                        helperText: this._getCurrentValueText('typography', 'whiteSpace'),
                    })}
                </div>
            </div>
        `;
    }

    protected _renderBackgroundSection() {
        if (!this._isSectionVisible('background')) return nothing;

        const isExpanded = this.expandedSections.has('background');
        const backgroundImageValue = String(this._getResolvedValue(this.resolvedStyles.background?.backgroundImage, ''));
        const backgroundImageMode = backgroundImageValue ? this._getBackgroundImageMode(backgroundImageValue) : this.backgroundImageMode;
        const backgroundImageHelperText = backgroundImageMode === 'image' || backgroundImageMode === 'gradient' || backgroundImageMode === 'custom' ? undefined : this._getCurrentValueText('background', 'backgroundImage');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('background')}>
                    <span class="section-title">
                        <span>Background</span>
                        ${this._sectionHasInlineOverrides('background') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('background', 'backgroundColor', {
                        label: 'Background Color',
                        helperText: this._getCurrentValueText('background', 'backgroundColor'),
                    })}
                    ${this._renderPropertyRow('background', 'backgroundImage', {
                        label: 'Background Image',
                        helperText: backgroundImageHelperText,
                    })}
                    ${this._renderPropertyRow('background', 'backgroundSize', {
                        label: 'Background Size',
                        helperText: this._getCurrentValueText('background', 'backgroundSize'),
                    })}
                    ${this._renderPropertyRow('background', 'backgroundPosition', {
                        label: 'Background Position',
                        helperText: this._getCurrentValueText('background', 'backgroundPosition'),
                    })}
                    ${this._renderPropertyRow('background', 'backgroundRepeat', {
                        label: 'Background Repeat',
                        helperText: this._getCurrentValueText('background', 'backgroundRepeat'),
                    })}
                    ${this._renderPropertyRow('background', 'boxShadow', {label: 'Box Shadow'})}
                    ${this._renderPropertyRow('background', 'backgroundBlendMode', {
                        label: 'Background Blend Mode',
                        helperText: this._getCurrentValueText('background', 'backgroundBlendMode'),
                    })}
                </div>
            </div>
        `;
    }

    protected _renderBorderSection() {
        if (!this._isSectionVisible('border')) return nothing;

        const isExpanded = this.expandedSections.has('border');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('border')}>
                    <span class="section-title">
                        <span>Border</span>
                        ${this._sectionHasInlineOverrides('border') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('border', 'borderWidth', {label: 'Border Width'})}
                    ${this._renderPropertyRow('border', 'borderStyle', {
                        label: 'Border Style',
                        helperText: this._getCurrentValueText('border', 'borderStyle'),
                    })}
                    ${this._renderPropertyRow('border', 'borderColor', {
                        label: 'Border Color',
                        helperText: this._getCurrentValueText('border', 'borderColor'),
                    })}
                    ${this._renderPropertyRow('border', 'borderRadius', {label: 'Border Radius'})}
                </div>
            </div>
        `;
    }

    protected _renderEchartSection() {
        if (!this._isSectionVisible('echart')) return nothing;

        const isExpanded = this.expandedSections.has('echart');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('echart')}>
                    <span class="section-title">
                        <span>Chart</span>
                        ${this._sectionHasInlineOverrides('echart') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('echart', 'lineColor', {
                        label: 'Line color',
                        helperText: this._getCurrentValueText('echart', 'lineColor'),
                    })}
                    ${this._renderPropertyRow('echart', 'areaColor', {
                        label: 'Area color',
                        helperText: this._getCurrentValueText('echart', 'areaColor'),
                    })}
                    ${this._renderPropertyRow('echart', 'lineWidth', {
                        label: 'Line width',
                    })}
                    ${this._renderPropertyRow('echart', 'lineSymbol', {
                        label: 'Line symbol',
                        helperText: this._getCurrentValueText('echart', 'lineSymbol'),
                    })}
                    ${this._renderPropertyRow('echart', 'lineSymbolSize', {
                        label: 'Line symbol size',
                    })}
                    ${this._renderPropertyRow('echart', 'barColor', {
                        label: 'Bar color',
                        helperText: this._getCurrentValueText('echart', 'barColor'),
                    })}
                    ${this._renderPropertyRow('echart', 'barBorderRadius', {
                        label: 'Bar border radius',
                    })}
                    ${this._renderPropertyRow('echart', 'pieSliceColor', {
                        label: 'Slice color',
                        helperText: this._getCurrentValueText('echart', 'pieSliceColor'),
                    })}
                    ${this._renderPropertyRow('echart', 'pieSliceBorderRadius', {
                        label: 'Slice border radius',
                    })}
                    ${this._renderPropertyRow('echart', 'pieLabelShow', {
                        label: 'Label',
                    })}
                    ${this._renderPropertyRow('echart', 'pieLabelPosition', {
                        label: 'Label position',
                        helperText: this._getCurrentValueText('echart', 'pieLabelPosition'),
                    })}
                    ${this._renderPropertyRow('echart', 'pieLabelLineShow', {
                        label: 'Label line',
                    })}
                    ${this._renderPropertyRow('echart', 'pieLabelLineLength', {
                        label: 'Label line length',
                    })}
                    ${this._renderPropertyRow('echart', 'pieLabelLineLength2', {
                        label: 'Label line length 2',
                    })}
                    ${this._renderPropertyRow('echart', 'pieLabelLineSmooth', {
                        label: 'Label line smooth',
                    })}
                    ${this._renderPropertyRow('echart', 'pieLabelLineColor', {
                        label: 'Label line color',
                        helperText: this._getCurrentValueText('echart', 'pieLabelLineColor'),
                    })}
                    ${this._renderPropertyRow('echart', 'pieLabelLineWidth', {
                        label: 'Label line width',
                    })}
                    ${this._renderPropertyRow('echart', 'legendIcon', {
                        label: 'Legend icon',
                        helperText: this._getCurrentValueText('echart', 'legendIcon'),
                    })}
                    ${this._renderPropertyRow('echart', 'legendIconSize', {
                        label: 'Icon size',
                    })}
                </div>
            </div>
        `;
    }

    protected _renderEffectsSection() {
        if (!this._isSectionVisible('effects')) return nothing;

        const isExpanded = this.expandedSections.has('effects');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('effects')}>
                    <span class="section-title">
                        <span>Effects</span>
                        ${this._sectionHasInlineOverrides('effects') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('effects', 'opacity', {label: 'Opacity'})}
                    ${this._renderPropertyRow('effects', 'rotate', {label: 'Rotate'})}
                </div>
            </div>
        `;
    }

    protected _renderSvgSection() {
        if (!this._isSectionVisible('svg')) return nothing;

        const isExpanded = this.expandedSections.has('svg');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('svg')}>
                    <span class="section-title">
                        <span>SVG</span>
                        ${this._sectionHasInlineOverrides('svg') ? html`
                            <span
                                    class="section-indicator"
                                    title="Inline overrides"
                                    aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('svg', 'stroke', {
                        label: 'Stroke Color',
                        helperText: this._getCurrentValueText('svg', 'stroke'),
                    })}
                    ${this._renderPropertyRow('svg', 'strokeWidth', {label: 'Stroke Width'})}
                    ${this._renderPropertyRow('svg', 'strokeLinecap', {
                        label: 'Line Cap',
                        helperText: this._getCurrentValueText('svg', 'strokeLinecap'),
                    })}
                    ${this._renderPropertyRow('svg', 'strokeLinejoin', {
                        label: 'Line Join',
                        helperText: this._getCurrentValueText('svg', 'strokeLinejoin'),
                    })}
                    ${this._renderPropertyRow('svg', 'strokeDasharray', {label: 'Dash Array'})}
                    ${this._renderPropertyRow('svg', 'strokeDashoffset', {label: 'Dash Offset'})}
                    ${this._renderPropertyRow('svg', 'strokeOpacity', {label: 'Stroke Opacity'})}
                    ${this._renderPropertyRow('svg', 'fill', {
                        label: 'Fill Color',
                        helperText: this._getCurrentValueText('svg', 'fill'),
                    })}
                    ${this._renderPropertyRow('svg', 'fillOpacity', {label: 'Fill Opacity'})}
                    ${this._renderPropertyRow('svg', 'strokeMiterlimit', {label: 'Miter Limit'})}
                </div>
            </div>
        `;
    }

    protected _renderAnimationsSection() {
        if (!this._isSectionVisible('animations')) return nothing;

        const isExpanded = this.expandedSections.has('animations');

        return html`
            <div class="section ${isExpanded ? 'expanded' : ''}">
                <div class="section-header" @click=${() => this.toggleSection('animations')}>
                    <span class="section-title">
                        <span>Animations</span>
                        ${this._sectionHasInlineOverrides('animations') ? html`
                            <span
                                class="section-indicator"
                                title="Inline overrides"
                                aria-label="Inline overrides"
                            ></span>
                        ` : nothing}
                    </span>
                    <div class="section-icon"></div>
                </div>
                <div class="section-content">
                    ${this._renderPropertyRow('animations', 'motion', {
                        label: 'Block motion',
                        showBindingToggle: false,
                    })}
                </div>
            </div>
        `;
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    // FIXME: for card this values are wrong since card element saved into registry is the builder-canvas
    // FIXME: and not the canvas element!
    protected _resetComputedStyleCache(): void {
        this.computedStyleTarget = null;
        this.computedStyle = null;
    }

    protected _getStyleTargetElement(): HTMLElement | null {
        if (!this.selectedBlock) return null;
        const element = this.documentModel.getElement(this.selectedBlock.id);
        if (!element) return null;

        if (!this.activeTargetId) {
            return element;
        }

        const renderRoot = (element as { renderRoot?: ShadowRoot | HTMLElement }).renderRoot ?? element.shadowRoot ?? element;
        const target = renderRoot?.querySelector?.(`[data-style-target="${this.activeTargetId}"]`) as HTMLElement | null;

        return target ?? element;
    }

    protected _getComputedStyleDeclaration(): CSSStyleDeclaration | null {
        const target = this._getStyleTargetElement();
        if (!target) {
            this.computedStyleTarget = null;
            this.computedStyle = null;
            return null;
        }

        if (this.computedStyleTarget !== target) {
            this.computedStyleTarget = target;
            this.computedStyle = getComputedStyle(target);
        }

        return this.computedStyle;
    }

    protected _getComputedStyleValueByCssProperty(cssProperty: string): string | undefined {
        const styles = this._getComputedStyleDeclaration();
        if (!styles) return undefined;
        const value = styles.getPropertyValue(cssProperty).trim();
        return value || undefined;
    }

    protected _getCssPropertyName(property: string): string | undefined {
        if (!property) return undefined;
        return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    }

    protected _hasLocalOverride(category: string, property: string): boolean {
        return Boolean(this.resolvedStyles[category]?.[property]?.hasLocalOverride);
    }

    protected _shouldUseComputedFallback(category: string, property: string): boolean {
        if (VIRTUAL_PROPERTIES.includes(`${category}.${property}`)) return false;
        return !this._hasLocalOverride(category, property);
    }

    protected _getComputedStyleValue(category: string, property: string): string | undefined {
        if (!this._shouldUseComputedFallback(category, property)) return undefined;
        if (category === 'spacing' && (property === 'margin' || property === 'padding')) {
            const prefix = property === 'margin' ? 'margin' : 'padding';
            const top = this._getComputedStyleValueByCssProperty(`${prefix}-top`);
            const right = this._getComputedStyleValueByCssProperty(`${prefix}-right`);
            const bottom = this._getComputedStyleValueByCssProperty(`${prefix}-bottom`);
            const left = this._getComputedStyleValueByCssProperty(`${prefix}-left`);

            if (top && right && bottom && left) {
                return `${top} ${right} ${bottom} ${left}`;
            }

            const fallback = this._getComputedStyleValueByCssProperty(prefix);
            if (fallback) return fallback;

            const parts = [top, right, bottom, left].filter(Boolean);
            return parts.length > 0 ? parts.join(' ') : undefined;
        }
        const cssProperty = this._getCssPropertyName(property);
        if (!cssProperty) return undefined;
        return this._getComputedStyleValueByCssProperty(cssProperty);
    }

    protected _getCurrentValueText(category: string, property: string): string | undefined {
        const value = this._getComputedStyleValue(category, property);
        if (!value) return undefined;
        return `Current: ${value}`;
    }

    protected _parseNumberWithUnit(value: string): { value: number; unit?: CSSUnit } | null {
        const token = value.trim().split(/\s+/)[0];
        const match = token.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
        if (!match) return null;

        const numeric = parseFloat(match[1]);
        if (Number.isNaN(numeric)) return null;

        const unit = match[2] ? (match[2] as CSSUnit) : undefined;
        return {value: numeric, unit};
    }

    protected _getComputedNumberValue(
        category: string,
        property: string
    ): { value?: number; unit?: CSSUnit; text?: string } {
        if (!this._shouldUseComputedFallback(category, property)) return {};

        const propertyKey = `${category}.${property}`;
        if (propertyKey === 'typography.lineHeight') {
            const lineHeightRaw = this._getComputedStyleValueByCssProperty('line-height');
            const fontSizeRaw = this._getComputedStyleValueByCssProperty('font-size');
            if (!lineHeightRaw || !fontSizeRaw) return {};

            const lineHeightValue = this._parseNumberWithUnit(lineHeightRaw);
            const fontSizeValue = this._parseNumberWithUnit(fontSizeRaw);
            if (!lineHeightValue?.value || !fontSizeValue?.value) return {};

            return {
                value: lineHeightValue.value / fontSizeValue.value,
                text: lineHeightRaw,
            };
        }

        const raw = this._getComputedStyleValue(category, property);
        if (!raw) return {};

        const normalized = raw.trim().toLowerCase();
        if (normalized === 'none' || normalized === 'normal') {
            return {value: 0, text: raw};
        }

        const parsed = this._parseNumberWithUnit(raw);
        if (!parsed) return {text: raw};

        return {value: parsed.value, unit: parsed.unit, text: raw};
    }

    protected _getUserValue<T>(
        category: string,
        property: string,
        defaultValue?: T
    ): T | undefined {
        if (!this._hasLocalOverride(category, property)) return undefined;
        return this._getResolvedValue(this.resolvedStyles[category]?.[property], defaultValue);
    }

    protected _renderColorInput(
        category: string,
        property: string,
        value: unknown,
        editor?: PanelStyleEditorConfig
    ) {
        const normalizedValue = String(value ?? '');
        return html`
            <sm-color-input
                    .value=${normalizedValue}
                    @change=${(e: CustomEvent) => editor
                        ? this._applyStyleEditorChange(category, property, editor, e.detail.value, undefined, e)
                        : this._handlePropertyChange(category, property, e.detail.value)}
            ></sm-color-input>
        `;
    }

    protected _getStyleEditorConfig(
        category: string,
        property: string,
        rowEditor?: StylePropertyEditorConfig
    ): PanelStyleEditorConfig {
        const propertyKey = `${category}.${property}`;
        const base = DEFAULT_STYLE_EDITOR_CONFIGS[propertyKey];
        const override = this.visibleProperties?.editors.get(propertyKey);
        return {
            input: 'text',
            ...base,
            ...rowEditor,
            ...override,
        } as PanelStyleEditorConfig;
    }

    protected _applyStyleEditorChange(
        category: string,
        property: string,
        editor: PanelStyleEditorConfig,
        value: unknown,
        unit?: CSSUnit,
        event?: CustomEvent
    ): void {
        if (editor.onChange) {
            editor.onChange(value, unit, event);
            return;
        }

        this._handlePropertyChange(category, property, value, unit);
        editor.afterChange?.(value, unit, event);
    }

    protected _getStyleEditorValue(
        category: string,
        property: string,
        editor: PanelStyleEditorConfig
    ): unknown {
        if (editor.value !== undefined) {
            return editor.value;
        }

        const resolvedValue = this._getResolvedValue(this.resolvedStyles[category]?.[property], editor.default);
        if (editor.input === 'text' || editor.input === 'textarea') {
            return this._getUserValue(category, property, '') ?? '';
        }

        return resolvedValue ?? '';
    }

    protected _getStyleEditorUnitConfig(
        category: string,
        property: string,
        editor: PanelStyleEditorConfig
    ): { unit: CSSUnit; units: CSSUnit[] } | null {
        const editorUnits = editor.units;
        if (editor.unit) {
            return {
                unit: editor.unit,
                units: editorUnits && editorUnits.length > 0 ? editorUnits : [editor.unit],
            };
        }

        if (category === 'layout' && (property === 'positionX' || property === 'positionY')) {
            const positionUnit = (this.getLayoutData()?.positionConfig.unitSystem ?? 'px') as CSSUnit;
            return {
                unit: positionUnit,
                units: [positionUnit],
            };
        }

        const unitConfig = this._getUnitConfig(category, property);
        if (!unitConfig && editorUnits && editorUnits.length > 0) {
            return {
                unit: editorUnits[0],
                units: editorUnits,
            };
        }
        if (!unitConfig) {
            return null;
        }

        const computed = this._getComputedNumberValue(category, property);
        if (
            !this._hasLocalOverride(category, property)
            && computed.unit
            && unitConfig.units.includes(computed.unit)
        ) {
            return {
                unit: computed.unit,
                units: unitConfig.units,
            };
        }

        return unitConfig;
    }

    protected _getStyleEditorNumberValue(
        category: string,
        property: string,
        editor: PanelStyleEditorConfig
    ): number | undefined {
        const explicit = this._parseFiniteNumber(editor.value);
        if (explicit !== undefined) {
            return explicit;
        }

        if (editor.input === 'number') {
            return this._parseFiniteNumber(this._getUserValue(category, property));
        }

        const resolved = this._parseFiniteNumber(this._getResolvedValue(this.resolvedStyles[category]?.[property]));
        if (this._hasLocalOverride(category, property)) {
            return resolved ?? this._parseFiniteNumber(editor.default);
        }

        return this._getComputedNumberValue(category, property).value
            ?? resolved
            ?? this._parseFiniteNumber(editor.default);
    }

    protected _getStyleEditorDefaultNumber(
        category: string,
        property: string,
        editor: PanelStyleEditorConfig
    ): number {
        return this._getComputedNumberValue(category, property).value
            ?? this._parseFiniteNumber(this._getResolvedValue(this.resolvedStyles[category]?.[property]))
            ?? this._parseFiniteNumber(editor.default)
            ?? 0;
    }

    protected _parseFiniteNumber(value: unknown): number | undefined {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : undefined;
        }
        if (typeof value !== 'string') {
            return undefined;
        }
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    protected _renderConfiguredStyleInput(
        category: string,
        property: string,
        editor: PanelStyleEditorConfig
    ): ReturnType<typeof html> {
        const value = this._getStyleEditorValue(category, property, editor);
        const userValue = this._getUserValue(category, property);
        const unitConfig = this._getStyleEditorUnitConfig(category, property, editor);
        const numberOrUndefined = this._getStyleEditorNumberValue(category, property, editor);
        const numberOrDefault = this._getStyleEditorDefaultNumber(category, property, editor);
        const minValue = this._parseFiniteNumber(editor.min);
        const maxValue = this._parseFiniteNumber(editor.max);
        const placeholder = this._getCurrentValueText(category, property) ?? String(editor.placeholder ?? '');

        switch (editor.input) {
            case 'color':
                return html`
                    <sm-color-input
                            .value=${String(value ?? '')}
                            @change=${(e: CustomEvent) => editor
                            ? this._applyStyleEditorChange(category, property, editor, e.detail.value, undefined, e)
                            : this._handlePropertyChange(category, property, e.detail.value)}
                    ></sm-color-input>
                `;
            case 'echart-color':
                return html`
                    <sm-echart-color-input
                            .value=${String(value || '#3b82f6')}
                            @change=${(e: CustomEvent) => this._applyStyleEditorChange(category, property, editor, e.detail.value, undefined, e)}
                    ></sm-echart-color-input>
                `;
            case 'text':
                return html`
                    <input
                            class="text-input"
                            type="text"
                            .value=${String(userValue ?? '')}
                            placeholder=${placeholder}
                            @input=${(e: Event) => this._applyStyleEditorChange(
                                category,
                                property,
                                editor,
                                (e.target as HTMLInputElement).value
                            )}
                    />
                `;
            case 'textarea':
                return html`
                    <textarea
                            class="text-input textarea-input"
                            rows=${Number(editor.rows ?? 3)}
                            .value=${String(userValue ?? '')}
                            placeholder=${placeholder}
                            @input=${(e: Event) => this._applyStyleEditorChange(
                                category,
                                property,
                                editor,
                                (e.target as HTMLTextAreaElement).value
                            )}
                    ></textarea>
                `;
            case 'number':
                return html`
                    <sm-number-input
                            .value=${numberOrUndefined}
                            .placeholder=${placeholder}
                            .default=${numberOrDefault}
                            .min=${minValue}
                            .max=${maxValue}
                            .step=${Number(editor.step ?? 1)}
                            unit="${unitConfig?.unit ?? ''}"
                            .units=${unitConfig?.units}
                            @change=${(e: CustomEvent) => this._applyStyleEditorChange(category, property, editor, e.detail.value, e.detail.unit, e)}
                    ></sm-number-input>
                `;
            case 'slider':
                return html`
                    <sm-slider-input
                            .value=${numberOrUndefined ?? numberOrDefault}
                            min=${Number(editor.min ?? 0)}
                            max=${Number(editor.max ?? 100)}
                            step=${Number(editor.step ?? 1)}
                            unit="${unitConfig?.unit ?? ''}"
                            .units=${unitConfig?.units ?? []}
                            @change=${(e: CustomEvent) => this._applyStyleEditorChange(category, property, editor, e.detail.value, e.detail.unit, e)}
                    ></sm-slider-input>
                `;
            case 'select':
                return html`
                    <sm-select-input
                            .value=${String(value ?? '')}
                            .options=${(editor.options ?? []).map((option) => ({
                                label: option.label ?? option.value,
                                value: option.value,
                            }))}
                            @change=${(e: CustomEvent) => this._applyStyleEditorChange(category, property, editor, e.detail.value, undefined, e)}
                    ></sm-select-input>
                `;
            case 'spacing':
                return html`
                    <sm-spacing-input
                            .value=${value}
                            unit="${unitConfig?.unit ?? 'px'}"
                            .units=${unitConfig?.units ?? ['px']}
                            @change=${(e: CustomEvent) => this._applyStyleEditorChange(category, property, editor, e.detail.value, e.detail.unit, e)}
                    ></sm-spacing-input>
                `;
            case 'toggle':
                return html`
                    <sm-toggle-input
                            .value=${Boolean(value)}
                            .labelOn=${String(editor.labelOn ?? 'On')}
                            .labelOff=${String(editor.labelOff ?? 'Off')}
                            @change=${(e: CustomEvent) => this._applyStyleEditorChange(category, property, editor, e.detail.value, undefined, e)}
                    ></sm-toggle-input>
                `;
            case 'button-group':
                return html`
                    <sm-button-group-input
                            .value=${String(value ?? '')}
                            .options=${(editor.options ?? []).map((option) => ({
                                value: option.value,
                                tooltip: option.tooltip ?? option.label ?? option.value,
                                icon: option.icon ?? option.label ?? option.value,
                            }))}
                            @change=${(e: CustomEvent) => this._applyStyleEditorChange(category, property, editor, e.detail.value, undefined, e)}
                    ></sm-button-group-input>
                `;
            case 'background-image':
                return this._renderBackgroundImageInput(editor);
            case 'background-size':
                return this._renderBackgroundSizeInput();
            case 'background-position':
                return this._renderBackgroundPositionInput();
            case 'hint':
                return html`<div class="animation-hint">${String(editor.text ?? '')}</div>`;
            case 'default':
            default:
                return html`
                    <input
                            class="text-input"
                            type="text"
                            .value=${String(userValue ?? '')}
                            placeholder=${placeholder}
                            @input=${(e: Event) => this._applyStyleEditorChange(
                                category,
                                property,
                                editor,
                                (e.target as HTMLInputElement).value
                            )}
                    />
                `;
        }
    }

    protected _renderBackgroundImageInput(editor: PanelStyleEditorConfig): ReturnType<typeof html> {
        const background = this.resolvedStyles.background || {};
        const backgroundImageValue = String(this._getResolvedValue(background.backgroundImage, ''));
        const backgroundImageMode = backgroundImageValue ? this._getBackgroundImageMode(backgroundImageValue) : this.backgroundImageMode;
        const backgroundImageUrl = this._extractBackgroundImageUrl(backgroundImageValue);
        const backgroundImageUserValue = this._getUserValue('background', 'backgroundImage', '') ?? '';
        const backgroundImageUserUrl = this._extractBackgroundImageUrl(backgroundImageUserValue);
        const backgroundMediaReference = backgroundImageMode === 'media' ? backgroundImageUrl : '';
        const hasMediaSelection = isManagedMediaReference(backgroundMediaReference);
        const mediaLabel = hasMediaSelection ? (getMediaReferenceName(backgroundMediaReference) || backgroundMediaReference) : '';
        const placeholder = this._getCurrentValueText('background', 'backgroundImage') ?? String(editor.placeholder ?? 'https://example.com/background.png');

        return html`
            <div class="background-input">
                <sm-select-input
                        .value=${backgroundImageMode}
                        .options=${BACKGROUND_IMAGE_OPTIONS}
                        @change=${(e: CustomEvent) =>
                                this._handleBackgroundImageModeChange(
                                        e.detail.value as BackgroundImageMode,
                                        backgroundImageValue
                                )}
                ></sm-select-input>
                ${backgroundImageMode === 'image' ? html`
                    <textarea
                            class="text-input textarea-input"
                            rows="3"
                            placeholder=${placeholder}
                            .value=${backgroundImageUserUrl}
                            @input=${(e: Event) =>
                                    this._handlePropertyChange(
                                            'background',
                                            'backgroundImage',
                                            (e.target as HTMLTextAreaElement).value
                                    )}
                    ></textarea>
                ` : nothing}
                ${backgroundImageMode === 'media' ? html`
                    <div class="background-media">
                        ${hasMediaSelection ? html`
                            <div class="media-selected">
                                <span class="media-name" title=${backgroundMediaReference}>${mediaLabel}</span>
                                <div class="media-actions">
                                    <button class="media-button" @click=${this._openMediaManagerForBackgroundImage}>
                                        Edit
                                    </button>
                                    <button class="media-button danger" @click=${this._clearBackgroundMedia}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ` : html`
                            <button class="media-button primary" @click=${this._openMediaManagerForBackgroundImage}>
                                Select media
                            </button>
                        `}
                    </div>
                ` : nothing}
                ${backgroundImageMode === 'gradient' ? html`
                    <textarea
                            class="text-input textarea-input"
                            rows="3"
                            placeholder=${placeholder}
                            .value=${backgroundImageUserValue}
                            @input=${(e: Event) =>
                                    this._handlePropertyChange(
                                            'background',
                                            'backgroundImage',
                                            (e.target as HTMLTextAreaElement).value
                                    )}
                    ></textarea>
                ` : nothing}
                ${backgroundImageMode === 'custom' ? html`
                    <textarea
                            class="text-input textarea-input"
                            rows="3"
                            placeholder=${placeholder}
                            .value=${backgroundImageUserValue}
                            @input=${(e: Event) =>
                                    this._handlePropertyChange(
                                            'background',
                                            'backgroundImage',
                                            (e.target as HTMLTextAreaElement).value
                                    )}
                    ></textarea>
                ` : nothing}
            </div>
        `;
    }

    protected _renderBackgroundSizeInput(): ReturnType<typeof html> {
        const background = this.resolvedStyles.background || {};
        const backgroundSizeValue = String(this._getResolvedValue(background.backgroundSize, 'auto'));
        const backgroundSizePreset = this._getBackgroundSizePreset(backgroundSizeValue);
        const backgroundSizePair = this._parseLengthPair(backgroundSizeValue, {
            x: {value: 100, unit: '%'},
            y: {value: 100, unit: '%'},
        });

        return html`
            <div class="background-input">
                <sm-select-input
                        .value=${backgroundSizePreset}
                        .options=${BACKGROUND_SIZE_OPTIONS}
                        @change=${(e: CustomEvent) =>
                                this._handleBackgroundSizePresetChange(
                                        e.detail.value,
                                        backgroundSizePreset
                                )}
                ></sm-select-input>
                ${backgroundSizePreset === BACKGROUND_CUSTOM_VALUE ? html`
                    <div class="background-inline-grid">
                        <div class="background-field">
                            <span class="background-field-label">Width</span>
                            <sm-number-input
                                    .value=${backgroundSizePair.x.value}
                                    min="0"
                                    step="1"
                                    unit="${backgroundSizePair.x.unit}"
                                    .units=${BACKGROUND_LENGTH_UNITS}
                                    @change=${(e: CustomEvent) =>
                                            this._handleBackgroundLengthPairChange(
                                                    'backgroundSize',
                                                    'x',
                                                    e.detail.value,
                                                    e.detail.unit,
                                                    backgroundSizePair
                                            )}
                            ></sm-number-input>
                        </div>
                        <div class="background-field">
                            <span class="background-field-label">Height</span>
                            <sm-number-input
                                    .value=${backgroundSizePair.y.value}
                                    min="0"
                                    step="1"
                                    unit="${backgroundSizePair.y.unit}"
                                    .units=${BACKGROUND_LENGTH_UNITS}
                                    @change=${(e: CustomEvent) =>
                                            this._handleBackgroundLengthPairChange(
                                                    'backgroundSize',
                                                    'y',
                                                    e.detail.value,
                                                    e.detail.unit,
                                                    backgroundSizePair
                                            )}
                            ></sm-number-input>
                        </div>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    protected _renderBackgroundPositionInput(): ReturnType<typeof html> {
        const background = this.resolvedStyles.background || {};
        const backgroundPositionValue = String(this._getResolvedValue(background.backgroundPosition, 'center'));
        const backgroundPositionPreset = this._getBackgroundPositionPreset(backgroundPositionValue);
        const backgroundPositionPair = this._parseLengthPair(backgroundPositionValue, {
            x: {value: 50, unit: '%'},
            y: {value: 50, unit: '%'},
        });

        return html`
            <div class="background-input">
                <sm-select-input
                        .value=${backgroundPositionPreset}
                        .options=${BACKGROUND_POSITION_OPTIONS}
                        @change=${(e: CustomEvent) =>
                                this._handleBackgroundPositionPresetChange(
                                        e.detail.value,
                                        backgroundPositionPreset
                                )}
                ></sm-select-input>
                ${backgroundPositionPreset === BACKGROUND_CUSTOM_VALUE ? html`
                    <div class="background-inline-grid">
                        <div class="background-field">
                            <span class="background-field-label">X</span>
                            <sm-number-input
                                    .value=${backgroundPositionPair.x.value}
                                    step="1"
                                    unit="${backgroundPositionPair.x.unit}"
                                    .units=${BACKGROUND_LENGTH_UNITS}
                                    @change=${(e: CustomEvent) =>
                                            this._handleBackgroundLengthPairChange(
                                                    'backgroundPosition',
                                                    'x',
                                                    e.detail.value,
                                                    e.detail.unit,
                                                    backgroundPositionPair
                                            )}
                            ></sm-number-input>
                        </div>
                        <div class="background-field">
                            <span class="background-field-label">Y</span>
                            <sm-number-input
                                    .value=${backgroundPositionPair.y.value}
                                    step="1"
                                    unit="${backgroundPositionPair.y.unit}"
                                    .units=${BACKGROUND_LENGTH_UNITS}
                                    @change=${(e: CustomEvent) =>
                                            this._handleBackgroundLengthPairChange(
                                                    'backgroundPosition',
                                                    'y',
                                                    e.detail.value,
                                                    e.detail.unit,
                                                    backgroundPositionPair
                                            )}
                            ></sm-number-input>
                        </div>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    protected _renderPropertyRow(
        category: string,
        property: string,
        config: StylePropertyRowConfig
    ) {
        if (!this._isPropertyVisible(category, property)) {
            return nothing;
        }
        const resolved = this.resolvedStyles[category]?.[property];
        const editor = this._getStyleEditorConfig(category, property, config.editor);
        const resolvedLabel = editor.label ?? config.label;
        const resolvedInput = this._renderConfiguredStyleInput(category, property, editor);
        const {
            showBindingToggle = true,
            showAnimationToggle = true,
            helperText,
        } = config;

        return html`
            <property-row
                    .hass=${this.hass}
                    .label=${resolvedLabel}
                    .property=${property}
                    .category=${category}
                    .origin=${resolved?.origin || 'default'}
                    .presetName=${resolved?.presetId ? this._getPresetName(resolved.presetId) : undefined}
                    .originContainer=${resolved?.originContainer}
                    .hasLocalOverride=${resolved?.hasLocalOverride || false}
                    .binding=${resolved?.binding}
                    .animation=${resolved?.animation}
                    .resolvedValue=${resolved?.value}
                    .resolvedUnit=${resolved?.unit}
                    .helperText=${helperText}
                    .defaultEntityId=${this.defaultEntityId}
                    .showBindingToggle=${showBindingToggle}
                    .showAnimationToggle=${showAnimationToggle}
                    @property-binding-change=${(e: CustomEvent) => this._handleBindingChange(e.detail.category, e.detail.property, e.detail.binding, e.detail.unit)}
                    @property-binding-edit=${this._handleBindingEdit}
                    @property-animation-change=${(e: CustomEvent) => this._handleAnimationChange(e.detail.category, e.detail.property, e.detail.animation)}
                    @property-animation-edit=${this._handleAnimationEdit}
                    @property-reset=${(e: CustomEvent) => this._handlePropertyReset(e.detail.category, e.detail.property)}
            >
                ${resolvedInput}
            </property-row>
        `;
    }

    protected _renderBindingEditorOverlay() {
        if (!this.bindingEditorTarget) return nothing;

        const {category, property, label} = this.bindingEditorTarget;
        const binding = this.resolvedStyles[category]?.[property]?.binding;
        const valueInputConfig = this._getBindingValueInputConfig(category, property);

        return html`
            <property-binding-editor-overlay
                .open=${this.bindingEditorOpen}
                .hass=${this.hass}
                .label=${label}
                .category=${category}
                .block=${this.selectedBlock}
                .propertyName=${property}
                .binding=${binding}
                .defaultEntityId=${this.defaultEntityId}
                .slots=${this.slots}
                .valueInputConfig=${valueInputConfig}
                @property-binding-change=${(e: CustomEvent) =>
                        this._handleBindingChange(e.detail.category, e.detail.property, e.detail.binding, e.detail.unit)}
                @overlay-close=${() => this._closeBindingEditor()}
            ></property-binding-editor-overlay>
        `;
    }

    protected _renderAnimationEditorOverlay() {
        if (!this.animationEditorTarget) return nothing;

        const {property, label} = this.animationEditorTarget;

        return html`
            <property-animation-editor-overlay
                .open=${this.animationEditorOpen}
                .label=${label}
                .propertyName=${property}
                @property-animation-change=${(e: CustomEvent) => this._handleAnimationChange(e.detail.category, e.detail.property, e.detail.animation)}
                @overlay-close=${() => this._closeAnimationEditor()}
            ></property-animation-editor-overlay>
        `;
    }

    protected _getBindingValueInputConfig(
        category: string,
        property: string
    ): BindingValueInputConfig | undefined {
        const editor = this._getStyleEditorConfig(category, property);
        const unitConfig = this._getStyleEditorUnitConfig(category, property, editor);

        switch (editor.input) {
            case 'number':
                return {
                    type: 'number',
                    min: editor.min,
                    max: editor.max,
                    step: editor.step,
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'slider':
                return {
                    type: 'slider',
                    min: Number(editor.min ?? 0),
                    max: Number(editor.max ?? 100),
                    step: editor.step,
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'color':
            case 'echart-color':
                return {type: 'color'};
            case 'select':
            case 'button-group':
                return {
                    type: 'select',
                    options: (editor.options ?? []).map((option) => ({
                        label: option.label ?? option.tooltip ?? option.value,
                        value: option.value,
                    })),
                };
            case 'spacing':
                return {
                    type: 'spacing',
                    unit: unitConfig?.unit,
                    units: unitConfig?.units,
                };
            case 'text':
            case 'textarea':
            case 'background-image':
            case 'background-size':
            case 'background-position':
            case 'default':
                return {
                    type: 'text',
                    placeholder: this._getCurrentValueText(category, property) ?? String(editor.placeholder ?? ''),
                };
            default:
                return undefined;
        }
    }

    protected _getResolvedValue<T>(resolved: ResolvedValue | undefined, defaultValue: T | undefined = undefined): T | undefined {
        if (!resolved || resolved.value === undefined) {
            return defaultValue;
        }
        return resolved.value as T;
    }

    protected _updateBackgroundImageMode(forceReset: boolean): void {
        if (forceReset && !this.selectedBlock) {
            this.backgroundImageMode = 'none';
            return;
        }
        const value = this.resolvedStyles.background?.backgroundImage?.value;
        const raw = typeof value === 'string' ? value.trim() : '';

        if (!raw) {
            if (forceReset) {
                this.backgroundImageMode = 'none';
            }
            return;
        }

        const nextMode = this._getBackgroundImageMode(raw);
        if (nextMode !== this.backgroundImageMode) {
            this.backgroundImageMode = nextMode;
        }
    }

    protected _getBackgroundImageMode(value: string): BackgroundImageMode {
        const raw = value.trim();
        if (!raw || raw === 'none') return 'none';

        const unwrapped = this._extractBackgroundImageUrl(raw);
        if (isManagedMediaReference(unwrapped)) return 'media';

        const lower = raw.toLowerCase();
        if (lower.includes('gradient(')) return 'gradient';
        if (lower.startsWith('url(') || this._looksLikeUrl(raw)) return 'image';
        return 'custom';
    }

    protected _looksLikeUrl(value: string): boolean {
        if (/^(https?:\/\/|data:|\/)/i.test(value)) return true;
        return /^[^()\s]+\.[a-z0-9]{2,}$/i.test(value);
    }

    protected _extractBackgroundImageUrl(value: string): string {
        const raw = value.trim();
        if (!raw) return '';
        const match = raw.match(/^url\((.*)\)$/i);
        if (!match) return raw;

        let inner = match[1].trim();
        if (
            (inner.startsWith('"') && inner.endsWith('"'))
            || (inner.startsWith("'") && inner.endsWith("'"))
        ) {
            inner = inner.slice(1, -1);
        }
        return inner;
    }

    protected _getBackgroundSizePreset(value: string): string {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'auto' || normalized === 'auto auto') {
            return 'auto';
        }
        if (normalized === 'cover' || normalized === 'contain') {
            return normalized;
        }
        return BACKGROUND_CUSTOM_VALUE;
    }

    protected _getBackgroundPositionPreset(value: string): string {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'center center') {
            return 'center';
        }
        const alias = BACKGROUND_POSITION_ALIASES[normalized];
        if (alias) {
            return alias;
        }
        const match = BACKGROUND_POSITION_OPTIONS.find(
            (option) => option.value !== BACKGROUND_CUSTOM_VALUE && option.value === normalized
        );
        return match ? match.value : BACKGROUND_CUSTOM_VALUE;
    }

    protected _parseLengthToken(token: string | undefined, fallback: LengthValue): LengthValue {
        if (!token) return fallback;
        const match = token.trim().match(/^(-?\d+(?:\.\d+)?)([a-z%]*)$/i);
        if (!match) return fallback;

        const value = Number(match[1]);
        if (!Number.isFinite(value)) return fallback;

        const unit = (match[2] || fallback.unit) as CSSUnit;
        if (!BACKGROUND_LENGTH_UNITS.includes(unit)) {
            return {value, unit: fallback.unit};
        }

        return {value, unit};
    }

    protected _parseLengthPair(value: string, fallback: LengthPair): LengthPair {
        const tokens = value.trim().split(/\s+/).filter(Boolean);
        const first = tokens[0];
        const second = tokens[1] ?? tokens[0];

        return {
            x: this._parseLengthToken(first, fallback.x),
            y: this._parseLengthToken(second, fallback.y),
        };
    }

    protected _formatLengthPair(pair: LengthPair): string {
        return `${pair.x.value}${pair.x.unit} ${pair.y.value}${pair.y.unit}`;
    }

    protected _handleBackgroundLengthPairChange(
        property: 'backgroundSize' | 'backgroundPosition',
        axis: 'x' | 'y',
        value: number,
        unit: CSSUnit | undefined,
        pair: LengthPair
    ): void {
        const nextPair: LengthPair = {
            x: axis === 'x' ? {value, unit: unit ?? pair.x.unit} : pair.x,
            y: axis === 'y' ? {value, unit: unit ?? pair.y.unit} : pair.y,
        };

        this._handlePropertyChange('background', property, this._formatLengthPair(nextPair));
    }

    protected _handleBackgroundImageModeChange(
        mode: BackgroundImageMode,
        currentValue: string
    ): void {
        this.backgroundImageMode = mode;

        if (mode === 'none') {
            this._handlePropertyChange('background', 'backgroundImage', 'none');
            return;
        }

        const currentMode = this._getBackgroundImageMode(currentValue);
        if (mode === 'media') {
            if (currentMode !== 'media') {
                this._handlePropertyChange('background', 'backgroundImage', '');
            }
            const currentReference = this._extractBackgroundImageUrl(currentValue);
            if (!isManagedMediaReference(currentReference)) {
                this._openMediaManagerForBackgroundImage();
            }
            return;
        }

        if (mode === 'gradient') {
            if (currentMode !== 'gradient') {
                this._handlePropertyChange(
                    'background',
                    'backgroundImage',
                    'linear-gradient(180deg, #000000, #ffffff)'
                );
            }
            return;
        }

        if (mode === 'image') {
            if (currentMode !== 'image') {
                this._handlePropertyChange('background', 'backgroundImage', '');
            }
            return;
        }

        if (mode === 'custom' && currentMode !== 'custom') {
            this._handlePropertyChange('background', 'backgroundImage', '');
        }
    }

    protected _openMediaManagerForBackgroundImage = (): void => {
        if (!this.eventBus) return;
        const requestId = `bg-media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this.pendingMediaRequestId = requestId;
        this.eventBus.dispatchEvent('media-manager-open', {
            mode: 'select',
            requestId,
            title: 'Select image',
            subtitle: 'Choose or upload a background media',
            confirmLabel: 'Use image',
        });
    };

    protected _clearBackgroundMedia = (): void => {
        this.pendingMediaRequestId = null;
        this.backgroundImageMode = 'media';
        this._handlePropertyChange('background', 'backgroundImage', '');
    };

    protected _handleBackgroundSizePresetChange(
        preset: string,
        currentPreset: string
    ): void {
        if (preset === BACKGROUND_CUSTOM_VALUE) {
            if (currentPreset !== BACKGROUND_CUSTOM_VALUE) {
                const fallback: LengthPair = {
                    x: {value: 100, unit: '%'},
                    y: {value: 100, unit: '%'},
                };
                this._handlePropertyChange('background', 'backgroundSize', this._formatLengthPair(fallback));
            }
            return;
        }

        this._handlePropertyChange('background', 'backgroundSize', preset);
    }

    protected _handleBackgroundPositionPresetChange(
        preset: string,
        currentPreset: string
    ): void {
        if (preset === BACKGROUND_CUSTOM_VALUE) {
            if (currentPreset !== BACKGROUND_CUSTOM_VALUE) {
                const fallback: LengthPair = {
                    x: {value: 50, unit: '%'},
                    y: {value: 50, unit: '%'},
                };
                this._handlePropertyChange('background', 'backgroundPosition', this._formatLengthPair(fallback));
            }
            return;
        }

        this._handlePropertyChange('background', 'backgroundPosition', preset);
    }

    protected _handleAnimationChange(
        _category: string,
        _property: string,
        _animation: unknown
    ): void {}

    protected _handleAnimationEdit(e: CustomEvent): void {
        const {category, property, label} = e.detail;
        this.animationEditorTarget = {category, property, label};
        this.animationEditorOpen = true;
    }

    protected _closeAnimationEditor(clearTarget = false): void {
        this.animationEditorOpen = false;
        if (clearTarget) {
            this.animationEditorTarget = null;
        }
    }

    protected _getUnitConfig(
        category: string,
        property: string
    ): { unit: CSSUnit; units: CSSUnit[] } | null {
        const units = getUnitsForProperty(category, property);
        if (!units || units.length === 0) return null;

        const resolvedUnit = this.resolvedStyles[category]?.[property]?.unit;
        const defaultUnit = getDefaultUnitForProperty(category, property) ?? units[0];
        const unit = resolvedUnit && units.includes(resolvedUnit) ? resolvedUnit : defaultUnit;

        return {unit, units};
    }

    protected _getPositionDisplayValue(
        axis: 'x' | 'y',
        positionConfig: PositionConfig
    ): number | undefined {
        const hasPositionConfig = Boolean(this.resolvedStyles._internal?.position_config?.value);
        if (hasPositionConfig) {
            return axis === 'x' ? positionConfig.x : positionConfig.y;
        }

        const layout = this.resolvedStyles.layout || {};
        const fallback = axis === 'x' ? positionConfig.x : positionConfig.y;
        return this._getResolvedValue(
            axis === 'x' ? layout.positionX : layout.positionY,
            fallback
        );
    }

    protected _getPresetName(presetId: string): string | undefined {
        const preset = this.presets.find(p => p.id === presetId);
        return preset?.name;
    }

    protected _getInlineCopyCandidate(block: BlockData): InlineCopyCandidate | null {
        const targetStyles = this._getTargetStyles(block);
        const candidateTargets: Record<string, InlineCopyTargetData> = {};
        const targetIds = new Set<string>();
        const containerIds = new Set<string>();

        const styles = block.styles || {};

        for (const [targetId, targetData] of Object.entries(styles)) {
            if (!targetData?.containers) continue;
            const visibility = this._getTargetVisibilityConfig(targetId, targetStyles);
            const containers: Record<string, ContainerStyleData> = {};

            for (const [containerId, containerData] of Object.entries(targetData.containers)) {
                const filtered = this._filterCopyableContainerData(containerData, visibility);
                if (!filtered || Object.keys(filtered).length === 0) continue;
                containers[containerId] = filtered;
                containerIds.add(containerId);
            }

            if (Object.keys(containers).length > 0) {
                candidateTargets[targetId] = {containers};
                targetIds.add(targetId);
            }
        }

        if (targetIds.size === 0) {
            return null;
        }

        return {
            targets: candidateTargets,
            targetIds: Array.from(targetIds),
            containerIds: Array.from(containerIds),
        };
    }

    protected _filterCopyableContainerData(
        containerData: ContainerStyleData,
        visibility: ResolvedPropertyConfig
    ): ContainerStyleData {
        const result: ContainerStyleData = {};

        for (const [category, properties] of Object.entries(containerData)) {
            if (!properties) continue;
            const nextCategory: Record<string, StylePropertyValue> = {};

            for (const [property, value] of Object.entries(properties)) {
                const propertyKey = `${category}.${property}`;
                if (INLINE_COPY_EXCLUDED_PROPERTIES.has(propertyKey)) continue;
                if (!this._isPropertyVisibleForConfig(propertyKey, visibility)) continue;
                nextCategory[property] = {...(value as StylePropertyValue)};
            }

            if (Object.keys(nextCategory).length > 0) {
                result[category] = nextCategory;
            }
        }

        return result;
    }

    protected _getTargetVisibilityConfig(
        targetId: string,
        targetStyles: BlockPanelTargetStyles | null
    ): ResolvedPropertyConfig {
        if (!targetStyles) {
            return this.propertyConfigResolver.resolve(undefined);
        }
        const targetConfig = targetStyles[targetId];
        return this.propertyConfigResolver.resolve(targetConfig?.styles);
    }

    protected _isPropertyVisibleForConfig(
        propertyKey: string,
        visibility: ResolvedPropertyConfig
    ): boolean {
        return visibility.properties.has(propertyKey)
            && !visibility.excludedProperties.has(propertyKey);
    }

    protected _cloneContainerStyleData(containerData: ContainerStyleData): ContainerStyleData {
        const result: ContainerStyleData = {};
        for (const [category, properties] of Object.entries(containerData)) {
            if (!properties) continue;
            const nextCategory: Record<string, StylePropertyValue> = {};
            for (const [property, value] of Object.entries(properties)) {
                nextCategory[property] = {...(value as StylePropertyValue)};
            }
            result[category] = nextCategory;
        }
        return result;
    }

    protected _sectionHasInlineOverrides(section: PropertyGroupId): boolean {
        const groups = this._getSectionGroups(section);

        return groups.some((groupId) => {
            const properties = GROUP_PROPERTIES[groupId] || [];
            return properties.some((propertyKey) => {
                if (!this._isPropertyKeyVisible(propertyKey)) return false;
                const separatorIndex = propertyKey.indexOf('.');
                if (separatorIndex === -1) return false;
                const category = propertyKey.slice(0, separatorIndex);
                const property = propertyKey.slice(separatorIndex + 1);
                return Boolean(this.resolvedStyles[category]?.[property]?.hasLocalOverride);
            });
        });
    }

    protected _getSectionGroups(section: PropertyGroupId): PropertyGroupId[] {
        if (section === 'layout') {
            return ['layout', 'flex'];
        }
        return [section];
    }

    protected _isSectionVisible(section: string): boolean {
        // If no visibility config, show all sections
        if (!this.visibleProperties) return section !== 'echart';
        const groupId = section as PropertyGroupId;
        if (!this.visibleProperties.groups.has(groupId)) return false;

        const properties = GROUP_PROPERTIES[groupId] || [];
        return properties.some((propertyKey) => this._isPropertyKeyVisible(propertyKey));
    }

    protected _isPropertyVisible(category: string, property: string): boolean {
        const propertyKey = `${category}.${property}`;
        return this._isPropertyKeyVisible(propertyKey);
    }

    protected _isPropertyKeyVisible(propertyKey: string): boolean {
        if (!this.visibleProperties) return true;
        return this.visibleProperties.properties.has(propertyKey)
            && !this.visibleProperties.excludedProperties.has(propertyKey);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'panel-style': PanelStyles;
    }
}

import { panelComponentsRegistry } from '@/panel/registry';
panelComponentsRegistry.define('panel-styles', PanelStyles);
