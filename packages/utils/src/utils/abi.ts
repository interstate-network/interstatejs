// import { AbiInput, AbiItem } from 'web3-utils';
import 'web3-eth-abi'
import { BufferLike } from './to';

export type JsonValue = boolean | string | number | Array<JsonValue> | { [key: string]: JsonValue };

/**
 * Type definition for input values to encodeABI()
 */
export type AbiCoderInput = boolean | BufferLike | Array<JsonValue> | { [key: string]: JsonValue };

/**
 * Type definition for the return value of encodeABI()
 */
export type AbiEncodeOutput = string;


// export type AbiInput = BufferLike 
// export type AbiEncodeInput = JsonValue | 

// export type AbiJsonOutput = 

export function decodeAbi(data: BufferLike) {

}