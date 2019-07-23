import { GroupOf } from "./groupOf";

export interface Collection<T> extends Iterable<T>, Iterator<T> {

    /**
     * Get whether any element exists in this collection
     */
    any(): boolean;
    
    /**
     * Get whether any element which fulfill the predicate exists within this collection
     * @param predicate the predicate or condition to be checked
     */
    any(predicate: (model: T) => boolean): boolean;
    
    /**
     * Get the average value by the given selector
     * @param selector the selector to check
     */
    average(selector: (model: T) => number): number;

    /**
     * Get the count or lenght of elements in this collection
     */
    count(): number;

    /**
     * Get the count or length of elements which fulfill the predicate within this collection
     * @param predicate the predicate for the condition to check
     */
    count(predicate: (model: T) => boolean): number;

    /**
     * Get elements which distinct in this collection
     */
    distinct(): Collection<T>;

    /**
     * Get element in the index of this collection
     * @param index the index of element
     */
    elementAt(index: number): T;

    /**
     * Get the first element of this collection
     */
    first(): T;
    
    /**
     * Get the first element which fulfill the predicate within this collection
     * @param predicate the predicate for the condition to check
     */
    first(predicate: (model: T) => boolean): T;


    /**
     * Get the grouped collection of this collection by the given selector
     * @param selector the selector to determine the grouping
     */
    groupBy<E>(selector: (model: T) => E): Collection<GroupOf<E, T>>;
    
    /**
     * Get the joined collection from an equivalent selector of this collection of type of {T} with other collection of type of E
     * @param cls2 the second list to be joined
     * @param a first selector from the type of T
     * @param b second selector from the type of E
     * @param construct the new structure of joined object as type of C
     */
    join<E, K, C>(cls2: Collection<E>, a: (model: T) => K, b: (model: E) => K, construct: (a: T, b: E) => C): Collection<C>;

    /**
     * Get the joined collection by the given predicate by this collection of type of {T} with other collection of type of {E}
     * @param cls2 the second list to be joined
     * @param predicate the predicate for the condition to be fulfilled
     * @param construct the new structure of joined object as type of C
     */
    join<E, C>(cls2: Collection<E>, predicate: (a: T, b: E) => boolean, construct: (a: T, b: E) => C) : Collection<C>;
    
    /**
     * Get the last element of this collection
     */
    last(): T;

    /**
     * Get the last element that fulfill the given predicate from this collection
     * @param predicate the predicate for the condition to check
     */
    last(predicate: (model: T) => boolean): T;

    /**
     * Get the max value of this collection
     */
    max(): T;

    /**
     * Get the max value by the given selection within this collection
     * @param selector the selector to determine the maximum value
     */
    max<E>(selector: (model: T) => E): E;
    
    /**
     * Get the min value of this collection
     */
    min(): T;
    
    /**
     * Get the min value by the given selection within this collection
     * @param selector the selector to determine the min value
     */
    min<E>(selector: (model: T) => E): E;

    /**
     * Get the ordered or sorted collection by the given selector
     * @param selector the selector to determine the order or sort
     */
    orderBy<E>(selector: (model: T) => E): Collection<T>

    /**
     * Get the descending ordered or sorted collection by the given selector
     * @param selector the selector to determine the order or sort
     */
    orderByDescending<E>(selector: (model: T) => E): Collection<T>

    /**
     * Get the collection with skipped data from this collection by the count
     * @param count the number of count to be skipped
     */
    skip(count: number): Collection<T>;

    /**
     * Get the collection which taken by the limit of the given count
     * @param count the number of count to be taken
     */
    take(count: number): Collection<T>;

    /**
     * Get the filtered collection from this collection by the given predicate
     * @param predicate the predicate of the condition to be checked
     */
    where(predicate: (model: T) => boolean): Collection<T>;

    /**
     * Bind outside parameter to current context of this collection
     * @param param the variable to be bound
     */
    bind(vars: {}): Collection<T>;

}