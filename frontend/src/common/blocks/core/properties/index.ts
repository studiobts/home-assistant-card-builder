/**
 * Property Traits Type Definitions
 *
 * Sistema dichiarativo per la definizione delle proprietà editabili dei blocchi.
 */
import type { ValueBinding } from '@/common/core/binding';
import type { CSSUnit } from "@/common/types";
// ============================================================================
// Visibility Conditions
// ============================================================================

/**
 * Condizione di visibilità basata su confronto con una proprietà
 */
export interface PropEqualCondition {
    prop: string;
    eq: unknown;
}

export interface PropNotEqualCondition {
    prop: string;
    neq: unknown;
}

export interface PropInCondition {
    prop: string;
    in: unknown[];
}

export interface PropExistsCondition {
    prop: string;
    exists: boolean;
}

/**
 * Condizioni logiche composte
 */
export interface AndCondition {
    and: PropertyVisibilityCondition[];
}

export interface OrCondition {
    or: PropertyVisibilityCondition[];
}

export interface NotCondition {
    not: PropertyVisibilityCondition;
}

/**
 * Condizione custom con nome funzione da valutare
 */
export interface CustomCondition {
    custom: string;
}

/**
 * Union type per tutte le condizioni di visibilità
 */
export type PropertyVisibilityCondition =
    | PropEqualCondition
    | PropNotEqualCondition
    | PropInCondition
    | PropExistsCondition
    | AndCondition
    | OrCondition
    | NotCondition
    | CustomCondition;

export type BindingValueInputConfig =
    | { type: 'number'; min?: number; max?: number; step?: number; unit?: CSSUnit; units?: CSSUnit[]; }
    | { type: 'slider'; min: number; max: number; step?: number; unit?: CSSUnit; units?: CSSUnit[]; }
    | { type: 'color' }
    | { type: 'select'; options: Array<{ label: string; value: string }> }
    | { type: 'spacing'; unit?: CSSUnit; units?: CSSUnit[] }
    | { type: 'icon-picker'; placeholder?: string }
    | { type: 'text'; placeholder?: string };

// ============================================================================
// Base Trait
// ============================================================================

/**
 * Tipo base per tutti i traits
 */
export interface PropertyTraitBase {
    /** Chiave della proprietà in props (es: 'fontSize') */
    name: string;
    /** Etichetta visualizzata nell'UI */
    label: string;
    /** Tooltip/descrizione opzionale */
    description?: string;
    /** Condizione di visibilità */
    visible?: PropertyVisibilityCondition;
    /** Binding configuration for dynamic values */
    binding?: BindingValueInputConfig;
}

/**
 * Template keyword definition (for UI legends)
 */
export interface TemplateKeywordDefinition {
    key: string;
    description: string;
}

/**
 * Trait property value with optional binding metadata
 */
export interface TraitPropertyValue {
    value?: unknown;
    binding?: ValueBinding;
}

// ============================================================================
// Specific Trait Types
// ============================================================================

/**
 * Text input trait
 */
export interface TextTrait extends PropertyTraitBase {
    type: 'text';
    placeholder?: string;
    /** Keywords for template rendering (eg. for legends) */
    templateKeywords?: TemplateKeywordDefinition[];
}

/**
 * Number input trait
 */
export interface NumberTrait extends PropertyTraitBase {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
}

/**
 * Color picker trait
 */
export interface ColorTrait extends PropertyTraitBase {
    type: 'color';
}

/**
 * Checkbox trait
 */
export interface CheckboxTrait extends PropertyTraitBase {
    type: 'checkbox';
}

/**
 * Select dropdown trait
 */
export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectTrait extends PropertyTraitBase {
    type: 'select';
    options: SelectOption[];
}

export type SelectOptionsProvider = (context: unknown) => SelectOption[];

export interface ContextSelectTrait extends PropertyTraitBase {
    type: 'context-select';
    options?: SelectOption[];
    optionsProvider?: SelectOptionsProvider;
    emptyLabel?: string;
}

/**
 * Textarea trait
 */
export interface TextareaTrait extends PropertyTraitBase {
    type: 'textarea';
    rows?: number;
    placeholder?: string;
    /** Lista keyword disponibili per template */
    templateKeywords?: TemplateKeywordDefinition[];
}

/**
 * Entity picker trait (Home Assistant)
 */
export interface EntityPickerTrait extends PropertyTraitBase {
    type: 'entity-picker';
    includeDomains?: string[];
    excludeDomains?: string[];
    deviceClass?: string[];
}

/**
 * Icon picker trait
 */
export interface IconPickerTrait extends PropertyTraitBase {
    type: 'icon-picker';
    placeholder?: string;
}

/**
 * Action button trait - apre overlay/pannelli dedicati
 */
export interface ActionTrait extends PropertyTraitBase {
    type: 'action';
    /** Testo del pulsante */
    buttonLabel: string;
    /** Identificatore dell'azione da eseguire */
    actionId: string;
    /** Icona opzionale per il pulsante */
    icon?: string;
}

/**
 * Media picker trait - opens media manager and stores a media reference
 */
export interface MediaPickerTrait extends PropertyTraitBase {
    type: 'media-picker';
    /** Optional label when no media is selected */
    emptyLabel?: string;
    /** Select button label */
    selectLabel?: string;
    /** Edit button label */
    editLabel?: string;
    /** Remove button label */
    removeLabel?: string;
    /** Optional prop to set when a selection is confirmed */
    sourceProp?: string;
    /** Value for the sourceProp when selecting media */
    sourceValue?: string;
}

/**
 * Info display trait - mostra informazioni readonly
 */
export interface InfoTrait extends PropertyTraitBase {
    type: 'info';
    /** Funzione custom per generare il contenuto info */
    infoRenderer?: string;
}

/**
 * Entity mode toggle trait - switch tra fixed e slot mode
 */
export interface EntityModeTrait extends PropertyTraitBase {
    type: 'entity-mode';
    /** Nome della proprietà per slotId (default: 'slotId') */
    slotIdProp?: string;
}

/**
 * Attribute picker trait - per selezionare un attributo da un'entity
 */
export interface AttributePickerTrait extends PropertyTraitBase {
    type: 'attribute-picker';
    /** Placeholder per il campo custom */
    placeholder?: string;
}

// ============================================================================
// Union Type for All Traits
// ============================================================================

/**
 * Union type per tutti i tipi di trait supportati
 */
export type PropertyTrait =
    | TextTrait
    | NumberTrait
    | ColorTrait
    | CheckboxTrait
    | SelectTrait
    | ContextSelectTrait
    | TextareaTrait
    | EntityPickerTrait
    | IconPickerTrait
    | ActionTrait
    | MediaPickerTrait
    | InfoTrait
    | EntityModeTrait
    | AttributePickerTrait;

// ============================================================================
// Property Groups
// ============================================================================

/**
 * Gruppo di proprietà (sezione collassabile)
 */
export interface PropertyGroup {
    /** Identificatore univoco del gruppo */
    id: string;
    /** Etichetta visualizzata */
    label: string;
    /** Stato collapsed di default */
    collapsed?: boolean;
    /** Condizione di visibilità del gruppo */
    visible?: PropertyVisibilityCondition;
    /** Lista dei traits nel gruppo */
    traits: PropertyTrait[];
}

// ============================================================================
// Block Property Configuration
// ============================================================================

/**
 * Configurazione completa dei traits per un blocco
 */
export interface BlockPropertyConfig {
    /** Lista dei gruppi di proprietà */
    groups: PropertyGroup[];
}
