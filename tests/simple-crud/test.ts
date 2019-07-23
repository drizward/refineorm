
import { MysqlContext } from './mysqlContext';
import { expect } from 'chai';
import { User } from './models/user';

describe('Simple CRUD', () => {

    it('Can create or insert', async () => {
        const context = new MysqlContext();

        const model: User = new User({
            name: "Luke Skywalker",
            address: "A desert in Tattouine",
            age: 18,
            job: "Jedi Trainee",
            maritalStatus: false
        });
        
        const inserted = await context.users.insert(model);
        expect(inserted).to.be.equals(1);

        const user = await context.users.first(x => x.name == "Luke Skywalker");
        expect(user.address).to.be.equals(model.address);

        await context.release();
    });

    it('Can update', async () => {
        const context = new MysqlContext();
        
        const luke = await context.users.first(x => x.name == "Luke Skywalker");
        luke.age = 20;

        const affected = await context.users.update(luke);
        expect(affected).to.be.equals(1);
        
        const twenties = await context.users.first(x => x.age >= 20);
        expect(twenties).to.be.not.null;
        expect(twenties.name).to.be.equals(luke.name);

        const underaged = await context.users.first(x => x.age <= 18);
        expect(underaged).to.be.not.exist;

        await context.release();
    });

    it('Can delete', async () => {
        const context = new MysqlContext();

        let luke = await context.users.first(x => x.name == "Luke Skywalker");

        const affected = await context.users.delete(luke);
        expect(affected).to.be.equals(1);

        luke = await context.users.first(x => x.name == "Luke Skywalker");
        expect(luke).to.be.not.exist;

        await context.release();
    });

});