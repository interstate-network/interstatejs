"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
class Message {
    constructor(opts) {
        this.to = opts.to;
        this.value = opts.value ? new BN(opts.value) : new BN(0);
        this.caller = opts.caller;
        this.gasLimit = opts.gasLimit ? new BN(opts.gasLimit) : new BN(0);
        this.data = opts.data || Buffer.alloc(0);
        this.depth = opts.depth || 0;
        this.code = opts.code;
        this._codeAddress = opts.codeAddress;
        this.isStatic = opts.isStatic || false;
        this.isCompiled = opts.isCompiled || false;
        this.isFirstIncoming = opts.isFirstIncoming || false;
        this.salt = opts.salt;
        this.selfdestruct = opts.selfdestruct;
        this.delegatecall = opts.delegatecall || false;
    }
    get codeAddress() {
        return this._codeAddress ? this._codeAddress : this.to;
    }
}
exports.default = Message;
//# sourceMappingURL=message.js.map