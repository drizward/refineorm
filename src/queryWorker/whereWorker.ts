import { Expression, CallExpression } from 'estree';
import { WorkerHelper } from './workerHelper';
import { QueryDescriptor } from '../internal/queryDescriptor';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { StatementTranslator } from '../internal/statementTranslator';
import { SqlBinaryExpression } from '../sqlExpressions/sqlBinaryExpression';
import { BaseSelectWorker } from './baseSelectWorker';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';
import { TableContext } from './queryContext/tableContext';

export class WhereWorker extends BaseSelectWorker {

    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'where');
    }    
    
    formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        let query = sequence.select;
        const [predicate] = args;

        if(query.limit) 
            query = composer.formatAsSubQuery(sequence);

        composer.addWhere(sequence, predicate);
        return sequence;
    }

}