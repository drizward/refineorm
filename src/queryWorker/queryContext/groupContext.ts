import { KeyValueContext } from "./keyValueContext"
import { QueryContext } from "./queryContext";
import { SequenceContext } from "./sequenceContext"
import { QueryParameter } from "../../core/queryParameter";
import { SelectExpression } from "../../sqlExpressions/selectExpression";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { ObjectMapper } from "../../core/objectMapper";
import { DataContext } from "../../dataContext";
import { QueryComposer } from "../queryComposer";
import { ClassType } from "../../internal/internal";
import { SqlPropertyExpression } from "../../sqlExpressions/sqlPropertyExpression";

export class GroupContext extends KeyValueContext implements SequenceContext {
    select: SelectExpression;
    parameters: QueryParameter[];
    statement: SqlExpression;
    mapper: ObjectMapper;
    isSingle: boolean;
    dataContext: DataContext;

    constructor(private parent: SequenceContext) {
        super();
        
        this.select = parent.select;
        this.parameters = parent.parameters;
        this.dataContext = parent.dataContext;
    }

    getBoundType(): ClassType<any> {
        return this.parent.getBoundType();
    }

    getValue(key: string): QueryContext {
        return this.parent.getValue(key);
    }

    toSqlExpression(): SqlExpression {
        throw new Error("Method not implemented.");
    }

    finalizeQuery(composer: QueryComposer, subquery: boolean, prefix?: string): void {
        this.parent.finalizeQuery(composer, false);
        this.mapper = this.parent.mapper;
        this.select = this.parent.select;
        
        if(!this.select.groupBy)
            this.select.groupBy = [];

        for(const sf of this.select.fields) {
            if(sf.alias.includes('.'))
                throw new Error("A Group By query cannot has object as its field");

            let prop: SqlPropertyExpression;
            const field = sf.field;
            if(field.type == "SqlPropertyExpression") {
                prop = field;
            }
            else if(field.type == "SqlCallExpression") {
                if(field.arguments.length > 1)
                    throw new Error("Only single argument function can be used in Group By");

                const [arg] = field.arguments;
                if(arg.type == "SqlPropertyExpression")
                    prop = arg;
            }

            if(!prop) continue;
            this.select.groupBy.push(prop);
        }
    }

    getViewName(): string {
        return this.parent.getViewName();
    }

}