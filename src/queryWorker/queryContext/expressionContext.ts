import { QueryContext } from "./queryContext";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { ClassType } from "../../internal/internal";

export class ExpressionContext implements QueryContext {

    constructor(public expression?: SqlExpression) {
        
    }

    getBoundType(): ClassType<any> {
        throw new Error("Method not implemented.");
    }

    getValue(): QueryContext {
        throw new Error("Method not implemented.");
    }    

    toSqlExpression(): SqlExpression {
        return this.expression;
    }


}