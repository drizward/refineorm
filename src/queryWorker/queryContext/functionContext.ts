import { KeyValueContext } from "./keyValueContext";
import { QueryContext } from "./queryContext";
import { ClassType, internal } from "../../internal/internal";
import { AdapterFunction } from "../../internal/adapterMapper";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";

export class FunctionContext extends KeyValueContext {

    constructor(private adapter: AdapterFunction, private args: QueryContext[]) {
        super();
    }

    getBoundType(): ClassType<any> {
        return this.adapter.returnType;
    }

    getValue(key: string): QueryContext {
        throw new Error("Method not implemented.");
    }    
    
    toSqlExpression(): SqlExpression {
        return {
            type: "UncheckedExpression",
            raw: internal.adapterMapper.toSqlString(this.adapter, ...this.args)
        }
    }


}