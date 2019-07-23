import { KeyValueContext } from "./keyValueContext";
import { TableDescriptor } from "../../meta/tableDescriptor";
import { TableColumnDescriptor } from "../../internal/descriptorMapper";
import { QueryContext } from "./queryContext";
import { internal } from "../../internal/internal";
import { PropertyContext } from "./propertyContext";
import { SqlExpression } from "../../sqlExpressions/sqlExpression";
import { JoinType } from "../../sqlExpressions/joinType";
import { AssociationDescriptor } from "../../meta/associationDescriptor";
import { ColumnDescriptor } from "../../meta/columnDescriptor";
import { BaseTableContext } from "./baseTableContext";
import { SqlOperator } from "../../sqlExpressions/sqlOperator";

export class JoinedTableContext extends KeyValueContext implements BaseTableContext {
    private association: AssociationDescriptor;
    
    descriptor: TableDescriptor;

    get tableName() {
        return this.joinedContext instanceof JoinedTableContext? 
                      `${this.joinedContext.tableName}.${this.joinedColumn.name}`
                    : this.joinedColumn.name;
    }

    constructor(public joinedContext: BaseTableContext, public joinedColumn: ColumnDescriptor) {
        super();
        this.descriptor = internal.mapper.mapOf(joinedColumn.classType);
        
        let owner: TableColumnDescriptor = { type: joinedContext.descriptor, property: joinedColumn };
        if(joinedColumn.isReference) {
            owner = { 
                type: this.descriptor, 
                property: joinedColumn.referenceTo || internal.mapper.keyOf(this.descriptor) 
            }
        }

        this.association = joinedContext
                                .descriptor
                                .associations
                                .find(x => x.owner.type == owner.type && x.owner.property == owner.property);
    }

    getBoundType(): import("../../internal/internal").ClassType<any> {
        return this.joinedContext.descriptor.type.constructor;
    }
    
    getValue(key: string): QueryContext {
        return new PropertyContext(this.descriptor.columns[key], this);
    }
    
    toSqlExpression(): SqlExpression {
        return {
            type: "JoinExpression",
            joinType: JoinType.Left,
            table: {
                type: "TableExpression",
                classType: null,
                name: this.descriptor.name,
                schema: this.descriptor.schema
            },
            alias: this.tableName,
            predicate: {
                type: "SqlBinaryExpression",
                operator: SqlOperator.Equals,
                left: {
                    type: "SqlPropertyExpression",
                    property: this.joinedColumn.isReference? 
                                  this.association.ref.property.name 
                                : this.joinedColumn.name,
                    view: this.joinedContext.tableName
                },
                right: {
                    type: "SqlPropertyExpression",
                    property: this.joinedColumn.isReference? 
                                  this.association.owner.property.name 
                                : this.association.ref.property.name,
                    view: this.tableName
                }
            }
        }
    }

}