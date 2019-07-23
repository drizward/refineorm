import { TableExpression } from './tableExpression';
import { SqlBinaryExpression } from './sqlBinaryExpression';
import { ColumnExpression } from './columnExpression';

export interface DeleteStatement {
    type: "DeleteStatement";
    table: TableExpression;
    where?: SqlBinaryExpression;
    keys: ColumnExpression[];
}