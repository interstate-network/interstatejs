"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageWitness = exports.decodeMessageWitness = exports.decodeAccessRecord = exports.MessageWitnessAbi = exports.abiDecode = exports.Status = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const accessWitness_1 = require("./accessWitness");
const ABI = require('web3-eth-abi');
const utils_1 = require("@interstatejs/utils");
const history_1 = require("./history");
const storage_1 = require("./storage");
const header_1 = require("./header");
const global_state_1 = require("./global-state");
const logs_1 = require("./logs");
const call_1 = require("./call");
var Status;
(function (Status) {
    Status[Status["exception"] = 0] = "exception";
    Status[Status["success"] = 1] = "success";
    Status[Status["revert"] = 2] = "revert";
})(Status = exports.Status || (exports.Status = {}));
function abiDecode(types, data) {
    return ABI.decodeParameters(types, data);
}
exports.abiDecode = abiDecode;
exports.MessageWitnessAbi = {
    MessageWitness: {
        stateRootEnter: 'bytes32',
        stateRootLeave: 'bytes32',
        isStatic: 'bool',
        origin: 'address',
        caller: 'address',
        to: 'address',
        context: 'address',
        callvalue: 'uint256',
        gasPrice: 'uint256',
        gasAvailable: 'uint256',
        gasUsed: 'uint256',
        refund: 'uint256',
        state_access_list: 'bytes[]',
        status: 'uint256',
        returndataHash: 'bytes32',
        calldata: 'bytes'
    }
};
function decodeAccessRecord(bytes) {
    const buf = ethereumjs_util_1.toBuffer(bytes);
    const first32 = utils_1.sliceBuffer(buf, 0, 32);
    const op = utils_1.toInt(first32);
    switch (op) {
        case 0x31: return global_state_1.BalanceWitness.decode(bytes);
        case 0x3b: return global_state_1.ExtCodeSizeWitness.decode(bytes);
        case 0x3c: return global_state_1.ExtCodeCopyWitness.decode(bytes);
        case 0x3f: return global_state_1.ExtCodeHashWitness.decode(bytes);
        case 0x40: return history_1.BlockHashWitness.decode(bytes);
        case 0x41: return header_1.CoinbaseWitness.decode(bytes);
        case 0x42: return header_1.TimestampWitness.decode(bytes);
        case 0x43: return header_1.NumberWitness.decode(bytes);
        case 0x44: return header_1.DifficultyWitness.decode(bytes);
        case 0x45: return header_1.GaslimitWitness.decode(bytes);
        case 0x46: return header_1.ChainidWitness.decode(bytes);
        case 0x47: return global_state_1.SelfBalanceWitness.decode(bytes);
        case 0x54: return storage_1.SloadWitness.decode(bytes);
        case 0x55: return storage_1.SstoreWitness.decode(bytes);
        case 0xa0: return logs_1.Log0Witness.decode(bytes);
        case 0xa1: return logs_1.Log1Witness.decode(bytes);
        case 0xa2: return logs_1.Log2Witness.decode(bytes);
        case 0xa3: return logs_1.Log3Witness.decode(bytes);
        case 0xa4: return logs_1.Log4Witness.decode(bytes);
        case 0xf1: return call_1.CallWitness.decode(bytes);
        case 0xf2: return call_1.CallCodeWitness.decode(bytes);
        case 0xf4: return call_1.DelegateCallWitness.decode(bytes);
        case 0xfa: return call_1.StaticCallWitness.decode(bytes);
        default: throw new Error('Invalid encoding for witness');
    }
}
exports.decodeAccessRecord = decodeAccessRecord;
function decodeMessageWitness(data) {
    const obj = accessWitness_1.decodeStructAsParameters(data, exports.MessageWitnessAbi);
    const { state_access_list } = obj;
    const witness = new MessageWitness(obj.stateRootEnter, obj.stateRootLeave, obj.isStatic, obj.origin, obj.caller, obj.to, obj.context, obj.callvalue, obj.gasPrice, obj.gasAvailable, obj.gasUsed, obj.refund, obj.returndataHash, ethereumjs_util_1.toBuffer(obj.calldata));
    witness.status = +obj.status;
    for (let record of state_access_list) {
        witness.state_access_list.push(decodeAccessRecord(record));
    }
    return witness;
}
exports.decodeMessageWitness = decodeMessageWitness;
class MessageWitness {
    constructor(stateRootEnter, stateRootLeave, isStatic, origin, caller, to, context, callvalue, gasPrice, gasAvailable, gasUsed, refund, returndataHash, calldata) {
        this.state_access_list = [];
        this.abiTypes = [
            'bytes32',
            'bytes32',
            'bool',
            'address',
            'address',
            'address',
            'address',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'bytes[]',
            'uint256',
            'bytes32',
            'bytes'
        ];
        this.isStatic = isStatic;
        this.origin = origin;
        this.caller = caller;
        this.to = to;
        this.context = context;
        this.stateRootEnter = stateRootEnter;
        this.stateRootLeave = stateRootLeave;
        this.callvalue = callvalue;
        this.gasPrice = gasPrice;
        this.gasAvailable = gasAvailable;
        this.gasUsed = gasUsed;
        this.refund = refund;
        this.returndataHash = returndataHash;
        this.calldata = calldata;
    }
    get abiTuple() {
        return;
    }
    encode() {
        const obj = Object.assign({}, this, {
            state_access_list: this.state_access_list.map(record => record.encode())
        });
        return accessWitness_1.encodeStructAsParameters(obj, exports.MessageWitnessAbi);
    }
}
exports.MessageWitness = MessageWitness;
exports.default = MessageWitness;
//# sourceMappingURL=message.js.map