/// <reference types="node" />
import { BlockHeader } from './header';
import { BlockData, BufferLike, ChainOptions, BlockJson } from './types';
import { OutgoingTransaction, Transaction } from '@interstatejs/tx';
import { ABI_Encoder } from './abi';
/**
 * An object that represents the block
 */
export declare class Block implements ABI_Encoder<Block> {
    readonly header: BlockHeader;
    readonly transactions: Transaction[];
    outgoingTransactions: OutgoingTransaction[];
    submittedAt?: number | null;
    childIndex?: number | null;
    private readonly _common;
    static decodeABI: (_encoded: import("@interstatejs/tx").BufferLike) => Block;
    /**
     * Creates a new block object
     *
     * @param data - The block's data.
     * @param opts - The network options for this block, and its header, uncle headers and txs.
     */
    constructor(data?: Buffer | [Buffer[], Buffer[]] | BlockData | BlockJson, opts?: ChainOptions);
    get raw(): [Buffer[], Buffer[], Buffer[]];
    /**
     * Produces a serialization of the block.
     *
     * @param rlpEncode - If `true`, the returned object is the RLP encoded data as seen by the
     * Ethereum wire protocol. If `false`, a tuple with the raw data of the header, the txs and the
     * uncle headers is returned.
     */
    serialize(): Buffer;
    serialize(rlpEncode: true): Buffer;
    serialize(rlpEncode: false): [Buffer[], Buffer[], Buffer[]];
    /**
     * Validates the transactions
     *
     * @param stringError - If `true`, a string with the indices of the invalid txs is returned.
     */
    validateTransactions(): boolean;
    validateTransactions(stringError: false): boolean;
    validateTransactions(stringError: true): string;
    setStateRoot(): void;
    setTransactionCounts(): void;
    setOutputs(): void;
}
export interface Block {
    raw: [Buffer[], Buffer[], Buffer[]];
    hash(): Buffer;
    isGenesis(): boolean;
    setGenesisParams(): void;
    serialize(): Buffer;
    serialize(rlpEncode: true): Buffer;
    serialize(rlpEncode: false): [Buffer[], Buffer[], Buffer[]];
    validateTransactions(): boolean;
    validateTransactions(stringError: false): boolean;
    validateTransactions(stringError: true): string;
    encodeABI: () => BufferLike;
    decodeABI: (input: BufferLike) => Block;
    encodeJSON(): BlockJson;
    toJSON(): BlockJson;
    setTransactionsRoot(): void;
    proveTransaction(index: number): Array<BufferLike>;
}
