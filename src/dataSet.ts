import { Collection } from "./collection";
import { AsyncCollection } from './asyncCollection';
import { DataContext } from './dataContext';

export interface DataSet<T> extends AsyncCollection<T> {
    
    type: new(args?: any[]) => T;
    context: DataContext

    insert(model: T): Promise<number>;
    update(model: T): Promise<number>;
    delete(model: T): Promise<number>;

}