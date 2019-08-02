
import { expect } from 'chai';
import { User } from './models/user';
import { PgContext } from './pgContext';

const users: User[] = [
    new User({
        address: 'Jl. Yang Lurus',
        age: 24,
        job: 'System Analyst',
        maritalStatus: false,
        name: 'Abdul Karim'
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

let onStart: NodeJS.MemoryUsage, onEnd : NodeJS.MemoryUsage;
describe('Read Query', () => {

    before(async () => {
        const context = new PgContext();

        onStart = process.memoryUsage();
        for(let user of users)
            await context.users.insert(user);

        context.release();
    });

    it('Can read all records', async () => {
        const context = new PgContext();

        const users = await context.users.toArray();
        expect(users.length).to.be.equals(6);

        const luke = users.find(x => x.name == "Luke Skywalker");
        expect(luke).to.be.exist;

        await context.release();
    });

    it('Can read all with order by', async () => {
        const context = new PgContext();

        const users = await context.users
                                   .orderBy(x => x.age)
                                   .toArray();
        expect(users.length).to.be.equals(6);

        const [top, second] = users;
        expect(top.age).to.be.below(second.age);
        expect(top.name).to.be.equals("Abdul Karim");

        await context.release();
    });

    it('Can read all with order by descending', async () => {
        const context = new PgContext();

        const users = await context.users
                                   .orderByDescending(x => x.age)
                                   .toArray();
        expect(users.length).to.be.equals(6);

        const [top, second] = users;
        expect(top.age).to.be.above(second.age);
        expect(top.name).to.be.equals("Steve Jobs");

        await context.release();
    });

    it('Can read first', async () => {
        const context = new PgContext();

        // == First without predicate
        let first = await context.users.first();
        expect(first).to.be.not.null;

        let isExists = users.some(x => x.name == first.name);
        expect(isExists).to.be.true;

        // == First with predicate
        let luke = await context.users.first(x => x.name == "Luke Skywalker");
        expect(luke).to.be.not.null;
        expect(luke.name).to.be.equal("Luke Skywalker");

        // == First should return null
        let kenobi = await context.users.first(x => x.name == "Obi-wan Kenobi");
        expect(kenobi).to.be.not.exist;

        await context.release();
    });

    it('Can read last', async () => {
        const context = new PgContext();

        // == Last without predicate
        let last = await context.users.last();
        expect(last).to.be.not.null;

        let isExists = users.some(x => x.name == last.name);
        expect(isExists).to.be.true;

        // == Last with predicate 
        let luke = await context.users.last(x => x.name == "Luke Skywalker");
        expect(luke).to.be.not.null;
        expect(luke.name).to.be.equal("Luke Skywalker");

        // == Last from an ordered query
        let jobs = await context.users
                                .orderBy(x => x.age)
                                .last();
        
        expect(jobs).to.be.not.null;
        expect(jobs.name).to.be.equal("Steve Jobs");

        await context.release();
    });

    it('Can read first with bound parameter', async () => {
        const context = new PgContext();
        const name = "Luke Skywalker", age = 30;

        // == Last with predicate 
        let luke = await context.users
                                .bind({ name })
                                .first(x => x.name == name);

        expect(luke).to.be.not.null;
        expect(luke.name).to.be.equal("Luke Skywalker");

        // == Last from an ordered query
        let jobs = await context.users
                                .bind({ age })
                                .where(x => x.age > age)
                                .orderBy(x => x.age)
                                .last();
        
        expect(jobs).to.be.not.null;
        expect(jobs.name).to.be.equal("Steve Jobs");

        await context.release();
    });

    it('Can read element at index', async () => {
        const context = new PgContext();

        let anakin = await context.users
                                .orderBy(x => x.age)
                                .elementAt(2);

        expect(anakin).to.be.exist;
        expect(anakin.name).to.be.equals("Anakin Skywalker");
        expect(anakin.age).to.be.equals(26);

        await context.release();
    });

    it('Can read element by serial id', async () => {
        const context = new PgContext();

        let anakin = await context.users.first(x => x.id == 4);

        expect(anakin).to.be.exist;
        expect(anakin.name).to.be.equals("Anakin Skywalker");
        expect(anakin.age).to.be.equals(26);

        await context.release();
    });

});