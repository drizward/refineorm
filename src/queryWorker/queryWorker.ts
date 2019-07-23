import { Expression } from 'estree';
import { SqlExpression } from '../sqlExpressions/sqlExpression';
import { QueryDescriptor } from '../internal/queryDescriptor';
import { QueryComposer } from './queryComposer';
import { SequenceContext } from './queryContext/sequenceContext';

export interface QueryWorker {
    canConvert(expr: Expression): boolean;
    convertQuery(composer: QueryComposer, expr: Expression): SequenceContext;
}