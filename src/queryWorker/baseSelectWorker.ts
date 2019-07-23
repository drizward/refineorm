import { QueryWorker } from './queryWorker';
import { QueryDescriptor } from '../internal/queryDescriptor';
import { Expression, CallExpression, Identifier } from 'estree';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { TableContext } from './queryContext/tableContext';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';

export abstract class BaseSelectWorker implements QueryWorker {

    abstract canConvert(expr: Expression): boolean;
    protected abstract formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext;

    convertQuery(composer: QueryComposer, expr: Expression): SequenceContext {
        expr = expr as CallExpression;
        const [inner] = expr.arguments;

        const method = (expr.callee as Identifier).name;
        const query = composer.compose(inner as Expression);
        if(query.select.type != "SelectExpression")
            throw new Error(`'${method}' query need a SelectExpression as the previous expression`);

        expr.arguments.splice(0, 1);
        const args = expr.arguments.length? expr.arguments.map(x => x as Expression) : [];

        return this.formatQuery(composer, query, method, args);
    }
}