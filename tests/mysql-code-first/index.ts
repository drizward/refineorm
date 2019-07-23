import { MysqlContext } from "./mysqlContext";
import { DummyUser } from "./dummyUser";

async function run() {
    const userDatas = [
        new DummyUser({
            address: 'Jl. Yang Lurus',
            age: 24,
            job: 'System Analyst',
            maritalStatus: false,
            name: 'Agus Subejo'
        }),
        new DummyUser({
            address: 'Jl. Mangga Dua',
            age: 31,
            job: 'CEO Mangga Dua Sejahtera',
            maritalStatus: true,
            name: 'Paijo Bejo'
        }),
        new DummyUser({
            address: 'Jl.Yang Bocor',
            age: 32,
            job: 'CEO Facebook',
            maritalStatus: true,
            name: 'Mark Zuckerberg'
        }),
        new DummyUser({
            address: 'Jl. The Light Side',
            age: 26,
            job: 'Jedi Apperantice',
            maritalStatus: true,
            name: 'Anakin Skywalker'
        }),
        new DummyUser({
            address: 'Jl. Yang Mahal',
            age: 38,
            job: 'CEO Apple',
            maritalStatus: false,
            name: 'Steve Jobs'
        }),
        new DummyUser({
            address: 'Jl. Galaksi Tatooine',
            age: 32,
            job: 'Master Jedi',
            maritalStatus: false,
            name: 'Luke Skywalker'
        })
    ];

    const context = new MysqlContext();
    try {
        //context.users.count();  
        //const dummy = new BasicCollection(users);

        for(let user of userDatas)
            await context.users.insert(user);

        userDatas.splice(0);
        if(userDatas.length)
            throw new Error("UserDatas is not empty yet!");

        const user = await context.users.first(x => x.name == 'Anakin Skywalker');
        user.age = 40;
        user.job = "The Darth Vader";
        user.address = "Jl. The Dark Side";
        user.maritalStatus = false;
        await context.users.update(user);

        const jobs = await context.users.first(x => x.name == 'Steve Jobs');
        await context.users.delete(jobs);

        console.log('\nAll users:');
        for await (const user of context.users) 
            console.log(`${user.job} named ${user.name} is here boys`);

        console.log('\nUsers with age >= 40 or married: ');
        const query = context.users
                             .where(x => 32 <= x.age && x.age <= 40)
                             .orderBy(x => x.job)
                             .orderByDescending(x => x.age);

        for await (const user of query)
            console.log(`${user.job} named ${user.name} is ${user.age} y/o`);
    }
    catch(err) {
        if(err instanceof Error)
            console.log(err.stack);
    }

    await context.release();
}

run();
