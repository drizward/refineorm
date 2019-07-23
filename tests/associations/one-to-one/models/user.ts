
import { Table } from '../../../../src/mapper/@table';
import { Column } from '../../../../src/mapper/@column';
import { Key } from '../../../../src/mapper/@key';
import { UserProfile } from './userProfile';
import { HasOne } from '../../../../src/mapper/@hasOne';

@Table('user')
export class User {

    @Key()
    name: string;

    @Column()
    job: string;

    @Column()
    age: number;

    @Column()
    maritalStatus: boolean;

    @Column()
    address: string;

    @HasOne(of => UserProfile)
    profile: UserProfile;

    constructor(props?: Partial<User>) {
        Object.assign(this, props);
    }

}