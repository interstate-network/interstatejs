/// <reference types="node" />
import Blockchain from 'ethereumjs-blockchain';
import Common from 'ethereumjs-common';
import { StateManager } from './state';
import { RunCodeOpts } from './runCode';
import { RunCallOpts } from './runCall';
import { RunTxOpts, RunTxResult } from './runTx';
import { RunBlockOpts, RunBlockResult } from './runBlock';
import { EVMResult, ExecResult } from './evm/evm';
import { OpcodeList } from './evm/opcodes';
import SparseMerkleTree from '@interstatejs/sparse-merkle-tree';
declare const AsyncEventEmitter: any;
export * from './witness';
export * from './exceptions';
export interface VMOpts {
    chain?: string;
    hardfork?: string;
    stateManager?: StateManager;
    state?: SparseMerkleTree;
    blockchain?: Blockchain;
    activatePrecompiles?: boolean;
    allowUnlimitedContractSize?: boolean;
    produceWitness?: boolean;
    common?: Common;
}
export default class VM extends AsyncEventEmitter {
    opts: VMOpts;
    _common: Common;
    stateManager: StateManager;
    blockchain: Blockchain;
    relayAddress: Buffer;
    allowUnlimitedContractSize: boolean;
    produceWitness: boolean;
    _opcodes: OpcodeList;
    readonly _emit: (topic: string, data: any) => Promise<void>;
    static create(opts: VMOpts): Promise<VM>;
    constructor(opts?: VMOpts);
    runBlockchain(blockchain: any): Promise<void>;
    runBlock(opts: RunBlockOpts): Promise<RunBlockResult>;
    runTx(opts: RunTxOpts): Promise<RunTxResult>;
    runCall(opts: RunCallOpts): Promise<EVMResult>;
    runCode(opts: RunCodeOpts): Promise<ExecResult>;
}
