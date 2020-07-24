"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const evm_1 = require("../evm");
const assert = require('assert');
const bn128 = require('rustbn.js');
function default_1(opts) {
    assert(opts.data);
    const inputData = opts.data;
    const inputDataSize = Math.floor(inputData.length / 192);
    const gasUsed = new BN(opts._common.param('gasPrices', 'ecPairing') +
        inputDataSize * opts._common.param('gasPrices', 'ecPairingWord'));
    if (opts.gasLimit.lt(gasUsed)) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    const returnData = bn128.pairing(inputData);
    if (returnData.length !== 32) {
        return evm_1.OOGResult(opts.gasLimit);
    }
    return {
        gasUsed,
        returnValue: returnData,
    };
}
exports.default = default_1;
//# sourceMappingURL=08-ecpairing.js.map