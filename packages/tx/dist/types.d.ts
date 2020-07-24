/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from "ethereumjs-util";
import Common from 'ethereumjs-common';
import { Address } from "web3x/address";
export interface TransformableToBuffer {
    toBuffer(): Buffer;
}
export declare type PrefixedHexString = string;
export declare type BufferLike = Buffer | TransformableToBuffer | PrefixedHexString | number;
export declare enum TransactionType {
    none = "none",
    signed = "signed",
    incoming = "incoming",
    outgoing = "outgoing",
    fake = "fake"
}
export declare type TransactionSource = {
    block: BN;
    transactionIndex: BN;
};
export interface IncomingTxData {
    itxIndex?: BufferLike;
    from?: BufferLike;
    to?: BufferLike;
    gasLimit?: BufferLike;
    value?: BufferLike;
    data?: BufferLike;
    stateRoot?: BufferLike;
}
export interface SignedTxData {
    gasLimit?: BufferLike;
    gasPrice?: BufferLike;
    to?: BufferLike;
    nonce?: BufferLike;
    data?: BufferLike;
    v?: BufferLike;
    r?: BufferLike;
    s?: BufferLike;
    value?: BufferLike;
    stateRoot?: BufferLike;
}
export interface TxData {
    _type?: TransactionType | 'none' | 'signed' | 'incoming' | 'outgoing' | 'fake' | undefined;
    itxIndex?: BufferLike;
    gasLimit?: BufferLike;
    gasPrice?: BufferLike;
    from?: BufferLike;
    to?: BufferLike;
    nonce?: BufferLike;
    data?: BufferLike;
    v?: BufferLike;
    r?: BufferLike;
    s?: BufferLike;
    value?: BufferLike;
    stateRoot?: BufferLike;
}
export interface FakeTxData extends SignedTxData {
    from?: BufferLike;
}
export interface TransactionOptions {
    type?: TransactionType;
    common?: Common;
    chain?: number | string;
    hardfork?: string;
}
export declare type SignedTransactionJson = {
    _type?: 'none' | 'signed' | 'incoming' | 'outgoing' | 'fake' | undefined;
    hash?: string;
    from?: string;
    input?: string;
    nonce: string;
    gasLimit: string;
    gasPrice: string;
    to: string;
    value: string;
    data: string;
    v: string;
    r: string;
    s: string;
    stateRoot?: string;
};
export declare type IncomingTransactionJson = {
    _type?: 'none' | 'signed' | 'incoming' | 'outgoing' | 'fake' | undefined;
    hash?: string;
    input?: string;
    itxIndex: string;
    from: string;
    to: string;
    gasLimit: string;
    value: string;
    data: string;
    stateRoot?: string;
};
export interface OutgoingTransactionData {
    from: Address;
    to: Address;
    gas: string;
    value: string;
    data: string;
    bounty: string;
}
