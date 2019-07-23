import { internal } from "../internal/internal";

export function Readonly() {
    return (target: any, propertyName: string) => {
        internal.mapper
                .mapOf(target, propertyName)
                .property
                .isReadonly = true;
    }
}