export declare enum ERROR {
    OUT_OF_GAS = "out of gas",
    STACK_UNDERFLOW = "stack underflow",
    STACK_OVERFLOW = "stack overflow",
    INVALID_JUMP = "invalid JUMP",
    INVALID_OPCODE = "invalid opcode",
    OUT_OF_RANGE = "value out of range",
    REVERT = "revert",
    STATIC_STATE_CHANGE = "static state change",
    INTERNAL_ERROR = "internal error",
    ATTEMPTED_CREATE = "attempted to execute create",
    CREATE_COLLISION = "create collision",
    STOP = "stop",
    REFUND_EXHAUSTED = "refund exhausted",
    INSUFFICIENT_BALANCE = "insufficient balance for call",
    INSUFFICIENT_VALUE_FOR_BOUNTY = "insufficient value for exit bounty",
    DISALLOWED_CALL_TARGET = "disallowed call target"
}
export declare class VmError extends Error {
    error: ERROR;
    errorType: string;
    constructor(error: ERROR);
}
