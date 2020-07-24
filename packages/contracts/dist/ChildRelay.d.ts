import BN from "bn.js";
import { Address } from "web3x/address";
import { EventLog, TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x/contract";
import { Eth } from "web3x/eth";
export declare type OutgoingTransactionQueuedEvent = {
    transaction: {
        from: Address;
        to: Address;
        gas: string;
        value: string;
        data: string;
        bounty: string;
    };
};
export interface OutgoingTransactionQueuedEventLog extends EventLog<OutgoingTransactionQueuedEvent, "OutgoingTransactionQueued"> {
}
interface ChildRelayEvents {
    OutgoingTransactionQueued: EventSubscriptionFactory<OutgoingTransactionQueuedEventLog>;
}
interface ChildRelayEventLogs {
    OutgoingTransactionQueued: OutgoingTransactionQueuedEventLog;
}
interface ChildRelayTxEventLogs {
    OutgoingTransactionQueued: OutgoingTransactionQueuedEventLog[];
}
export interface ChildRelayTransactionReceipt extends TransactionReceipt<ChildRelayTxEventLogs> {
}
interface ChildRelayMethods {
    getQueue(blockNumber: number | string | BN): TxCall<{
        from: Address;
        to: Address;
        gas: string;
        value: string;
        data: string;
        bounty: string;
    }[]>;
    queueParentCall(_to: Address, _gas: number | string | BN, data: string, bounty: number | string | BN): TxSend<ChildRelayTransactionReceipt>;
    queueParentCall(_to: Address, _gas: number | string | BN, data: string): TxSend<ChildRelayTransactionReceipt>;
}
export interface ChildRelayDefinition {
    methods: ChildRelayMethods;
    events: ChildRelayEvents;
    eventLogs: ChildRelayEventLogs;
}
export declare class ChildRelay extends Contract<ChildRelayDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<ChildRelayTransactionReceipt>;
}
export declare var ChildRelayAbi: import("web3x/contract").ContractAbi;
export {};
