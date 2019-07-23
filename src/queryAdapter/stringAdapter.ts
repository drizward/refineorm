import { AdapterFor } from "../mapper/adapter/@adapterFor";
import { QueryAdapter } from "../mapper/adapter/@queryAdapter";

@AdapterFor(String)
export class StringAdapter {

    @QueryAdapter('SUBSTRING(${this}, ${0} + 1, 1)', String)
    charAt(index: number) {
        throw new Error("This method should only be used in SQL interpreting");
    }

    @QueryAdapter('CONCAT(${this}, ${0})', String)
    concat(str: string) {
        throw new Error("This method should only be used in SQL interpreting");
    }

    @QueryAdapter("${this} LIKE CONCAT('%', ${0})", Boolean)
    endsWith(str: string) {
        throw new Error("This method should only be used in SQL interpreting");
    }

    @QueryAdapter("${this} LIKE CONCAT('%', ${0}, '%')", Boolean)
    includes(str: string) {
        throw new Error("This method should only be used in SQL interpreting");
    }

    @QueryAdapter("REPEAT(${this}, ${0})", String)
    repeat(count: number) {
        throw new Error("This method should only be used in SQL interpreting");
    }

    @QueryAdapter("${this} LIKE CONCAT(${0}, '%')", Boolean)
    starstWith(str: string) {
        throw new Error("This method should only be used in SQL interpreting");
    }

}