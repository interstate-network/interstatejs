import { ContractAbi} from 'web3x/contract';
export default new ContractAbi([
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "blockHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "transactionIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "challenger",
        "type": "address"
      }
    ],
    "name": "BlockChallenge",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "blockHeight",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "blockHash",
        "type": "bytes32"
      }
    ],
    "name": "BlockConfirmed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "blockHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "enum ChainStateLib.RevertReason",
        "name": "reason",
        "type": "uint8"
      }
    ],
    "name": "BlockReverted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "blockHeight",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "parentHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "childIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "blockHash",
        "type": "bytes32"
      }
    ],
    "name": "BlockSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "blockHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "transactionIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "witness",
        "type": "bytes"
      }
    ],
    "name": "ChallengeResponse",
    "type": "event"
  },
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
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "stateRoot",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "txSender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "upfrontCost",
        "type": "uint256"
      }
    ],
    "name": "TestAddress",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "getConfirmedBlockhash",
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
        "name": "parentHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "childIndex",
        "type": "uint256"
      }
    ],
    "name": "getPendingChild",
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
        "name": "parentHash",
        "type": "bytes32"
      }
    ],
    "name": "getPendingChildren",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
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
        "name": "_query",
        "type": "tuple"
      }
    ],
    "name": "hasPendingBlock",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_blockHash",
        "type": "bytes32"
      }
    ],
    "name": "hasPendingChallenge",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "isBlockConfirmed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract SparseMerkleTree",
        "name": "sparse",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "challengeManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "relay",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "archiveFactory",
        "type": "address"
      },
      {
        "internalType": "contract IByteCounter",
        "name": "byteCounter",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "accessErrorProver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "blockErrorProver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "executionErrorProver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "transactionErrorProver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "encodingErrorProver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "witnessErrorProver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "hypervisorAddress",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
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
            "internalType": "bytes[]",
            "name": "transactions",
            "type": "bytes[]"
          }
        ],
        "internalType": "struct ISO_BlockLib.ISO_Block",
        "name": "_block",
        "type": "tuple"
      }
    ],
    "name": "submitBlock",
    "outputs": [],
    "stateMutability": "payable",
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
        "name": "_query",
        "type": "tuple"
      }
    ],
    "name": "confirmBlock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "challengeStep",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "proveAccessError",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "proveBlockError",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "proveExecutionError",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "proveTransactionError",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "proveWitnessError",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "proveEncodingError",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]);