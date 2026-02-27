/**
 * Style property unit configuration.
 */

import type { CSSUnit } from '@/common/types/css-units';

const LENGTH_UNITS: CSSUnit[] = [
    'px',
    'rem',
    'em',
    '%',
    'vh',
    'vw',
    'vmin',
    'vmax',
    'ch',
    'ex',
    'cm',
    'mm',
    'in',
    'pt',
    'pc',
];

const LENGTH_UNITS_NO_PERCENT: CSSUnit[] = [
    'px',
    'rem',
    'em',
    'vh',
    'vw',
    'vmin',
    'vmax',
    'ch',
    'ex',
    'cm',
    'mm',
    'in',
    'pt',
    'pc',
];

const ANGLE_UNITS: CSSUnit[] = [
    'deg',
    'rad',
    'grad',
    'turn',
];

const SIZE_UNITS: CSSUnit[] = [...LENGTH_UNITS, 'auto'];
const SIZE_MAX_UNITS: CSSUnit[] = [...LENGTH_UNITS, 'none'];

const PROPERTY_UNITS: Record<string, CSSUnit[]> = {
    'size.width': SIZE_UNITS,
    'size.height': SIZE_UNITS,
    'size.minWidth': SIZE_UNITS,
    'size.maxWidth': SIZE_MAX_UNITS,
    'size.minHeight': SIZE_UNITS,
    'size.maxHeight': SIZE_MAX_UNITS,
    'spacing.margin': LENGTH_UNITS,
    'spacing.padding': LENGTH_UNITS,
    'spacing.marginTop': LENGTH_UNITS,
    'spacing.marginRight': LENGTH_UNITS,
    'spacing.marginBottom': LENGTH_UNITS,
    'spacing.marginLeft': LENGTH_UNITS,
    'spacing.paddingTop': LENGTH_UNITS,
    'spacing.paddingRight': LENGTH_UNITS,
    'spacing.paddingBottom': LENGTH_UNITS,
    'spacing.paddingLeft': LENGTH_UNITS,
    'typography.fontSize': LENGTH_UNITS,
    'typography.letterSpacing': LENGTH_UNITS_NO_PERCENT,
    'border.borderWidth': LENGTH_UNITS_NO_PERCENT,
    'border.borderTopWidth': LENGTH_UNITS_NO_PERCENT,
    'border.borderRightWidth': LENGTH_UNITS_NO_PERCENT,
    'border.borderBottomWidth': LENGTH_UNITS_NO_PERCENT,
    'border.borderLeftWidth': LENGTH_UNITS_NO_PERCENT,
    'border.borderRadius': LENGTH_UNITS,
    'border.borderTopLeftRadius': LENGTH_UNITS,
    'border.borderTopRightRadius': LENGTH_UNITS,
    'border.borderBottomRightRadius': LENGTH_UNITS,
    'border.borderBottomLeftRadius': LENGTH_UNITS,
    'svg.strokeWidth': LENGTH_UNITS_NO_PERCENT,
    'svg.strokeDashoffset': LENGTH_UNITS_NO_PERCENT,
    'flex.gap': LENGTH_UNITS,
    'flex.rowGap': LENGTH_UNITS,
    'flex.columnGap': LENGTH_UNITS,
    'flex.flexBasis': SIZE_UNITS,
    'effects.rotate': ANGLE_UNITS,
};

const DEFAULT_UNITS: Record<string, CSSUnit> = {
    'size.width': 'px',
    'size.height': 'px',
    'size.minWidth': 'px',
    'size.maxWidth': 'px',
    'size.minHeight': 'px',
    'size.maxHeight': 'px',
    'spacing.margin': 'px',
    'spacing.padding': 'px',
    'spacing.marginTop': 'px',
    'spacing.marginRight': 'px',
    'spacing.marginBottom': 'px',
    'spacing.marginLeft': 'px',
    'spacing.paddingTop': 'px',
    'spacing.paddingRight': 'px',
    'spacing.paddingBottom': 'px',
    'spacing.paddingLeft': 'px',
    'typography.fontSize': 'px',
    'typography.letterSpacing': 'px',
    'border.borderWidth': 'px',
    'border.borderTopWidth': 'px',
    'border.borderRightWidth': 'px',
    'border.borderBottomWidth': 'px',
    'border.borderLeftWidth': 'px',
    'border.borderRadius': 'px',
    'border.borderTopLeftRadius': 'px',
    'border.borderTopRightRadius': 'px',
    'border.borderBottomRightRadius': 'px',
    'border.borderBottomLeftRadius': 'px',
    'svg.strokeWidth': 'px',
    'svg.strokeDashoffset': 'px',
    'flex.gap': 'px',
    'flex.rowGap': 'px',
    'flex.columnGap': 'px',
    'flex.flexBasis': 'px',
    'effects.rotate': 'deg',
};

const DEFAULT_UNITS_BY_PROPERTY_NAME: Record<string, CSSUnit> = {
    width: 'px',
    height: 'px',
    minWidth: 'px',
    maxWidth: 'px',
    minHeight: 'px',
    maxHeight: 'px',
    margin: 'px',
    padding: 'px',
    marginTop: 'px',
    marginRight: 'px',
    marginBottom: 'px',
    marginLeft: 'px',
    paddingTop: 'px',
    paddingRight: 'px',
    paddingBottom: 'px',
    paddingLeft: 'px',
    fontSize: 'px',
    letterSpacing: 'px',
    borderWidth: 'px',
    borderRadius: 'px',
    borderTopWidth: 'px',
    borderRightWidth: 'px',
    borderBottomWidth: 'px',
    borderLeftWidth: 'px',
    borderTopLeftRadius: 'px',
    borderTopRightRadius: 'px',
    borderBottomRightRadius: 'px',
    borderBottomLeftRadius: 'px',
    strokeWidth: 'px',
    strokeDashoffset: 'px',
    rowGap: 'px',
    columnGap: 'px',
    gap: 'px',
    flexBasis: 'px',
    rotate: 'deg',
};

export function getUnitsForProperty(category: string, property: string): CSSUnit[] | undefined {
    return PROPERTY_UNITS[`${category}.${property}`];
}

export function getDefaultUnitForProperty(category: string, property: string): CSSUnit | undefined {
    return DEFAULT_UNITS[`${category}.${property}`];
}

export function getDefaultUnitForPropertyName(property: string): CSSUnit | undefined {
    return DEFAULT_UNITS_BY_PROPERTY_NAME[property];
}
