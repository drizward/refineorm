import { internal } from "../internal/internal";

/**
 * Define that property hold a sensitive data and should not be retrieved on read unless requested.
 */
export function Credential() {
    return (target: any, propertyName: string) => {
        internal.mapper
                .mapOf(target, propertyName)
                .property
                .isCredential = true;
    }
}