import 'reflect-metadata';
import { DescriptorMapper } from "./descriptorMapper";
import { SqlProvider } from "../sqlProvider/sqlProvider";
import { StandardTypeMapper } from "../sql/standardTypeMapper";
import { AdapterMapper } from './adapterMapper'

export type ClassType<T> = 
    new () => T;

export const internal = {
    adapterMapper: new AdapterMapper(),
    mapper: new DescriptorMapper(),
    typeMapper: new StandardTypeMapper(),
    providers: {},
    test: {},

    getProvider(providerName: string) {
        const constr: new() => SqlProvider = internal.providers[providerName];
        if(!constr) 
            throw new Error(`Provider defined for ${providerName} cannot be used to provide sql connection`);

        return new constr();
    }
}