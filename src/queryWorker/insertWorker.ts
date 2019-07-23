
import { QueryWorker } from './queryWorker';
import { Expression, CallExpression, Literal } from 'estree';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { internal } from '../internal/internal';
import { ExpressionBuilder } from '../internal/expressionBuilder';
import { TableExpression } from '../sqlExpressions/tableExpression';
import { WorkerHelper } from './workerHelper';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';

export class InsertWorker implements QueryWorker {
    
    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'insert');
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
        const columns = Object.keys(model)
                              .filter(x => model[x] != undefined)
                              .map(x => ({
                                  descriptor: td.columns[x],
                                  expr: ExpressionBuilder.columns(td.columns[x], table)
                              }));

        columns.forEach(x => composer.addParameter(sequence, x.expr.name, internal.mapper.getterFrom(x.descriptor)(model)));

        const sql: SqlExpression = {
            type: "InsertStatement",
            columns: columns.map(x => x.expr),
            table
        };
        
        sequence.statement = sql;
        return sequence;
    }

}