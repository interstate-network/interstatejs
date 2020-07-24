import 'web3-eth-abi';
import { BufferLike } from './to';
export declare type JsonValue = boolean | string | number | Array<JsonValue> | {
    [key: string]: JsonValue;
};
/**
 * Type definition for input values to encodeABI()
 */
export declare type AbiCoderInput = boolean | BufferLike | Array<JsonValue> | {
    [key: string]: JsonValue;
};
/**
 * Type definition for the return value of encodeABI()
 */
export declare type AbiEncodeOutput = string;
export declare function decodeAbi(data: BufferLike): void;
