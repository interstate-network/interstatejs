import { BufferLike } from "@interstatejs/utils";
export declare enum ChallengeStep {
    NONE = 0,
    PENDING = 1,
    RECEIVED = 2
}
export declare type ChallengeData = {
    lastUpdate: number;
    challenger: BufferLike;
    step: ChallengeStep;
    witness?: BufferLike;
};
export declare type ChallengeJson = {
    lastUpdate: number;
    challenger: string;
    step: number;
    witness?: string;
};
export interface BlockChallengeData {
    blockHash: BufferLike;
    openChallenges?: number;
    challengedTransactions: number[];
    challengesByTransaction?: {
        [key: string]: ChallengeData;
    };
}
export declare type BlockChallengeJson = {
    blockHash: string;
    openChallenges: number;
    challengedTransactions: number[];
    challengesByTransaction: {
        [key: string]: ChallengeJson;
    };
};
export declare type BlockChallengeInput = BlockChallengeJson | BlockChallengeData;
export declare type TransactionChallengeData = {
    blockHash?: BufferLike;
    transactionIndex: number;
    blockNumber: number;
    challenger: BufferLike;
};
export declare type ChallengeResponseData = {
    blockHash?: BufferLike;
    transactionIndex: number;
    blockNumber: number;
    witness: BufferLike;
};
export declare class BlockChallenge implements BlockChallengeData {
    blockHash: BufferLike;
    openChallenges: number;
    challengedTransactions: number[];
    challengesByTransaction: {
        [key: string]: ChallengeData;
    };
    constructor(data: BlockChallengeInput | string);
    putTransactionChallenge(data: TransactionChallengeData): void;
    putChallengeResponse(data: ChallengeResponseData): void;
    toJSON(): BlockChallengeJson;
}
