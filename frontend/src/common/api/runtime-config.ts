export interface CardBuilderRuntimeConfig {
    baseDomain: string;
    baseSchema: string;
    integrationVersion?: string;
    hasToken?: boolean;
}

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

export function buildCreateAccountUrl(): string | null {
    if (!runtimeConfig) return null;
    return `${runtimeConfig.baseSchema}://www.${runtimeConfig.baseDomain}/create-account`;
}

export function buildConsoleUrl(): string | null {
    if (!runtimeConfig) return null;
    return `${runtimeConfig.baseSchema}://console.${runtimeConfig.baseDomain}/`;
}
