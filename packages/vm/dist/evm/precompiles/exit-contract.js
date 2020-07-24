"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeExitCall = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const utils_1 = require("@interstatejs/utils");
const exceptions_1 = require("../../exceptions");
const tx_1 = require("@interstatejs/tx");
const witness_1 = require("../../witness");
const ABI = require('web3-eth-abi');
async function executeExitCall(message) {
    const account = await this._state.getAccount(message.caller);
    let result = {
        gasUsed: message.gasLimit,
        returnValue: Buffer.alloc(0),
        gas: new ethereumjs_util_1.BN(0),
        gasRefund: new ethereumjs_util_1.BN(0)
    };
    await this._state.checkpoint();
    let stateRootEnter;
    try {
        if (message.isStatic)
            throw new exceptions_1.VmError(exceptions_1.ERROR.STATIC_STATE_CHANGE);
        if (utils_1.toBn(account.balance).lt(message.value)) {
            throw new exceptions_1.VmError(exceptions_1.ERROR.INSUFFICIENT_BALANCE);
        }
        await this._reduceSenderBalance(account, message);
    }
    catch (err) {
        result.exceptionError = err;
        await this._state.revert();
    }
    finally {
        if (this._produceWitness) {
            stateRootEnter = new ethereumjs_util_1.BN(await this._state.forceGetStateRoot());
        }
    }
    if (!result.exceptionError) {
        try {
            await _executeExitCall.bind(this)(message);
            await this._state.commit();
        }
        catch (err) {
            result.exceptionError = err;
            await this._state.revert();
        }
    }
    if (this._produceWitness) {
        const stateRootLeave = new ethereumjs_util_1.BN(await this._state.forceGetStateRoot());
        const returnDataHash = new ethereumjs_util_1.BN(ethereumjs_util_1.keccak256(Buffer.alloc(0)));
        const witness = new witness_1.MessageWitness(stateRootEnter, stateRootLeave, message.isStatic, new ethereumjs_util_1.BN(this._tx.origin), new ethereumjs_util_1.BN(message.caller), new ethereumjs_util_1.BN(message.to), new ethereumjs_util_1.BN(message.codeAddress), message.value, new ethereumjs_util_1.BN(this._tx.gasPrice), message.gasLimit, message.gasLimit, result.gasRefund || new ethereumjs_util_1.BN(0), returnDataHash, message.data);
        witness.state_access_list = [];
        if (result.exceptionError) {
            const { error } = result.exceptionError;
            switch (error) {
                case exceptions_1.ERROR.STOP:
                    witness.status = witness_1.Status.success;
                    break;
                case exceptions_1.ERROR.REVERT:
                    witness.status = witness_1.Status.revert;
                    break;
                default:
                    witness.status = witness_1.Status.exception;
                    break;
            }
        }
        else
            witness.status = witness_1.Status.success;
        result.witnesses = [witness];
    }
    console.log(`Executed Exit Call`);
    console.log(`Gas Limit: ${message.gasLimit}`);
    if (this._produceWitness) {
        console.log(`Witness Gas Available: ${result.witnesses[0].gasAvailable}`);
        console.log(`Witness Gas Used: ${result.witnesses[0].gasUsed}`);
    }
    return {
        gasUsed: message.gasLimit,
        execResult: result,
    };
}
exports.executeExitCall = executeExitCall;
async function _executeExitCall(message) {
    if (message.data.length < 4)
        throw new exceptions_1.VmError(exceptions_1.ERROR.INVALID_OPCODE);
    const tx = tx_1.outgoingTransactionFromCallInputs(message.data, message.caller, message.value, message.gasLimit);
    const relay = await this._state.getChildRelay(ethereumjs_util_1.bufferToInt(this._block.header.number));
    await relay.insert(ethereumjs_util_1.toBuffer(tx.encode()));
}
//# sourceMappingURL=exit-contract.js.map