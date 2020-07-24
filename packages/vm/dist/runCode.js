"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const txContext_1 = __importDefault(require("./evm/txContext"));
const message_1 = __importDefault(require("./evm/message"));
const evm_1 = __importDefault(require("./evm/evm"));
const { Block } = require('@interstatejs/block');
function runCode(opts) {
    if (!opts.block) {
        opts.block = new Block();
    }
    if (!opts.txContext) {
        opts.txContext = new txContext_1.default(opts.gasPrice || Buffer.alloc(0), opts.origin || opts.caller || ethereumjs_util_1.zeros(32));
    }
    if (!opts.message) {
        opts.message = new message_1.default({
            code: opts.code,
            data: opts.data,
            gasLimit: opts.gasLimit,
            to: opts.address || ethereumjs_util_1.zeros(32),
            caller: opts.caller,
            value: opts.value,
            depth: opts.depth || 0,
            selfdestruct: opts.selfdestruct || {},
            isStatic: opts.isStatic || false,
        });
    }
    let evm = opts.evm;
    if (!evm) {
        evm = new evm_1.default(this, opts.txContext, opts.block);
    }
    return evm.runInterpreter(opts.message, { pc: opts.pc });
}
exports.default = runCode;
//# sourceMappingURL=runCode.js.map