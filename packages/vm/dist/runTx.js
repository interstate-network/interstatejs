"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const ethereumjs_util_1 = require("ethereumjs-util");
const bloom_1 = __importDefault(require("./bloom"));
const evm_1 = __importDefault(require("./evm/evm"));
const message_1 = __importDefault(require("./evm/message"));
const txContext_1 = __importDefault(require("./evm/txContext"));
const block_1 = require("@interstatejs/block");
async function runTx(opts) {
    if (opts === undefined) {
        throw new Error('invalid input, opts must be provided');
    }
    if (!opts.tx) {
        throw new Error('invalid input, tx is required');
    }
    if (!opts.block) {
        opts.block = new block_1.Block();
    }
    const state = this.stateManager;
    await state.checkpoint();
    try {
        const result = await _runTx.bind(this)(opts);
        await state.commit();
        return result;
    }
    catch (e) {
        await state.revert();
        throw e;
    }
}
exports.default = runTx;
async function _runTx(opts) {
    const block = opts.block;
    const tx = opts.tx;
    const state = this.stateManager;
    await this._emit('beforeTx', tx);
    const basefee = tx.getBaseFee();
    const gasLimit = new BN(tx.gasLimit);
    if (gasLimit.lt(basefee)) {
        throw new Error('base fee exceeds gas limit');
    }
    gasLimit.isub(basefee);
    let fromAccount = await state.getAccount(tx.getSenderAddress());
    if (!opts.tx.isIncoming) {
        if (!opts.skipBalance && new BN(fromAccount.balance).lt(tx.getUpfrontCost())) {
            throw new Error(`sender doesn't have enough funds to send tx. The upfront cost is: ${tx
                .getUpfrontCost()
                .toString()}` +
                ` and the sender's account only has: ${new BN(fromAccount.balance).toString()}`);
        }
        else if (!opts.skipNonce && !new BN(fromAccount.nonce).eq(new BN(tx.nonce))) {
            throw new Error(`the tx doesn't have the correct nonce. account has nonce of: ${new BN(fromAccount.nonce).toString()} tx has nonce of: ${new BN(tx.nonce).toString()}`);
        }
        fromAccount.nonce = ethereumjs_util_1.toBuffer(new BN(fromAccount.nonce).addn(1));
        fromAccount.balance = ethereumjs_util_1.toBuffer(new BN(fromAccount.balance).sub(new BN(tx.gasLimit).mul(new BN(tx.gasPrice))));
        await state.putAccount(tx.getSenderAddress(), fromAccount);
    }
    const origin = tx.isIncoming ? Buffer.alloc(20, 0, 'hex') : tx.getSenderAddress();
    const txContext = new txContext_1.default(tx.gasPrice, origin);
    const message = new message_1.default({
        caller: tx.getSenderAddress(),
        gasLimit: gasLimit,
        to: tx.to.toString('hex') !== '' ? tx.to : undefined,
        value: tx.value,
        data: tx.data,
        isFirstIncoming: opts.tx.isIncoming
    });
    state._clearOriginalStorageCache();
    const evm = new evm_1.default(this, txContext, block);
    const results = (await evm.executeMessage(message));
    results.bloom = txLogsBloom(results.execResult.logs);
    results.gasUsed = results.gasUsed.add(basefee);
    results.gasRefund = results.execResult.gasRefund;
    if (results.gasRefund) {
        if (results.gasRefund.lt(results.gasUsed.divn(2))) {
            results.gasUsed.isub(results.gasRefund);
        }
        else {
            results.gasUsed.isub(results.gasUsed.divn(2));
        }
    }
    results.amountSpent = results.gasUsed.mul(new BN(tx.gasPrice));
    if (!opts.tx.isIncoming) {
        fromAccount = await state.getAccount(tx.getSenderAddress());
        const finalFromBalance = new BN(tx.gasLimit)
            .sub(results.gasUsed)
            .mul(new BN(tx.gasPrice))
            .add(new BN(fromAccount.balance));
        fromAccount.balance = ethereumjs_util_1.toBuffer(finalFromBalance);
        await state.putAccount(tx.getSenderAddress(), fromAccount);
        const minerAccount = await state.getAccount(block.header.coinbase);
        minerAccount.balance = ethereumjs_util_1.toBuffer(new BN(minerAccount.balance).add(results.amountSpent));
        await state.putAccount(block.header.coinbase, minerAccount);
    }
    await this._emit('afterTx', results);
    opts.tx.stateRoot = await state.forceGetStateRoot();
    results.stateRoot = new BN(opts.tx.stateRoot, 'hex');
    return results;
}
function txLogsBloom(logs) {
    const bloom = new bloom_1.default();
    if (logs) {
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            bloom.add(log[0]);
            const topics = log[1];
            for (let q = 0; q < topics.length; q++) {
                bloom.add(topics[q]);
            }
        }
    }
    return bloom;
}
//# sourceMappingURL=runTx.js.map