import { MysqlContext } from "./mysqlContext";
import { expect } from 'chai';

describe('Many-to-many relationship', () => {

    it('can build tables', async () => {
        const context = new MysqlContext();
        const sql = 'SELECT table_name FROM information_schema.tables WHERE TABLE_SCHEMA = :schema';
        const tables: any[] = await context.sendRawQuery(sql, { schema: 'skripsi' });

        await context.release();
        expect(tables.length).to.equal(3);

    });
});