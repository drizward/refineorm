import { SqlPropertyExpression } from './sqlPropertyExpression';

export interface OrderByExpression {
    type: "OrderByExpression";
    column: SqlPropertyExpression;
    isDescending: boolean;
}