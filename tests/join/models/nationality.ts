import { Table } from '../../../src/mapper/@table';
import { Column } from '../../../src/mapper/@column';
import { Key } from '../../../src/mapper/@key';

@Table('nationality')
export class Nationality {

    @Key()
    code: string;

    @Column()
    name: string;

    @Column()
    capital: string;

    constructor(props?: Partial<Nationality>) {
        Object.assign(this, props);
    }

}