import { KeyValueContext } from "./keyValueContext";
import { QueryContext } from "./queryContext";
import { ColumnDescriptor } from "../../meta/columnDescriptor";
import { SqlPropertyExpression } from "../../sqlExpressions/sqlPropertyExpression";
import { BaseTableContext } from "./baseTableContext";
import { ClassType } from "../../internal/internal";

export class PropertyContext extends KeyValueContext {

    constructor(private property: ColumnDescriptor, private table: BaseTableContext) {
        super();
    }

    getBoundType(): ClassType<any> {
        const property = this.property;
        return property.isCollection? property.collectionType : property.classType;
    }

    getValue(key: string): QueryContext {
        throw new Error("Method not implemented.");
    }
    
    toSqlExpression(): SqlPropertyExpression {
        return {
            type: "SqlPropertyExpression",
            property: this.property.name,
            view: this.table.tableName
        }
    }

}