/// <reference types="node" />
import SparseMerkleTree, { BufferizedSparseInclusionProof } from '@interstatejs/sparse-merkle-tree';
import Common from 'ethereumjs-common';
import { StateTree, StorageTree } from "./proof-tree";
export declare type RootNode = {
    root: Buffer;
    length: number;
};
export declare type UpdateProof = {
    accountProof: string;
    storageProof: string;
    transactionProof: string;
};
export declare type RootNodeProof = {
    accountProof: string;
    storageProof: string;
};
export declare const encodeRootNode: ({ root, length }: RootNode) => Buffer;
export declare const decodeRootNode: (data: Buffer) => RootNode;
/**
 * Calculate the child relay address by taking the first 20 bytes of the
 * hash of the chain ID padded to 32 bytes.
 * @param common ethereum common for the chain
 */
export declare function getChildRelayAddressFromCommon(_common?: Common): Buffer;
export declare class ChildRelay {
    stateTree: StateTree;
    storageTree: StorageTree;
    transactionsTree: SparseMerkleTree;
    rootNode: RootNode;
    height: number;
    address: Buffer;
    get root(): Buffer;
    get length(): number;
    get rootKey(): Buffer;
    get stateRoot(): Buffer;
    protected constructor(stateTree: StateTree, storageTree: StorageTree, transactionsTree: SparseMerkleTree, rootNode: RootNode, height: number, address: Buffer);
    static create(stateTree: StateTree, address: Buffer, height: number): Promise<ChildRelay>;
    getRootProof(): Promise<RootNodeProof>;
    getUpdateProof(): Promise<UpdateProof>;
    protected updateRootNode(): Promise<void>;
    insert(transaction: Buffer): Promise<void>;
    getTransaction(index: number): Promise<Buffer>;
    getTransactionProof(index: number): Promise<BufferizedSparseInclusionProof>;
}
