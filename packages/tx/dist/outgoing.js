"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutgoingTransaction = exports.outgoingTransactionFromCallInputs = exports.outgoingTransactionParams = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const utils_1 = require("@interstatejs/utils");
const exceptions_1 = require("@interstatejs/vm/lib/exceptions");
const ABI = require('web3-eth-abi');
exports.outgoingTransactionParams = [
    'address', 'address', 'uint256', 'uint256', 'bytes', 'uint256'
];
const wordCeiling = (value, ceiling = 32) => {
    const r = value % ceiling;
    if (r === 0) {
        return value;
    }
    else {
        return value + ceiling - r;
    }
};
const relayFunctions = {
    withdraw: {
        signature: ABI.encodeFunctionSignature('withdraw()'),
        params: []
    },
    withdrawWithBounty: {
        signature: ABI.encodeFunctionSignature('withdraw(uint256)'),
        params: ['uint256']
    },
    addTransaction: {
        signature: ABI.encodeFunctionSignature('addTransaction(address,bytes)'),
        params: ['address', 'bytes']
    },
    addTransactionWithBounty: {
        signature: ABI.encodeFunctionSignature('addTransactionWithBounty(address,bytes,uint256)'),
        params: ['address', 'bytes', 'uint256']
    }
};
function outgoingTransactionFromCallInputs(fullCalldata, caller, value, gas) {
    const fnSig = ethereumjs_util_1.addHexPrefix(fullCalldata.subarray(0, 4).toString('hex'));
    const calldata = fullCalldata.subarray(4);
    let tx;
    let inputs;
    let bounty;
    switch (fnSig) {
        case relayFunctions.withdraw.signature:
            if (calldata.length != 0)
                throw new exceptions_1.VmError(exceptions_1.ERROR.INVALID_OPCODE);
            tx = new OutgoingTransaction({
                from: caller,
                to: caller,
                value: value,
            });
            break;
        case relayFunctions.withdrawWithBounty.signature:
            if (calldata.length != 32)
                throw new exceptions_1.VmError(exceptions_1.ERROR.INVALID_OPCODE);
            inputs = ABI.decodeParameter('uint256', calldata);
            bounty = utils_1.toBn(inputs[0]);
            if (value.lt(bounty)) {
                throw new exceptions_1.VmError(exceptions_1.ERROR.INSUFFICIENT_VALUE_FOR_BOUNTY);
            }
            tx = new OutgoingTransaction({
                from: caller,
                to: caller,
                value: value.sub(bounty),
                bounty,
                data: Buffer.alloc(0)
            });
            break;
        case relayFunctions.addTransaction.signature:
            try {
                inputs = ABI.decodeParameters(relayFunctions.addTransaction.params, calldata);
            }
            catch (err) {
                throw new exceptions_1.VmError(exceptions_1.ERROR.INVALID_OPCODE);
            }
            tx = new OutgoingTransaction({
                from: caller,
                to: ethereumjs_util_1.toBuffer(inputs[0]),
                data: ethereumjs_util_1.toBuffer(inputs[1]),
                value: value
            });
            break;
        case relayFunctions.addTransactionWithBounty.signature:
            try {
                inputs = ABI.decodeParameters(relayFunctions.addTransactionWithBounty.params, calldata);
            }
            catch (err) {
                throw new exceptions_1.VmError(exceptions_1.ERROR.INVALID_OPCODE);
            }
            bounty = utils_1.toBn(inputs[2]);
            if (value.lt(bounty)) {
                throw new exceptions_1.VmError(exceptions_1.ERROR.INSUFFICIENT_VALUE_FOR_BOUNTY);
            }
            tx = new OutgoingTransaction({
                from: caller,
                to: ethereumjs_util_1.toBuffer(inputs[0]),
                data: ethereumjs_util_1.toBuffer(inputs[1]),
                value: value.sub(bounty),
                bounty
            });
            break;
        default:
            throw new Error('Invalid function signature.');
    }
    let gasFee = tx.gasFee();
    if (gas.lt(gasFee)) {
        throw new exceptions_1.VmError(exceptions_1.ERROR.OUT_OF_GAS);
    }
    tx.gasLimit = gas.sub(gasFee);
    return tx;
}
exports.outgoingTransactionFromCallInputs = outgoingTransactionFromCallInputs;
class OutgoingTransaction {
    constructor(opts) {
        Object.assign(this, opts);
        if (!this.bounty)
            this.bounty = new ethereumjs_util_1.BN(0);
        if (!this.gasLimit)
            this.gasLimit = new ethereumjs_util_1.BN(0);
        if (!this.data)
            this.data = Buffer.alloc(0);
    }
    encode() {
        return ABI.encodeParameters(exports.outgoingTransactionParams, [
            this.from,
            this.to,
            this.gasLimit,
            this.value,
            this.data,
            this.bounty
        ].map(utils_1.toHex));
    }
    gasFee() {
        const dataWords = wordCeiling(this.data.length) / 32;
        const words = 6 + dataWords;
        return new ethereumjs_util_1.BN(10000).muln(words);
    }
}
exports.OutgoingTransaction = OutgoingTransaction;
//# sourceMappingURL=outgoing.js.map