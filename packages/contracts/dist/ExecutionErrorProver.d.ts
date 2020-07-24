import BN from "bn.js";
import { Address } from "web3x/address";
import { EventLog, TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxSend, EventSubscriptionFactory } from "web3x/contract";
import { Eth } from "web3x/eth";
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
export interface ErrorTestEventLog extends EventLog<ErrorTestEvent, "ErrorTest"> {
}
interface ExecutionErrorProverEvents {
    ErrorTest: EventSubscriptionFactory<ErrorTestEventLog>;
}
interface ExecutionErrorProverEventLogs {
    ErrorTest: ErrorTestEventLog;
}
interface ExecutionErrorProverTxEventLogs {
    ErrorTest: ErrorTestEventLog[];
}
export interface ExecutionErrorProverTransactionReceipt extends TransactionReceipt<ExecutionErrorProverTxEventLogs> {
}
interface ExecutionErrorProverMethods {
    proveInvalidCreateTransaction(commitmentQuery: {
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
    }, transaction: string, transactionIndex: number | string | BN, siblings: string[]): TxSend<ExecutionErrorProverTransactionReceipt>;
    proveInsufficientBalanceError(commitmentQuery: {
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
    }, transactionBytes: string, transactionIndex: number | string | BN, siblings: string[], previousRootProof: string, stateProof: string): TxSend<ExecutionErrorProverTransactionReceipt>;
    proveInvalidNonceError(commitmentQuery: {
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
    }, transactionBytes: string, transactionIndex: number | string | BN, siblings: string[], previousRootProof: string, stateProof: string): TxSend<ExecutionErrorProverTransactionReceipt>;
    proveInsufficientGasError(commitmentQuery: {
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
    }, transactionBytes: string, transactionIndex: number | string | BN, siblings: string[]): TxSend<ExecutionErrorProverTransactionReceipt>;
    proveSimpleIncomingTransactionExecutionError(commitmentQuery: {
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
    }, transaction: {
        from: Address;
        to: Address;
        gas: number | string | BN;
        value: number | string | BN;
        data: string;
        stateRoot: string;
    }, transactionIndex: number | string | BN, siblings: string[], previousRootProof: string, receiverProof: string): TxSend<ExecutionErrorProverTransactionReceipt>;
    proveSimpleSignedTransactionExecutionError(commitmentQuery: {
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
    }, transactionBytes: string, transactionIndex: number | string | BN, siblings: string[], previousRootProof: string, callerProof: string, receiverProof: string, operatorProof: string): TxSend<ExecutionErrorProverTransactionReceipt>;
    cancelSimpleTransactionChallenge(header: {
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
    }, transactionBytes: string, transactionIndex: number | string | BN, siblings: string[], previousRootProof: string, receiverProof: string): TxSend<ExecutionErrorProverTransactionReceipt>;
}
export interface ExecutionErrorProverDefinition {
    methods: ExecutionErrorProverMethods;
    events: ExecutionErrorProverEvents;
    eventLogs: ExecutionErrorProverEventLogs;
}
export declare class ExecutionErrorProver extends Contract<ExecutionErrorProverDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<ExecutionErrorProverTransactionReceipt>;
}
export declare var ExecutionErrorProverAbi: import("web3x/contract").ContractAbi;
export {};
