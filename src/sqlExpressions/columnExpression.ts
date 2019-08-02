
import { SqlConstraint } from './sqlConstraint';
import { DataTypeExpression } from './dataTypeExpression';
import { ConstraintExpression } from './constraintExpression';

export interface ColumnExpression {

    type: "ColumnExpression";
    name: string;
    tableName: string;
    constraints: ConstraintExpression[];
    defaultValue: any;
    sqlType: DataTypeExpression;
    classType: any;
    isNullable: boolean;
    isAutoIncrement: boolean;

}