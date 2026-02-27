/**
 * Binding Engine - Index
 */

export {
    BindingEvaluator
} from './binding-evaluator';

// Condition evaluator
export {
    evaluateCondition,
    evaluateConditionGroup,
    evaluateConditionRule,
} from './condition-evaluator';

// Template parser
export {
    parseTemplate,
    isTemplate,
    extractTemplateVariables,
    type TemplateContext,
} from './template-parser';

// Value resolver
export {
    resolveValue,
    extractValue,
    getNestedValue,
    toNumber,
    mapRange,
    type ResolverContext,
} from './value-resolver';

// Entity extractor
export {
    extractEntityFromSource,
    extractEntitiesFromBinding,
    extractEntitiesFromCondition,
    extractEntitiesFromBindings,
} from './entity-extractor';

