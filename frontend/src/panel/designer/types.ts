export interface TabConfig {
    id: string;
    label: string;
    component: string;
    props?: Record<string, any>;
}

export interface DimensionChangeDetail {
    property: string;
    value: number;
    unit: string;
    cssValue: string;
    customized: boolean;
}
