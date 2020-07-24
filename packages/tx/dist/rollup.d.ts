/// <reference types="node" />
import Transaction from './transaction';
export declare function encodeRollupTransaction(tx: Transaction, outputRoot: Buffer): Buffer;
export declare function encodeRollup(tx: Transaction, stateRoot: Buffer): Buffer;
