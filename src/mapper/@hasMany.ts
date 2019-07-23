import { internal, ClassType } from '../internal/internal';
import { AssociationInfo } from '../internal/descriptorMapper';

export function HasMany<T>(type: (of?: any) => ClassType<T>, prop?: (on: T) => any) {
    return (target: any, propertyName: string) => {
        const desc = internal.mapper.mapOf(target, propertyName);

        if(desc.property.classType) {
            desc.property.collectionType = desc.property.classType;
            desc.property.isCollection = true;
        }

        const classType = type();
        if(classType) {
            internal.mapper.attachReference(desc, classType, prop);
        }
        else {
            const info: AssociationInfo = {
                type: "AssociationInfo",
                of: type,
                on: prop,
                association: "Many"
            };

            desc.property.classType = info;
            desc.type.isValidated = false;
        }
    }
}