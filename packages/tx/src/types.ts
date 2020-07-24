import { BN } from "ethereumjs-util"
import { Buffer } from 'buffer'
import Common from 'ethereumjs-common'
import { Address } from "web3x/address"

/**
 * Any object that can be transformed into a `Buffer`
 */
export interface TransformableToBuffer {
  toBuffer(): Buffer
}

/**
 * A hex string prefixed with `0x`.
 */
export type PrefixedHexString = string

/**
 * A Buffer, hex string prefixed with `0x`, Number, or an object with a toBuffer method such as BN.
 */
export type BufferLike = Buffer | TransformableToBuffer | PrefixedHexString | number

export enum TransactionType {
  none = 'none',
  signed = 'signed',
  incoming = 'incoming',
  outgoing = 'outgoing',
  fake = 'fake'
}

/**
 * Source of the transaction
*/
export type TransactionSource = {
  block: BN
  transactionIndex: BN
}

export interface IncomingTxData {

  /**
   * The index of the incoming transaction relative to the parent chain block which triggered it.
   */
  itxIndex?: BufferLike

  /**
   * The address the transaction was sent from.
   */
  from?: BufferLike

  /**
   * The address the transaction is sent to.
   */
  to?: BufferLike

  /**
   * The transaction's gas limit.
   */
  gasLimit?: BufferLike

  /**
   * The amount of Ether sent.
   */
  value?: BufferLike

  /**
   * This will contain the data of the message or the init of a contract
   */
  data?: BufferLike
  /**
   * The state root after execution.
   */
  stateRoot?: BufferLike
}

/**
 * A transaction's data.
 */
export interface SignedTxData {
  /**
   * The transaction's gas limit.
   */
  gasLimit?: BufferLike

  /**
   * The transaction's gas price.
   */
  gasPrice?: BufferLike

  /**
   * The transaction's the address is sent to.
   */
  to?: BufferLike

  /**
   * The transaction's nonce.
   */
  nonce?: BufferLike

  /**
   * This will contain the data of the message or the init of a contract
   */
  data?: BufferLike

  /**
   * EC recovery ID.
   */
  v?: BufferLike

  /**
   * EC signature parameter.
   */
  r?: BufferLike

  /**
   * EC signature parameter.
   */
  s?: BufferLike

  /**
   * The amount of Ether sent.
   */
  value?: BufferLike
  /**
   * The state root after execution.
   */
  stateRoot?: BufferLike
}

export interface TxData {
  /**
   * The type of the transaction.
   */
  _type?: TransactionType | 'none' | 'signed' | 'incoming' | 'outgoing' | 'fake' | undefined

  /**
   * The index of the incoming transaction relative to the parent chain block which triggered it.
   */
  itxIndex?: BufferLike
    /**
   * The transaction's gas limit.
   */
  gasLimit?: BufferLike

  /**
   * The transaction's gas price.
   */
  gasPrice?: BufferLike

  /**
   * The transaction sender's address.
   */
  from?: BufferLike

  /**
   * The transaction's the address is sent to.
   */
  to?: BufferLike

  /**
   * The transaction's nonce.
   */
  nonce?: BufferLike

  /**
   * This will contain the data of the message or the init of a contract
   */
  data?: BufferLike

  /**
   * EC recovery ID.
   */
  v?: BufferLike

  /**
   * EC signature parameter.
   */
  r?: BufferLike

  /**
   * EC signature parameter.
   */
  s?: BufferLike

  /**
   * The amount of Ether sent.
   */
  value?: BufferLike
  /**
   * The state root after execution.
   */
  stateRoot?: BufferLike
}

/**
 * The data of a fake (self-signing) transaction.
 */
export interface FakeTxData extends SignedTxData {
  /**
   * The sender of the Tx.
   */
  from?: BufferLike
}

/**
 * The transaction's options. This could be specified using a Common object, or `chain` and `hardfork`. Defaults to
 * mainnet.
 */
export interface TransactionOptions {
  /**
   * Type of the transaction.
   */
  type?: TransactionType

  /**
   * A Common object defining the chain and the hardfork a transaction belongs to.
   */
  common?: Common

  /**
   * The chain of the transaction, default: 'mainnet'
   */
  chain?: number | string

  /**
   * The hardfork of the transaction, default: 'petersburg'
   */
  hardfork?: string
}

export type SignedTransactionJson = {
  _type?: 'none' | 'signed' | 'incoming' | 'outgoing' | 'fake' | undefined;
  hash?: string;
  from?: string;
  input?: string;
  nonce: string;
  gasLimit: string;
  gasPrice: string;
  to: string;
  value: string;
  data: string;
  v: string;
  r: string;
  s: string;
  stateRoot?: string;
}


export type IncomingTransactionJson = {
  _type?: 'none' | 'signed' | 'incoming' | 'outgoing' | 'fake' | undefined;
  hash?: string;
  input?: string;
  itxIndex: string;
  from: string;
  to: string;
  gasLimit: string;
  value: string;
  data: string;
  stateRoot?: string;
}

export interface OutgoingTransactionData {
  from: Address;
  to: Address;
  gas: string;
  value: string;
  data: string;
  bounty: string;
}