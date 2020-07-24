import BN = require('bn.js')
import Account from 'ethereumjs-account'
import Blockchain from 'ethereumjs-blockchain'
import Common from 'ethereumjs-common'
import { StateManager } from './state'
import { default as runCode, RunCodeOpts } from './runCode'
import { default as runCall, RunCallOpts } from './runCall'
import { default as runTx, RunTxOpts, RunTxResult } from './runTx'
import { default as runBlock, RunBlockOpts, RunBlockResult } from './runBlock'
import { EVMResult, ExecResult } from './evm/evm'
import { OpcodeList, getOpcodesForHF } from './evm/opcodes'
import runBlockchain from './runBlockchain'
import { common, getChildRelayAddressFromCommon } from '@interstatejs/utils'
import SparseMerkleTree from '@interstatejs/sparse-merkle-tree'
const promisify = require('util.promisify')
const AsyncEventEmitter = require('async-eventemitter')

export * from './witness';
export * from './exceptions';

/**
 * Options for instantiating a [[VM]].
 */
export interface VMOpts {
  /**
   * The chain the VM operates on
   */
  chain?: string
  /**
   * Hardfork rules to be used
   */
  hardfork?: string
  /**
   * A [[StateManager]] instance to use as the state store (Beta API)
   */
  stateManager?: StateManager
  /**
   * A [merkle-patricia-tree](https://github.com/ethereumjs/merkle-patricia-tree) instance for the state tree (ignored if stateManager is passed)
   * @deprecated
   */
  state?: SparseMerkleTree // TODO
  /**
   * A [blockchain](https://github.com/ethereumjs/ethereumjs-blockchain) object for storing/retrieving blocks
   */
  blockchain?: Blockchain
  /**
   * If true, create entries in the state tree for the precompiled contracts, saving some gas the
   * first time each of them is called.
   *
   * If this parameter is false, the first call to each of them has to pay an extra 25000 gas
   * for creating the account.
   *
   * Setting this to true has the effect of precompiled contracts' gas costs matching mainnet's from
   * the very first call, which is intended for testing networks.
   */
  activatePrecompiles?: boolean
  /**
   * Allows unlimited contract sizes while debugging. By setting this to `true`, the check for contract size limit of 24KB (see [EIP-170](https://git.io/vxZkK)) is bypassed
   */
  allowUnlimitedContractSize?: boolean
  /**
   * Determines whether to create MessageWitness objects.
  */
  produceWitness?: boolean;
  common?: Common
}

/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
export default class VM extends AsyncEventEmitter {
  opts: VMOpts
  _common: Common
  stateManager: StateManager
  blockchain: Blockchain
  relayAddress: Buffer
  allowUnlimitedContractSize: boolean
  produceWitness: boolean
  _opcodes: OpcodeList
  public readonly _emit: (topic: string, data: any) => Promise<void>

  static async create(opts: VMOpts): Promise<VM> {
    let stateManager: StateManager;
    if (opts.stateManager) {
      stateManager = opts.stateManager;
    } else {
      const tree = opts.state || await SparseMerkleTree.create(undefined, undefined, 160)
      if (opts.activatePrecompiles) {
        for (let i = 1; i <= 8; i++) {
          await tree.update(
            new BN(i).toArrayLike(Buffer, 'be', 20),
            new Account().serialize()
          )
        }
      }
      stateManager = new StateManager({ common: opts.common, tree })
    }
    return new VM({ ...opts, stateManager })
  }

  /**
   * Instantiates a new [[VM]] Object.
   * @param opts - Default values for the options are:
   *  - `chain`: 'mainnet'
   *  - `hardfork`: 'petersburg' [supported: 'byzantium', 'constantinople', 'petersburg', 'istanbul' (DRAFT) (will throw on unsupported)]
   *  - `activatePrecompiles`: false
   *  - `allowUnlimitedContractSize`: false [ONLY set to `true` during debugging]
   */
  constructor(opts: VMOpts = {}) {
    super()

    this.opts = opts

    if (opts.common) {
      if (opts.chain || opts.hardfork) {
        throw new Error(
          'You can only instantiate the VM class with one of: opts.common, or opts.chain and opts.hardfork',
        )
      }

      this._common = opts.common
    } else {
      // const chain = opts.chain ? opts.chain : 'mainnet'
      // const hardfork = opts.hardfork ? opts.hardfork : 'petersburg'
      // const supportedHardforks = ['byzantium', 'constantinople', 'petersburg', 'istanbul']

      // this._common = new Common(chain, hardfork, supportedHardforks)
      this._common = common
    }
    this.relayAddress = getChildRelayAddressFromCommon(this._common)
    // Set list of opcodes based on HF
    this._opcodes = getOpcodesForHF(this._common.hardfork()!)

    if (opts.stateManager) {
      this.stateManager = opts.stateManager
    } else if (opts.state) {
      this.stateManager = new StateManager({ common: opts.common, tree: opts.state });
    } else {
      this.stateManager = new StateManager({ tree: new SparseMerkleTree(undefined, undefined, 160) });
    }

    this.blockchain = opts.blockchain || new Blockchain({ common: this._common })

    this.allowUnlimitedContractSize =
      opts.allowUnlimitedContractSize === undefined ? false : opts.allowUnlimitedContractSize

    this.produceWitness =
      opts.produceWitness === undefined ? false : opts.produceWitness
    // We cache this promisified function as it's called from the main execution loop, and
    // promisifying each time has a huge performance impact.
    this._emit = promisify(this.emit.bind(this))
  }

  /**
   * Processes blocks and adds them to the blockchain.
   *
   * This method modifies the state.
   *
   * @param blockchain -  A [blockchain](https://github.com/ethereum/ethereumjs-blockchain) object to process
   * @param cb - the callback function
   */
  runBlockchain(blockchain: any): Promise<void> {
    return runBlockchain.bind(this)(blockchain)
  }

  /**
   * Processes the `block` running all of the transactions it contains and updating the miner's account
   *
   * This method modifies the state. If `generate` is `true`, the state modifications will be
   * reverted if an exception is raised. If it's `false`, it won't revert if the block's header is
   * invalid. If an error is thrown from an event handler, the state may or may not be reverted.
   *
   * @param opts - Default values for options:
   *  - `generate`: false
   */
  runBlock(opts: RunBlockOpts): Promise<RunBlockResult> {
    return runBlock.bind(this)(opts)
  }

  /**
   * Process a transaction. Run the vm. Transfers eth. Checks balances.
   *
   * This method modifies the state. If an error is thrown, the modifications are reverted, except
   * when the error is thrown from an event handler. In the latter case the state may or may not be
   * reverted.
   */
  runTx(opts: RunTxOpts): Promise<RunTxResult> {
    return runTx.bind(this)(opts)
  }

  /**
   * runs a call (or create) operation.
   *
   * This method modifies the state.
   */
  runCall(opts: RunCallOpts): Promise<EVMResult> {
    return runCall.bind(this)(opts)
  }

  /**
   * Runs EVM code.
   *
   * This method modifies the state.
   */
  runCode(opts: RunCodeOpts): Promise<ExecResult> {
    return runCode.bind(this)(opts)
  }

  // /**
  //  * Returns a copy of the [[VM]] instance.
  //  */
  // copy(): VM {
  //   return new VM({
  //     stateManager: this.stateManager.copy(),
  //     blockchain: this.blockchain,
  //     common: this._common,
  //   })
  // }
}
