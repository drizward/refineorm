import { ObjectMapper } from "./objectMapper";


export interface ResultDescriptor {

    mapper: ObjectMapper;
    items: any;
    isSingle: boolean;
    isScalar: boolean;

}