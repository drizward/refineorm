import { SqlConstraint } from "./sqlConstraint";
import { SqlStatement } from './sqlStatement';
import { ColumnExpression } from './columnExpression';

export interface ConstraintExpression {

    type: "ConstraintExpression";
    constraint: SqlConstraint;
    columnName: string;
    value?: SqlStatement | ColumnExpression;

}