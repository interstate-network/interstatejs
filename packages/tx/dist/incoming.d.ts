/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from 'ethereumjs-util';
import Common from 'ethereumjs-common';
import Transaction from './transaction';
import { IncomingTxData, TransactionOptions, TransactionType, BufferLike, PrefixedHexString, IncomingTransactionJson } from './types';
export default class IncomingTransaction implements Transaction {
    type: TransactionType;
    raw: Buffer[];
    itxIndex: Buffer;
    from: Buffer;
    to: Buffer;
    gasLimit: Buffer;
    value: Buffer;
    data: Buffer;
    nonce: Buffer;
    gasPrice: Buffer;
    v: Buffer;
    r: Buffer;
    s: Buffer;
    stateRoot: Buffer;
    _common: Common;
    isIncoming: boolean;
    getDataFee: () => BN;
    getBaseFee: () => BN;
    getUpfrontCost: () => BN;
    getSenderAddress: () => Buffer;
    serialize: () => Buffer;
    hash: (_: boolean) => Buffer;
    toJSON: () => {};
    validate(): boolean;
    validate(stringError: false): boolean;
    validate(stringError: true): string;
    toRollup(outputRoot?: Buffer): Buffer;
    constructor(data: Buffer | PrefixedHexString | BufferLike[] | IncomingTxData | IncomingTransactionJson, opts?: TransactionOptions);
    encode(includeHash?: boolean, includeType?: boolean, includeFrom?: boolean): IncomingTransactionJson;
    encodeABI(): string | Buffer;
    hashABI(): Buffer;
}
