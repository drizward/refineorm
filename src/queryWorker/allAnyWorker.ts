import { BaseSelectWorker } from './baseSelectWorker';
import { Expression } from 'estree';
import { WorkerHelper } from './workerHelper';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';
import { ScalarContext } from './queryContext/scalarContext';
import { SqlOperator } from '../sqlExpressions/sqlOperator';

export class AllAnyWorker extends BaseSelectWorker {
    
    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'all', 'any');
    }    
    
    protected formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        const [predicate] = args;

        composer.formatAsSubQuery(sequence);
        if(predicate)
            composer.addWhere(sequence, predicate);

        if(method == 'all') {
            sequence.select.where = {
                type: 'SqlUnaryExpression',
                operator: SqlOperator.Not,
                operand: sequence.select.where,
                isPrefixed: true
            }
        }

        sequence.select = {
            type: "SelectExpression",
            fields: [{
                type: "SelectFieldExpression",
                field: sequence.select
            }],
            from: []
        };

        return new ScalarContext(sequence, method, (item: number) => item == 1);
    }


}