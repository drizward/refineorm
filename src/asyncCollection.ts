import { GroupOf } from "./groupOf";
import { QueryableProvider } from './queryableProvider';
import { Expression } from "estree";
import { Collection } from './collection';

/**
 * Collection that implements async/await function to all its member.
 */
export interface AsyncCollection<T> extends AsyncIterable<T> {

    provider: QueryableProvider;
    expression: Expression;

    /**
     * Get whether any element exists in this collection
     */
    any(): Promise<boolean>;
    
    /**
     * Get whether any element which fulfill the predicate exists within this collection
     * @param predicate then predicate for the condition to check
     */
    any(predicate: (model: T) => boolean): Promise<boolean>;

    /**
     * Get whether all element which fulfill the predicate exists within this collection
     * @param predicate then predicate for the condition to check
     */
    all(predicate: (model: T) => boolean): Promise<boolean>;
    
    /**
     * Get the average value of current data selections
     * Only valid for single column result
     */
    average(): Promise<number>;

    /**
     * Get the average value by the given selector
     * @param selector the selector to check
     */
    average(selector: (model: T) => number): Promise<number>;

    /**
     * Bind outside variable to be used in query
     * @param object parameter wrapped inside an object
     */
    bind(object: {}): AsyncCollection<T>;

    /**
     * Get the count or lenght of elements in this collection
     */
    count(): Promise<number>;

    /**
     * Get the count or length of elements which fulfill the predicate within this collection
     * @param predicate the predicate for the condition to check
     */
    count(predicate: (model: T) => boolean): Promise<number>;

    /**
     * Get elements which distinct in this collection
     */
    distinct(): AsyncCollection<T>;

    /**
     * Get element in the index of this collection
     * @param index the index of element
     */
    elementAt(index: number): Promise<T>;

    /**
     * Get the first element of this collection
     */
    first(): Promise<T>;
    
    /**
     * Get the first element which fulfill the predicate within this collection
     * @param predicate the predicate for the condition to check
     */
    first(predicate: (model: T) => boolean): Promise<T>;

    /**
     * Get the grouped collection of this collection by the given selector
     * @param selector the selector to determine the grouping
     */
    groupBy<E>(selector: (model: T) => E): AsyncCollection<E>;
    
    /**
     * Get the joined collection from an equivalent selector of this collection of type of {T} with other collection of type of E
     * @param cls2 the second list to be joined
     * @param a first selector from the type of T
     * @param b second selector from the type of E
     * @param construct the new structure of joined object as type of C
     */
    join<E, K, C>(cls2: AsyncCollection<E>, a: (model: T) => K, b: (model: E) => K, construct: (a: T, b: E) => C): AsyncCollection<C>;

    /**
     * Get the joined collection by the given predicate by this collection of type of {T} with other collection of type of {E}
     * @param cls2 the second list to be joined
     * @param predicate the predicate for the condition to be fulfilled
     * @param construct the new structure of joined object as type of C
     */
    join<E, C>(cls2: AsyncCollection<E>, predicate: (a: T, b: E) => boolean, construct: (a: T, b: E) => C) : AsyncCollection<C>;
    
    /**
     * Get the last element of this collection
     */
    last(): Promise<T>;

    /**
     * Get the last element that fulfill the given predicate from this collection
     * @param predicate the predicate for the condition to check
     */
    last(predicate: (model: T) => boolean): Promise<T>;

    /**
     * Get the max value of current data selection
     * Only valid for single column result
     */
    max(): Promise<T>;

    /**
     * Get the max value by the given selection within this collection
     * @param selector the selector to determine the maximum value
     */
    max<E>(selector: (model: T) => E): Promise<E>;
    
    /**
     * Get the min value of current data selection
     * Only valid for single column result
     */
    min(): Promise<T>;
    
    /**
     * Get the min value by the given selection within this collection
     * @param selector the selector to determine the min value
     */
    min<E>(selector: (model: T) => E): Promise<E>;

    /**
     * Get the ordered or sorted collection by the given selector
     * @param selector the selector to determine the order or sort
     */
    orderBy<E>(selector: (model: T) => E): AsyncCollection<T>

    /**
     * Get the descending ordered or sorted collection by the given selector
     * @param selector the selector to determine the order or sort
     */
    orderByDescending<E>(selector: (model: T) => E): AsyncCollection<T>

    /**
     * Map selected columns of current collection
     * @param selector the selector of mapped construct
     */
    select<E>(selector: (model: T) => E): AsyncCollection<E>;

    /**
     * Map selected columns of current collection
     * @param selector the selector of mapped construct
     */
    select(...properties: (keyof T)[]): AsyncCollection<T>;

    /**
     * Get the collection with skipped data from this collection by the count
     * @param count the number of count to be skipped
     */
    skip(count: number): AsyncCollection<T>;

    /**
     * Get the total sum value of current data selection
     * Only valid for single column result
     */
    sum(): Promise<number>;

    /**
     * Get the total sum value by the given selection within this collection
     * @param selector the selector to determine the maximum value
     */
    sum(selector: (model: T) => number): Promise<number>;    

    /**
     * Get the collection which taken by the limit of the given count
     * @param count the number of count to be taken
     */
    take(count: number): AsyncCollection<T>;

    /**
     * Execute and transform current query into a detached collection
     */
    toCollection(): Promise<Collection<T>>;

    /**
     * Execute and transform current query into an array
     */
    toArray(): Promise<T[]>;

    /**
     * Get the filtered collection from this collection by the given predicate
     * @param predicate the predicate of the condition to be checked
     */
    where(predicate: (model: T) => boolean): AsyncCollection<T>;

}