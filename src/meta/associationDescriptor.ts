import { TableDescriptor } from './tableDescriptor';
import { ColumnDescriptor } from './columnDescriptor';
import { TableColumnDescriptor } from '../internal/descriptorMapper';
import { AssociationType } from './associationType';

export interface AssociationDescriptor {
    owner: TableColumnDescriptor;
    ref: TableColumnDescriptor;
    type: AssociationType;

    isLazy: boolean;
    cascadeOnInsert: boolean;
    cascadeOnUpdate: boolean;
    cascadeOnDelete: boolean;    
}