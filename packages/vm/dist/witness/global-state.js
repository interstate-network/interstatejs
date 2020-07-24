"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtCodeCopyWitness = exports.ExtCodeCopyWitnessAbi = exports.ExtCodeSizeWitness = exports.ExtCodeSizeWitnessAbi = exports.ExtCodeHashWitness = exports.ExtCodeHashWitnessAbi = exports.SelfBalanceWitness = exports.SelfBalanceWitnessAbi = exports.BalanceWitness = exports.BalanceWitnessAbi = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const accessWitness_1 = require("./accessWitness");
const toHex_1 = __importDefault(require("./toHex"));
exports.BalanceWitnessAbi = {
    BalanceWitness: {
        opcode: 'uint256',
        address: 'address',
        balance: 'uint256'
    }
};
class BalanceWitness {
    constructor(address, balance) {
        this.opcode = new ethereumjs_util_1.BN(0x31);
        this.abiTypes = ['address', 'uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.BalanceWitnessAbi);
        this.address = address;
        this.balance = balance;
    }
    get abiParams() {
        return [this.address, this.balance].map(toHex_1.default);
    }
}
exports.BalanceWitness = BalanceWitness;
BalanceWitness.decode = (data) => {
    const { address, balance } = accessWitness_1.decodeStructAsParameters(data, exports.BalanceWitnessAbi);
    return new BalanceWitness(address, balance);
};
exports.SelfBalanceWitnessAbi = {
    SelfBalanceWitness: {
        opcode: 'uint256',
        selfBalance: 'uint256'
    }
};
class SelfBalanceWitness {
    constructor(selfBalance) {
        this.opcode = new ethereumjs_util_1.BN(0x47);
        this.abiTypes = ['uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.SelfBalanceWitnessAbi);
        this.selfBalance = selfBalance;
    }
    get abiParams() {
        return [this.selfBalance].map(toHex_1.default);
    }
}
exports.SelfBalanceWitness = SelfBalanceWitness;
SelfBalanceWitness.decode = (data) => {
    const { selfBalance } = accessWitness_1.decodeStructAsParameters(data, exports.SelfBalanceWitnessAbi);
    return new SelfBalanceWitness(selfBalance);
};
exports.ExtCodeHashWitnessAbi = {
    ExtCodeHashWitness: {
        opcode: 'uint256',
        address: 'address',
        hash: 'bytes32'
    }
};
class ExtCodeHashWitness {
    constructor(address, hash) {
        this.opcode = new ethereumjs_util_1.BN(0x3f);
        this.abiTypes = ['address', 'bytes32'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.ExtCodeHashWitnessAbi);
        this.address = address;
        this.hash = hash;
    }
    get abiParams() {
        return [this.address, this.hash].map(toHex_1.default);
    }
}
exports.ExtCodeHashWitness = ExtCodeHashWitness;
ExtCodeHashWitness.decode = (data) => {
    const { address, hash } = accessWitness_1.decodeStructAsParameters(data, exports.ExtCodeHashWitnessAbi);
    return new ExtCodeHashWitness(address, hash);
};
exports.ExtCodeSizeWitnessAbi = {
    ExtCodeSizeWitness: {
        opcode: 'uint256',
        address: 'address',
        size: 'uint256'
    }
};
class ExtCodeSizeWitness {
    constructor(address, size) {
        this.opcode = new ethereumjs_util_1.BN(0x3b);
        this.abiTypes = ['address', 'uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.ExtCodeSizeWitnessAbi);
        this.address = address;
        this.size = size;
    }
    get abiParams() {
        return [this.address, this.size].map(toHex_1.default);
    }
}
exports.ExtCodeSizeWitness = ExtCodeSizeWitness;
ExtCodeSizeWitness.decode = (data) => {
    const { address, size } = accessWitness_1.decodeStructAsParameters(data, exports.ExtCodeSizeWitnessAbi);
    return new ExtCodeSizeWitness(address, size);
};
exports.ExtCodeCopyWitnessAbi = {
    ExtCodeCopyWitness: {
        opcode: 'uint256',
        address: 'address',
        exists: 'bool'
    }
};
class ExtCodeCopyWitness {
    constructor(address, exists) {
        this.opcode = new ethereumjs_util_1.BN(0x3c);
        this.abiTypes = ['address', 'bool'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.ExtCodeCopyWitnessAbi);
        this.address = address;
        this.exists = exists;
    }
    get abiParams() {
        return [toHex_1.default(this.address), this.exists];
    }
}
exports.ExtCodeCopyWitness = ExtCodeCopyWitness;
ExtCodeCopyWitness.decode = (data) => {
    const { address, exists } = accessWitness_1.decodeStructAsParameters(data, exports.ExtCodeCopyWitnessAbi);
    return new ExtCodeCopyWitness(address, exists);
};
//# sourceMappingURL=global-state.js.map