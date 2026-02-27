/**
 * Card data interfaces and types
 */
import type { DocumentData } from "@/common/core/model/types";

export const BASE_PATH = 'card_builder';

export interface CardData {
    id: string;
    name: string;
    description: string;
    config: DocumentData;
    created_at: string;
    updated_at: string;
}

export interface CreateCardInput {
    name: string;
    description?: string;
    config: DocumentData;
}

export interface UpdateCardInput {
    name?: string;
    description?: string;
    config?: DocumentData;
}

