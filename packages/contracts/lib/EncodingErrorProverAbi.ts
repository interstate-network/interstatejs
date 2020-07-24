import { ContractAbi} from 'web3x/contract';
export default new ContractAbi([
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
    "name": "proveIncomingTransactionEncodingError",
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
    "name": "proveSignedTransactionEncodingError",
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
    "name": "proveTransactionSignatureError",
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
    "name": "proveMessageWitnessEncodingError",
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
        "internalType": "uint256",
        "name": "recordIndex",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "witnessBytes",
        "type": "bytes"
      }
    ],
    "name": "proveAccessRecordEncodingError",
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
    "name": "proveExitWitnessEncodingError",
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
      },
      {
        "internalType": "bytes",
        "name": "callData",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "recordIndex",
        "type": "uint256"
      }
    ],
    "name": "proveExitCallEncodingError",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "transactionBytes",
        "type": "bytes"
      }
    ],
    "name": "tryDecodeSignedTransaction",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "witnessBytes",
        "type": "bytes"
      }
    ],
    "name": "tryDecodeMessageWitness",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "_caller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_gas",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "tryDecodeOutgoingTransaction",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "recordBytes",
        "type": "bytes"
      }
    ],
    "name": "tryDecodeAccessRecord",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  }
]);