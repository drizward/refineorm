import { StandardQueryBuilder } from "../../sql/standardSqlBuilder";
import { ColumnExpression } from "../../sqlExpressions/columnExpression";
import { TableExpression } from "../../sqlExpressions/tableExpression";
import { LimitExpression } from '../../sqlExpressions/limitExpression';

export class MysqlBuilder extends StandardQueryBuilder {

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
        return `:${parameter}`;
    }

    formatIdentifier(identifier: string): string {
        return `\`${identifier}\``;
    }

    buildLimit(limit: LimitExpression): void {
        this.sqlText.appendLine().appendText('LIMIT ');

        if(limit.skip) {
            const skip = this.formatParameter(limit.skip.name);
            this.sqlText.appendText(`${skip}, `);
        }

        if(limit.take) {
            const take = this.formatParameter(limit.take.name);
            this.sqlText.appendText(`${take}`);
        }
        else if(limit.skip) {
            this.sqlText.appendText('18446744073709551615');
        }
    }

}