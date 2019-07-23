
import { internal } from '../internal/internal';
import 'reflect-metadata';

export function Table(name?: string, schema?: string) {
    return (target: any) => {
        Reflect.defineMetadata('refine:istable', true, target);
        
        const mapper = internal.mapper;
        const td = mapper.mapOf(target);
        td.isDescribed = true;
        
        if(name)
            td.name = name;

        if(schema)
            td.schema = schema;
    }
}