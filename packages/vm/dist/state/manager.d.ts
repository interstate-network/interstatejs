/// <reference types="node" />
import SparseMerkleTree from '@interstatejs/sparse-merkle-tree';
import Account from '@interstatejs/account';
import Common from 'ethereumjs-common';
import { ChildRelay } from '@interstatejs/utils';
import { StateManager } from './interface';
import { StateTree } from '@interstatejs/utils';
export interface DefaultStateManagerOpts {
    common?: Common;
    tree: SparseMerkleTree;
}
export default class DefaultStateManager implements StateManager {
    relayAddress: Buffer;
    _common: Common;
    _tree: StateTree;
    _storageTries: any;
    _childRelay?: ChildRelay;
    _touched: Set<string>;
    _touchedStack: Set<string>[];
    _checkpointCount: number;
    _originalStorageCache: Map<string, Map<string, Buffer>>;
    constructor(opts: DefaultStateManagerOpts);
    forceGetStateRoot(): Promise<Buffer>;
    getChildRelay(blockNumber: number): Promise<ChildRelay>;
    getExitsRoot(blockNumber: number): Promise<Buffer>;
    isContract(address: Buffer): Promise<boolean>;
    getAccount(address: Buffer): Promise<Account>;
    putAccount(address: Buffer, account: Account): Promise<void>;
    touchAccount(address: Buffer): void;
    putContractCode(address: Buffer, value: Buffer): Promise<void>;
    getContractCode(address: Buffer): Promise<Buffer>;
    _lookupStorageTrie(address: Buffer): Promise<SparseMerkleTree>;
    _getStorageTrie(address: Buffer): Promise<SparseMerkleTree>;
    getContractStorage(address: Buffer, key: Buffer): Promise<Buffer>;
    getOriginalContractStorage(address: Buffer, key: Buffer): Promise<Buffer>;
    _clearOriginalStorageCache(): void;
    _modifyContractStorage(address: Buffer, modifyTrie: (storageTrie: SparseMerkleTree, done: Function) => void): Promise<void>;
    putContractStorage(address: Buffer, key: Buffer, value: Buffer): Promise<void>;
    clearContractStorage(address: Buffer): Promise<void>;
    checkpoint(): Promise<void>;
    commit(): Promise<void>;
    revert(): Promise<void>;
    getStateRoot(): Promise<Buffer>;
    setStateRoot(stateRoot: Buffer): Promise<void>;
    hasGenesisState(): Promise<boolean>;
    generateCanonicalGenesis(): Promise<void>;
    generateGenesis(initState: any): Promise<void>;
    accountIsEmpty(address: Buffer): Promise<boolean>;
    cleanupTouchedAccounts(): Promise<void>;
}
