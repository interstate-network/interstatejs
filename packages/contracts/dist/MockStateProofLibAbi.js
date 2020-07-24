"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contract_1 = require("web3x/contract");
exports.default = new contract_1.ContractAbi([
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "oldRootBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "leafProofBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "transactionData",
                "type": "bytes"
            }
        ],
        "name": "updateExitsTree",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newRootNode",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "stateRoot",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "exitsAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "height",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "stateProofBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "storageProofBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "leafProofBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "transactionData",
                "type": "bytes"
            }
        ],
        "name": "updateExitsRoot",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "newStateRoot",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "recordIndex",
                "type": "uint256"
            }
        ],
        "name": "getLastState",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "stateRoot",
                "type": "bytes32"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "stateRoot",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "proofBytes",
                "type": "bytes"
            }
        ],
        "name": "proveAccountInState",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "nonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "balance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "stateRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "codeHash",
                        "type": "bytes32"
                    }
                ],
                "internalType": "struct RLPAccountLib.Account",
                "name": "account",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "stateRoot",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "proofBytes",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "subtractBalanceAndIncrementNonce",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "stateRoot",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "proofBytes",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "increaseBalance",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "updatedRoot",
                "type": "bytes32"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "nonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "balance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "stateRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "codeHash",
                        "type": "bytes32"
                    }
                ],
                "internalType": "struct RLPAccountLib.Account",
                "name": "account",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "stateRoot",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "slot",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "newValue",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "accountProofBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "storageProofBytes",
                "type": "bytes"
            }
        ],
        "name": "proveAndUpdateAccountStorage",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "oldValue",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "newStateRoot",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "stateRoot",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "proofBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes32",
                "name": "codeHash",
                "type": "bytes32"
            }
        ],
        "name": "setAccountCodeHash",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "newRoot",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]);
