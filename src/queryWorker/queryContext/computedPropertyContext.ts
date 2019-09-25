import { QueryContext } from "./queryContext";
import { ClassType } from "../../internal/internal";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { SequenceContext } from "./sequenceContext";
import { SelectContext } from "./selectContext";

export class ComputedPropertyContext implements QueryContext {

    constructor(public name: string, public value: QueryContext, public view: SequenceContext | ComputedPropertyContext) {

    }
    
    getBoundType(): ClassType<any> {
        return this.value.getBoundType();
    }    
    
    getValue(key: string): QueryContext {
        const context = this.value.getValue(key);

        if(context instanceof ComputedPropertyContext)
            context.view = this;

        return context;
    }

    toSqlExpression(): SqlExpression {
        let prop = this.name;
        let parent = this.view;
        
        while(parent instanceof ComputedPropertyContext) {
            prop  = `${parent.name}.${prop}`;
            parent = parent.view;
        }

        return {
            type: "SqlPropertyExpression",
            property: prop,
            view: parent.getViewName()
        }
    }


}