export class BlockValidationError extends Error {}

export class TransactionStateError extends Error {
  transactionIndex: number;

  constructor(transactionIndex: number) {
    super('Invalid transaction state root')
    this.transactionIndex = transactionIndex;
  }
}

export class BlockExitsRootError extends Error {
  constructor() {
    super("Invalid exits root in header")
  }
}

export class BlockStateRootError extends Error {
  constructor() {
    super("Invalid state root in header")
  }
}