import BN from "bn.js";
import { Address } from "web3x/address";
import { EventLog, TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x/contract";
import { Eth } from "web3x/eth";
export declare type BlockChallengeEvent = {
    blockHash: string;
    transactionIndex: string;
    challenger: Address;
};
export declare type BlockConfirmedEvent = {
    blockHeight: string;
    blockHash: string;
};
export declare type BlockRevertedEvent = {
    blockHash: string;
    reason: string;
};
export declare type BlockSubmittedEvent = {
    blockHeight: string;
    parentHash: string;
    childIndex: string;
    blockHash: string;
};
export declare type ChallengeResponseEvent = {
    blockHash: string;
    transactionIndex: string;
    witness: string;
};
export declare type ErrorTestEvent = {
    transaction: {
        from: Address;
        to: Address;
        gas: string;
        value: string;
        data: string;
        stateRoot: string;
    };
    siblings: string[];
};
export declare type TestAddressEvent = {
    stateRoot: string;
    txSender: Address;
    upfrontCost: string;
};
export interface BlockChallengeEventLog extends EventLog<BlockChallengeEvent, "BlockChallenge"> {
}
export interface BlockConfirmedEventLog extends EventLog<BlockConfirmedEvent, "BlockConfirmed"> {
}
export interface BlockRevertedEventLog extends EventLog<BlockRevertedEvent, "BlockReverted"> {
}
export interface BlockSubmittedEventLog extends EventLog<BlockSubmittedEvent, "BlockSubmitted"> {
}
export interface ChallengeResponseEventLog extends EventLog<ChallengeResponseEvent, "ChallengeResponse"> {
}
export interface ErrorTestEventLog extends EventLog<ErrorTestEvent, "ErrorTest"> {
}
export interface TestAddressEventLog extends EventLog<TestAddressEvent, "TestAddress"> {
}
interface ChainPegEvents {
    BlockChallenge: EventSubscriptionFactory<BlockChallengeEventLog>;
    BlockConfirmed: EventSubscriptionFactory<BlockConfirmedEventLog>;
    BlockReverted: EventSubscriptionFactory<BlockRevertedEventLog>;
    BlockSubmitted: EventSubscriptionFactory<BlockSubmittedEventLog>;
    ChallengeResponse: EventSubscriptionFactory<ChallengeResponseEventLog>;
    ErrorTest: EventSubscriptionFactory<ErrorTestEventLog>;
    TestAddress: EventSubscriptionFactory<TestAddressEventLog>;
}
interface ChainPegEventLogs {
    BlockChallenge: BlockChallengeEventLog;
    BlockConfirmed: BlockConfirmedEventLog;
    BlockReverted: BlockRevertedEventLog;
    BlockSubmitted: BlockSubmittedEventLog;
    ChallengeResponse: ChallengeResponseEventLog;
    ErrorTest: ErrorTestEventLog;
    TestAddress: TestAddressEventLog;
}
interface ChainPegTxEventLogs {
    BlockChallenge: BlockChallengeEventLog[];
    BlockConfirmed: BlockConfirmedEventLog[];
    BlockReverted: BlockRevertedEventLog[];
    BlockSubmitted: BlockSubmittedEventLog[];
    ChallengeResponse: ChallengeResponseEventLog[];
    ErrorTest: ErrorTestEventLog[];
    TestAddress: TestAddressEventLog[];
}
export interface ChainPegTransactionReceipt extends TransactionReceipt<ChainPegTxEventLogs> {
}
interface ChainPegMethods {
    getConfirmedBlockhash(blockNumber: number | string | BN): TxCall<string>;
    getPendingChild(parentHash: string, childIndex: number | string | BN): TxCall<string>;
    getPendingChildren(parentHash: string): TxCall<string[]>;
    hasPendingBlock(_query: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }): TxCall<boolean>;
    hasPendingChallenge(_blockHash: string): TxCall<boolean>;
    isBlockConfirmed(blockNumber: number | string | BN): TxCall<boolean>;
    owner(): TxCall<Address>;
    initialize(sparse: Address, challengeManager: Address, relay: Address, archiveFactory: Address, byteCounter: Address, accessErrorProver: Address, blockErrorProver: Address, executionErrorProver: Address, transactionErrorProver: Address, encodingErrorProver: Address, witnessErrorProver: Address, hypervisorAddress: Address): TxSend<ChainPegTransactionReceipt>;
    submitBlock(_block: {
        header: {
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
        };
        transactions: string[];
    }): TxSend<ChainPegTransactionReceipt>;
    confirmBlock(_query: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }): TxSend<ChainPegTransactionReceipt>;
    challengeStep(data: string): TxSend<ChainPegTransactionReceipt>;
    proveAccessError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveBlockError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveExecutionError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveTransactionError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveWitnessError(data: string): TxSend<ChainPegTransactionReceipt>;
    proveEncodingError(data: string): TxSend<ChainPegTransactionReceipt>;
}
export interface ChainPegDefinition {
    methods: ChainPegMethods;
    events: ChainPegEvents;
    eventLogs: ChainPegEventLogs;
}
export declare class ChainPeg extends Contract<ChainPegDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<ChainPegTransactionReceipt>;
}
export declare var ChainPegAbi: import("web3x/contract").ContractAbi;
export {};
