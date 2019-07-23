import { QueryWorker } from './queryWorker';
import { Expression, Literal } from 'estree';
import { QueryDescriptor } from '../internal/queryDescriptor';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { DataContext } from '../dataContext';
import { DataSet } from '../dataSet';
import { internal, ClassType } from '../internal/internal';
import { TableExpression } from '../sqlExpressions/tableExpression';
import { SelectFieldExpression } from '../sqlExpressions/selectFieldExpression';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { SqlPropertyExpression } from '../sqlExpressions/sqlPropertyExpression';
import { ColumnDescriptor } from '../meta/columnDescriptor';
import { ExpressionBuilder } from '../internal/expressionBuilder';
import { JoinType } from '../sqlExpressions/joinType';
import { JoinExpression } from '../sqlExpressions/joinExpression';
import { TableDescriptor } from '../meta/tableDescriptor';
import { TableColumnDescriptor } from '../internal/descriptorMapper';
import { AssociationDescriptor } from '../meta/associationDescriptor';
import { ObjectMapper } from '../core/objectMapper';
import { TableContext } from './queryContext/tableContext';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';

export class ViewWorker implements QueryWorker {

    canConvert(expr: Expression): boolean {
        return expr.type == "Literal" && expr.value 
                && 'context' in (<any> expr.value)
                && (<any> expr.value).context instanceof DataContext;
    }    
    
    convertQuery(composer: QueryComposer, expr: Expression): SequenceContext {
        expr = expr as Literal;
        const dataset = (<any> expr.value) as DataSet<any>
        const td = internal.mapper.mapOf(dataset.type);
        
        const sequence = composer.fromTable(td, dataset.context);
        return sequence;
    }
}