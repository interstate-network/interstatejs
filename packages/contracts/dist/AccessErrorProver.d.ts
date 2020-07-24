import BN from "bn.js";
import { Address } from "web3x/address";
import { TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxSend } from "web3x/contract";
import { Eth } from "web3x/eth";
interface AccessErrorProverEvents {
}
interface AccessErrorProverEventLogs {
}
interface AccessErrorProverTxEventLogs {
}
export interface AccessErrorProverTransactionReceipt extends TransactionReceipt<AccessErrorProverTxEventLogs> {
}
interface AccessErrorProverMethods {
    proveExtCodeHashError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, stateProof: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveExtCodeSizeError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, stateProof: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveExtCodeCopyError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, stateProof: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveChainIdError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN): TxSend<AccessErrorProverTransactionReceipt>;
    proveCoinbaseError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN): TxSend<AccessErrorProverTransactionReceipt>;
    proveTimestampError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, header: {
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
    }): TxSend<AccessErrorProverTransactionReceipt>;
    proveNumberError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, header: {
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
    }): TxSend<AccessErrorProverTransactionReceipt>;
    proveBalanceError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, stateProof: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveSelfBalanceError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, stateProof: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveSloadError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, accountProof: string, storageProof: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveSstoreError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, accountProof: string, storageProof: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveExitCallError(header: {
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
    }, commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, callData: string, callerProof: string, stateProofBytes: string, storageProofBytes: string, transactionProofBytes: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveStaticCallError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, callData: string): TxSend<AccessErrorProverTransactionReceipt>;
    proveCallError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, witnessBytes: string, transactionIndex: number | string | BN, recordIndex: number | string | BN, callerProof: string, receiverProof: string): TxSend<AccessErrorProverTransactionReceipt>;
}
export interface AccessErrorProverDefinition {
    methods: AccessErrorProverMethods;
    events: AccessErrorProverEvents;
    eventLogs: AccessErrorProverEventLogs;
}
export declare class AccessErrorProver extends Contract<AccessErrorProverDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<AccessErrorProverTransactionReceipt>;
}
export declare var AccessErrorProverAbi: import("web3x/contract").ContractAbi;
export {};
