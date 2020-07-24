export declare class BlockValidationError extends Error {
}
export declare class TransactionStateError extends Error {
    transactionIndex: number;
    constructor(transactionIndex: number);
}
export declare class BlockExitsRootError extends Error {
    constructor();
}
export declare class BlockStateRootError extends Error {
    constructor();
}
