/// <reference types="node" />
import BN = require('bn.js');
import Common from 'ethereumjs-common';
import { StateManager } from '../state';
import { VmError } from '../exceptions';
import Memory from './memory';
import Stack from './stack';
import EEI from './eei';
import { Opcode } from './opcodes';
import { OpHandler } from './opFns';
import Account from '@interstatejs/account';
import AccessWitness from '../witness/accessWitness';
export interface InterpreterOpts {
    pc?: number;
}
export interface RunState {
    programCounter: number;
    opCode: number;
    memory: Memory;
    memoryWordCount: BN;
    highestMemCost: BN;
    stack: Stack;
    code: Buffer;
    validJumps: number[];
    _common: Common;
    stateManager: StateManager;
    eei: EEI;
    state_access_list?: AccessWitness[];
    produceWitness?: boolean;
}
export interface InterpreterResult {
    runState?: RunState;
    exceptionError?: VmError;
}
export interface InterpreterStep {
    gasLeft: BN;
    stateManager: StateManager;
    stack: BN[];
    pc: number;
    depth: number;
    address: Buffer;
    memory: number[];
    memoryWordCount: BN;
    opcode: Opcode;
    account: Account;
}
export default class Interpreter {
    _vm: any;
    _state: StateManager;
    _runState: RunState;
    _eei: EEI;
    constructor(vm: any, eei: EEI);
    run(code: Buffer, opts?: InterpreterOpts): Promise<InterpreterResult>;
    runStep(): Promise<void>;
    getOpHandler(opInfo: Opcode): OpHandler;
    lookupOpInfo(op: number, full?: boolean): Opcode;
    _runStepHook(): Promise<void>;
    _getValidJumpDests(code: Buffer): number[];
}
