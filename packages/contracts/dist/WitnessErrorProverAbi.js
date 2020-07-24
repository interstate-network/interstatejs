"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contract_1 = require("web3x/contract");
exports.default = new contract_1.ContractAbi([
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "number",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "transactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "transactionsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "stateRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "exitsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "coinbase",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ISO_HeaderLib.ISO_Header",
                "name": "header",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "transactionBytes",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes32[]",
                "name": "siblings",
                "type": "bytes32[]"
            },
            {
                "internalType": "bytes",
                "name": "previousRootProof",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "stateProof1",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "stateProof2",
                "type": "bytes"
            }
        ],
        "name": "proveWitnessEntryRootError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "number",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "transactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "transactionsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "stateRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "exitsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "coinbase",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ISO_HeaderLib.ISO_Header",
                "name": "header",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "transactionBytes",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes32[]",
                "name": "siblings",
                "type": "bytes32[]"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            }
        ],
        "name": "proveWitnessContextError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            }
        ],
        "name": "proveWitnessExitRootError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            }
        ],
        "name": "proveExitCallWitnessGasError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "number",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "transactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "transactionsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "stateRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "exitsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "coinbase",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ISO_HeaderLib.ISO_Header",
                "name": "header",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
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
            }
        ],
        "name": "proveExitCallWitnessExitRootError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "number",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "transactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "transactionsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "stateRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "exitsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "coinbase",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ISO_HeaderLib.ISO_Header",
                "name": "header",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes",
                        "name": "transactionBytes",
                        "type": "bytes"
                    },
                    {
                        "internalType": "uint256",
                        "name": "transactionIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "siblings",
                        "type": "bytes32[]"
                    }
                ],
                "internalType": "struct WitnessErrorProver.TransactionProof",
                "name": "txProof",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "callerProof",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "operatorProof",
                "type": "bytes"
            }
        ],
        "name": "proveSuccessfulSignedTransactionStateRootError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "number",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "transactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "transactionsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "stateRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "exitsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "coinbase",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ISO_HeaderLib.ISO_Header",
                "name": "header",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes",
                        "name": "transactionBytes",
                        "type": "bytes"
                    },
                    {
                        "internalType": "uint256",
                        "name": "transactionIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32[]",
                        "name": "siblings",
                        "type": "bytes32[]"
                    }
                ],
                "internalType": "struct WitnessErrorProver.TransactionProof",
                "name": "txProof",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "previousRootProof",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "callerProof",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "operatorProof",
                "type": "bytes"
            }
        ],
        "name": "proveFailedSignedTransactionStateRootError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "number",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "incomingTransactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "transactionsCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "transactionsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "stateRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "exitsRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "coinbase",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ISO_HeaderLib.ISO_Header",
                "name": "header",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "transactionBytes",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes32[]",
                "name": "siblings",
                "type": "bytes32[]"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            }
        ],
        "name": "proveSuccessfulIncomingTransactionStateRootError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            }
        ],
        "name": "proveWitnessGasExceededError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            }
        ],
        "name": "proveWitnessRefundError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "parentHash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "childIndex",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "blockNumber",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "submittedAt",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "exitsRoot",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "address",
                                "name": "coinbase",
                                "type": "address"
                            },
                            {
                                "internalType": "bytes32",
                                "name": "blockHash",
                                "type": "bytes32"
                            }
                        ],
                        "internalType": "struct CommitmentHeaderLib.CommitmentHeader",
                        "name": "commitment",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct CommitmentHeaderLib.CommitmentHeaderQuery",
                "name": "commitmentQuery",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "transactionIndex",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "witnessBytes",
                "type": "bytes"
            }
        ],
        "name": "proveExecutionError",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]);
