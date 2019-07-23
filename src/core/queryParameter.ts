
export interface QueryParameter {
    value: string | number | boolean | (() => any);
    name: string;
}