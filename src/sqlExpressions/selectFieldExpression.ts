import { SqlStatement } from "./sqlStatement";
import { SelectExpression } from "./selectExpression";

export interface SelectFieldExpression {
    type: "SelectFieldExpression";
    field: SqlStatement | SelectExpression;
    alias?: string;
}