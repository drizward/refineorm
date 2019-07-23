import { BaseSelectWorker } from "./baseSelectWorker";
import { Expression } from "estree";
import { WorkerHelper } from "./workerHelper";
import { QueryComposer } from "./queryComposer";
import { SequenceContext } from "./queryContext/sequenceContext";
import { ScalarContext } from "./queryContext/scalarContext";

export class AggregateWorker extends BaseSelectWorker {

    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'average', 'count', 'min', 'max', 'sum');
    }    
    
    protected formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        const [selector] = args;

        const isCount = method == 'count';
        if(selector) {
            if(!isCount) {
                sequence = composer.selectBy(sequence, selector);
            }
            else {
                composer.addWhere(sequence, selector);
            }
        }
        
        let query = sequence.select;
        return new ScalarContext(sequence, method);
    }
}