import { StandardSchemaProvider } from '../../sql/standardSchemaProvider'

export class MysqlSchemaProvider extends StandardSchemaProvider {

    async dropSchema(): Promise<void> {
        const sql = this.sqlProvider;
        const cmds: { cmd: string }[] = await sql.executeQuery(`
            SELECT concat('DROP TABLE IF EXISTS ', table_name, ';') as cmd
            FROM information_schema.tables
            WHERE table_schema = ?;
        `, [ this.connectionConfig.database ]);

        if(cmds.length) {
            await sql.executeCommand('SET FOREIGN_KEY_CHECKS = ?', [ 0 ]);

            for(let cmd of cmds.map(x => x.cmd))
                await sql.executeCommand(cmd);

            await sql.executeCommand('SET FOREIGN_KEY_CHECKS = ?', [ 1 ]);
        }
    }

}