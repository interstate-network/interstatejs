"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const BN = require("bn.js");
const utils = __importStar(require("ethereumjs-util"));
const exceptions_1 = require("../exceptions");
const global_state_1 = require("../witness/global-state");
const interpreter_witness_1 = require("./interpreter-witness");
const history_1 = require("../witness/history");
const header_1 = require("../witness/header");
const storage_1 = require("../witness/storage");
const logs_1 = require("../witness/logs");
const call_1 = require("../witness/call");
const MASK_160 = new BN(1).shln(160).subn(1);
function divCeil(a, b) {
    const div = a.div(b);
    const mod = a.mod(b);
    if (mod.isZero())
        return div;
    return div.isNeg() ? div.isubn(1) : div.iaddn(1);
}
function addressToBuffer(address) {
    return address.and(MASK_160).toArrayLike(Buffer, 'be', 20);
}
exports.handlers = {
    STOP: function (runState) {
        trap(exceptions_1.ERROR.STOP);
    },
    ADD: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = a.add(b).mod(utils.TWO_POW256);
        runState.stack.push(r);
    },
    MUL: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = a.mul(b).mod(utils.TWO_POW256);
        runState.stack.push(r);
    },
    SUB: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = a.sub(b).toTwos(256);
        runState.stack.push(r);
    },
    DIV: function (runState) {
        const [a, b] = runState.stack.popN(2);
        let r;
        if (b.isZero()) {
            r = new BN(b);
        }
        else {
            r = a.div(b);
        }
        runState.stack.push(r);
    },
    SDIV: function (runState) {
        let [a, b] = runState.stack.popN(2);
        let r;
        if (b.isZero()) {
            r = new BN(b);
        }
        else {
            a = a.fromTwos(256);
            b = b.fromTwos(256);
            r = a.div(b).toTwos(256);
        }
        runState.stack.push(r);
    },
    MOD: function (runState) {
        const [a, b] = runState.stack.popN(2);
        let r;
        if (b.isZero()) {
            r = new BN(b);
        }
        else {
            r = a.mod(b);
        }
        runState.stack.push(r);
    },
    SMOD: function (runState) {
        let [a, b] = runState.stack.popN(2);
        let r;
        if (b.isZero()) {
            r = new BN(b);
        }
        else {
            a = a.fromTwos(256);
            b = b.fromTwos(256);
            r = a.abs().mod(b.abs());
            if (a.isNeg()) {
                r = r.ineg();
            }
            r = r.toTwos(256);
        }
        runState.stack.push(r);
    },
    ADDMOD: function (runState) {
        const [a, b, c] = runState.stack.popN(3);
        let r;
        if (c.isZero()) {
            r = new BN(c);
        }
        else {
            r = a.add(b).mod(c);
        }
        runState.stack.push(r);
    },
    MULMOD: function (runState) {
        const [a, b, c] = runState.stack.popN(3);
        let r;
        if (c.isZero()) {
            r = new BN(c);
        }
        else {
            r = a.mul(b).mod(c);
        }
        runState.stack.push(r);
    },
    EXP: function (runState) {
        let [base, exponent] = runState.stack.popN(2);
        if (exponent.isZero()) {
            runState.stack.push(new BN(1));
            return;
        }
        const byteLength = exponent.byteLength();
        if (byteLength < 1 || byteLength > 32) {
            trap(exceptions_1.ERROR.OUT_OF_RANGE);
        }
        if (base.isZero()) {
            runState.stack.push(new BN(0));
            return;
        }
        const m = BN.red(utils.TWO_POW256);
        const redBase = base.toRed(m);
        const r = redBase.redPow(exponent);
        runState.stack.push(r.fromRed());
    },
    SIGNEXTEND: function (runState) {
        let [k, val] = runState.stack.popN(2);
        if (k.ltn(31)) {
            const signBit = k
                .muln(8)
                .iaddn(7)
                .toNumber();
            const mask = new BN(1).ishln(signBit).isubn(1);
            if (val.testn(signBit)) {
                val = val.or(mask.notn(256));
            }
            else {
                val = val.and(mask);
            }
        }
        else {
            val = new BN(val);
        }
        runState.stack.push(val);
    },
    LT: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = new BN(a.lt(b) ? 1 : 0);
        runState.stack.push(r);
    },
    GT: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = new BN(a.gt(b) ? 1 : 0);
        runState.stack.push(r);
    },
    SLT: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = new BN(a.fromTwos(256).lt(b.fromTwos(256)) ? 1 : 0);
        runState.stack.push(r);
    },
    SGT: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = new BN(a.fromTwos(256).gt(b.fromTwos(256)) ? 1 : 0);
        runState.stack.push(r);
    },
    EQ: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = new BN(a.eq(b) ? 1 : 0);
        runState.stack.push(r);
    },
    ISZERO: function (runState) {
        const a = runState.stack.pop();
        const r = new BN(a.isZero() ? 1 : 0);
        runState.stack.push(r);
    },
    AND: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = a.and(b);
        runState.stack.push(r);
    },
    OR: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = a.or(b);
        runState.stack.push(r);
    },
    XOR: function (runState) {
        const [a, b] = runState.stack.popN(2);
        const r = a.xor(b);
        runState.stack.push(r);
    },
    NOT: function (runState) {
        const a = runState.stack.pop();
        const r = a.notn(256);
        runState.stack.push(r);
    },
    BYTE: function (runState) {
        const [pos, word] = runState.stack.popN(2);
        if (pos.gten(32)) {
            runState.stack.push(new BN(0));
            return;
        }
        const r = new BN(word.shrn((31 - pos.toNumber()) * 8).andln(0xff));
        runState.stack.push(r);
    },
    SHL: function (runState) {
        const [a, b] = runState.stack.popN(2);
        if (!runState._common.gteHardfork('constantinople')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        if (a.gten(256)) {
            runState.stack.push(new BN(0));
            return;
        }
        const r = b.shln(a.toNumber()).iand(utils.MAX_INTEGER);
        runState.stack.push(r);
    },
    SHR: function (runState) {
        const [a, b] = runState.stack.popN(2);
        if (!runState._common.gteHardfork('constantinople')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        if (a.gten(256)) {
            runState.stack.push(new BN(0));
            return;
        }
        const r = b.shrn(a.toNumber());
        runState.stack.push(r);
    },
    SAR: function (runState) {
        const [a, b] = runState.stack.popN(2);
        if (!runState._common.gteHardfork('constantinople')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        let r;
        const isSigned = b.testn(255);
        if (a.gten(256)) {
            if (isSigned) {
                r = new BN(utils.MAX_INTEGER);
            }
            else {
                r = new BN(0);
            }
            runState.stack.push(r);
            return;
        }
        const c = b.shrn(a.toNumber());
        if (isSigned) {
            const shiftedOutWidth = 255 - a.toNumber();
            const mask = utils.MAX_INTEGER.shrn(shiftedOutWidth).shln(shiftedOutWidth);
            r = c.ior(mask);
        }
        else {
            r = c;
        }
        runState.stack.push(r);
    },
    SHA3: function (runState) {
        const [offset, length] = runState.stack.popN(2);
        subMemUsage(runState, offset, length);
        let data = Buffer.alloc(0);
        if (!length.isZero()) {
            data = runState.memory.read(offset.toNumber(), length.toNumber());
        }
        const r = new BN(utils.keccak256(data));
        runState.stack.push(r);
    },
    ADDRESS: function (runState) {
        runState.stack.push(new BN(runState.eei.getAddress()));
    },
    BALANCE: async function (runState) {
        const address = runState.stack.pop();
        const addressBuf = addressToBuffer(address);
        const balance = await runState.eei.getExternalBalance(addressBuf);
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new global_state_1.BalanceWitness(address, balance));
        }
        runState.stack.push(balance);
    },
    ORIGIN: function (runState) {
        runState.stack.push(runState.eei.getTxOrigin());
    },
    CALLER: function (runState) {
        runState.stack.push(runState.eei.getCaller());
    },
    CALLVALUE: function (runState) {
        runState.stack.push(runState.eei.getCallValue());
    },
    CALLDATALOAD: function (runState) {
        let pos = runState.stack.pop();
        if (pos.gt(runState.eei.getCallDataSize())) {
            runState.stack.push(new BN(0));
            return;
        }
        const i = pos.toNumber();
        let loaded = runState.eei.getCallData().slice(i, i + 32);
        loaded = loaded.length ? loaded : Buffer.from([0]);
        const r = new BN(utils.setLengthRight(loaded, 32));
        runState.stack.push(r);
    },
    CALLDATASIZE: function (runState) {
        const r = runState.eei.getCallDataSize();
        runState.stack.push(r);
    },
    CALLDATACOPY: function (runState) {
        let [memOffset, dataOffset, dataLength] = runState.stack.popN(3);
        subMemUsage(runState, memOffset, dataLength);
        const data = getDataSlice(runState.eei.getCallData(), dataOffset, dataLength);
        const memOffsetNum = memOffset.toNumber();
        const dataLengthNum = dataLength.toNumber();
        runState.memory.extend(memOffsetNum, dataLengthNum);
        runState.memory.write(memOffsetNum, dataLengthNum, data);
    },
    CODESIZE: function (runState) {
        runState.stack.push(runState.eei.getCodeSize());
    },
    CODECOPY: function (runState) {
        let [memOffset, codeOffset, length] = runState.stack.popN(3);
        subMemUsage(runState, memOffset, length);
        const data = getDataSlice(runState.eei.getCode(), codeOffset, length);
        const memOffsetNum = memOffset.toNumber();
        const lengthNum = length.toNumber();
        runState.memory.extend(memOffsetNum, lengthNum);
        runState.memory.write(memOffsetNum, lengthNum, data);
    },
    EXTCODESIZE: async function (runState) {
        const address = runState.stack.pop();
        const size = await runState.eei.getExternalCodeSize(address);
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new global_state_1.ExtCodeSizeWitness(address, size));
        }
        runState.stack.push(size);
    },
    EXTCODECOPY: async function (runState) {
        let [address, memOffset, codeOffset, length] = runState.stack.popN(4);
        subMemUsage(runState, memOffset, length);
        if (runState.produceWitness && runState.state_access_list) {
            const addressBuf = addressToBuffer(address);
            const empty = await runState.eei.isAccountEmpty(addressBuf);
            runState.state_access_list.push(new global_state_1.ExtCodeCopyWitness(address, !empty));
        }
        const code = await runState.eei.getExternalCode(address);
        const data = getDataSlice(code, codeOffset, length);
        const memOffsetNum = memOffset.toNumber();
        const lengthNum = length.toNumber();
        runState.memory.extend(memOffsetNum, lengthNum);
        runState.memory.write(memOffsetNum, lengthNum, data);
    },
    EXTCODEHASH: async function (runState) {
        let address = runState.stack.pop();
        const addressBuf = addressToBuffer(address);
        const empty = await runState.eei.isAccountEmpty(addressBuf);
        let hash;
        if (empty)
            hash = new BN(0);
        else {
            const code = await runState.eei.getExternalCode(address);
            if (code.length == 0)
                hash = new BN(utils.KECCAK256_NULL);
            else
                hash = new BN(utils.keccak256(code));
        }
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new global_state_1.ExtCodeHashWitness(address, hash));
        }
        runState.stack.push(hash);
    },
    RETURNDATASIZE: function (runState) {
        runState.stack.push(runState.eei.getReturnDataSize());
    },
    RETURNDATACOPY: function (runState) {
        let [memOffset, returnDataOffset, length] = runState.stack.popN(3);
        if (returnDataOffset.add(length).gt(runState.eei.getReturnDataSize())) {
            trap(exceptions_1.ERROR.OUT_OF_GAS);
        }
        subMemUsage(runState, memOffset, length);
        const data = getDataSlice(runState.eei.getReturnData(), returnDataOffset, length);
        const memOffsetNum = memOffset.toNumber();
        const lengthNum = length.toNumber();
        runState.memory.extend(memOffsetNum, lengthNum);
        runState.memory.write(memOffsetNum, lengthNum, data);
    },
    GASPRICE: function (runState) {
        runState.stack.push(runState.eei.getTxGasPrice());
    },
    BLOCKHASH: async function (runState) {
        const number = runState.stack.pop();
        const diff = runState.eei.getBlockNumber().sub(number);
        let hash;
        if (diff.gtn(256) || diff.lten(0))
            hash = new BN(0);
        else
            hash = await runState.eei.getBlockHash(number);
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new history_1.BlockHashWitness(number, hash));
        }
        runState.stack.push(hash);
    },
    COINBASE: function (runState) {
        let coinbase = runState.eei.getBlockCoinbase();
        if (runState.produceWitness && runState.state_access_list) {
            if (coinbase.eqn(0))
                coinbase = new BN('1111111111111111111111111111111111111111', 'hex');
            runState.state_access_list.push(new header_1.CoinbaseWitness(coinbase));
        }
        runState.stack.push(coinbase);
    },
    TIMESTAMP: function (runState) {
        let timestamp = runState.eei.getBlockTimestamp();
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new header_1.TimestampWitness(timestamp));
        }
        runState.stack.push(timestamp);
    },
    NUMBER: function (runState) {
        let number = runState.eei.getBlockNumber();
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new header_1.NumberWitness(number));
        }
        runState.stack.push(number);
    },
    GASLIMIT: function (runState) {
        let gasLimit = new BN(0);
        runState.stack.push(gasLimit);
    },
    CHAINID: function (runState) {
        if (!runState._common.gteHardfork('istanbul')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        let chainId = runState.eei.getChainId();
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new header_1.ChainidWitness(chainId));
        }
        runState.stack.push(chainId);
    },
    SELFBALANCE: function (runState) {
        if (!runState._common.gteHardfork('istanbul')) {
            trap(exceptions_1.ERROR.INVALID_OPCODE);
        }
        let selfBalance = runState.eei.getSelfBalance();
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new global_state_1.SelfBalanceWitness(selfBalance));
        }
        runState.stack.push(selfBalance);
    },
    POP: function (runState) {
        runState.stack.pop();
    },
    MLOAD: function (runState) {
        const pos = runState.stack.pop();
        subMemUsage(runState, pos, new BN(32));
        const word = runState.memory.read(pos.toNumber(), 32);
        runState.stack.push(new BN(word));
    },
    MSTORE: function (runState) {
        let [offset, word] = runState.stack.popN(2);
        const buf = word.toArrayLike(Buffer, 'be', 32);
        subMemUsage(runState, offset, new BN(32));
        const offsetNum = offset.toNumber();
        runState.memory.extend(offsetNum, 32);
        runState.memory.write(offsetNum, 32, buf);
    },
    MSTORE8: function (runState) {
        let [offset, byte] = runState.stack.popN(2);
        const buf = Buffer.from([byte.andln(0xff)]);
        subMemUsage(runState, offset, new BN(1));
        const offsetNum = offset.toNumber();
        runState.memory.extend(offsetNum, 1);
        runState.memory.write(offsetNum, 1, buf);
    },
    SLOAD: async function (runState) {
        let key = runState.stack.pop();
        const keyBuf = key.toArrayLike(Buffer, 'be', 32);
        const value = await runState.eei.storageLoad(keyBuf);
        const valueBN = value.length ? new BN(value) : new BN(0);
        if (runState.produceWitness && runState.state_access_list) {
            runState.state_access_list.push(new storage_1.SloadWitness(key, valueBN));
        }
        runState.stack.push(valueBN);
    },
    SSTORE: async function (runState) {
        if (runState.eei.isStatic()) {
            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
        }
        let [key, val] = runState.stack.popN(2);
        const keyBuf = key.toArrayLike(Buffer, 'be', 32);
        let value;
        if (val.isZero()) {
            value = Buffer.from([]);
        }
        else {
            value = val.toArrayLike(Buffer, 'be');
        }
        const found = await getContractStorage(runState, runState.eei.getAddress(), keyBuf);
        const refund = updateSstoreGas(runState, found, value);
        await runState.eei.storageStore(keyBuf, value);
        if (runState.produceWitness && runState.state_access_list) {
            let root = new BN(await runState.eei._state.forceGetStateRoot());
            runState.state_access_list.push(new storage_1.SstoreWitness(root, key, val, refund));
        }
    },
    JUMP: function (runState) {
        const dest = runState.stack.pop();
        if (dest.gt(runState.eei.getCodeSize())) {
            trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + describeLocation(runState));
        }
        const destNum = dest.toNumber();
        if (!jumpIsValid(runState, destNum)) {
            trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + describeLocation(runState));
        }
        runState.programCounter = destNum;
    },
    JUMPI: function (runState) {
        let [dest, cond] = runState.stack.popN(2);
        if (!cond.isZero()) {
            if (dest.gt(runState.eei.getCodeSize())) {
                trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + describeLocation(runState));
            }
            const destNum = dest.toNumber();
            if (!jumpIsValid(runState, destNum)) {
                trap(exceptions_1.ERROR.INVALID_JUMP + ' at ' + describeLocation(runState));
            }
            runState.programCounter = destNum;
        }
    },
    PC: function (runState) {
        runState.stack.push(new BN(runState.programCounter - 1));
    },
    MSIZE: function (runState) {
        runState.stack.push(runState.memoryWordCount.muln(32));
    },
    GAS: function (runState) {
        let gas = new BN(runState.eei.getGasLeft());
        runState.stack.push(gas);
    },
    JUMPDEST: function (runState) { },
    PUSH: function (runState) {
        const numToPush = runState.opCode - 0x5f;
        const loaded = new BN(runState.eei
            .getCode()
            .slice(runState.programCounter, runState.programCounter + numToPush)
            .toString('hex'), 16);
        runState.programCounter += numToPush;
        runState.stack.push(loaded);
    },
    DUP: function (runState) {
        const stackPos = runState.opCode - 0x7f;
        runState.stack.dup(stackPos);
    },
    SWAP: function (runState) {
        const stackPos = runState.opCode - 0x8f;
        runState.stack.swap(stackPos);
    },
    LOG: function (runState) {
        if (runState.eei.isStatic()) {
            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
        }
        let [memOffset, memLength] = runState.stack.popN(2);
        const topicsCount = runState.opCode - 0xa0;
        if (topicsCount < 0 || topicsCount > 4) {
            trap(exceptions_1.ERROR.OUT_OF_RANGE);
        }
        let topics = runState.stack.popN(topicsCount);
        const topicsBuf = topics.map(function (a) {
            return a.toArrayLike(Buffer, 'be', 32);
        });
        if (runState.produceWitness && runState.state_access_list) {
            let dataHash = interpreter_witness_1.sha3(runState, memOffset, memLength);
            switch (topicsCount) {
                case 0:
                    runState.state_access_list.push(new logs_1.Log0Witness(dataHash));
                    break;
                case 1:
                    runState.state_access_list.push(new logs_1.Log1Witness(topics[0], dataHash));
                    break;
                case 2:
                    runState.state_access_list.push(new logs_1.Log2Witness(topics[0], topics[1], dataHash));
                    break;
                case 3:
                    runState.state_access_list.push(new logs_1.Log3Witness(topics[0], topics[1], topics[2], dataHash));
                    break;
                case 4:
                    runState.state_access_list.push(new logs_1.Log4Witness(topics[0], topics[1], topics[2], topics[3], dataHash));
                    break;
            }
        }
        subMemUsage(runState, memOffset, memLength);
        let mem = Buffer.alloc(0);
        if (!memLength.isZero()) {
            mem = runState.memory.read(memOffset.toNumber(), memLength.toNumber());
        }
        runState.eei.log(mem, topicsCount, topicsBuf);
    },
    CALL: async function (runState) {
        let [gasLimit, toAddress, value, inOffset, inLength, outOffset, outLength,] = runState.stack.popN(7);
        const toAddressBuf = addressToBuffer(toAddress);
        let calldataHash = interpreter_witness_1.sha3(runState, inOffset, inLength);
        if (runState.eei.isStatic() && !value.isZero()) {
            trap(exceptions_1.ERROR.STATIC_STATE_CHANGE);
        }
        subMemUsage(runState, inOffset, inLength);
        subMemUsage(runState, outOffset, outLength);
        gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft());
        let data = Buffer.alloc(0);
        if (!inLength.isZero()) {
            data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
        }
        const ret = await runState.eei.call(gasLimit, toAddressBuf, value, data);
        if (runState.produceWitness && runState.state_access_list) {
            const returnData = runState.eei.getReturnData();
            let root = new BN(await runState.eei._state.forceGetStateRoot());
            runState.state_access_list.push(new call_1.CallWitness(root, gasLimit, runState.eei._lastCallGasUsed, runState.eei._result.gasRefund, toAddress, value, calldataHash, ret.eqn(0) ? false : true, returnData, data));
        }
        writeCallOutput(runState, outOffset, outLength);
        runState.stack.push(ret);
    },
    STATICCALL: async function (runState) {
        const value = new BN(0);
        let [gasLimit, toAddress, inOffset, inLength, outOffset, outLength] = runState.stack.popN(6);
        const toAddressBuf = addressToBuffer(toAddress);
        let calldataHash = interpreter_witness_1.sha3(runState, inOffset, inLength);
        subMemUsage(runState, inOffset, inLength);
        subMemUsage(runState, outOffset, outLength);
        gasLimit = maxCallGas(gasLimit, runState.eei.getGasLeft());
        let data = Buffer.alloc(0);
        if (!inLength.isZero()) {
            data = runState.memory.read(inOffset.toNumber(), inLength.toNumber());
        }
        const ret = await runState.eei.callStatic(gasLimit, toAddressBuf, value, data);
        if (runState.produceWitness && runState.state_access_list) {
            const returnData = runState.eei.getReturnData();
            runState.state_access_list.push(new call_1.StaticCallWitness(gasLimit, runState.eei._lastCallGasUsed, toAddress, calldataHash, ret.eqn(0) ? false : true, returnData, data));
        }
        writeCallOutput(runState, outOffset, outLength);
        runState.stack.push(ret);
    },
    RETURN: function (runState) {
        const [offset, length] = runState.stack.popN(2);
        subMemUsage(runState, offset, length);
        let returnData = Buffer.alloc(0);
        if (!length.isZero()) {
            returnData = runState.memory.read(offset.toNumber(), length.toNumber());
        }
        runState.eei.finish(returnData);
    },
    REVERT: function (runState) {
        const [offset, length] = runState.stack.popN(2);
        subMemUsage(runState, offset, length);
        let returnData = Buffer.alloc(0);
        if (!length.isZero()) {
            returnData = runState.memory.read(offset.toNumber(), length.toNumber());
        }
        runState.eei.revert(returnData);
    },
};
function describeLocation(runState) {
    var hash = utils.keccak256(runState.eei.getCode()).toString('hex');
    var address = runState.eei.getAddress().toString('hex');
    var pc = runState.programCounter - 1;
    return hash + '/' + address + ':' + pc;
}
function trap(err) {
    throw new exceptions_1.VmError(err);
}
function subMemUsage(runState, offset, length) {
    if (length.isZero())
        return;
    const newMemoryWordCount = divCeil(offset.add(length), new BN(32));
    if (newMemoryWordCount.lte(runState.memoryWordCount))
        return;
    runState.memoryWordCount = newMemoryWordCount;
}
function getDataSlice(data, offset, length) {
    let len = new BN(data.length);
    if (offset.gt(len)) {
        offset = len;
    }
    let end = offset.add(length);
    if (end.gt(len)) {
        end = len;
    }
    data = data.slice(offset.toNumber(), end.toNumber());
    data = utils.setLengthRight(data, length.toNumber());
    return data;
}
function jumpIsValid(runState, dest) {
    return runState.validJumps.indexOf(dest) !== -1;
}
function maxCallGas(gasLimit, gasLeft) {
    const gasAllowed = gasLeft.sub(gasLeft.divn(64));
    return gasLimit.gt(gasAllowed) ? gasAllowed : gasLimit;
}
async function getContractStorage(runState, address, key) {
    const current = await runState.stateManager.getContractStorage(address, key);
    if (runState._common.hardfork() === 'constantinople' ||
        runState._common.gteHardfork('istanbul')) {
        const original = await runState.stateManager.getOriginalContractStorage(address, key);
        return { current, original };
    }
    return current;
}
function updateSstoreGas(runState, found, value) {
    var current = found;
    let refund = new BN(0);
    if (value.length === 0 && !current.length)
        refund = new BN(15000);
    else if (value.length === 0 && current.length)
        refund = new BN(30000);
    else if (value.length !== 0 && !current.length)
        refund = new BN(0);
    else if (value.length !== 0 && current.length)
        refund = new BN(15000);
    runState.eei.useGas(new BN(20000));
    runState.eei.refundGas(refund);
    return refund;
}
function writeCallOutput(runState, outOffset, outLength) {
    const returnData = runState.eei.getReturnData();
    if (returnData.length > 0) {
        const memOffset = outOffset.toNumber();
        let dataLength = outLength.toNumber();
        if (returnData.length < dataLength) {
            dataLength = returnData.length;
        }
        const data = getDataSlice(returnData, new BN(0), new BN(dataLength));
        runState.memory.extend(memOffset, dataLength);
        runState.memory.write(memOffset, dataLength, data);
    }
}
//# sourceMappingURL=opFns.js.map