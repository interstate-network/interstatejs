"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRollup = exports.encodeRollupTransaction = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const ABI = require('ethereumjs-abi');
function encodeRollupTransaction(tx, outputRoot) {
    if (tx.isIncoming) {
        const sourceBlock = tx.sourceBlock ? ethereumjs_util_1.bufferToHex(tx.sourceBlock) : '0x00';
        const itxIndex = tx.itxIndex ? ethereumjs_util_1.bufferToHex(tx.itxIndex) : '0x00';
        return ABI.solidityPack(['uint128', 'uint128', 'bytes32'], [sourceBlock, itxIndex, outputRoot]);
    }
    if (!tx.raw)
        throw new Error('Transaction missing .raw property.');
    const [, ...raw] = tx.raw;
    return ethereumjs_util_1.rlp.encode([...raw, outputRoot]);
}
exports.encodeRollupTransaction = encodeRollupTransaction;
function encodeRollup(tx, stateRoot) {
    tx.stateRoot = stateRoot;
    if (tx.isIncoming)
        return tx.stateRoot;
    if (!tx.raw)
        throw new Error('Transaction missing .raw property.');
    return Buffer.concat([tx.serialize(), stateRoot]);
}
exports.encodeRollup = encodeRollup;
//# sourceMappingURL=rollup.js.map