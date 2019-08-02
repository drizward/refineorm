import { internal } from "../internal/internal";


export function DefaultValue(value: any) {
    return (target: any, propertyName: string) => {
        const mapper = internal.mapper;
        const desc = mapper.mapOf(target, propertyName);
        
        desc.property.defaultValue = value;
    }
}