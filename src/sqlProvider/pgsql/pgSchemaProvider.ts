import { StandardSchemaProvider } from '../../sql/standardSchemaProvider'

export class PgSchemaProvider extends StandardSchemaProvider {

    async dropSchema(): Promise<void> {
        const sql = this.sqlProvider;
        
        await sql.executeCommand(`DROP SCHEMA public CASCADE`);
        await sql.executeCommand('CREATE SCHEMA public');

        await sql.executeCommand('GRANT ALL ON SCHEMA public TO postgres');
        await sql.executeCommand('GRANT ALL ON SCHEMA public TO public');
    }

}