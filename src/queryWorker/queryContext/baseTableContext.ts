import { TableDescriptor } from "../../meta/tableDescriptor";

export interface BaseTableContext {
    tableName: string;
    descriptor: TableDescriptor;
}