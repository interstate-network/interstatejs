"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const evm_1 = require("../evm");
const assert = require('assert');
const bn128 = require('rustbn.js');
function default_1(opts) {
    assert(opts.data);
    const inputData = opts.data;
    const gasUsed = new BN(opts._common.param('gasPrices', 'ecMul'));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    let returnData = bn128.mul(inputData);
    if (returnData.length !== 64) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed,
        returnValue: returnData,
    };
}
exports.default = default_1;
//# sourceMappingURL=07-ecmul.js.map