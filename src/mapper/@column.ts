import { internal } from "../internal/internal";
import { SqlDataType } from "../sqlExpressions/sqlDataType";

declare type ColumnConfig = {
    name?: string,
    maxLength?: number,
    columnType?: SqlDataType,
}

/**
 * Define that property is a column of a table
 * @param name the name of column in database, if empty will be set to class name
 */
export function Column(name?: string) : (target: any, propertyName: string) => void;

/**
 * Define that property is a column in a database
 * @param config the configuration of the column, such as name, max length and columnType
 */
export function Column(config: ColumnConfig) : (target: any, propertyName: string) => void;

export function Column(config?: string | ColumnConfig) {
    return (target: any, propertyName: string) => {
        const mapper = internal.mapper;
        const desc = mapper.mapOf(target, propertyName);
        
        if(config) {
            const cfg = typeof config === 'string'? { name: config } : config;
            desc.property.name = cfg.name || propertyName;
            desc.property.maxLength = cfg.maxLength;
            desc.property.columnType = cfg.columnType || desc.property.columnType;
        }
    }
}