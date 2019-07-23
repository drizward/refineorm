import { Expression, CallExpression, Identifier } from 'estree';
import { QueryDescriptor } from '../internal/queryDescriptor';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { WorkerHelper } from './workerHelper';
import { BaseSelectWorker } from './baseSelectWorker';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { internal } from '../internal/internal';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';

export class SkipTakeWorker extends BaseSelectWorker {
    
    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'skip', 'take', 'elementAt');
    }    
    
    protected formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        const [count] = args;

        if(count.type != "Literal" || typeof count.value != 'number')
            throw new Error(`${method} arguments must be a number`);

        let skip = method == 'skip'? count.value : undefined;
        let take = method == 'take'? count.value : undefined;

        if(method == 'elementAt') {
            if(count.value > 1)
                skip = count.value - 1;

            take = 1;
            sequence.isSingle = true;
        }

        if(skip)
            composer.addSkipOffset(sequence, skip);

        if(take)
            composer.addTakeLimit(sequence, take);

        return sequence;
    }

}