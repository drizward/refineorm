import { Table } from "../../../../src/mapper/@table";
import { Key } from "../../../../src/mapper/@key";
import { Column } from "../../../../src/mapper/@column";
import { Patient } from './patient';
import { HasMany } from "../../../../src/mapper/@hasMany";

@Table('counter')
export class Counter {

    @Key()
    id: number;
    
    @Column()
    name: string;

    @Column()
    doctor: string;

    @Column()
    roomNumber: string;

    @HasMany(of => Patient)
    patients: Patient[];

    constructor(init?: Partial<Counter>) {
        Object.assign(this, init);
    }

}