import { SqlTypeMapper } from "./sqlTypeMapper";
import { DataTypeDescriptor } from "../meta/dataTypeDescriptor";
import { SqlDataType } from "../sqlExpressions/sqlDataType";

export class StandardTypeMapper implements SqlTypeMapper {

    protected readonly typeMaps: { [name: string]: DataTypeDescriptor } = {
        [String.name] : { sqlType: SqlDataType.Varchar, length: 1024 },
        [Number.name]: { sqlType: SqlDataType.Integer },
        [Boolean.name]: { sqlType: SqlDataType.Boolean },
        [Date.name]: { sqlType: SqlDataType.Date, converter: (x: Date) => x.toDateString() }
    } 

    mapDataType(cls: any): DataTypeDescriptor { 
        if(!cls) return null;           
        return this.typeMaps[cls.name];
    }

}