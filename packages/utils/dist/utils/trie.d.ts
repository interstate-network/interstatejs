/// <reference types="node" />
import Account from 'ethereumjs-account';
declare const Trie: any;
import { BufferLike } from './to';
export { Trie };
export declare class TrieWrapper {
    lib: any;
    trie: any;
    constructor(trie?: any);
    static fromDB(db: any, rootHash?: Buffer): TrieWrapper;
    get root(): Buffer;
    get: (key: BufferLike) => Promise<Buffer>;
    put: (key: BufferLike, val: BufferLike) => any;
    del: (key: BufferLike) => Promise<void>;
    prove: (key: BufferLike) => Promise<string>;
    checkpoint: () => void;
    commit: () => Promise<void>;
    revert: () => Promise<void>;
}
export declare class StorageTrie extends TrieWrapper {
    get: (key: BufferLike) => Promise<Buffer>;
    put: (key: BufferLike, value: BufferLike) => Promise<string>;
    prove: (key: BufferLike) => Promise<string>;
}
export declare class StateTrie extends TrieWrapper {
    getAccount(address: BufferLike): Promise<Account>;
    static fromDB(db: any, rootHash?: Buffer): StateTrie;
    getAccountCode(address: BufferLike): Promise<Buffer>;
    putAccount(address: BufferLike, account: Account): Promise<void>;
    getAccountProof(address: BufferLike): Promise<string>;
    getAccountStorageTrie(address: BufferLike): Promise<StorageTrie>;
    getAccountStorageProof(address: BufferLike, key: BufferLike): Promise<{
        value: Buffer;
        proof: string;
    }>;
}
