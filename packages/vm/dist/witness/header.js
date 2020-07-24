"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainidWitness = exports.ChainidWitnessAbi = exports.GaslimitWitness = exports.GaslimitWitnessAbi = exports.DifficultyWitness = exports.DifficultyWitnessAbi = exports.NumberWitness = exports.NumberWitnessAbi = exports.TimestampWitness = exports.TimestampWitnessAbi = exports.CoinbaseWitness = exports.CoinbaseWitnessAbi = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const accessWitness_1 = require("./accessWitness");
const toHex_1 = __importDefault(require("./toHex"));
exports.CoinbaseWitnessAbi = {
    CoinbaseWitness: {
        opcode: 'uint256',
        coinbase: 'address'
    }
};
class CoinbaseWitness {
    constructor(coinbase) {
        this.opcode = new ethereumjs_util_1.BN(0x41);
        this.abiTypes = ['address'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.CoinbaseWitnessAbi);
        this.coinbase = coinbase;
    }
    get abiParams() {
        return [toHex_1.default(this.coinbase)];
    }
}
exports.CoinbaseWitness = CoinbaseWitness;
CoinbaseWitness.decode = (data) => {
    const { coinbase } = accessWitness_1.decodeStructAsParameters(data, exports.CoinbaseWitnessAbi);
    return new CoinbaseWitness(coinbase);
};
exports.TimestampWitnessAbi = {
    TimestampWitness: {
        opcode: 'uint256',
        timestamp: 'uint256'
    }
};
class TimestampWitness {
    constructor(timestamp) {
        this.opcode = new ethereumjs_util_1.BN(0x42);
        this.abiTypes = ['uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.TimestampWitnessAbi);
        this.timestamp = timestamp;
    }
    get abiParams() {
        return [toHex_1.default(this.timestamp)];
    }
}
exports.TimestampWitness = TimestampWitness;
TimestampWitness.decode = (data) => {
    const { timestamp } = accessWitness_1.decodeStructAsParameters(data, exports.TimestampWitnessAbi);
    return new TimestampWitness(timestamp);
};
exports.NumberWitnessAbi = {
    NumberWitness: {
        opcode: 'uint256',
        number: 'uint256'
    }
};
class NumberWitness {
    constructor(number) {
        this.opcode = new ethereumjs_util_1.BN(0x43);
        this.abiTypes = ['uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.NumberWitnessAbi);
        this.number = number;
    }
    get abiParams() {
        return [toHex_1.default(this.number)];
    }
}
exports.NumberWitness = NumberWitness;
NumberWitness.decode = (data) => {
    const { number } = accessWitness_1.decodeStructAsParameters(data, exports.NumberWitnessAbi);
    return new NumberWitness(number);
};
exports.DifficultyWitnessAbi = {
    DifficultyWitness: {
        opcode: 'uint256',
        difficulty: 'uint256'
    }
};
class DifficultyWitness {
    constructor(difficulty) {
        this.opcode = new ethereumjs_util_1.BN(0x44);
        this.abiTypes = ['uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.DifficultyWitnessAbi);
        this.difficulty = difficulty;
    }
    get abiParams() {
        return [toHex_1.default(this.difficulty)];
    }
}
exports.DifficultyWitness = DifficultyWitness;
DifficultyWitness.decode = (data) => {
    const { difficulty } = accessWitness_1.decodeStructAsParameters(data, exports.DifficultyWitnessAbi);
    return new DifficultyWitness(difficulty);
};
exports.GaslimitWitnessAbi = {
    GaslimitWitness: {
        opcode: 'uint256',
        gaslimit: 'uint256'
    }
};
class GaslimitWitness {
    constructor(gaslimit) {
        this.opcode = new ethereumjs_util_1.BN(0x45);
        this.abiTypes = ['uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.GaslimitWitnessAbi);
        this.gaslimit = gaslimit;
    }
    get abiParams() {
        return [toHex_1.default(this.gaslimit)];
    }
}
exports.GaslimitWitness = GaslimitWitness;
GaslimitWitness.decode = (data) => {
    const { gaslimit } = accessWitness_1.decodeStructAsParameters(data, exports.GaslimitWitnessAbi);
    return new GaslimitWitness(gaslimit);
};
exports.ChainidWitnessAbi = {
    ChainidWitness: {
        opcode: 'uint256',
        chainId: 'uint256'
    }
};
class ChainidWitness {
    constructor(chainId) {
        this.opcode = new ethereumjs_util_1.BN(0x46);
        this.abiTypes = ['uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.ChainidWitnessAbi);
        this.chainId = chainId;
    }
    get abiParams() {
        return [toHex_1.default(this.chainId)];
    }
}
exports.ChainidWitness = ChainidWitness;
ChainidWitness.decode = (data) => {
    const { chainId } = accessWitness_1.decodeStructAsParameters(data, exports.ChainidWitnessAbi);
    return new ChainidWitness(chainId);
};
//# sourceMappingURL=header.js.map