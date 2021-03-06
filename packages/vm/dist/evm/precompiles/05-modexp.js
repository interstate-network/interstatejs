"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const ethereumjs_util_1 = require("ethereumjs-util");
const evm_1 = require("../evm");
const assert = require('assert');
function multComplexity(x) {
    var fac1;
    var fac2;
    if (x.lten(64)) {
        return x.sqr();
    }
    else if (x.lten(1024)) {
        fac1 = x.sqr().divn(4);
        fac2 = x.muln(96);
        return fac1.add(fac2).subn(3072);
    }
    else {
        fac1 = x.sqr().divn(16);
        fac2 = x.muln(480);
        return fac1.add(fac2).subn(199680);
    }
}
function getAdjustedExponentLength(data) {
    var expBytesStart;
    try {
        var baseLen = new BN(data.slice(0, 32)).toNumber();
        expBytesStart = 96 + baseLen;
    }
    catch (e) {
        expBytesStart = Number.MAX_SAFE_INTEGER - 32;
    }
    var expLen = new BN(data.slice(32, 64));
    var firstExpBytes = Buffer.from(data.slice(expBytesStart, expBytesStart + 32));
    firstExpBytes = ethereumjs_util_1.setLengthRight(firstExpBytes, 32);
    let firstExpBN = new BN(firstExpBytes);
    var max32expLen = 0;
    if (expLen.ltn(32)) {
        max32expLen = 32 - expLen.toNumber();
    }
    firstExpBN = firstExpBN.shrn(8 * Math.max(max32expLen, 0));
    var bitLen = -1;
    while (firstExpBN.gtn(0)) {
        bitLen = bitLen + 1;
        firstExpBN = firstExpBN.ushrn(1);
    }
    var expLenMinus32OrZero = expLen.subn(32);
    if (expLenMinus32OrZero.ltn(0)) {
        expLenMinus32OrZero = new BN(0);
    }
    var eightTimesExpLenMinus32OrZero = expLenMinus32OrZero.muln(8);
    var adjustedExpLen = eightTimesExpLenMinus32OrZero;
    if (bitLen > 0) {
        adjustedExpLen.iaddn(bitLen);
    }
    return adjustedExpLen;
}
function expmod(B, E, M) {
    if (E.isZero())
        return new BN(1).mod(M);
    if (M.lten(1))
        return new BN(0);
    const red = BN.red(M);
    const redB = B.toRed(red);
    const res = redB.redPow(E);
    return res.fromRed();
}
function default_1(opts) {
    assert(opts.data);
    const data = opts.data;
    let adjustedELen = getAdjustedExponentLength(data);
    if (adjustedELen.ltn(1)) {
        adjustedELen = new BN(1);
    }
    const bLen = new BN(data.slice(0, 32));
    const eLen = new BN(data.slice(32, 64));
    const mLen = new BN(data.slice(64, 96));
    let maxLen = bLen;
    if (maxLen.lt(mLen)) {
        maxLen = mLen;
    }
    const Gquaddivisor = opts._common.param('gasPrices', 'modexpGquaddivisor');
    const gasUsed = adjustedELen.mul(multComplexity(maxLen)).divn(Gquaddivisor);
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    if (bLen.isZero()) {
        return {
            gasUsed,
            returnValue: new BN(0).toArrayLike(Buffer, 'be', 1),
        };
    }
    if (mLen.isZero()) {
        return {
            gasUsed,
            returnValue: Buffer.alloc(0),
        };
    }
    const maxInt = new BN(Number.MAX_SAFE_INTEGER);
    const maxSize = new BN(2147483647);
    if (bLen.gt(maxSize) || eLen.gt(maxSize) || mLen.gt(maxSize)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    const bStart = new BN(96);
    const bEnd = bStart.add(bLen);
    const eStart = bEnd;
    const eEnd = eStart.add(eLen);
    const mStart = eEnd;
    const mEnd = mStart.add(mLen);
    if (mEnd.gt(maxInt)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    const B = new BN(ethereumjs_util_1.setLengthRight(data.slice(bStart.toNumber(), bEnd.toNumber()), bLen.toNumber()));
    const E = new BN(ethereumjs_util_1.setLengthRight(data.slice(eStart.toNumber(), eEnd.toNumber()), eLen.toNumber()));
    const M = new BN(ethereumjs_util_1.setLengthRight(data.slice(mStart.toNumber(), mEnd.toNumber()), mLen.toNumber()));
    let R;
    if (M.isZero()) {
        R = new BN(0);
    }
    else {
        R = expmod(B, E, M);
    }
    return {
        gasUsed,
        returnValue: R.toArrayLike(Buffer, 'be', mLen.toNumber()),
    };
}
exports.default = default_1;
//# sourceMappingURL=05-modexp.js.map