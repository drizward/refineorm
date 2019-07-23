import { SqlExpression } from './sqlExpression';

export interface SqlCallExpression {
    type: "SqlCallExpression";
    name: string;
    arguments: SqlExpression[];
}