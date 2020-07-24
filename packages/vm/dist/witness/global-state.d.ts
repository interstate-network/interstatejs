/// <reference types="bn.js" />
import { BN } from "ethereumjs-util";
import AccessWitness from './accessWitness';
export declare const BalanceWitnessAbi: {
    BalanceWitness: {
        opcode: string;
        address: string;
        balance: string;
    };
};
export declare class BalanceWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    address: BN;
    balance: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => BalanceWitness;
    constructor(address: BN, balance: BN);
}
export declare const SelfBalanceWitnessAbi: {
    SelfBalanceWitness: {
        opcode: string;
        selfBalance: string;
    };
};
export declare class SelfBalanceWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    selfBalance: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => SelfBalanceWitness;
    constructor(selfBalance: BN);
}
export declare const ExtCodeHashWitnessAbi: {
    ExtCodeHashWitness: {
        opcode: string;
        address: string;
        hash: string;
    };
};
export declare class ExtCodeHashWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    address: BN;
    hash: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => ExtCodeHashWitness;
    constructor(address: BN, hash: BN);
}
export declare const ExtCodeSizeWitnessAbi: {
    ExtCodeSizeWitness: {
        opcode: string;
        address: string;
        size: string;
    };
};
export declare class ExtCodeSizeWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    address: BN;
    size: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => ExtCodeSizeWitness;
    constructor(address: BN, size: BN);
}
export declare const ExtCodeCopyWitnessAbi: {
    ExtCodeCopyWitness: {
        opcode: string;
        address: string;
        exists: string;
    };
};
export declare class ExtCodeCopyWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    address: BN;
    exists: Boolean;
    abiTypes: string[];
    get abiParams(): (string | Boolean)[];
    encode: () => string;
    static decode: (data: string) => ExtCodeCopyWitness;
    constructor(address: BN, exists: Boolean);
}
