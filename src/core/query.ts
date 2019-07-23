import { Expression } from "estree";
import { QueryDescriptor } from '../internal/queryDescriptor';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { ResultDescriptor } from './resultDescriptor';
import { QueryComposer } from "../queryWorker/queryComposer";

export class Query {

    // FAILED EXPERIMENT, DONT SET TO TRUE
    // NEED CHANGES IN CURRENT PARAMETER HANDLING
    private static supportCache = false;

    get expression(): SqlExpression {
        return this.descriptor.sqlExpression;
    }

    private constructor(private descriptor: QueryDescriptor) {

    }

    async getResult() : Promise<ResultDescriptor> {
        const sqlText = this.getSqlText();
        
        //if(this.expression.type == "SelectExpression")
        //    console.log(this.expression);
        //    
        //console.log(sqlText);
        const result = await this.descriptor.runner(sqlText, this.descriptor.parameters);

        return {
            isScalar: this.descriptor.isScalar,
            isSingle: this.descriptor.isSingle,
            items: result,
            mapper: this.descriptor.mapper
        };
    }

    getSqlText() {
        return this.descriptor.provider.getBuilder().buildQuery(this.expression);
    }

    static from(expression: Expression): Query {
        const composer = new QueryComposer();

        let cache: Query, hash: string;
        if(Query.supportCache) {
            hash = composer.hashExpression(expression);
            cache = composer.findQuery(hash);
        }

        if(cache)
            return cache;

        const sequence = composer.compose(expression);
        if(!sequence.dataContext)
            throw new ReferenceError("Context not found in any of the expression");

        if(!sequence.statement)
            sequence.finalizeQuery(composer, false);

        const query = new Query(composer.getDescriptor(sequence));
        if(Query.supportCache)
            composer.cacheQuery(expression, hash, query, sequence);
            
        return query;
    }

}