/// <reference types="node" />
export declare function getMerkleRoot(leaves: Buffer[]): Buffer;
export declare type MerkleProof = {
    root: Buffer;
    siblings: Buffer[];
};
export declare function getMerkleProof(leaves: Buffer[], index: number): MerkleProof;
export declare class MerkleTree {
    leaves: Buffer[];
    constructor(leaves: Buffer[]);
    get rootHash(): Buffer;
    get(index: number): Buffer;
    put(index: number, value: Buffer): void;
    prove(index: number): MerkleProof;
}
