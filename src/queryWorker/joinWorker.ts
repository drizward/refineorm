import { BaseSelectWorker } from './baseSelectWorker';
import { Expression, ArrowFunctionExpression } from 'estree';
import { WorkerHelper } from './workerHelper';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';
import { SqlBinaryExpression } from '../sqlExpressions/sqlBinaryExpression';
import { TableContext } from './queryContext/tableContext';
import { SqlOperator } from '../sqlExpressions/sqlOperator';
import { JoinContext } from './queryContext/joinContext';
import { QueryContextResolver } from '../internal/queryContextResolver';
import { DataSetImpl } from '../core/dataSetImpl';
import { internal } from '../internal/internal';

export class JoinWorker extends BaseSelectWorker {
    
    canConvert(expr: Expression): boolean {
        return WorkerHelper.isQueryExpression(expr, 'join');
    }    
    
    protected formatQuery(composer: QueryComposer, sequence: SequenceContext, method: string, args: Expression[]): SequenceContext {
        
        let predicate: SqlBinaryExpression;
        let [joined, prop1, prop2, select] = args;

        if(joined.type != "Literal")
            throw new Error("First argument of join must be a reference!");

        let joinedTable = joined.value as any;
        if(joinedTable instanceof DataSetImpl) {
            joinedTable = new TableContext(internal.mapper.mapOf(joinedTable.type));
        }

        if(args.length == 3) {
            predicate = this.translatePredicate(composer, prop1, sequence, joinedTable) as SqlBinaryExpression;

            select = prop2;
            prop2 = null;
        }
        else {
            const left = this.translatePredicate(composer, prop1, sequence);
            const right = this.translatePredicate(composer, prop2, joinedTable);
            predicate = {
                type: "SqlBinaryExpression",
                operator: SqlOperator.Equals,
                left, right
            }
        }

        if(select.type != "ArrowFunctionExpression")
            throw new Error("Mapped object must be wrapped inside Lambda!");

        select = select as ArrowFunctionExpression;
        const translator = composer.getTranslator();
        const lambda = translator.createLambdaContext(select, [ sequence, joinedTable ]);
        const resolver = new QueryContextResolver(lambda, translator);

        const selectContext = resolver.resolve(select.body as any) as SequenceContext;
        selectContext.dataContext = sequence.dataContext;
        selectContext.select = sequence.select;
        selectContext.mapper = sequence.mapper;

        return new JoinContext(joinedTable, selectContext, predicate);
    }

    private translatePredicate(composer: QueryComposer, expr: Expression, base: SequenceContext, joined?: SequenceContext) {
        return composer.getTranslator()
                       .translate(expr, [ base, joined ], base.parameters);
    }

}