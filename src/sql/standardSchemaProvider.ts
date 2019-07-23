
import { SchemaProvider } from '../sqlProvider/schemaProvider'
import { SqlProvider } from '../sqlProvider/sqlProvider';
import { ConnectionConfig } from '../connectionConfig';
export abstract class StandardSchemaProvider implements SchemaProvider {
    
    constructor(public sqlProvider: SqlProvider, public connectionConfig: ConnectionConfig) {
        
    }
    
    abstract dropSchema(): Promise<void>;

}