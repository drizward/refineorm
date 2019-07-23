import { SqlDataType } from "./sqlDataType";

export interface DataTypeExpression {

    type: "DataTypeExpression"
    dataType: SqlDataType;
    length?: number;        

}