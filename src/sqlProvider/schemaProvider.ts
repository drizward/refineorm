import { SqlProvider } from './sqlProvider'
import { DataContext } from '../dataContext';
import { ConnectionConfig } from '../connectionConfig';

export interface SchemaProvider {

    sqlProvider: SqlProvider;
    connectionConfig: ConnectionConfig;

    dropSchema(): Promise<void>;

}