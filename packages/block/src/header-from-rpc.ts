import { BlockHeader } from './header'
import * as ethUtil from 'ethereumjs-util'
import { ChainOptions } from './types'

/**
 * Creates a new block header object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param chainOptions - An object describing the blockchain
 */
export default function blockHeaderFromRpc(blockParams: any, chainOptions?: ChainOptions) {
  const blockHeader = new BlockHeader(
    {
      parentHash: blockParams.parentHash,
      number: blockParams.number,
      incomingTransactionsIndex: blockParams.incomingTransactionsIndex,
      incomingTransactionsCount: blockParams.incomingTransactionsCount,
      transactionsCount: blockParams.transactionsCount,
      transactionsRoot: blockParams.transactionsRoot,
      stateRoot: blockParams.stateRoot,
      exitsRoot: blockParams.exitsRoot,
      coinbase: blockParams.coinbase,
      timestamp: blockParams.timestamp
    },
    chainOptions,
  )

  // override hash in case something was missing
  blockHeader.hash = function() {
    return ethUtil.toBuffer(blockParams.hash)
  }

  return blockHeader
}
