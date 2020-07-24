"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticCallWitness = exports.StaticCallWitnessAbi = exports.DelegateCallWitness = exports.DelegateCallWitnessAbi = exports.CallCodeWitness = exports.CallWitness = exports.CallWitnessAbi = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const accessWitness_1 = require("./accessWitness");
const toHex_1 = __importDefault(require("./toHex"));
exports.CallWitnessAbi = {
    CallWitness: {
        opcode: 'uint256',
        stateRootLeave: 'bytes32',
        gas: 'uint256',
        gasUsed: 'uint256',
        gasRefund: 'uint256',
        address: 'address',
        value: 'uint256',
        calldataHash: 'bytes32',
        success: 'bool',
        returndata: 'bytes'
    }
};
class CallWitness {
    constructor(stateRootLeave, gas, gasUsed, gasRefund, address, value, calldataHash, success, returndata, calldata) {
        this.stateRootLeave = stateRootLeave;
        this.gas = gas;
        this.gasUsed = gasUsed;
        this.gasRefund = gasRefund;
        this.address = address;
        this.value = value;
        this.calldataHash = calldataHash;
        this.success = success;
        this.returndata = returndata;
        this.calldata = calldata;
        this.opcode = new ethereumjs_util_1.BN(0xf1);
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.CallWitnessAbi);
    }
    get abiTypes() { return CallWitness._abiTypes; }
    get abiParams() {
        return [
            toHex_1.default(this.stateRootLeave),
            toHex_1.default(this.gas),
            toHex_1.default(this.gasUsed),
            toHex_1.default(this.gasRefund),
            toHex_1.default(this.address),
            toHex_1.default(this.value),
            toHex_1.default(this.calldataHash),
            this.success,
            toHex_1.default(this.returndata)
        ];
    }
}
exports.CallWitness = CallWitness;
CallWitness._abiTypes = [
    'bytes32',
    'uint256',
    'uint256',
    'uint256',
    'address',
    'uint256',
    'bytes32',
    'bool',
    'bytes'
];
CallWitness.decode = (data) => {
    const { stateRootLeave, gas, gasUsed, gasRefund, address, value, calldataHash, success, returndata, } = accessWitness_1.decodeStructAsParameters(data, exports.CallWitnessAbi);
    return new CallWitness(stateRootLeave, gas, gasUsed, gasRefund, address, value, calldataHash, success, returndata);
};
class CallCodeWitness extends CallWitness {
    constructor() {
        super(...arguments);
        this.opcode = new ethereumjs_util_1.BN(0xf2);
    }
}
exports.CallCodeWitness = CallCodeWitness;
CallCodeWitness.decode = (data) => {
    const { stateRootLeave, gas, gasUsed, gasRefund, address, value, calldataHash, success, returndata, } = accessWitness_1.decodeStructAsParameters(data, exports.CallWitnessAbi);
    return new CallCodeWitness(stateRootLeave, gas, gasUsed, gasRefund, address, value, calldataHash, success, returndata);
};
exports.DelegateCallWitnessAbi = {
    DelegateCallWitness: {
        opcode: 'uint256',
        stateRootLeave: 'bytes32',
        gas: 'uint256',
        gasUsed: 'uint256',
        gasRefund: 'uint256',
        address: 'address',
        calldataHash: 'bytes32',
        success: 'bool',
        returndata: 'bytes'
    }
};
class DelegateCallWitness {
    constructor(stateRootLeave, gas, gasUsed, gasRefund, address, calldataHash, success, returndata) {
        this.opcode = new ethereumjs_util_1.BN(0xf4);
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.DelegateCallWitnessAbi);
        this.stateRootLeave = stateRootLeave;
        this.gas = gas;
        this.gasUsed = gasUsed;
        this.gasRefund = gasRefund;
        this.address = address;
        this.calldataHash = calldataHash;
        this.success = success;
        this.returndata = returndata;
    }
    get abiTypes() { return DelegateCallWitness._abiTypes; }
    get abiParams() {
        return [
            toHex_1.default(this.stateRootLeave),
            toHex_1.default(this.gas),
            toHex_1.default(this.gasUsed),
            toHex_1.default(this.gasRefund),
            toHex_1.default(this.address),
            toHex_1.default(this.calldataHash),
            this.success,
            toHex_1.default(this.returndata)
        ];
    }
}
exports.DelegateCallWitness = DelegateCallWitness;
DelegateCallWitness._abiTypes = [
    'bytes32',
    'uint256',
    'uint256',
    'uint256',
    'address',
    'bytes32',
    'bool',
    'bytes'
];
DelegateCallWitness.decode = (data) => {
    const { stateRootLeave, gas, gasUsed, gasRefund, address, calldataHash, success, returndata, } = accessWitness_1.decodeStructAsParameters(data, exports.DelegateCallWitnessAbi);
    return new DelegateCallWitness(stateRootLeave, gas, gasUsed, gasRefund, address, calldataHash, success, returndata);
};
exports.StaticCallWitnessAbi = {
    StaticCallWitness: {
        opcode: 'uint256',
        gas: 'uint256',
        gasUsed: 'uint256',
        address: 'address',
        calldataHash: 'bytes32',
        success: 'bool',
        returndata: 'bytes'
    }
};
class StaticCallWitness {
    constructor(gas, gasUsed, address, calldataHash, success, returndata, calldata) {
        this.gas = gas;
        this.gasUsed = gasUsed;
        this.address = address;
        this.calldataHash = calldataHash;
        this.success = success;
        this.returndata = returndata;
        this.calldata = calldata;
        this.opcode = new ethereumjs_util_1.BN(0xfa);
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.StaticCallWitnessAbi);
    }
    get abiTypes() { return StaticCallWitness._abiTypes; }
    get abiParams() {
        return [
            toHex_1.default(this.gas),
            toHex_1.default(this.gasUsed),
            toHex_1.default(this.address),
            toHex_1.default(this.calldataHash),
            this.success,
            toHex_1.default(this.returndata)
        ];
    }
}
exports.StaticCallWitness = StaticCallWitness;
StaticCallWitness._abiTypes = [
    'uint256',
    'uint256',
    'address',
    'bytes32',
    'bool',
    'bytes'
];
StaticCallWitness.decode = (data) => {
    const { gas, gasUsed, address, calldataHash, success, returndata, } = accessWitness_1.decodeStructAsParameters(data, exports.StaticCallWitnessAbi);
    return new StaticCallWitness(gas, gasUsed, address, calldataHash, success, returndata);
};
//# sourceMappingURL=call.js.map