import { createContext } from '@lit/context';
import type { HomeAssistant } from 'custom-card-helpers';

import { type CardData, getCardsService } from '@/common/api';

export interface ImportValidationResult {
    data: Partial<CardData> | null;
    error: string | null;
    name?: string;
    description?: string;
}

export class CardsManager {
    private cardsService?: ReturnType<typeof getCardsService>;

    setHass(hass: HomeAssistant): void {
        this.cardsService = getCardsService(hass);
    }

    getDefaultDuplicateName(cardName: string): string {
        return `${cardName} (Copy)`;
    }

    getDefaultExportFileName(cardName: string): string {
        return this._slugifyFileName(cardName);
    }

    async duplicateCard(card: CardData, newName: string): Promise<CardData> {
        const service = this._requireService();
        const name = newName.trim();
        if (!name) {
            throw new Error('Card name is required');
        }

        return service.createCard({
            name,
            description: card.description,
            config: this._cloneConfig(card.config),
        });
    }

    async importCard(data: Partial<CardData>, name: string, description: string): Promise<CardData> {
        const service = this._requireService();
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error('Card name is required');
        }
        if (!data.config || typeof data.config !== 'object') {
            throw new Error('Invalid card data: missing or invalid "config" field');
        }

        return service.createCard({
            name: trimmedName,
            description: description.trim(),
            config: this._cloneConfig(data.config),
        });
    }

    validateImportJson(jsonText: string): ImportValidationResult {
        if (!jsonText.trim()) {
            return {data: null, error: null};
        }

        try {
            const data = JSON.parse(jsonText);

            if (typeof data !== 'object' || data === null) {
                return {data: null, error: 'Invalid JSON: must be an object'};
            }

            if (!data.config || typeof data.config !== 'object') {
                return {data: null, error: 'Invalid card data: missing or invalid "config" field'};
            }

            return {
                data: data as Partial<CardData>,
                error: null,
                name: data.name || '',
                description: data.description || '',
            };
        } catch (err) {
            return {
                data: null,
                error: `Invalid JSON: ${err instanceof Error ? err.message : 'parsing error'}`,
            };
        }
    }

    async readJsonFile(file: File): Promise<string> {
        if (!file.name.endsWith('.json')) {
            throw new Error('Please select a JSON file');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve((e.target?.result as string) ?? '');
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsText(file);
        });
    }

    exportCard(card: CardData, fileName: string): void {
        const filename = this._normalizeExportFileName(fileName, card.name);
        this._downloadJsonFile(filename, this._buildExportPayload(card));
    }

    private _requireService(): ReturnType<typeof getCardsService> {
        if (!this.cardsService) {
            throw new Error('Cards service not available');
        }
        return this.cardsService;
    }

    private _cloneConfig<T>(config: T): T {
        return JSON.parse(JSON.stringify(config));
    }

    private _slugifyFileName(name: string): string {
        const trimmed = name.trim();
        if (!trimmed) return 'card';
        const normalized = trimmed
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
        return normalized || 'card';
    }

    private _normalizeExportFileName(input: string, fallbackName: string): string {
        const trimmed = input.trim();
        if (!trimmed) {
            return `${this._slugifyFileName(fallbackName)}.json`;
        }

        let base = trimmed;
        if (base.toLowerCase().endsWith('.json')) {
            base = base.slice(0, -5).trim();
        }

        const safe = this._slugifyFileName(base);
        return `${safe}.json`;
    }

    private _buildExportPayload(card: CardData): CardData {
        return {
            id: card.id,
            name: card.name,
            description: card.description,
            config: card.config,
            created_at: card.created_at,
            updated_at: card.updated_at,
        };
    }

    private _downloadJsonFile(filename: string, payload: CardData): void {
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.rel = 'noopener';
        anchor.click();

        URL.revokeObjectURL(url);
    }
}

export const cardsManagerContext = createContext<CardsManager>('cards-manager');
