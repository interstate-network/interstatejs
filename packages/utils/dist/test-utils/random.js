"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomFromArray = exports.randomInt = exports.randomAccount = exports.randomHexBuffer = exports.randomHexString = void 0;
const crypto = require("crypto");
const ethereumjs_util_1 = require("ethereumjs-util");
const to_1 = require("../utils/to");
function randomHexString(size) {
    const bytes = crypto.randomBytes(size);
    return to_1.toHex(ethereumjs_util_1.setLengthRight(ethereumjs_util_1.unpad(bytes), size));
}
exports.randomHexString = randomHexString;
function randomHexBuffer(size) {
    const bytes = crypto.randomBytes(size);
    return ethereumjs_util_1.setLengthRight(ethereumjs_util_1.unpad(bytes), size);
    // const bytes = randomHexString(size);
    // return Buffer.from(bytes.slice(2), "hex");
}
exports.randomHexBuffer = randomHexBuffer;
exports.randomAccount = () => {
    let privateKey = randomHexBuffer(32);
    let address = to_1.toHex(ethereumjs_util_1.privateToAddress(privateKey));
    return { privateKey, address };
};
exports.randomInt = (bytes) => {
    return to_1.toInt(randomHexBuffer(bytes));
};
exports.randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];
