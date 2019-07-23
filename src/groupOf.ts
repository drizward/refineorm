import { Collection } from "./collection";

export interface GroupOf<TKey, TValue> {

    key: TKey;
    values: Collection<TValue>

}