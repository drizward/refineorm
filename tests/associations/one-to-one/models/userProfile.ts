import { Table } from "../../../../src/mapper/@table";
import { User } from "./user";
import { Column } from '../../../../src/mapper/@column';
import { Key } from "../../../../src/mapper/@key";
import { HasOne } from "../../../../src/mapper/@hasOne";

@Table('profiles')
export class UserProfile {

    @Key()
    @HasOne(of => User)
    user: User;

    @Column()
    displayName: string;

    @Column()
    showAddress: boolean;

}