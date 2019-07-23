import { ColumnDescriptor } from './columnDescriptor';

export interface ViewDescriptor {

    name: string;
    fields: Map<string, ColumnDescriptor>;
    isTemporary: boolean;

}