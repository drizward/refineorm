import { Collection } from "../collection";
import { GroupOf } from "../groupOf";

export class BasicCollection<T> implements Collection<T> {
    private _arr: T[];

    constructor(arr?: T[]) {
        this._arr = arr || [];
    }

    any(): boolean;
    any(predicate: (model: T) => boolean): boolean;

    any(predicate?: any): boolean {
        if(!predicate)
            return !!this._arr.length;
        
        return this.first(predicate) != undefined;
    }

    average(selector: (model: T) => number): number {
        const mapped = this._arr.map(selector);
        if(mapped.length == 0)
            throw new Error("Elements that matched the selector not found");

        return mapped.reduce((p, c) => p + c) / mapped.length;
    }

    count(): number;
    count(predicate: (model: T) => boolean): number;

    count(predicate?: any): number {
        if(!predicate)
            return this._arr.length;
        
        else this._arr.map(predicate).length;
    }

    distinct(): Collection<T> {
        if(this._arr.length)
            return null;
            
        return new BasicCollection([...new Set(this._arr)]);
    }

    elementAt(index: number): T {
        return this._arr[index];
    }

    first(): T;
    first(predicate: (model: T) => boolean): T;

    first(predicate?: any): T {
        if(!this._arr.length)
            throw new Error("Collection is empty");

        if(!predicate)
            return this._arr[0];
        
        return this._arr.find(predicate);
    }

    groupBy<E>(selector: (model: T) => E): Collection<GroupOf<E, T>> {
        throw new Error("Method not implemented.");
    }

    join<E, K, C>(cls2: Collection<E>, a: (model: T) => K, b: (model: E) => K, construct: (a: T, b: E) => C): Collection<C>;
    join<E, C>(cls2: Collection<E>, predicate: (a: T, b: E) => boolean, construct: (a: T, b: E) => C): Collection<C>;

    join<E, C>(cls2: Collection<E>, a: any, b: any, construct?: any): Collection<C> {
        throw new Error("Method not implemented.");
    }

    last(): T;
    last(predicate: (model: T) => boolean): T;

    last(predicate?: any): T {
        throw new Error("Method not implemented.");
    }

    max(): T;
    max<E>(selector: (model: T) => E): E;

    max(selector?: any): T {
        throw new Error("Method not implemented.");
    }

    min(): T;
    min<E>(selector: (model: T) => E): E;

    min(selector?: any): T {
        throw new Error("Method not implemented.");
    }

    orderBy<E>(selector: (model: T) => E): Collection<T> {
        throw new Error("Method not implemented.");
    }

    orderByDescending<E>(selector: (model: T) => E): Collection<T> {
        throw new Error("Method not implemented.");
    }

    skip(count: number): Collection<T> {
        throw new Error("Method not implemented.");
    }

    take(count: number): Collection<T> {
        throw new Error("Method not implemented.");
    }

    where(predicate: (model: T) => boolean): Collection<T> {
        throw new Error("Method not implemented.");
    }

    bind(vars: {}): Collection<T> {
        return;
    }

    [Symbol.iterator](): Iterator<T> {
        return this._arr[Symbol.iterator]();
    }

    next(value?: any): IteratorResult<T> {
        return this._arr[Symbol.iterator]().next(value);
    }

    return?(value?: any): IteratorResult<T> {
        return this._arr[Symbol.iterator]().return(value);
    }

    throw?(e?: any): IteratorResult<T> {
        return this._arr[Symbol.iterator]().throw(e);
    }


}