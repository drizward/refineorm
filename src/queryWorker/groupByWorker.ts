import { BaseSelectWorker } from "./baseSelectWorker";
import { Expression } from "estree";
import { WorkerHelper } from "./workerHelper";
import { QueryComposer } from "./queryComposer";
import { SequenceContext } from "./queryContext/sequenceContext";
import { GroupContext } from "./queryContext/groupContext";

export class GroupByWorker extends BaseSelectWorker {
    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'groupBy');
    }    
    
    protected formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        const [selector] = args;
        sequence = composer.selectBy(sequence, selector);

        
        return new GroupContext(sequence);
    }


}