import { BufferLike, toHex } from "@interstatejs/utils";
import { BlockHeader, BlockHeaderJson } from "@interstatejs/block";
import { IncomingTransaction, UnionTransaction } from "@interstatejs/tx";

const ABI = require('web3-eth-abi');

const BlockInputABI = {
  BlockInput: {
    header: {
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
    },
    transactions: 'bytes[]'
  }
}

export type BlockInput = {
  header: BlockHeaderJson,
  transactions: string[]
};

export function decodeBlockInput(
  calldata: BufferLike, submittedAt: number, childIndex: number
): { header: BlockHeader, transactionsInput: string[] } {
  /* Skip function signature. */
  console.log(`Decoding block input`)
  const data = `0x${toHex(calldata).slice(10)}`;
  const input = <BlockInput> ABI.decodeParameter(BlockInputABI, data);
  console.log('making header')
  const {
    number,
    incomingTransactionsIndex,
    incomingTransactionsCount,
    transactionsCount,
    timestamp,
  } = input.header;
  const header = new BlockHeader({
    ...input.header,
    number: toHex(number),
    incomingTransactionsIndex: toHex(incomingTransactionsIndex),
    incomingTransactionsCount: toHex(incomingTransactionsCount),
    transactionsCount: toHex(transactionsCount),
    timestamp: toHex(timestamp),
  });
  console.log('making header')
  header.toCommitment({ submittedAt, childIndex });
  console.log('made header')
  return { header, transactionsInput: input.transactions };
}

export type TransactionProof = {
  transaction: BufferLike;
  siblings: BufferLike[];
}

const PriorStateProof = {
  PriorStateProof: {
    transaction: 'bytes',
    siblings: 'bytes32[]'
  }
}

export function encodePreviousRootProof(
  proof: BlockHeader | TransactionProof
): string {
  if (proof instanceof BlockHeader) return toHex(proof.encodeABI());
  return toHex(
    ABI.encodeParameter(
      PriorStateProof,
      proof
    )
  );
}

export const IncomingTransactionAbi = {
  IncomingTransaction: {
    from: 'address',
    to: 'address',
    gas: 'uint256',
    value: 'uint256',
    data: 'bytes',
    stateRoot: 'bytes32',
  }
}

const getAddressHex = (x: Buffer) => {
  const address = toHex(x);
  if (address == '0x') return `0x${'00'.repeat(20)}`;
  return address;
}

const getNumHex = (x: Buffer) => {
  const num = toHex(x);
  if (num == '0x') return `0x${'00'.repeat(32)}`;
  return num;
}

export function encodeTransactionForProof(
  transaction: BufferLike | IncomingTransaction,
): string {
  if (transaction instanceof IncomingTransaction || transaction instanceof UnionTransaction) {
    const data = toHex(
      ABI.encodeParameter(IncomingTransactionAbi, {
        from: getAddressHex(transaction.getSenderAddress()),
        to: getAddressHex(transaction.to),
        gas: getNumHex(transaction.gasLimit),
        value: getNumHex(transaction.value),
        data: toHex(transaction.data),
        stateRoot: getNumHex(transaction.stateRoot)
      })
    );
    console.log(transaction)
    console.log('state root', transaction.stateRoot)
    console.log(data)
    const tx = ABI.decodeParameter(IncomingTransactionAbi, data)
    console.log(tx)
    return data
  }
  return toHex(transaction);
}