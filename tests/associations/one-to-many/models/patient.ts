import { Table } from "../../../../src/mapper/@table";
import { Key } from "../../../../src/mapper/@key";
import { Column } from '../../../../src/mapper/@column';
import { Counter } from './counter';
import { HasOne } from "../../../../src/mapper/@hasOne";

@Table('patients')
export class Patient {

    @Key()
    id: number;

    @Column()
    name: string;

    @Column()
    diagnose: string;

    @Column()
    isServed: boolean;

    @HasOne(of => Counter)
    counter: Counter;

    constructor(init?: Partial<Patient>) {
        Object.assign(this, init);
    }

}