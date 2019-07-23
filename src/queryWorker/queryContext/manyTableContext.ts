import { KeyValueContext } from "./keyValueContext";
import { SequenceContext } from "./sequenceContext";
import { DataContext } from "../../dataContext";
import { ObjectMapper } from "../../core/objectMapper";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { SelectExpression } from "../../sqlExpressions/selectExpression";
import { QueryParameter } from "../../core/queryParameter";
import { QueryContext } from "./queryContext";
import { QueryComposer } from "../queryComposer";

export class ManyTableContext extends KeyValueContext implements SequenceContext {
    
    select: SelectExpression;    
    parameters: QueryParameter[];
    statement: SqlExpression;
    mapper: ObjectMapper;
    isSingle: boolean;
    dataContext: DataContext;

    getBoundType(): import("../../internal/internal").ClassType<any> {
        throw new Error("Method not implemented.");
    }

    getValue(key: string): QueryContext {
        throw new Error("Method not implemented.");
    }

    toSqlExpression(): SqlExpression {
        throw new Error("Method not implemented.");
    }

    finalizeQuery(composer: QueryComposer, subquery: boolean, prefix?: string): void {
        throw new Error("Method not implemented.");
    }


}