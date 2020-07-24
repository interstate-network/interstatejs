/// <reference types="node" />
import { BufferLike, FakeTxData, PrefixedHexString, TransactionOptions, TransactionType } from './types';
import SignedTransaction from './signed';
export default class FakeTransaction extends SignedTransaction {
    type: TransactionType;
    from: Buffer;
    constructor(data?: Buffer | PrefixedHexString | BufferLike[] | FakeTxData, opts?: TransactionOptions);
    hash(includeSignature?: boolean): Buffer;
}
