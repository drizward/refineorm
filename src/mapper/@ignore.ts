import { internal } from "../internal/internal";
import 'reflect-metadata';

/**
 * Define that property will be ignored on any SQL operation.
 * Note that all property are ignored by default.
 * Use this decorator for property with default value which will be ignored.
 */
export function Ignore() {
    return (target: any, propertyName: string) => {
        internal.mapper.ignoreMapOf(target, propertyName);
        console.log(Reflect.getMetadata('design:type', target, propertyName));
    }
}