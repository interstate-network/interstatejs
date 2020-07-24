export declare type AbiBaseType = 'uint256' | 'address' | 'bool' | 'bytes' | 'bytes32';
interface AbiDef {
    [key: string]: AbiBaseType;
}
interface AbiMetaDef {
    [key: string]: AbiDef;
}
export declare type ArrayJoinInput<T = string> = Array<ArrayJoinInput<T>> | Array<T> | T;
export declare function joinArr(arr: ArrayJoinInput): string;
export declare function generateStructDecoderWithParameters(abiMetaDef: AbiMetaDef): string;
export {};
