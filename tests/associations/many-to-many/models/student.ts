import { Table } from "../../../../src/mapper/@table";
import { Key } from "../../../../src/mapper/@key";
import { Column } from "../../../../src/mapper/@column";
import { Subject } from "./subject";
import { HasMany } from "../../../../src/mapper/@hasMany";

@Table()
export class Student {

    @Key() @Column({ maxLength: 24 })
    idNumber: string;

    @Column()
    name: string;

    @Column()
    gpa: number;

    @Column()
    address: string;

    @HasMany(of => Subject)
    subjects: Subject[];

}