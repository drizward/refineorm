
import { MysqlContext } from './mysqlContext';
import { expect } from 'chai';
import { User } from './models/user';

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

describe('Aggregate functions', () => {

    before(async () => {
        const context = new MysqlContext();
        for(let user of users)
            await context.users.insert(user);

        await context.release();
    });

    it("Can convert 'in' to 'like' for string", async () => {
        const context = new MysqlContext();

        const skywalkers = await context.users
                                     .where(x => '%Skywalker%' in (x.name as any))
                                     .toArray();
        
        expect(skywalkers).to.exist;
        expect(skywalkers.length).to.be.equal(2);

        await context.release();
    });

    it("Can convert 'in' to 'like' for one string wrapped inside array", async () => {
        const context = new MysqlContext();

        const skywalkers = await context.users
                                     .where(x => '%Skywalker%' in [x.name])
                                     .toArray();
        
        expect(skywalkers).to.exist;
        expect(skywalkers.length).to.be.equal(2);

        await context.release();
    });

    it("Can use in for an array", async () => {
        const context = new MysqlContext();

        const selections = await context.users
                                     .where(x => x.age in [32, 26, 30])
                                     .toArray();
        
        expect(selections).to.exist;
        expect(selections.length).to.be.equal(3);

        await context.release();
    });

    it("Can use in for bound array", async () => {
        const context = new MysqlContext();

        const ages = [32, 26, 30];
        const selections = await context.users
                                     .bind({ ages })
                                     .where(x => x.age in ages)
                                     .toArray();
        
        expect(selections).to.exist;
        expect(selections.length).to.be.equal(3);

        await context.release();
    });

})