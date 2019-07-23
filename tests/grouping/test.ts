
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

    it('Can group by age', async () => {
        const context = new MysqlContext();

        const grouped = await context.users
                                     .groupBy(x => x.age)
                                     .toArray();
        
        await context.release();
    });

    it('Can group by age and name', async () => {
        const context = new MysqlContext();

        const grouped = await context.users
                                     .groupBy(x => ({ age: x.age, name: x.name }))
                                     .toArray();
        
        await context.release();
    });

})