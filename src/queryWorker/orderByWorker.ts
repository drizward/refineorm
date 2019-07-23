import { BaseSelectWorker } from './baseSelectWorker';
import { QueryDescriptor } from '../internal/queryDescriptor';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { Expression } from 'estree';
import { WorkerHelper } from './workerHelper';
import { StatementTranslator } from '../internal/statementTranslator';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';

export class OrderByWorker extends BaseSelectWorker {

    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'orderBy', 'orderByDescending');
    }

    protected formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        const [member] = args;

        composer.addOrderBy(sequence, member, method == "orderByDescending");
        return sequence;
    }


}