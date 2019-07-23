
import { QueryWorker } from "./queryWorker";
import { internal } from "../internal/internal";
import { TableExpression } from "../sqlExpressions/tableExpression";
import { Expression, CallExpression, Literal } from 'estree';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { ExpressionBuilder } from '../internal/expressionBuilder';
import { QueryBuilder } from '../sql/sqlBuilder';
import { WorkerHelper } from './workerHelper';
import { QueryComposer } from "./queryComposer";
import { DeleteStatement } from "../sqlExpressions/deleteStatement";
import { SequenceContext } from "./queryContext/sequenceContext";

export class DeleteWorker implements QueryWorker {

    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'delete');
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
        const keys = Object.keys(td.columns)
                              .filter(x => td.columns[x].isKey)
                              .map(x => ExpressionBuilder.columns(td.columns[x], table));

        keys.forEach(x => composer.addParameter(sequence, x.name, model[x.name]));

        const deleteStatement: DeleteStatement = {
            type: "DeleteStatement",
            keys,
            table
        }
        
        sequence.statement = deleteStatement;
        return sequence; 
    }
}