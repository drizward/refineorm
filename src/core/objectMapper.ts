import { ClassType, internal } from '../internal/internal';
import { TableDescriptor } from '../meta/tableDescriptor';

type MapperInfo = {
    propertyName: string;
    prefixName?: string;
    mapper?: ObjectMapper;
    converter?: (item: any) => any;
    classType?: ClassType<any>;
    collectionType?: ClassType<Array<any>>;
    isReference?: boolean;
};

export class ObjectMapper {

    private propertyMap: MapperInfo[] = [];
    private baseType: ClassType<any>;
    private scalarInfo: MapperInfo;

    constructor() {

    }

    asTypeOf(classType: ClassType<any>): ObjectMapper {
        this.baseType = classType;
        return this;
    }

    asScalar(propertyName: string, converter?: (item: any) => any): ObjectMapper {
        this.scalarInfo = { propertyName, converter };
        return this;
    }

    setPropertyType(propertyName: string, classType: ClassType<any>, prefixName?: string): ObjectMapper {
        this.getPropertyInfo(propertyName, prefixName).classType = classType;
        return this;
    }

    setPropertyCollectionType(propertyName: string, collectionType: ClassType<Array<any>>, prefixName?: string): ObjectMapper {
        this.getPropertyInfo(propertyName, prefixName).collectionType = collectionType;
        return this;
    }

    setPropertyMapper(propertyName: string, mapper: ObjectMapper, prefixName?: string): ObjectMapper {
        this.getPropertyInfo(propertyName, prefixName).mapper = mapper;
        return this;
    }

    setPropertyConverter(propertyName: string, converter: (item: any) => any, prefixName?: string): ObjectMapper {
        this.getPropertyInfo(propertyName, prefixName).converter = converter;
        return this;
    }

    mergeMapper(asProperty: string, mapper: ObjectMapper): ObjectMapper {
        mapper.propertyMap.forEach(x => {
            const obj = Object.assign({}, x);
            obj.prefixName = asProperty;

            this.propertyMap.push(obj);
        });

        return this;
    }

    referenceBy(propertyName: string, prefixName?: string): ObjectMapper {
        this.getPropertyInfo(propertyName, prefixName).isReference = true;
        return this;
    }

    mapResult(obj: any, extend?: any) {
        if(typeof obj != 'object') {
            return obj;
        }
        else if (this.scalarInfo) {
            const si = this.scalarInfo;
            const value = obj[si.propertyName];
            return si.converter? si.converter(value) : value;
        }
        else {
            const ex = this.extract(obj, extend);
            return ex;
        }
    }

    getRootProperty() {
        return this.propertyMap.filter(x => !x.prefixName);
    }

    getBaseType() {
        return this.baseType || Object;
    }

    // Need formatting?
    extract(raw: any, extend?: any): any {
        const references = new Map();
        return Object.entries(raw)
                     .reduce((rs, [prop, value]) => {
                        const nested = prop.split('.');
                        if(nested.length > 1) {
                            let prefix: string;
                            nested.reduce((n, np, ni) => {
                                if(ni != 0) {
                                    const previous = nested[ni - 1];
                                    if(prefix) {
                                        prefix += `.${previous}`;
                                    }
                                    else prefix = previous;
                                }

                                if(ni == nested.length - 1) {
                                    let x = n;
                                    if(!x[np]) {
                                        if(n instanceof Array) 
                                            x = n[n.length - 1];

                                        x[np] = value;
                                    }
                                }
                                else {
                                    let obj = n[np];
                                    const propInfo = this.getPropertyInfo(np, prefix, false);

                                    if(!obj) {
                                        const prefixName = prefix? `${prefix}.${np}` : np;
                                        let cached = references.get(prefixName);
                                        
                                        if(!cached) {
                                            const refBy = this.propertyMap
                                                              .find(x => x.prefixName == prefixName && x.isReference);

                                            if(refBy && extend) {
                                                const refName = `${prefixName}.${refBy.propertyName}`;
                                                const refIdentity = raw[refName];

                                                cached = this.findReference(extend, refName, refIdentity);
                                            }
                                            
                                            if(!cached)
                                                cached = propInfo? new propInfo.classType() : {};

                                            references.set(prefixName, cached);

                                            if(propInfo && propInfo.collectionType) {
                                                n[np] = new propInfo.collectionType();
                                                n[np].push(cached);

                                                return cached;
                                            }

                                            n[np] = cached;
                                        }
                                    }
                                    else if(obj instanceof Array) {
                                        const prefixName = prefix? `${prefix}.${np}` : np;
                                        let cached = references.get(prefixName);
                                        
                                        if(!cached) {
                                            const refBy = this.propertyMap
                                                              .find(x => x.prefixName == prefixName && x.isReference);

                                            if(refBy) {
                                                const refName = `${prefixName}.${refBy.propertyName}`;
                                                const refIdentity = raw[refName];

                                                cached = this.findReference(n[np], refBy.propertyName, refIdentity);
                                            }

                                            if(!cached)
                                                cached = propInfo? new propInfo.classType() : {};

                                            obj.push(cached);
                                            references.set(prefixName, cached);

                                            return cached;
                                        }
                                    }
                                }

                                return n[np];
                            }, rs);
                        }
                        else if(!extend) 
                            rs[prop] = value;
    
                        return rs;
                     }, extend || (this.baseType? new this.baseType() : {}));
    } 

    canExtend(raw: any, ref: any) {
        const reference = this.propertyMap.find(x => !x.prefixName && x.isReference);
        if(!reference)
            return false;

        const primary = reference.propertyName;
        return raw[primary] == ref[primary];
    }

    findReference(obj: any, refBy: string, value: string): any {
        const props = refBy.split('.');

        let ref = obj;
        const propIndex = props.length - 1;
        for(let i = 0; i < propIndex; i++) {
            ref = ref[props[i]];

            if(!ref)
                break;
        }

        if(ref && ref[props[propIndex]] == value)
            return ref;

        return null;
    }

    private getPropertyInfo(propertyName: string, prefixName?: string, autoCreate: boolean = true) {
        let property = this.propertyMap.find(x => x.propertyName == propertyName && x.prefixName == prefixName);
        if(!property && autoCreate) {
            property = { propertyName, prefixName };

            this.propertyMap.push(property);
        }

        return property;
    }

}