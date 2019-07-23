import { DataContext } from '../../../src/dataContext';
import { ConnectionConfig } from '../../../src/connectionConfig';
import { MysqlProvider } from '../../../src/sqlProvider/mysql/mysqlProvider';
import { DataSet } from '../../../src/dataSet';
import { Patient } from './models/patient';
import { Counter } from './models/counter';

export class MysqlContext extends DataContext {

    static readonly config: ConnectionConfig = {
        database: 'skripsi',
        host: 'localhost',
        password: 'root',
        port: 8889,
        type: 'mysql',
        user: 'root'
    };

    readonly patients: DataSet<Patient> = this.fromSet(Patient);
    readonly counters: DataSet<Counter> = this.fromSet(Counter);

    constructor() {
        super(MysqlContext.config, new MysqlProvider());
    }

}
