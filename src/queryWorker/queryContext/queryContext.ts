import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { ClassType } from "../../internal/internal";

export interface QueryContext {

    getBoundType(): ClassType<any>;
    getValue(key?: string): QueryContext;
    toSqlExpression(): SqlExpression;
    
}