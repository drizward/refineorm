import { ObjectMapper } from "../core/objectMapper";
import { SqlExpression } from "../sqlExpressions/sqlExpression";
import { SqlProvider } from "../sqlProvider/sqlProvider";

export interface QueryDescriptor {

    isQuery: boolean;
    isScalar: boolean;
    isSingle: boolean;
    mapper: ObjectMapper;
    sqlExpression: SqlExpression;
    parameterKey: string[];
    parameters: object;

    provider: SqlProvider;
    runner: (sqlText: string, params: any) => any;

}