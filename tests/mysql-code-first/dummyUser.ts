import { Column } from "../../src/mapper/@column";
import { Key } from "../../src/mapper/@key";
import { Table } from "../../src/mapper/@table"

@Table('user')
export class DummyUser {

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

    constructor(props?: Partial<DummyUser>) {
        Object.assign(this, props);
    }

}