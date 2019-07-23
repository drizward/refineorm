import { SelectExpression } from './selectExpression';

export interface SqlViewExpression {
    type: "SqlViewExpression";
    from: SelectExpression;
    name: string;
}