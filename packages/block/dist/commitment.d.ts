/// <reference types="node" />
import { BufferLike, CommitmentHeaderQuery, CommitmentHeaderInput, CommitmentHeaderData, CommitmentHeaderJson } from './types';
export declare class CommitmentHeader {
    parentHash?: BufferLike;
    childIndex?: BufferLike;
    blockNumber?: BufferLike;
    submittedAt: Buffer;
    exitsRoot: Buffer;
    coinbase: Buffer;
    blockHash: Buffer;
    isConfirmed: boolean;
    encodeABI?: () => BufferLike;
    static decodeABI?: (input: BufferLike) => CommitmentHeader;
    constructor(options: CommitmentHeaderInput);
    hash(): Buffer;
    encodeJSON(): CommitmentHeaderJson;
    get commitment(): CommitmentHeaderData;
    set commitment(commitment: CommitmentHeaderData);
    get query(): CommitmentHeaderQuery;
    set query(_query: CommitmentHeaderQuery);
}
