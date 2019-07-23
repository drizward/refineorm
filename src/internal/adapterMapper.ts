import 'reflect-metadata';
import { ClassType } from './internal';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { QueryContext } from '../queryWorker/queryContext/queryContext';

export type AdapterMap = {
    classType: ClassType<any>,
    isStatic: boolean;
    functions: { [name: string]: AdapterFunction };
}

export type AdapterFunction = {
    name: string;
    pattern: string;
    returnType: ClassType<any>;
    expression: SqlExpression;
}

export class AdapterMapper {

    private adapters: AdapterMap[];


    private readonly adapterTemplate = (tpl: string, args: any[]) => tpl.replace(/\${(\w+)}/g, (_, v) => args[v]);
    private readonly adapterClassKey: 'refine:adapter-class';

    createAdapterFor(adapterClass: ClassType<any>, adaptedClass: ClassType<any>) {
        Reflect.defineMetadata(this.adapterClassKey, adapterClass, adaptedClass);
    }

    createQueryAdapter(classType: ClassType<any>, methodName: string, pattern: string, returnType: ClassType<any>) {
        let adapterType = this.adapters.find(x => x.classType == classType);
        if(!adapterType) {
            adapterType = {
                classType, 
                isStatic: false,
                functions: {}
            }

            this.adapters.push(adapterType);
        }

        adapterType.functions[methodName] = {
            expression: null,
            name: methodName,
            pattern, returnType
        };
    }

    findMethod(name: string, classType: ClassType<any>) {
        const type = this.adapters.find(x => x.classType == classType);
        if(!type)
            throw new Error(`Adapter for type ${classType.name} not found`);

        return type.functions[name];
    }

    toSqlString(adapter: AdapterFunction, ...args: QueryContext[]) {
        return this.adapterTemplate(adapter.pattern, args);
    }

}