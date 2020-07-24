/// <reference types="node" />
import Account from '@interstatejs/account';
import { ChildRelay } from '@interstatejs/utils';
export interface StorageDump {
    [key: string]: string;
}
export interface StateManager {
    relayAddress: Buffer;
    isContract(address: Buffer): Promise<boolean>;
    getChildRelay(blockNumber: number): Promise<ChildRelay>;
    getExitsRoot(blockNumber: number): Promise<Buffer>;
    getAccount(address: Buffer): Promise<Account>;
    putAccount(address: Buffer, account: Account): Promise<void>;
    touchAccount(address: Buffer): void;
    putContractCode(address: Buffer, value: Buffer): Promise<void>;
    getContractCode(address: Buffer): Promise<Buffer>;
    getContractStorage(address: Buffer, key: Buffer): Promise<Buffer>;
    getOriginalContractStorage(address: Buffer, key: Buffer): Promise<Buffer>;
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
