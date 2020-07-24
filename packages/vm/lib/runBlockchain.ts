import Blockchain from 'ethereumjs-blockchain'
import VM from './index'
const async = require('async')

/**
 * @ignore
 */
export default function runBlockchain(this: VM, blockchain: Blockchain): Promise<void> {
  return new Promise((resolve, reject) => {
    const self = this
    let headBlock: any
    let parentState: Buffer

    blockchain = blockchain || this.blockchain

    // setup blockchain iterator
    blockchain.iterator('vm', processBlock, (err: Error) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })

    async function processBlock(block: any, reorg: boolean) {
      // async.series([getStartingState, runBlock])
      await getStartingState()
      await runBlock()
      
      // determine starting state for block run
      function getStartingState() {
        return new Promise((resolve, reject) => {
          // if we are just starting or if a chain re-org has happened
          if (!headBlock || reorg) {
            blockchain.getBlock(block.header.parentHash, async function(err: any, parentBlock: any) {
              if (err) return reject(err)
              parentState = parentBlock.header.stateRoot
              // generate genesis state if we are at the genesis block
              // we don't have the genesis state
              if (!headBlock) {
                await self.stateManager.generateCanonicalGenesis()
                return resolve()
              }
            })
          } else {
            parentState = headBlock.header.stateRoot
            return resolve()
          }
        })
      }

      // run block, update head if valid
      async function runBlock() {
        return new Promise((resolve, reject) => {
          self
          .runBlock({
            block: block,
            root: parentState,
          })
          .then(() => {
            // set as new head block
            headBlock = block
            resolve()
          })
          .catch(err => {
            // remove invalid block
            blockchain.delBlock(block.header.hash(), function() {
              reject(err)
            })
          })
        })
      }
    }
  })
}
