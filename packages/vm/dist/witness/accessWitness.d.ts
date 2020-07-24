/// <reference types="bn.js" />
/// <reference types="node" />
import { BN } from "ethereumjs-util";
export interface AbiEncodeable {
    abiTypes: String[];
    abiParams: any[];
}
export default interface AccessWitness {
    opcode: BN;
    stateRootLeave?: BN | undefined;
    encode: () => string;
}
export declare function abiObjectToArray(obj: any): any[];
export declare function encodeStruct(obj: any, abiDef: any): string;
export declare function encodeStructAsParameters(obj: any, abiDef: any): string;
declare type ValuesMap = {
    [key: string]: Buffer | BN | boolean | string | Array<string>;
};
export declare function convertAddress(addr: string): BN;
export declare function convertBytes32(b32: string): BN;
export declare function convertUint(val: string): BN;
export declare function decodeStructAsParameters(data: string, abiDef: any): ValuesMap;
export {};
