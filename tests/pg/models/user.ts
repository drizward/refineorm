
import { Table } from '../../../src/mapper/@table';
import { Column } from '../../../src/mapper/@column';
import { Key } from '../../../src/mapper/@key';
import { DefaultValue } from '../../../src/mapper/@defaultValue';
import { NotNull } from '../../../src/mapper/@notNull';

@Table('user')
export class User {

    @Key(true)
    id: number;

    @Column()
    name: string;

    @Column()
    job: string;

    @Column() 
    @DefaultValue(18)
    age: number;

    @Column()
    maritalStatus: boolean;

    @Column()
    address: string;

    constructor(props?: Partial<User>) {
        Object.assign(this, props);
    }

}