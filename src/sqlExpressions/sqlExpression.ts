import { ColumnExpression } from './columnExpression';
import { ConstraintExpression } from './constraintExpression';
import { DataTypeExpression } from './dataTypeExpression';
import { InsertStatement } from './insertStatement';
import { SelectExpression } from './selectExpression';
import { TableExpression } from './tableExpression';
import { CreateTableStatement } from './createTableStatement';
import { UpdateStatement } from './updateStatement';
import { DeleteStatement } from './deleteStatement';
import { LimitExpression } from './limitExpression';
import { OrderByExpression } from './orderByExpression';
import { SelectFieldExpression } from './selectFieldExpression';
import { SqlStatement } from './sqlStatement';
import { JoinExpression } from './joinExpression';
import { AsteriskExpression } from './asteriskExpression';
import { UncheckedExpression } from './uncheckedExpression';

export type SqlExpression =
    | AsteriskExpression
    | ColumnExpression
    | ConstraintExpression
    | CreateTableStatement
    | DataTypeExpression
    | DeleteStatement
    | InsertStatement
    | JoinExpression
    | LimitExpression
    | OrderByExpression
    | SelectExpression
    | SelectFieldExpression
    | SqlStatement
    | TableExpression
    | UncheckedExpression
    | UpdateStatement