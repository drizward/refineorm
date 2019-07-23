import { QueryBuilder } from "../sql/sqlBuilder";
import { SchemaProvider } from "./schemaProvider";
import { ConnectionConfig } from "../connectionConfig";

export interface SqlProvider {

    createConnection(config: string | any): void;
    executeCommand(sql: string, parameter?: any): Promise<number>;
    executeQuery(sql: string, parameter?: any): Promise<any>;
    openConnection(): Promise<boolean>;
    closeConnection(): Promise<boolean>;
    getBuilder(): QueryBuilder;
    getSchemaProvider(connectionConfig: ConnectionConfig): SchemaProvider;
    
}