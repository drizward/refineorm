import { Expression, CallExpression, MemberExpression, Identifier, ObjectExpression, ArrowFunctionExpression, ExpressionStatement, Literal, Node } from 'estree';
import * as cherow from 'cherow';

export const ExpressionHelper = {

    call(caller: Expression, method: string, args: Expression[]): CallExpression {
        let callee: Expression = {
            type: "Identifier",
            name: method
        };
        
        if(caller) {
            callee = {
                type: 'MemberExpression',
                object: caller,
                computed: false,
                property: callee
            }
        }

        return {
            arguments: args,
            callee: callee,
            type: 'CallExpression'
        };
    },

    constant(obj: any): Literal {
        const identifier: Literal = {
            type: "Literal",
            value: obj
        };
        
        return identifier;
    },

    lambda(arrow: (...args: any[]) => any): ArrowFunctionExpression {
        const program = cherow.parse(arrow.toString());
        
        if(program.body.length > 1)
            throw new Error('Given expressions are not lambda!');
            
        const statement = <ExpressionStatement> (<any> program.body[0]);

        if(statement.expression.type != "ArrowFunctionExpression")
            throw new Error('Given expressions are not lambda!');

        return statement.expression;
    },

    nameof(arrow: (...args: any[]) => any): string {
        const lambda = ExpressionHelper.lambda(arrow);
        
        let body: Node = lambda.body;
        switch(body.type) {
            case "MemberExpression":
                body = body.property;
                break;

            case "CallExpression":
                body = body.callee;
                break;

            case "Identifier":
                break;
        }
        
        if(body.type != "Identifier") 
            throw new Error(`Nameof must be expression of member, call or identifier. Got ${body.type}`);
        
        return body.name;
    }

}