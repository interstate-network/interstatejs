/// <reference types="node" />
import { Blockchain, BlockHeaderData, BufferLike, ChainOptions, PrefixedHexString, SetCommittedInput, ConfirmedBlockQuery, BlockHeaderJson } from './types';
import { CommitmentHeader } from './commitment';
import { ABI_Encoder } from './abi';
/**
 * An object that represents the block header
 */
export declare class BlockHeader implements ABI_Encoder<BlockHeader> {
    private _commitment;
    raw: Buffer[];
    parentHash: Buffer;
    number: Buffer;
    incomingTransactionsIndex: Buffer;
    incomingTransactionsCount: Buffer;
    transactionsCount: Buffer;
    transactionsRoot: Buffer;
    stateRoot: Buffer;
    exitsRoot: Buffer;
    coinbase: Buffer;
    timestamp: Buffer;
    private readonly _common;
    get encodedLength(): number;
    static decodeABI: (_encoded: import("@interstatejs/tx").BufferLike) => BlockHeader;
    /**
     * Creates a new block header.
     * @param data - The data of the block header.
     * @param opts - The network options for this block, and its header, uncle headers and txs.
     */
    constructor(data?: Buffer | PrefixedHexString | BufferLike[] | BlockHeaderData, opts?: ChainOptions);
    /**
     * Validates the gasLimit.
     *
     * @param parentBlock - this block's parent
     */
    get commitment(): CommitmentHeader;
    toConfirmedBlockQuery(): ConfirmedBlockQuery;
    toCommitment(commitData: SetCommittedInput): CommitmentHeader;
    /**
     * Validates the entire block header, throwing if invalid.
     *
     * @param blockchain - the blockchain that this block is validating against
     */
    validate(blockchain: Blockchain): Promise<void>;
    /**
     * Returns the hash of the block header.
     */
    hash(): Buffer;
    /**
     * Checks if the block header is a genesis header.
     */
    isGenesis(): boolean;
    /**
     * Turns the header into the canonical genesis block header.
     */
    setGenesisParams(): void;
    /**
     * Returns the rlp encoding of the block header
     */
    serialize(): Buffer;
    encodeJSON(): BlockHeaderJson;
    /**
     * Returns the block header in JSON format
     *
     * @see {@link https://github.com/ethereumjs/ethereumjs-util/blob/master/docs/index.md#defineproperties|ethereumjs-util}
     */
    toJSON(_labels?: boolean): {
        [key: string]: string;
    } | string[];
    private _getHardfork;
    private _getBlockByHash;
}
export interface BlockHeader {
    encodeABI: () => BufferLike;
    decodeABI: (input: BufferLike) => BlockHeader;
}
