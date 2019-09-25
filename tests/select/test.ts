
import { expect } from 'chai';
import { User } from './models/user';
import { MysqlContext } from './mysqlContext';

const users: User[] = [
    new User({
        address: 'Jl. Yang Lurus',
        age: 24,
        job: 'System Analyst',
        maritalStatus: false,
        name: 'Agus Subejo'
    }),
    new User({
        address: 'Jl. Mangga Dua',
        age: 31,
        job: 'CEO Mangga Dua Sejahtera',
        maritalStatus: true,
        name: 'Paijo Bejo'
    }),
    new User({
        address: 'Jl.Yang Bocor',
        age: 32,
        job: 'CEO Facebook',
        maritalStatus: true,
        name: 'Mark Zuckerberg'
    }),
    new User({
        address: 'Jl. The Light Side',
        age: 26,
        job: 'Jedi Apperantice',
        maritalStatus: true,
        name: 'Anakin Skywalker'
    }),
    new User({
        address: 'Jl. Yang Mahal',
        age: 38,
        job: 'CEO Apple',
        maritalStatus: false,
        name: 'Steve Jobs'
    }),
    new User({
        address: 'Jl. Galaksi Tatooine',
        age: 32,
        job: 'Master Jedi',
        maritalStatus: false,
        name: 'Luke Skywalker'
    })
];

describe('Select mapping', () => {

    before(async () => {
        const context = new MysqlContext();
        for(let user of users)
            await context.users.insert(user);

        context.release();
    });

    it('Can select name and job', async () => {
        const context = new MysqlContext();

        const users = await context.users
                                   .select(x => ({
                                        name: x.name,
                                        job: x.job
                                   }))
                                   .toArray();

        expect(users).to.exist;
        expect(users.length).to.be.equals(6);
        expect(users[0]).to.ownProperty('name');
        expect(users[0]).to.ownProperty('job');
        expect(users[0]).to.not.ownProperty('age');

        await context.release();
    });

    it('Can select by properties name', async () => {
        const context = new MysqlContext();

        const users = await context.users
                                   .select('name', 'job')
                                   .toArray();

        expect(users).to.exist;
        expect(users.length).to.be.equals(6);
        expect(users[0]).to.ownProperty('name');
        expect(users[0]).to.ownProperty('job');
        expect(users[0]).to.not.ownProperty('age');

        await context.release();
    });

    it('Can select with binary expression', async () => {
        const context = new MysqlContext();

        const user = await context.users
                                  .where(x => x.name == "Luke Skywalker")
                                  .select(x => ({
                                      name: x.name,
                                      futureAge: x.age + 5
                                  }))
                                  .first();

        expect(user).to.exist;
        expect(user).to.ownProperty('name');
        expect(user).to.ownProperty('futureAge');
        expect(user).to.not.ownProperty('age');
        expect(user.futureAge).to.be.equals(37);

        await context.release();
    });

    it('Can select with logical expression', async () => {
        const context = new MysqlContext();

        const user = await context.users
                                  .where(x => x.name == "Luke Skywalker")
                                  .select(x => ({
                                      name: x.name,
                                      isAdult: x.age > 30
                                  }))
                                  .first();

        expect(user).to.exist;
        expect(user).to.ownProperty('name');
        expect(user).to.ownProperty('isAdult');
        expect(user).to.not.ownProperty('age');
        expect(user.isAdult).to.be.equals(1);

        await context.release();
    });

    it('Can select with nested object', async () => {
        const context = new MysqlContext();

        const user = await context.users
                                  .where(x => x.name == "Luke Skywalker")
                                  .select(x => ({
                                      name: x.name,
                                      info: {
                                          job     : x.job,
                                          isAdult : x.age > 30 
                                      }
                                  }))
                                  .first();

        expect(user).to.exist;
        expect(user).to.ownProperty('name');
        expect(user).to.ownProperty('info');
        expect(user).to.not.ownProperty('age');
        expect(user.info.isAdult).to.be.equals(1);

        await context.release();
    });

    it('Can select chained with where', async () => {
        const context = new MysqlContext();

        const user = await context.users
                                  .where(x => x.name == "Luke Skywalker")
                                  .select(x => ({
                                      name: x.name,
                                      info: {
                                          job     : x.job,
                                          isAdult : x.age > 30 
                                      }
                                  }))
                                  .where(x => x.info.isAdult == true)
                                  .first();

        expect(user).to.exist;
        expect(user).to.ownProperty('name');
        expect(user).to.ownProperty('info');
        expect(user).to.not.ownProperty('age');
        expect(user.info.isAdult).to.be.equals(1);

        await context.release();
    });

});