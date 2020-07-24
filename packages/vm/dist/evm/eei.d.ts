/// <reference types="node" />
import BN = require('bn.js');
import Account from '@interstatejs/account';
import Blockchain from 'ethereumjs-blockchain';
import Common from 'ethereumjs-common';
import { StateManager } from '../state';
import Message from './message';
import EVM from './evm';
import MessageWitness from '../witness/message';
export interface Env {
    blockchain: Blockchain;
    address: Buffer;
    caller: Buffer;
    callData: Buffer;
    callValue: BN;
    code: Buffer;
    isStatic: boolean;
    depth: number;
    gasPrice: Buffer;
    origin: Buffer;
    block: any;
    contract: Account;
}
export interface RunResult {
    logs: any;
    returnValue?: Buffer;
    gasRefund: BN;
    selfdestruct: {
        [k: string]: Buffer;
    };
    messageWitnesses?: MessageWitness[];
}
export default class EEI {
    _env: Env;
    _result: RunResult;
    _state: StateManager;
    _evm: EVM;
    _lastReturned: Buffer;
    _lastCallGasUsed: BN;
    _common: Common;
    _gasLeft: BN;
    _produceWitness?: boolean;
    constructor(env: Env, state: StateManager, evm: EVM, common: Common, gasLeft: BN);
    isPermittedCallTarget(address: Buffer, isStatic: boolean): Promise<boolean>;
    useGas(amount: BN): void;
    refundGas(amount: BN): void;
    subRefund(amount: BN): void;
    getAddress(): Buffer;
    getExternalBalance(address: Buffer): Promise<BN>;
    getSelfBalance(): BN;
    getCaller(): BN;
    getCallValue(): BN;
    getCallData(): Buffer;
    getCallDataSize(): BN;
    getCodeSize(): BN;
    getCode(): Buffer;
    isStatic(): boolean;
    getExternalCodeSize(address: BN): Promise<BN>;
    getExternalCode(address: BN | Buffer): Promise<Buffer>;
    getReturnDataSize(): BN;
    getReturnData(): Buffer;
    getTxGasPrice(): BN;
    getTxOrigin(): BN;
    getBlockNumber(): BN;
    getBlockCoinbase(): BN;
    getBlockTimestamp(): BN;
    getBlockDifficulty(): BN;
    getBlockGasLimit(): BN;
    getChainId(): BN;
    getBlockHash(num: BN): Promise<BN>;
    storageStore(key: Buffer, value: Buffer): Promise<void>;
    storageLoad(key: Buffer): Promise<Buffer>;
    getGasLeft(): BN;
    finish(returnData: Buffer): void;
    revert(returnData: Buffer): void;
    selfDestruct(toAddress: Buffer): Promise<void>;
    _selfDestruct(toAddress: Buffer): Promise<void>;
    log(data: Buffer, numberOfTopics: number, topics: Buffer[]): void;
    call(gasLimit: BN, address: Buffer, value: BN, data: Buffer): Promise<BN>;
    callCode(gasLimit: BN, address: Buffer, value: BN, data: Buffer): Promise<BN>;
    callStatic(gasLimit: BN, address: Buffer, value: BN, data: Buffer): Promise<BN>;
    callDelegate(gasLimit: BN, address: Buffer, value: BN, data: Buffer): Promise<BN>;
    _baseCall(msg: Message): Promise<BN>;
    isAccountEmpty(address: Buffer): Promise<boolean>;
    private _getReturnCode;
}
