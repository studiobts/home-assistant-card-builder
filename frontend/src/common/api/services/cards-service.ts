import { BASE_PATH, type CardData, type CreateCardInput, type UpdateCardInput } from '@/common/api/types';
import type { HomeAssistant } from 'custom-card-helpers';

const BASE_CARDS_PATH = `${BASE_PATH}/cards`;

/**
 * Service for managing Card Builder cards via WebSocket API
 */
export class CardsService {
    constructor(private hass: HomeAssistant) {
    }

    /**
     * List all cards
     */
    async listCards(): Promise<CardData[]> {
        return this.hass.callWS<CardData[]>({
            type: `${BASE_CARDS_PATH}/list`,
        });
    }

    /**
     * Get a single card by ID
     */
    async getCard(id: string): Promise<CardData | undefined> {
        const cards = await this.listCards();
        return cards.find(card => card.id === id);
    }

    /**
     * Create a new card
     */
    async createCard(input: CreateCardInput): Promise<CardData> {
        return this.hass.callWS<CardData>({
            type: `${BASE_CARDS_PATH}/create`,
            ...input,
        });
    }

    /**
     * Update an existing card
     */
    async updateCard(id: string, input: UpdateCardInput): Promise<CardData> {
        return this.hass.callWS<CardData>({
            type: `${BASE_CARDS_PATH}/update`,
            card_id: id,
            ...input,
        });
    }

    /**
     * Delete a card
     */
    async deleteCard(id: string): Promise<void> {
        await this.hass.callWS({
            type: `${BASE_CARDS_PATH}/delete`,
            card_id: id,
        });
    }

    /**
     * Subscribe to real-time card updates
     * @param callback Function called when cards are created, updated, or deleted
     * @returns Unsubscribe function
     */
    async subscribeToUpdates(
        callback: () => void
    ): Promise<() => void> {
        // Use Home Assistant's subscription pattern
        // The DictStorageCollectionWebsocket provides subscribe command
        return await this.hass.connection.subscribeMessage(
            () => {
                callback()
            }, // When any card event happens, call the callback
            {
                type: `${BASE_CARDS_PATH}/subscribe`,
            }
        );
    }
}

