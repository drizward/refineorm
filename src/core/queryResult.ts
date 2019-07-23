import { QueryableProvider } from '../queryableProvider';
import { Expression } from 'estree';
import { ResultDescriptor } from './resultDescriptor';
import { ObjectMapper } from './objectMapper';

export class QueryResult<T> implements AsyncIterator<T> {

    mapper: ObjectMapper;
    isReleased: boolean;
    isExecuted: boolean;

    private raw: any[];
    private items: T[];
    private current: number = 0;
    private mappedCount: number = 0;

    constructor(private provider: QueryableProvider, private expression: Expression) {
        
    }

    get isAllIterated() {
        return this.current > this.raw.length;
    }

    get isAllMapped() {
        return this.mappedCount == this.raw.length;
    }

    async getItems(): Promise<T[]> {
        if(!this.isExecuted)
            await this.getResult();

        if(!this.isAllMapped) {
            let index = this.raw.length - (this.raw.length - this.mappedCount);
            
            do {
                await this.getAt(index++);
            }
            while(!this.isAllMapped);
        }

        return this.items;
    }

    async next(): Promise<IteratorResult<T>> {
        if(!this.isExecuted || this.isAllIterated)
            this.current = 0;

        if(this.isExecuted && this.isReleased && this.current >= this.items.length)
            throw new Error("All unmapped result had been released");

        return { value: await this.getAt(this.current++), done: this.isAllIterated };
    }

    async getAt(index: number): Promise<T> {
        if(!this.isExecuted)
            await this.getResult();

        let item: T;
        let i = this.mappedCount;

        while(this.items.length <= index && !this.isAllMapped) {
            item = this.mapper.extract(this.raw[i++]);

            while(this.raw[i] && this.mapper.canExtend(this.raw[i], item))
                this.mapper.extract(this.raw[i++], item);

            this.items.push(item);
        }

        this.mappedCount = i;
        return item || this.items[index];
    }

    async return(value?: any): Promise<IteratorResult<T>> {
        this.release();
        return { done: true, value };
    }

    release() {
        this.items = null;
        delete this.raw;
        this.isReleased = true;
    }

    private async getResult() {
        const rd = await this.provider.executeQuery<ResultDescriptor>(this.expression);

        //console.log(rd);
        
        this.mapper = rd.mapper;
        this.raw = rd.items;
        this.items = [];
        this.isExecuted = true;
    }

}