/// <reference types="node" />
import * as BN from 'bn.js';
import MessageWitness from './message';
export declare function commitmentsFromWitnesses(witnesses: MessageWitness[]): WitnessCommitment[];
export declare class WitnessCommitment {
    callDepthIndex: number[];
    stateRootEnter: BN;
    stateRootLeave: BN;
    witnessHash: Buffer;
    constructor(callDepthIndex: number[], stateRootEnter: BN, stateRootLeave: BN, witnessHash: Buffer);
}
