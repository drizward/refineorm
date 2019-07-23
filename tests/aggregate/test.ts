
import { MysqlContext } from './mysqlContext';
import { expect, should } from 'chai';
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

        context.release();
    });

    it('Can get max age', async () => {
        const context = new MysqlContext();
        const max = await context.users.max(x => x.age);
        
        expect(max).to.be.equals(38);

        context.release();
    })

    it('Can get max from selected sets by age', async () => {
        const context = new MysqlContext();
        const max = await context.users.select(x => x.age).max();
        
        expect(max).to.be.equals(38);

        context.release();
    })

    it('Should error on get max parameterless on user', async () => {
        const context = new MysqlContext();
        
        try {
            await context.users.max();
        }
        catch(ex) {
            context.release();
            return;
        }

        throw new Error("Should't have come here");
    })

    it('Can get min age', async () => {
        const context = new MysqlContext();
        const min = await context.users.min(x => x.age);
        
        expect(min).to.be.equals(24);

        context.release();
    })

    it('Can get min from selected sets by age', async () => {
        const context = new MysqlContext();
        const min = await context.users.select(x => x.age).min();
        
        expect(min).to.be.equals(24);

        context.release();
    })

    it('Can get count parameterless', async () => {
        const context = new MysqlContext();

        const count = await context.users.count();
        expect(count).to.be.equals(6);

        context.release();
    })

    it('Can get count with selector', async () => {
        const context = new MysqlContext();

        const count = await context.users.count(x => x.age > 30);
        expect(count).to.be.equals(4);

        context.release();
    })

    it('Can get count parameterless from selected sets by age', async () => {
        const context = new MysqlContext();

        const count = await context.users.where(x => x.age > 30).count();
        expect(count).to.be.equals(4);

        context.release();
    })

    it('Can get average age', async () => {
        const context = new MysqlContext();
        const avg = await context.users.average(x => x.age);
        
        const expected = users.map(x => x.age).reduce((x, y) => x + y) / users.length;
        expect(avg).to.be.equals(expected);

        context.release();
    })

    it('Can get average from selected sets by age ', async () => {
        const context = new MysqlContext();
        const avg = await context.users.select(x => x.age).average();
        
        const expected = users.map(x => x.age).reduce((x, y) => x + y) / users.length;
        expect(avg).to.be.equals(expected);

        context.release();
    })

    it('Can get total sum of ages', async () => {
        const context = new MysqlContext();
        const sum = await context.users.sum(x => x.age);
        
        const expected = users.map(x => x.age).reduce((x, y) => x + y);
        expect(sum).to.be.equals(expected);

        context.release();
    })

    it('Can get total sum from selected sets by age', async () => {
        const context = new MysqlContext();
        const sum = await context.users.select(x => x.age).sum();
        
        const expected = users.map(x => x.age).reduce((x, y) => x + y);
        expect(sum).to.be.equals(expected);

        context.release();
    })

});

describe('Can get result of is all or any exists', () => {

    it('Can return true if any exists in dataset', async() => {
        const context = new MysqlContext();
        const any = await context.users.any();
        
        expect(any).to.be.true;

        context.release();
    })

    it('Can return true if any exists in filtered sets', async() => {
        const context = new MysqlContext();
        const any = await context.users
                                 .where(x => x.age > 30)
                                 .any();
        
        expect(any).to.be.true;

        context.release();
    })

    it('Can return false if none exists in filtered sets', async() => {
        const context = new MysqlContext();
        const any = await context.users
                                 .where(x => x.age < 20)
                                 .any();
        
        expect(any).to.be.false;

        context.release();
    })

    it('Can return true if any exists with selector', async() => {
        const context = new MysqlContext();
        const any = await context.users
                                 .any(x => x.age > 30);
        
        expect(any).to.be.true;

        context.release();
    })

    it('Can return false if any exists with selector', async() => {
        const context = new MysqlContext();
        const any = await context.users
                                 .any(x => x.age < 20);
        
        expect(any).to.be.false;

        context.release();
    })

    it('Can return true for is all with age more than 20', async() => {
        const context = new MysqlContext();
        const all = await context.users
                                 .all(x => x.age > 20);
        
        expect(all).to.be.true;

        context.release();
    })

    it('Can return false for is all with age more than 30', async() => {
        const context = new MysqlContext();
        const all = await context.users
                                 .all(x => x.age > 30);
        
        expect(all).to.be.false;

        context.release();
    })

})