import BN from "bn.js";
import { Address } from "web3x/address";
import { EventLog, TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxSend, EventSubscriptionFactory } from "web3x/contract";
import { Eth } from "web3x/eth";
export declare type BlockChallengeEvent = {
    blockHash: string;
    transactionIndex: string;
    challenger: Address;
};
export declare type ChallengeResponseEvent = {
    blockHash: string;
    transactionIndex: string;
    witness: string;
};
export declare type ChallengeTimeoutEvent = {
    blockHash: string;
    transactionIndex: string;
    step: string;
};
export interface BlockChallengeEventLog extends EventLog<BlockChallengeEvent, "BlockChallenge"> {
}
export interface ChallengeResponseEventLog extends EventLog<ChallengeResponseEvent, "ChallengeResponse"> {
}
export interface ChallengeTimeoutEventLog extends EventLog<ChallengeTimeoutEvent, "ChallengeTimeout"> {
}
interface ChallengeManagerEvents {
    BlockChallenge: EventSubscriptionFactory<BlockChallengeEventLog>;
    ChallengeResponse: EventSubscriptionFactory<ChallengeResponseEventLog>;
    ChallengeTimeout: EventSubscriptionFactory<ChallengeTimeoutEventLog>;
}
interface ChallengeManagerEventLogs {
    BlockChallenge: BlockChallengeEventLog;
    ChallengeResponse: ChallengeResponseEventLog;
    ChallengeTimeout: ChallengeTimeoutEventLog;
}
interface ChallengeManagerTxEventLogs {
    BlockChallenge: BlockChallengeEventLog[];
    ChallengeResponse: ChallengeResponseEventLog[];
    ChallengeTimeout: ChallengeTimeoutEventLog[];
}
export interface ChallengeManagerTransactionReceipt extends TransactionReceipt<ChallengeManagerTxEventLogs> {
}
interface ChallengeManagerMethods {
    challengeTransaction(query: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, header: {
        parentHash: string;
        number: number | string | BN;
        incomingTransactionsIndex: number | string | BN;
        incomingTransactionsCount: number | string | BN;
        transactionsCount: number | string | BN;
        transactionsRoot: string;
        stateRoot: string;
        exitsRoot: string;
        coinbase: Address;
        timestamp: number | string | BN;
    }, transactionIndex: number | string | BN): TxSend<ChallengeManagerTransactionReceipt>;
    respondToChallenge(blockHash: string, transactionIndex: number | string | BN, witness: string): TxSend<ChallengeManagerTransactionReceipt>;
    challengeTimeout(blockHash: string, transactionIndex: number | string | BN): TxSend<ChallengeManagerTransactionReceipt>;
    reclaimChallengeBond(blockHash: string, transactionIndex: number | string | BN): TxSend<ChallengeManagerTransactionReceipt>;
}
export interface ChallengeManagerDefinition {
    methods: ChallengeManagerMethods;
    events: ChallengeManagerEvents;
    eventLogs: ChallengeManagerEventLogs;
}
export declare class ChallengeManager extends Contract<ChallengeManagerDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<ChallengeManagerTransactionReceipt>;
}
export declare var ChallengeManagerAbi: import("web3x/contract").ContractAbi;
export {};
