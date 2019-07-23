import { Table } from '../../../../src/mapper/@table'
import { Column } from '../../../../src/mapper/@column'
import { Student } from './student';
import { HasMany } from '../../../../src/mapper/@hasMany';
import { Key } from '../../../../src/mapper/@key';

@Table()
export class Subject {

    @Key() @Column({ maxLength: 24 })
    code: string;

    @Column()
    name: string;

    @Column()
    room: string;

    @Column()
    maxStudents: number;

    @Column()
    professor: string;
    
    @HasMany(of => Student)
    students: Student[]

}