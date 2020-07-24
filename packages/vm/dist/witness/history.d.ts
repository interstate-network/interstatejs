/// <reference types="bn.js" />
import { BN } from "ethereumjs-util";
import AccessWitness from './accessWitness';
export declare const BlockHashWitnessAbi: {
    BlockHashWitness: {
        opcode: string;
        number: string;
        hash: string;
    };
};
export declare class BlockHashWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    number: BN;
    hash: BN;
    encode: () => string;
    static decode: (data: string) => BlockHashWitness;
    abiTypes: string[];
    get abiParams(): string[];
    constructor(number: BN, hash: BN);
}
