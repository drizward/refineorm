
import { PgContext } from './pgContext';
import { expect } from 'chai';
import { User } from './models/user';
import { Nationality } from './models/nationality';

const users: User[] = [
    new User({
        age: 24,
        profession: 'System Analyst',
        name: 'Agus Subejo',
        nationality: 'INA'
    }),
    new User({
        age: 31,
        profession: 'CEO Mangga Dua Sejahtera',
        name: 'Paijo Bejo',
        nationality: 'AUS'
    }),
    new User({
        age: 32,
        profession: 'Admin Kaskus',
        name: 'Markus Paulus',
        nationality: 'USA'
    }),
    new User({
        age: 26,
        profession: 'Programmer In Trainee',
        name: 'Dave Nolan',
        nationality: 'INA'
    }),
    new User({
        age: 38,
        profession: 'JS Developer',
        name: 'Mark Severus',
        nationality: 'GBR'
    })
];

const nationalities = [
    new Nationality({
        code: 'INA',
        name: 'Indonesia',
        capital: 'Jakarta'
    }),
    new Nationality({
        code: 'AUS',
        name: 'Australia',
        capital: 'Canberra'
    }),
    new Nationality({
        code: 'USA',
        name: 'United States',
        capital: 'Washington D.C'
    }),
    new Nationality({
        code: 'GBR',
        name: 'United Kingdom',
        capital: 'London'
    }),
    new Nationality({
        code: 'SNG',
        name: 'Singapore',
        capital: 'Singapore City'
    })
]

describe('Select mapping', () => {

    before(async () => {
        const context = new PgContext();
        for(let user of users)
            await context.users.insert(user);

        for(let nat of nationalities)
            await context.nationalities.insert(nat);

        context.release();
    });

    it('Can select name and job', async () => {
        const context = new PgContext();

        const users = await context.users
                                   .join(
                                       context.nationalities,
                                       (a, b) => a.nationality == b.code,
                                       (a, b) => ({
                                           name: a.name,
                                           nationality: b.name,
                                           residence: b.capital
                                       })
                                    )
                                    .toArray()

        expect(users).to.exist;
        expect(users.length).to.be.equals(5);

        await context.release();
    });

});