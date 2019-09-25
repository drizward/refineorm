import { ProvideFor } from "../provideFor";
import { SqlProvider } from "../sqlProvider";
import { ConnectionConfig } from "../../connectionConfig";
import { QueryBuilder } from "../../sql/sqlBuilder";
import { Client } from 'pg';
import { PgBuilder } from "./pgBuilder";
import { SchemaProvider } from "../schemaProvider";
import { PgSchemaProvider } from "./pgSchemaProvider";
import { ParameterFormatter } from "../../core/parameterFormatter";
const named = require('node-postgres-named');

@ProvideFor('pgsql')
export class PgProvider implements SqlProvider {

    client: Client;
    readonly formatter = new ParameterFormatter("$", (k, i, t) => `\$${i+1}`);

    createConnection(config: ConnectionConfig): void {
        this.client = new Client({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port
        });
    }

    async executeCommand(sql: string, parameter: any): Promise<number> {
        if(parameter && !Array.isArray(parameter)) 
            ({ sql, parameter } = this.formatter.format(sql, parameter));

        console.log(sql);
        const res = await this.client.query(sql, parameter);
        //console.log(res);
        return res.rowCount;
    }

    async executeQuery(sql: string, parameter: any) {
        if(parameter && !Array.isArray(parameter)) 
            ({ sql, parameter } = this.formatter.format(sql, parameter));
            
        const res = await this.client.query(sql, parameter);
        //console.log(res);
        return res.rows;
    }

    async openConnection(): Promise<boolean> {
        if(!this.client)
            return false;

        return new Promise<boolean>((r, e) => {
            this.client.connect(((err => {
                if(err)
                    e(err);
                else
                    r(true);
            })))
        });
    }

    async closeConnection(): Promise<boolean> {
        if(!this.client)
            return false;

        return new Promise<boolean>((r, e) => {
            this.client.end(err => {
                if(err)
                    e(err);
                else
                    r(true);
            })
        });
    }

    getBuilder(): QueryBuilder {
        return new PgBuilder();
    }

    getSchemaProvider(connectionConfig: ConnectionConfig): SchemaProvider {
        return new PgSchemaProvider(this, connectionConfig);
    }

}