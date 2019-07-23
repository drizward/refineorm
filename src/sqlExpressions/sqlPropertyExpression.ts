import { SqlViewExpression } from './sqlViewExpression';

export interface SqlPropertyExpression {
    type: "SqlPropertyExpression";
    property: string;
    view: string | SqlViewExpression;
}