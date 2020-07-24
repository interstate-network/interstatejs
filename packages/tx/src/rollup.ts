import { rlp, bufferToHex } from 'ethereumjs-util';
const ABI = require('ethereumjs-abi');
import Transaction from './transaction';

export function encodeRollupTransaction(tx: Transaction, outputRoot: Buffer): Buffer {
  if (tx.isIncoming) {
    const sourceBlock = tx.sourceBlock ? bufferToHex(tx.sourceBlock) : '0x00';
    const itxIndex = tx.itxIndex ? bufferToHex(tx.itxIndex) : '0x00'
    return ABI.solidityPack(
      ['uint128', 'uint128', 'bytes32'],
      [sourceBlock, itxIndex, outputRoot]
    );
  }
  if (!tx.raw) throw new Error('Transaction missing .raw property.');
  /* skip isIncoming flag */
  const [, ...raw] = tx.raw;
  return rlp.encode([...raw, outputRoot]);
}

export function encodeRollup(tx: Transaction, stateRoot: Buffer): Buffer {
  tx.stateRoot = stateRoot;
  if (tx.isIncoming) return tx.stateRoot;
  if (!tx.raw) throw new Error('Transaction missing .raw property.');
  /* skip isIncoming flag */
  return Buffer.concat([tx.serialize(), stateRoot]);
}