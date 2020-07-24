import {
  toBuffer, rlp, defineProperties, publicToAddress, bufferToInt, ecrecover, BN, stripZeros, rlphash, ecsign, bufferToHex
} from "ethereumjs-util";

import Common from "ethereumjs-common";

import {
  PrefixedHexString, BufferLike, TxData, TransactionOptions, TransactionType, SignedTransactionJson, IncomingTransactionJson
} from "./types";
import { encodeRollupTransaction } from "./rollup";
import { Transaction, FakeTransaction } from ".";
import { common, toHex } from '@interstatejs/utils'
import { hashABI } from "./encode";
const ABI = require('ethereumjs-abi');

// secp256k1n/2
const N_DIV_2 = new BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16)

export default class UnionTransaction implements Transaction {
  public type!: TransactionType;
  public _common: Common
  private _senderPubKey?: Buffer
  private _from?: Buffer

  /* <-- Incoming Tx Fields --> */
  public itxIndex!: Buffer;

  /* <-- Universal Fields --> */
  public raw!: Buffer[]
  public from!: Buffer
  public to!: Buffer
  public gasLimit!: Buffer
  public value!: Buffer
  public data!: Buffer

  /* <-- Signed Tx Fields --> */
  public nonce!: Buffer
  public gasPrice!: Buffer
  public v!: Buffer
  public r!: Buffer
  public s!: Buffer

  /* <-- State Root --> */
  public stateRoot!: Buffer

  /* <-- Type Checkers --> */
  get isIncoming() {
    /* This is a getter for now to avoid needing to rewrite existing code throughout the monorepo */
    return this.type == TransactionType.incoming;
  }
  isSigned = () => this.type == TransactionType.signed;
  isFake = () => this.type == TransactionType.fake;

  /* <-- Encoding/Decoding --> */
  encodeForDb = (): SignedTransactionJson | IncomingTransactionJson => this.encode(true, true, true);
  toJsonRpc = (): SignedTransactionJson | IncomingTransactionJson => {
    let output = this.encodeForDb();
    let input = output.data + "";
    delete output.data;
    output.input = input;
    return output;
  }

  toRollup(outputRoot: Buffer = this.stateRoot): Buffer {
    if (this.isIncoming) return outputRoot;
    return Buffer.concat([rlp.encode(this.raw), outputRoot]);
  }

  encode(includeHash?: boolean, includeType?: boolean, includeFrom?: boolean): SignedTransactionJson | IncomingTransactionJson {
    let baseData: any = {
      to: bufferToHex(this.to),
      gasLimit: bufferToHex(this.gasLimit),
      value: bufferToHex(this.value),
      data: bufferToHex(this.data)
    };
    if (includeHash) baseData.hash = this.hash();
    if (includeType) baseData._type = this.type.toString();
    if (includeFrom || this.isFake()) baseData.from = bufferToHex(this._from || this.from); // this.getSenderAddress();
    if (this.isIncoming) {
      baseData = {
        ...baseData,
        itxIndex: bufferToHex(this.itxIndex),
        from: bufferToHex(this.from),
      }
    }
    else if (this.isFake()) {
      baseData = {
        ...baseData,
        nonce: bufferToHex(this.nonce),
        gasPrice: bufferToHex(this.gasPrice),
      }
    }
    else {
      baseData = {
        ...baseData,
        nonce: bufferToHex(this.nonce),
        gasPrice: bufferToHex(this.gasPrice),
        v: bufferToHex(this.v),
        r: bufferToHex(this.r),
        s: bufferToHex(this.s),
      }
    }
    if (this.stateRoot) {
      baseData.stateRoot = bufferToHex(this.stateRoot)
    }
    return baseData;
  }

  static fromJSON(
    json: SignedTransactionJson | IncomingTransactionJson,
    type?: TransactionType,
    options?: TransactionOptions
  ): UnionTransaction {
    // for (let field of ['gas', 'gasLimit', 'gasPrice', ])
    let tx = new UnionTransaction(<TxData> json, options);
    let expectedType = type || json._type;
    if (expectedType == TransactionType.fake) tx.type = TransactionType.fake;
    if (
      expectedType &&
      expectedType != TransactionType.none &&
      tx.type !== expectedType
    ) throw new Error(`Unexpected transaction type: got ${tx.type} expected ${expectedType}`);
    return tx;
  }

  /**
   * Returns the rlp encoding of the transaction
   */
  serialize(): Buffer {
    // Note: This never gets executed, defineProperties overwrites it.
    return rlp.encode(this.raw)
  }

  /**
   * Returns the transaction in JSON format
   * @see {@link https://github.com/ethereumjs/ethereumjs-util/blob/master/docs/index.md#defineproperties|ethereumjs-util}
   */
  toJSON(labels: boolean = false): { [key: string]: string } | string[] {
    // Note: This never gets executed, defineProperties overwrites it.
    return {}
  }

  /* <-- Constructor --> */
  constructor(
    data: Buffer | PrefixedHexString | BufferLike[] | IncomingTransactionJson | SignedTransactionJson | TxData = {},
    opts: TransactionOptions = {}
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
      // const hardfork = opts.hardfork ? opts.hardfork : 'istanbul'

      // this._common = new Common(chain, hardfork)
      this._common = common
    }
    let setType = (_type: TransactionType) => {
      this.type = _type;
      switch (_type) {
        case TransactionType.fake:
          defineProperties(this, SignedTxFields, data);
          Object.defineProperty(this, 'from', {
            enumerable: true,
            configurable: true,
            get: () => this.getSenderAddress(),
            set: val => (val && (this._from = toBuffer(val))),
          });
          const txData = data as TxData
          if (txData.from) this.from = toBuffer(txData.from);
          break;
        case TransactionType.signed:
          Object.defineProperty(this, 'from', {
            enumerable: true,
            configurable: true,
            get: () => this.getSenderAddress(),
          });
          defineProperties(this, SignedTxFields, data);
          break;
        case TransactionType.incoming: 
          defineProperties(this, IncomingTxFields, data);
          break;
        default: throw new Error('Could not identify transaction type.')
      }
    }

    let _inputParams: Buffer | Buffer[] | null = null;
    if (!data) setType(TransactionType.fake);
    else if (typeof data == 'string') _inputParams = rlp.decode(toBuffer(data));
    else if (Buffer.isBuffer(data)) _inputParams = rlp.decode(data);
    else if (Array.isArray(data)) _inputParams = data.map((f) => toBuffer(f));
    else if (typeof data === "object") {
      if (data.stateRoot) this.stateRoot = toBuffer(data.stateRoot);
      if (data._type !== undefined) setType(<TransactionType> data._type);
      else {
        const keys = Object.keys(data);
        if (keys.indexOf('itxIndex') !== -1) setType(TransactionType.incoming);
        else if (keys.indexOf('v') !== -1) setType(TransactionType.signed);
        else setType(TransactionType.fake);
      }
    }
    else throw new Error('Fields Not Recognized.');

    if (_inputParams) {
      if (!Array.isArray(_inputParams)) throw new Error('Did not decode input data to buffer array.')
      // attached serialize
      if (_inputParams.length == SignedTxFields.length) setType(TransactionType.signed);
      else if (_inputParams[0].length == 20) setType(TransactionType.incoming);
      else setType(TransactionType.fake)
    }
    this._validateV(this.v)
    this._overrideVSetterWithValidation()
  }

  /**
   * If the tx's `to` is to the creation address
   */
  toCreationAddress(): boolean {
    return this.to.toString('hex') === ''
  }

  /**
   * returns chain ID
   */
  getChainId(): number {
    return this._common.chainId()
  }

  /**
   * Computes a sha3-256 hash of the serialized tx
   * @param includeSignature - Whether or not to include the signature
   */
  hash(includeSignature: boolean = true): Buffer {
    if (this.isIncoming) {
      return hashABI(this);
      // return IncomingTransaction.prototype.hash.apply(this, [includeSignature]);
    }
    if (this.isFake()) {
      if (includeSignature && this._from && this._from.toString('hex') !== '') {
        // include a fake signature using the from address as a private key
        const fakeKey = Buffer.concat([this._from, this._from.slice(0, 12)])
        this.sign(fakeKey)
      }
    }
    let items
    if (includeSignature) {
      items = this.raw
    } else {
      if (this._implementsEIP155()) {
        items = [
          ...this.raw.slice(0, 6),
          toBuffer(this.getChainId()),
          // TODO: stripping zeros should probably be a responsibility of the rlp module
          stripZeros(toBuffer(0)),
          stripZeros(toBuffer(0)),
        ]
      } else {
        items = this.raw.slice(0, 6)
      }
    }
    // create hash
    return rlphash(items)
    // if (this.isFake() && includeSignature && this._from && this._from.toString('hex') !== '') {
    //   // include a fake signature using the from address as a private key
    //   const fakeKey = Buffer.concat([this._from, this._from.slice(0, 12)])
    //   this.sign(fakeKey)
    // } else if (this.isIncoming) {
    //   items = this.raw;
    // } else {
    //   if (this._implementsEIP155()) {
    //     items = [
    //       ...this.raw.slice(0, 6),
    //       toBuffer(this.getChainId()),
    //       // TODO: stripping zeros should probably be a responsibility of the rlp module
    //       stripZeros(toBuffer(0)),
    //       stripZeros(toBuffer(0)),
    //     ]
    //   } else {
    //     items = this.raw.slice(0, 6);
    //   }
    // }

    // // create hash
    // return rlphash(items)
  }

  /**
   * returns the public key of the sender
   */
  getSenderPublicKey(): Buffer {
    if (this.isIncoming) throw new Error('Can not derive public key from incoming transaction')
    if (!this.verifySignature()) {
      console.log(`Got error in signature`)
      const { v, r, s } = this;
      console.log({v: toHex(v), r: toHex(r), s: toHex(s) })
      throw new Error('Invalid Signature')
    }

    // If the signature was verified successfully the _senderPubKey field is defined
    return this._senderPubKey!
  }

  /**
   * returns the sender's address
   */
  getSenderAddress(): Buffer {
    if (this.isIncoming) return this.from;
    // if (this._from) return this._from;
    if (this.isFake()) {
      // const fakeKey = Buffer.concat([this._from, this._from.slice(0, 12)])
      // this.sign(fakeKey)
      if (!this._from) throw new Error('Fake tx does not have from address.')
      return this._from;
    }
    if (this._from) return this._from;
    const pubkey = this.getSenderPublicKey()
    this._from = publicToAddress(pubkey)
    return this._from
  }

    /**
   * Determines if the signature is valid
   */
  verifySignature(): boolean {
    if (this.isIncoming) return true;
    const msgHash = this.hash(false)
    // All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
    if (this._common.gteHardfork('homestead') && new BN(this.s).cmp(N_DIV_2) === 1) {
      return false
    }

    try {
      const v = bufferToInt(this.v)
      const useChainIdWhileRecoveringPubKey =
        v >= this.getChainId() * 2 + 35 && this._common.gteHardfork('spuriousDragon')
      this._senderPubKey = ecrecover(
        msgHash,
        v,
        this.r,
        this.s,
        useChainIdWhileRecoveringPubKey ? this.getChainId() : undefined,
      )
    } catch (e) {
      return false
    }

    return !!this._senderPubKey
  }

  /**
   * sign a transaction with a given private key
   * @param privateKey - Must be 32 bytes in length
   */
  sign(privateKey: Buffer) {
    if (this.isIncoming) throw new Error('Attempted to sign incoming transaction.')
    // We clear any previous signature before signing it. Otherwise, _implementsEIP155's can give
    // different results if this tx was already signed.
    this.v = new Buffer([])
    this.s = new Buffer([])
    this.r = new Buffer([])

    const msgHash = this.hash(false)
    const sig = ecsign(msgHash, privateKey)
    
    if (this._implementsEIP155()) {
      sig.v += this.getChainId() * 2 + 8
    }

    Object.assign(this, sig)
  }

  /**
   * The amount of gas paid for the data in this tx
   */
  getDataFee(): BN {
    if (this.isIncoming) return new BN(0);
    const data = this.raw[5]
    const cost = new BN(0)
    for (let i = 0; i < data.length; i++) {
      data[i] === 0
        ? cost.iaddn(this._common.param('gasPrices', 'txDataZero'))
        : cost.iaddn(this._common.param('gasPrices', 'txDataNonZero'))
    }
    return cost
  }

  /**
   * the minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
   */
  getBaseFee(): BN {
    if (this.isIncoming) return new BN(0);
    const fee = this.getDataFee().iaddn(this._common.param('gasPrices', 'tx'))
    if (this._common.gteHardfork('homestead') && this.toCreationAddress()) {
      fee.iaddn(this._common.param('gasPrices', 'txCreation'))
    }
    return fee
  }

  /**
   * the up front amount that an account must have for this transaction to be valid
   */
  getUpfrontCost(): BN {
    if (this.isIncoming) return new BN(0);
    return new BN(this.gasLimit).imul(new BN(this.gasPrice)).iadd(new BN(this.value))
  }

  /**
   * Validates the signature and checks to see if it has enough gas.
   */
  validate(): boolean
  validate(stringError: false): boolean
  validate(stringError: true): string
  validate(stringError: boolean = false): boolean | string {
    if (this.isIncoming) {
      if (stringError) return '';
      return true;
    }
    const errors = []
    if (!this.verifySignature()) {
      errors.push('Invalid Signature')
    }

    if (this.getBaseFee().cmp(new BN(this.gasLimit)) > 0) {
      errors.push([`gas limit is too low. Need at least ${this.getBaseFee()}`])
    }

    if (stringError === false) {
      return errors.length === 0
    } else {
      return errors.join(' ')
    }
  }

  validateNonce(expectedNonce: Buffer): boolean {
    let nonce;
    if (this.isSigned() && this.nonce.length === 0) {
      nonce = Buffer.from([0]);
    } else {
      nonce = this.nonce;
    }
    return nonce.equals(expectedNonce);
  }

  private _validateV(v?: Buffer): void {
    if (this.isIncoming) return;
    if (v === undefined || v.length === 0) {
      return
    }

    if (!this._common.gteHardfork('spuriousDragon')) {
      return
    }

    const vInt = bufferToInt(v)

    if (vInt === 27 || vInt === 28) {
      return
    }

    const isValidEIP155V =
      vInt === this.getChainId() * 2 + 35 ||
      vInt === this.getChainId() * 2 + 36

    if (!isValidEIP155V) {
      throw new Error([
        `Incompatible EIP155-based V ${vInt} and chain id ${this.getChainId()}.`,
        `See the second parameter of the Transaction constructor to set the chain id.`,
      ].join(' '))
    }
  }

  private _isSigned(): boolean {
    return !this.isIncoming && this.v.length > 0 && this.r.length > 0 && this.s.length > 0;
  }

  private _overrideVSetterWithValidation() {
    if (this.isIncoming) return;
    const vDescriptor = Object.getOwnPropertyDescriptor(this, 'v')!

    Object.defineProperty(this, 'v', {
      ...vDescriptor,
      set: v => {
        if (v !== undefined) {
          this._validateV(toBuffer(v))
        }

        vDescriptor.set!(v)
      },
    })
  }

  private _implementsEIP155(): boolean {
    const onEIP155BlockOrLater = this._common.gteHardfork('spuriousDragon')

    if (!this._isSigned()) {
      // We sign with EIP155 all unsigned transactions after spuriousDragon
      return onEIP155BlockOrLater
    }

    // EIP155 spec:
    // If block.number >= 2,675,000 and v = CHAIN_ID * 2 + 35 or v = CHAIN_ID * 2 + 36, then when computing
    // the hash of a transaction for purposes of signing or recovering, instead of hashing only the first six
    // elements (i.e. nonce, gasprice, startgas, to, value, data), hash nine elements, with v replaced by
    // CHAIN_ID, r = 0 and s = 0.
    const v = bufferToInt(this.v)

    const vAndChainIdMeetEIP155Conditions =
      v === this.getChainId() * 2 + 35 || v === this.getChainId() * 2 + 36
    return vAndChainIdMeetEIP155Conditions && onEIP155BlockOrLater
  }
}

export const SignedTxFields = [
  {
    name: 'nonce',
    length: 32,
    allowLess: true,
    default: new Buffer([]),
  },
  {
    name: 'gasPrice',
    length: 32,
    allowLess: true,
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
    name: 'to',
    allowZero: true,
    length: 20,
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
  {
    name: 'v',
    allowZero: true,
    default: new Buffer([]),
  },
  {
    name: 'r',
    length: 32,
    allowZero: true,
    allowLess: true,
    default: new Buffer([]),
  },
  {
    name: 's',
    length: 32,
    allowZero: true,
    allowLess: true,
    default: new Buffer([]),
  },
];

export const IncomingTxFields = [
  {
    name: 'from',
    length: 20,
    allowZero: true,
    default: new Buffer([]),
  },
  {
    name: 'to',
    length: 20,
    allowZero: true,
    default: new Buffer([]),
  },
  // {
  //   name: 'sourceBlock',
  //   length: 32,
  //   allowLess: true,
  //   allowZero: true,
  //   default: new Buffer([]),
  // },
  {
    name: 'itxIndex',
    length: 32,
    allowLess: true,
    allowZero: true,
    default: new Buffer([]),
  },
  {
    name: 'gasLimit',
    alias: 'gas',
    length: 32,
    allowLess: true,
    allowZero: true,
    default: new Buffer([]),
  },
  {
    name: 'value',
    length: 32,
    allowLess: true,
    allowZero: true,
    default: new Buffer([]),
  },
  {
    name: 'data',
    alias: 'input',
    allowZero: true,
    default: new Buffer([]),
  },
]