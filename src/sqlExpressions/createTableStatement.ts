
import { TableExpression } from './tableExpression'
import { ColumnExpression } from './columnExpression';
import { SqlConstraint } from './sqlConstraint';
import { ConstraintExpression } from './constraintExpression';

export interface CreateTableStatement {

    type: "TableStructureStatement";
    table: TableExpression;
    columns: ColumnExpression[];

}