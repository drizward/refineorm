import { TableExpression } from '../sqlExpressions/tableExpression';
import { internal } from './internal';
import { InsertStatement } from '../sqlExpressions/insertStatement';
import { TableDescriptor } from '../meta/tableDescriptor';
import { ColumnDescriptor } from '../meta/columnDescriptor';
import { ColumnExpression } from '../sqlExpressions/columnExpression';
import { SqlConstraint } from '../sqlExpressions/sqlConstraint';
import { ConstraintExpression } from '../sqlExpressions/constraintExpression';
import { DataTypeExpression } from '../sqlExpressions/dataTypeExpression';
import { SqlDataType } from '../sqlExpressions/sqlDataType';

export const ExpressionBuilder = {

    insert<T>(type: new() => T): InsertStatement {
        const td = internal.mapper.mapOf(type);
        return {
            type: "InsertStatement",
            columns: Object.keys(td.columns).map(x => this.columns(td.columns[x], td)),
            table: this.table(td)
        }
    },

    table(td: TableDescriptor): TableExpression {
        return {
            type: "TableExpression",
            classType: td.type,
            name: td.name,
            schema: td.schema
        };
    },

    columns(cd: ColumnDescriptor, table: TableExpression): ColumnExpression {
        return {
            type: "ColumnExpression",
            classType: cd.classType,
            constraints: this.constraints(cd),
            defaultValue: cd.defaultValue,
            isNullable: cd.isNullable,
            name: cd.name,
            sqlType: this.dataType(cd.columnType, cd.maxLength),
            tableName: table.name,
            isAutoIncrement: cd.isAutoIncrement
        }
    },

    constraints(cd: ColumnDescriptor): ConstraintExpression[] {
        const constraints: ConstraintExpression[] = [];

        if(cd.isKey || (cd.isReference && cd.referenceTo && cd.referenceTo.isKey))
            constraints.push(this.constraint(cd, SqlConstraint.PrimaryKey));

        if(internal.mapper.isTableType(cd.classType)) {
            const [key] = internal.mapper.mapOf(cd.classType).keys;
            const kd = internal.mapper.mapOf(cd.classType, key);

            constraints.push(this.constraint(cd, SqlConstraint.ForeignKey, this.columns(kd.property, kd.type)));
        }

        return constraints;
    },

    constraint(cd: ColumnDescriptor, constraint: SqlConstraint, value?: any) : ConstraintExpression {
        return {
            type: "ConstraintExpression",
            columnName: cd.name,
            constraint,
            value
        }
    },

    dataType(dataType: SqlDataType, length?: number) : DataTypeExpression {
        return {
            type: "DataTypeExpression",
            dataType,
            length
        }
    }

}