/// <reference types="bn.js" />
/// <reference types="node" />
import { BN } from "ethereumjs-util";
import AccessWitness from './accessWitness';
import { BufferLike } from "@interstatejs/tx";
export declare enum Status {
    exception = 0,
    success = 1,
    revert = 2
}
export declare function abiDecode(types: string[], data: BufferLike): any;
export declare const MessageWitnessAbi: {
    MessageWitness: {
        stateRootEnter: string;
        stateRootLeave: string;
        isStatic: string;
        origin: string;
        caller: string;
        to: string;
        context: string;
        callvalue: string;
        gasPrice: string;
        gasAvailable: string;
        gasUsed: string;
        refund: string;
        state_access_list: string;
        status: string;
        returndataHash: string;
        calldata: string;
    };
};
export declare function decodeAccessRecord(bytes: string): AccessWitness;
export declare function decodeMessageWitness(data: string): MessageWitness;
export declare class MessageWitness {
    stateRootEnter: BN;
    stateRootLeave: BN;
    isStatic: boolean;
    origin: BN;
    caller: BN;
    to: BN;
    context: BN;
    callvalue: BN;
    gasPrice: BN;
    gasAvailable: BN;
    gasUsed: BN;
    refund: BN;
    state_access_list: AccessWitness[];
    status: Status | undefined;
    returndataHash: BN;
    calldata: Buffer;
    abiTypes: String[];
    get abiTuple(): void;
    encode(): string;
    constructor(stateRootEnter: BN, stateRootLeave: BN, isStatic: boolean, origin: BN, caller: BN, to: BN, context: BN, callvalue: BN, gasPrice: BN, gasAvailable: BN, gasUsed: BN, refund: BN, returndataHash: BN, calldata: Buffer);
}
export default MessageWitness;
