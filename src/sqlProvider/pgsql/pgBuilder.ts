import { StandardQueryBuilder } from "../../sql/standardSqlBuilder";
import { ColumnExpression } from "../../sqlExpressions/columnExpression";
import { TableExpression } from "../../sqlExpressions/tableExpression";

export class PgBuilder extends StandardQueryBuilder {

    protected buildIndex(columns: ColumnExpression[], table: TableExpression, isUnique: boolean) {
        const maxLine = this.sqlText.length - 1;
        this.sqlText.moveCursor(maxLine - 1)
                    .appendText(',')
                    .appendLine().appendIndent()
                    .appendText(`INDEX`)
                    .appendWhitespace()
                    .appendText(`(${columns.map(x => x.name).join(', ')})`);
    }

    formatParameter(parameter: string): string {
        return `$${parameter}`;
    }

    protected formatIdentifier(identifier: string): string {
        return `"${identifier}"`;
    }

    protected formatStringLiteral(str: string): string {
        return `"${str}"`;
    }
    protected buildColumnDefinition(column: ColumnExpression) {
        this.buildColumnName(column);

        if(column.isAutoIncrement) {
            this.sqlText.appendText(' SERIAL');
            return;
        }

        this.buildColumnAttribute(column);
    }

}