import { internal, ClassType } from '../internal/internal';
import { AssociationInfo } from '../internal/descriptorMapper';
import { ExpressionHelper } from '../core/expressionHelper';

export function HasOne<T>(type: (of?: any) => ClassType<T>, prop?: (on: T) => any) {
    return (target: any, propertyName: string) => {
        const desc = internal.mapper.mapOf(target, propertyName);

        const classType = type();
        if(classType) {
            internal.mapper.attachReference(desc, classType, prop);
        }
        else {
            const info: AssociationInfo = {
                type: "AssociationInfo",
                of: type,
                on: prop,
                association: "One"
            };
            
            desc.property.classType = info;
            desc.type.isValidated = false;
        }
    }
}