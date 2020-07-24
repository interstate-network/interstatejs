import { Block } from "@interstatejs/block";
import { BufferLike, StateTree, toBn, copyBuffer, ChildRelay, getChildRelayAddressFromCommon, common } from "@interstatejs/utils";
import { IncomingTransaction, Transaction, SignedTransaction } from "@interstatejs/tx";
import VM from "@interstatejs/vm";
import BN from 'bn.js'
import { toBuffer } from "ethereumjs-util";
import { isEqual, emptyCodeHash, ProvableError } from "./witness-auditors/helpers";
import {
  ErrorProof,
  TransactionInclusionProof,
  HeaderCommitment,
  BasicTransactionStateProof,
  ChallengeRequiredError
} from "./proof-types";
import { encodePreviousRootProof } from "./coder";
import { subtractBalanceAndIncrementNonce, increaseBalance } from "./execution-proof-helpers";
import { Database } from "../db";
import { bufferToInt } from "ethereumjs-util";

// interface IBlockchain {
//   getBlock(parentHash: BufferLike): Promise<Block>;
//   getStateTree(stateRoot: BufferLike): Promise<SparseMerkleTree>;
// }

export class ExecutionAuditor {
  private state: StateTree;

  constructor(
    private block: Block,
    private blockchain: Database,
    private vm: VM
  ) {}

  fail(error: ErrorProof) {
    throw new ProvableError(error);
  }

  getTransactionProof = (transactionIndex: number): TransactionInclusionProof => {
    const transaction = this.block.transactions[transactionIndex].toRollup();
    const siblings = this.block.proveTransaction(transactionIndex);
    return { transaction, siblings, transactionIndex };
  }

  getHeaderCommitment = (): HeaderCommitment => ({
    commitmentQuery: this.block.header.commitment.query,
    header: this.block.header.encodeJSON()
  });

  async getPreviousRootProof(transactionIndex: number): Promise<BufferLike> {
    if (transactionIndex == 0) {
      const parent = await this.blockchain.getBlock(this.block.header.parentHash);
      return encodePreviousRootProof(parent.header);
    }
    const transaction = this.block.transactions[transactionIndex - 1].toRollup();
    const siblings = this.block.proveTransaction(transactionIndex - 1);
    return encodePreviousRootProof({ transaction, siblings });
  }

  async getBasicTransactionStateProof(
    transactionIndex: number,
    stateProof: BufferLike
  ): Promise<BasicTransactionStateProof> {
    return {
      previousRootProof: await this.getPreviousRootProof(transactionIndex),
      ...this.getTransactionProof(transactionIndex),
      ...this.getHeaderCommitment(),
      stateProof
    };
  }

  static async auditExecution(
    block: Block,
    blockchain: Database
  ): Promise<void> {
    // console.log('making tree for auditor')
    const parent = await blockchain.getBlock(block.header.parentHash);
    const state = await blockchain.getStateTree(parent.header.stateRoot);
    console.log('PARENT STATE -- ', parent.header.stateRoot)
    // console.log('STATE ROOT -- ', state.rootHash)
    const vm = await VM.create({ state });
    const auditor = new ExecutionAuditor(block, blockchain, vm);
    await auditor.auditTransactions();
    await auditor.auditExitRoot();
  }

  async catchFirstPassError(index: number) {
    const transaction = this.block.transactions[index];
    this.state = this.vm.stateManager._tree
    // new StateTree(this.vm.stateManager._tree);
    if (await this.hasSimpleProvableError(transaction)) {
      if (transaction.isIncoming) {
        await this.auditIncomingTransaction(<IncomingTransaction> transaction, index);
      } else {
        await this.auditSignedTransaction(<SignedTransaction> transaction, index);
      }
    } else {
      throw new ChallengeRequiredError(
        {
          ...this.getHeaderCommitment(),
          transactionIndex: index
        },
        this.block
      );
    }
  }

  async auditExitRoot() {
    const state = this.vm.stateManager._tree;
    const childRelay = await ChildRelay.create(
      state,
      getChildRelayAddressFromCommon(common),
      bufferToInt(this.block.header.number)
    );
    if (!this.block.header.exitsRoot.equals(childRelay.root)) {
      const proof = await childRelay.getRootProof();
      this.fail({
        _type: 'BLOCK_EXIT_ROOT',
        ...this.getHeaderCommitment(),
        accountProof: proof.accountProof,
        storageProof: proof.storageProof
      })
    }
  }

  /**
   * Checks if the error in a transaction can be proven without a challenge.
   */
  async hasSimpleProvableError(transaction: Transaction): Promise<boolean> {
    if (isEqual(transaction.to, new BN(0))) return true;
    const caller = await this.state.getAccount(transaction.getSenderAddress());
    const receiver = await this.state.getAccount(transaction.to);
    if (isEqual(receiver.codeHash, emptyCodeHash)) return true;
    if (!transaction.isIncoming) {
      if (!isEqual(transaction.nonce, caller.nonce)) return true;
      if (toBn(transaction.getUpfrontCost()).gt(toBn(caller.balance))) return true;
      if (toBn(transaction.getBaseFee()).gt(toBn(transaction.gasLimit))) return true;
    }
    return false;
  }

  async auditTransaction(transaction: Transaction): Promise<boolean> {
    await this.vm.stateManager.checkpoint();
    const stateRoot = copyBuffer(transaction.stateRoot);
    try {
      await this.vm.runTx({ tx: transaction, block: this.block });
      if (!transaction.stateRoot.equals(stateRoot)) {
        transaction.stateRoot = stateRoot;
        await this.vm.stateManager.revert();
        return false;
      }
    } catch(err) {
      console.log('Caught error executing transaction')
      console.log(err);
      transaction.stateRoot = stateRoot;
      await this.vm.stateManager.revert();
      return false;
    }
    await this.vm.stateManager.commit();
    return true;
  }

  async auditTransactions() {
    const { transactions } = this.block;
    let i = 0;
    let foundError = false;
    console.log(`Auditing transactions`)
    for (; i < transactions.length; i++) {
      const tx = transactions[i];
      if (i == 4) console.log('got 4th tx root - ', tx.stateRoot.toString('hex'))
      const result = await this.auditTransaction(tx);
      if (!result) {
        foundError = true;
        break;
      }
    }
    if (foundError) await this.catchFirstPassError(i);
  }

  async auditIncomingTransaction(
    transaction: IncomingTransaction,
    index: number
  ): Promise<void> {
    let accountProof: string;
    if (!transaction.to || !transaction.to.length) {
      accountProof = await this.state.getAccountProof(transaction.getSenderAddress())
      await this.state.putAccountCode(
        transaction.getSenderAddress(),
        transaction.data
      );
    } else {
      accountProof = await this.state.getAccountProof(transaction.to);
      const account = await this.state.getAccount(transaction.to);
      if (!isEqual(account.codeHash, emptyCodeHash)) {
        throw new Error('Not a simple transaction - targets a contract.');
      }
      const value = toBn(transaction.value);
      account.balance = toBuffer(new BN(account.balance).add(value));
      await this.state.putAccount(transaction.to, account);
    }
    if (!isEqual(transaction.stateRoot, this.state.root)) {
      this.fail({
        _type: 'SIMPLE_INCOMING_TX',
        ...this.getTransactionProof(index),
        transaction,
        ...this.getHeaderCommitment(),
        previousRootProof: await this.getPreviousRootProof(index),
        receiverProof: accountProof
      });
    }
  }

  async auditSignedTransaction(transaction: SignedTransaction, index: number) {
    const caller = transaction.getSenderAddress();
    const account = await this.state.getAccount(caller);
    if (toBn(transaction.getBaseFee()).gt(toBn(transaction.gasLimit))) {
      this.fail({
        _type: 'INSUFFICIENT_GAS',
        ...(this.getHeaderCommitment()),
        ...this.getTransactionProof(index)
      })
    }

    if (!isEqual(transaction.nonce, account.nonce)) {
      console.log(`Expected nonce ${toBn(account.nonce).toNumber()}`)
      console.log(`Got nonce ${toBn(transaction.nonce).toNumber()}`)
      const accountProof = await this.state.getAccountProof(caller);
      this.fail({
        ...(await this.getBasicTransactionStateProof(index, accountProof)),
        _type: 'INVALID_NONCE'
      });
    }
    const baseGasFee = toBn(transaction.gasLimit)
      .mul(toBn(transaction.gasPrice))
      .add(toBn(transaction.value));
    if (toBn(account.balance).lt(baseGasFee)) {
      const accountProof = await this.state.getAccountProof(caller);
      this.fail({
        ...(await this.getBasicTransactionStateProof(index, accountProof)),
        _type: 'INSUFFICIENT_BALANCE'
      });
    }
    
    const value = toBn(transaction.value);
    const gasFee = toBn(transaction.gasPrice).muln(21000);
    const reduceBalance = toBn(value).add(gasFee)

    const proof1 = await subtractBalanceAndIncrementNonce(this.state, caller, reduceBalance);
    const proof2 = await increaseBalance(this.state, transaction.to, value);
    const proof3 = await increaseBalance(this.state, this.block.header.coinbase, gasFee);
    this.fail({
      _type: 'SIMPLE_SIGNED_TX',
      ...(this.getHeaderCommitment()),
      ...this.getTransactionProof(index),
      previousRootProof: await this.getPreviousRootProof(index),
      callerProof: proof1.stateProof,
      receiverProof: proof2.stateProof,
      operatorProof: proof3.stateProof,
      // stateRoot1: proof1.stateRoot,
      // stateRoot2: proof2.stateRoot,
      // stateRoot3: proof3.stateRoot,
      // stateRoot4: bufferToHex(this.state.root),
      // callerAddress: bufferToHex(caller),
      // receiverAddress: bufferToHex(transaction.to),
      // operatorAddress: bufferToHex(this.block.header.coinbase),
      // value,
      // gasFee
    });
  }
}