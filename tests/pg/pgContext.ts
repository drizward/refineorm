import { DataContext } from '../../src/dataContext';
import { ConnectionConfig } from '../../src/connectionConfig';
import { DataSet } from '../../src/dataSet';
import { User } from './models/user';
import { PgProvider } from '../../src/sqlProvider/pgsql/pgProvider';

export class PgContext extends DataContext {

    static readonly config: ConnectionConfig = {
        database: 'skrpsi',
        host: 'localhost',
        password: 'master',
        port: 5432,
        type: 'pgsql',
        user: 'postgres'
    };

    readonly users: DataSet<User> = this.fromSet(User);

    constructor() {
        super(PgContext.config, new PgProvider());
    }

}
