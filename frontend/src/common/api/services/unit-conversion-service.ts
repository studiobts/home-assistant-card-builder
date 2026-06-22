import type { HomeAssistant } from 'custom-card-helpers';

const WS_UNIT_CONVERSION_INFO = 'card_builder/unit/conversion_info';

export interface UnitConversionInfoResponse {
    supported: boolean;
    multiplier?: number;
    from_unit?: string;
    to_unit?: string;
}

interface ConvertibleUnitsResponse {
    units?: string[];
}

const convertibleUnitsCache = new Map<string, Promise<string[]>>();
const multiplierCache = new Map<string, Promise<UnitConversionInfoResponse>>();

function buildKey(parts: Array<string | undefined>): string {
    return parts.map((part) => part || '').join('|');
}

export class UnitConversionService {
    constructor(private hass: HomeAssistant) {}

    setHass(hass: HomeAssistant): void {
        this.hass = hass;
    }

    async getConvertibleUnits(domain: string, deviceClass?: string): Promise<string[]> {
        if (!deviceClass) {
            return [];
        }

        const key = buildKey([domain, deviceClass]);
        const cached = convertibleUnitsCache.get(key);
        if (cached) {
            return cached;
        }

        const request = this.hass.callWS<ConvertibleUnitsResponse>({
            type: `${domain}/device_class_convertible_units`,
            device_class: deviceClass,
        })
            .then((response) => Array.isArray(response?.units) ? response.units : [])
            .catch(() => []);

        convertibleUnitsCache.set(key, request);
        return request;
    }

    async getConversionInfo(
        domain: string,
        deviceClass: string | undefined,
        fromUnit: string | undefined,
        toUnit: string | undefined
    ): Promise<UnitConversionInfoResponse> {
        if (!deviceClass || !fromUnit || !toUnit || fromUnit === toUnit) {
            return {
                supported: Boolean(fromUnit && toUnit),
                multiplier: 1,
                from_unit: fromUnit,
                to_unit: toUnit,
            };
        }

        const key = buildKey([domain, deviceClass, fromUnit, toUnit]);
        const cached = multiplierCache.get(key);
        if (cached) {
            return cached;
        }

        const request = this.hass.callWS<UnitConversionInfoResponse>({
            type: WS_UNIT_CONVERSION_INFO,
            domain,
            device_class: deviceClass,
            from_unit: fromUnit,
            to_unit: toUnit,
        }).catch(() => ({supported: false}));

        multiplierCache.set(key, request);
        return request;
    }
}
