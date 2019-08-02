import { SequenceContext } from "./sequenceContext";
import { SelectExpression } from "../../sqlExpressions/selectExpression";
import { QueryParameter } from "../../core/queryParameter";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { ObjectMapper } from "../../core/objectMapper";
import { DataContext } from "../../dataContext";
import { QueryContext } from "./queryContext";
import { ClassType } from "../../internal/internal";
import { QueryComposer } from "../queryComposer";
import { SqlBinaryExpression } from "../../sqlExpressions/sqlBinaryExpression";
import { JoinType } from "../../sqlExpressions/joinType";

export class JoinContext implements SequenceContext {
    select: SelectExpression;    
    parameters: QueryParameter[];
    statement: SqlExpression;
    isSingle: boolean;
    mapper: ObjectMapper;
    dataContext: DataContext;

    constructor(
        private joinedTable: SequenceContext, 
        private baseContext: SequenceContext, 
        private predicate: SqlBinaryExpression
    ) {
        this.dataContext = baseContext.dataContext;
        this.select = baseContext.select;
        this.mapper = baseContext.mapper;
    }

    finalizeQuery(composer: QueryComposer, subquery: boolean, prefix?: string): void {
        this.baseContext.finalizeQuery(composer, false);

        this.select = this.baseContext.select;
        if(!this.select.joins)
            this.select.joins = [];

        this.select.joins.push({
            type: "JoinExpression",
            joinType: JoinType.Left,
            predicate: this.predicate,
            table: this.joinedTable.toSqlExpression() as any
        });
    }

    getBoundType(): ClassType<any> {
        return this.baseContext.getBoundType();
    }

    getValue(key?: string): QueryContext {
        return this.baseContext.getValue(key);
    }
    
    toSqlExpression(): SqlExpression {
        throw new Error("Method not implemented.");
    }

    getViewName(): string {
        return this.baseContext.getViewName();
    }

}