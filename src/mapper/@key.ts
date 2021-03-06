
import 'reflect-metadata'
import { internal } from '../internal/internal';

/**
 * Define that property has flag as a primary key in the database
 */
export function Key(autoIncrement: boolean = false) {
    return (target: any, propertyName: string) => {
        const mapper = internal.mapper;
        const desc = mapper.mapOf(target, propertyName);
        mapper.setAsKey(desc);

        desc.property.isAutoIncrement = autoIncrement;
    }
}