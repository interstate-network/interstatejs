"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingTxFields = exports.SignedTxFields = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const types_1 = require("./types");
const utils_1 = require("@interstatejs/utils");
const encode_1 = require("./encode");
const ABI = require('ethereumjs-abi');
const N_DIV_2 = new ethereumjs_util_1.BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16);
class UnionTransaction {
    constructor(data = {}, opts = {}) {
        this.isSigned = () => this.type == types_1.TransactionType.signed;
        this.isFake = () => this.type == types_1.TransactionType.fake;
        this.encodeForDb = () => this.encode(true, true, true);
        this.toJsonRpc = () => {
            let output = this.encodeForDb();
            let input = output.data + "";
            delete output.data;
            output.input = input;
            return output;
        };
        if (opts.common) {
            if (opts.chain || opts.hardfork) {
                throw new Error('Instantiation with both opts.common, and opts.chain and opts.hardfork parameter not allowed!');
            }
            this._common = opts.common;
        }
        else {
            this._common = utils_1.common;
        }
        let setType = (_type) => {
            this.type = _type;
            switch (_type) {
                case types_1.TransactionType.fake:
                    ethereumjs_util_1.defineProperties(this, exports.SignedTxFields, data);
                    Object.defineProperty(this, 'from', {
                        enumerable: true,
                        configurable: true,
                        get: () => this.getSenderAddress(),
                        set: val => (val && (this._from = ethereumjs_util_1.toBuffer(val))),
                    });
                    const txData = data;
                    if (txData.from)
                        this.from = ethereumjs_util_1.toBuffer(txData.from);
                    break;
                case types_1.TransactionType.signed:
                    Object.defineProperty(this, 'from', {
                        enumerable: true,
                        configurable: true,
                        get: () => this.getSenderAddress(),
                    });
                    ethereumjs_util_1.defineProperties(this, exports.SignedTxFields, data);
                    break;
                case types_1.TransactionType.incoming:
                    ethereumjs_util_1.defineProperties(this, exports.IncomingTxFields, data);
                    break;
                default: throw new Error('Could not identify transaction type.');
            }
        };
        let _inputParams = null;
        if (!data)
            setType(types_1.TransactionType.fake);
        else if (typeof data == 'string')
            _inputParams = ethereumjs_util_1.rlp.decode(ethereumjs_util_1.toBuffer(data));
        else if (Buffer.isBuffer(data))
            _inputParams = ethereumjs_util_1.rlp.decode(data);
        else if (Array.isArray(data))
            _inputParams = data.map((f) => ethereumjs_util_1.toBuffer(f));
        else if (typeof data === "object") {
            if (data.stateRoot)
                this.stateRoot = ethereumjs_util_1.toBuffer(data.stateRoot);
            if (data._type !== undefined)
                setType(data._type);
            else {
                const keys = Object.keys(data);
                if (keys.indexOf('itxIndex') !== -1)
                    setType(types_1.TransactionType.incoming);
                else if (keys.indexOf('v') !== -1)
                    setType(types_1.TransactionType.signed);
                else
                    setType(types_1.TransactionType.fake);
            }
        }
        else
            throw new Error('Fields Not Recognized.');
        if (_inputParams) {
            if (!Array.isArray(_inputParams))
                throw new Error('Did not decode input data to buffer array.');
            if (_inputParams.length == exports.SignedTxFields.length)
                setType(types_1.TransactionType.signed);
            else if (_inputParams[0].length == 20)
                setType(types_1.TransactionType.incoming);
            else
                setType(types_1.TransactionType.fake);
        }
        this._validateV(this.v);
        this._overrideVSetterWithValidation();
    }
    get isIncoming() {
        return this.type == types_1.TransactionType.incoming;
    }
    toRollup(outputRoot = this.stateRoot) {
        if (this.isIncoming)
            return outputRoot;
        return Buffer.concat([ethereumjs_util_1.rlp.encode(this.raw), outputRoot]);
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
            baseData.from = ethereumjs_util_1.bufferToHex(this._from || this.from);
        if (this.isIncoming) {
            baseData = Object.assign(Object.assign({}, baseData), { itxIndex: ethereumjs_util_1.bufferToHex(this.itxIndex), from: ethereumjs_util_1.bufferToHex(this.from) });
        }
        else if (this.isFake()) {
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
    static fromJSON(json, type, options) {
        let tx = new UnionTransaction(json, options);
        let expectedType = type || json._type;
        if (expectedType == types_1.TransactionType.fake)
            tx.type = types_1.TransactionType.fake;
        if (expectedType &&
            expectedType != types_1.TransactionType.none &&
            tx.type !== expectedType)
            throw new Error(`Unexpected transaction type: got ${tx.type} expected ${expectedType}`);
        return tx;
    }
    serialize() {
        return ethereumjs_util_1.rlp.encode(this.raw);
    }
    toJSON(labels = false) {
        return {};
    }
    toCreationAddress() {
        return this.to.toString('hex') === '';
    }
    getChainId() {
        return this._common.chainId();
    }
    hash(includeSignature = true) {
        if (this.isIncoming) {
            return encode_1.hashABI(this);
        }
        if (this.isFake()) {
            if (includeSignature && this._from && this._from.toString('hex') !== '') {
                const fakeKey = Buffer.concat([this._from, this._from.slice(0, 12)]);
                this.sign(fakeKey);
            }
        }
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
    getSenderPublicKey() {
        if (this.isIncoming)
            throw new Error('Can not derive public key from incoming transaction');
        if (!this.verifySignature()) {
            console.log(`Got error in signature`);
            const { v, r, s } = this;
            console.log({ v: utils_1.toHex(v), r: utils_1.toHex(r), s: utils_1.toHex(s) });
            throw new Error('Invalid Signature');
        }
        return this._senderPubKey;
    }
    getSenderAddress() {
        if (this.isIncoming)
            return this.from;
        if (this.isFake()) {
            if (!this._from)
                throw new Error('Fake tx does not have from address.');
            return this._from;
        }
        if (this._from)
            return this._from;
        const pubkey = this.getSenderPublicKey();
        this._from = ethereumjs_util_1.publicToAddress(pubkey);
        return this._from;
    }
    verifySignature() {
        if (this.isIncoming)
            return true;
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
        if (this.isIncoming)
            throw new Error('Attempted to sign incoming transaction.');
        this.v = new Buffer([]);
        this.s = new Buffer([]);
        this.r = new Buffer([]);
        const msgHash = this.hash(false);
        const sig = ethereumjs_util_1.ecsign(msgHash, privateKey);
        if (this._implementsEIP155()) {
            sig.v += this.getChainId() * 2 + 8;
        }
        Object.assign(this, sig);
    }
    getDataFee() {
        if (this.isIncoming)
            return new ethereumjs_util_1.BN(0);
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
        if (this.isIncoming)
            return new ethereumjs_util_1.BN(0);
        const fee = this.getDataFee().iaddn(this._common.param('gasPrices', 'tx'));
        if (this._common.gteHardfork('homestead') && this.toCreationAddress()) {
            fee.iaddn(this._common.param('gasPrices', 'txCreation'));
        }
        return fee;
    }
    getUpfrontCost() {
        if (this.isIncoming)
            return new ethereumjs_util_1.BN(0);
        return new ethereumjs_util_1.BN(this.gasLimit).imul(new ethereumjs_util_1.BN(this.gasPrice)).iadd(new ethereumjs_util_1.BN(this.value));
    }
    validate(stringError = false) {
        if (this.isIncoming) {
            if (stringError)
                return '';
            return true;
        }
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
    validateNonce(expectedNonce) {
        let nonce;
        if (this.isSigned() && this.nonce.length === 0) {
            nonce = Buffer.from([0]);
        }
        else {
            nonce = this.nonce;
        }
        return nonce.equals(expectedNonce);
    }
    _validateV(v) {
        if (this.isIncoming)
            return;
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
        const isValidEIP155V = vInt === this.getChainId() * 2 + 35 ||
            vInt === this.getChainId() * 2 + 36;
        if (!isValidEIP155V) {
            throw new Error([
                `Incompatible EIP155-based V ${vInt} and chain id ${this.getChainId()}.`,
                `See the second parameter of the Transaction constructor to set the chain id.`,
            ].join(' '));
        }
    }
    _isSigned() {
        return !this.isIncoming && this.v.length > 0 && this.r.length > 0 && this.s.length > 0;
    }
    _overrideVSetterWithValidation() {
        if (this.isIncoming)
            return;
        const vDescriptor = Object.getOwnPropertyDescriptor(this, 'v');
        Object.defineProperty(this, 'v', Object.assign(Object.assign({}, vDescriptor), { set: v => {
                if (v !== undefined) {
                    this._validateV(ethereumjs_util_1.toBuffer(v));
                }
                vDescriptor.set(v);
            } }));
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
exports.default = UnionTransaction;
exports.SignedTxFields = [
    {
        name: 'nonce',
        length: 32,
        allowLess: true,
        default: new Buffer([]),
    },
    {
        name: 'gasPrice',
        length: 32,
        allowLess: true,
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
        name: 'to',
        allowZero: true,
        length: 20,
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
    {
        name: 'v',
        allowZero: true,
        default: new Buffer([]),
    },
    {
        name: 'r',
        length: 32,
        allowZero: true,
        allowLess: true,
        default: new Buffer([]),
    },
    {
        name: 's',
        length: 32,
        allowZero: true,
        allowLess: true,
        default: new Buffer([]),
    },
];
exports.IncomingTxFields = [
    {
        name: 'from',
        length: 20,
        allowZero: true,
        default: new Buffer([]),
    },
    {
        name: 'to',
        length: 20,
        allowZero: true,
        default: new Buffer([]),
    },
    {
        name: 'itxIndex',
        length: 32,
        allowLess: true,
        allowZero: true,
        default: new Buffer([]),
    },
    {
        name: 'gasLimit',
        alias: 'gas',
        length: 32,
        allowLess: true,
        allowZero: true,
        default: new Buffer([]),
    },
    {
        name: 'value',
        length: 32,
        allowLess: true,
        allowZero: true,
        default: new Buffer([]),
    },
    {
        name: 'data',
        alias: 'input',
        allowZero: true,
        default: new Buffer([]),
    },
];
//# sourceMappingURL=union.js.map