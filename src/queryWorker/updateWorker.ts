import { QueryWorker } from "./queryWorker";
import { internal } from "../internal/internal";
import { Expression, CallExpression, Literal } from 'estree';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { ExpressionBuilder } from '../internal/expressionBuilder';
import { TableExpression } from '../sqlExpressions/tableExpression';
import { WorkerHelper } from './workerHelper';
import { QueryComposer } from "./queryComposer";
import { SequenceContext } from "./queryContext/sequenceContext";

export class UpdateWorker implements QueryWorker {

    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'update');
    }

    convertQuery(composer: QueryComposer, expr: Expression): SequenceContext {
        expr = expr as CallExpression;
        const inner = <Expression> expr.arguments[0];
        const model = (<Literal> expr.arguments[1]).value as any;

        const sequence = composer.compose(inner);
        const query = sequence.select;
        if(!query.from.length || query.from[0].type != "TableExpression")
            return null;

        const table = <TableExpression> query.from[0];
        const type = model.constructor;
        const td = internal.mapper.mapOf(type);
        const columns = Object.keys(td.columns)
                              .filter(x => !td.columns[x].isReadonly)
                              .map(x => ExpressionBuilder.columns(td.columns[x], table));

        const updateStmt: SqlExpression = {
            type: "UpdateStatement",
            columns: columns.filter(x => !td.keys.includes(x.name)),
            table,
            keys: columns.filter(x => td.keys.includes(x.name))
        }

        const params = [ ...updateStmt.columns, ...updateStmt.keys ];
        params.forEach(x => composer.addParameter(sequence, x.name, model[x.name]));

        sequence.statement = updateStmt;
        return sequence;
    }

}