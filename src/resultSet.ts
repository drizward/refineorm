import { QueryCollection } from './core/queryCollection';
import { AsyncCollection } from './asyncCollection';

export class ResultSet<T> extends QueryCollection<T> {

    constructor(base: AsyncCollection<T>) {
        super(base.expression);
    }

}