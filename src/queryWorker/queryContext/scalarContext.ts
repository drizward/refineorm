import { SequenceContext } from './sequenceContext'
import { SelectExpression } from '../../sqlExpressions/selectExpression';
import { QueryParameter } from '../../core/queryParameter';
import { SqlExpression } from '../../sqlExpressions/sqlExpression';
import { ObjectMapper } from '../../core/objectMapper';
import { DataContext } from '../../dataContext';
import { QueryComposer } from '../queryComposer';
import { QueryContext } from './queryContext';
import { SqlPropertyExpression } from '../../sqlExpressions/sqlPropertyExpression';
import { SqlCallExpression } from '../../sqlExpressions/sqlCallExpression';
import { ClassType } from '../../internal/internal';

export class ScalarContext implements SequenceContext {

    static readonly methodNames = {
        any: 'EXISTS',
        all: 'NOT EXISTS',
        average: 'AVG',
        count: 'COUNT',
        min: 'MIN',
        max: 'MAX',
        sum: 'SUM',
    }

    select: SelectExpression;    
    parameters: QueryParameter[];
    statement: SqlExpression;
    mapper: ObjectMapper;
    isSingle: boolean;
    dataContext: DataContext;

    private get isCount() {
        return this.methodName == 'count';
    }

    constructor(private parent: SequenceContext, private methodName: string, converter?: (item: any) => any) {
        this.select = parent.select;
        this.parameters = parent.parameters;
        this.dataContext = parent.dataContext;

        this.mapper = new ObjectMapper().asScalar('result', converter);
    }

    getBoundType(): ClassType<any> {
        return Number;
    }

    getValue(): QueryContext {
        return this.parent;
    }

    toSqlExpression(): SqlExpression {
        return {
            type: "SqlCallExpression",
            name: ScalarContext.methodNames[this.methodName],
            arguments: [ !this.isCount? this.select.fields[0].field : {
                type: "AsteriskExpression"
            }]
        }
    }

    finalizeQuery(composer: QueryComposer, subquery: boolean, prefix?: string): void {
        if(!this.select.fields.length)
            this.parent.finalizeQuery(composer, true);

        this.select = this.parent.select;
        if(this.select.fields.length > 1 && !this.isCount)
            throw new Error("Parameterless aggregate can only be used in single column context!");

        this.select.fields = [{
            type: "SelectFieldExpression",
            field: this.toSqlExpression() as SqlCallExpression,
            alias: 'result'
        }];
    }
}