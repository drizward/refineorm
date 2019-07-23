
# Refine ORM

## WIP, some functionality could be not working as expected!

Refine is a type-safe ORM for TS/JS in both code-first and database-first paradigm that uses lambda/arrow function as the query definition that inspired by LINQ query style in C#. Refine are highly inspired by those popular .NET ORM such as Entity Framework and Linq2db, and also TS ORM such as TypeORM.

In other word, you may query in database as how you work with array. It allow you to write your query in a JS/TS' lambda to enable fast database prototyping on Node.js, React Native and Ionic, and support most popular database such as MySQL, MSSQL, PostgreSQL, Oracle and SQLite.

Refine may not as complicated and complex as many other ORM in JS/TS world but it will give you a very strong resemblance than any other ORM in way to query your data.

Working feature listed as:

* Query API to let you work in lambda/arrow function
* Model and data configuration with decorator
* Associations in bi-directional, while uni-directional are partially supported for One-to-one
* Inheritance pattern
* Transaction
* Multiple migration strategy
* Lazy and eager loading for associations
* Promise-based
* EF-like DataContext

Expected features:

* Fluent model configurator for Javascript
* Custom repository
* Navigation property for associations

## Installation

```sh
npm install --save refineorm

# one of
npm install --save mysql named-placeholder
npm install --save pg
npm install --save mssql
npm install --save oracledb
npm install --save sqlite
```

If you use Typescript make sure to include following configuration in your `tsconfig.json`

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

Also since Refine rely very much on ES6 arrow function, you must set your target to minimum of `es6`, however `esnext` are more reccomended. You will know why after you read the detail below.

## Get Started

### Configuring your model

Refine model are defined through a class, so you may start with creating your class as like the following

```ts
export class User {
    name: string;
    job: string;
    age: number;
    maritalStatus: boolean;
    address: string;
}
```

Now if you done with your model, you may start decorating your class with metadata that needed to sturcture out your physical database

```ts
@Table('users')
export class User {

    @Key()
    name: string;

    @Column()
    job: string;

    @Column()
    age: number;

    @Column('isMarried')
    maritalStatus: boolean;

    @Column()
    address: string;
}
```

From the latter, we decorate our class with a `@Table` and `@Column` for the properties. Both decorator may accept string paramater to rename your table or property into more suited name of your choice.

Also we use `@Key` to decorate `name` as our primary key. Notice how we only use `@Key` without a `@Column`. Since `@Key` indicate that it is a primary key and since primary key must be a column, you may omit the `@Column` from it.

However the `@Key` decorator don't accept any parameter as how `@Column` accept string as the physical column name. So if you want to name your column, you have to pass it with the `@Column` as the following example

```ts
@Key() @Column('userName')
name: string;
```

#### Fluent model configuration

If you use a plain Javascript and can't work with decorator, or you may but you hate it because it's not a standard even in ESNext, you may use fluent model configurator to describe your table structure. You can follow the example below

```ts
// TO DO
```

### Creating the DataContext

All interaction with database in Refine are passed through `DataContext`. In simple word, it is a representation of your connection to the database and even the strcuture of the database itself. First of all, you need to create a class that extends the base `DataContext` class. Let's define it as the following

```ts
export class MyContext extends DataContext {

    static readonly config: ConnectionConfig = {
        database: 'skrpsi',
        host: 'localhost',
        password: '',
        port: 3306,
        type: 'mysql',
        user: 'root'
    };

    constructor() {
        super(MyContext.config, new MysqlProvider());
    }

}
```

You can suit the `config` as your own connection configuration. In the example above, we use MySQL as the database provider and we define it from the `type` property inside the config. The valid type are `mysql`, `pgsql`, `mssql`, `oracle`, and `sqlite`. If you want to change your vendor or provider, you can simply change it.

### Adding your DataSet

If `DataContext` is a represetation of your connection and database, `DataSet` is a representation of the table inside your database. Since the tables are bound to database, so does the `DataSet` are bound to `DataContext`. To add your dataset to your context, you may see the following

```ts
export class MyContext extends DataContext {

    static readonly config: ConnectionConfig = {
        database: 'skrpsi',
        host: 'localhost',
        password: '',
        port: 3306,
        type: 'mysql',
        user: 'root'
    };

    readonly users: DataSet<User> = this.fromSet(User);

    constructor() {
        super(MyContext.config);
    }

}
```

We add the dataset of type `User` as a property and initialize it with `this.fromSet(..)`. We have to pass the class, in this case `User`, as the parameter because TS don't let us to read the generic type. Also notice that `readonly` modifier are added to ensure no side-effect are happening to the dataset.

### Setting up your Migration Strategy

In Refine, migration strategy are the way to handle migration when changes detected in your model. Migration strategy are defined with `MigrationStrategy` enum, and the most basic is `Never`, `OnEmpty` and `OnChange`. `Never` are **the only valid strategy if you want to work in database-first**, while the other can be used to handle the code-first paradigm.

By default, `DataContext` will implement `OnEmpty` as it strategy, meaning that the database generation only happen when the database are completely empty. If you want to change it, you may override the `migrationStrategy` in your data context as below

```ts
get migrationStrategy(): MigrationStrategy {
    return MigrationStrategy.RecreateOnChange;
}
```

Setting your strategy to `OnChange` will ensure that the database are generated everytime a change happen in the model.

### Working with your first query

#### Inserting your object

After you have done with your model, data context and the data set, now you only need to write somewhere in your code your first query. Let's start with inserting your first `User`.

```ts
async function someWhereInCode() {

    const user = new User();
    user.name = 'John Doe';
    user.job = 'JS Developer';
    user.age = 33;
    user.maritalStatus = false;
    user.address = 'Somewhere in NPM';

    const context = new MyContext();
    await context.users.insert(user);

    await context.release();

}
```

Notice that we use `async` modifier in the function and `await` for the `insert` and `release`. If your environment yet to support it you can use the common `then` as how you work in `promise`. And don't forget to call `release` in the end if you want to close and release the resource immediately.

#### Reading your data

Now since the table have a record, we can begin to write our query to read the data. To read the user by it's name we can write it as

```ts
async function someWhereInCode() {
    // -- the previous code

    const john = await context.users.first(x => x.name == 'John Doe');
    console.log(john.job) // output: JS Developer

    await context.release();
}
```

The `first` method are equivalent with `find` in array, it return the first element. Query from above will return the first element with `name = 'John Doe'`.

If you want to read only one data and such data must be entirely unique, you could use `single(...)` instead

```ts
async function someWhereInCode() {
    // -- the previous code

    try {
        const john = await context.users.single(x => x.name == 'John Doe');
        console.log(john.job) // output: JS Developer
    }
    catch(err) {
        console.log("User with name 'John Doe' are more than 1");
    }

    await context.release();
}
```

The `single` method will throw an error when data that fulfill the predicate are more than one record. However, if you sure that it may only exists one record and you didn't need it to be checked, you should use `first` as it will only send the query once, while `single` will send 2 query in which first checking whether such data only have 1 record and the second is to read the actual data.

#### Selecting and filtering your data

If you already have 10 users in the database, and you want to filter it by age that is greater or equals 30, you can use the below query

```ts
const filtered = context.users.where(x => x.age > 30);
for await (const user of filtered) {
    // do something with the filtered data here
}
```

That's how you're querying with the where clause. But why didn't `where` awaited as how we did it with `first` and how did it get executed? The query get executed when an access or iteration happens to the `filtered` or an element that it held. In the above, it's happen in the `for` statement.

 Simply, unlike `first` which return an object, `where` method will return an `AsyncCollection` which is also a base interface of `DataSet` that will let you interact with the the table. In other word, this mechanism allow you to chain or build your query dynamically as how common `QueryBuilder` pattern in other ORM. But instead of a string, it typed in a valid expression. Another example can be seen below

```ts
let filtered = context.users
                      .where(x => x.age > 30)
                      .select(x => x.name);

for await (const name of filtered) {
    // name will be string
    // do something with name
}
```

The example will return names of users with `age >= 30`. The `select` method is equivalent with `map` in array. If you need to get more than one column, you could use the object literal instead

```ts
let filtered = context.users
                      .where(x => x.age > 30)
                      .select(x => ({
                          name: x.name,
                          job: x.job
                      }));

for await (const name of filtered) {
    // name will be string
    // do something with name
}
```

If your current environment has yet to support the `asyncIterable` or `for await` statement, as it was only supported in ES2018, you may cast your data set immediately with `toArray()` or `toCollection()`.

```ts
const filtered = ... // -- defined as previously
const arr = await filtered.toArray();

for(const data of arr) {
    // do something with data
}
```

Calling both method will immediately execute the stacked query without the need to accessing or iterating over it's elements. The only difference between both are `toCollection()` will return a `Collection` that was very similar to `AsyncCollection` but without the `async`.

**CAUTION!** If you plan to iterate your query or collection more than one, you should **always** save the returned data from `toArray()` or `toCollection()` before you begin your first iteration, and use the value returned from the method as the iterable source (the most right side in `for .. of/in ..`) in all the iteration. Each iteration to raw `AsyncCollection` will execute the query each time and none of the returned result will be saved unless you do it manually.

```ts
const filtered = context.users.where(x => x.age > 30);

// === this is bad - DON'T ===
for await (const user of filtered) {
    // ...

    if(user.age < 25)
        break;
}

// ....

for await (const user of filtered) {
    // filtered query will get executed again before reaching this line for the first time
    // do something with user for the second time
}
// =======================

// === this is good - DO ===
const data = await filtered.toArray();
for await (const user of data) {
    // ...

    if(user.age < 25)
        break;
}

// ....

for await (const user of data) {
    // keep iterating with records in data
    // do something with user for the second time
}
// ========================
```

#### Reading all data from table

If you want to read all the data in the `DataSet`, you only need to iterate over it like how we did it in the previous, or how the below code written

```ts
for await (const user of context.users) {
    // do something with user here
}
```

#### Paginating your query

Refine make it easy to paginate or limiting you query. This achieved through the `take` and `skip` methods

```ts
const limitPerPage = 8;
let currentPage = 1;

const context = new MyContext();
const query = context.users
                     .where(x => x.age >= 30)
                     .orderBy(x => x.age)
                     .skip((currentPage - 1) * limitPerPage)
                     .take(limitPerPage);

for await (const user of query) {
    // do something
}

await context.release();
```

The example will limiting your result to just 8 records. Also notice that we use `orderBy` with `x.age` as it selector. If you want to order or sort it by descending, you can use `orderByDesc` instead.

You can read more about composing your query and all the possible option [here](http://huehue)

### Manipulating your data

#### Updating and deleting one record

To update or deleting one data in the database, you can simply use `update` or `delete` with your object as it paramater as how you do it with insert operation

```ts
const context = new MyContext();

const mark = await context.users.first(x => x.name == "Mark");
mark.job = '.NET Developer';
mark.age = 30;

await context.users.update(mark);

const alex = await context.users.first(x => x.name == "Alex");
await context.delete(alex);

await context.release();
```

#### Updating many

If you need you need to updating records based on a condition, `AsyncCollection` have a `set` method that can be chained with finishing `update` method to update all data by the composed query

```ts
const context = new MyContext();
const updated = await context.users
                             .where(x => x.age < 25)
                             .set(x => x.maritalStatus, false);
                             .execute();

await context.release();
```

You need to specify what column to be updated with `set` method. First parameter are the selector of column that want to be changed, while the second parameter is the value.
Alternatively, `set` also have an overload that let you to write an assigment expression instead.

```ts
const context = new MyContext();
const updated = await context.users
                             .where(x => x.age < 25)
                             .set(x => x.maritalStatus = false);
                             .execute();

await context.release();
```

If the given expression is not an assigment, set will throw an error.

#### Deleting many

Similar to the update, `AsyncCollection` also have `delete` method to delete all records that matched the composed query

```ts
const context = new MyContext();
const updated = await context.users
                             .where(x => x.age < 20)
                             .delete();

await context.release();
```

### Forcing database synchronization

You may asks where did we create the table since we didn't mention it anywhere on above. Well the migration are taken in place before your first query are sent to the database. So keep in mind your first query could be cumbersome somehow. And if you somehow didn't want to wait until your first query, you may call the `forceSynchronize()`

```ts
const context = new MyContext();

await context.forceSynchronize();

// --  our first query in below
```

Keep in mind that `forceSynchronize()` can only ran one time after your application started, and will throw an Error if a call happened again.

### Creating association

In Refine, association are built with `@HasOne(...)` and `@HasMany(...)` decorator. The most easy way to define your association is by using bi-directional way, in which both model must decorate it's related property with either `@HasOne` or `@HasMany`, although some cases will enable you to write your association in a uni-directional way.

#### One-to-one relation

We will modify the defined `User` model from the above and give it a one-to-one relation with, let say, a `UserBilling` in which a user may only have it once. Let create the `UserBilling` class first and decorate it as how we do it with `User` previously.

```ts
@Table('user_billing')
export class UserBilling {

    @Key()
    @HasOne(of => User)
    user: User;

    @Column()
    isActive: boolean;

    @Column()
    isSuspended: boolean;

    @Credentials()
    securityKey: string;

}
```

The `@HasOne` decorator accept a first argument to be a selector of the class that being referenced. It also has an optional second argument that accept a selector to referenced property of the first argument. This optional arguments will be explained in detail further on below.

Notice that in the `UserBilling`, we decorate the property `user` which have type of `User` as the primary key. This format alone would be enough to make a uni-directional one-to-one relationship, in which a `user` column, which is a primary key, will have a reference or foreign key to column `name` in `User`.

Also note the `@Credentials` decorator in property `securityKey`. This decorator will hide the `securityKey` column while reading the database unless it requested manually by `select` or `loadWith`. This decorator is good when you want to restrict a sensitive data, like password or token, being loaded unexpectedly.

Now we will also give a property that have Billing as it type and decorate it with `@HasOne` too to make a bidirectional relation.

```ts
@Table('users')
export class User {
    // -- another property up here

    @HasOne(of => UserBilling)
    billing: UserBilling;
}
```
