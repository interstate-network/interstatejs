import Common from 'ethereumjs-common'
import * as ethUtil from 'ethereumjs-util'
import { rlp, toBuffer } from 'ethereumjs-util'
// const { Transaction } = require('@interstatejs/tx');

import { BlockHeader } from './header'
import { BlockData, BufferLike, ChainOptions, BlockJson } from './types'
import { OutgoingTransaction, Transaction, TxData, UnionTransaction, TransactionType } from '@interstatejs/tx';

import { ABI_Encoder, BlockABI, setEncodeABI, getDecodeABI } from './abi';
import { getMerkleRoot, getMerkleProof, common } from '@interstatejs/utils';

/**
 * An object that represents the block
 */
export class Block implements ABI_Encoder<Block> {
  public readonly header: BlockHeader
  public readonly transactions: Transaction[] = []
  public outgoingTransactions: OutgoingTransaction[] = []

  public submittedAt?: number | null;
  public childIndex?: number | null;

  private readonly _common: Common

  static decodeABI = getDecodeABI<Block>(BlockABI, Block);

  /**
   * Creates a new block object
   *
   * @param data - The block's data.
   * @param opts - The network options for this block, and its header, uncle headers and txs.
   */
  constructor(
    data: Buffer | [Buffer[], Buffer[]] | BlockData | BlockJson = {},
    opts: ChainOptions = {},
  ) {
    if (opts.common) {
      if (opts.chain !== undefined || opts.hardfork !== undefined) {
        throw new Error(
          'Instantiation with both opts.common and opts.chain / opts.hardfork parameter not allowed!',
        )
      }

      this._common = opts.common
    } else {
      // const chain = opts.chain ? opts.chain : 'mainnet'
      // TODO: Compute the hardfork based on this block's number. It can be implemented right now
      // because the block number is not immutable, so the Common can get out of sync.
      // const hardfork = opts.hardfork ? opts.hardfork : null
      // this._common = new Common(chain, hardfork)
      this._common = common;
    }

    let rawTransactions;

    if (Buffer.isBuffer(data)) {
      const dataAsAny = rlp.decode(data) as any;
      data = dataAsAny as [Buffer[], Buffer[]]
    }

    if (Array.isArray(data)) {
      this.header = new BlockHeader(data[0], { common: this._common });
      rawTransactions = data[1];
    } else {
      this.header = new BlockHeader(data.header, { common: this._common })
      rawTransactions = data.transactions || []
    }

    for (let i = 0; i < rawTransactions.length; i++) {
      const tx = new UnionTransaction(rawTransactions[i], opts);
      this.transactions.push(tx);
    }

    setEncodeABI<Block>(BlockABI, this);
  }

  get raw(): [Buffer[], Buffer[], Buffer[]] {
    return this.serialize(false)
  }

  /**
   * Produces a hash the RLP of the block
   */
  hash(): Buffer {
    return this.header.hash()
  }

  /**
   * Determines if this block is the genesis block
   */
  isGenesis(): boolean {
    return this.header.isGenesis()
  }

  /**
   * Turns the block into the canonical genesis block
   */
  setGenesisParams(): void {
    this.header.setGenesisParams()
  }

  /**
   * Produces a serialization of the block.
   *
   * @param rlpEncode - If `true`, the returned object is the RLP encoded data as seen by the
   * Ethereum wire protocol. If `false`, a tuple with the raw data of the header, the txs and the
   * uncle headers is returned.
   */
  serialize(): Buffer
  serialize(rlpEncode: true): Buffer
  serialize(rlpEncode: false): [Buffer[], Buffer[], Buffer[]]
  serialize(rlpEncode = true) {
    const raw = [
      this.header.raw,
      this.transactions.map(tx => tx.raw),
    ]

    return rlpEncode ? rlp.encode(raw) : raw
  }

  /**
   * Validates the transactions
   *
   * @param stringError - If `true`, a string with the indices of the invalid txs is returned.
   */
  validateTransactions(): boolean
  validateTransactions(stringError: false): boolean
  validateTransactions(stringError: true): string
  validateTransactions(stringError = false) {
    const errors: string[] = []

    this.transactions.forEach(function(tx, i) {
      const error = tx.validate(true)
      if (error) {
        errors.push(`${error} at tx ${i}`)
      }
    })

    if (!stringError) {
      return errors.length === 0
    }

    return errors.join(' ')
  }

  /* Temporary replacement for toJSON. Did not replace toJSON completely to avoid breaking dependents. */
  encodeJSON(): BlockJson {
    return {
      header: this.header.encodeJSON(),
      transactions: this.transactions.map(tx => tx.encode(false, true, true))
    }
  }

  /**
   * Returns the block in JSON format
   *
   * @see {@link https://github.com/ethereumjs/ethereumjs-util/blob/master/docs/index.md#defineproperties|ethereumjs-util}
   */
  toJSON(): BlockJson {
    return this.encodeJSON();
  }

  setTransactionsRoot(): void {
    const leaves = this.transactions.map(tx => tx.toRollup());
    this.header.transactionsRoot = getMerkleRoot(leaves);
  }

  setStateRoot(): void {
    this.header.stateRoot = this.transactions[this.transactions.length-1].stateRoot;
  }

  setTransactionCounts(): void {
    this.header.incomingTransactionsCount = toBuffer(this.transactions.filter(tx => tx.isIncoming).length);
    this.header.transactionsCount = toBuffer(this.transactions.length);
  }

  setOutputs(): void {
    this.setTransactionsRoot();
    this.setTransactionCounts();
    this.setStateRoot();
  }

  proveTransaction(index: number): Array<BufferLike> {
    if (index > this.transactions.length) throw new Error(`Index out of range. ${index} > ${this.transactions.length}`);
    const { siblings } = getMerkleProof(this.transactions.map(t => t.toRollup()), index);
    return siblings;
  }
}

export interface Block {
  raw: [Buffer[], Buffer[], Buffer[]]
  hash(): Buffer
  isGenesis(): boolean
  setGenesisParams(): void
  serialize(): Buffer
  serialize(rlpEncode: true): Buffer
  serialize(rlpEncode: false): [Buffer[], Buffer[], Buffer[]]
  validateTransactions(): boolean;
  validateTransactions(stringError: false): boolean;
  validateTransactions(stringError: true): string;
  encodeABI: () => BufferLike;
  decodeABI: (input: BufferLike) => Block;
  encodeJSON(): BlockJson;
  toJSON(): BlockJson;
  setTransactionsRoot(): void;
  proveTransaction(index: number): Array<BufferLike>;

}