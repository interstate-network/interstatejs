"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SstoreWitness = exports.SstoreWitnessAbi = exports.SloadWitness = exports.SloadWitnessAbi = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const accessWitness_1 = require("./accessWitness");
const toHex_1 = __importDefault(require("./toHex"));
exports.SloadWitnessAbi = {
    SloadWitness: {
        opcode: 'uint256',
        slot: 'uint256',
        value: 'uint256',
    }
};
class SloadWitness {
    constructor(slot, value) {
        this.opcode = new ethereumjs_util_1.BN(0x54);
        this.abiTypes = ['uint256', 'uint256'];
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.SloadWitnessAbi);
        this.slot = slot;
        this.value = value;
    }
    get abiParams() {
        return [
            this.slot,
            this.value
        ].map(toHex_1.default);
    }
}
exports.SloadWitness = SloadWitness;
SloadWitness.decode = (data) => {
    const { slot, value } = accessWitness_1.decodeStructAsParameters(data, exports.SloadWitnessAbi);
    return new SloadWitness(slot, value);
};
exports.SstoreWitnessAbi = {
    SstoreWitness: {
        opcode: 'uint256',
        stateRootLeave: 'bytes32',
        slot: 'uint256',
        value: 'uint256',
        refund: 'uint256',
    }
};
class SstoreWitness {
    constructor(stateRootLeave, slot, value, refund) {
        this.opcode = new ethereumjs_util_1.BN(0x55);
        this.encode = () => accessWitness_1.encodeStructAsParameters(this, exports.SstoreWitnessAbi);
        this.abiTypes = ['bytes32', 'uint256', 'uint256', 'uint256'];
        this.stateRootLeave = stateRootLeave;
        this.slot = slot;
        this.value = value;
        this.refund = refund;
    }
    get abiParams() {
        return [
            this.stateRootLeave,
            this.slot,
            this.value,
            this.refund
        ].map(toHex_1.default);
    }
}
exports.SstoreWitness = SstoreWitness;
SstoreWitness.decode = (data) => {
    const { stateRootLeave, slot, value, refund } = accessWitness_1.decodeStructAsParameters(data, exports.SstoreWitnessAbi);
    return new SstoreWitness(stateRootLeave, slot, value, refund);
};
//# sourceMappingURL=storage.js.map