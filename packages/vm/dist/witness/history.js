"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockHashWitness = exports.BlockHashWitnessAbi = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const accessWitness_1 = require("./accessWitness");
const toHex_1 = __importDefault(require("./toHex"));
exports.BlockHashWitnessAbi = {
    BlockHashWitness: {
        opcode: 'uint256',
        number: 'uint256',
        hash: 'bytes32'
    }
};
class BlockHashWitness {
    constructor(number, hash) {
        this.opcode = new ethereumjs_util_1.BN(0x40);
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.BlockHashWitnessAbi);
        this.abiTypes = ['uint256', 'bytes32'];
        this.number = number;
        this.hash = hash;
    }
    get abiParams() {
        return [this.number, this.hash].map(toHex_1.default);
    }
}
exports.BlockHashWitness = BlockHashWitness;
BlockHashWitness.decode = (data) => {
    const { number, hash } = accessWitness_1.decodeStructAsParameters(data, exports.BlockHashWitnessAbi);
    return new BlockHashWitness(number, hash);
};
//# sourceMappingURL=history.js.map