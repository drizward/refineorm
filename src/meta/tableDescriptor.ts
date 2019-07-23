
import { ColumnDescriptor } from './columnDescriptor'
import { AssociationDescriptor } from './associationDescriptor';
 
export interface TableDescriptor {

    name: string;
    schema: string;
    keys: string[];
    columns: { [name: string]: ColumnDescriptor }
    isValidated: boolean;
    type: any;
    associations?: AssociationDescriptor[];
    isDescribed: boolean;

}