import { KeyValueContext } from "./keyValueContext";
import { QueryContext } from "./queryContext";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { ObjectContext } from "./objectContext";
import { ClassType } from "../../internal/internal";

export class LambdaContext extends KeyValueContext {

    private params: { [key: string]: QueryContext } = {};

    constructor(private bounds?: {}) {
        super();
    }

    addParameter(key: string, value: QueryContext) {
        this.params[key] = value;
    }

    getBoundType(): ClassType<any> {
        throw new Error("Cannot get bound type of LambdaContext.");
    }

    getValues() {
        return Object.values(this.params);
    }

    getValue(key: string): QueryContext {
        let value = this.params[key];
        
        if(!value && this.bounds) {
            const prop = this.bounds[key];

            if(prop)
                value = new ObjectContext(prop);
        }

        return value;
    }    
    
    toSqlExpression(): SqlExpression {
        throw new Error("LambdaContext cannot be converted to SQL");
    }

}