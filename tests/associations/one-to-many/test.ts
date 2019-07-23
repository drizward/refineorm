
import { MysqlContext } from './mysqlContext';
import { expect } from 'chai';
import { Patient } from './models/patient';
import { Counter } from './models/counter';

describe('One-to-many relationship', () => {

    it('can build tables', async () => {
        const context = new MysqlContext();
        const sql = 'SELECT table_name FROM information_schema.tables WHERE TABLE_SCHEMA = :schema';
        const tables: any[] = await context.sendRawQuery(sql, { schema: 'skripsi' });

        await context.release();
        expect(tables.length).to.equal(2);

    });

    it('can non-cascade save', async () => {
        const context = new MysqlContext();

        const counters: Counter[] = [
            new Counter({
                id: 101,
                name: 'Umum',
                doctor: 'Dokter Subejo',
                roomNumber: '204'
            }),
            new Counter({
                id: 102,
                name: 'Ibu & bayi',
                doctor: 'Dokter Bernard',
                roomNumber: '306'
            }),
            new Counter({
                id: 103,
                name: 'Penyakit dalam',
                doctor: 'Dokter Paijo',
                roomNumber: '108'
            })
        ];

        const patients: Patient[] = [
            new Patient({
                id: 1,
                name: 'Steve Jobs',
                diagnose: 'pilek',
                isServed: false,
                counter: counters[0]
            }),
            new Patient({
                id: 2,
                name: 'Bill Gates',
                diagnose: 'batuk berdahak',
                isServed: false,
                counter: counters[0]
            }),
            new Patient({
                id: 3,
                name: 'Mark Zuckerberg',
                diagnose: 'istrinya gatal-gatal',
                isServed: true,
                counter: counters[1]
            }),
            new Patient({
                id: 4,
                name: 'Ibu Siti',
                diagnose: 'cek rutin',
                isServed: false,
                counter: counters[1]
            }),
            new Patient({
                id: 5,
                name: 'Gabe Newell',
                diagnose: 'hati terasa nyeri setelah diputus cinta',
                isServed: false,
                counter: counters[2]
            })
        ];
        
        let counterCount = 0;
        for(const counter of counters)
            counterCount += await context.counters.insert(counter);

        expect(counterCount).to.equal(counters.length);

        let patientCount = 0;
        for(const patient of patients)
            patientCount += await context.patients.insert(patient);

        expect(patientCount).to.equal(patients.length);

        await context.release();
    });

    it('can read from patient', async () => {
        const context = new MysqlContext();

        const mark = await context.patients.skip(2).first();

        expect(mark.name).to.equal("Mark Zuckerberg");
        expect(mark.counter).to.instanceOf(Counter);
        expect(mark.counter.name).to.equal("Ibu & bayi");

        await context.release();
    });

    it('can read from counter', async () => {
        const context = new MysqlContext();

        const mb = await context.counters.skip(1).take(1).toArray();

        expect(mb.length).to.equal(1);
        expect(mb[0].id).to.equal(102);
        expect(mb[0].patients.length).to.equal(2);

        await context.release();
    });

    it('can read all from counter', async () => {
        const context = new MysqlContext();

        const counters = await context.counters.toArray();
        expect(counters.length).to.equal(3);
        
        let patients = counters.map(x => x.patients.length).reduce((x, y) => x + y);
        expect(patients).to.equal(5);

        await context.release();
    });

});