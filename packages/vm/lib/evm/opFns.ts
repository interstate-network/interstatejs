import BN = require('bn.js')
import * as utils from 'ethereumjs-util'
import { ERROR, VmError } from '../exceptions'
import { RunState } from './interpreter'
import { BalanceWitness, ExtCodeSizeWitness, ExtCodeHashWitness, ExtCodeCopyWitness, SelfBalanceWitness } from '../witness/global-state';
import { sha3 } from './interpreter-witness';
import { BlockHashWitness } from '../witness/history';
import { CoinbaseWitness, TimestampWitness, NumberWitness, DifficultyWitness, GaslimitWitness, ChainidWitness } from '../witness/header';
import { SloadWitness, SstoreWitness } from '../witness/storage';
import { Log0Witness, Log1Witness, Log2Witness, Log3Witness, Log4Witness } from '../witness/logs';
import { CallWitness, CallCodeWitness, DelegateCallWitness, StaticCallWitness } from '../witness/call';

const MASK_160 = new BN(1).shln(160).subn(1)

// Find Ceil(`this` / `num`)
function divCeil(a: BN, b: BN) {
  const div = a.div(b)
  const mod = a.mod(b)

  // Fast case - exact division
  if (mod.isZero()) return div

  // Round up
  return div.isNeg() ? div.isubn(1) : div.iaddn(1)
}

function addressToBuffer(address: BN) {
  return address.and(MASK_160).toArrayLike(Buffer, 'be', 20)
}

export interface SyncOpHandler {
  (runState: RunState): void
}

export interface AsyncOpHandler {
  (runState: RunState): Promise<void>
}

export type OpHandler = SyncOpHandler | AsyncOpHandler

// the opcode functions
export const handlers: { [k: string]: OpHandler } = {
  STOP: function(runState: RunState) {
    trap(ERROR.STOP)
  },
  ADD: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = a.add(b).mod(utils.TWO_POW256)
    runState.stack.push(r)
  },
  MUL: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = a.mul(b).mod(utils.TWO_POW256)
    runState.stack.push(r)
  },
  SUB: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = a.sub(b).toTwos(256)
    runState.stack.push(r)
  },
  DIV: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    let r
    if (b.isZero()) {
      r = new BN(b)
    } else {
      r = a.div(b)
    }
    runState.stack.push(r)
  },
  SDIV: function(runState: RunState) {
    let [a, b] = runState.stack.popN(2)
    let r
    if (b.isZero()) {
      r = new BN(b)
    } else {
      a = a.fromTwos(256)
      b = b.fromTwos(256)
      r = a.div(b).toTwos(256)
    }
    runState.stack.push(r)
  },
  MOD: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    let r
    if (b.isZero()) {
      r = new BN(b)
    } else {
      r = a.mod(b)
    }
    runState.stack.push(r)
  },
  SMOD: function(runState: RunState) {
    let [a, b] = runState.stack.popN(2)
    let r
    if (b.isZero()) {
      r = new BN(b)
    } else {
      a = a.fromTwos(256)
      b = b.fromTwos(256)
      r = a.abs().mod(b.abs())
      if (a.isNeg()) {
        r = r.ineg()
      }
      r = r.toTwos(256)
    }
    runState.stack.push(r)
  },
  ADDMOD: function(runState: RunState) {
    const [a, b, c] = runState.stack.popN(3)
    let r
    if (c.isZero()) {
      r = new BN(c)
    } else {
      r = a.add(b).mod(c)
    }
    runState.stack.push(r)
  },
  MULMOD: function(runState: RunState) {
    const [a, b, c] = runState.stack.popN(3)
    let r
    if (c.isZero()) {
      r = new BN(c)
    } else {
      r = a.mul(b).mod(c)
    }
    runState.stack.push(r)
  },
  EXP: function(runState: RunState) {
    let [base, exponent] = runState.stack.popN(2)
    if (exponent.isZero()) {
      runState.stack.push(new BN(1))
      return
    }
    const byteLength = exponent.byteLength()
    if (byteLength < 1 || byteLength > 32) {
      trap(ERROR.OUT_OF_RANGE)
    }
    // const gasPrice = runState._common.param('gasPrices', 'expByte')
    // const amount = new BN(byteLength).muln(gasPrice)
    // runState.eei.useGas(amount)

    if (base.isZero()) {
      runState.stack.push(new BN(0))
      return
    }
    const m = BN.red(utils.TWO_POW256)
    const redBase = base.toRed(m)
    const r = redBase.redPow(exponent)
    runState.stack.push(r.fromRed())
  },
  SIGNEXTEND: function(runState: RunState) {
    let [k, val] = runState.stack.popN(2)
    if (k.ltn(31)) {
      const signBit = k
        .muln(8)
        .iaddn(7)
        .toNumber()
      const mask = new BN(1).ishln(signBit).isubn(1)
      if (val.testn(signBit)) {
        val = val.or(mask.notn(256))
      } else {
        val = val.and(mask)
      }
    } else {
      // return the same value
      val = new BN(val)
    }
    runState.stack.push(val)
  },
  // 0x10 range - bit ops
  LT: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = new BN(a.lt(b) ? 1 : 0)
    runState.stack.push(r)
  },
  GT: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = new BN(a.gt(b) ? 1 : 0)
    runState.stack.push(r)
  },
  SLT: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = new BN(a.fromTwos(256).lt(b.fromTwos(256)) ? 1 : 0)
    runState.stack.push(r)
  },
  SGT: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = new BN(a.fromTwos(256).gt(b.fromTwos(256)) ? 1 : 0)
    runState.stack.push(r)
  },
  EQ: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = new BN(a.eq(b) ? 1 : 0)
    runState.stack.push(r)
  },
  ISZERO: function(runState: RunState) {
    const a = runState.stack.pop()
    const r = new BN(a.isZero() ? 1 : 0)
    runState.stack.push(r)
  },
  AND: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = a.and(b)
    runState.stack.push(r)
  },
  OR: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = a.or(b)
    runState.stack.push(r)
  },
  XOR: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    const r = a.xor(b)
    runState.stack.push(r)
  },
  NOT: function(runState: RunState) {
    const a = runState.stack.pop()
    const r = a.notn(256)
    runState.stack.push(r)
  },
  BYTE: function(runState: RunState) {
    const [pos, word] = runState.stack.popN(2)
    if (pos.gten(32)) {
      runState.stack.push(new BN(0))
      return
    }

    const r = new BN(word.shrn((31 - pos.toNumber()) * 8).andln(0xff))
    runState.stack.push(r)
  },
  SHL: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    if (!runState._common.gteHardfork('constantinople')) {
      trap(ERROR.INVALID_OPCODE)
    }
    if (a.gten(256)) {
      runState.stack.push(new BN(0))
      return
    }

    const r = b.shln(a.toNumber()).iand(utils.MAX_INTEGER)
    runState.stack.push(r)
  },
  SHR: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    if (!runState._common.gteHardfork('constantinople')) {
      trap(ERROR.INVALID_OPCODE)
    }
    if (a.gten(256)) {
      runState.stack.push(new BN(0))
      return
    }

    const r = b.shrn(a.toNumber())
    runState.stack.push(r)
  },
  SAR: function(runState: RunState) {
    const [a, b] = runState.stack.popN(2)
    if (!runState._common.gteHardfork('constantinople')) {
      trap(ERROR.INVALID_OPCODE)
    }

    let r
    const isSigned = b.testn(255)
    if (a.gten(256)) {
      if (isSigned) {
        r = new BN(utils.MAX_INTEGER)
      } else {
        r = new BN(0)
      }
      runState.stack.push(r)
      return
    }

    const c = b.shrn(a.toNumber())
    if (isSigned) {
      const shiftedOutWidth = 255 - a.toNumber()
      const mask = utils.MAX_INTEGER.shrn(shiftedOutWidth).shln(shiftedOutWidth)
      r = c.ior(mask)
    } else {
      r = c
    }
    runState.stack.push(r)
  },
  // 0x20 range - crypto
  SHA3: function(runState: RunState) {
    const [offset, length] = runState.stack.popN(2)
    subMemUsage(runState, offset, length)
    let data = Buffer.alloc(0)
    if (!length.isZero()) {
      data = runState.memory.read(offset.toNumber(), length.toNumber())
    }
    // copy fee
    // runState.eei.useGas(
    //   new BN(runState._common.param('gasPrices', 'sha3Word')).imul(divCeil(length, new BN(32))),
    // )
    const r = new BN(utils.keccak256(data))
    runState.stack.push(r)
  },
  // 0x30 range - closure state
  ADDRESS: function(runState: RunState) {
    runState.stack.push(new BN(runState.eei.getAddress()))
  },
  BALANCE: async function(runState: RunState) {
    const address = runState.stack.pop()
    const addressBuf = addressToBuffer(address)
    const balance = await runState.eei.getExternalBalance(addressBuf)
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new BalanceWitness(address, balance))
    }
    runState.stack.push(balance)
  },
  ORIGIN: function(runState: RunState) {
    runState.stack.push(runState.eei.getTxOrigin())
  },
  CALLER: function(runState: RunState) {
    runState.stack.push(runState.eei.getCaller())
  },
  CALLVALUE: function(runState: RunState) {
    runState.stack.push(runState.eei.getCallValue())
  },
  CALLDATALOAD: function(runState: RunState) {
    let pos = runState.stack.pop()
    if (pos.gt(runState.eei.getCallDataSize())) {
      runState.stack.push(new BN(0))
      return
    }

    const i = pos.toNumber()
    let loaded = runState.eei.getCallData().slice(i, i + 32)
    loaded = loaded.length ? loaded : Buffer.from([0])
    const r = new BN(utils.setLengthRight(loaded, 32))

    runState.stack.push(r)
  },
  CALLDATASIZE: function(runState: RunState) {
    const r = runState.eei.getCallDataSize()
    runState.stack.push(r)
  },
  CALLDATACOPY: function(runState: RunState) {
    let [memOffset, dataOffset, dataLength] = runState.stack.popN(3)

    subMemUsage(runState, memOffset, dataLength)
    // runState.eei.useGas(
    //   new BN(runState._common.param('gasPrices', 'copy')).imul(divCeil(dataLength, new BN(32))),
    // )

    const data = getDataSlice(runState.eei.getCallData(), dataOffset, dataLength)
    const memOffsetNum = memOffset.toNumber()
    const dataLengthNum = dataLength.toNumber()
    runState.memory.extend(memOffsetNum, dataLengthNum)
    runState.memory.write(memOffsetNum, dataLengthNum, data)
  },
  CODESIZE: function(runState: RunState) {
    runState.stack.push(runState.eei.getCodeSize())
  },
  CODECOPY: function(runState: RunState) {
    let [memOffset, codeOffset, length] = runState.stack.popN(3)

    subMemUsage(runState, memOffset, length)
    // runState.eei.useGas(
    //   new BN(runState._common.param('gasPrices', 'copy')).imul(divCeil(length, new BN(32))),
    // )

    const data = getDataSlice(runState.eei.getCode(), codeOffset, length)
    const memOffsetNum = memOffset.toNumber()
    const lengthNum = length.toNumber()
    runState.memory.extend(memOffsetNum, lengthNum)
    runState.memory.write(memOffsetNum, lengthNum, data)
  },
  EXTCODESIZE: async function(runState: RunState) {
    const address = runState.stack.pop()
    const size = await runState.eei.getExternalCodeSize(address)
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new ExtCodeSizeWitness(address, size))
    }
    runState.stack.push(size)
  },
  EXTCODECOPY: async function(runState: RunState) {
    let [address, memOffset, codeOffset, length] = runState.stack.popN(4)
    
    // FIXME: for some reason this must come before subGas
    subMemUsage(runState, memOffset, length)
    // // copy fee
    // runState.eei.useGas(
    //   new BN(runState._common.param('gasPrices', 'copy')).imul(divCeil(length, new BN(32))),
    // )
    
    if (runState.produceWitness && runState.state_access_list) {
      const addressBuf = addressToBuffer(address)
      const empty = await runState.eei.isAccountEmpty(addressBuf)
      runState.state_access_list.push(new ExtCodeCopyWitness(address, !empty))
    }
    const code = await runState.eei.getExternalCode(address)
    
    const data = getDataSlice(code, codeOffset, length)
    const memOffsetNum = memOffset.toNumber()
    const lengthNum = length.toNumber()
    runState.memory.extend(memOffsetNum, lengthNum)
    runState.memory.write(memOffsetNum, lengthNum, data)
  },
  EXTCODEHASH: async function(runState: RunState) {
    let address = runState.stack.pop()
    // if (!runState._common.gteHardfork('constantinople')) {
    //   trap(ERROR.INVALID_OPCODE)
    // }

    const addressBuf = addressToBuffer(address)
    const empty = await runState.eei.isAccountEmpty(addressBuf)
    let hash;
    if (empty) hash = new BN(0);
    else {
      const code = await runState.eei.getExternalCode(address)
      if (code.length == 0) hash = new BN(utils.KECCAK256_NULL)
      else hash = new BN(utils.keccak256(code))
    }
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new ExtCodeHashWitness(address, hash))
    }
    runState.stack.push(hash);
  },
  RETURNDATASIZE: function(runState: RunState) {
    runState.stack.push(runState.eei.getReturnDataSize())
  },
  RETURNDATACOPY: function(runState: RunState) {
    let [memOffset, returnDataOffset, length] = runState.stack.popN(3)

    if (returnDataOffset.add(length).gt(runState.eei.getReturnDataSize())) {
      trap(ERROR.OUT_OF_GAS)
    }

    subMemUsage(runState, memOffset, length)
    // runState.eei.useGas(
    //   new BN(runState._common.param('gasPrices', 'copy')).mul(divCeil(length, new BN(32))),
    // )

    const data = getDataSlice(runState.eei.getReturnData(), returnDataOffset, length)
    const memOffsetNum = memOffset.toNumber()
    const lengthNum = length.toNumber()
    runState.memory.extend(memOffsetNum, lengthNum)
    runState.memory.write(memOffsetNum, lengthNum, data)
  },
  GASPRICE: function(runState: RunState) {
    runState.stack.push(runState.eei.getTxGasPrice())
  },
  // '0x40' range - block operations
  BLOCKHASH: async function(runState: RunState) {
    const number = runState.stack.pop()

    const diff = runState.eei.getBlockNumber().sub(number)
    // block lookups must be within the past 256 blocks
    let hash;
    
    if (diff.gtn(256) || diff.lten(0)) hash = new BN(0)
    else hash = await runState.eei.getBlockHash(number)
    
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new BlockHashWitness(number, hash))
    }
    runState.stack.push(hash)
  },
  COINBASE: function(runState: RunState) {
    let coinbase = runState.eei.getBlockCoinbase()
    if (runState.produceWitness && runState.state_access_list) {
      if (coinbase.eqn(0)) coinbase = new BN('1111111111111111111111111111111111111111', 'hex')
      runState.state_access_list.push(new CoinbaseWitness(coinbase))
    }
    runState.stack.push(coinbase)
  },
  TIMESTAMP: function(runState: RunState) {
    let timestamp = runState.eei.getBlockTimestamp()
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new TimestampWitness(timestamp))
    }
    runState.stack.push(timestamp)
  },
  NUMBER: function(runState: RunState) {
    let number = runState.eei.getBlockNumber()
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new NumberWitness(number))
    }
    runState.stack.push(number)
  },
  GASLIMIT: function(runState: RunState) {
    // let gasLimit = runState.eei.getBlockGasLimit()
    // if (runState.produceWitness && runState.state_access_list) {
    //   runState.state_access_list.push(new GaslimitWitness(gasLimit))
    // }
    let gasLimit = new BN(0);
    runState.stack.push(gasLimit)
  },
  CHAINID: function(runState: RunState) {
    if (!runState._common.gteHardfork('istanbul')) {
      trap(ERROR.INVALID_OPCODE)
    }
    let chainId = runState.eei.getChainId()
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new ChainidWitness(chainId))
    }
    runState.stack.push(chainId)
  },
  SELFBALANCE: function(runState: RunState) {
    if (!runState._common.gteHardfork('istanbul')) {
      trap(ERROR.INVALID_OPCODE)
    }
    let selfBalance = runState.eei.getSelfBalance()
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new SelfBalanceWitness(selfBalance))
    }
    runState.stack.push(selfBalance)
  },
  // 0x50 range - 'storage' and execution
  POP: function(runState: RunState) {
    runState.stack.pop()
  },
  MLOAD: function(runState: RunState) {
    const pos = runState.stack.pop()
    subMemUsage(runState, pos, new BN(32))
    const word = runState.memory.read(pos.toNumber(), 32)
    runState.stack.push(new BN(word))
  },
  MSTORE: function(runState: RunState) {
    let [offset, word] = runState.stack.popN(2)
    const buf = word.toArrayLike(Buffer, 'be', 32)
    subMemUsage(runState, offset, new BN(32))
    const offsetNum = offset.toNumber()
    runState.memory.extend(offsetNum, 32)
    runState.memory.write(offsetNum, 32, buf)
  },
  MSTORE8: function(runState: RunState) {
    let [offset, byte] = runState.stack.popN(2)

    // NOTE: we're using a 'trick' here to get the least significant byte
    // NOTE: force cast necessary because `BN.andln` returns number but
    // the types are wrong
    const buf = Buffer.from([(byte.andln(0xff) as unknown) as number])
    subMemUsage(runState, offset, new BN(1))
    const offsetNum = offset.toNumber()
    runState.memory.extend(offsetNum, 1)
    runState.memory.write(offsetNum, 1, buf)
  },
  SLOAD: async function(runState: RunState) {
    let key = runState.stack.pop()
    const keyBuf = key.toArrayLike(Buffer, 'be', 32)

    const value = await runState.eei.storageLoad(keyBuf)
    const valueBN = value.length ? new BN(value) : new BN(0)
    if (runState.produceWitness && runState.state_access_list) {
      runState.state_access_list.push(new SloadWitness(key, valueBN))
    }
    runState.stack.push(valueBN)
  },
  SSTORE: async function(runState: RunState) {
    if (runState.eei.isStatic()) {
      trap(ERROR.STATIC_STATE_CHANGE)
    }

    let [key, val] = runState.stack.popN(2)

    const keyBuf = key.toArrayLike(Buffer, 'be', 32)
    // NOTE: this should be the shortest representation
    let value
    if (val.isZero()) {
      value = Buffer.from([])
    } else {
      value = val.toArrayLike(Buffer, 'be')
    }
    
    // TODO: Replace getContractStorage with EEI method
    const found = await getContractStorage(runState, runState.eei.getAddress(), keyBuf)
    const refund = updateSstoreGas(runState, found, value)
    await runState.eei.storageStore(keyBuf, value)
    
    if (runState.produceWitness && runState.state_access_list) {
      let root = new BN(await runState.eei._state.forceGetStateRoot())
      runState.state_access_list.push(new SstoreWitness(root, key, val, refund))
    }
  },
  JUMP: function(runState: RunState) {
    const dest = runState.stack.pop()
    if (dest.gt(runState.eei.getCodeSize())) {
      trap(ERROR.INVALID_JUMP + ' at ' + describeLocation(runState))
    }

    const destNum = dest.toNumber()

    if (!jumpIsValid(runState, destNum)) {
      trap(ERROR.INVALID_JUMP + ' at ' + describeLocation(runState))
    }

    runState.programCounter = destNum
  },
  JUMPI: function(runState: RunState) {
    let [dest, cond] = runState.stack.popN(2)
    if (!cond.isZero()) {
      if (dest.gt(runState.eei.getCodeSize())) {
        trap(ERROR.INVALID_JUMP + ' at ' + describeLocation(runState))
      }

      const destNum = dest.toNumber()

      if (!jumpIsValid(runState, destNum)) {
        trap(ERROR.INVALID_JUMP + ' at ' + describeLocation(runState))
      }

      runState.programCounter = destNum
    }
  },
  PC: function(runState: RunState) {
    runState.stack.push(new BN(runState.programCounter - 1))
  },
  MSIZE: function(runState: RunState) {
    runState.stack.push(runState.memoryWordCount.muln(32))
  },
  GAS: function(runState: RunState) {
    let gas = new BN(runState.eei.getGasLeft())
    // if (runState.produceWitness && runState.state_access_list) {
    //   runState.state_access_list.push(new GasWitness(gas))
    // }
    runState.stack.push(gas)
  },
  JUMPDEST: function(runState: RunState) {},
  PUSH: function(runState: RunState) {
    const numToPush = runState.opCode - 0x5f
    const loaded = new BN(
      runState.eei
        .getCode()
        .slice(runState.programCounter, runState.programCounter + numToPush)
        .toString('hex'),
      16,
    )
    runState.programCounter += numToPush
    runState.stack.push(loaded)
  },
  DUP: function(runState: RunState) {
    const stackPos = runState.opCode - 0x7f
    runState.stack.dup(stackPos)
  },
  SWAP: function(runState: RunState) {
    const stackPos = runState.opCode - 0x8f
    runState.stack.swap(stackPos)
  },
  LOG: function(runState: RunState) {
    if (runState.eei.isStatic()) {
      trap(ERROR.STATIC_STATE_CHANGE)
    }

    let [memOffset, memLength] = runState.stack.popN(2)

    const topicsCount = runState.opCode - 0xa0
    if (topicsCount < 0 || topicsCount > 4) {
      trap(ERROR.OUT_OF_RANGE)
    }

    let topics = runState.stack.popN(topicsCount)
    const topicsBuf = topics.map(function(a) {
      return a.toArrayLike(Buffer, 'be', 32)
    })
    if (runState.produceWitness && runState.state_access_list) {
      let dataHash = sha3(runState, memOffset, memLength)
      switch (topicsCount) {
        case 0:
          runState.state_access_list.push(new Log0Witness(dataHash))
          break;
        case 1:
          runState.state_access_list.push(new Log1Witness(topics[0], dataHash))
          break;
        case 2:
          runState.state_access_list.push(new Log2Witness(topics[0], topics[1], dataHash))
          break;
        case 3:
          runState.state_access_list.push(new Log3Witness(topics[0], topics[1], topics[2], dataHash))
          break;
        case 4:
          runState.state_access_list.push(new Log4Witness(topics[0], topics[1], topics[2], topics[3], dataHash))
          break;
      }
    }
    subMemUsage(runState, memOffset, memLength)
    let mem = Buffer.alloc(0)
    if (!memLength.isZero()) {
      mem = runState.memory.read(memOffset.toNumber(), memLength.toNumber())
    }
    // runState.eei.useGas(
    //   new BN(runState._common.param('gasPrices', 'logTopic'))
    //     .imuln(topicsCount)
    //     .iadd(memLength.muln(runState._common.param('gasPrices', 'logData'))),
    // )

    runState.eei.log(mem, topicsCount, topicsBuf)
  },

  // '0xf0' range - closures
  // CREATE: async function(runState: RunState) {
  //   if (runState.eei.isStatic()) {
  //     trap(ERROR.STATIC_STATE_CHANGE)
  //   }

  //   const [value, offset, length] = runState.stack.popN(3)

  //   // subMemUsage(runState, offset, length)
  //   let gasLimit = new BN(runState.eei.getGasLeft())
  //   gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft())

  //   let data = Buffer.alloc(0)
  //   if (!length.isZero()) {
  //     data = runState.memory.read(offset.toNumber(), length.toNumber())
  //   }

  //   const ret = await runState.eei.create(gasLimit, value, data)
  //   runState.stack.push(ret)
  // },
  CALL: async function(runState: RunState) {
    let [
      gasLimit,
      toAddress,
      value,
      inOffset,
      inLength,
      outOffset,
      outLength,
    ] = runState.stack.popN(7)
    const toAddressBuf = addressToBuffer(toAddress)
    let calldataHash = sha3(runState, inOffset, inLength)
    if (runState.eei.isStatic() && !value.isZero()) {
      trap(ERROR.STATIC_STATE_CHANGE)
    }

    subMemUsage(runState, inOffset, inLength)
    subMemUsage(runState, outOffset, outLength)
    // if (!value.isZero()) {
    //   runState.eei.useGas(new BN(runState._common.param('gasPrices', 'callValueTransfer')))
    // }
    gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft())
    let data = Buffer.alloc(0)
    if (!inLength.isZero()) {
      data = runState.memory.read(inOffset.toNumber(), inLength.toNumber())
    }

    // const empty = await runState.eei.isAccountEmpty(toAddressBuf)
    // if (empty) {
    //   if (!value.isZero()) {
    //     runState.eei.useGas(new BN(runState._common.param('gasPrices', 'callNewAccount')))
    //   }
    // }

    /* Temporarily removed */
    // if (!value.isZero()) {
    //   // TODO: Don't use private attr directly
    //   runState.eei._gasLeft.iaddn(runState._common.param('gasPrices', 'callStipend'))
    //   gasLimit.iaddn(runState._common.param('gasPrices', 'callStipend'))
    // }

    const ret = await runState.eei.call(gasLimit, toAddressBuf, value, data)
    if (runState.produceWitness && runState.state_access_list) {
      const returnData = runState.eei.getReturnData()
      let root = new BN(await runState.eei._state.forceGetStateRoot())
      runState.state_access_list.push(new CallWitness(
        root,
        gasLimit,
        runState.eei._lastCallGasUsed,
        runState.eei._result.gasRefund,
        toAddress,
        value,
        calldataHash,
        ret.eqn(0) ? false : true,
        returnData,
        data
      ))
    }
    // Write return data to memory
    writeCallOutput(runState, outOffset, outLength)
    runState.stack.push(ret)
  },
  /* Callcode temporarily disabled */
  // CALLCODE: async function(runState: RunState) {
  //   let [
  //     gasLimit,
  //     toAddress,
  //     value,
  //     inOffset,
  //     inLength,
  //     outOffset,
  //     outLength,
  //   ] = runState.stack.popN(7)
  //   const toAddressBuf = addressToBuffer(toAddress)
  //   let calldataHash = sha3(runState, inOffset, inLength)

  //   subMemUsage(runState, inOffset, inLength)
  //   subMemUsage(runState, outOffset, outLength)
  //   /* Temporarily removed */
  //   // if (!value.isZero()) {
  //   //   runState.eei.useGas(new BN(runState._common.param('gasPrices', 'callValueTransfer')))
  //   // }
  //   gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft())
  //   /* Temporarily removed */
  //   // if (!value.isZero()) {
  //   //   // TODO: Don't use private attr directly
  //   //   runState.eei._gasLeft.iaddn(runState._common.param('gasPrices', 'callStipend'))
  //   //   gasLimit.iaddn(runState._common.param('gasPrices', 'callStipend'))
  //   // }

  //   let data = Buffer.alloc(0)
  //   if (!inLength.isZero()) {
  //     data = runState.memory.read(inOffset.toNumber(), inLength.toNumber())
  //   }

  //   const ret = await runState.eei.callCode(gasLimit, toAddressBuf, value, data)
  //   if (runState.produceWitness && runState.state_access_list) {
  //     const returnData = runState.eei.getReturnData()
  //     let root = new BN(await runState.eei._state.forceGetStateRoot())
  //     runState.state_access_list.push(new CallCodeWitness(
  //       root,
  //       gasLimit,
  //       runState.eei._lastCallGasUsed,
  //       runState.eei._result.gasRefund,
  //       toAddress,
  //       value,
  //       calldataHash,
  //       ret.eqn(0) ? false : true,
  //       returnData
  //     ))
  //   }
  //   // Write return data to memory
  //   writeCallOutput(runState, outOffset, outLength)
  //   runState.stack.push(ret)
  // },
  /* Delegate call temporarily disabled */
  // DELEGATECALL: async function(runState: RunState) {
  //   const value = runState.eei.getCallValue()
  //   let [gasLimit, toAddress, inOffset, inLength, outOffset, outLength] = runState.stack.popN(6)
  //   const toAddressBuf = addressToBuffer(toAddress)
  //   let calldataHash = sha3(runState, inOffset, inLength)

  //   subMemUsage(runState, inOffset, inLength)
  //   subMemUsage(runState, outOffset, outLength)
  //   gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft())

  //   let data = Buffer.alloc(0)
  //   if (!inLength.isZero()) {
  //     data = runState.memory.read(inOffset.toNumber(), inLength.toNumber())
  //   }

  //   const ret = await runState.eei.callDelegate(gasLimit, toAddressBuf, value, data)
  //   if (runState.produceWitness && runState.state_access_list) {
  //     const returnData = runState.eei.getReturnData()
  //     let root = new BN(await runState.eei._state.forceGetStateRoot())
  //     runState.state_access_list.push(new DelegateCallWitness(
  //       root,
  //       gasLimit,
  //       runState.eei._lastCallGasUsed,
  //       runState.eei._result.gasRefund,
  //       toAddress,
  //       calldataHash,
  //       ret.eqn(0) ? false : true,
  //       returnData
  //     ))
  //   }
  //   // Write return data to memory
  //   writeCallOutput(runState, outOffset, outLength)
  //   runState.stack.push(ret)
  // },
  STATICCALL: async function(runState: RunState) {
    const value = new BN(0)
    let [gasLimit, toAddress, inOffset, inLength, outOffset, outLength] = runState.stack.popN(6)
    const toAddressBuf = addressToBuffer(toAddress)
    let calldataHash = sha3(runState, inOffset, inLength)

    subMemUsage(runState, inOffset, inLength)
    subMemUsage(runState, outOffset, outLength)
    gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft())

    let data = Buffer.alloc(0)
    if (!inLength.isZero()) {
      data = runState.memory.read(inOffset.toNumber(), inLength.toNumber())
    }

    const ret = await runState.eei.callStatic(gasLimit, toAddressBuf, value, data)
    if (runState.produceWitness && runState.state_access_list) {
      const returnData = runState.eei.getReturnData()
      runState.state_access_list.push(new StaticCallWitness(
        gasLimit,
        runState.eei._lastCallGasUsed,
        toAddress,
        calldataHash,
        ret.eqn(0) ? false : true,
        returnData,
        data
      ))
    }
    // Write return data to memory
    writeCallOutput(runState, outOffset, outLength)
    runState.stack.push(ret)
  },
  RETURN: function(runState: RunState) {
    const [offset, length] = runState.stack.popN(2)
    subMemUsage(runState, offset, length)
    let returnData = Buffer.alloc(0)
    if (!length.isZero()) {
      returnData = runState.memory.read(offset.toNumber(), length.toNumber())
    }
    runState.eei.finish(returnData)
  },
  REVERT: function(runState: RunState) {
    const [offset, length] = runState.stack.popN(2)
    subMemUsage(runState, offset, length)
    let returnData = Buffer.alloc(0)
    if (!length.isZero()) {
      returnData = runState.memory.read(offset.toNumber(), length.toNumber())
    }
    runState.eei.revert(returnData)
  },
}

function describeLocation(runState: RunState) {
  var hash = utils.keccak256(runState.eei.getCode()).toString('hex')
  var address = runState.eei.getAddress().toString('hex')
  var pc = runState.programCounter - 1
  return hash + '/' + address + ':' + pc
}

function trap(err: string) {
  // TODO: facilitate extra data along with errors
  throw new VmError(err as ERROR)
}

/**
 * Subtracts the amount needed for memory usage from `runState.gasLeft`
 * @method subMemUsage
 * @param {Object} runState
 * @param {BN} offset
 * @param {BN} length
 * @returns {String}
 */
function subMemUsage(runState: RunState, offset: BN, length: BN) {
  /* modified to do nothing */
  // YP (225): access with zero length will not extend the memory
  if (length.isZero()) return

  const newMemoryWordCount = divCeil(offset.add(length), new BN(32))
  if (newMemoryWordCount.lte(runState.memoryWordCount)) return

  // const words = newMemoryWordCount
  // const fee = new BN(runState._common.param('gasPrices', 'memory'))
  // const quadCoeff = new BN(runState._common.param('gasPrices', 'quadCoeffDiv'))
  // // words * 3 + words ^2 / 512
  // const cost = words.mul(fee).add(words.mul(words).div(quadCoeff))

  // if (cost.gt(runState.highestMemCost)) {
  //   runState.eei.useGas(cost.sub(runState.highestMemCost))
  //   runState.highestMemCost = cost
  // }

  runState.memoryWordCount = newMemoryWordCount
}

/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 * @param {BN} offset
 * @param {BN} length
 * @param {Buffer} data
 */
function getDataSlice(data: Buffer, offset: BN, length: BN): Buffer {
  let len = new BN(data.length)
  if (offset.gt(len)) {
    offset = len
  }

  let end = offset.add(length)
  if (end.gt(len)) {
    end = len
  }

  data = data.slice(offset.toNumber(), end.toNumber())
  // Right-pad with zeros to fill dataLength bytes
  data = utils.setLengthRight(data, length.toNumber())

  return data
}

// checks if a jump is valid given a destination
function jumpIsValid(runState: RunState, dest: number): boolean {
  return runState.validJumps.indexOf(dest) !== -1
}

function maxCallGas(gasLimit: BN, gasLeft: BN): BN {
  const gasAllowed = gasLeft.sub(gasLeft.divn(64))
  return gasLimit.gt(gasAllowed) ? gasAllowed : gasLimit
}

async function getContractStorage(runState: RunState, address: Buffer, key: Buffer) {
  const current = await runState.stateManager.getContractStorage(address, key);
  if (
    runState._common.hardfork() === 'constantinople' ||
    runState._common.gteHardfork('istanbul')
  ) {
    const original = await runState.stateManager.getOriginalContractStorage(address, key);
    return { current, original };
  }
  return current;
}

function updateSstoreGas(runState: RunState, found: any, value: Buffer): BN {
  var current = found
  /* all sstore ops cost 20k, then we just refund the expected amount */
  let refund = new BN(0);
  if (value.length === 0 && !current.length) refund = new BN(15000) // net cost 5k
  else if (value.length === 0 && current.length) refund = new BN(30000) // net refund 10k
  else if (value.length !== 0 && !current.length) refund = new BN(0) // net cost 20k
  else if (value.length !== 0 && current.length) refund = new BN(15000) // net cost 20k
  runState.eei.useGas(new BN(20000))
  runState.eei.refundGas(refund)
  return refund;
}

function writeCallOutput(runState: RunState, outOffset: BN, outLength: BN) {
  const returnData = runState.eei.getReturnData()
  if (returnData.length > 0) {
    const memOffset = outOffset.toNumber()
    let dataLength = outLength.toNumber()
    if (returnData.length < dataLength) {
      dataLength = returnData.length
    }
    const data = getDataSlice(returnData, new BN(0), new BN(dataLength))
    runState.memory.extend(memOffset, dataLength)
    runState.memory.write(memOffset, dataLength, data)
  }
}
