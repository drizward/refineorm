
import { Table } from '../../../src/mapper/@table';
import { Column } from '../../../src/mapper/@column';
import { Key } from '../../../src/mapper/@key';

@Table('user')
export class User {

    @Column() @Key()
    name: string;

    @Column()
    profession: string;

    @Column()
    age: number;

    @Column()
    nationality: string;

    constructor(props?: Partial<User>) {
        Object.assign(this, props);
    }

}