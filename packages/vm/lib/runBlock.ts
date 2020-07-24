import BN = require('bn.js')
import { encode } from 'rlp'
import VM from './index'
import Bloom from './bloom'
import { RunTxResult } from './runTx'
import { Transaction } from '@interstatejs/tx'
import { BlockExitsRootError, BlockStateRootError, TransactionStateError } from './validationErrors'
import { Block } from '@interstatejs/block';
import { toBuffer, bufferToInt } from 'ethereumjs-util'
const promisify = require('util.promisify')
const Trie = require('merkle-patricia-tree')

/**
 * Options for running a block.
 */
export interface RunBlockOpts {
  /**
   * The [`Block`](https://github.com/ethereumjs/interstatejs-block) to process
   */
  block: Block
  /**
   * Root of the state trie
   */
  root?: Buffer
  /**
   * Whether to generate the stateRoot and exitsRoot. If false `runBlock` will check the
   * roots of the block against the Trie.
   */
  generate?: boolean
  /**
   * If true, will skip block validation
   */
  skipBlockValidation?: boolean
}

/**
 * Result of [[runBlock]]
 */
export interface RunBlockResult {
  /**
   * Receipts generated for transactions in the block
   */
  receipts: TxReceipt[]
  /**
   * Results of executing the transactions in the block
   */
  results: RunTxResult[]
}

/**
 * Receipt generated for a transaction
 */
export interface TxReceipt {
  /**
   * Status of transaction, `1` if successful, `0` if an exception occured
   */
  status: 0 | 1
  /**
   * Gas used
   */
  gasUsed: Buffer
  /**
   * Bloom bitvector
   */
  bitvector: Buffer
  /**
   * Logs emitted
   */
  logs: any[]
}

/**
 * @ignore
 */
export default async function runBlock(this: VM, opts: RunBlockOpts): Promise<RunBlockResult> {
  if (opts === undefined) {
    throw new Error('invalid input, opts must be provided')
  }
  if (!opts.block) {
    throw new Error('invalid input, block must be provided')
  }

  const state = this.stateManager
  const block = opts.block
  const generateStateRoot = !!opts.generate

  /**
   * The `beforeBlock` event.
   *
   * @event Event: beforeBlock
   * @type {Object}
   * @property {Block} block emits the block that is about to be processed
   */
  await this._emit('beforeBlock', opts.block)

  // Set state root if provided
  if (opts.root) {
    await state.setStateRoot(opts.root)
  }

  // Checkpoint state
  await state.checkpoint()
  let result

  try {
    result = await applyBlock.bind(this)(block, opts.skipBlockValidation)
  } catch (err) {
    await state.revert()
    throw err
  }

  // Persist state
  await state.commit()
  const stateRoot = await state.getStateRoot()
  const exitsRoot = await state.getExitsRoot(bufferToInt(opts.block.header.number));

  // Given the generate option, either set resulting header
  // values to the current block, or validate the resulting
  // header values against the current block.
  if (generateStateRoot) {
    block.header.exitsRoot = exitsRoot
    block.setOutputs();
    block.header.stateRoot = stateRoot
  } else {
    if (stateRoot.toString('hex') !== block.header.stateRoot.toString('hex')) {
      throw new BlockStateRootError()
    }
    if (exitsRoot.toString('hex') !== block.header.exitsRoot.toString('hex')) {
      throw new BlockExitsRootError()
    }
  }

  /**
   * The `afterBlock` event
   *
   * @event Event: afterBlock
   * @type {Object}
   * @property {Object} result emits the results of processing a block
   */
  await this._emit('afterBlock', {
    receipts: result.receipts,
    results: result.results,
  })

  if (result.results) {
    for (let i = 0; i < result.results.length; i++) {
      const tx: Transaction = block.transactions[i]
      const root = result.results[i].stateRoot
      let buf = root.toBuffer()
      if (generateStateRoot) {
        tx.stateRoot = buf
      } else {
        if (tx.stateRoot) {
          if (buf.toString('hex') !== tx.stateRoot.toString('hex')) {
            throw new TransactionStateError(i)
          }
        }
      }
    }
  }

  return { receipts: result.receipts, results: result.results }
}

/**
 * Validates and applies a block, computing the results of
 * applying its transactions. This method doesn't modify the
 * block itself. It computes the block rewards and puts
 * them on state (but doesn't persist the changes).
 * @param {Block} block
 * @param {Boolean} [skipBlockValidation=false]
 */
async function applyBlock(this: VM, block: any, skipBlockValidation = false) {
  // Validate block
  // if (!skipBlockValidation) {
  //   await promisify(block.validate).bind(block)(this.blockchain)
  // }
  // Apply transactions
  const txResults = await applyTransactions.bind(this)(block)
  // Pay ommers and miners
  // await assignBlockRewards.bind(this)(block)
  return txResults
}

/**
 * Applies the transactions in a block, computing the receipts
 * as well as gas usage and some relevant data. This method is
 * side-effect free (it doesn't modify the block nor the state).
 * @param {Block} block
 */
async function applyTransactions(this: VM, block: any) {
  const bloom = new Bloom()
  // the total amount of gas used processing these transactions
  let gasUsed = new BN(0)
  const receiptTrie = new Trie()
  const receipts : TxReceipt[] = []
  const txResults : RunTxResult[] = []

  /*
   * Process transactions
   */
  for (let txIdx = 0; txIdx < block.transactions.length; txIdx++) {
    const tx = block.transactions[txIdx] as Transaction;

    // Run the tx through the VM
    const txRes = await this.runTx({
      tx: tx,
      block: block,
    })
    txResults.push(txRes)

    // Add to total block gas usage
    gasUsed = gasUsed.add(txRes.gasUsed)
    // Combine blooms via bitwise OR
    bloom.or(txRes.bloom)

    const txReceipt: TxReceipt = {
      status: txRes.execResult.exceptionError ? 0 : 1, // Receipts have a 0 as status on error
      gasUsed: gasUsed.toArrayLike(Buffer),
      bitvector: txRes.bloom.bitvector,
      logs: txRes.execResult.logs || [],
    }
    receipts.push(txReceipt)

    // Add receipt to trie to later calculate receipt root
    await promisify(receiptTrie.put).bind(receiptTrie)(
      encode(txIdx),
      encode(Object.values(txReceipt)),
    )
  }

  return {
    bloom,
    gasUsed,
    receiptRoot: receiptTrie.root,
    receipts,
    results: txResults,
  }
}