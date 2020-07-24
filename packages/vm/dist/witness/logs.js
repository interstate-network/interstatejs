"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log4Witness = exports.Log4WitnessAbi = exports.Log3Witness = exports.Log3WitnessAbi = exports.Log2Witness = exports.Log2WitnessAbi = exports.Log1Witness = exports.Log1WitnessAbi = exports.Log0Witness = exports.Log0WitnessAbi = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const accessWitness_1 = require("./accessWitness");
const toHex_1 = __importDefault(require("./toHex"));
exports.Log0WitnessAbi = {
    Log0Witness: {
        opcode: 'uint256',
        dataHash: 'bytes32'
    }
};
class Log0Witness {
    constructor(dataHash) {
        this.opcode = new ethereumjs_util_1.BN(0xa0);
        this.abiTypes = ['bytes32'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.Log0WitnessAbi);
        this.dataHash = dataHash;
    }
    get abiParams() {
        return [
            toHex_1.default(this.dataHash),
        ];
    }
}
exports.Log0Witness = Log0Witness;
Log0Witness.decode = (data) => {
    const { dataHash } = accessWitness_1.decodeStructAsParameters(data, exports.Log0WitnessAbi);
    return new Log0Witness(dataHash);
};
exports.Log1WitnessAbi = {
    Log1Witness: {
        opcode: 'uint256',
        topic: 'bytes32',
        dataHash: 'bytes32'
    }
};
class Log1Witness {
    constructor(topic, dataHash) {
        this.opcode = new ethereumjs_util_1.BN(0xa1);
        this.abiTypes = ['bytes32', 'bytes32'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.Log1WitnessAbi);
        this.dataHash = dataHash;
        this.topic = topic;
    }
    get abiParams() {
        return [
            this.topic,
            this.dataHash,
        ].map(toHex_1.default);
    }
}
exports.Log1Witness = Log1Witness;
Log1Witness.decode = (data) => {
    const { topic, dataHash, } = accessWitness_1.decodeStructAsParameters(data, exports.Log1WitnessAbi);
    return new Log1Witness(topic, dataHash);
};
exports.Log2WitnessAbi = {
    Log2Witness: {
        opcode: 'uint256',
        topic0: 'bytes32',
        topic1: 'bytes32',
        dataHash: 'bytes32'
    }
};
class Log2Witness {
    constructor(topic0, topic1, dataHash) {
        this.opcode = new ethereumjs_util_1.BN(0xa2);
        this.abiTypes = ['bytes32'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.Log2WitnessAbi);
        this.topic0 = topic0;
        this.topic1 = topic1;
        this.dataHash = dataHash;
    }
    get abiParams() {
        return [
            this.topic0,
            this.topic1,
            this.dataHash,
        ].map(toHex_1.default);
    }
}
exports.Log2Witness = Log2Witness;
Log2Witness.decode = (data) => {
    const { topic0, topic1, dataHash, } = accessWitness_1.decodeStructAsParameters(data, exports.Log2WitnessAbi);
    return new Log2Witness(topic0, topic1, dataHash);
};
exports.Log3WitnessAbi = {
    Log3Witness: {
        opcode: 'uint256',
        topic0: 'bytes32',
        topic1: 'bytes32',
        topic2: 'bytes32',
        dataHash: 'bytes32'
    }
};
class Log3Witness {
    constructor(topic0, topic1, topic2, dataHash) {
        this.opcode = new ethereumjs_util_1.BN(0xa3);
        this.abiTypes = ['bytes32'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.Log3WitnessAbi);
        this.topic0 = topic0;
        this.topic1 = topic1;
        this.topic2 = topic2;
        this.dataHash = dataHash;
    }
    get abiParams() {
        return [
            this.topic0,
            this.topic1,
            this.topic2,
            this.dataHash,
        ].map(toHex_1.default);
    }
}
exports.Log3Witness = Log3Witness;
Log3Witness.decode = (data) => {
    const { topic0, topic1, topic2, dataHash, } = accessWitness_1.decodeStructAsParameters(data, exports.Log3WitnessAbi);
    return new Log3Witness(topic0, topic1, topic2, dataHash);
};
exports.Log4WitnessAbi = {
    Log4Witness: {
        opcode: 'uint256',
        topic0: 'bytes32',
        topic1: 'bytes32',
        topic2: 'bytes32',
        topic3: 'bytes32',
        dataHash: 'bytes32'
    }
};
class Log4Witness {
    constructor(topic0, topic1, topic2, topic3, dataHash) {
        this.opcode = new ethereumjs_util_1.BN(0xa4);
        this.abiTypes = ['bytes32'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.Log4WitnessAbi);
        this.topic0 = topic0;
        this.topic1 = topic1;
        this.topic2 = topic2;
        this.topic3 = topic3;
        this.dataHash = dataHash;
    }
    get abiParams() {
        return [
            this.topic0,
            this.topic1,
            this.topic2,
            this.topic3,
            this.dataHash,
        ].map(toHex_1.default);
    }
}
exports.Log4Witness = Log4Witness;
Log4Witness.decode = (data) => {
    const { topic0, topic1, topic2, topic3, dataHash, } = accessWitness_1.decodeStructAsParameters(data, exports.Log4WitnessAbi);
    return new Log4Witness(topic0, topic1, topic2, topic3, dataHash);
};
//# sourceMappingURL=logs.js.map