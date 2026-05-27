export type GaugeValueSource = 'state' | 'attribute';

export type GaugeDisplayMode = 'value' | 'percent';

export interface GaugeThreshold {
    id: string;
    value: number;
    color: string;
    label?: string;
}

export function createGaugeThresholdId(): string {
    return `th-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeGaugeThresholds(value: unknown): GaugeThreshold[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const normalized: GaugeThreshold[] = [];
    for (const item of value) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const candidate = item as GaugeThreshold;
        const numeric = parseFloat(String(candidate.value));
        if (!Number.isFinite(numeric)) {
            continue;
        }

        const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';

        normalized.push({
            id: candidate.id,
            value: numeric,
            color: candidate.color,
            label: label || undefined,
        });
    }

    normalized.sort((a, b) => a.value - b.value);
    return normalized;
}
