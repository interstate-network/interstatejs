"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OOGResult = void 0;
const BN = require("bn.js");
const ethereumjs_util_1 = require("ethereumjs-util");
const block_1 = require("@interstatejs/block");
const exceptions_1 = require("../exceptions");
const precompiles_1 = require("./precompiles");
const eei_1 = __importDefault(require("./eei"));
const message_1 = __importStar(require("../witness/message"));
const interpreter_1 = __importDefault(require("./interpreter"));
const exit_contract_1 = require("./precompiles/exit-contract");
function OOGResult(gasLimit) {
    return {
        returnValue: Buffer.alloc(0),
        gasUsed: gasLimit,
        exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.OUT_OF_GAS),
    };
}
exports.OOGResult = OOGResult;
class EVM {
    constructor(vm, txContext, block) {
        this._vm = vm;
        this._state = this._vm.stateManager;
        this._tx = txContext;
        this._block = block;
        this._produceWitness = vm.produceWitness;
    }
    async executeMessage(message) {
        await this._vm._emit('beforeMessage', message);
        await this._state.checkpoint();
        let result;
        if (message.to && message.to.equals(this._state.relayAddress)) {
            result = await this._executeExitCall(message);
        }
        else if (message.to && message.to.length) {
            result = await this._executeCall(message);
        }
        else {
            result = await this._executeCreate(message);
        }
        const err = result.execResult.exceptionError;
        if (err && err.error != exceptions_1.ERROR.STOP) {
            result.execResult.logs = [];
            await this._state.revert();
            if (message.isCompiled) {
                if (err.error === exceptions_1.ERROR.OUT_OF_GAS) {
                    await this._touchAccount(message.to);
                }
            }
        }
        else {
            await this._state.commit();
        }
        await this._vm._emit('afterMessage', result);
        return result;
    }
    async _executeExitCall(message) {
        console.log('Entering exit call OwO');
        return exit_contract_1.executeExitCall.bind(this)(message);
    }
    async _executeCall(message) {
        const account = await this._state.getAccount(message.caller);
        if (!message.delegatecall && !message.isFirstIncoming) {
            await this._reduceSenderBalance(account, message);
        }
        const toAccount = await this._state.getAccount(message.to);
        if (!message.delegatecall) {
            await this._addToBalance(toAccount, message);
        }
        let stateRootEnter = this._produceWitness && new BN(await this._state.forceGetStateRoot());
        let result;
        await this._loadCode(message);
        if (!message.code || message.code.length === 0) {
            result = {
                gasUsed: new BN(0),
                returnValue: Buffer.alloc(0),
            };
            if (this._produceWitness) {
                const witness = new message_1.default(stateRootEnter, stateRootEnter, message.isStatic, new BN(this._tx.origin), new BN(message.caller), new BN(message.to), new BN(message.codeAddress), message.value, new BN(this._tx.gasPrice), message.gasLimit, new BN(0), new BN(0), new BN(ethereumjs_util_1.keccak256(Buffer.alloc(0))), message.data);
                witness.status = message_1.Status.success;
                result.witnesses = [witness];
            }
            return {
                gasUsed: new BN(0),
                execResult: result,
            };
        }
        if (message.isCompiled) {
            result = this.runPrecompile(message.code, message.data, message.gasLimit);
        }
        else {
            result = await this.runInterpreter(message);
        }
        if (this._produceWitness) {
            const stateRootLeave = new BN(await this._state.forceGetStateRoot());
            const returnDataHash = new BN(ethereumjs_util_1.keccak256((!result.returnValue || result.returnValue.length == 0) ? Buffer.alloc(0) : result.returnValue));
            const witness = new message_1.default(stateRootEnter, stateRootLeave, message.isStatic, new BN(this._tx.origin), new BN(message.caller), new BN(message.to), new BN(message.codeAddress), message.value, new BN(this._tx.gasPrice), message.gasLimit, result.gasUsed, result.gasRefund || new BN(0), returnDataHash, message.data);
            witness.state_access_list = result.runState.state_access_list || [];
            if (result.exceptionError) {
                const { error } = result.exceptionError;
                switch (error) {
                    case exceptions_1.ERROR.STOP:
                        witness.status = message_1.Status.success;
                        break;
                    case exceptions_1.ERROR.REVERT:
                        witness.status = message_1.Status.revert;
                        break;
                    default:
                        witness.status = message_1.Status.exception;
                        break;
                }
            }
            else
                witness.status = message_1.Status.success;
            result.witnesses = [witness, ...(result.witnesses || [])];
        }
        return {
            gasUsed: result.gasUsed,
            execResult: result,
        };
    }
    async _executeCreate(message) {
        if (!message.isFirstIncoming) {
            return {
                gasUsed: message.gasLimit,
                createdAddress: message.to,
                execResult: {
                    returnValue: Buffer.alloc(0),
                    exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.ATTEMPTED_CREATE),
                    gasUsed: message.gasLimit,
                }
            };
        }
        const account = await this._state.getAccount(message.caller);
        if ((account.nonce && new BN(account.nonce).gtn(0)) ||
            account.codeHash.compare(ethereumjs_util_1.KECCAK256_NULL) !== 0) {
            return {
                gasUsed: message.gasLimit,
                createdAddress: message.caller,
                execResult: {
                    returnValue: Buffer.alloc(0),
                    exceptionError: new exceptions_1.VmError(exceptions_1.ERROR.CREATE_COLLISION),
                    gasUsed: message.gasLimit,
                },
            };
        }
        await this._state.clearContractStorage(message.caller);
        await this._addToBalance(account, message);
        message.code = message.data;
        message.data = Buffer.alloc(0);
        message.to = message.caller;
        const newContractEvent = {
            address: message.to,
            code: message.code,
        };
        await this._vm._emit('newContract', newContractEvent);
        await this._state.putContractCode(message.to, message.code);
        return {
            gasUsed: new BN(0),
            createdAddress: message.to,
            execResult: {
                returnValue: new Buffer(1),
                gasUsed: new BN(0)
            },
        };
    }
    async runInterpreter(message, opts = {}) {
        const env = {
            blockchain: this._vm.blockchain,
            address: message.to || ethereumjs_util_1.zeros(32),
            caller: message.caller || ethereumjs_util_1.zeros(32),
            callData: message.data || Buffer.from([0]),
            callValue: message.value || new BN(0),
            code: message.code,
            isStatic: message.isStatic || false,
            depth: message.depth || 0,
            gasPrice: this._tx.gasPrice,
            origin: this._tx.origin || message.caller || ethereumjs_util_1.zeros(32),
            block: this._block || new block_1.Block(),
            contract: await this._state.getAccount(message.to || ethereumjs_util_1.zeros(32)),
        };
        const eei = new eei_1.default(env, this._state, this, this._vm._common, message.gasLimit.clone());
        if (message.selfdestruct) {
            eei._result.selfdestruct = message.selfdestruct;
        }
        const interpreter = new interpreter_1.default(this._vm, eei);
        const interpreterRes = await interpreter.run(message.code, opts);
        let result = eei._result;
        let gasUsed = message.gasLimit.sub(eei._gasLeft);
        if (interpreterRes.exceptionError) {
            if (interpreterRes.exceptionError.error !== exceptions_1.ERROR.REVERT) {
                gasUsed = message.gasLimit;
            }
            result = Object.assign(Object.assign({}, result), { logs: [], gasRefund: new BN(0), selfdestruct: {}, messageWitnesses: [] });
        }
        return Object.assign(Object.assign({}, result), { runState: Object.assign(Object.assign(Object.assign({}, interpreterRes.runState), result), eei._env), exceptionError: interpreterRes.exceptionError, gas: eei._gasLeft, gasUsed, witnesses: eei._result.messageWitnesses, returnValue: result.returnValue ? result.returnValue : Buffer.alloc(0) });
    }
    getPrecompile(address) {
        return precompiles_1.getPrecompile(address.toString('hex'));
    }
    runPrecompile(code, data, gasLimit) {
        if (typeof code !== 'function') {
            throw new Error('Invalid precompile');
        }
        const opts = {
            data,
            gasLimit,
            _common: this._vm._common,
        };
        return code(opts);
    }
    async isCompiled(address) {
        const precompile = this.getPrecompile(address);
        return !!precompile;
    }
    async _loadCode(message) {
        if (!message.code) {
            const precompile = this.getPrecompile(message.codeAddress);
            if (precompile) {
                message.code = precompile;
                message.isCompiled = true;
            }
            else {
                message.code = await this._state.getContractCode(message.codeAddress);
                message.isCompiled = false;
            }
        }
    }
    async _generateAddress(message) {
        let addr;
        if (message.salt) {
            addr = ethereumjs_util_1.generateAddress2(message.caller, message.salt, message.code);
        }
        else {
            const acc = await this._state.getAccount(message.caller);
            const newNonce = new BN(acc.nonce).subn(1);
            addr = ethereumjs_util_1.generateAddress(message.caller, newNonce.toArrayLike(Buffer));
        }
        return addr;
    }
    async _reduceSenderBalance(account, message) {
        const newBalance = new BN(account.balance).sub(message.value);
        account.balance = ethereumjs_util_1.toBuffer(newBalance);
        return this._state.putAccount(ethereumjs_util_1.toBuffer(message.caller), account);
    }
    async _addToBalance(toAccount, message) {
        if (message.value.eqn(0))
            return;
        const newBalance = new BN(toAccount.balance).add(message.value);
        if (newBalance.gt(ethereumjs_util_1.MAX_INTEGER)) {
            throw new Error('Value overflow');
        }
        toAccount.balance = ethereumjs_util_1.toBuffer(newBalance);
        return this._state.putAccount(ethereumjs_util_1.toBuffer(message.to), toAccount);
    }
    async _touchAccount(address) {
        const acc = await this._state.getAccount(address);
        return this._state.putAccount(address, acc);
    }
}
exports.default = EVM;
//# sourceMappingURL=evm.js.map