/// <reference types="node" />
import BN from 'bn.js';
import { setLengthLeft } from 'ethereumjs-util';
export declare type BufferLike = string | number | Buffer | BN | {
    toBuffer(): Buffer;
};
export declare const isHex: (str: string) => boolean;
export declare const toBn: (value: BufferLike) => BN;
export declare const toInt: (value: BufferLike) => number;
export declare const toHex: (value: BufferLike) => string;
export declare const toBuf: (value: BufferLike, length?: number) => Buffer;
export declare const toBuf32: (value: BufferLike) => Buffer;
export declare const toNonPrefixed: (str: string) => string;
export declare const toPrefixed: (str: string) => string;
export declare const sliceBuffer: (buf: Buffer, index: number, length?: number) => Buffer;
export declare const copyBuffer: (buf: Buffer) => Buffer;
export { setLengthLeft };
