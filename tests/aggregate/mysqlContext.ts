import { DataContext } from '../../src/dataContext';
import { ConnectionConfig } from '../../src/connectionConfig';
import { MysqlProvider } from '../../src/sqlProvider/mysql/mysqlProvider';
import { DataSet } from '../../src/dataSet';
import { User } from './models/user';

export class MysqlContext extends DataContext {

    static readonly config: ConnectionConfig = {
        database: 'skripsi',
        host: 'localhost',
        password: 'root',
        port: 8889,
        type: 'mysql',
        user: 'root'
    };

    readonly users: DataSet<User> = this.fromSet(User);

    constructor() {
        super(MysqlContext.config, new MysqlProvider());
    }

}
