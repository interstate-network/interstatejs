"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const types_1 = require("./types");
const encode_1 = require("./encode");
const utils_1 = require("@interstatejs/utils");
const ABI = require('ethereumjs-abi');
class IncomingTransaction {
    constructor(data, opts = {}) {
        this.type = types_1.TransactionType.incoming;
        this.isIncoming = true;
        this.getDataFee = () => new ethereumjs_util_1.BN(0);
        this.getBaseFee = () => new ethereumjs_util_1.BN(0);
        this.getUpfrontCost = () => new ethereumjs_util_1.BN(0);
        this.getSenderAddress = () => this.from;
        this.serialize = () => ethereumjs_util_1.rlp.encode(this.raw);
        this.hash = (_) => ethereumjs_util_1.rlphash(this.raw);
        this.toJSON = () => ({});
        if (opts.common) {
            if (opts.chain || opts.hardfork) {
                throw new Error('Instantiation with both opts.common, and opts.chain and opts.hardfork parameter not allowed!');
            }
            this._common = opts.common;
        }
        else {
            this._common = utils_1.common;
        }
        const fields = [
            {
                name: 'itxIndex',
                length: 32,
                allowLess: true,
                default: new Buffer([]),
            },
            {
                name: 'from',
                length: 20,
                allowLess: true,
                default: new Buffer([]),
            },
            {
                name: 'to',
                length: 20,
                allowZero: true,
                default: new Buffer([]),
            },
            {
                name: 'gasLimit',
                alias: 'gas',
                length: 32,
                allowLess: true,
                default: new Buffer([]),
            },
            {
                name: 'value',
                length: 32,
                allowLess: true,
                default: new Buffer([]),
            },
            {
                name: 'data',
                alias: 'input',
                allowZero: true,
                default: new Buffer([]),
            },
        ];
        ethereumjs_util_1.defineProperties(this, fields, data);
    }
    validate(stringError = false) {
        if (stringError === false)
            return false;
        else
            return '';
    }
    toRollup(outputRoot = this.stateRoot) {
        return outputRoot;
    }
    encode(includeHash, includeType, includeFrom) {
        let baseData = {
            to: ethereumjs_util_1.bufferToHex(this.to),
            gasLimit: ethereumjs_util_1.bufferToHex(this.gasLimit),
            value: ethereumjs_util_1.bufferToHex(this.value),
            data: ethereumjs_util_1.bufferToHex(this.data),
            stateRoot: ethereumjs_util_1.bufferToHex(this.stateRoot)
        };
        if (includeHash)
            baseData.hash = this.hash(false);
        if (includeType)
            baseData._type = this.type.toString();
        baseData = Object.assign(Object.assign({}, baseData), { itxIndex: ethereumjs_util_1.bufferToHex(this.itxIndex), from: ethereumjs_util_1.bufferToHex(this.from) });
        return baseData;
    }
    encodeABI() {
        return encode_1.encodeABI(this);
    }
    hashABI() {
        return encode_1.hashABI(this);
    }
}
exports.default = IncomingTransaction;
//# sourceMappingURL=incoming.js.map