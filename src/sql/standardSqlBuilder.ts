
import { QueryBuilder } from './sqlBuilder';
import { SqlTextBuilder } from './sqlTextBuilder';
import { CreateTableStatement } from '../sqlExpressions/createTableStatement';
import { TableExpression } from '../sqlExpressions/tableExpression';
import { ColumnExpression } from '../sqlExpressions/columnExpression';
import { SqlConstraint } from '../sqlExpressions/sqlConstraint';
import { DataTypeExpression } from '../sqlExpressions/dataTypeExpression';
import { SqlDataType } from '../sqlExpressions/sqlDataType';
import { ConstraintExpression } from '../sqlExpressions/constraintExpression';
import { InsertStatement } from '../sqlExpressions/insertStatement';
import { UpdateStatement } from '../sqlExpressions/updateStatement';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { DeleteStatement } from '../sqlExpressions/deleteStatement';
import { LimitExpression } from '../sqlExpressions/limitExpression';
import { SqlBinaryExpression } from '../sqlExpressions/sqlBinaryExpression';
import { SqlOperator } from '../sqlExpressions/sqlOperator';
import { SqlStatement } from '../sqlExpressions/sqlStatement';
import { SqlPropertyExpression } from '../sqlExpressions/sqlPropertyExpression';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { SelectFieldExpression } from '../sqlExpressions/selectFieldExpression';
import { JoinType } from '../sqlExpressions/joinType';


export class StandardQueryBuilder implements QueryBuilder {

    sqlText: SqlTextBuilder = new SqlTextBuilder();
    protected readonly dataTypesMap: Map<SqlDataType, string> = new Map([
        [SqlDataType.BigInt, "BIGINT"],
        [SqlDataType.Boolean, "BOOLEAN"],
        [SqlDataType.Blob, "BLOB"],
        [SqlDataType.Byte, "BYTE"],
        [SqlDataType.Char, "CHAR"],
        [SqlDataType.Clob, "CLOB"],
        [SqlDataType.Date, "DATE"],
        [SqlDataType.Decimal, "DECIMAL"],
        [SqlDataType.DoublePrecision, "DOUBLE PRECISION"],
        [SqlDataType.Float, "FLOAT"],
        [SqlDataType.Integer, "INTEGER"],
        [SqlDataType.SmallInt, "SMALLINT"],
        [SqlDataType.Time, "TIME"],
        [SqlDataType.Timestamp, "TIMESTAMP"],
        [SqlDataType.Varchar, "VARCHAR"]
    ]);
    protected readonly constraintCode: Map<SqlConstraint, string> = new Map([
        [SqlConstraint.Check, "CHK"],
        [SqlConstraint.ForeignKey, "FK"],
        [SqlConstraint.PrimaryKey, "PK"],
        [SqlConstraint.Unique, "UC"]
    ]);
    protected readonly constraintText: Map<SqlConstraint, string> = new Map([
        [SqlConstraint.Check, "CHECK"],
        [SqlConstraint.ForeignKey, "FOREIGN KEY"],
        [SqlConstraint.PrimaryKey, "PRIMARY KEY"],
        [SqlConstraint.Unique, "UNIQUE"]
    ]);

    buildQuery(expr: SqlExpression): string {
        switch(expr.type) {
            case "TableStructureStatement"  : return this.buildCreateTable(expr);
            case "SelectExpression"         : return this.buildSelect(expr);
            case "InsertStatement"          : return this.buildInsert(expr);
            case "UpdateStatement"          : return this.buildUpdate(expr);
            case "DeleteStatement"          : return this.buildDelete(expr);
            default                         : throw new Error("Sql Expression root is unknown");
        }
    }
    
    buildCreateTable(tStructure: CreateTableStatement): string {
        const constraints: ConstraintExpression[] = [];
        const indices: ColumnExpression[] = [];

        this.buildCreateTableText(tStructure.table);
        this.sqlText.appendText(' (');
        tStructure.columns.forEach((column, index) => {
            this.buildColumnDefinition(column);
            column.constraints.forEach(ctr => {
                constraints.push(ctr);

                if(ctr.constraint == SqlConstraint.Index)
                    indices.push(column);
            });

            if(index != tStructure.columns.length - 1)
                this.sqlText.appendText(',');
        }); 

        if(constraints.length)
            this.buildConstraints(constraints, tStructure.table);
        
        this.sqlText.appendLine().appendText(`);`);

        if(indices.length)
            this.buildIndex(indices, tStructure.table, true);

        return this.sqlText.finish();
    }

    formatTableName(table: TableExpression): string {
        return this.formatIdentifier(table.name);
    }

    buildTableName(table: TableExpression) {
        this.sqlText.appendText(this.formatTableName(table));
    }

    protected buildCreateTableText(table: TableExpression) {
        this.sqlText.appendText(`CREATE TABLE ${this.formatTableName(table)}`);
    }

    protected buildColumnName(column: ColumnExpression) {
        this.sqlText.appendLine()
                    .appendIndent()
                    .appendText(`${this.formatIdentifier(column.name)} `);
    }

    protected buildColumnDefinition(column: ColumnExpression) {
        this.buildColumnName(column);
        this.buildColumnAttribute(column);
    }

    protected buildColumnAttribute(column: ColumnExpression) {
        this.buildDataTypeDefinition(column.sqlType);

        this.sqlText.appendWhitespace()
                    .appendText(!column.isNullable? 'NOT NULL' : 'NULL');

        if(column.isAutoIncrement) {
            this.sqlText.appendText(' AUTO_INCREMENT ');
        }

        if(column.defaultValue) {
            this.sqlText.appendText(` DEFAULT `);
            this.buildLiteral(column.defaultValue);
        }
    }

    protected buildDataTypeDefinition(dataType: DataTypeExpression) {
        this.buildDataType(dataType.dataType);

        if(dataType.length)
            this.sqlText.appendText(`(${dataType.length})`);
    }


    protected buildConstraints(constraints: ConstraintExpression[], table: TableExpression) {
        const ctrMaps: { [code: string]: ConstraintExpression[] } = {};
        for(let ctr of constraints) {
            const code = this.constraintCode.get(ctr.constraint);
            if(!code) continue; // ignore the default, notnull, and index constraint here

            if(!ctrMaps[code])
                ctrMaps[code] = [];
            
            ctrMaps[code].push(ctr);
        }
        this.sqlText.appendText(',');

        const ctrKeys = Object.keys(ctrMaps);
        ctrKeys.forEach((code, index) => {
            const ctr = ctrMaps[code][0].constraint;
            const ctrName = `${code}_${table.name}`;
            
            if(ctr == SqlConstraint.ForeignKey) {
                const tableCounts: { [name: string]: any } = {};
                let fc = 0;
                for(let fk of ctrMaps[code]) {
                    if(!fk.value || fk.value.type != "ColumnExpression")
                        throw new Error("ConstraintExpression with ForeignKey type must be not null and of ColumnExpression type");

                    const index = tableCounts[fk.value.tableName];
                    const fkName = `${ctrName}_${fk.value.tableName}${ index || '' }`;

                    this.buildConstraintString(fkName, ctr, fk.columnName);
                    this.sqlText.appendText(` REFERENCES ${fk.value.tableName}(${fk.value.name})`);

                    let tcount = tableCounts[fk.value.tableName];
                    if(!tcount)
                        tcount = tableCounts[fk.value.tableName] = 0;

                    tcount++;
                    if(++fc != ctrMaps[code].length)
                        this.sqlText.appendText(',');
                }
            }
            else {
                const value = ctrMaps[code].map(x => this.formatIdentifier(x.columnName)).join(', ');
                this.buildConstraintString(ctrName, ctr, value);
            }

            if(index != ctrKeys.length - 1)
                this.sqlText.appendText(',');
        });
    };

    protected buildIndex(columns: ColumnExpression[], table: TableExpression, isUnique: boolean) {
        const tableName = this.formatTableName(table);
        this.sqlText.appendLine()
                    .appendText(`CREATE ${isUnique? 'UNIQUE' : ''} INDEX ${tableName}_INDEX`)
                    .appendWhitespace()
                    .appendText(`ON ${tableName} (${columns.map(x => x.name).join(', ')});`)
    }

    protected buildConstraintString(ctrName: string, ctr: SqlConstraint, value: any) {
        this.sqlText.appendLine()
                    .appendIndent()
                    .appendText(`CONSTRAINT ${ctrName}`)
                    .appendWhitespace()
                    .appendText(this.constraintText.get(ctr))
                    .appendWhitespace()
                    .appendText(`(${value})`);
    }

    buildDataType(dataType: SqlDataType) {
        this.sqlText.appendText(this.dataTypesMap.get(dataType));
    }

    buildLiteral(value: any) {
        switch(typeof value) {
            case 'string':
                this.sqlText.appendText(`'${value}'`);
                return;
            
            default:
                this.sqlText.appendText(value.toString());
        }
    }

    buildInsert(expr: InsertStatement): string {
        const columnNames = expr.columns.map(x => x.name);
        this.sqlText.appendText("INSERT INTO ")
                    .appendLine().appendIndent()
                    .appendText(this.formatTableName(expr.table))
                    .appendWhitespace()
                    .appendText(`(${columnNames.map(x => this.formatIdentifier(x)).join(', ')})`)
                    .appendLine()
                    .appendText("VALUES")
                    .appendLine().appendIndent()
                    .appendText(`(${columnNames.map(x => this.formatParameter(x)).join(', ')})`);
        
        return this.sqlText.finish();
    }

    buildUpdate(expr: UpdateStatement): string {
        this.sqlText.appendText("UPDATE")
                    .appendLine().appendIndent()
                    .appendText(this.formatTableName(expr.table))
                    .appendLine()
                    .appendText("SET");

        expr.columns.forEach((x, i) => {
            this.sqlText.appendLine().appendIndent()
                        .appendText(`${this.formatIdentifier(x.name)} = ${this.formatParameter(x.name)}`)
                        .appendText(i != expr.columns.length - 1? ',' : '');
        });

        this.sqlText.appendLine()
                    .appendText("WHERE")
                    .appendLine().appendIndent()
                    .appendText(expr.keys.map(x => `${this.formatIdentifier(x.name)} = ${this.formatParameter(x.name)}`).join(' AND '));

        return this.sqlText.finish();
    }

    buildDelete(expr: DeleteStatement): string {
        this.sqlText.appendText("DELETE FROM")
                    .appendLine().appendIndent()
                    .appendText(this.formatTableName(expr.table))
                    .appendLine()
                    .appendText("WHERE")
                    .appendLine().appendIndent()
                    .appendText(expr.keys.map(x => `${this.formatIdentifier(x.name)} = ${this.formatParameter(x.name)}`).join(' AND '));

        return this.sqlText.finish();
    }

    formatParameter(parameter: string) {
        return `@${parameter}`;
    }

    buildSelect(expr: SelectExpression): string {
        this.sqlText.appendText('SELECT')
                    .appendLine().appendIndent();

        if(!expr.fields.length) {
            this.sqlText.appendText('*');
        }
        else {
            this.sqlText.appendText(expr.fields.map(x => this.formatField(x)).join(',\n    '))
        }

        if(expr.from && expr.from.length) {
            this.sqlText.appendLine()
                    .appendText('FROM')
                    .appendLine().appendIndent();

            expr.from.forEach((e, i) => {
                if(e.type == "TableExpression") {
                    this.sqlText.appendText(this.formatTableName(e));
                }
                else {
                    this.sqlText.baseIndent += 2;
    
                    this.sqlText.appendText('( ');
                    this.buildSelect(e.from);
    
                    this.sqlText.baseIndent--;
                    this.sqlText.appendLine().appendText(`) ${this.formatIdentifier(e.name)}`);
                    this.sqlText.baseIndent--;
                }
    
                if(i != expr.from.length - 1)
                    this.sqlText.appendText(', ');
            });
        }

        if(expr.joins && expr.joins.length) {
            for(const join of expr.joins) {
                this.sqlText.appendLine()
                            .appendText(`${this.formatJoinType(join.joinType)} JOIN `)
                            .appendLine().appendIndent()
                            .appendText(this.formatTableName(join.table));

                if(join.alias) {
                    this.sqlText.appendText(` AS ${join.alias}`);
                }

                this.sqlText.appendLine()
                            .appendText(`ON`)
                            .appendWhitespace();

                if(join.joinType != JoinType.Cross)
                    this.buildPredicate(join.predicate);
            }
        }

        if(expr.where) {
            this.buildWhere(expr.where as SqlBinaryExpression);
        }

        if(expr.orderBy && expr.orderBy.length) {
            const order = expr.orderBy.map(x => `${this.formatProperty(x.column)} ${x.isDescending? 'DESC' : 'ASC'}`);
            this.sqlText.appendLine()
                        .appendText(`ORDER BY ${order.join(', ')}`);
        }

        if(expr.groupBy && expr.groupBy.length) {
            this.sqlText.appendLine()
                        .appendText(`GROUP BY ${expr.groupBy.map(x => this.formatProperty(x)).join(', ')}`);
        }

        if(expr.limit)
            this.buildLimit(expr.limit);
                    
        return this.sqlText.finish();
    }

    buildLimit(limit: LimitExpression): void {
        this.sqlText.appendLine();

        if(limit.skip) {
            const param = this.formatParameter(limit.skip.name);
            this.sqlText.appendText(`OFFSET ${param} ROWS`).appendLine();
        }

        if(limit.take) {
            const param = this.formatParameter(limit.take.name);
            this.sqlText.appendText(`FETCH FIRST ${param} ROWS ONLY`);
        }
    }

    buildWhere(where: SqlBinaryExpression) {
        this.sqlText.appendLine()
                    .appendText('WHERE')
                    .appendLine().appendIndent();
        
        this.buildPredicate(where);
    }

    buildPredicate(expr: SqlStatement | SelectExpression, prev?: SqlStatement | SelectExpression) {
        const type = expr.type;
        switch(expr.type) {
            case "AsteriskExpression":
                this.sqlText.appendText(`${expr.view? expr.view + '.' : '' }*`);
                break;

            case "SelectExpression":
                this.buildSelect(expr);
                break;

            case "SqlBinaryExpression":
                const binaryOperator = this.formatOperator(expr.operator);
                let hasParenthesis = false;

                if(prev && prev.type == "SqlBinaryExpression") {
                    const prevop = this.operatorPrecedence(prev.operator);
                    const currop = this.operatorPrecedence(expr.operator);

                    if(prevop < currop) {
                        hasParenthesis = true;
                        this.sqlText.appendText("(");
                    }
                }
                
                this.buildPredicate(expr.left, expr);
                this.sqlText.appendText(` ${binaryOperator} `);
                this.buildPredicate(expr.right, expr);

                if(hasParenthesis)
                    this.sqlText.appendText(")");

                break;

            case "SqlIdentifierExpression":
                const parameter = this.formatParameter(expr.name);
                this.sqlText.appendText(`${parameter}`);
                break;

            case "SqlCallExpression":
                this.sqlText.appendText(`${expr.name} (`);
                
                for(const arg of expr.arguments)
                    this.buildPredicate(arg as SqlStatement);

                this.sqlText.appendText(')');
                break;

            case "SqlLiteralExpression":
                this.buildLiteral(expr.value);
                break;

            case "SqlPropertyExpression":
                this.sqlText.appendText(this.formatProperty(expr));
                break;

            case "SqlUnaryExpression":
                const unaryOperator = this.formatOperator(expr.operator);
                if(expr.isPrefixed)
                    this.sqlText.appendText(`${unaryOperator} `);

                this.buildPredicate(expr.operand);

                if(!expr.isPrefixed)
                    this.sqlText.appendText(` ${unaryOperator}`);
                
                break;

            case "SqlListExpression":
                this.sqlText.appendText('(');
                
                let index = 0;
                for(const el of expr.elements) {
                    if(index++ != 0)
                        this.sqlText.appendText(', ');

                    this.buildPredicate(el);
                }

                this.sqlText.appendText(')');
                break;

            default:
                throw new Error(`Expression of type '${type}' cannot be build as predicate`);
        }
    }

    protected formatProperty(expr: SqlPropertyExpression) {
        if(!expr)
            return 'NULL';

        const view = typeof expr.view == 'string'? expr.view : expr.view.name;
        return `${this.formatIdentifier(view)}.${this.formatIdentifier(expr.property)}`;
    }

    protected formatIdentifier(identifier: string) {
        return identifier;
    }

    protected formatStringLiteral(str: string) {
        return `'${str}'`;
    }

    protected formatOperator(operator: SqlOperator): string {
        switch(operator) {
            case SqlOperator.Add                : return "+";
            case SqlOperator.And                : return "AND";
            case SqlOperator.As                 : return "AS";
            case SqlOperator.Between            : return "BETWEEN";
            case SqlOperator.BitwiseAnd         : return "&";
            case SqlOperator.BitwiseExclusiveOr : return "^";
            case SqlOperator.BitwiseNot         : return "~";
            case SqlOperator.BitwiseOr          : return "|";
            case SqlOperator.Distinct           : return "DISTINCT";
            case SqlOperator.Divide             : return "/";
            case SqlOperator.Equals             : return "=";
            case SqlOperator.Greater            : return ">";
            case SqlOperator.GreaterOrEquals    : return ">=";
            case SqlOperator.In                 : return "IN";
            case SqlOperator.Is                 : return "IS";
            case SqlOperator.LeftShift          : return "<<";
            case SqlOperator.Less               : return "<";
            case SqlOperator.LessOrEquals       : return "<=";
            case SqlOperator.Like               : return "LIKE";
            case SqlOperator.Modulo             : return "%";
            case SqlOperator.Multiply           : return "*";
            case SqlOperator.Not                : return "NOT";
            case SqlOperator.NotEquals          : return "<>";
            case SqlOperator.Or                 : return "OR";
            case SqlOperator.RightShift         : return ">>";
            case SqlOperator.Substract          : return "-";
        }
    }

    // based on T-SQL operator precedence
    protected operatorPrecedence(operator: SqlOperator) {
        switch(operator) {
            case SqlOperator.BitwiseNot         : return 1;
            case SqlOperator.Divide             :
            case SqlOperator.Multiply           :
            case SqlOperator.Modulo             : return 2;
            case SqlOperator.Add                :
            case SqlOperator.Substract          :
            case SqlOperator.BitwiseAnd         :
            case SqlOperator.BitwiseExclusiveOr :
            case SqlOperator.BitwiseOr          : return 3;
            case SqlOperator.Equals             :
            case SqlOperator.Greater            :
            case SqlOperator.GreaterOrEquals    :
            case SqlOperator.Less               :
            case SqlOperator.LessOrEquals       :
            case SqlOperator.NotEquals          : return 4;
            case SqlOperator.Not                : return 5;
            case SqlOperator.And                : return 6;
            case SqlOperator.Between            :
            case SqlOperator.In                 :
            case SqlOperator.Like               :
            case SqlOperator.Or                 : return 7;
            default                             : return 8;
        }
    }

    protected formatField(expr: SelectFieldExpression): string {
        const field = expr.field;
        let sql: string;
        switch(field.type) {
            case "SqlPropertyExpression":
                sql = this.formatProperty(field);
                break;

            case "SqlCallExpression":
            case "SqlBinaryExpression":
            case "SqlUnaryExpression":
                sql = this.useIsolatedSqlText(() => this.buildPredicate(field));
                break;

            case "SelectExpression":
                sql = this.useIsolatedSqlText(() => this.buildSelect(field));
                break;
        }

        return !expr.alias? sql : `${sql} AS ${this.formatStringLiteral(expr.alias)}`;
    }

    protected formatJoinType(type: JoinType) {
        switch(type) {
            case JoinType.Cross     : return "CROSS";
            case JoinType.FullOuter : return "FULL OUTER";
            case JoinType.Inner     : return "INNER";
            case JoinType.Left      : return "LEFT";
            case JoinType.Right     : return "RIGHT";
        }
    }

    protected useIsolatedSqlText(action: () => void): string {
        const sqlText = this.sqlText;
        this.sqlText = new SqlTextBuilder();

        action();
        const sql = this.sqlText.finish();

        this.sqlText = sqlText;
        return sql;
    }

}