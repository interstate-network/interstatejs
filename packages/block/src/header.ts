import Common from 'ethereumjs-common'
import * as utils from 'ethereumjs-util'
import { BN, bufferToHex, toBuffer } from 'ethereumjs-util'
import { toBuf, common } from '@interstatejs/utils'
import {
  Blockchain, BlockHeaderData, BufferLike,
  ChainOptions, PrefixedHexString, SetCommittedInput,
  ConfirmedBlockQuery, BlockHeaderJson
} from './types'
import { Buffer } from 'buffer'
import { Block } from './block'
import { CommitmentHeader } from './commitment'
import { ABI_Encoder, HeaderABI, getDecodeABI, setEncodeABI } from './abi';

const { keccak256 } = require('@interstatejs/utils')

/**
 * An object that represents the block header
 */
export class BlockHeader implements ABI_Encoder<BlockHeader> {
  private _commitment!: CommitmentHeader;
  public raw!: Buffer[]
  public parentHash!: Buffer;
  public number!: Buffer;
  public incomingTransactionsIndex!: Buffer;
  public incomingTransactionsCount!: Buffer;
  public transactionsCount!: Buffer;
  public transactionsRoot!: Buffer;
  public stateRoot!: Buffer;
  public exitsRoot!: Buffer;
  public coinbase!: Buffer;
  public timestamp!: Buffer;

  private readonly _common: Common

  get encodedLength(): number {
    return 320;
  }

  static decodeABI = getDecodeABI<BlockHeader>(HeaderABI, BlockHeader);

  /**
   * Creates a new block header.
   * @param data - The data of the block header.
   * @param opts - The network options for this block, and its header, uncle headers and txs.
   */
  constructor(
    data: Buffer | PrefixedHexString | BufferLike[] | BlockHeaderData = [],
    opts: ChainOptions = {},
  ) {
    if (opts.common !== undefined) {
      if (opts.chain !== undefined || opts.hardfork !== undefined) {
        throw new Error(
          'Instantiation with both opts.common and opts.chain / opts.hardfork parameter not allowed!',
        )
      }

      this._common = opts.common
    } else {
      // const chain = opts.chain ? opts.chain : 'mainnet'
      // const hardfork = opts.hardfork ? opts.hardfork : null
      // this._common = new Common(chain, hardfork)
      this._common = common
    }
    const fields = [
      {
        name: 'parentHash',
        length: 32,
        allowZero: true,
        default: utils.zeros(32),
      }, {
        name: 'number',
        allowZero: true,
        default: utils.toBuffer(0),
      }, {
        name: 'incomingTransactionsIndex',
        length: 32,
        allowLess: true,
        allowZero: true,
        default: utils.zeros(32),
      }, {
        name: 'incomingTransactionsCount',
        length: 32,
        allowLess: true,
        allowZero: true,
        default: utils.zeros(32),
      }, {
        name: 'transactionsCount',
        length: 32,
        allowLess: true,
        allowZero: true,
        default: utils.zeros(32),
      }, {
        name: 'transactionsRoot',
        length: 32,
        allowZero: true,
        default: utils.zeros(32),
      }, {
        name: 'stateRoot', 
        length: 32,
        allowZero: true,
        default: utils.zeros(32),
      }, {
        name: 'exitsRoot', 
        length: 32,
        allowZero: false, 
        default: Buffer.from('2def10d13dd169f550f578bda343d9717a138562e0093b380a1120789d53cf10', 'hex'),
      }, {
        name: 'coinbase', 
        length: 20,
        allowZero: true,
        default: utils.zeros(20),
      }, {
        name: 'timestamp',
        allowZero: true,
        default: Buffer.from([]),
      },
    ]
    utils.defineProperties(this, fields, data);
    if ((<BlockHeaderJson> data).commitment) {
      this._commitment = new CommitmentHeader((<BlockHeaderJson> data).commitment);
    }
    setEncodeABI<BlockHeader>(HeaderABI, this);
  }


  /**
   * Validates the gasLimit.
   *
   * @param parentBlock - this block's parent
   */
  // validateGasLimit(parentBlock: Block): boolean {
  //   const pGasLimit = new BN(parentBlock.header.gasLimit)
  //   const gasLimit = new BN(this.gasLimit)
  //   const hardfork = this._getHardfork()

  //   const a = pGasLimit.div(
  //     new BN(this._common.param('gasConfig', 'gasLimitBoundDivisor', hardfork)),
  //   )
  //   const maxGasLimit = pGasLimit.add(a)
  //   const minGasLimit = pGasLimit.sub(a)

  //   return (
  //     gasLimit.lt(maxGasLimit) &&
  //     gasLimit.gt(minGasLimit) &&
  //     gasLimit.gte(this._common.param('gasConfig', 'minGasLimit', hardfork))
  //   )
  // }

  get commitment(): CommitmentHeader {
    return this._commitment
  }

  toConfirmedBlockQuery(): ConfirmedBlockQuery {
    return { blockHash: this.hash(), blockNumber: this.number }
  }

  toCommitment(commitData: SetCommittedInput): CommitmentHeader {
    this._commitment = new CommitmentHeader({ header: this, ...commitData });
    return this._commitment;
  }

  /**
   * Validates the entire block header, throwing if invalid.
   *
   * @param blockchain - the blockchain that this block is validating against
   */
  async validate(blockchain: Blockchain): Promise<void> {
    if (this.isGenesis()) {
      return
    }

    const parentBlock = await this._getBlockByHash(blockchain, this.parentHash)

    if (parentBlock === undefined) {
      throw new Error('could not find parent block')
    }

    const number = new BN(this.number)
    if (number.cmp(new BN(parentBlock.header.number).iaddn(1)) !== 0) {
      throw new Error('invalid number')
    }

    if (utils.bufferToInt(this.timestamp) <= utils.bufferToInt(parentBlock.header.timestamp)) {
      throw new Error('invalid timestamp')
    }
  }

  /**
   * Returns the hash of the block header.
   */
  hash(): Buffer {
    return keccak256(toBuffer(this.encodeABI()));
  }

  /**
   * Checks if the block header is a genesis header.
   */
  isGenesis(): boolean {
    return this.number.length === 0
  }

  /**
   * Turns the header into the canonical genesis block header.
   */
  setGenesisParams(): void {
    this.parentHash = toBuf(0, 32);
    this.number = toBuf(0, 32);
    this.incomingTransactionsIndex = toBuf(0, 32);
    this.incomingTransactionsCount = toBuf(0, 32);
    this.transactionsCount = toBuf(0, 32);
    this.transactionsRoot = toBuf(0, 32);
    this.exitsRoot = Buffer.from('2def10d13dd169f550f578bda343d9717a138562e0093b380a1120789d53cf10', 'hex');
    this.coinbase = toBuf(0, 20);
    this.timestamp = toBuf(0, 32);
    this.stateRoot = Buffer.from('4b529be809997a3bb9e6aac629611bfe00c51044f4cb112a8b9b4ac7eab5c19a', 'hex');
  }

  /**
   * Returns the rlp encoding of the block header
   */
  serialize(): Buffer {
    // Note: This never gets executed, defineProperties overwrites it.
    return Buffer.from([])
  }


  /* Temporary replacement for the toJSON function - did not completely replace it to avoid needing to update dependents. */
  encodeJSON(): BlockHeaderJson {
    return {
      parentHash: bufferToHex(this.parentHash),
      number: bufferToHex(this.number),
      incomingTransactionsIndex: bufferToHex(this.incomingTransactionsIndex),
      incomingTransactionsCount: bufferToHex(this.incomingTransactionsCount),
      transactionsCount: bufferToHex(this.transactionsCount),
      transactionsRoot: bufferToHex(this.transactionsRoot),
      stateRoot: bufferToHex(this.stateRoot),
      exitsRoot: bufferToHex(this.exitsRoot),
      coinbase: bufferToHex(this.coinbase),
      timestamp: bufferToHex(this.timestamp),
      commitment: this.commitment ? this.commitment.encodeJSON() : undefined
    }
  }

  /**
   * Returns the block header in JSON format
   *
   * @see {@link https://github.com/ethereumjs/ethereumjs-util/blob/master/docs/index.md#defineproperties|ethereumjs-util}
   */
  toJSON(_labels: boolean = false): { [key: string]: string } | string[] {
    return {};
  }

  private _getHardfork(): string {
    const commonHardFork = this._common.hardfork()

    return commonHardFork !== null
      ? commonHardFork
      : this._common.activeHardfork(utils.bufferToInt(this.number))
  }

  private async _getBlockByHash(blockchain: Blockchain, hash: Buffer): Promise<Block | undefined> {
    return new Promise((resolve, reject) => {
      blockchain.getBlock(hash, (err, block) => {
        if (err) {
          reject(err)
          return
        }

        resolve(block)
      })
    })
  }
}

export interface BlockHeader {
  encodeABI: () => BufferLike;
  decodeABI: (input: BufferLike) => BlockHeader;
}