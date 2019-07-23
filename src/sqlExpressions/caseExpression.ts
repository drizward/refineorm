import { SqlStatement } from "./sqlStatement";
import { SqlExpression } from "./sqlExpression";

export interface CaseExpression {
    type: "CaseExpression";
    condition: SqlStatement;
    then: SqlExpression;
    else?: CaseExpression;
}