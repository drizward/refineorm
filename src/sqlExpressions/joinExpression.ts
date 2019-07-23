import { TableExpression } from "./tableExpression";
import { JoinType } from './joinType';
import { SqlPropertyExpression } from './sqlPropertyExpression';
import { SqlBinaryExpression } from "./sqlBinaryExpression";

export interface JoinExpression {
    type: "JoinExpression";
    table: TableExpression;
    alias?: string;
    joinType: JoinType;
    predicate: SqlBinaryExpression;
}