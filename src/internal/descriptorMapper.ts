import 'reflect-metadata';
import { TableDescriptor } from '../meta/tableDescriptor'
import { ColumnDescriptor } from '../meta/columnDescriptor';
import { internal, ClassType } from './internal';
import { DataTypeDescriptor } from '../meta/dataTypeDescriptor';
import { AssociationDescriptor } from '../meta/associationDescriptor';
import { AssociationType } from '../meta/associationType';
import { SqlDataType } from '../sqlExpressions/sqlDataType';
import { ExpressionHelper } from '../core/expressionHelper';

const metaKey = 'refine:descriptor';
const dependentKey = 'refine:dependent';
const typeKey = 'design:type';

export type TableColumnDescriptor = {
    type: TableDescriptor,
    property: ColumnDescriptor 
};

export type AssociationInfo = {
    type: "AssociationInfo";
    of: () => ClassType<any>;
    on?: (...args: any[]) => any;
    association: "One" | "Many";
}

type DependentInfo = {
    current: TableColumnDescriptor;
    refType: ClassType<any>;
    refProperty: string;
}

export class DescriptorMapper  {
    private readonly invalidSqlType: DataTypeDescriptor = { sqlType: SqlDataType.Invalid };

    map<T>(type: ClassType<T>): TableDescriptor {
        const td: TableDescriptor = {
            name: type.constructor.name,
            columns: {},
            isValidated: true,
            keys: [],
            schema: 'public',
            type: type,
            isDescribed: false
        }
        Reflect.defineMetadata(metaKey, td, type);
        
        return td;
    }

    mapProperty<T>(type: ClassType<T>, propertyName: string, table?: TableDescriptor): ColumnDescriptor {
        const td = table || this.mapOf(type);
        const t = Reflect.getMetadata(typeKey, type, propertyName);
        const dataType = internal.typeMapper.mapDataType(t) || this.invalidSqlType;

        if(!t)
            td.isValidated = false;

        const cd: ColumnDescriptor = {
            propertyName,
            converter: null,
            defaultValue: null,
            isAutoIncrement: false,
            isCollection: false,
            isCredential: false,
            isGenerated: false,
            isKey: false,
            isLazy: t == Promise, 
            isNullable: true,
            isReadonly: false,
            isReference: false,
            maxLength: dataType.length,
            name: propertyName,
            classType: t,
            columnType: dataType.sqlType,
        };

        td.columns[propertyName] = cd;

        if(internal.mapper.isTableType(t))
            this.mapAssociation({ type: td, property: cd }, t);
        
        return cd;
    }

    mapOf<T>(type: ClassType<T>) : TableDescriptor;
    mapOf<T>(type: ClassType<T>, propertyName: string) : TableColumnDescriptor;
    mapOf<T>(type: ClassType<T>, propertyName?: string): TableDescriptor | TableColumnDescriptor {

        if(typeof type == 'function')
            type = type.prototype;

        const td: TableDescriptor = Reflect.getMetadata(metaKey, type) || this.map(type);
        if(!propertyName) {
            return td;
        }
        else return {
            type: td,
            property: td.columns[propertyName] || this.mapProperty(type, propertyName, td)
        }
    }

    ignoreMapOf<T>(type: ClassType<T>, propertyName: string) {
        const td = this.mapOf(type);
        const cd = td.columns[propertyName];

        if(cd) 
            delete td.columns[propertyName];
    }


    keyOf<T>(type: ClassType<T> | TableDescriptor): ColumnDescriptor {
        const ref = 'name' in type && 'schema' in type? type : internal.mapper.mapOf(type);
        if(ref.keys.length  == 0)
            return null;
            
        if(ref.keys.length > 1)
            throw new Error(`Foreign keys on composite primary keys are not supported yet`); // TO DO
        
        const [key] = ref.keys;
        return ref.columns[key];
    }

    isTableType(obj: any): boolean {
        if(typeof obj != "function" || typeof obj.prototype != "object")
            return false;

        const meta: TableDescriptor = Reflect.getMetadata(metaKey, obj.prototype);
        if(!meta)
            return false;

        return Object.keys(meta.columns).length > 0;
    }

    getterFrom(column: ColumnDescriptor): (model: any) => any {
        if(internal.mapper.isTableType(column.classType)) {
            const cd = this.keyOf(column.classType);
            return (model: any) => model[column.name][cd.name];
        }

        return (model: any) => model[column.name];
    }

    mapAssociation<T>(current: TableColumnDescriptor, refType: ClassType<T>, refProperty?: string) {
        if(!current.property.isKey)
            current.property.isReference = true;

        const ref = this.mapOf(refType);

        if(!ref.isDescribed)
            return;

        if(!ref.isValidated) {
            let depedendents: DependentInfo[] = Reflect.getMetadata(dependentKey, refType);
            if(!depedendents) {
                depedendents = [];
                Reflect.defineMetadata(dependentKey, depedendents, refType);
            }

            depedendents.push({ current, refType, refProperty });
            return;
        }
        
        let assoc: AssociationDescriptor;
        const refKey = refProperty? ref.columns[refProperty] : this.keyOf(ref);
        const reference = { type: ref, property: refKey };

        if(current.property.isKey) {
            if(current.property.isCollection)
                throw new Error(`Collection or array can't be used as a Key`);

            assoc = this.createAssociation(current, reference);
            assoc.type = AssociationType.OneToOne;
        }
        else {
            let source: TableColumnDescriptor;
            let dest: TableColumnDescriptor;

            if(current.property.isCollection) {
                let prop = refKey;
                const currentType = current.type.type.constructor;

                dest = { type: current.type, property: current.property };
                if(prop.classType != currentType) {
                    if(refProperty)
                        throw new Error(`Referenced property ${refProperty} must be having same type as ${current.property.propertyName}`);

                    prop = Object.keys(ref.columns)
                                 .map(x => ref.columns[x])
                                 .find(x => x.classType == currentType);

                    if(!prop) {
                        prop = this.createGeneratedColumn(ref, dest.property.name, {
                            length: dest.property.maxLength,
                            sqlType: dest.property.columnType
                        });
                    }
                }

                source = { type: ref, property: prop };

                if(!source.property.isCollection)
                    dest.property = this.keyOf(current.type);
            }
            else {
                let fk = refKey;
                if(!fk.isKey)
                    fk = this.keyOf(ref);

                source = current;
                dest = { type: ref, property: fk };
            }

            const assocs = this.guardAssociations(current.type);
            const existing = assocs.find(x => x.owner.type == source.type && x.owner.property == source.property 
                                                && x.ref.type == dest.type && x.ref.property == dest.property);
            if(existing) {
                current.property.referenceTo = existing.owner.property;
                return existing;
            }
            
            assoc = this.createAssociation(source, dest);
            if(source.property.isCollection && dest.property.isCollection) {
                assoc.type = AssociationType.ManyToMany;
                dest.property.isReference = true;
                source.property.isReference = true;
                
                this.reflectReferenceToKey(dest, this.keyOf(source.type));
                this.reflectReferenceToKey(source, this.keyOf(dest.type));

                dest.property.isNullable = false;
                source.property.isNullable = false;
            }
            else {
                source.property.isReference = false; // as physical column
                
                if(current.property != source.property)
                    current.property.referenceTo = source.property
            }
        }

        return assoc;
    }

    setAsKey(desc: TableColumnDescriptor) {
        desc.type.keys.push(desc.property.propertyName);
        desc.property.isKey = true;
        desc.property.isNullable = false;

        if(!desc.property.classType)
            return desc;

        if(desc.property.isReference)
            desc.property.isReference = false;

        if(desc.type.associations) {
            for(const a of desc.type.associations.filter(x => x.ref.type == desc.type && x.ref.property == null)) {
                a.ref.property = desc.property;

                if(a.owner.property == null) {
                    const ownerColumn = this.createGeneratedColumn(a.owner.type, desc.property.name, { 
                        sqlType: desc.property.columnType,
                        length: desc.property.maxLength
                    });

                    a.owner.property = ownerColumn;
                    this.setAsKey(a.owner);
                }
                
                if(a.owner.property.isKey)
                    a.type = AssociationType.OneToOne;
            }
        }

        return desc;
    }

    associationOf(descriptor: TableColumnDescriptor) {
        const type = descriptor.type;
        const prop = descriptor.property;
        return !type.associations? null : type.associations.filter(x => x.owner.property == prop || x.ref.property == prop);
    }

    validate(table: TableDescriptor): boolean {
        const columns = Object.keys(table.columns)
                              .map(x => table.columns[x])
                              .filter(x => 'type' in x.classType && x.classType.type == "AssociationInfo");

        const validated = [];
        for(const col of columns) {
            const info = col.classType as AssociationInfo;
            const type = info.of();

            if(!type)
                continue;
            
            this.attachReference({ type: table, property: col }, type, info.on);
            this.mapAssociation({ type: table, property: col }, type, col.referenceTo? col.propertyName : undefined);
            validated.push(col);
        }

        const isValid = validated.length == columns.length;
        if(isValid)
            table.isValidated = true;

        return isValid;
    }

    attachReference<T>(desc: TableColumnDescriptor, type: ClassType<T>, prop: (on: T) => any) {
        desc.property.classType = type;
            
        if(prop) {
            const ref = internal.mapper.mapOf(type);
            const name = ExpressionHelper.nameof(prop);
            const refKey = ref.columns[name];

            if(!refKey) {
                const type = desc.type.type.constructor.name;
                const refType = desc.type.type.constructor.name;
                throw new Error(`Property '${name}' referenced by ${type}::${desc.property.propertyName} must exists on ${refType}`);
            }

            desc.property.referenceTo = refKey;
        }
    }

    private createAssociation(owner: TableColumnDescriptor, ref: TableColumnDescriptor): AssociationDescriptor {
        if(owner.property && ref.property)
            owner.property.columnType = ref.property.columnType;

        if(!owner.property.maxLength)
            owner.property.maxLength = ref.property.maxLength;
            
        const assoc = {
            owner,
            ref,
            type: AssociationType.OneToMany,
            cascadeOnDelete: false,
            cascadeOnInsert: false,
            cascadeOnUpdate: false,
            isLazy: false
        };
        this.guardAssociations(owner.type).push(assoc);
        this.guardAssociations(ref.type).push(assoc);
        
        return assoc;
    }

    private createGeneratedColumn(table: TableDescriptor, columnName: string, dataType?: DataTypeDescriptor): ColumnDescriptor {
        const propertyName = `refine__${columnName}`;
        const cd: ColumnDescriptor = {
            propertyName,
            converter: null,
            defaultValue: null,
            isAutoIncrement: false,
            isCollection: false,
            isCredential: false,
            isGenerated: true,
            isKey: false,
            isLazy: false, 
            isNullable: true,
            isReadonly: false,
            isReference: false,
            maxLength: !dataType? null : dataType.length,
            name: columnName,
            classType: null,
            columnType: !dataType? null : dataType.sqlType
        };

        return table.columns[propertyName] = cd;
    }

    private guardAssociations(td: TableDescriptor): AssociationDescriptor[] {
        let assocs = td.associations;
        if(!assocs)
            assocs = td.associations = [];

        return assocs;
    }

    private reflectReferenceToKey(ref: TableColumnDescriptor, to: ColumnDescriptor) {
        ref.property.referenceTo = to;
        ref.property.columnType = to.columnType;
        ref.property.maxLength = to.maxLength;
    }

}