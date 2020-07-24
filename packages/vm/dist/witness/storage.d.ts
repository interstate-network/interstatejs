/// <reference types="bn.js" />
import { BN } from "ethereumjs-util";
import AccessWitness from './accessWitness';
export declare const SloadWitnessAbi: {
    SloadWitness: {
        opcode: string;
        slot: string;
        value: string;
    };
};
export declare class SloadWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    slot: BN;
    value: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => SloadWitness;
    constructor(slot: BN, value: BN);
}
export declare const SstoreWitnessAbi: {
    SstoreWitness: {
        opcode: string;
        stateRootLeave: string;
        slot: string;
        value: string;
        refund: string;
    };
};
export declare class SstoreWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: BN;
    slot: BN;
    value: BN;
    refund: BN;
    encode: () => string;
    static decode: (data: string) => SstoreWitness;
    abiTypes: string[];
    get abiParams(): string[];
    constructor(stateRootLeave: BN, slot: BN, value: BN, refund: BN);
}
