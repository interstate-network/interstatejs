import { toBuffer } from 'ethereumjs-util';
import BN from 'bn.js';
import { Status, MessageWitness } from '@interstatejs/vm';
import { SignedTransaction, outgoingTransactionFromCallInputs } from '@interstatejs/tx';
import { Block } from '@interstatejs/block';
import {
  toBn,
  StateTree,
  toHex,
  ChildRelay,
  getChildRelayAddressFromCommon,
  common
} from "@interstatejs/utils";
import WitnessAuditor from './WitnessAuditor';
import { isEqual, ProvableError } from './helpers';
import { Database } from '../../db';
import { bufferToInt } from 'ethereumjs-util';

export class SignedTransactionWitnessAuditor extends WitnessAuditor {
  /* constructor(
    public db: Database,
    public block: Block,
    public state: StateTree,
    public transaction: SignedTransaction,
    public transactionIndex: number,
  ) {
    super(db, block, state, transaction, transactionIndex);
    this.childRelayAddress = getChildRelayAddressFromCommon(common)
  } */

  constructor(
    public db: Database,
    public block: Block,
    public state: StateTree,
    public transaction: SignedTransaction,
    public transactionIndex: number,
    public witness: MessageWitness,
    public calculatedWitness: MessageWitness
  ) {
    super(db, block, state, transaction, transactionIndex, witness, calculatedWitness)
  }

  checkAll = async (): Promise<void> => {
    this.checkWitnessInputData();
    this.checkGasLimit();
    this.checkRefund();
    if (this.witness.status != Status.success) {
      this.state.checkpoint();
      await this.checkTransactionRootFailure();
      await this.state.revert();
    }
    // this.state.checkpoint();
    await this.checkInputRoot();
    if (isEqual(this.witness.to, this.childRelayAddress)) {
      await this.exitCallCheck();
    } else {
      await this.checkAccessList();
      this.checkOutputRoot();
    }
    // if (this.witness.status == Status.success) await this.state.commit();
    // else await this.state.revert();
    if (this.witness.status == Status.success) {
      console.log('auditing success root')
      console.log(`tx index - `, this.transactionIndex)
      await this.checkTransactionRootSuccess();
    }
  }

  exitCallCheck = async () => {
    console.log('doing exit call check')
    if (
      !this.witness.gasAvailable.eq(this.witness.gasUsed) ||
      !this.witness.refund.eqn(0)
    ) {
      this.fail({
        _type: 'EXIT_CALL_WITNESS_GAS',
        ...this.getWitnessProof()
      })
    }
    try {
      const tx = outgoingTransactionFromCallInputs(
        this.witness.calldata,
        toBuffer(this.witness.caller),
        this.witness.callvalue,
        this.witness.gasAvailable
      );
      const childRelay = await ChildRelay.create(
        this.state,
        this.childRelayAddress  ,
        bufferToInt(this.block.header.number)
      );
      const proof = await childRelay.getUpdateProof();
      await childRelay.insert(toBuffer(tx.encode()))
      if (!isEqual(this.state.root, this.witness.stateRootLeave)) {
        this.fail({
          _type: 'EXIT_CALL_WITNESS_EXIT_ROOT',
          ...this.getWitnessProof(),
          header: this.block.header.encodeJSON(),
          stateProofBytes: proof.accountProof,
          storageProofBytes: proof.storageProof,
          leafProofBytes: proof.transactionProof
        })
      }
      if (this.witness.status !== 1) this.fail({
        _type: 'EXIT_WITNESS_ENCODING_ERROR',
        ...this.getWitnessProof()
      })
    } catch (err) {
      // console.log('caught error!')
      // console.log(err)
      // If the call can not be decoded, it should have a failure status
      if (!(err instanceof ProvableError)) {
        if (this.witness.status == 1) this.fail({
          _type: 'EXIT_WITNESS_ENCODING_ERROR',
          ...this.getWitnessProof()
        })
      } else throw err;
    }
  }

  checkWitnessInputData() {
    const from = this.transaction.getSenderAddress();
    const to = this.transaction.to;
    const gasAvail = new BN(this.transaction.gasLimit).sub(this.transaction.getBaseFee());
    const comparisons = [
      [from, this.witness.caller],
      [from, this.witness.origin],
      [to, this.witness.to],
      [to, this.witness.context],
      [gasAvail, this.witness.gasAvailable],
      [this.transaction.gasPrice, this.witness.gasPrice],
      [this.transaction.value, this.witness.callvalue]
    ];
    const contextMatch = comparisons.reduce((allEq, arr) => allEq && isEqual(arr[0], arr[1]), true);
    if (!contextMatch) {
      this.fail({
        _type: 'WITNESS_CONTEXT',
        commitmentQuery: this.block.header.commitment.query,
        messageWitness: this.witness.encode(),
        header: this.block.header.encodeJSON(),
        ...this.getTransactionProof(),
      });
    }
  }

  async checkInputRoot() {
    const from = toHex(this.transaction.getSenderAddress());
    const callerProof = await this.state.getAccountProof(from);
    const caller = await this.state.getAccount(from);
    // update caller account
    const inputCost = this.transaction.getUpfrontCost()
    //  new BN(this.transaction.gasLimit).mul(new BN(this.transaction.gasPrice));
    // if (this.transaction.value) inputCost = inputCost.add(new BN(this.transaction.value));
    caller.balance = toBuffer(toBn(caller.balance).sub(inputCost));
    caller.nonce = toBuffer(toBn(caller.nonce).addn(1));
    await this.putAccount(from, caller);
    let receiverProof = '0x';
    // update receiver account
    const to = this.transaction.to;
    if (!to.equals(this.childRelayAddress)) {
      receiverProof = await this.getAccountProof(to);
      const receiver = await this.getAccount(to);
      receiver.balance = toBuffer(new BN(receiver.balance).add(new BN(this.transaction.value)));
      await this.state.putAccount(to, receiver);
    }
    if (!isEqual(this.state.root, this.witness.stateRootEnter)) {
      this.fail({
        _type: 'INPUT_STATE_ROOT',
        commitmentQuery: this.block.header.commitment.query,
        header: this.block.header.encodeJSON(),
        messageWitness: this.witness.encode(),
        previousRootProof: await this.getPreviousRootProof(),
        stateProof1: callerProof,
        stateProof2: receiverProof,
        ...this.getTransactionProof()
      });
    }
  }

  async checkTransactionRootFailure() {
    console.log('checking tx root failure')
    const { gasUsed, refund } = this.witness;
    let realGasUsed: BN;
    if (refund.gtn(0)) {
      if (refund.lt(gasUsed.divn(2))) {
        realGasUsed = gasUsed.sub(refund);
      } else {
        realGasUsed = gasUsed.sub(gasUsed.divn(2));
      }
    } else {
      realGasUsed = gasUsed;
    }
    realGasUsed = realGasUsed.add(this.transaction.getBaseFee())
    console.log(`Executing checkTransactionRootFailure`)
    console.log(`Gas Used Witness -- ${gasUsed}`)
    console.log(`Real Gas Used From Witness -- ${realGasUsed}`)
    const callerProof = await this.getAccountProof(this.witness.caller);
    const amountSpent = realGasUsed.mul(this.witness.gasPrice);
    const caller = await this.state.getAccount(this.witness.caller);
    caller.balance = toBuffer(toBn(caller.balance).sub(amountSpent));
    caller.nonce = toBuffer(toBn(caller.nonce).addn(1));
    await this.state.putAccount(this.witness.caller, caller);
    const operatorProof = await this.getAccountProof(this.block.header.coinbase);
    const operator = await this.state.getAccount(this.block.header.coinbase);
    operator.balance = toBuffer(toBn(operator.balance).add(amountSpent));
    await this.state.putAccount(this.block.header.coinbase, operator);
    if (!isEqual(this.transaction.stateRoot, this.state.root)) {
      this.fail({
        _type: 'SIGNED_TX_STATE_ROOT_FAILURE',
        commitmentQuery: this.block.header.commitment.query,
        header: this.header,
        ...this.getTransactionProof(),
        previousRootProof: await this.getPreviousRootProof(),
        messageWitness: this.witness.encode(),
        callerProof,
        operatorProof
      })
    }
  }

  async checkTransactionRootSuccess() {
    let { gasUsed, refund } = this.witness;
    gasUsed = gasUsed.add(this.transaction.getBaseFee())
    let realGasUsed: BN;
    if (refund.gtn(0)) {
      if (refund.lt(gasUsed.divn(2))) {
        realGasUsed = gasUsed.sub(refund);
      } else {
        realGasUsed = gasUsed.sub(gasUsed.divn(2));
      }
    } else {
      realGasUsed = gasUsed;
    }
    const callerProof = await this.getAccountProof(this.witness.caller);
    const amountSpent = realGasUsed.mul(this.witness.gasPrice);
    const caller = await this.state.getAccount(this.witness.caller);
    const finalCallerBalance = new BN(this.transaction.gasLimit)
      .sub(realGasUsed)
      .mul(this.witness.gasPrice)
      .add(new BN(caller.balance));
    caller.balance = toBuffer(finalCallerBalance);
    await this.state.putAccount(this.witness.caller, caller);
    const operatorProof = await this.getAccountProof(this.block.header.coinbase);
    const coinbase = await this.state.getAccount(this.block.header.coinbase);
    coinbase.balance = toBuffer(toBn(coinbase.balance).add(amountSpent));
    await this.state.putAccount(this.header.coinbase, coinbase);
    console.log(`tx root - `, this.transaction.stateRoot.toString('hex'))
    console.log(`calc root - `, this.state.root.toString('hex'))
    if (!isEqual(this.state.root, this.transaction.stateRoot)) {
      this.fail({
        _type: 'SIGNED_TX_STATE_ROOT_SUCCESS',
        header: this.header,
        commitmentQuery: this.block.header.commitment.query,
        ...this.getTransactionProof(),
        messageWitness: this.witness.encode(),
        callerProof,
        operatorProof,
      });
    }
  }
}

export default SignedTransactionWitnessAuditor;