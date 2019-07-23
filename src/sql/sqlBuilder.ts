import { CreateTableStatement } from "../sqlExpressions/createTableStatement";
import { InsertStatement } from "../sqlExpressions/insertStatement";
import { UpdateStatement } from "../sqlExpressions/updateStatement";
import { SelectExpression } from "../sqlExpressions/selectExpression";
import { DeleteStatement } from '../sqlExpressions/deleteStatement';
import { LimitExpression } from '../sqlExpressions/limitExpression';
import { SqlExpression } from "../sqlExpressions/sqlExpression";

export interface QueryBuilder {

    buildQuery(expr: SqlExpression): string;
    buildCreateTable(expr: CreateTableStatement): string;
    buildInsert(expr: InsertStatement): string;
    buildUpdate(expr: UpdateStatement): string;
    buildDelete(table: DeleteStatement): string;
    buildSelect(expr: SelectExpression): string;
    buildLimit(expr: LimitExpression): void;

}