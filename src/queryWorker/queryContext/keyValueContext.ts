import { QueryContext } from "./queryContext";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { ClassType } from "../../internal/internal";

export abstract class KeyValueContext implements QueryContext {
    abstract getBoundType(): ClassType<any>;
    abstract getValue(key: string): QueryContext;
    abstract toSqlExpression(): SqlExpression;

}