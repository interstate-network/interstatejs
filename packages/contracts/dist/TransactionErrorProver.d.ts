import BN from "bn.js";
import { Address } from "web3x/address";
import { TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxSend } from "web3x/contract";
import { Eth } from "web3x/eth";
interface TransactionErrorProverEvents {
}
interface TransactionErrorProverEventLogs {
}
interface TransactionErrorProverTxEventLogs {
}
export interface TransactionErrorProverTransactionReceipt extends TransactionReceipt<TransactionErrorProverTxEventLogs> {
}
interface TransactionErrorProverMethods {
    proveTransactionSignatureError(commitmentQuery: {
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
    }, transaction: string, transactionIndex: number | string | BN, siblings: string[]): TxSend<TransactionErrorProverTransactionReceipt>;
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
    }, transaction: string, transactionIndex: number | string | BN, siblings: string[], stateProof: string): TxSend<TransactionErrorProverTransactionReceipt>;
}
export interface TransactionErrorProverDefinition {
    methods: TransactionErrorProverMethods;
    events: TransactionErrorProverEvents;
    eventLogs: TransactionErrorProverEventLogs;
}
export declare class TransactionErrorProver extends Contract<TransactionErrorProverDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<TransactionErrorProverTransactionReceipt>;
}
export declare var TransactionErrorProverAbi: import("web3x/contract").ContractAbi;
export {};
