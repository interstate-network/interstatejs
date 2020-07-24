/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from "ethereumjs-util";
import Common from "ethereumjs-common";
import { PrefixedHexString, BufferLike, TxData, TransactionOptions, TransactionType, SignedTransactionJson, IncomingTransactionJson } from "./types";
import { Transaction } from ".";
export default class UnionTransaction implements Transaction {
    type: TransactionType;
    _common: Common;
    private _senderPubKey?;
    private _from?;
    itxIndex: Buffer;
    raw: Buffer[];
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
    get isIncoming(): boolean;
    isSigned: () => boolean;
    isFake: () => boolean;
    encodeForDb: () => SignedTransactionJson | IncomingTransactionJson;
    toJsonRpc: () => SignedTransactionJson | IncomingTransactionJson;
    toRollup(outputRoot?: Buffer): Buffer;
    encode(includeHash?: boolean, includeType?: boolean, includeFrom?: boolean): SignedTransactionJson | IncomingTransactionJson;
    static fromJSON(json: SignedTransactionJson | IncomingTransactionJson, type?: TransactionType, options?: TransactionOptions): UnionTransaction;
    serialize(): Buffer;
    toJSON(labels?: boolean): {
        [key: string]: string;
    } | string[];
    constructor(data?: Buffer | PrefixedHexString | BufferLike[] | IncomingTransactionJson | SignedTransactionJson | TxData, opts?: TransactionOptions);
    toCreationAddress(): boolean;
    getChainId(): number;
    hash(includeSignature?: boolean): Buffer;
    getSenderPublicKey(): Buffer;
    getSenderAddress(): Buffer;
    verifySignature(): boolean;
    sign(privateKey: Buffer): void;
    getDataFee(): BN;
    getBaseFee(): BN;
    getUpfrontCost(): BN;
    validate(): boolean;
    validate(stringError: false): boolean;
    validate(stringError: true): string;
    validateNonce(expectedNonce: Buffer): boolean;
    private _validateV;
    private _isSigned;
    private _overrideVSetterWithValidation;
    private _implementsEIP155;
}
export declare const SignedTxFields: ({
    name: string;
    length: number;
    allowLess: boolean;
    default: Buffer;
    alias?: undefined;
    allowZero?: undefined;
} | {
    name: string;
    alias: string;
    length: number;
    allowLess: boolean;
    default: Buffer;
    allowZero?: undefined;
} | {
    name: string;
    allowZero: boolean;
    length: number;
    default: Buffer;
    allowLess?: undefined;
    alias?: undefined;
} | {
    name: string;
    alias: string;
    allowZero: boolean;
    default: Buffer;
    length?: undefined;
    allowLess?: undefined;
} | {
    name: string;
    allowZero: boolean;
    default: Buffer;
    length?: undefined;
    allowLess?: undefined;
    alias?: undefined;
} | {
    name: string;
    length: number;
    allowZero: boolean;
    allowLess: boolean;
    default: Buffer;
    alias?: undefined;
})[];
export declare const IncomingTxFields: ({
    name: string;
    length: number;
    allowZero: boolean;
    default: Buffer;
    allowLess?: undefined;
    alias?: undefined;
} | {
    name: string;
    length: number;
    allowLess: boolean;
    allowZero: boolean;
    default: Buffer;
    alias?: undefined;
} | {
    name: string;
    alias: string;
    length: number;
    allowLess: boolean;
    allowZero: boolean;
    default: Buffer;
} | {
    name: string;
    alias: string;
    allowZero: boolean;
    default: Buffer;
    length?: undefined;
    allowLess?: undefined;
})[];
