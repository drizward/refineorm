import { DataContext } from "../../src/dataContext";
import { ConnectionConfig } from "../../src/connectionConfig";
import { DataSet } from "../../src/dataSet";
import { DummyUser } from "./dummyUser";
import { MysqlProvider } from "../../src/sqlProvider/mysql/mysqlProvider";

export class MysqlContext extends DataContext {

    static readonly config: ConnectionConfig = {
        database: 'skrpsi',
        host: 'localhost',
        password: '',
        port: 3306,
        type: 'mysql',
        user: 'root'
    };

    readonly users: DataSet<DummyUser> = this.fromSet(DummyUser);

    constructor() {
        super(MysqlContext.config, new MysqlProvider());
    }

}
