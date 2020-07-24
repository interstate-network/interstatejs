/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from 'ethereumjs-util';
import Common from 'ethereumjs-common';
import { BufferLike, PrefixedHexString, TxData, TransactionOptions, TransactionType, SignedTransactionJson } from './types';
import Transaction from './transaction';
export default class SignedTransaction implements Transaction {
    type: TransactionType;
    raw: Buffer[];
    nonce: Buffer;
    gasLimit: Buffer;
    gasPrice: Buffer;
    to: Buffer;
    value: Buffer;
    data: Buffer;
    v: Buffer;
    r: Buffer;
    s: Buffer;
    stateRoot: Buffer;
    _common: Common;
    private _senderPubKey?;
    protected _from?: Buffer;
    isIncoming: boolean;
    isFake: () => boolean;
    constructor(data?: Buffer | PrefixedHexString | BufferLike[] | TxData | SignedTransactionJson, opts?: TransactionOptions);
    toRollup(outputRoot?: Buffer): Buffer;
    toCreationAddress(): boolean;
    hash(includeSignature?: boolean): Buffer;
    getChainId(): number;
    getSenderAddress(): Buffer;
    getSenderPublicKey(): Buffer;
    verifySignature(): boolean;
    sign(privateKey: Buffer): void;
    getDataFee(): BN;
    getBaseFee(): BN;
    getUpfrontCost(): BN;
    validate(): boolean;
    validate(stringError: false): boolean;
    validate(stringError: true): string;
    serialize(): Buffer;
    toJSON(labels?: boolean): {
        [key: string]: string;
    } | string[];
    private _validateV;
    private _isSigned;
    private _overrideVSetterWithValidation;
    encode(includeHash?: boolean, includeType?: boolean, includeFrom?: boolean): SignedTransactionJson;
    private _implementsEIP155;
}
