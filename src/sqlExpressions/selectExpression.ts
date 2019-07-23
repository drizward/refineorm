import { TableExpression } from "./tableExpression";
import { SqlBinaryExpression } from './sqlBinaryExpression';
import { SqlViewExpression } from './sqlViewExpression';
import { LimitExpression } from './limitExpression';
import { OrderByExpression } from "./orderByExpression";
import { SelectFieldExpression } from './selectFieldExpression';
import { SqlPropertyExpression } from './sqlPropertyExpression';
import { JoinExpression } from './joinExpression';
import { SqlStatement } from "./sqlStatement";

export interface SelectExpression {

    type: "SelectExpression";
    fields: SelectFieldExpression[];
    from: Array<TableExpression | SqlViewExpression>;
    where?: SqlStatement;
    groupBy?: SqlPropertyExpression[];
    orderBy?: OrderByExpression[];
    limit?: LimitExpression;
    joins?: JoinExpression[];

}