import { SqlLiteralExpression } from "./sqlLiteralExpression";
import { SqlIdentifierExpression } from "./sqlIdentifierExpression";

export interface SqlListExpression {
    type: "SqlListExpression";
    elements: Array<SqlLiteralExpression | SqlIdentifierExpression>;
}