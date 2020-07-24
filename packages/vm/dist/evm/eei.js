"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BN = require("bn.js");
const ethereumjs_util_1 = require("ethereumjs-util");
const exceptions_1 = require("../exceptions");
const message_1 = __importDefault(require("./message"));
const promisify = require('util.promisify');
class EEI {
    constructor(env, state, evm, common, gasLeft) {
        this._lastCallGasUsed = new BN(0);
        this._env = env;
        this._state = state;
        this._evm = evm;
        this._lastReturned = Buffer.alloc(0);
        this._common = common;
        this._gasLeft = gasLeft;
        this._produceWitness = evm._produceWitness;
        this._result = {
            logs: [],
            returnValue: undefined,
            gasRefund: new BN(0),
            selfdestruct: {},
            messageWitnesses: []
        };
    }
    async isPermittedCallTarget(address, isStatic) {
        if (isStatic)
            return this._evm.isCompiled(address);
        if (address.equals(this._state.relayAddress))
            return true;
        if (await this._state.isContract(address))
            return true;
        return false;
    }
    useGas(amount) {
        this._gasLeft.isub(amount);
        if (this._gasLeft.ltn(0)) {
            this._gasLeft = new BN(0);
            trap(exceptions_1.ERROR.OUT_OF_GAS);
        }
    }
    refundGas(amount) {
        this._result.gasRefund.iadd(amount);
    }
    subRefund(amount) {
        this._result.gasRefund.isub(amount);
        if (this._result.gasRefund.ltn(0)) {
            this._result.gasRefund = new BN(0);
            trap(exceptions_1.ERROR.REFUND_EXHAUSTED);
        }
    }
    getAddress() {
        return this._env.address;
    }
    async getExternalBalance(address) {
        if (address.toString('hex') === this._env.address.toString('hex')) {
            return new BN(this._env.contract.balance);
        }
        const account = await this._state.getAccount(address);
        return new BN(account.balance);
    }
    getSelfBalance() {
        return new BN(this._env.contract.balance);
    }
    getCaller() {
        return new BN(this._env.caller);
    }
    getCallValue() {
        return new BN(this._env.callValue);
    }
    getCallData() {
        return this._env.callData;
    }
    getCallDataSize() {
        if (this._env.callData.length === 1 && this._env.callData[0] === 0) {
            return new BN(0);
        }
        return new BN(this._env.callData.length);
    }
    getCodeSize() {
        return new BN(this._env.code.length);
    }
    getCode() {
        return this._env.code;
    }
    isStatic() {
        return this._env.isStatic;
    }
    async getExternalCodeSize(address) {
        const addressBuf = addressToBuffer(address);
        const code = await this._state.getContractCode(addressBuf);
        return new BN(code.length);
    }
    async getExternalCode(address) {
        if (!Buffer.isBuffer(address)) {
            address = addressToBuffer(address);
        }
        return this._state.getContractCode(address);
    }
    getReturnDataSize() {
        return new BN(this._lastReturned.length);
    }
    getReturnData() {
        return this._lastReturned;
    }
    getTxGasPrice() {
        return new BN(this._env.gasPrice);
    }
    getTxOrigin() {
        return new BN(this._env.origin);
    }
    getBlockNumber() {
        return new BN(this._env.block.header.number);
    }
    getBlockCoinbase() {
        return new BN(this._env.block.header.coinbase);
    }
    getBlockTimestamp() {
        return new BN(this._env.block.header.timestamp);
    }
    getBlockDifficulty() {
        return new BN(this._env.block.header.difficulty);
    }
    getBlockGasLimit() {
        return new BN(this._env.block.header.gasLimit);
    }
    getChainId() {
        return new BN(this._common.chainId());
    }
    async getBlockHash(num) {
        const block = await promisify(this._env.blockchain.getBlock).bind(this._env.blockchain)(num);
        return new BN(block.hash());
    }
    async storageStore(key, value) {
        await this._state.putContractStorage(this._env.address, key, value);
        const account = await this._state.getAccount(this._env.address);
        this._env.contract = account;
    }
    async storageLoad(key) {
        return this._state.getContractStorage(this._env.address, key);
    }
    getGasLeft() {
        return new BN(this._gasLeft.toBuffer());
    }
    finish(returnData) {
        this._result.returnValue = returnData;
        trap(exceptions_1.ERROR.STOP);
    }
    revert(returnData) {
        this._result.returnValue = returnData;
        trap(exceptions_1.ERROR.REVERT);
    }
    async selfDestruct(toAddress) {
        return this._selfDestruct(toAddress);
    }
    async _selfDestruct(toAddress) {
        if (!this._result.selfdestruct[this._env.address.toString('hex')]) {
            this._result.gasRefund = this._result.gasRefund.addn(this._common.param('gasPrices', 'selfdestructRefund'));
        }
        this._result.selfdestruct[this._env.address.toString('hex')] = toAddress;
        const toAccount = await this._state.getAccount(toAddress);
        const newBalance = new BN(this._env.contract.balance).add(new BN(toAccount.balance));
        toAccount.balance = ethereumjs_util_1.toBuffer(newBalance);
        await this._state.putAccount(toAddress, toAccount);
        const account = await this._state.getAccount(this._env.address);
        account.balance = ethereumjs_util_1.toBuffer(new BN(0));
        await this._state.putAccount(this._env.address, account);
        trap(exceptions_1.ERROR.STOP);
    }
    log(data, numberOfTopics, topics) {
        if (numberOfTopics < 0 || numberOfTopics > 4) {
            trap(exceptions_1.ERROR.OUT_OF_RANGE);
        }
        if (topics.length !== numberOfTopics) {
            trap(exceptions_1.ERROR.INTERNAL_ERROR);
        }
        const log = [this._env.address];
        log.push(topics);
        log.push(data);
        this._result.logs.push(log);
    }
    async call(gasLimit, address, value, data) {
        const msg = new message_1.default({
            caller: this._env.address,
            gasLimit: gasLimit,
            to: address,
            value: value,
            data: data,
            isStatic: this._env.isStatic,
            depth: this._env.depth + 1,
        });
        return this._baseCall(msg);
    }
    async callCode(gasLimit, address, value, data) {
        const msg = new message_1.default({
            caller: this._env.address,
            gasLimit: gasLimit,
            to: this._env.address,
            codeAddress: address,
            value: value,
            data: data,
            isStatic: this._env.isStatic,
            depth: this._env.depth + 1,
        });
        return this._baseCall(msg);
    }
    async callStatic(gasLimit, address, value, data) {
        const msg = new message_1.default({
            caller: this._env.address,
            gasLimit: gasLimit,
            to: address,
            value: value,
            data: data,
            isStatic: true,
            depth: this._env.depth + 1,
        });
        return this._baseCall(msg);
    }
    async callDelegate(gasLimit, address, value, data) {
        const msg = new message_1.default({
            caller: this._env.caller,
            gasLimit: gasLimit,
            to: this._env.address,
            codeAddress: address,
            value: value,
            data: data,
            isStatic: this._env.isStatic,
            delegatecall: true,
            depth: this._env.depth + 1,
        });
        return this._baseCall(msg);
    }
    async _baseCall(msg) {
        const selfdestruct = Object.assign({}, this._result.selfdestruct);
        msg.selfdestruct = selfdestruct;
        this._lastReturned = Buffer.alloc(0);
        if (!(await this.isPermittedCallTarget(msg.to, msg.isStatic))) {
            this._lastReturned = ethereumjs_util_1.keccak256(exceptions_1.ERROR.DISALLOWED_CALL_TARGET);
            return new BN(0);
        }
        if (msg.delegatecall !== true &&
            new BN(this._env.contract.balance).lt(msg.value)) {
            this._lastReturned = ethereumjs_util_1.keccak256(exceptions_1.ERROR.INSUFFICIENT_BALANCE);
            return new BN(0);
        }
        const results = await this._evm.executeMessage(msg);
        if (results.execResult.logs) {
            this._result.logs = this._result.logs.concat(results.execResult.logs);
        }
        if (this._produceWitness && results.execResult.witnesses) {
            this._result.messageWitnesses = this._result.messageWitnesses.concat(results.execResult.witnesses);
        }
        if (results.execResult.gasRefund) {
            this._result.gasRefund = this._result.gasRefund.add(results.execResult.gasRefund);
        }
        this._lastCallGasUsed = results.gasUsed;
        this.useGas(results.gasUsed);
        if (results.execResult.returnValue &&
            (!results.execResult.exceptionError ||
                results.execResult.exceptionError.error === exceptions_1.ERROR.REVERT)) {
            this._lastReturned = results.execResult.returnValue;
        }
        if (!results.execResult.exceptionError) {
            Object.assign(this._result.selfdestruct, selfdestruct);
            const account = await this._state.getAccount(this._env.address);
            this._env.contract = account;
        }
        return this._getReturnCode(results);
    }
    async isAccountEmpty(address) {
        return this._state.accountIsEmpty(address);
    }
    _getReturnCode(results) {
        if (results.execResult.exceptionError) {
            return new BN(0);
        }
        else {
            return new BN(1);
        }
    }
}
exports.default = EEI;
function trap(err) {
    throw new exceptions_1.VmError(err);
}
const MASK_160 = new BN(1).shln(160).subn(1);
function addressToBuffer(address) {
    if (Buffer.isBuffer(address))
        return address;
    return address.and(MASK_160).toArrayLike(Buffer, 'be', 20);
}
//# sourceMappingURL=eei.js.map