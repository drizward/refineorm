import { SqlOperator } from './sqlOperator';
import { SqlIdentifierExpression } from './sqlIdentifierExpression';
import { SqlLiteralExpression } from './sqlLiteralExpression';
import { SqlStatement } from './sqlStatement';

export interface SqlUnaryExpression {
    type: "SqlUnaryExpression";
    operator: SqlOperator;
    operand: SqlStatement;
    isPrefixed: boolean; 
}