
import { TableExpression } from './tableExpression';
import { ColumnExpression } from './columnExpression';

export interface UpdateStatement {
    
    type: "UpdateStatement";
    table: TableExpression;
    keys: ColumnExpression[]; 
    columns: ColumnExpression[];

}