import { toBuffer } from 'ethereumjs-util';
import BN from 'bn.js';
import { IncomingTransaction } from '@interstatejs/tx';
import { Block } from '@interstatejs/block';
import { toBn, StateTree } from "@interstatejs/utils";
import { Status, MessageWitness } from '@interstatejs/vm';
import { WitnessInputRootError } from '../proof-types';
import WitnessAuditor from './WitnessAuditor';
import { Database } from '../../db';
import { isEqual } from './helpers';

export class IncomingTransactionWitnessAuditor extends WitnessAuditor {
  constructor(
    public db: Database,
    public block: Block,
    public state: StateTree,
    public transaction: IncomingTransaction,
    public transactionIndex: number,
    public witness: MessageWitness,
    public calculatedWitness: MessageWitness
  ) {
    super(db, block, state, transaction, transactionIndex, witness, calculatedWitness)
  }

  checkAll = async (): Promise<void> => {
    this.checkWitnessInputData();
    this.checkGasLimit();
    this.state.checkpoint();
    await this.checkInputRoot();
    await this.checkAccessList();
    this.checkOutputRoot();
    if (this.witness.status == Status.success) await this.state.commit();
    else await this.state.revert();
    this.checkRefund();
    if (this.witness.status == 1) {
      await this.checkTransactionRootSuccess();
    }
  }

  checkWitnessInputData() {
    const from = this.transaction.getSenderAddress();
    const to = this.transaction.to;
    const comparisons = [
      [from, this.witness.caller],
      [from, this.witness.origin],
      [to, this.witness.to],
      [to, this.witness.context],
      [this.transaction.gasLimit, this.witness.gasAvailable],
      [new BN(0), this.witness.gasPrice],
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
    const to = this.transaction.to;
    const receiverProof = await this.getAccountProof(to);
    const receiver = await this.getAccount(to);
    receiver.balance = toBuffer(new BN(receiver.balance).add(new BN(this.transaction.value)));
    await this.state.putAccount(to, receiver);
    if (!isEqual(this.state.root, this.witness.stateRootEnter)) {
      const error = {
        _type: 'INPUT_STATE_ROOT',
        messageWitness: this.witness.encode(),
        stateProof1: receiverProof,
        stateProof2: '0x',
        ...this.getTransactionProof()
      } as WitnessInputRootError;
      this.fail(error);
    }
  }

  async checkTransactionRootSuccess() {
    // let { gasUsed, refund } = this.witness;
    // gasUsed = gasUsed.add(this.transaction.getBaseFee())
    // let realGasUsed: BN;
    // if (refund.gtn(0)) {
    //   if (refund.lt(gasUsed.divn(2))) {
    //     realGasUsed = gasUsed.sub(refund);
    //   } else {
    //     realGasUsed = gasUsed.sub(gasUsed.divn(2));
    //   }
    // } else {
    //   realGasUsed = gasUsed;
    // }
    // const callerProof = await this.getAccountProof(this.witness.caller);
    // const amountSpent = realGasUsed.mul(this.witness.gasPrice);
    // const caller = await this.state.getAccount(this.witness.caller);
    // const finalCallerBalance = new BN(this.transaction.gasLimit)
    //   .sub(realGasUsed)
    //   .mul(this.witness.gasPrice)
    //   .add(new BN(caller.balance));
    // caller.balance = toBuffer(finalCallerBalance);
    // await this.state.putAccount(this.witness.caller, caller);
    // const coinbaseProof = await this.getAccountProof(this.block.header.coinbase);
    // const coinbase = await this.state.getAccount(this.block.header.coinbase);
    // coinbase.balance = toBuffer(toBn(coinbase.balance).add(amountSpent));
    // await this.state.putAccount(this.header.coinbase, coinbase);
    if (!isEqual(this.witness.stateRootLeave, this.transaction.stateRoot)) {
      this.fail({
        _type: 'INCOMING_TX_STATE_ROOT_SUCCESS',
        header: this.header,
        ...this.getWitnessProof(),
        ...this.getTransactionProof()
      });
    }
  }
}

export default IncomingTransactionWitnessAuditor;