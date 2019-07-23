import { SqlDataType } from "../sqlExpressions/sqlDataType";

export interface DataTypeDescriptor {

    sqlType: SqlDataType;
    length?: number;
    converter?: (value: any) => string | number | boolean;

}