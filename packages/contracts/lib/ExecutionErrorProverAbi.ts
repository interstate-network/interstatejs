import { ContractAbi} from 'web3x/contract';
export default new ContractAbi([
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "gas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes32",
            "name": "stateRoot",
            "type": "bytes32"
          }
        ],
        "indexed": false,
        "internalType": "struct RelayTransactionLib.IncomingTransaction",
        "name": "transaction",
        "type": "tuple"
      },
      {
        "indexed": false,
        "internalType": "bytes32[]",
        "name": "siblings",
        "type": "bytes32[]"
      }
    ],
    "name": "ErrorTest",
    "type": "event"
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
        "name": "transaction",
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
    "name": "proveInvalidCreateTransaction",
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
        "name": "previousRootProof",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "stateProof",
        "type": "bytes"
      }
    ],
    "name": "proveInsufficientBalanceError",
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
        "name": "previousRootProof",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "stateProof",
        "type": "bytes"
      }
    ],
    "name": "proveInvalidNonceError",
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
      }
    ],
    "name": "proveInsufficientGasError",
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
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "gas",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          },
          {
            "internalType": "bytes32",
            "name": "stateRoot",
            "type": "bytes32"
          }
        ],
        "internalType": "struct RelayTransactionLib.IncomingTransaction",
        "name": "transaction",
        "type": "tuple"
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
        "name": "receiverProof",
        "type": "bytes"
      }
    ],
    "name": "proveSimpleIncomingTransactionExecutionError",
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
        "name": "receiverProof",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "operatorProof",
        "type": "bytes"
      }
    ],
    "name": "proveSimpleSignedTransactionExecutionError",
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
        "name": "receiverProof",
        "type": "bytes"
      }
    ],
    "name": "cancelSimpleTransactionChallenge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]);