import { QueryContext } from "./queryContext";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { QueryComposer } from "../queryComposer";
import { SequenceContext } from "./sequenceContext";
import { StatementTranslator } from "../../internal/statementTranslator";
import { ClassType } from "../../internal/internal";
import { ListContext } from "./listContext";

export class ObjectContext implements QueryContext {

    private sqlExpression: SqlExpression;

    constructor(public value: any) {

    }

    getBoundType(): ClassType<any> {
        return this.value.constructor;
    }

    getValue(key: string): QueryContext {
        const value = this.value[key];

        if('getValue' in value && 'toSqlExpression' in value)
            return value as QueryContext;

        return new ObjectContext(value);
    }

    createParameter(translator: StatementTranslator) {
        this.sqlExpression = this.value instanceof Array? 
                                    ListContext.fromArray(this.value, translator).toSqlExpression() :
                                    translator.createParameter(this.value);
    }
    
    toSqlExpression(): SqlExpression {
        return this.sqlExpression;
    }

}