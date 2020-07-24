/// <reference types="bn.js" />
import { BN } from 'ethereumjs-util';
import AccessWitness from './accessWitness';
export declare const Log0WitnessAbi: {
    Log0Witness: {
        opcode: string;
        dataHash: string;
    };
};
export declare class Log0Witness implements AccessWitness {
    opcode: BN;
    dataHash: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => Log0Witness;
    constructor(dataHash: BN);
}
export declare const Log1WitnessAbi: {
    Log1Witness: {
        opcode: string;
        topic: string;
        dataHash: string;
    };
};
export declare class Log1Witness implements AccessWitness {
    opcode: BN;
    topic: BN;
    dataHash: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => Log1Witness;
    constructor(topic: BN, dataHash: BN);
}
export declare const Log2WitnessAbi: {
    Log2Witness: {
        opcode: string;
        topic0: string;
        topic1: string;
        dataHash: string;
    };
};
export declare class Log2Witness implements AccessWitness {
    opcode: BN;
    topic0: BN;
    topic1: BN;
    dataHash: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => Log2Witness;
    constructor(topic0: BN, topic1: BN, dataHash: BN);
}
export declare const Log3WitnessAbi: {
    Log3Witness: {
        opcode: string;
        topic0: string;
        topic1: string;
        topic2: string;
        dataHash: string;
    };
};
export declare class Log3Witness implements AccessWitness {
    opcode: BN;
    topic0: BN;
    topic1: BN;
    topic2: BN;
    dataHash: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => Log3Witness;
    constructor(topic0: BN, topic1: BN, topic2: BN, dataHash: BN);
}
export declare const Log4WitnessAbi: {
    Log4Witness: {
        opcode: string;
        topic0: string;
        topic1: string;
        topic2: string;
        topic3: string;
        dataHash: string;
    };
};
export declare class Log4Witness implements AccessWitness {
    opcode: BN;
    topic0: BN;
    topic1: BN;
    topic2: BN;
    topic3: BN;
    dataHash: BN;
    abiTypes: string[];
    get abiParams(): string[];
    encode: () => string;
    static decode: (data: string) => Log4Witness;
    constructor(topic0: BN, topic1: BN, topic2: BN, topic3: BN, dataHash: BN);
}
