export interface CardBuilderRuntimeConfig {
    baseDomain: string;
    baseSchema: string;
    integrationVersion?: string;
    hasToken?: boolean;
}

const RUNTIME_CONFIG_EVENT_NAME = 'card-builder-runtime-config-change';

let runtimeConfig: CardBuilderRuntimeConfig | null = null;

export function setRuntimeConfig(config: CardBuilderRuntimeConfig): void {
    runtimeConfig = config;
}

export function getRuntimeConfig(): CardBuilderRuntimeConfig | null {
    return runtimeConfig;
}

export function hasRuntimeToken(): boolean {
    return Boolean(runtimeConfig?.hasToken);
}

export function updateRuntimeConfig(patch: Partial<CardBuilderRuntimeConfig>): void {
    if (!runtimeConfig) return;
    runtimeConfig = {
        ...runtimeConfig,
        ...patch,
    };
}

export function notifyRuntimeConfigChange(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(RUNTIME_CONFIG_EVENT_NAME));
}

export function subscribeRuntimeConfigChange(handler: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(RUNTIME_CONFIG_EVENT_NAME, handler);
    return () => window.removeEventListener(RUNTIME_CONFIG_EVENT_NAME, handler);
}

export function buildCreateAccountUrl(): string | null {
    if (!runtimeConfig) return null;
    return `${runtimeConfig.baseSchema}://www.${runtimeConfig.baseDomain}/create-account`;
}

export function buildConsoleUrl(): string | null {
    if (!runtimeConfig) return null;
    return `${runtimeConfig.baseSchema}://console.${runtimeConfig.baseDomain}/`;
}
