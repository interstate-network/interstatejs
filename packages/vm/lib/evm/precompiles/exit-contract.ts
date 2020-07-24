import Message from "../message";
import { addHexPrefix, BN, toBuffer, bufferToInt, keccak256 } from "ethereumjs-util";
import { toHex, toBn } from "@interstatejs/utils";
import EVM, { ExecResult, EVMResult } from "../evm";
import { VmError, ERROR } from "../../exceptions";
import { outgoingTransactionFromCallInputs } from "@interstatejs/tx";
import { MessageWitness, Status } from "../../witness";
const ABI = require('web3-eth-abi');

export async function executeExitCall(this: EVM, message: Message): Promise<EVMResult> {
  const account = await this._state.getAccount(message.caller)
  let result: ExecResult = {
    gasUsed: message.gasLimit,
    returnValue: Buffer.alloc(0),
    gas: new BN(0),
    gasRefund: new BN(0)
  };
  await this._state.checkpoint();
  let stateRootEnter: BN;
  try {
    if (message.isStatic) throw new VmError(ERROR.STATIC_STATE_CHANGE);
    if (toBn(account.balance).lt(message.value)) {
      throw new VmError(ERROR.INSUFFICIENT_BALANCE)
    }
    await this._reduceSenderBalance(account, message)
  } catch (err) {
    result.exceptionError = err;
    await this._state.revert();
  } finally {
    if (this._produceWitness) {
      stateRootEnter = new BN(await this._state.forceGetStateRoot());
    }
  }
  if (!result.exceptionError) {
    try {
      await _executeExitCall.bind(this)(message);
      await this._state.commit();
    } catch (err) {
      result.exceptionError = err;
      await this._state.revert();
    }
  }
  if (this._produceWitness) {
    const stateRootLeave = new BN(await this._state.forceGetStateRoot());
    const returnDataHash = new BN(keccak256(Buffer.alloc(0)))
    const witness = new MessageWitness(
      stateRootEnter,
      stateRootLeave,
      message.isStatic,
      new BN(this._tx.origin),
      new BN(message.caller),
      new BN(message.to),
      new BN(message.codeAddress),
      message.value,
      new BN(this._tx.gasPrice),
      message.gasLimit,
      message.gasLimit,
      result.gasRefund || new BN(0),
      returnDataHash,
      message.data
    );
    witness.state_access_list = [];
    if (result.exceptionError) {
      const { error } = result.exceptionError;
      switch(error) {
        case ERROR.STOP:
          witness.status = Status.success;
          break;
        case ERROR.REVERT:
          witness.status = Status.revert;
          break;
        default:
          witness.status = Status.exception;
          break;
      }
    } else witness.status = Status.success;
    result.witnesses = [ witness ];
  }
  console.log(`Executed Exit Call`)
  console.log(`Gas Limit: ${message.gasLimit}`)
  if (this._produceWitness) {
    console.log(`Witness Gas Available: ${result.witnesses[0].gasAvailable}`)
    console.log(`Witness Gas Used: ${result.witnesses[0].gasUsed}`)
  }
  return {
    gasUsed: message.gasLimit,
    execResult: result,
  }
}

async function _executeExitCall(this: EVM, message: Message) {
  if (message.data.length < 4) throw new VmError(ERROR.INVALID_OPCODE);
  const tx = outgoingTransactionFromCallInputs(
    message.data,
    message.caller,
    message.value,
    message.gasLimit,
  );
  const relay = await this._state.getChildRelay(
    bufferToInt(this._block.header.number)
  );
  await relay.insert(toBuffer(tx.encode()));
}