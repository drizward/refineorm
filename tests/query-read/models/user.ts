
import { Table } from '../../../src/mapper/@table';
import { Column } from '../../../src/mapper/@column';
import { Key } from '../../../src/mapper/@key';

@Table('user')
export class User {

    @Column() @Key()
    name: string;

    @Column()
    job: string;

    @Column()
    age: number;

    @Column()
    maritalStatus: boolean;

    @Column()
    address: string;

    constructor(props?: Partial<User>) {
        Object.assign(this, props);
    }

}