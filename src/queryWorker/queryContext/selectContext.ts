import { KeyValueContext } from "./keyValueContext";
import { QueryContext } from "./queryContext";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { SequenceContext } from "./sequenceContext";
import { DataContext } from "../../dataContext";
import { ObjectMapper } from "../../core/objectMapper";
import { QueryParameter } from "../../core/queryParameter";
import { SelectExpression } from "../../sqlExpressions/selectExpression";
import { QueryComposer } from "../queryComposer";
import { ClassType } from "../../internal/internal";

export class SelectContext extends KeyValueContext implements SequenceContext {
    
    select: SelectExpression;
    parameters: QueryParameter[];
    statement: SqlExpression;
    mapper: ObjectMapper;
    isSingle: boolean;
    dataContext: DataContext;
    
    private properties: { key: string | number, value: QueryContext }[] = [];

    constructor(parent?: SequenceContext) {
        super();

        this.mapper = new ObjectMapper();
        if(parent)
            this.inheritFrom(parent);
    }

    inheritFrom(parent: SequenceContext) {
        this.select = parent.select;
        this.parameters = parent.parameters;
        this.dataContext = parent.dataContext;
    }

    addProperty(key: string | number, value: QueryContext) {
        const prop = this.properties.find(x => x.key == key);

        if(prop)
            throw new Error(`Key ${key} already exists in the select`);

        if('mapper' in value && (value as any).mapper instanceof ObjectMapper) 
            this.mapper.mergeMapper('key', (value as any).mapper);

        this.properties.push({ key, value });
    }

    getBoundType(): ClassType<any> {
        return this.mapper? this.mapper.getBaseType() : Object;
    }

    getValue(key: string): QueryContext {
        const prop = this.properties.find(x => x.key == key);

        if(prop)
            return prop.value;

        return null;
    }

    toSqlExpression(): SqlExpression {
        throw new Error("Method not implemented.");
    }

    finalizeQuery(composer: QueryComposer, subquery: boolean, prefix?: string): void {
        for(const prop of this.properties) {
            const key = prop.key.toString();
            const propName = prefix? `${prefix}.${key}` : key;
            
            if('finalizeQuery' in prop.value) {
                const sequence = prop.value as SequenceContext;
                
                sequence.select = this.select;
                sequence.finalizeQuery(composer, subquery, propName);
                
                continue;
            }

            const sqlExpression = prop.value.toSqlExpression();
            this.select.fields.push({
                type: "SelectFieldExpression",
                field: sqlExpression as any,
                alias: propName
            });
        }
    }

}