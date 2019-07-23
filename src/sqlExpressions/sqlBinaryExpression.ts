import { SqlOperator } from './sqlOperator';
import { SqlStatement } from './sqlStatement';

export interface SqlBinaryExpression {

    type: "SqlBinaryExpression";
    left: SqlStatement;
    right: SqlStatement;
    operator: SqlOperator;
    
}