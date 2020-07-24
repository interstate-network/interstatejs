/// <reference types="node" />
import { IncomingTransaction, UnionTransaction } from ".";
export declare function encodeABI(tx: IncomingTransaction | UnionTransaction): Buffer | string;
export declare function hashABI(tx: IncomingTransaction | UnionTransaction): Buffer;
