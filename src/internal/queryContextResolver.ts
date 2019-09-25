import { KeyValueContext } from "../queryWorker/queryContext/keyValueContext";
import { Expression, MemberExpression, ConditionalExpression, CallExpression, ObjectExpression, Pattern, BinaryExpression, LogicalExpression, UnaryExpression, Identifier, ArrayExpression, SpreadElement } from "estree";
import { QueryContext } from "../queryWorker/queryContext/queryContext";
import { FunctionContext } from "../queryWorker/queryContext/functionContext";
import { StatementTranslator } from "./statementTranslator";
import { SelectContext } from "../queryWorker/queryContext/selectContext";
import { SequenceContext } from "../queryWorker/queryContext/sequenceContext";
import { QueryParameter } from "../core/queryParameter";
import { ExpressionContext } from "../queryWorker/queryContext/expressionContext";
import { LambdaContext } from "../queryWorker/queryContext/lambdaContext";
import { ObjectContext } from "../queryWorker/queryContext/objectContext";
import { SqlListExpression } from "../sqlExpressions/sqlListExpression";
import { ListContext } from "../queryWorker/queryContext/listContext";
import { internal } from "./internal";

export class QueryContextResolver {

    constructor(public source: KeyValueContext, private translator: StatementTranslator) {

    }

    resolve(expr: Expression | Pattern | SpreadElement, context?: KeyValueContext): QueryContext {
        context = context || this.source;
        
        switch(expr.type) {
            case "Literal"              : return new ObjectContext(expr.value);
            case "Identifier"           : return this.resolveIdentifier(expr, context);
            case "MemberExpression"     : return this.resolveMember(expr, context);
            case "ObjectExpression"     : return this.resolveObject(expr, context);
            case "LogicalExpression"    :
            case "BinaryExpression"     :
            case "UnaryExpression"      : return this.resolveLogicalExpression(expr, context);
            case "ArrayExpression"      : return this.resolveArray(expr, context);
        }

        return null;
    }

    resolveIdentifier(identifier: Identifier, context: KeyValueContext) {
        const name = identifier.name;
        const param = context.getValue(name) || 
                        (this.source? this.source.getValue(name) : null);

        if(!param)
            throw new Error(`Identifier not found ${name}. Are you sure you have bound it?`);

        return param;
    }

    resolveMember(member: MemberExpression, context: KeyValueContext): QueryContext {
        if(member.object.type == "Super") 
            throw new Error("Super are not allowed in an SQL query");

        const obj = this.resolve(member.object, context);
        const propType = member.property.type;
        if(propType != "Literal" && propType != "Identifier")
            throw new Error("Property must be a literal or identifier");

        const propName = this.translator.unwrapIdentifier(member.property).toString();
        const property = obj.getValue(propName);

        if(!property)
            throw new Error(`Member with key ${propName} not found in ${obj.getBoundType().name}`);

        return property;
    }

    resolveObject(obj: ObjectExpression, context: KeyValueContext, prefix?: string) {
        const select = new SelectContext();
        for(const member of obj.properties) {
            const key = this.translator.unwrapIdentifier(member.key);

            const ctx = this.resolve(member.value, context);
            if(ctx instanceof SelectContext)
                ctx.setViewName(key.toString());

            select.addProperty(key, ctx);
        }

        return select;
    }
    
    resolveLogicalExpression(expr: BinaryExpression | LogicalExpression | UnaryExpression, context: KeyValueContext) {
        let sequence: SequenceContext;

        const predicate = (ctx: QueryContext) => 'select' in ctx && 'dataContext' in ctx;
        if(predicate(context)) {
            sequence = context as SequenceContext;
        }
        else if(context instanceof LambdaContext) {
            const inner = context.getValues();
            sequence = inner.find(x => predicate(x)) as SequenceContext;
        }
        if(!sequence)
            throw new Error("Need a sequence to crack expression for select");

        if(!sequence.parameters)
            sequence.parameters = [];

        const sqlExpr = this.translator.translate(expr, context instanceof LambdaContext? context : [ sequence ], sequence.parameters);
        return new ExpressionContext(sqlExpr);
    }

    resolveFunction(call: CallExpression, context: KeyValueContext) {
        if(call.callee.type != "MemberExpression")
            throw new Error("Only member expression can be used as a call expression");

        if(call.callee.object.type == "Super") 
            throw new Error("Super are not allowed in an SQL query");

        let name: string;
        const obj = this.resolve(call.callee.object, context);
        const property = call.callee.property;

        switch(property.type) {
            case "Identifier"   : name = property.name; break;
            case "Literal"      : name = property.value.toString(); break;
            default             : throw new Error(`${property.type} are not valid for call expression`);
        }
        
        const adapter = internal.adapterMapper.findMethod(name, obj.getBoundType());

        const args = [];
        for(const arg of call.arguments) {
            const argContext = this.resolve(arg, context);
            if(argContext instanceof ObjectContext)
                argContext.createParameter(this.translator);

            args.push(argContext);
        }

        return new FunctionContext(adapter, args);
    }

    resolveArray(array: ArrayExpression, context: KeyValueContext) {
        if(array.elements.length == 1) {
            const [value] = array.elements;

            if(value.type == "Literal" || value.type == "Identifier" || value.type == "MemberExpression")
                return this.resolve(value, context);
        }

        const list = new ListContext();
        for(const element of array.elements) {
            const elementCtx = this.resolve(element, context);
            if(elementCtx instanceof ObjectContext)
                elementCtx.createParameter(this.translator);

            list.addItem(elementCtx);
        }

        return list;
    }

    protected getValue(key: string, context: KeyValueContext) {
        return context.getValue(key) || (context != this.source? this.source.getValue(key) : null);
    }

}