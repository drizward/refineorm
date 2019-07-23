import { KeyValueContext } from "./keyValueContext";
import { ClassType } from "../../internal/internal";
import { QueryContext } from "./queryContext";
import { ObjectContext } from "./objectContext";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { StatementTranslator } from "../../internal/statementTranslator";

export class ListContext extends KeyValueContext {

    private readonly items: QueryContext[] = [];

    get length() {
        return this.items.length;
    }

    addItem(context: QueryContext) {
        this.items.push(context);
    }

    getBoundType(): ClassType<any> {
        return Array;
    }    
    
    getValue(key: string | number): QueryContext {
        if(typeof key == 'string') {
            if(!isNaN(+key))
                key = +key;

            throw new Error("List can only accessible by index");
        }

        return this.items[key];
    }
    
    toSqlExpression(): SqlExpression {
        return {
            type: "SqlListExpression",
            elements: this.items.map(x => x.toSqlExpression() as any)
        }
    }

    static fromArray(arr: Array<string | number>, translator?: StatementTranslator) {
        const list = new ListContext();

        for(const item of arr) {
            const itemCtx = new ObjectContext(item);
            if(translator)
                itemCtx.createParameter(translator);

            list.addItem(itemCtx);
        }

        return list;
    }

}