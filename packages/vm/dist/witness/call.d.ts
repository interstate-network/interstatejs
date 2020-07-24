/// <reference types="bn.js" />
/// <reference types="node" />
import { BN } from "ethereumjs-util";
import AccessWitness from './accessWitness';
export declare const CallWitnessAbi: {
    CallWitness: {
        opcode: string;
        stateRootLeave: string;
        gas: string;
        gasUsed: string;
        gasRefund: string;
        address: string;
        value: string;
        calldataHash: string;
        success: string;
        returndata: string;
    };
};
export declare class CallWitness implements AccessWitness {
    stateRootLeave: BN;
    gas: BN;
    gasUsed: BN;
    gasRefund: BN;
    address: BN;
    value: BN;
    calldataHash: BN;
    success: Boolean;
    returndata: Buffer;
    calldata?: Buffer;
    opcode: BN;
    static _abiTypes: string[];
    get abiTypes(): string[];
    get abiParams(): (string | Boolean)[];
    encode: () => string;
    static decode: (data: string) => CallWitness;
    constructor(stateRootLeave: BN, gas: BN, gasUsed: BN, gasRefund: BN, address: BN, value: BN, calldataHash: BN, success: Boolean, returndata: Buffer, calldata?: Buffer);
}
export declare class CallCodeWitness extends CallWitness {
    opcode: BN;
    static decode: (data: string) => CallCodeWitness;
}
export declare const DelegateCallWitnessAbi: {
    DelegateCallWitness: {
        opcode: string;
        stateRootLeave: string;
        gas: string;
        gasUsed: string;
        gasRefund: string;
        address: string;
        calldataHash: string;
        success: string;
        returndata: string;
    };
};
export declare class DelegateCallWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: BN;
    gas: BN;
    gasUsed: BN;
    gasRefund: BN;
    address: BN;
    calldataHash: BN;
    success: Boolean;
    returndata: Buffer;
    static _abiTypes: string[];
    get abiTypes(): string[];
    get abiParams(): (string | Boolean)[];
    encode: () => string;
    static decode: (data: string) => DelegateCallWitness;
    constructor(stateRootLeave: BN, gas: BN, gasUsed: BN, gasRefund: BN, address: BN, calldataHash: BN, success: Boolean, returndata: Buffer);
}
export declare const StaticCallWitnessAbi: {
    StaticCallWitness: {
        opcode: string;
        gas: string;
        gasUsed: string;
        address: string;
        calldataHash: string;
        success: string;
        returndata: string;
    };
};
export declare class StaticCallWitness implements AccessWitness {
    gas: BN;
    gasUsed: BN;
    address: BN;
    calldataHash: BN;
    success: Boolean;
    returndata: Buffer;
    calldata?: Buffer;
    opcode: BN;
    static _abiTypes: string[];
    get abiTypes(): string[];
    get abiParams(): (string | Boolean)[];
    encode: () => string;
    static decode: (data: string) => StaticCallWitness;
    constructor(gas: BN, gasUsed: BN, address: BN, calldataHash: BN, success: Boolean, returndata: Buffer, calldata?: Buffer);
}
