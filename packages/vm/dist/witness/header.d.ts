/// <reference types="bn.js" />
import { BN } from "ethereumjs-util";
import AccessWitness from './accessWitness';
export declare const CoinbaseWitnessAbi: {
    CoinbaseWitness: {
        opcode: string;
        coinbase: string;
    };
};
export declare class CoinbaseWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    coinbase: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => CoinbaseWitness;
    constructor(coinbase: BN);
}
export declare const TimestampWitnessAbi: {
    TimestampWitness: {
        opcode: string;
        timestamp: string;
    };
};
export declare class TimestampWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    timestamp: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => TimestampWitness;
    constructor(timestamp: BN);
}
export declare const NumberWitnessAbi: {
    NumberWitness: {
        opcode: string;
        number: string;
    };
};
export declare class NumberWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    number: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => NumberWitness;
    constructor(number: BN);
}
export declare const DifficultyWitnessAbi: {
    DifficultyWitness: {
        opcode: string;
        difficulty: string;
    };
};
export declare class DifficultyWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    difficulty: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => DifficultyWitness;
    constructor(difficulty: BN);
}
export declare const GaslimitWitnessAbi: {
    GaslimitWitness: {
        opcode: string;
        gaslimit: string;
    };
};
export declare class GaslimitWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    gaslimit: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => GaslimitWitness;
    constructor(gaslimit: BN);
}
export declare const ChainidWitnessAbi: {
    ChainidWitness: {
        opcode: string;
        chainId: string;
    };
};
export declare class ChainidWitness implements AccessWitness {
    opcode: BN;
    stateRootLeave: undefined;
    chainId: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => ChainidWitness;
    constructor(chainId: BN);
}
