import { Expression } from 'estree';
import { WorkerHelper } from './workerHelper';
import { BaseSelectWorker } from './baseSelectWorker';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';
import { OrderByExpression } from '../sqlExpressions/orderByExpression';
import { SqlPropertyExpression } from '../sqlExpressions/sqlPropertyExpression';
import { TableContext } from './queryContext/tableContext';
import { internal } from '../internal/internal';
import { PropertyContext } from './queryContext/propertyContext';

export class FirstSingleWorker extends BaseSelectWorker {

    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'first', 'single', 'last');
    }
    
    formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        let query = sequence.select;
        const predicate = args.length? args[0] as Expression : undefined;
        const isLast = method == 'last';
        let subOrderBy: OrderByExpression[];
        let keyProperty: PropertyContext;

        if(isLast && sequence instanceof TableContext) {
            const key = internal.mapper.keyOf(sequence.descriptor);
            keyProperty = sequence.getValue(key.propertyName) as PropertyContext;
        }

        if((query.limit && query.limit.take) || 
            (isLast && query.orderBy && query.orderBy.length > 1)) {
         
            subOrderBy = query.orderBy;
            query = composer.formatAsSubQuery(sequence);
        }

        if(predicate) 
            composer.addWhere(sequence, predicate);
        
        if(!query.limit) {
            composer.addTakeLimit(sequence, 1);
        }
        else query.limit.take = composer.createParameter(sequence, 1);

        if(isLast) {
            if(!query.orderBy)
                query.orderBy = [];

            const orderBy = query.orderBy;
            if(!orderBy.length) {
                let orders: OrderByExpression[];
                if(subOrderBy && subOrderBy.length) {
                    for(const order of subOrderBy) {
                        const reverse = Object.assign({}, order);
                        reverse.isDescending = !reverse.isDescending;

                        orders.push(reverse);
                    }
                }
                else orders = [{
                    type: "OrderByExpression",
                    column: keyProperty? keyProperty.toSqlExpression() : null,
                    isDescending: true
                }];

                for(const order of orders)
                    orderBy.push(order);
            }
            else {
                const [order] = orderBy;
                order.isDescending = !order.isDescending;
            }
        }

        sequence.isSingle = true;
        return sequence;
    }


}