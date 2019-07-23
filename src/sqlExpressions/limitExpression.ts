import { SqlIdentifierExpression } from './sqlIdentifierExpression';

export interface LimitExpression {
    type: "LimitExpression";
    take?: SqlIdentifierExpression;
    skip?: SqlIdentifierExpression;
}