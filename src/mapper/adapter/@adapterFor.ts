import { ClassType, internal } from "../../internal/internal";

export function AdapterFor<T>(classType: ClassType<T>, isStatic: boolean = false) {
    return (target: any) => internal.adapterMapper.createAdapterFor(target.constructor, classType);
}