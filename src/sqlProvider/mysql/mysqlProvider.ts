import { ProvideFor } from "../provideFor";
import { SqlProvider } from "../sqlProvider";
import * as mysql from "mysql";
import { ConnectionConfig } from "../../connectionConfig";
import { MysqlBuilder } from "./mysqlBuilder";
import { QueryBuilder } from "../../sql/sqlBuilder";
import { SchemaProvider } from "../schemaProvider";
import { MysqlSchemaProvider } from "../mysql/mysqlSchemaProvider";
const toUnnamed = require('named-placeholders')();

@ProvideFor('mysql')
export class MysqlProvider implements SqlProvider {

    conn: mysql.Connection;

    createConnection(config: string | ConnectionConfig): void {
        this.conn = mysql.createConnection(
            typeof config == 'string'? config : {
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database,
                port: config.port
            }
        );
    }

    async executeCommand(sql: string, parameter: any): Promise<number> {
        return <number> await this.executeQuery(sql, parameter);
    }

    async executeQuery(sql: string, parameter: any) {
        if(!Array.isArray(parameter)) 
            [sql, parameter] = toUnnamed(sql, parameter);

        return new Promise((r, e) => {
            this.conn.query(sql, parameter, (err, res) => {
                if(err)
                    e(err);
                else
                    r(res.insertId || res.affectedRows || res);
            });
        });
    }

    async openConnection(): Promise<boolean> {
        if(!this.conn)
            return false;

        return new Promise<boolean>((r, e) => {
            this.conn.connect(err => {
                if(err)
                    e(err);
                else
                    r(true);
            })
        });
    }

    async closeConnection(): Promise<boolean> {
        if(!this.conn)
            return false;

        return new Promise<boolean>((r, e) => {
            this.conn.end(err => {
                if(err)
                    e(err);
                else
                    r(true);
            })
        });
    }

    getBuilder(): QueryBuilder {
        return new MysqlBuilder();
    }

    getSchemaProvider(connectionConfig: ConnectionConfig): SchemaProvider {
        return new MysqlSchemaProvider(this, connectionConfig);
    }

}