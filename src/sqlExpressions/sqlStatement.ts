import { SqlCallExpression } from "./sqlCallExpression";
import { SqlBinaryExpression } from "./sqlBinaryExpression";
import { SqlLiteralExpression } from './sqlLiteralExpression';
import { SqlIdentifierExpression } from './sqlIdentifierExpression';
import { SqlUnaryExpression } from "./sqlUnaryExpression";
import { SqlPropertyExpression } from "./sqlPropertyExpression";
import { CaseExpression } from "./caseExpression";
import { AsteriskExpression } from "./asteriskExpression";
import { SqlListExpression } from "./sqlListExpression";

export type SqlStatement = 
    | AsteriskExpression
    | CaseExpression
    | SqlBinaryExpression
    | SqlCallExpression
    | SqlListExpression
    | SqlLiteralExpression
    | SqlIdentifierExpression
    | SqlPropertyExpression
    | SqlUnaryExpression
    