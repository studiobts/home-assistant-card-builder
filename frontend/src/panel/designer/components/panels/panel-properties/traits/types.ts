import type { BlockData, DocumentModel } from "@/common/core/model";
import type { HomeAssistant } from 'custom-card-helpers';

export interface TraitRenderContext {
    /** Istanza Home Assistant */
    hass?: HomeAssistant;
    /** Dati del blocco corrente */
    block: BlockData;
    /** Props correnti del blocco */
    props: Record<string, unknown>;
    /** Handlers per le action */
    actionHandlers?: Map<string, () => void>;
    /** Default entity ID for binding evaluation */
    defaultEntityId?: string;
    /** Document model for entity resolution */
    documentModel?: DocumentModel;
    /** Template errors by property name */
    templateErrors?: Record<string, string | undefined>;
}
