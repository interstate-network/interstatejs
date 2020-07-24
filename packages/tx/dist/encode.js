"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashABI = exports.encodeABI = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const ABI = require('ethereumjs-abi');
function encodeABI(tx) {
    if (tx.isIncoming)
        return tx.stateRoot;
    return Buffer.concat([tx.serialize(), tx.stateRoot]);
}
exports.encodeABI = encodeABI;
function hashABI(tx) {
    const encoded = encodeABI(tx);
    return ethereumjs_util_1.keccak256(encoded);
}
exports.hashABI = hashABI;
//# sourceMappingURL=encode.js.map