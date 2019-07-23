
import { TableExpression } from './tableExpression';
import { ColumnExpression } from './columnExpression';

export interface InsertStatement {

    type: "InsertStatement";
    table: TableExpression;
    columns: ColumnExpression[];

}