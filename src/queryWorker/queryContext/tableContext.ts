import { KeyValueContext } from "./keyValueContext";
import { QueryContext } from "./queryContext";
import { TableDescriptor } from "../../meta/tableDescriptor";
import { PropertyContext } from "./propertyContext";
import { SequenceContext } from "./sequenceContext";
import { internal, ClassType } from "../../internal/internal";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { JoinedTableContext } from "./joinedTableContext";
import { BaseTableContext } from "./baseTableContext";
import { SelectExpression } from "../../sqlExpressions/selectExpression";
import { QueryParameter } from "../../core/queryParameter";
import { ObjectMapper } from "../../core/objectMapper";
import { DataContext } from "../../dataContext";
import { QueryComposer } from "../queryComposer";

export class TableContext extends KeyValueContext implements BaseTableContext, SequenceContext {
    select: SelectExpression;
    parameters: QueryParameter[] = [];
    statement: SqlExpression;
    mapper: ObjectMapper;
    isSingle: boolean;
    dataContext: DataContext;

    private isFinalizing: boolean;
    
    get tableName() {
        return this.descriptor.name;
    }

    constructor(public descriptor: TableDescriptor) {
        super();
    }

    getBoundType(): ClassType<any> {
        return this.descriptor.type.constructor;
    }

    getValue(key: string): QueryContext {
        const column = this.descriptor.columns[key];

        if(internal.mapper.isTableType(column.classType))
            return new JoinedTableContext(this, column);

        return new PropertyContext(column, this);
    }
    
    toSqlExpression(): SqlExpression {
        return {
            type: "TableExpression",
            name: this.tableName,
            classType: this.descriptor.type,
            schema: this.descriptor.schema
        };
    }

    finalizeQuery(composer: QueryComposer, subquery: boolean): void {
        if(!this.isFinalizing)
            composer.addColumns(this, this.descriptor, this.tableName);

        if(subquery) {
            const columns = Object.keys(this.descriptor.columns);
            const associations = columns.map(x => this.descriptor.columns[x])
                                        .filter(x => internal.mapper.isTableType(x.classType) && !x.isReference);
            associations.forEach(x => composer.addColumn(this, x, this.tableName));
        }
        else {
            this.isFinalizing = true;
            if(this.select.limit && !this.isSingle) {
                composer.formatAsSubQuery(this);
                composer.addColumns(this, this.descriptor, this.tableName);
            }

            composer.addAssociationFrom(this, this.descriptor, this.tableName);
            this.isFinalizing = false;
        }
    }

    getViewName(): string {
        return this.tableName;
    }

}