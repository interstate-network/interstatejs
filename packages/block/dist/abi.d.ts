import { BufferLike } from "@interstatejs/tx";
export interface ABI_Encoder<T> {
    encodeABI: () => BufferLike;
    decodeABI: (input: BufferLike) => T;
}
declare type AbiObj = {
    [key: string]: string | AbiObj;
};
declare type Constructor<T> = new (args: any) => T;
export interface ABI_Encoder<T> {
    encodeABI: () => BufferLike;
    decodeABI: (input: BufferLike) => T;
}
export declare function setEncodeABI<T>(_abi: AbiObj, obj: any): void;
export declare function getDecodeABI<T>(_abi: AbiObj, _constructor: Constructor<T>): (_encoded: BufferLike) => T;
export declare const HeaderABI: {
    ISO_Header: {
        parentHash: string;
        number: string;
        incomingTransactionsIndex: string;
        incomingTransactionsCount: string;
        transactionsCount: string;
        transactionsRoot: string;
        stateRoot: string;
        exitsRoot: string;
        coinbase: string;
        timestamp: string;
    };
};
export declare const BlockABI: {
    ISO_Block: {
        header: {
            parentHash: string;
            number: string;
            incomingTransactionsIndex: string;
            incomingTransactionsCount: string;
            transactionsCount: string;
            transactionsRoot: string;
            stateRoot: string;
            exitsRoot: string;
            coinbase: string;
            timestamp: string;
        };
        transactions: string;
    };
};
export declare const CommitmentHeaderABI: {
    CommitmentHeader: {
        submittedAt: string;
        exitsRoot: string;
        coinbase: string;
        blockHash: string;
    };
};
export declare const CommitmentHeaderQueryABI: {
    CommitmentHeaderQuery: {
        parentHash: string;
        childIndex: string;
        blockNumber: string;
        commitment: {
            CommitmentHeader: {
                submittedAt: string;
                exitsRoot: string;
                coinbase: string;
                blockHash: string;
            };
        };
    };
};
export declare const ConfirmedBlockQueryABI: {
    ConfirmedBlockQuery: {
        blockNumber: string;
        blockHash: string;
    };
};
export declare const BlockQueryABI: {
    BlockQuery: {
        confirmed: string;
        queryData: string;
    };
};
export {};
