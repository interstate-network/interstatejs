import BN from "bn.js";
import { Address } from "web3x/address";
import { TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxSend } from "web3x/contract";
import { Eth } from "web3x/eth";
interface WitnessErrorProverEvents {
}
interface WitnessErrorProverEventLogs {
}
interface WitnessErrorProverTxEventLogs {
}
export interface WitnessErrorProverTransactionReceipt extends TransactionReceipt<WitnessErrorProverTxEventLogs> {
}
interface WitnessErrorProverMethods {
    proveWitnessEntryRootError(commitmentQuery: {
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
    }, transactionBytes: string, transactionIndex: number | string | BN, siblings: string[], previousRootProof: string, witnessBytes: string, stateProof1: string, stateProof2: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveWitnessContextError(commitmentQuery: {
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
    }, transactionBytes: string, transactionIndex: number | string | BN, siblings: string[], witnessBytes: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveWitnessExitRootError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, witnessBytes: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveExitCallWitnessGasError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, witnessBytes: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveExitCallWitnessExitRootError(commitmentQuery: {
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
    }, transactionIndex: number | string | BN, witnessBytes: string, stateProofBytes: string, storageProofBytes: string, leafProofBytes: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveSuccessfulSignedTransactionStateRootError(commitmentQuery: {
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
    }, txProof: {
        transactionBytes: string;
        transactionIndex: number | string | BN;
        siblings: string[];
    }, witnessBytes: string, callerProof: string, operatorProof: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveFailedSignedTransactionStateRootError(commitmentQuery: {
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
    }, txProof: {
        transactionBytes: string;
        transactionIndex: number | string | BN;
        siblings: string[];
    }, witnessBytes: string, previousRootProof: string, callerProof: string, operatorProof: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveSuccessfulIncomingTransactionStateRootError(commitmentQuery: {
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
    }, transactionBytes: string, transactionIndex: number | string | BN, siblings: string[], witnessBytes: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveWitnessGasExceededError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, witnessBytes: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveWitnessRefundError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, witnessBytes: string): TxSend<WitnessErrorProverTransactionReceipt>;
    proveExecutionError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, witnessBytes: string): TxSend<WitnessErrorProverTransactionReceipt>;
}
export interface WitnessErrorProverDefinition {
    methods: WitnessErrorProverMethods;
    events: WitnessErrorProverEvents;
    eventLogs: WitnessErrorProverEventLogs;
}
export declare class WitnessErrorProver extends Contract<WitnessErrorProverDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<WitnessErrorProverTransactionReceipt>;
}
export declare var WitnessErrorProverAbi: import("web3x/contract").ContractAbi;
export {};
