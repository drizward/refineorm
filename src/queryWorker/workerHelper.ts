import { Expression } from 'estree';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { SqlBinaryExpression } from '../sqlExpressions/sqlBinaryExpression';
import { SqlOperator } from '../sqlExpressions/sqlOperator';

export const WorkerHelper = {

    isQueryExpression(expr: Expression, ...names: string[]): boolean {
        if(expr.type != "CallExpression" || expr.callee.type != "Identifier")
            return false;

        return names && names.length? names.includes(expr.callee.name) : true;
    },

    createSubQuery(inner: SelectExpression): SelectExpression {
        return {
            type: "SelectExpression",
            fields: [],
            from: [{
                type: "SqlViewExpression",
                from: inner,
                name: "a"
            }]
        }
    },

    mergeWhere(query: SelectExpression, where: SqlBinaryExpression): SqlBinaryExpression {
        let oldWhere = query.where;  
        return query.where = !oldWhere? where : {
            type: "SqlBinaryExpression",
            operator: SqlOperator.And,
            left: oldWhere,
            right: where
        };
    },

    createSelectFromSet() {
        
    }

}