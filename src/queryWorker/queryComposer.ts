import { TableDescriptor } from '../meta/tableDescriptor';
import { TableExpression } from '../sqlExpressions/tableExpression';
import { SelectExpression } from '../sqlExpressions/selectExpression';
import { ObjectMapper } from '../core/objectMapper';
import { ColumnDescriptor } from '../meta/columnDescriptor';
import { SqlPropertyExpression } from '../sqlExpressions/sqlPropertyExpression';
import { internal } from '../internal/internal';
import { TableColumnDescriptor } from '../internal/descriptorMapper';
import { AssociationDescriptor } from '../meta/associationDescriptor';
import { JoinExpression } from '../sqlExpressions/joinExpression';
import { JoinType } from '../sqlExpressions/joinType';
import { Expression, CallExpression, Literal, SpreadElement, RegExpLiteral } from 'estree';
import { StatementTranslator } from '../internal/statementTranslator';
import { SqlOperator } from '../sqlExpressions/sqlOperator';
import { SqlIdentifierExpression } from '../sqlExpressions/sqlIdentifierExpression';
import { CreateTableWorker } from './createTableWorker';
import { InsertWorker } from './insertWorker';
import { ViewWorker } from './viewWorker';
import { UpdateWorker } from './updateWorker';
import { DeleteWorker } from './deleteWorker';
import { FirstSingleWorker } from './firstSingleWorker';
import { WhereWorker } from './whereWorker';
import { SkipTakeWorker } from './skipTakeWorker';
import { OrderByWorker } from './orderByWorker';
import { DataContext } from '../dataContext';
import { TableContext } from './queryContext/tableContext';
import { QueryDescriptor } from '../internal/queryDescriptor';
import { SequenceContext } from './queryContext/sequenceContext';
import { SelectContext } from './queryContext/selectContext';
import { QueryContextResolver } from '../internal/queryContextResolver';
import { SelectWorker } from './selectWorker';
import { Query } from '../core/query';
import * as objectHash from 'object-hash'
import { DataSet } from '../dataSet';
import { BoundWorker } from './boundWorker';
import { AggregateWorker } from './aggregateWorker';
import { SingleContext } from './queryContext/singleContext';
import { ScalarContext } from './queryContext/scalarContext';
import { AllAnyWorker } from './allAnyWorker';
import { GroupByWorker } from './groupByWorker';
import { JoinWorker } from './joinWorker';

type PrimitiveType = string | number | boolean;

type QueryCache = {
    expr: Expression,
    hash: string,
    query: Query,
    sequence: SequenceContext
};

type ExpressionCache = {
    method: string;
    inner: ExpressionCache;
    args: Array<Expression | SpreadElement | RegExpLiteral>;
    contextName: string;
    dataset: string;
    argNames: string[];
}

export class QueryComposer {

    static readonly workers = [
        new ViewWorker(),
        new CreateTableWorker(),
        new InsertWorker(),
        new UpdateWorker(),
        new DeleteWorker(),
        new BoundWorker(),
        new SelectWorker(),
        new WhereWorker(),
        new FirstSingleWorker(),
        new SkipTakeWorker(),
        new OrderByWorker(),
        new AggregateWorker(),
        new AllAnyWorker(),
        new GroupByWorker(),
        new JoinWorker()
    ];
    static readonly caches: QueryCache[] = [];

    private associations: AssociationDescriptor[] = [];
    private translator: StatementTranslator = new StatementTranslator();

    compose(expr: Expression): SequenceContext {
        for(let worker of QueryComposer.workers) {
            if(!worker.canConvert(expr))
                continue;

            return worker.convertQuery(this, expr);
        }
    }
    
    fromTable(table: TableDescriptor, dataContext: DataContext) {       
        const sequence = new TableContext(table);
        const select = sequence.select = {
            type: "SelectExpression",
            fields: [],
            from: []
        }
        const view = this.formatTableExpression(table);     
        select.from.push(view);

        sequence.mapper = new ObjectMapper().asTypeOf(table.type.constructor);
        sequence.dataContext = dataContext;

        return sequence;
    }

    addColumn(sequence: SequenceContext, column: ColumnDescriptor, viewName: string, alias?: string) {
        const select = sequence.select;
        
        select.fields.push({
            type: "SelectFieldExpression",
            alias,
            field: this.formatPropertyExpression(column, viewName)
        });

        return this;
    }

    addColumns(sequence: SequenceContext, table: TableDescriptor, viewName: string, prefixColumn?: boolean) {
        const columns = Object.keys(table.columns)
                              .map(x => table.columns[x])
                              .filter(x => !x.isCredential && !x.isGenerated && !x.isLazy);

        const prefix = !prefixColumn? undefined : viewName;
        for(let col of columns) {
            if(internal.mapper.isTableType(col.classType)) 
                continue;

            if(col.isKey)
                sequence.mapper.referenceBy(col.propertyName, prefix);

            this.addColumn(sequence, col, viewName, prefixColumn? `${viewName}.${col.propertyName}` : undefined);
        }

        return this;
    }

    addAsteriskToField(sequence: SequenceContext, view?: string) {
        const seelct = sequence.select;

        seelct.fields.push({
            type: "SelectFieldExpression",
            field: {
                type: "AsteriskExpression",
                view
            }
        });

        return this;
    }
    
    addAssociationFrom(sequence: SequenceContext, table: TableDescriptor, viewName: string, prefixAlias?: boolean) {
        const select = sequence.select;
        let joins = select.joins;
        if(!joins)
            joins = select.joins = [];

        const columns = Object.keys(table.columns)
                              .map(x => table.columns[x])
                              .filter(x => !x.isLazy && internal.mapper.isTableType(x.classType));

        for(let col of columns) {
            let owner: TableColumnDescriptor = { type: table, property: col };
            const jtd = internal.mapper.mapOf(col.classType);

            if(col.isReference) {
                owner = { type: jtd, property : col.referenceTo || internal.mapper.keyOf(jtd) }
            }

            const assoc = table.associations
                               .find(x => x.owner.type == owner.type && x.owner.property == owner.property);

            if(!assoc || this.associations.some(x => x == assoc))
                continue;

            const joinTable = this.formatTableExpression(jtd);
            const alias = !prefixAlias? col.name : `${viewName}.${col.name}`;
            const join: JoinExpression = {
                type: "JoinExpression",
                table: joinTable,
                alias,
                joinType: JoinType.Left,
                predicate: {
                    type: "SqlBinaryExpression",
                    operator: SqlOperator.Equals,
                    left: {
                        type: "SqlPropertyExpression",
                        property: col.isReference? assoc.ref.property.name : col.name,
                        view: viewName,
                    },
                    right: {
                        type: "SqlPropertyExpression",
                        property: col.isReference? assoc.owner.property.name : assoc.ref.property.name,
                        view: alias
                    }
                }
            }

            joins.push(join);
            this.associations.push(assoc);

            const mapperPrefix = !prefixAlias? null : viewName;
            sequence.mapper.setPropertyType(col.name, jtd.type.constructor, mapperPrefix);
            if(col.isCollection)
                sequence.mapper.setPropertyCollectionType(col.name, col.collectionType, mapperPrefix);

            this.addColumns(sequence, jtd, alias, true);
        }
    }

    addOrderBy(sequence: SequenceContext, selector: Expression, isDescending: boolean) {
        const query = sequence.select;
        const member = this.translator.translate(selector, [ sequence ], sequence.parameters);

        if(member.type != "SqlPropertyExpression")
            throw new Error("Order by must be based on a class property!");

        if(!query.orderBy)
            query.orderBy = [];
        
        query.orderBy.push({
            type: "OrderByExpression",
            column: member, 
            isDescending
        });

        return sequence;
    }

    addWhere(sequence: SequenceContext, predicate: Expression) {
        const query = sequence.select;
        const expr = this.translator.translate(predicate, [ sequence ], sequence.parameters);

        if(expr.type == "SqlPropertyExpression") {
            // TO DO
        }

        let oldWhere = query.where;  
        query.where = !oldWhere? expr : {
            type: "SqlBinaryExpression",
            operator: SqlOperator.And,
            left: oldWhere,
            right: expr
        };

        return sequence;
    }

    addTakeLimit(sequence: SequenceContext, count: number) {
        let query = sequence.select;
        const param = this.createParameter(sequence, count);

        if(query.limit && query.limit.take)
            query = this.formatAsSubQuery(sequence);

        if(!query.limit) {
            query.limit = {
                type: "LimitExpression",
                take: param
            }
        }
        else {
            query.limit.take = param;
        }

        return sequence;
    }

    addSkipOffset(sequence: SequenceContext, count: number) {
        let query = sequence.select;
        if(query.limit) 
            query = this.formatAsSubQuery(sequence);

        query.limit = {
            type: "LimitExpression",
            skip: this.createParameter(sequence, count)
        }

        return this;
    }
    
    selectBy(sequence: SequenceContext, selector: Expression): SequenceContext {
        if(selector.type == "Literal" && selector.value instanceof Array)
            return this.selectByProperty(sequence, selector.value as string[]);

        if(selector.type != "ArrowFunctionExpression")
            throw new Error("Select's selector must be wrapped inside a lambda");
        
        const lambdaContext = this.translator.createLambdaContext(selector, [ sequence ]);
        const resolver = new QueryContextResolver(lambdaContext, this.translator);

        const selectContext = resolver.resolve(selector.body as any);
        if(!(selectContext instanceof SelectContext))
            return new SingleContext(sequence, selectContext);
        
        selectContext.inheritFrom(sequence);
        return selectContext;
    }

    formatAsSubQuery(sequence: SequenceContext): SelectExpression {
        sequence.finalizeQuery(this, true);

        sequence.select = {
            type: "SelectExpression",
            fields: [],
            from: [{
                type: "SqlViewExpression",
                from: sequence.select,
                name: sequence instanceof TableContext? sequence.tableName : 'test'
            }]
        };

        return sequence.select;
    }

    addBoundParameter(obj: object) {
        this.translator.addBoundParameter(obj);
    }

    addParameter(sequence: SequenceContext, key: string, value: PrimitiveType) {
        if(!sequence.parameters)
            sequence.parameters = [];

        const param = {
            name: key,
            value: value
        }
        sequence.parameters.push(param);
        return param;
    }
    
    createParameter(sequence: SequenceContext, value: PrimitiveType): SqlIdentifierExpression {
        const num = !sequence.parameters? 0 : sequence.parameters.length;
        const param = this.addParameter(sequence, `p${num}`, value);
        return {
            type: "SqlIdentifierExpression",
            name: param.name
        }
    }

    getDescriptor(sequence: SequenceContext): QueryDescriptor {
        const isQuery = !sequence.statement;
        return {
            isQuery,
            isScalar: sequence instanceof ScalarContext,
            isSingle: sequence.isSingle || false,
            mapper: sequence.mapper,
            parameterKey: !sequence.parameters? null : sequence.parameters.map(x => x.name),
            parameters: !sequence.parameters? null : sequence.parameters.reduce((o, x) => {
                o[x.name] = typeof x.value == 'function'? x.value() : x.value;
                return o;
            }, {}),
            sqlExpression: sequence.statement || sequence.select,
            provider: sequence.dataContext.provider,
            runner: isQuery? (s, p) => sequence.dataContext.sendRawQuery(s, p) : 
                             (s, p) => sequence.dataContext.sendRawCommand(s, p)
        }
    }

    getTranslator() {
        return this.translator;
    }

    findQuery(hash: string): Query {
        for(const cache of QueryComposer.caches) {
            if(!this.isContainsDataSet(cache.expr) && cache.expr.type != "CallExpression")
                continue;
            
            if(cache.hash == hash)
                return cache.query;
        }

        return null;
    }

    cacheQuery(expr: Expression, hash: string, query: Query, sequence: SequenceContext) {
        QueryComposer.caches.push({ expr, hash, query, sequence});
    }

    hashExpression(expr: Expression) {
        const exprdesc = this.describeExpression(expr);
        return objectHash.sha1(exprdesc);
    }

    private selectByProperty(sequence: SequenceContext, properties: string[]) {
        const select = new SelectContext(sequence);
        for(const prop of properties) {
            const propertyContext = sequence.getValue(prop);

            if(!propertyContext)
                throw new Error(`Property with key ${prop} is not exists in current context`);

            select.addProperty(prop, propertyContext);
        }

        return select;
    }

    private formatTableExpression(table: TableDescriptor): TableExpression {
        return {
            type: "TableExpression",
            classType: table.type,
            name: table.name,
            schema: table.schema
        };
    }

    private formatPropertyExpression(column: ColumnDescriptor, viewName: string): SqlPropertyExpression {
        return {
            type: "SqlPropertyExpression",
            property: column.name,
            view: viewName
        };
    }

    private describeExpression(expr: Expression): ExpressionCache {
        
        if(this.isContainsDataSet(expr)) {
            expr = expr as Literal;

            const dataset = (<any> expr.value) as DataSet<any>;

            return {
                args: null,
                contextName: dataset.context.constructor.name,
                dataset: dataset.constructor.name,
                inner: null,
                method: null,
                argNames: null
            }
        }
        else if(expr.type == "CallExpression" && expr.callee.type == "Identifier") {
            let args = expr.arguments? expr.arguments.slice(1) : null;
            const [first] = expr.arguments? expr.arguments : null;

            let inner: ExpressionCache;
            if(first && first.type == "CallExpression")
                inner = this.describeExpression(first);

            if(args && args.length == 1) {
                args = args.map(x => {
                    if(x.type != "Literal")
                        return x;

                    return this.isPrimitive(x.value)? x : {
                        type: "Literal",
                        value: x.value.constructor.name
                    }
                }) as Expression[];
            }

            return {
                args, inner,
                contextName: inner? inner.contextName : null,
                dataset: inner? inner.dataset : null,
                method: expr.callee.name,
                argNames: null
            }
        }
    }

    private isContainsDataSet(expr: Expression) {
        return  expr.type == "Literal" && expr.value 
                && 'context' in (<any> expr.value)
                && (<any> expr.value).context instanceof DataContext
    }

    private isPrimitive(value: any) {
        if(!value)
            return false;

        const primitives = [ 'string', 'number', 'boolean' ];
        return primitives.some(x => typeof value == x);
    }

}