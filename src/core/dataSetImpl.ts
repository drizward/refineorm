import { DataSet } from "../dataSet";
import { DataContext } from "../dataContext";
import { QueryCollection } from './queryCollection';
import { ExpressionHelper } from './expressionHelper';

export class DataSetImpl<T> extends QueryCollection<T> implements DataSet<T> {

    constructor(public type: new() => T, public context: DataContext) {
        super(null);
    }

    async insert(model: T): Promise<number> {
        return await this.provider.executeQuery<number>(
            ExpressionHelper.call(
                null, 'insert', [ 
                    this.expression,
                    ExpressionHelper.constant(model)
                ]
            )
        );
    }    
    
    async update(model: T): Promise<number> {
        return await this.provider.executeQuery<number>(
            ExpressionHelper.call(
                null, 'update', [ 
                    this.expression,
                    ExpressionHelper.constant(model)
                ]
            )
        );
    }
    
    async delete(model: T): Promise<number> {
        return await this.provider.executeQuery<number>(
            ExpressionHelper.call(
                null, 'delete', [ 
                    this.expression,
                    ExpressionHelper.constant(model)
                ]
            )
        );
    }
}