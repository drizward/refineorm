import { internal } from "../internal/internal";

export const ProvideFor = (id: string) => {
    return function(target: any) {
        internal.providers[id] = target;
    }
}