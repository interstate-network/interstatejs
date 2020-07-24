/// <reference types="node" />
import SparseMerkleTree, { DBType, BufferizedSparseInclusionProof } from '@interstatejs/sparse-merkle-tree';
import Account from '@interstatejs/account';
import { BufferLike } from './to';
/**
 * This structure is not very efficient.
 * We could probably improve it by using the RLP length for
 * serialized accounts to locate the beginning of the siblings
 * array, and slicing the first 32 bytes for storage proofs.
 */
export declare const SparseMerkleProofABI: {
    StateProof: {
        inclusionBits: string;
        value: string;
        siblings: string;
    };
};
export declare function encodeSparseMerkleProof(proof: BufferizedSparseInclusionProof): string;
export declare class StateTree {
    _tree: SparseMerkleTree;
    get root(): Buffer;
    constructor(_tree: SparseMerkleTree);
    checkpoint(): void;
    commit(): Promise<void>;
    revert(): Promise<void>;
    static create(db?: DBType, rootHash?: Buffer): Promise<StateTree>;
    isContract(address: BufferLike): Promise<boolean>;
    getAccount(_address: BufferLike): Promise<Account>;
    getAccountCode(address: BufferLike): Promise<Buffer>;
    putAccountCode(_address: BufferLike, _code: BufferLike): Promise<void>;
    putAccount(_address: BufferLike, account: Account): Promise<void>;
    getAccountProof(_address: BufferLike): Promise<string>;
    getAccountStorageTrie(_address: BufferLike): Promise<StorageTree>;
    getAccountStorageProof(address: BufferLike, key: BufferLike): Promise<{
        value: Buffer;
        proof: string;
    }>;
}
export declare class StorageTree {
    _tree: SparseMerkleTree;
    get root(): Buffer;
    constructor(_tree: SparseMerkleTree);
    get(key: BufferLike): Promise<Buffer>;
    put(key: BufferLike, value: BufferLike): Promise<void>;
    prove(key: BufferLike): Promise<string>;
}
