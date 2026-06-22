import * as echarts from 'echarts/core';
import {
    BarChart,
    LineChart,
    PieChart,
} from 'echarts/charts';
import {
    DataZoomComponent,
    DatasetComponent,
    GraphicComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    TooltipComponent,
    VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    LineChart,
    BarChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    GraphicComponent,
    DataZoomComponent,
    VisualMapComponent,
    DatasetComponent,
    CanvasRenderer,
]);

export { echarts };
