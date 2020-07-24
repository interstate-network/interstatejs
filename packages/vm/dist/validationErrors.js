"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockStateRootError = exports.BlockExitsRootError = exports.TransactionStateError = exports.BlockValidationError = void 0;
class BlockValidationError extends Error {
}
exports.BlockValidationError = BlockValidationError;
class TransactionStateError extends Error {
    constructor(transactionIndex) {
        super('Invalid transaction state root');
        this.transactionIndex = transactionIndex;
    }
}
exports.TransactionStateError = TransactionStateError;
class BlockExitsRootError extends Error {
    constructor() {
        super("Invalid exits root in header");
    }
}
exports.BlockExitsRootError = BlockExitsRootError;
class BlockStateRootError extends Error {
    constructor() {
        super("Invalid state root in header");
    }
}
exports.BlockStateRootError = BlockStateRootError;
//# sourceMappingURL=validationErrors.js.map