import { BaseSelectWorker } from './baseSelectWorker';
import { Expression, Literal } from 'estree';
import { WorkerHelper } from './workerHelper';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';

export class BoundWorker extends BaseSelectWorker {

    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'bound');
    }    
    
    protected formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        let [param] = args;

        const value = (param as Literal).value;
        if(typeof value != 'object')
            throw new Error(`Bound parameter must be declared as object. Found ${typeof value}`);
        
        composer.addBoundParameter(value);
        return sequence;
    }

}