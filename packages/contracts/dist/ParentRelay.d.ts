import BN from "bn.js";
import { Address } from "web3x/address";
import { EventLog, TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x/contract";
import { Eth } from "web3x/eth";
export declare type ExitTransactionProcessedEvent = {
    blockNumber: string;
    otxIndex: string;
    newExitRoot: string;
};
export declare type IncomingTransactionQueuedEvent = {
    itxIndex: string;
    transaction: {
        from: Address;
        to: Address;
        gas: string;
        value: string;
        data: string;
    };
};
export interface ExitTransactionProcessedEventLog extends EventLog<ExitTransactionProcessedEvent, "ExitTransactionProcessed"> {
}
export interface IncomingTransactionQueuedEventLog extends EventLog<IncomingTransactionQueuedEvent, "IncomingTransactionQueued"> {
}
interface ParentRelayEvents {
    ExitTransactionProcessed: EventSubscriptionFactory<ExitTransactionProcessedEventLog>;
    IncomingTransactionQueued: EventSubscriptionFactory<IncomingTransactionQueuedEventLog>;
}
interface ParentRelayEventLogs {
    ExitTransactionProcessed: ExitTransactionProcessedEventLog;
    IncomingTransactionQueued: IncomingTransactionQueuedEventLog;
}
interface ParentRelayTxEventLogs {
    ExitTransactionProcessed: ExitTransactionProcessedEventLog[];
    IncomingTransactionQueued: IncomingTransactionQueuedEventLog[];
}
export interface ParentRelayTransactionReceipt extends TransactionReceipt<ParentRelayTxEventLogs> {
}
interface ParentRelayMethods {
    childRelayContract(): TxCall<Address>;
    initialize(chainPeg: Address, archiveFactory: Address, childRelayCode: Address): TxSend<ParentRelayTransactionReceipt>;
    getTransactionHash(txIndex: number | string | BN): TxCall<string>;
    getTransactionsCount(): TxCall<string>;
    getTransactionHashes(start: number | string | BN, maxCount: number | string | BN): TxCall<string[]>;
    hasOutgoingTransaction(_tx: {
        from: Address;
        to: Address;
        gas: number | string | BN;
        value: number | string | BN;
        data: string;
        bounty: number | string | BN;
    }, siblings: string[], txIndex: number | string | BN, blockNumber: number | string | BN): TxCall<boolean>;
    getExitsRoot(blockNumber: number | string | BN): TxCall<string>;
    putConfirmedBlock(blockNumber: number | string | BN, exitsRoot: string): TxSend<ParentRelayTransactionReceipt>;
    addTransaction(to: Address, sendGas: number | string | BN, data: string): TxSend<ParentRelayTransactionReceipt>;
    deployContract(runtimeCode: Address): TxSend<ParentRelayTransactionReceipt>;
    forwardFromProxy(from: Address, sendGas: number | string | BN, data: string): TxSend<ParentRelayTransactionReceipt>;
    executeOutgoingTransaction(_tx: {
        from: Address;
        to: Address;
        gas: number | string | BN;
        value: number | string | BN;
        data: string;
        bounty: number | string | BN;
    }, siblings: string[], txIndex: number | string | BN, blockNumber: number | string | BN): TxSend<ParentRelayTransactionReceipt>;
}
export interface ParentRelayDefinition {
    methods: ParentRelayMethods;
    events: ParentRelayEvents;
    eventLogs: ParentRelayEventLogs;
}
export declare class ParentRelay extends Contract<ParentRelayDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<ParentRelayTransactionReceipt>;
}
export declare var ParentRelayAbi: import("web3x/contract").ContractAbi;
export {};
