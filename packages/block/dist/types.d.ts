/// <reference types="node" />
import Common from 'ethereumjs-common';
import { TxData, IncomingTransactionJson, SignedTransactionJson } from '@interstatejs/tx';
import { Block } from './block';
import { BlockHeader } from './header';
/**
 * An object to set to which blockchain the blocks and their headers belong. This could be specified
 * using a Common object, or `chain` and `hardfork`. Defaults to mainnet without specifying a
 * hardfork.
 */
export interface ChainOptions {
    /**
     * A Common object defining the chain and the hardfork a block/block header belongs to.
     */
    common?: Common;
    /**
     * The chain of the block/block header, default: 'mainnet'
     */
    chain?: number | string;
    /**
     * The hardfork of the block/block header, default: 'petersburg'
     */
    hardfork?: string;
}
/**
 * Any object that can be transformed into a `Buffer`
 */
export interface TransformableToBuffer {
    toBuffer(): Buffer;
}
/**
 * A hex string prefixed with `0x`.
 */
export declare type PrefixedHexString = string;
/**
 * A Buffer, hex string prefixed with `0x`, Number, or an object with a toBuffer method such as BN.
 */
export declare type BufferLike = Buffer | TransformableToBuffer | PrefixedHexString | number;
/**
 * A block header's data.
 */
export interface BlockHeaderData {
    parentHash: BufferLike;
    number: BufferLike;
    incomingTransactionsIndex: BufferLike;
    incomingTransactionsCount: BufferLike;
    transactionsCount: BufferLike;
    transactionsRoot: BufferLike;
    stateRoot: BufferLike;
    exitsRoot: BufferLike;
    coinbase: BufferLike;
    timestamp: BufferLike;
}
/**
 * A block's data.
 */
export interface BlockData {
    header?: Buffer | PrefixedHexString | BufferLike[] | BlockHeaderData;
    transactions?: Array<Buffer | PrefixedHexString | BufferLike[] | TxData>;
}
export interface Blockchain {
    getBlock(hash: Buffer, callback: (err: Error | null, block?: Block) => void): void;
}
export interface BlockQuery {
    confirmed?: boolean;
    queryData?: BufferLike;
}
export interface SetCommittedInput {
    childIndex?: BufferLike;
    submittedAt?: BufferLike;
}
export interface ConfirmedBlockQuery {
    blockHash: BufferLike;
    blockNumber: BufferLike;
}
export interface CommitmentHeaderQuery {
    parentHash: string;
    childIndex: string | number;
    blockNumber: string | number;
    commitment?: CommitmentHeaderJson;
}
export interface CommitmentHeaderData {
    submittedAt: BufferLike;
    exitsRoot: BufferLike;
    coinbase: BufferLike;
    blockHash: BufferLike;
}
export interface CommitmentHeaderInput {
    parentHash?: BufferLike;
    childIndex?: BufferLike;
    blockNumber?: BufferLike;
    submittedAt?: BufferLike;
    exitsRoot?: BufferLike;
    coinbase?: BufferLike;
    blockHash?: BufferLike;
    block?: Block;
    header?: BlockHeader;
    query?: CommitmentHeaderQuery;
    commitment?: CommitmentHeaderData;
}
export declare type BlockHeaderJson = {
    parentHash: string;
    number: string;
    incomingTransactionsIndex: string;
    incomingTransactionsCount: string;
    transactionsCount: string;
    transactionsRoot: string;
    stateRoot: string;
    exitsRoot: string;
    coinbase: string;
    timestamp: string;
    commitment?: CommitmentHeaderJson;
};
export declare type BlockJson = {
    header: BlockHeaderJson;
    transactions: Array<IncomingTransactionJson | SignedTransactionJson>;
};
export declare type CommitmentHeaderJson = {
    isConfirmed?: boolean;
    parentHash?: string;
    childIndex?: string | number;
    blockNumber?: string | number;
    submittedAt: string | number;
    exitsRoot: string;
    coinbase: string;
    blockHash: string;
};
