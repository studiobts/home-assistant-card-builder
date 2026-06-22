export const UNIT_DISPLAY_MODES = ['source', 'target', 'custom'] as const;

export type UnitDisplayMode = (typeof UNIT_DISPLAY_MODES)[number];

export interface UnitDisplayConfig {
    showUnit: boolean;
    mode: UnitDisplayMode;
    targetUnit: string;
    customUnit: string;
    customMultiplier: number;
}

export interface UnitConversionSource {
    domain: string;
    deviceClass?: string;
    sourceUnit?: string;
}

export interface ResolvedUnitDisplay {
    multiplier: number;
    unit?: string;
}

export const DEFAULT_UNIT_DISPLAY_CONFIG: UnitDisplayConfig = {
    showUnit: false,
    mode: 'source',
    targetUnit: '',
    customUnit: '',
    customMultiplier: 1,
};

export function createUnitDisplayConfig(overrides: Partial<UnitDisplayConfig> = {}): UnitDisplayConfig {
    return {
        ...DEFAULT_UNIT_DISPLAY_CONFIG,
        ...overrides,
    };
}
