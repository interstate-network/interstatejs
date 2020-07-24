import BN from "bn.js";
import { Address } from "web3x/address";
import { TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxCall, TxSend } from "web3x/contract";
import { Eth } from "web3x/eth";
interface MockStateProofLibEvents {
}
interface MockStateProofLibEventLogs {
}
interface MockStateProofLibTxEventLogs {
}
export interface MockStateProofLibTransactionReceipt extends TransactionReceipt<MockStateProofLibTxEventLogs> {
}
interface MockStateProofLibMethods {
    updateExitsTree(oldRootBytes: string, leafProofBytes: string, transactionData: string): TxCall<string>;
    updateExitsRoot(stateRoot: string, exitsAddress: Address, height: number | string | BN, stateProofBytes: string, storageProofBytes: string, leafProofBytes: string, transactionData: string): TxCall<string>;
    getLastState(witnessBytes: string, recordIndex: number | string | BN): TxCall<string>;
    proveAccountInState(stateRoot: string, accountAddress: Address, proofBytes: string): TxCall<{
        nonce: string;
        balance: string;
        stateRoot: string;
        codeHash: string;
    }>;
    subtractBalanceAndIncrementNonce(stateRoot: string, accountAddress: Address, proofBytes: string, amount: number | string | BN): TxCall<string>;
    increaseBalance(stateRoot: string, accountAddress: Address, proofBytes: string, amount: number | string | BN): TxCall<{
        "updatedRoot": string;
        0: string;
        "account": {
            nonce: string;
            balance: string;
            stateRoot: string;
            codeHash: string;
        };
        1: {
            nonce: string;
            balance: string;
            stateRoot: string;
            codeHash: string;
        };
    }>;
    proveAndUpdateAccountStorage(stateRoot: string, accountAddress: Address, slot: string, newValue: string, accountProofBytes: string, storageProofBytes: string): TxCall<{
        "oldValue": string;
        0: string;
        "newStateRoot": string;
        1: string;
    }>;
    setAccountCodeHash(stateRoot: string, accountAddress: Address, proofBytes: string, codeHash: string): TxCall<string>;
}
export interface MockStateProofLibDefinition {
    methods: MockStateProofLibMethods;
    events: MockStateProofLibEvents;
    eventLogs: MockStateProofLibEventLogs;
}
export declare class MockStateProofLib extends Contract<MockStateProofLibDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions);
    deploy(): TxSend<MockStateProofLibTransactionReceipt>;
}
export declare var MockStateProofLibAbi: import("web3x/contract").ContractAbi;
export {};
