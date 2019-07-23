import { DataContext } from '../../../src/dataContext';
import { ConnectionConfig } from '../../../src/connectionConfig';
import { MysqlProvider } from '../../../src/sqlProvider/mysql/mysqlProvider';
import { DataSet } from '../../../src/dataSet';
import { Subject } from './models/subject';
import { Student } from './models/student';

export class MysqlContext extends DataContext {

    static readonly config: ConnectionConfig = {
        database: 'skripsi',
        host: 'localhost',
        password: 'root',
        port: 8889,
        type: 'mysql',
        user: 'root'
    };

    readonly patients: DataSet<Subject> = this.fromSet(Subject);
    readonly counters: DataSet<Student> = this.fromSet(Student);

    constructor() {
        super(MysqlContext.config, new MysqlProvider());
    }

}
