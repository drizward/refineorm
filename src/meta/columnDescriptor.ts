
import { SqlValueConverter } from '../sqlValueConverter'
import { SqlDataType } from '../sqlExpressions/sqlDataType';
import { ClassType } from '../internal/internal';

export interface ColumnDescriptor {

    name: string;
    maxLength: number;
    propertyName: string;

    defaultValue: any;
    columnType?: SqlDataType;
    classType?: any;
    converter: SqlValueConverter;

    isNullable: boolean;
    isAutoIncrement: boolean;
    isReadonly: boolean;
    isCredential: boolean;
    isLazy: boolean;
    isKey: boolean;
    isGenerated: boolean;

    isReference: boolean;
    referenceTo?: ColumnDescriptor;

    isCollection: boolean;
    collectionType?: ClassType<any>

}