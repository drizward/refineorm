
export class ParameterFormatter {

    pattern: RegExp;

    constructor(public prefix: string, public replacer: string | ((key: string, index: number, type: any) => string)) {
        this.pattern = new RegExp(`\\${prefix}({[A-Za-z0-9.]+}|[A-Za-z0-9]+)`, 'gm');
    }

    format(sql: string, obj: any) {
        const parameter = [];
        const cache = {};

        let index = 0;
        sql = sql.replace(this.pattern, (s, x) => {
            const param = x[0] == "{"? x.substr(1, x.length - 1) : x;

            let value = cache[param];
            let keys = param.split('.');
            if(!value) {
                for(const x of keys)
                    value = value? value[x] : obj[x];

                cache[param] = value;
            }

            parameter.push(value);
            return typeof this.replacer == 'string'? this.replacer : this.replacer(keys.pop(), index++, typeof value);
        });

        return { sql, parameter };
    }
}