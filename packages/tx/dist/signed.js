"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const utils_1 = require("@interstatejs/utils");
const buffer_1 = require("buffer");
const types_1 = require("./types");
const N_DIV_2 = new ethereumjs_util_1.BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16);
class SignedTransaction {
    constructor(data = {}, opts = {}) {
        this.type = types_1.TransactionType.signed;
        this.isIncoming = false;
        this.isFake = () => this.type == types_1.TransactionType.fake;
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
                name: 'nonce',
                length: 32,
                allowLess: true,
                default: new buffer_1.Buffer([]),
            },
            {
                name: 'gasPrice',
                length: 32,
                allowLess: true,
                default: new buffer_1.Buffer([]),
            },
            {
                name: 'gasLimit',
                alias: 'gas',
                length: 32,
                allowLess: true,
                default: new buffer_1.Buffer([]),
            },
            {
                name: 'to',
                allowZero: true,
                length: 20,
                default: new buffer_1.Buffer([]),
            },
            {
                name: 'value',
                length: 32,
                allowLess: true,
                default: new buffer_1.Buffer([]),
            },
            {
                name: 'data',
                alias: 'input',
                allowZero: true,
                default: new buffer_1.Buffer([]),
            },
            {
                name: 'v',
                allowZero: true,
                default: new buffer_1.Buffer([]),
            },
            {
                name: 'r',
                length: 32,
                allowZero: true,
                allowLess: true,
                default: new buffer_1.Buffer([]),
            },
            {
                name: 's',
                length: 32,
                allowZero: true,
                allowLess: true,
                default: new buffer_1.Buffer([]),
            },
        ];
        ethereumjs_util_1.defineProperties(this, fields, data);
        Object.defineProperty(this, 'from', {
            enumerable: true,
            configurable: true,
            get: this.getSenderAddress.bind(this),
        });
        this._validateV(this.v);
        this._overrideVSetterWithValidation();
    }
    toRollup(outputRoot = this.stateRoot) {
        return buffer_1.Buffer.concat([ethereumjs_util_1.rlp.encode(this.raw), outputRoot]);
    }
    toCreationAddress() {
        return this.to.toString('hex') === '';
    }
    hash(includeSignature = true) {
        let items;
        if (includeSignature) {
            items = this.raw;
        }
        else {
            if (this._implementsEIP155()) {
                items = [
                    ...this.raw.slice(0, 6),
                    ethereumjs_util_1.toBuffer(this.getChainId()),
                    ethereumjs_util_1.stripZeros(ethereumjs_util_1.toBuffer(0)),
                    ethereumjs_util_1.stripZeros(ethereumjs_util_1.toBuffer(0)),
                ];
            }
            else {
                items = this.raw.slice(0, 6);
            }
        }
        return ethereumjs_util_1.rlphash(items);
    }
    getChainId() {
        return this._common.chainId();
    }
    getSenderAddress() {
        if (this._from) {
            return this._from;
        }
        const pubkey = this.getSenderPublicKey();
        this._from = ethereumjs_util_1.publicToAddress(pubkey);
        return this._from;
    }
    getSenderPublicKey() {
        if (!this.verifySignature()) {
            throw new Error('Invalid Signature');
        }
        return this._senderPubKey;
    }
    verifySignature() {
        const msgHash = this.hash(false);
        if (this._common.gteHardfork('homestead') && new ethereumjs_util_1.BN(this.s).cmp(N_DIV_2) === 1) {
            return false;
        }
        try {
            const v = ethereumjs_util_1.bufferToInt(this.v);
            const useChainIdWhileRecoveringPubKey = v >= this.getChainId() * 2 + 35 && this._common.gteHardfork('spuriousDragon');
            this._senderPubKey = ethereumjs_util_1.ecrecover(msgHash, v, this.r, this.s, useChainIdWhileRecoveringPubKey ? this.getChainId() : undefined);
        }
        catch (e) {
            return false;
        }
        return !!this._senderPubKey;
    }
    sign(privateKey) {
        this.v = new buffer_1.Buffer([]);
        this.s = new buffer_1.Buffer([]);
        this.r = new buffer_1.Buffer([]);
        const msgHash = this.hash(false);
        const sig = ethereumjs_util_1.ecsign(msgHash, privateKey);
        if (this._implementsEIP155()) {
            sig.v += this.getChainId() * 2 + 8;
        }
        Object.assign(this, sig);
    }
    getDataFee() {
        const data = this.raw[5];
        const cost = new ethereumjs_util_1.BN(0);
        for (let i = 0; i < data.length; i++) {
            data[i] === 0
                ? cost.iaddn(this._common.param('gasPrices', 'txDataZero'))
                : cost.iaddn(this._common.param('gasPrices', 'txDataNonZero'));
        }
        return cost;
    }
    getBaseFee() {
        const fee = this.getDataFee().iaddn(this._common.param('gasPrices', 'tx'));
        if (this._common.gteHardfork('homestead') && this.toCreationAddress()) {
            fee.iaddn(this._common.param('gasPrices', 'txCreation'));
        }
        return fee;
    }
    getUpfrontCost() {
        return new ethereumjs_util_1.BN(this.gasLimit).imul(new ethereumjs_util_1.BN(this.gasPrice)).iadd(new ethereumjs_util_1.BN(this.value));
    }
    validate(stringError = false) {
        const errors = [];
        if (!this.verifySignature()) {
            errors.push('Invalid Signature');
        }
        if (this.getBaseFee().cmp(new ethereumjs_util_1.BN(this.gasLimit)) > 0) {
            errors.push([`gas limit is too low. Need at least ${this.getBaseFee()}`]);
        }
        if (stringError === false) {
            return errors.length === 0;
        }
        else {
            return errors.join(' ');
        }
    }
    serialize() {
        return ethereumjs_util_1.rlp.encode(this.raw);
    }
    toJSON(labels = false) {
        return {};
    }
    _validateV(v) {
        if (v === undefined || v.length === 0) {
            return;
        }
        if (!this._common.gteHardfork('spuriousDragon')) {
            return;
        }
        const vInt = ethereumjs_util_1.bufferToInt(v);
        if (vInt === 27 || vInt === 28) {
            return;
        }
        const isValidEIP155V = vInt === this.getChainId() * 2 + 35 || vInt === this.getChainId() * 2 + 36;
        if (!isValidEIP155V) {
            throw new Error(`Incompatible EIP155-based V ${vInt} and chain id ${this.getChainId()}. See the second parameter of the Transaction constructor to set the chain id.`);
        }
    }
    _isSigned() {
        return this.v.length > 0 && this.r.length > 0 && this.s.length > 0;
    }
    _overrideVSetterWithValidation() {
        const vDescriptor = Object.getOwnPropertyDescriptor(this, 'v');
        Object.defineProperty(this, 'v', Object.assign(Object.assign({}, vDescriptor), { set: v => {
                if (v !== undefined) {
                    this._validateV(ethereumjs_util_1.toBuffer(v));
                }
                vDescriptor.set(v);
            } }));
    }
    encode(includeHash, includeType, includeFrom) {
        let baseData = {
            to: ethereumjs_util_1.bufferToHex(this.to),
            gasLimit: ethereumjs_util_1.bufferToHex(this.gasLimit),
            value: ethereumjs_util_1.bufferToHex(this.value),
            data: ethereumjs_util_1.bufferToHex(this.data)
        };
        if (includeHash)
            baseData.hash = this.hash();
        if (includeType)
            baseData._type = this.type.toString();
        if (includeFrom || this.isFake())
            baseData.from = ethereumjs_util_1.bufferToHex(this.getSenderAddress());
        if (this.isFake()) {
            baseData = Object.assign(Object.assign({}, baseData), { nonce: ethereumjs_util_1.bufferToHex(this.nonce), gasPrice: ethereumjs_util_1.bufferToHex(this.gasPrice) });
        }
        else {
            baseData = Object.assign(Object.assign({}, baseData), { nonce: ethereumjs_util_1.bufferToHex(this.nonce), gasPrice: ethereumjs_util_1.bufferToHex(this.gasPrice), v: ethereumjs_util_1.bufferToHex(this.v), r: ethereumjs_util_1.bufferToHex(this.r), s: ethereumjs_util_1.bufferToHex(this.s) });
        }
        if (this.stateRoot) {
            baseData.stateRoot = ethereumjs_util_1.bufferToHex(this.stateRoot);
        }
        return baseData;
    }
    _implementsEIP155() {
        const onEIP155BlockOrLater = this._common.gteHardfork('spuriousDragon');
        if (!this._isSigned()) {
            return onEIP155BlockOrLater;
        }
        const v = ethereumjs_util_1.bufferToInt(this.v);
        const vAndChainIdMeetEIP155Conditions = v === this.getChainId() * 2 + 35 || v === this.getChainId() * 2 + 36;
        return vAndChainIdMeetEIP155Conditions && onEIP155BlockOrLater;
    }
}
exports.default = SignedTransaction;
//# sourceMappingURL=signed.js.map