import BN from "bn.js";
import { Address } from "web3x/address";
import { TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxCall, TxSend } from "web3x/contract";
import { Eth } from "web3x/eth";
interface EncodingErrorProverEvents {
}
interface EncodingErrorProverEventLogs {
}
interface EncodingErrorProverTxEventLogs {
}
export interface EncodingErrorProverTransactionReceipt extends TransactionReceipt<EncodingErrorProverTxEventLogs> {
}
interface EncodingErrorProverMethods {
    proveIncomingTransactionEncodingError(commitmentQuery: {
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
    }, transaction: string, transactionIndex: number | string | BN, siblings: string[]): TxSend<EncodingErrorProverTransactionReceipt>;
    proveSignedTransactionEncodingError(commitmentQuery: {
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
    }, transaction: string, transactionIndex: number | string | BN, siblings: string[]): TxSend<EncodingErrorProverTransactionReceipt>;
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
    }, transaction: string, transactionIndex: number | string | BN, siblings: string[]): TxSend<EncodingErrorProverTransactionReceipt>;
    proveMessageWitnessEncodingError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, witnessBytes: string): TxSend<EncodingErrorProverTransactionReceipt>;
    proveAccessRecordEncodingError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, recordIndex: number | string | BN, witnessBytes: string): TxSend<EncodingErrorProverTransactionReceipt>;
    proveExitWitnessEncodingError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, witnessBytes: string): TxSend<EncodingErrorProverTransactionReceipt>;
    proveExitCallEncodingError(commitmentQuery: {
        parentHash: string;
        childIndex: number | string | BN;
        blockNumber: number | string | BN;
        commitment: {
            submittedAt: number | string | BN;
            exitsRoot: string;
            coinbase: Address;
            blockHash: string;
        };
    }, transactionIndex: number | string | BN, witnessBytes: string, callData: string, recordIndex: number | string | BN): TxSend<EncodingErrorProverTransactionReceipt>;
    tryDecodeSignedTransaction(transactionBytes: string): TxCall<void>;
    tryDecodeMessageWitness(witnessBytes: string): TxCall<void>;
    tryDecodeOutgoingTransaction(_data: string, _caller: Address, _gas: number | string | BN, _value: number | string | BN): TxCall<void>;
    tryDecodeAccessRecord(recordBytes: string): TxCall<void>;
}
export interface EncodingErrorProverDefinition {
    methods: EncodingErrorProverMethods;
    events: EncodingErrorProverEvents;
    eventLogs: EncodingErrorProverEventLogs;
}
export declare class EncodingErrorProver extends Contract<EncodingErrorProverDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<EncodingErrorProverTransactionReceipt>;
}
export declare var EncodingErrorProverAbi: import("web3x/contract").ContractAbi;
export {};
