"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLengthLeft = exports.copyBuffer = exports.sliceBuffer = exports.toPrefixed = exports.toNonPrefixed = exports.toBuf32 = exports.toBuf = exports.toHex = exports.toInt = exports.toBn = exports.isHex = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const ethereumjs_util_1 = require("ethereumjs-util");
Object.defineProperty(exports, "setLengthLeft", { enumerable: true, get: function () { return ethereumjs_util_1.setLengthLeft; } });
exports.isHex = (str) => Boolean(/[xabcdef]/g.exec(str));
exports.toBn = (value) => {
    if (bn_js_1.default.isBN(value))
        return value;
    if (typeof value == 'number')
        return new bn_js_1.default(value);
    if (typeof value == 'string')
        return new bn_js_1.default(value, exports.isHex(value) ? 'hex' : undefined);
    if (Buffer.isBuffer(value))
        return new bn_js_1.default(value);
};
exports.toInt = (value) => {
    if (typeof value == 'number')
        return value;
    if (typeof value == 'string') {
        if (exports.isHex(value))
            return parseInt(value, 16);
        return +value;
    }
    if (Buffer.isBuffer(value))
        return ethereumjs_util_1.bufferToInt(value);
    if (bn_js_1.default.isBN(value))
        return value.toNumber();
    return ethereumjs_util_1.bufferToInt(value.toBuffer());
};
exports.toHex = (value) => {
    if (typeof value == 'number')
        return exports.toPrefixed(value.toString(16));
    if (typeof value == 'string') {
        if (exports.isHex(value))
            return exports.toPrefixed(value);
        return exports.toPrefixed((+value).toString(16));
    }
    if (Buffer.isBuffer(value))
        return ethereumjs_util_1.bufferToHex(value);
    if (bn_js_1.default.isBN(value))
        return exports.toPrefixed(value.toString('hex'));
    if (value.toBuffer)
        return ethereumjs_util_1.bufferToHex(value.toBuffer());
    throw new Error(`Did not recognize input type: ${value}.`);
};
exports.toBuf = (value, length) => {
    const buf = ethereumjs_util_1.toBuffer(typeof value == 'string' ? exports.toHex(value) : value);
    return (length) ? ethereumjs_util_1.setLengthLeft(buf, length) : buf;
};
exports.toBuf32 = (value) => {
    const buf = ethereumjs_util_1.toBuffer(value);
    if (buf.byteLength == 32)
        return buf;
    return exports.toBn(buf).toArrayLike(Buffer, 'be', 32);
};
exports.toNonPrefixed = (str) => {
    if (str.slice(0, 2) == '0x')
        return str.slice(2);
    return str;
};
exports.toPrefixed = (str) => {
    if (str.slice(0, 2) == '0x')
        return str;
    return `0x${str}`;
};
exports.sliceBuffer = (buf, index, length) => {
    const len = length || buf.byteLength - index;
    const copy = Buffer.alloc(len);
    buf.copy(copy, 0, index, index + len);
    return copy;
};
exports.copyBuffer = (buf) => {
    if (buf == undefined)
        return undefined;
    return exports.sliceBuffer(buf, 0, buf.length);
};
