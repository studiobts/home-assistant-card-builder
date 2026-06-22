import type {
    ResolvedUnitDisplay,
    UnitConversionSource,
    UnitDisplayConfig,
} from '@/common/core/unit-conversion/types';

function clampDecimals(decimals: number): number {
    if (!Number.isFinite(decimals)) {
        return 2;
    }
    return Math.max(0, Math.min(6, Math.round(decimals)));
}

export function applyUnitMultiplier(value: number, multiplier: number): number {
    return Number.isFinite(multiplier) ? value * multiplier : value;
}

export function formatConvertedValue(value: number, decimals: number, unit?: string, showUnit: boolean = false): string {
    const fixedDecimals = clampDecimals(decimals);
    const formatted = Number(value.toFixed(fixedDecimals)).toString();
    return showUnit && unit ? `${formatted} ${unit}` : formatted;
}

export function resolveSourceUnitDisplay(source: UnitConversionSource): ResolvedUnitDisplay {
    return {
        multiplier: 1,
        unit: source.sourceUnit,
    };
}

export function resolveCustomUnitDisplay(config: UnitDisplayConfig, source: UnitConversionSource): ResolvedUnitDisplay {
    return {
        multiplier: Number.isFinite(config.customMultiplier) ? config.customMultiplier : 1,
        unit: config.customUnit || source.sourceUnit,
    };
}
