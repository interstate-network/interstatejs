/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from "ethereumjs-util";
export declare const outgoingTransactionParams: string[];
export declare type OutgoingTransactionOptions = {
    from: Buffer;
    to: Buffer;
    gasLimit?: BN;
    value: BN;
    data?: Buffer;
    bounty?: BN;
};
export declare function outgoingTransactionFromCallInputs(fullCalldata: Buffer, caller: Buffer, value: BN, gas: BN): OutgoingTransaction;
export declare class OutgoingTransaction {
    from: Buffer;
    to: Buffer;
    gasLimit: BN;
    value: BN;
    data: Buffer;
    bounty: BN;
    constructor(opts: OutgoingTransactionOptions);
    encode(): string;
    gasFee(): BN;
}
