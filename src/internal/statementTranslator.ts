import { QueryParameter } from '../core/queryParameter';
import { Expression, ArrowFunctionExpression, BlockStatement, AssignmentExpression, SwitchStatement, Property, ReturnStatement, UnaryExpression, BinaryExpression, LogicalExpression, MemberExpression, CallExpression, Literal, Identifier, ArrayExpression } from 'estree';
import { SqlStatement } from '../sqlExpressions/sqlStatement';
import { SqlOperator } from '../sqlExpressions/sqlOperator';
import { SqlBinaryExpression } from '../sqlExpressions/sqlBinaryExpression';
import { SqlIdentifierExpression } from '../sqlExpressions/sqlIdentifierExpression';
import { LambdaContext } from '../queryWorker/queryContext/lambdaContext';
import { QueryContextResolver } from './queryContextResolver';
import { ObjectContext } from '../queryWorker/queryContext/objectContext';

export class StatementTranslator {

    private queryParams: QueryParameter[];
    private lambdaBound: any[];
    private lambdaContext: LambdaContext;

    constructor(private bound?: {}) {
    }

    translate(expr: Expression, paramsBound: any[] | LambdaContext, queryParams?: QueryParameter[]): SqlStatement {
        this.queryParams = queryParams;

        if(paramsBound instanceof Array) {
            this.lambdaBound = paramsBound;
        }
        else {
            this.lambdaContext = paramsBound;
        }

        const res = this.translateInternal(expr);
        
        this.queryParams = undefined;
        this.lambdaBound = undefined;
        this.lambdaContext = undefined;
        return res;
    }

    addBoundParameter(obj: object) {
        if(!this.bound)
            this.bound = {};
            
        Object.keys(obj).forEach(x => this.bound[x] = obj[x]);
    }

    unwrapIdentifier(identifier: Expression): string | number {
        if(identifier.type == "Identifier") {
            return identifier.name;
        }
        else if(identifier.type == "Literal") {
            const value = identifier.value;
            if(typeof value == 'string' || typeof value == 'number')
                return value;

            throw new Error("Literal must be only of type string or number");
        }
        else throw new Error("Not a identifier or literal");
    }

    createLambdaContext(expr: ArrowFunctionExpression, args: any[]) {
        const context = new LambdaContext(this.bound);
        if(expr.params && expr.params.length) {
            for(let i in expr.params) {
                const p = expr.params[i];
                if(p.type != "Identifier")
                    throw new Error("Lambda params/arguments must be of Identifer type");

                context.addParameter(p.name, args[i]);
            }
        }

        return context
    }

    createParameter(value: any): SqlIdentifierExpression {
        const name = `p${this.queryParams.length}`;
        this.queryParams.push({ name, value });

        return {
            type: "SqlIdentifierExpression",
            name
        };
    }

    protected translateInternal(expr: Expression): SqlStatement {
        switch(expr.type) {
            case "ArrowFunctionExpression":
                return this.translateLambda(expr);

            case "UnaryExpression":
                return this.translateUnary(expr);

            case "BinaryExpression":
            case "LogicalExpression":
                return this.translateBinary(expr);

            case "CallExpression":
                return this.translateMethod(expr);

            case "ArrayExpression":
            case "MemberExpression":
            case "Identifier":
                return this.resolveParameter(expr);

            case "Literal":
                return this.translateLiteral(expr);
        }
    }

    protected translateLambda(expr: ArrowFunctionExpression): SqlStatement {
        this.lambdaContext = this.createLambdaContext(expr, this.lambdaBound);
        let body = expr.body;
        if(!expr.expression && body.type == "BlockStatement")
            body = this.unwrapBlock(body);
        
        body = body as Expression;
        const res = this.translateInternal(body);
        
        this.lambdaContext = undefined;
        return res;
    }

    protected translateUnary(expr: UnaryExpression): SqlStatement {
        let operator: SqlOperator;
        const operand = this.translateInternal(expr);

        switch(expr.operator) {
            case "!":
                operator = SqlOperator.Not;
                break;

            case "+":
                operator = SqlOperator.Add;
                break;

            case "-":
                operator = SqlOperator.Substract;
                break;
            
            case "~":
                operator = SqlOperator.BitwiseNot;
                break;

            default:
                throw new Error(`Operator '${expr.operator}' are not supported in SQL`);
        }

        return {
            type: "SqlUnaryExpression",
            operand,
            operator,
            isPrefixed: expr.prefix
        };
    }

    protected translateBinary(expr: BinaryExpression | LogicalExpression): SqlBinaryExpression {
        if(expr.operator == "in")
            return this.tryBuildIn(expr);

        let operator: SqlOperator;
        const left = this.translateInternal(expr.left);
        let right = this.translateInternal(expr.right);

        if(expr.type == "LogicalExpression" && 
            left.type == "SqlBinaryExpression" && right.type == "SqlBinaryExpression") {
            
            const between = this.tryBuildBetween(left, right, expr.operator == "||");
            if(between)
                return between;
        }

        switch(expr.operator) {
            case "!=":
            case "!==":
                operator = SqlOperator.NotEquals;
                break;

            case "%":
                operator = SqlOperator.Modulo;
                break;

            case "&":
                operator = SqlOperator.BitwiseAnd;
                break;

            case "&&":
                operator = SqlOperator.And;
                break;

            case "*":
                operator = SqlOperator.Multiply;
                break;
                
            case "+":
                operator = SqlOperator.Add;
                break;
            
            case "-":
                operator = SqlOperator.Substract;
                break;

            case "/":
                operator = SqlOperator.Divide;
                break;

            case "<":
                operator = SqlOperator.Less;
                break;

            case "<<":
                operator = SqlOperator.LeftShift;
                break;

            case "<=":
                operator = SqlOperator.LessOrEquals;
                break;

            case "==":
            case "===":
                operator = SqlOperator.Equals;
                break;

            case ">":
                operator = SqlOperator.Greater;
                break;

            case ">=":
                operator = SqlOperator.GreaterOrEquals;
                break;

            case ">>":
            case ">>>":
                operator = SqlOperator.RightShift;
                break;

            case "^":
                operator = SqlOperator.BitwiseExclusiveOr;
                break;

            case "in":
                operator = SqlOperator.In;
                break;

            case "|":
                operator = SqlOperator.BitwiseOr;
                break;

            case "||":
                operator = SqlOperator.Or;
                break;

            default:
                throw new Error(`Operator '${expr.operator}' cannot be converted to SQL`);
        }

        if(right.type == "SqlLiteralExpression" && (right.value == undefined || right.value == null)) {
            if(operator == SqlOperator.Equals) {
                operator = SqlOperator.Is;
            }
            else if(operator == SqlOperator.NotEquals) {
                operator = SqlOperator.Is;
                right = {
                    type: "SqlUnaryExpression",
                    operand: right,
                    isPrefixed: true,
                    operator: SqlOperator.Not
                }
            }
        }

        return {
            type: "SqlBinaryExpression",
            left,
            right,
            operator
        };
    }

    protected tryBuildIn(expr: BinaryExpression): SqlBinaryExpression {
        const resolver = new QueryContextResolver(this.lambdaContext, this);

        const left = resolver.resolve(expr.left);
        const right = resolver.resolve(expr.right);

        const leftType = left.getBoundType();
        const rightType = right.getBoundType();
        
        if(left instanceof ObjectContext) {
            left.createParameter(this);
        }

        if(right instanceof ObjectContext) {
            right.createParameter(this);
        }

        if(leftType == String && rightType == String) {
            
            return {
                type: "SqlBinaryExpression",
                operator: SqlOperator.Like,
                left: right.toSqlExpression() as SqlStatement,
                right: left.toSqlExpression() as SqlStatement
            }
        }

        return {
            type: "SqlBinaryExpression",
            operator: SqlOperator.In,
            left: left.toSqlExpression() as SqlStatement,
            right: right.toSqlExpression() as SqlStatement,
        };
    }

    protected translateMethod(expr: CallExpression): SqlStatement {
        const callee = expr.callee;
        if(callee.type != "MemberExpression")
            throw new Error("Call to method without object or class is not supported in SQL translation");

        return this.resolveParameter(expr);
    }

    protected resolveParameter(expr : MemberExpression | Identifier | CallExpression | ArrayExpression): SqlStatement {
        const resolver = new QueryContextResolver(this.lambdaContext, this);
        const context = resolver.resolve(expr);

        if(context instanceof ObjectContext)
            context.createParameter(this);

        const e = context.toSqlExpression() as SqlStatement;
        return e;
    }

    protected translateLiteral(literal: Literal): SqlStatement {
        const value: any = literal.value;
        if( !value || typeof value == 'string' ||
            typeof value == 'boolean' || typeof value == 'number' ) {

                if(value != null && value != undefined && this.queryParams)
                    return this.createParameter(literal.value);

            return { type: "SqlLiteralExpression", value };
        }

        throw new Error("A property from an object in memory must be of type string, boolean, number or bigint");
    }

    protected unwrapBlock(block: BlockStatement): Expression {
        if(block.body.length > 1)
            throw new Error("Block statement must have no more than one body");

        let [body] = block.body;

        if(body.type == "ReturnStatement") {
            return this.unwrapReturn(body);
        }
        else if(body.type == "SwitchStatement") {
            return this.unwrapSwitchCase(body);
        }
        else throw new Error("Currently only Return and Switch statement can be used inside a Block");
    }

    protected unwrapAssigment(expr: AssignmentExpression): Expression {
        const r = expr.right;
        return r.type == "AssignmentExpression"? this.unwrapAssigment(r) : r;
    }

    protected unwrapReturn(expr: ReturnStatement): Expression {
        const arg = expr.argument;
        return arg.type == "AssignmentExpression"? this.unwrapAssigment(arg) : arg;
    }

    protected unwrapSwitchCase(expr: SwitchStatement): Expression {
        const props: Property[] = [];
        for(let c of expr.cases) {
            if(c.consequent.length > 1)
                throw new Error("Case of SwitchCase must not have more than one line of body");

            const [body] = c.consequent;
            if(body.type != "ReturnStatement")
                throw new Error("Case of SwitchCase must only have return as the body");

            const key = c.test.type == "Literal"? c.test.value : "_";
            
            props.push({
                type: "Property",
                computed: false,
                key: {
                    type: "Identifier",
                    name: typeof key == "string"? key : key.toString()
                },
                value: this.unwrapReturn(body),
                method: false,
                kind: "init",
                shorthand: false
            });
        }

        return {
            type: "ObjectExpression",
            properties: props
        };
    }

    protected tryBuildBetween(left: SqlBinaryExpression, right: SqlBinaryExpression, isNot?: boolean): SqlBinaryExpression {
        if(left.right.type != "SqlPropertyExpression" || right.left.type != "SqlPropertyExpression")
            return null;

        if(left.right.property != right.left.property)
            return null;

        let lrview = left.right.view
        let rlview = right.left.view;
        lrview = typeof lrview == 'string'? lrview : lrview.name;
        rlview = typeof rlview == 'string'? rlview : rlview.name;

        if(rlview != lrview)
            return null;

        if( isNot?
            (left.operator != SqlOperator.Greater || right.operator != SqlOperator.Greater) :
            (left.operator != SqlOperator.LessOrEquals || right.operator != SqlOperator.LessOrEquals)
        )
            return null;

        const andOperands: SqlBinaryExpression = {
            type: "SqlBinaryExpression",
            operator: SqlOperator.And,
            left: left.left,
            right: right.right
        };
        
        return {
            type: "SqlBinaryExpression",
            operator: isNot? SqlOperator.Not : SqlOperator.Between,
            left: left.right,
            right: !isNot? andOperands : {
                type: "SqlUnaryExpression",
                isPrefixed: true,
                operand: andOperands,
                operator: SqlOperator.Between
            }
        };
    }
}
