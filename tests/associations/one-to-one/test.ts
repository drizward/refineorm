import { DataContext } from '../../../src/dataContext';
import { MysqlContext } from './mysqlContext';
import { expect } from 'chai';
import { User } from './models/user';
import { UserProfile } from './models/userProfile';

describe('One-to-one relationship', () => {

    it('can build tables', async () => {
        const context = new MysqlContext();
        const sql = 'SELECT table_name FROM information_schema.tables WHERE TABLE_SCHEMA = :schema';
        const tables: any[] = await context.sendRawQuery(sql, { schema: 'skripsi' });

        await context.release();
        expect(tables.length).to.equal(2);

    });

    it('can non-cascade save', async () => {
        const context = new MysqlContext();

        const user = new User({
            name: 'Agus Subejo',
            age: 20,
            maritalStatus: false,
            address: 'Rungkut',
            job: 'System Analyst'
        });
        
        const userCount = await context.users.insert(user);
        expect(userCount).to.equal(1);

        const profile = new UserProfile();
        profile.user = user;
        profile.displayName = 'drizward';
        profile.showAddress = false;

        const profileCount = await context.profiles.insert(profile);
        expect(profileCount).to.equal(1);

        await context.release();
    });

    it('can read from profile', async () => {
        const context = new MysqlContext();

        const first = await context.profiles.first();

        expect(first.user).to.instanceOf(User);
        expect(first.user.name).to.equal("Agus Subejo");

        await context.release();
    });

    it('can read from user', async () => {
        const context = new MysqlContext();

        const first = await context.users.first();
        expect(first.profile).to.instanceOf(UserProfile);
        expect(first.profile.displayName).to.equal("drizward");
        
        await context.release();
    });

    it('can read joined property', async () => {
        const context = new MysqlContext();

        const result = await context.users
                                   .where(x => x.profile.showAddress == false)
                                   .toArray();

        const [first] = result;
        expect(first.profile).to.instanceOf(UserProfile);
        expect(first.profile.showAddress).to.equal(0);
        
        await context.release();
    });

    it('can read joined reference property', async () => {
        const context = new MysqlContext();

        const result = await context.profiles
                                   .where(x => x.user.age >= 20)
                                   .toArray();

        const [first] = result;
        expect(first.user).to.instanceOf(User);
        expect(first.user.name).to.equal("Agus Subejo");
        
        await context.release();
    });

});