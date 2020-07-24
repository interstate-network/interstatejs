import { IncomingTransaction, UnionTransaction, Transaction } from ".";
import { bufferToHex, keccak256 } from "ethereumjs-util";

const ABI = require('ethereumjs-abi');

export function encodeABI(tx: IncomingTransaction | UnionTransaction): Buffer | string {
  if (tx.isIncoming) return tx.stateRoot;
  return Buffer.concat([tx.serialize(), tx.stateRoot]);
}

export function hashABI(tx: IncomingTransaction | UnionTransaction): Buffer {
  const encoded: Buffer | string = encodeABI(tx);
  return keccak256(encoded);
}
