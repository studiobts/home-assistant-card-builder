/**
 * Property Configuration Resolver
 *
 * Resolves which properties should be visible for a block type
 * based on its style configuration.
 */

import {
    ALL_PROPERTY_GROUPS,
    type BlockStyleConfig,
    GROUP_PROPERTIES,
    type PanelPreset,
    PRESET_CONFIGS,
    type PropertyGroupId
} from '@/common/blocks/style';

/**
 * Resolved property configuration - computed from BlockStyleConfig
 */
export interface ResolvedPropertyConfig {
    /** Set of visible groups */
    groups: Set<PropertyGroupId>;
    /** Set of visible properties (format: "category.property") */
    properties: Set<string>;
    /** Set of explicitly excluded properties */
    excludedProperties: Set<string>;
}

// ============================================================================
// Property Configuration Resolver
// ============================================================================

/**
 * Resolves property visibility configuration for block types
 */
export class PropertyConfigResolver {
    // ==========================================================================
    // Main Resolution
    // ==========================================================================

    /**
     * Resolve visible properties for a style config
     */
    resolve(config?: BlockStyleConfig): ResolvedPropertyConfig {
        return this.resolveConfig(config);
    }

    // ==========================================================================
    // Resolution Logic
    // ==========================================================================

    /**
     * Resolve a BlockStyleConfig into ResolvedPropertyConfig
     */
    private resolveConfig(config: BlockStyleConfig | undefined): ResolvedPropertyConfig {
        // No config = full visibility (default behavior)
        if (!config) {
            return this.createFullResolvedConfig();
        }

        const result = this.createEmptyResolvedConfig();

        // 1. Start with preset if specified
        if (config.preset) {
            this.applyPreset(result, config.preset);
        }

        // 2. Add explicit groups
        if (config.groups) {
            for (const groupId of config.groups) {
                this.addGroup(result, groupId);
            }
        }

        // 3. Add explicit properties
        if (config.properties) {
            for (const property of config.properties) {
                result.properties.add(property);
                // Also add the group if property is from a known group
                const groupId = this.getGroupForProperty(property);
                if (groupId) {
                    result.groups.add(groupId);
                }
            }
        }

        // 4. Apply exclusions
        if (config.exclude) {
            this.applyExclusions(result, config.exclude);
        }

        return result;
    }

    private createEmptyResolvedConfig(): ResolvedPropertyConfig {
        return {
            groups: new Set(),
            properties: new Set(),
            excludedProperties: new Set(),
        };
    }

    private createFullResolvedConfig(): ResolvedPropertyConfig {
        const config = this.createEmptyResolvedConfig();

        for (const groupId of ALL_PROPERTY_GROUPS) {
            config.groups.add(groupId);
            for (const property of GROUP_PROPERTIES[groupId]) {
                config.properties.add(property);
            }
        }

        return config;
    }

    /**
     * Apply a preset to the configuration
     */
    private applyPreset(result: ResolvedPropertyConfig, preset: PanelPreset): void {
        const presetConfig = PRESET_CONFIGS[preset];
        if (!presetConfig) {
            console.warn(`[PropertyConfigResolver] Unknown preset: ${preset}`);
            return;
        }

        // Add preset groups
        if (presetConfig.groups) {
            for (const groupId of presetConfig.groups) {
                this.addGroup(result, groupId);
            }
        }

        // Add preset properties
        if (presetConfig.properties) {
            for (const property of presetConfig.properties) {
                result.properties.add(property);
                const groupId = this.getGroupForProperty(property);
                if (groupId) {
                    result.groups.add(groupId);
                }
            }
        }

        if (presetConfig.exclude) {
            this.applyExclusions(result, presetConfig.exclude);
        }
    }

    /**
     * Add a group and its properties to the configuration
     */
    private addGroup(result: ResolvedPropertyConfig, groupId: PropertyGroupId): void {
        result.groups.add(groupId);

        const properties = GROUP_PROPERTIES[groupId];
        if (properties) {
            for (const property of properties) {
                result.properties.add(property);
            }
        }
    }

    /**
     * Apply exclusions to the configuration
     */
    private applyExclusions(
        result: ResolvedPropertyConfig,
        exclude: NonNullable<BlockStyleConfig['exclude']>
    ): void {
        // Remove excluded groups
        if (exclude.groups) {
            for (const groupId of exclude.groups) {
                result.groups.delete(groupId);
                // Remove all properties from that group
                const properties = GROUP_PROPERTIES[groupId];
                if (properties) {
                    for (const property of properties) {
                        result.properties.delete(property);
                    }
                }
            }
        }

        // Remove excluded properties
        if (exclude.properties) {
            for (const property of exclude.properties) {
                result.excludedProperties.add(property);
                // Note: We don't remove from properties set, we use excludedProperties
                // to track explicit exclusions separately. This allows checking
                // if something was explicitly excluded vs just not included.
            }
        }
    }

    /**
     * Get the group ID for a property
     */
    private getGroupForProperty(property: string): PropertyGroupId | undefined {
        for (const [groupId, properties] of Object.entries(GROUP_PROPERTIES)) {
            if (properties.includes(property)) {
                return groupId as PropertyGroupId;
            }
        }
        return undefined;
    }

}
