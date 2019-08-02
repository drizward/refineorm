import { SelectExpression } from "../../sqlExpressions/selectExpression";
import { QueryContext } from "./queryContext";
import { QueryParameter } from "../../core/queryParameter";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { ObjectMapper } from "../../core/objectMapper";
import { DataContext } from "../../dataContext";
import { QueryComposer } from "../queryComposer";

export interface SequenceContext extends QueryContext {
    select: SelectExpression;
    parameters: QueryParameter[];
    statement: SqlExpression;
    mapper: ObjectMapper;
    isSingle: boolean;
    dataContext: DataContext;

    finalizeQuery(composer: QueryComposer, subquery: boolean, prefix?: string): void;

    getViewName(): string;
}