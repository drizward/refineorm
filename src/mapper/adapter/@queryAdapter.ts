import { internal, ClassType } from "../../internal/internal";

export function QueryAdapter(sql: string, returnType: ClassType<any>) {
    return (target: any, methodName: string, descriptor: TypedPropertyDescriptor<Function>) => {
        internal.adapterMapper.createQueryAdapter(target, methodName, sql, returnType);
    }
}