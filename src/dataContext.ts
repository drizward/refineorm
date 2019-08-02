import 'reflect-metadata';
import { DataSet } from "./dataSet";
import { DataSetImpl } from "./core/dataSetImpl";
import { ConnectionConfig } from './connectionConfig';
import { SqlProvider } from "./sqlProvider/sqlProvider";
import { MigrationStrategy } from "./migrationStrategy";
import { internal, ClassType } from './internal/internal';
import { ExpressionHelper } from './core/expressionHelper';
import { AssociationType } from './meta/associationType';
import { AssociationDescriptor } from './meta/associationDescriptor';

const initMetaKey = 'refine:contextinit';

export abstract class DataContext {
    
    private isOpen: boolean = false;
    public provider: SqlProvider;
    
    get migrationStrategy(): MigrationStrategy {
        return MigrationStrategy.RecreateOnEmpty;
    }

    constructor(protected config: ConnectionConfig, provider?: SqlProvider) {
        this.provider = provider || internal.getProvider(config.type);
    }

    async sendRawCommand(sql: string, params?: any) {
        if(!this.isOpen) {
            this.provider.createConnection(this.config);
            await this.provider.openConnection();

            this.isOpen = true;

            await this.guardInitialization();
        }
        return await this.provider.executeCommand(sql, params);
    }

    async sendRawQuery(sql: string, params?: any) {
        if(!this.isOpen) {
            this.provider.createConnection(this.config);
            await this.provider.openConnection();

            this.isOpen = true;

            await this.guardInitialization();
        }
        return await this.provider.executeQuery(sql, params);
    }

    async release() {
        await this.provider.closeConnection();
    }
    
    protected fromSet<T>(modelType: ClassType<T>): DataSet<T> {
        //if(!internal.mapper.isTableType(modelType))
        //    throw new Error(`Type ${modelType.name} is not valid for a DataSet`);
            
        return new DataSetImpl(modelType, this);
    }

    private async guardInitialization(): Promise<void> {
        const proto = this.constructor.prototype;
        const isInit = Reflect.getMetadata(initMetaKey, proto);

        if(isInit)
            return;

        if(this.migrationStrategy != MigrationStrategy.Never)
            await this.beginMigration();
            
        const done: { [name: string]: boolean } = {};
        const createTable = async <T> (type: ClassType<T>) => {
            if(done[type.name])
                return;

            const td = internal.mapper.mapOf(type);

            if(!td.isValidated)
                internal.mapper.validate(td);

            const assocs = Object.keys(td.columns)
                                 .map(x => td.columns[x])
                                 .filter(x => internal.mapper.isTableType(x.classType));
            
            const many: AssociationDescriptor[] = [];
            if(assocs.length) {
                for(const a of assocs) {
                    const atd = internal.mapper.mapOf(a.classType);
                    if(atd.isValidated)
                        continue;

                    internal.mapper.validate(atd);
                }

                for(const a of td.associations) {
                    if(a.ref.type != td) {
                        const refType = a.ref.type.type.constructor;
                        
                        if(!done[refType.name])
                            await createTable(a.ref.type.type.constructor);

                        if(a.type == AssociationType.ManyToMany)
                            many.push(a);
                    }
                }
            }            
            
            if(this.migrationStrategy != MigrationStrategy.Never)
                await provider.executeQuery(this.createTableExpr(type));

            done[type.name] = true;
            for(const m of many) {
                await provider.executeQuery(this.createTableExpr(type, m.ref.type.type.constructor));
            }
        };

        const datasets: DataSet<any>[] = Object.keys(this)
                                               .map(x => this[x])
                                               .filter(x => x && x instanceof DataSetImpl);

        if(!datasets.length)
            throw new Error(`DataContext need atleast one DataSet but none found!`);

        const provider = datasets[0].provider;                                              
        for(const ds of datasets)
            await createTable(ds.type);

        Reflect.defineMetadata(initMetaKey, true, proto);
    }
    
    private createTableExpr<T>(type: new() => T, manyType?: new () => T) {
        const args = [
            ExpressionHelper.constant(this),
            ExpressionHelper.constant(type)
        ];

        if(manyType)
            args.push(ExpressionHelper.constant(manyType));

        return ExpressionHelper.call(null, '__createTable', args);
    }

    private async beginMigration() {
        const migration = this.migrationStrategy;

        const schemaProvider = this.provider.getSchemaProvider(this.config);
        switch(migration) {
            case MigrationStrategy.RecreateOnEmpty:
                await schemaProvider.dropSchema();
                return;
        }
    }

}