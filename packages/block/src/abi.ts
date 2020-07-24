// const abi = require('web3-eth-abi').AbiCoder;
// const abi = ABI();
import { ABICoder } from 'web3x/contract/abi-coder';
import { BufferLike } from "@interstatejs/tx";

export interface ABI_Encoder<T> {
  encodeABI: () => BufferLike;
  decodeABI: (input: BufferLike) => T;
}

const abi = new ABICoder();

type AbiObj = { [key: string] : string | AbiObj }

type Constructor<T> = new (args: any) => T;

export interface ABI_Encoder<T> {
  encodeABI: () => BufferLike;
  decodeABI: (input: BufferLike) => T;
}

export function setEncodeABI<T>(_abi: AbiObj, obj: any) {
  obj.encodeABI = function(): BufferLike {
    return abi.encodeParameter(_abi, this.encodeJSON ? this.encodeJSON() : this);
  }
}

/* This is broken - need to add handling for numeric strings */
export function getDecodeABI<T>(_abi: AbiObj, _constructor: Constructor<T>) {
  return function(_encoded: BufferLike): T {
    const x = abi.decodeParameter(_abi, _encoded);
    return new _constructor(x);
  }
}

export const HeaderABI = {
  ISO_Header: {
     parentHash: 'bytes32',
     number: 'uint256',
     incomingTransactionsIndex: 'uint256',
     incomingTransactionsCount: 'uint256',
     transactionsCount: 'uint256',
     transactionsRoot: 'bytes32',
     stateRoot: 'bytes32',
     exitsRoot: 'bytes32',
     coinbase: 'address',
     timestamp: 'uint256',
  }
};

/*   ISO_Header: {
    parentHash: 'bytes32',
    number: 'uint256',
    parentChainHash: 'bytes32',
    parentChainHeight: 'uint256',
    incomingTransactionsCount: 'uint256',
    transactionsCount: 'uint256',
    transactionsRoot: 'bytes32',
    stateRoot: 'bytes32',
    exitsRoot: 'bytes32',
    coinbase: 'address',
    timestamp: 'uint256',
    gasLimit: 'uint256',
    gasUsed: 'uint256',
    exitGasPrice: 'uint256'
  } */

export const BlockABI = {
  ISO_Block: {
    header: HeaderABI.ISO_Header,
    transactions: 'bytes[]'
  }  
}

export const CommitmentHeaderABI = {
  CommitmentHeader: {
    submittedAt: 'uint256',
    exitsRoot: 'bytes32',
    coinbase: 'address',
    blockHash: 'bytes32'
  }
}

export const CommitmentHeaderQueryABI = {
  CommitmentHeaderQuery: {
    parentHash: 'bytes32',
    childIndex: 'uint256',
    blockNumber: 'uint256',
    commitment: CommitmentHeaderABI
  }
}

export const ConfirmedBlockQueryABI = {
  ConfirmedBlockQuery: {
    blockNumber: 'uint256',
    blockHash: 'bytes32'
  }
}

export const BlockQueryABI = {
  BlockQuery: {
    confirmed: 'bool',
    queryData: 'bytes'
  }
}