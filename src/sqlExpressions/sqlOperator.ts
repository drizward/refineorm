
export enum SqlOperator {
    
    // === Logical Operator
    And,
    Or,
    Not,
    Equals,
    NotEquals,
    Between,
    In,
    Greater,
    GreaterOrEquals,
    Less,
    LessOrEquals,
    Like,
    Distinct,
    As,
    Is,

    // === Arithmetic operator
    Add,
    Substract,
    Multiply,
    Divide,
    Modulo,

    // === Bitwise logical
    BitwiseAnd,
    BitwiseOr,
    BitwiseExclusiveOr,
    BitwiseNot,

    // === Bitwise shift
    LeftShift,
    RightShift
}