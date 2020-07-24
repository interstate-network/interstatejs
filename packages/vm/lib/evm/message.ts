import BN = require('bn.js')
import { PrecompileFunc } from './precompiles'

export default class Message {
  to: Buffer
  value: BN
  caller: Buffer
  gasLimit: BN
  data: Buffer
  depth: number
  code: Buffer | PrecompileFunc
  _codeAddress: Buffer
  isStatic: boolean
  isCompiled: boolean
  isFirstIncoming: boolean
  salt: Buffer
  selfdestruct: any
  delegatecall: boolean

  constructor(opts: any) {
    // console.log(opts)
    this.to = opts.to
    this.value = opts.value ? new BN(opts.value) : new BN(0)
    this.caller = opts.caller
    this.gasLimit = opts.gasLimit ? new BN(opts.gasLimit) : new BN(0)
    this.data = opts.data || Buffer.alloc(0)
    this.depth = opts.depth || 0
    this.code = opts.code
    this._codeAddress = opts.codeAddress
    this.isStatic = opts.isStatic || false
    this.isCompiled = opts.isCompiled || false // For CALLCODE, TODO: Move from here
    this.isFirstIncoming = opts.isFirstIncoming || false
    this.salt = opts.salt // For CREATE2, TODO: Move from here
    this.selfdestruct = opts.selfdestruct // TODO: Move from here
    this.delegatecall = opts.delegatecall || false
  }

  get codeAddress(): Buffer {
    return this._codeAddress ? this._codeAddress : this.to
  }
}
