"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const ethereumjs_util_1 = require("ethereumjs-util");
const txContext_1 = __importDefault(require("./evm/txContext"));
const message_1 = __importDefault(require("./evm/message"));
const evm_1 = __importDefault(require("./evm/evm"));
const { Block } = require('@interstatejs/block');
function runCall(opts) {
    const block = opts.block || new Block();
    const txContext = new txContext_1.default(opts.gasPrice || Buffer.alloc(0), opts.origin || opts.caller || ethereumjs_util_1.zeros(32));
    const message = new message_1.default({
        caller: opts.caller,
        gasLimit: opts.gasLimit ? new BN(opts.gasLimit) : new BN(0xffffff),
        to: opts.to && opts.to.toString('hex') !== '' ? opts.to : undefined,
        value: opts.value,
        data: opts.data,
        code: opts.code,
        depth: opts.depth || 0,
        isCompiled: opts.compiled || false,
        isStatic: opts.static || false,
        salt: opts.salt || null,
        selfdestruct: opts.selfdestruct || {},
        delegatecall: opts.delegatecall || false,
    });
    const evm = new evm_1.default(this, txContext, block);
    return evm.executeMessage(message);
}
exports.default = runCall;
//# sourceMappingURL=runCall.js.map