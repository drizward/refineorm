import { SequenceContext } from "./sequenceContext";
import { SelectExpression } from "../../sqlExpressions/selectExpression";
import { QueryParameter } from "../../core/queryParameter";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { ObjectMapper } from "../../core/objectMapper";
import { DataContext } from "../../dataContext";
import { QueryComposer } from "../queryComposer";
import { QueryContext } from "./queryContext";
import { SqlStatement } from "../../sqlExpressions/sqlStatement";
import { ClassType } from "../../internal/internal";

export class SingleContext implements SequenceContext {
    select: SelectExpression;    
    parameters: QueryParameter[];
    statement: SqlExpression;
    mapper: ObjectMapper;
    isSingle: boolean;
    dataContext: DataContext;

    constructor(private parent: SequenceContext, private inner: QueryContext) {
        this.select = parent.select;
        this.parameters = parent.parameters;
        this.dataContext = parent.dataContext;
    }
    
    finalizeQuery(composer: QueryComposer, subquery: boolean, prefix?: string): void {
        this.mapper = new ObjectMapper().asScalar('result');

        this.select = composer.formatAsSubQuery(this.parent);
        this.select.fields = [{
            type: "SelectFieldExpression",
            alias: "result",
            field: this.inner.toSqlExpression() as any
        }]
    }

    getBoundType(): ClassType<any> {
        return this.inner.getBoundType();
    }

    getValue(): QueryContext {
        return this.parent;
    }

    toSqlExpression(): SqlExpression {
        return {
            type: "SqlPropertyExpression",
            property: "result",
            view: null
        }
    }

    getViewName(): string {
        return this.parent.getViewName();
    }


}