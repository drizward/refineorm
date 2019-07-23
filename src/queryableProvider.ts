import { AsyncCollection } from './asyncCollection';
import { Expression } from 'estree';
import { ResultDescriptor } from './core/resultDescriptor';

export interface QueryableProvider {

    createQuery<T>(expr: Expression): AsyncCollection<T>;
    executeQuery<T>(expr: Expression): Promise<T>;

}