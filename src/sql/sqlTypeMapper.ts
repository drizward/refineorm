import { DataTypeDescriptor } from "../meta/dataTypeDescriptor";

export interface SqlTypeMapper {

    mapDataType(cls: any): DataTypeDescriptor;

}