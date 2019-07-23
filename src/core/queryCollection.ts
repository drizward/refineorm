import { Collection } from "../collection";
import { GroupOf } from "../groupOf";
import { AsyncCollection } from '../asyncCollection';
import { QueryableProvider } from '../queryableProvider';
import { Expression } from 'estree';
import { ExpressionHelper } from './expressionHelper';
import { Query } from './query';
import { QueryResult } from './queryResult';
import { BasicCollection } from './basicCollection';
import { ResultDescriptor } from "./resultDescriptor";

export class QueryCollection<T> implements AsyncCollection<T>, QueryableProvider {

    provider: QueryableProvider;
    private _result: QueryResult<T>;

    constructor(public expression: Expression) {
        this.provider = this;
        this.expression = expression || ExpressionHelper.constant(this);
    }

    //#region Collection methods
    any(): Promise<boolean>;
    any(predicate: (model: T) => boolean): Promise<boolean>;

    async any(predicate?: any): Promise<boolean> {
        const args = [ this.expression ];
        if(predicate)
            args.push(ExpressionHelper.lambda(predicate));

        return await this.provider.executeQuery<boolean>(
            ExpressionHelper.call(
                null, 'any', args 
            )
        );
    }

    async average(): Promise<number>;
    async average(selector: (model: T) => number): Promise<number>;
    async average(selector?: (model: T) => number): Promise<number> {
        const args = [ this.expression ];
        if(selector)
            args.push(ExpressionHelper.lambda(selector));

        return await this.provider.executeQuery<number>(
            ExpressionHelper.call(
                null, 'average', args
            )
        );
    }

    async all(predicate: (model: T) => boolean): Promise<boolean> {

        if(!predicate)
            throw new Error("Selector for all cannot be empty!");

        return await this.provider.executeQuery<boolean>(
            ExpressionHelper.call(
                null, 'all', [
                    this.expression,
                    ExpressionHelper.lambda(predicate)
                ]
            )
        );
    }

    bind(obj: {}): AsyncCollection<T> {
        if(!obj)
            throw new Error("Bound object cannot be null or empty");

        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'bound', [ 
                    this.expression,
                    ExpressionHelper.constant(obj)
                ]
            )
        );
    }

    count(): Promise<number>;
    count(predicate: (model: T) => boolean): Promise<number>;
    async count(predicate?: any): Promise<number> {
        const args = [ this.expression ];
        if(predicate)
            args.push(ExpressionHelper.lambda(predicate));

        return await this.provider.executeQuery<number> (
            ExpressionHelper.call (
                null, 'count', args
            )
        );
            
    }

    distinct(): AsyncCollection<T> {
        return this.provider.createQuery<T>(
            ExpressionHelper.call(
                null, 'distinct', [ this.expression ]
            )
        );
    }
    
    async elementAt(index: number): Promise<T> {
        if(index == undefined || index < 0)
            throw new Error('Index for [elementAt] must be not null, and greater or equals than 0');

        return await this.provider.executeQuery<T>(
            ExpressionHelper.call(
                null, 'elementAt', [
                    this.expression,
                    ExpressionHelper.constant(index)
                ]
            )
        );
    }

    first(): Promise<T>;
    first(predicate: (model: T) => boolean): Promise<T>;
    async first(predicate?: any): Promise<T> {
        const args = [ this.expression ];
        if(predicate)
            args.push(ExpressionHelper.lambda(predicate));

        return await this.provider.executeQuery<T>(
            ExpressionHelper.call(
                null, 'first', args
            )
        );
    }

    groupBy<E>(selector: (model: T) => E): AsyncCollection<E> {
        if(!selector)
            throw new Error('Selector for [groupBy] cannot be null or empty');
            
        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'groupBy', [
                    this.expression,
                    ExpressionHelper.lambda(selector)
                ]
            )
        );
    }

    join<E, K, C>(cls2: AsyncCollection<E>, a: (model: T) => K, b: (model: E) => K, construct: (a: T, b: E) => C): AsyncCollection<C>;
    join<E, C>(cls2: AsyncCollection<E>, predicate: (a: T, b: E) => boolean, construct: (a: T, b: E) => C): AsyncCollection<C>;

    join<E, C>(cls2: AsyncCollection<E>, a: any, b: any, c?: any): AsyncCollection<C> {
        if(!cls2 || !a || !b)
            throw new Error("[Join] need at least 3 arguments thats not null or empty");
        if(!cls2.expression)
            throw new Error("[Join] first argument must be another AsyncCollection");
            
        const args = [
            this.expression,
            cls2.expression,
            ExpressionHelper.lambda(a),
            ExpressionHelper.lambda(b)
        ];

        if(c)
            args.push(ExpressionHelper.lambda(c));

        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'join', args
            )
        );
    }

    last(): Promise<T>;
    last(predicate: (model: T) => boolean): Promise<T>;
    async last(predicate?: any): Promise<T> {
        const args = [ this.expression ];
        if(predicate)
            args.push(ExpressionHelper.lambda(predicate));

        return await this.provider.executeQuery<T>(
            ExpressionHelper.call(
                null, 'last', args
            )
        );
    }

    max(): Promise<T>;
    max<E>(selector: (model: T) => E): Promise<E>;
    async max(selector?: any): Promise<T> {
        const args = [ this.expression ];
        if(selector)
            args.push(ExpressionHelper.lambda(selector));

        return await this.provider.executeQuery<T>(
            ExpressionHelper.call(
                null, 'max', args
            )
        );
    }

    min(): Promise<T>;
    min<E>(selector: (model: T) => E): Promise<E>;
    async min(selector?: any): Promise<T> {
        const args = [ this.expression ];
        if(selector)
            args.push(ExpressionHelper.lambda(selector));

        return await this.provider.executeQuery<T>(
            ExpressionHelper.call(
                null, 'min', args
            )
        );
    }

    orderBy<E>(selector: (model: T) => E): AsyncCollection<T> {
        if(!selector)
            throw new Error('Selector for [orderBy] cannot be null or empty');

        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'orderBy', [
                    this.expression,
                    ExpressionHelper.lambda(selector)
                ]
            )
        );
    }

    orderByDescending<E>(selector: (model: T) => E): AsyncCollection<T> {
        if(!selector)
            throw new Error('Selector for [orderByDescending] cannot be null or empty');

        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'orderByDescending', [
                    this.expression,
                    ExpressionHelper.lambda(selector)
                ]
            )
        );
    }

    select<E>(selector: (model: T) => E): AsyncCollection<E>;
    select(...properties: (keyof T)[]): AsyncCollection<T>; 
    select<E>(...selector: any[]): AsyncCollection<T | E> {
        if(!selector)
            throw new Error('Selector for [select] cannot be null or empty');

        const [first] = selector;
        const args = typeof first == 'string' ? ExpressionHelper.constant(selector) : ExpressionHelper.lambda(first);
        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'select', [
                    this.expression,
                    args
                ]
            )
        );
    }

    sum(): Promise<number>;
    sum(selector: (model: T) => number): Promise<number>;
    async sum(selector?: any): Promise<number> {
        const args = [ this.expression ];
        if(selector)
            args.push(ExpressionHelper.lambda(selector));

        return await this.provider.executeQuery<number>(
            ExpressionHelper.call(
                null, 'sum', args
            )
        );
    }

    skip(count: number): AsyncCollection<T> {
        if(count == undefined || count < 0)
            throw new Error('Count for [skip] must be not null, and greater or equals than 0');

        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'skip', [
                    this.expression,
                    ExpressionHelper.constant(count)
                ]
            )
        );
    }

    take(count: number): AsyncCollection<T> {
        if(count == undefined || count < 0)
            throw new Error('Count for [take] must be not null, and greater or equals than 0');

        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'take', [
                    this.expression,
                    ExpressionHelper.constant(count)
                ]
            )
        );
    }

    async toCollection(): Promise<Collection<T>> {
        return new BasicCollection(await this.toArray());
    }

    async toArray(): Promise<T[]> {
        return await this.createQueryResult().getItems();
    }

    where(predicate: (model: T) => boolean): AsyncCollection<T> {
        if(!predicate)
            throw new Error('Predicate for [where] cannot be null or empty');

        return this.provider.createQuery(
            ExpressionHelper.call(
                null, 'where', [
                    this.expression,
                    ExpressionHelper.lambda(predicate)
                ]
            )
        );
    }
    //#endregion

    // #region QueryableProvider member
    createQuery<E>(expr: Expression): AsyncCollection<E> {
        return new QueryCollection(expr);
    }
    
    async executeQuery<E = ResultDescriptor>(expr: Expression): Promise<E> {
        const result = await Query.from(expr).getResult();
        if(typeof result.items == 'number') {
            return <any> result.items;
        }
        else if(result.isScalar || result.isSingle) {
            if(result.items instanceof Array) {
                if(!result.items.length) {
                    return null;
                }
                else if(result.items.length == 1) {
                    result.items = result.items[0];
                }
            }

            return result.mapper? result.mapper.mapResult(result.items) : result.items;
        }
        else return <any> result;
    }
    // #endregion

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return this._result || (this._result = this.createQueryResult());
    }

    private createQueryResult(): QueryResult<T> {
        return new QueryResult<T>(this, this.expression);
    }

}