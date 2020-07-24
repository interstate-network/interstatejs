/// <reference types="node" />
import Account from '@interstatejs/account';
import SparseMerkleTree from '@interstatejs/sparse-merkle-tree';
export default class Cache {
    _cache: any;
    _checkpoints: any[];
    _tree: SparseMerkleTree;
    constructor(tree: SparseMerkleTree);
    put(key: Buffer, val: Account, fromTree?: boolean): void;
    get(key: Buffer): Account;
    lookup(key: Buffer): Account | undefined;
    _lookupAccount(address: Buffer): Promise<Account>;
    getOrLoad(key: Buffer): Promise<Account>;
    warm(addresses: string[]): Promise<void>;
    flush(): Promise<void>;
    checkpoint(): void;
    revert(): void;
    commit(): void;
    clear(): void;
    del(key: Buffer): void;
    _update(key: Buffer, val: Account, modified: boolean, deleted: boolean): void;
}
