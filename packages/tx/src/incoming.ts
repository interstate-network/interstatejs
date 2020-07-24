import { BN, defineProperties, rlp, rlphash, bufferToHex } from 'ethereumjs-util';
import Common from 'ethereumjs-common';
import Transaction from './transaction';
import { IncomingTxData, TransactionOptions, TransactionType, BufferLike, PrefixedHexString, IncomingTransactionJson } from './types';
import { encodeABI, hashABI } from './encode';
import { common } from '@interstatejs/utils';
const ABI = require('ethereumjs-abi');

/**
 * A transaction from the parent chain
*/
export default class IncomingTransaction implements Transaction {
  public type: TransactionType = TransactionType.incoming
  // public source: TransactionSource;
  public raw!: Buffer[]
  public itxIndex!: Buffer;
  public from!: Buffer
  public to!: Buffer
  public gasLimit!: Buffer
  public value!: Buffer
  public data!: Buffer

  public nonce!: Buffer
  public gasPrice!: Buffer
  public v!: Buffer
  public r!: Buffer
  public s!: Buffer

  public stateRoot!: Buffer

  
  public _common: Common

  isIncoming = true;
  
  getDataFee = () => new BN(0)
  getBaseFee = () => new BN(0)
  getUpfrontCost = () => new BN(0)
  getSenderAddress = () => this.from;

  /**
   * Returns the rlp encoding of the transaction
   */
  serialize = () => rlp.encode(this.raw)
  hash = (_: boolean) => rlphash(this.raw)
  toJSON = () => ({})

  validate(): boolean
  validate(stringError: false): boolean
  validate(stringError: true): string
  validate(stringError: boolean = false): boolean | string {
    if (stringError === false) return false;
    else return ''
  }

  toRollup(outputRoot: Buffer = this.stateRoot): Buffer {
    return outputRoot;
  }
  
  constructor(
    data: Buffer | PrefixedHexString | BufferLike[] | IncomingTxData | IncomingTransactionJson,
    opts: TransactionOptions = {},
  ) {
    // instantiate Common class instance based on passed options
    if (opts.common) {
      if (opts.chain || opts.hardfork) {
        throw new Error(
          'Instantiation with both opts.common, and opts.chain and opts.hardfork parameter not allowed!',
        )
      }
      this._common = opts.common
    } else {
      // const chain = opts.chain ? opts.chain : 'mainnet'
      // const hardfork = opts.hardfork ? opts.hardfork : 'petersburg'

      // this._common = new Common(chain, hardfork)
      this._common = common
    }
    const fields = [
      {
        name: 'itxIndex',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'from',
        length: 20,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'to',
        length: 20,
        allowZero: true,
        default: new Buffer([]),
      },
      {
        name: 'gasLimit',
        alias: 'gas',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'value',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
      },
      {
        name: 'data',
        alias: 'input',
        allowZero: true,
        default: new Buffer([]),
      },
    ]
    // attached serialize
    defineProperties(this, fields, data);
  }

  encode(includeHash?: boolean, includeType?: boolean, includeFrom?: boolean): IncomingTransactionJson {
    let baseData: any = {
      to: bufferToHex(this.to),
      gasLimit: bufferToHex(this.gasLimit),
      value: bufferToHex(this.value),
      data: bufferToHex(this.data),
      stateRoot: bufferToHex(this.stateRoot)
    };
    if (includeHash) baseData.hash = this.hash(false);
    if (includeType) baseData._type = this.type.toString();

    baseData = {
      ...baseData,
      itxIndex: bufferToHex(this.itxIndex),
      from: bufferToHex(this.from),
    }
    return baseData;
  }

  encodeABI() {
    /* const vals =  */
    return encodeABI(this);
  }

  hashABI() {
    return hashABI(this);
  }
}