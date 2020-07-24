"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const buffer_1 = require("buffer");
const types_1 = require("./types");
const signed_1 = __importDefault(require("./signed"));
class FakeTransaction extends signed_1.default {
    constructor(data = {}, opts = {}) {
        super(data, opts);
        this.type = types_1.TransactionType.fake;
        Object.defineProperty(this, 'from', {
            enumerable: true,
            configurable: true,
            get: () => this.getSenderAddress(),
            set: val => (val && (this._from = ethereumjs_util_1.toBuffer(val))),
        });
        const txData = data;
        if (txData.from) {
            this.from = ethereumjs_util_1.toBuffer(txData.from);
        }
    }
    hash(includeSignature = true) {
        if (includeSignature && this._from && this._from.toString('hex') !== '') {
            const fakeKey = buffer_1.Buffer.concat([this._from, this._from.slice(0, 12)]);
            this.sign(fakeKey);
        }
        return super.hash(includeSignature);
    }
}
exports.default = FakeTransaction;
//# sourceMappingURL=fake.js.map