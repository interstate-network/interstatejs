/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from "ethereumjs-util";
import { TransactionType, SignedTransactionJson, IncomingTransactionJson } from './types';
import Common from "ethereumjs-common";
export default interface Transaction {
    _common: Common;
    type: TransactionType;
    sourceBlock?: Buffer;
    itxIndex?: Buffer;
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
    stateRoot?: Buffer;
    isIncoming: Boolean;
    hash(includeSignature?: boolean): Buffer;
    getDataFee(): BN;
    getBaseFee(): BN;
    getUpfrontCost(): BN;
    serialize(): Buffer;
    toJSON(labels: boolean): {
        [key: string]: string;
    } | string[];
    getSenderAddress(): Buffer;
    validate(): boolean;
    validate(stringError: boolean): boolean | string;
    encode(includeHash?: boolean, includeType?: boolean, includeFrom?: boolean): SignedTransactionJson | IncomingTransactionJson;
    toRollup(outputRoot?: Buffer): Buffer;
}
