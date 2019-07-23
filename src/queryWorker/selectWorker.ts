import { BaseSelectWorker } from './baseSelectWorker';
import { Expression } from 'estree';
import { QueryDescriptor } from '../internal/queryDescriptor';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { WorkerHelper } from './workerHelper';
import { StatementTranslator } from '../internal/statementTranslator';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';

export class SelectWorker extends BaseSelectWorker {

    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'select');
    }    
    
    protected formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        const [selector] = args;
        return composer.selectBy(sequence, selector);
    }

}