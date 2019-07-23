import { QueryWorker } from "./queryWorker";
import { Expression, CallExpression } from 'estree';
import { DataContext } from "../dataContext";
import { internal } from '../internal/internal';
import { CreateTableStatement } from '../sqlExpressions/createTableStatement';
import { ExpressionBuilder } from '../internal/expressionBuilder';
import { SqlDataType } from "../sqlExpressions/sqlDataType";
import { QueryComposer } from "./queryComposer";
import { SequenceContext } from "./queryContext/sequenceContext";
import { TableContext } from "./queryContext/tableContext";
import { TableDescriptor } from "../meta/tableDescriptor";
import { AssociationType } from "../meta/associationType";
import { TableExpression } from "../sqlExpressions/tableExpression";
import { ColumnDescriptor } from "../meta/columnDescriptor";

export class CreateTableWorker implements QueryWorker {

    canConvert(expr: Expression): boolean {
        if(expr.type != "CallExpression" || expr.callee.type != "Identifier")
            return false;

        return expr.callee.name == '__createTable';
    }    
    
    convertQuery(composer: QueryComposer, expr: Expression): SequenceContext {
        expr = expr as CallExpression;

        const [arg1, arg2, arg3] = expr.arguments;
        let context: DataContext;
        let type: new (args?: any[]) => any;

        if(arg1.type == "Literal" && arg1.value instanceof DataContext) {
            context = arg1.value;
        }
        else throw new Error("Create table first argument expect a DataContext type");

        if(arg2.type == "Literal" && typeof arg2.value.constructor == 'function') {
            type = <any> arg2.value;
        }
        else throw new Error("Create table second argument expect a class type");

        const td = internal.mapper.mapOf(type);
        if(arg3 && arg3.type == "Literal" && typeof arg3.value.constructor == 'function') {
            return this.normalizeManyToMany(td, internal.mapper.mapOf(<any> arg3.value), context);
        }

        const table = ExpressionBuilder.table(td);
        const columns = Object.keys(td.columns).map(x => td.columns[x]).filter(x => !x.isReference);

        let invalid: ColumnDescriptor;
        if(invalid = columns.find(x => x.columnType == SqlDataType.Invalid)) {
            throw new Error(`Some invalid column are found in type ${td.type.constructor.name} with key ${invalid.name}`);
        }
        
        const ts: CreateTableStatement =  {
            type: "TableStructureStatement",
            columns: columns.map(x => ExpressionBuilder.columns(x, table)),
            table
        }

        const sequence = new TableContext(td);
        sequence.statement = ts;
        sequence.dataContext = context;
        
        return sequence;
    }
    
    private normalizeManyToMany(table1: TableDescriptor, table2: TableDescriptor, context: DataContext): SequenceContext {
        const association = table1.associations
                                  .find(x => x.type == AssociationType.ManyToMany &&
                                             (
                                                 (x.owner.type == table1 && x.ref.type == table2) ||
                                                 (x.ref.type == table1 && x.owner.type == table2)
                                             ));
        if(!association)
            throw new Error("Association of many to many not found");

        const columns = [association.owner.property, association.ref.property];
        const table: TableExpression = {
            type: "TableExpression",
            name: `${association.owner.type.name}${association.ref.type.name}`,
            schema: table1.schema
        };

        const ts: CreateTableStatement = {
            type: "TableStructureStatement",
            table,
            columns: columns.map(x => ExpressionBuilder.columns(x, table))
        }

        const sequence = new TableContext(table1);
        sequence.statement = ts;
        sequence.dataContext = context;

        return sequence;
    }
}