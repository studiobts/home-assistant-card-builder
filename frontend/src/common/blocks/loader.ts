// Import block classes for registration
import { BlockIcon } from '@/common/blocks/components/basic/block-icon';
import { BlockImage } from '@/common/blocks/components/basic/block-image';
import { BlockText } from '@/common/blocks/components/basic/block-text';
import { BlockEntityFieldAttribute } from '@/common/blocks/components/entities/fields/block-entity-field-attribute';
import { BlockEntityFieldIcon } from '@/common/blocks/components/entities/fields/block-entity-field-icon';
import { BlockEntityFieldImage } from '@/common/blocks/components/entities/fields/block-entity-field-image';
import { BlockEntityFieldName } from '@/common/blocks/components/entities/fields/block-entity-field-name';
import { BlockEntityFieldState } from '@/common/blocks/components/entities/fields/block-entity-field-state';
import { BlockButtonToggle } from '@/common/blocks/components/controls/block-button-toggle';
import { BlockSelectMenu } from '@/common/blocks/components/controls/block-select-menu';
import { BlockSlider } from '@/common/blocks/components/controls/block-slider';
import { BlockGaugeLinear } from '@/common/blocks/components/gauges/block-gauge-linear/block-gauge-linear';
import { BlockGaugeRadial } from '@/common/blocks/components/gauges/block-gauge-radial';
import { BlockGaugeTachometer } from '@/common/blocks/components/gauges/block-gauge-tachometer';
import { BlockContainer } from '@/common/blocks/components/layout/block-container';
import { BlockColumns } from '@/common/blocks/components/layout/block-columns';
import { BlockDropZone } from '@/common/blocks/components/layout/block-drop-zone';
import { BlockGrid } from '@/common/blocks/components/layout/block-grid';
import { BlockLink } from '@/common/blocks/components/advanced/block-link/block-link';
import { BlockWeatherBackground } from '@/common/blocks/components/weather/block-weather-background/block-weather-background';
import { BlockHourlyForecast } from '@/common/blocks/components/weather/block-hourly-forecast';
import { BlockChartLineArea } from '@/common/blocks/components/charts/block-chart-line-area/block-chart-line-area';
import { BlockChartBars } from '@/common/blocks/components/charts/block-chart-bars/block-chart-bars';
import { BlockChartPieDonut } from '@/common/blocks/components/charts/block-chart-pie-donut/block-chart-pie-donut';
import { blockRegistry } from '@/common/blocks/core/registry/block-registry';

export { BlockBase } from '@/common/blocks/components/block-base';

/**
 * Bootstrap block registration
 * Each block class provides its own configuration via getBlockConfig()
 */
function registerBlocks() {
    const blockClasses = [
        {type: 'block-text', blockClass: BlockText},
        {type: 'block-icon', blockClass: BlockIcon},
        {type: 'block-image', blockClass: BlockImage},
        {type: 'block-container', blockClass: BlockContainer},
        {type: 'block-columns', blockClass: BlockColumns},
        {type: 'block-drop-zone', blockClass: BlockDropZone},
        {type: 'block-grid', blockClass: BlockGrid},
        {type: 'block-link', blockClass: BlockLink},
        {type: 'block-weather-background', blockClass: BlockWeatherBackground},
        {type: 'block-hourly-forecast', blockClass: BlockHourlyForecast},
        {type: 'block-entity-field-state', blockClass: BlockEntityFieldState},
        {type: 'block-entity-field-icon', blockClass: BlockEntityFieldIcon},
        {type: 'block-entity-field-name', blockClass: BlockEntityFieldName},
        {type: 'block-entity-field-attribute', blockClass: BlockEntityFieldAttribute},
        {type: 'block-entity-field-image', blockClass: BlockEntityFieldImage},
        {type: 'block-button-toggle', blockClass: BlockButtonToggle},
        {type: 'block-select-menu', blockClass: BlockSelectMenu},
        {type: 'block-slider', blockClass: BlockSlider},
        {type: 'block-gauge-linear', blockClass: BlockGaugeLinear},
        {type: 'block-gauge-radial', blockClass: BlockGaugeRadial},
        {type: 'block-gauge-tachometer', blockClass: BlockGaugeTachometer},
        {type: 'block-chart-line-area', blockClass: BlockChartLineArea},
        {type: 'block-chart-bars', blockClass: BlockChartBars},
        {type: 'block-chart-pie-donut', blockClass: BlockChartPieDonut},
    ];

    blockClasses.forEach(({type, blockClass}) => {
        const config = blockClass.getBlockConfig();
        if (config) {
            blockRegistry.register(type, blockClass, config);
        } else {
            console.warn(`[BlockRegistry] Block class "${type}" does not provide getBlockConfig()`);
        }
    });
}

// Auto-register all blocks when this module is imported
registerBlocks();
