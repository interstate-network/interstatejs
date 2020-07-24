/// <reference types="node" />
import BN = require('bn.js');
import Account from '@interstatejs/account';
import { Block } from '@interstatejs/block';
import { VmError } from '../exceptions';
import { PrecompileFunc } from './precompiles';
import TxContext from './txContext';
import Message from './message';
import MessageWitness from '../witness/message';
import { InterpreterOpts, RunState } from './interpreter';
import { StateManager } from '../state';
export interface EVMResult {
    gasUsed: BN;
    createdAddress?: Buffer;
    execResult: ExecResult;
    witness?: MessageWitness | undefined;
}
export interface ExecResult {
    runState?: RunState;
    exceptionError?: VmError;
    gas?: BN;
    gasUsed: BN;
    returnValue: Buffer;
    logs?: any[];
    gasRefund?: BN;
    selfdestruct?: {
        [k: string]: Buffer;
    };
    witnesses?: MessageWitness[];
}
export interface NewContractEvent {
    address: Buffer;
    code: Buffer;
}
export declare function OOGResult(gasLimit: BN): ExecResult;
export default class EVM {
    _vm: any;
    _state: StateManager;
    _tx: TxContext;
    _block: Block;
    _produceWitness?: boolean;
    constructor(vm: any, txContext: TxContext, block: Block);
    executeMessage(message: Message): Promise<EVMResult>;
    _executeExitCall(message: Message): Promise<EVMResult>;
    _executeCall(message: Message): Promise<EVMResult>;
    _executeCreate(message: Message): Promise<EVMResult>;
    runInterpreter(message: Message, opts?: InterpreterOpts): Promise<ExecResult>;
    getPrecompile(address: Buffer): PrecompileFunc;
    runPrecompile(code: PrecompileFunc, data: Buffer, gasLimit: BN): ExecResult;
    isCompiled(address: Buffer): Promise<boolean>;
    _loadCode(message: Message): Promise<void>;
    _generateAddress(message: Message): Promise<Buffer>;
    _reduceSenderBalance(account: Account, message: Message): Promise<void>;
    _addToBalance(toAccount: Account, message: Message): Promise<void>;
    _touchAccount(address: Buffer): Promise<void>;
}
