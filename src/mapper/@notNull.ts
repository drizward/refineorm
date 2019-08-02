import { internal } from "../internal/internal";


export function NotNull(defaultValue?: any) {
    return (target: any, propertyName: string) => {
        const mapper = internal.mapper;
        const desc = mapper.mapOf(target, propertyName);
        
        desc.property.isNullable = false;
        if(defaultValue)
            desc.property.defaultValue = defaultValue;
    }
}