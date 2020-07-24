import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';
import { expect } from 'chai';
import BN from 'bn.js'
import { toBuffer } from 'ethereumjs-util';
import { SignedTransaction, Transaction } from '@interstatejs/tx';
import { ChainPegTransactionReceipt } from '@interstatejs/contracts';
import { ExtCodeSizeWitness } from '@interstatejs/vm';
const ABI = require('web3-eth-abi');
import { Block } from '@interstatejs/block';
import {
  randomHexBuffer, getMerkleRoot, randomHexString, toHex,
  toBuf, sliceBuffer, BufferLike, toBn, last, getChildRelayAddressFromCommon
} from '@interstatejs/utils';

import { ParentContext } from '../../../src/lib/parent-context';
import { ParentListener } from '../../../src/parent-listeners';
import { BlockBuilder, TestAuditor, setup } from '../../utils';
import { convertHeaderForWeb3x } from '../../../src/lib/web3x-adapters';
import { ChallengeRequiredError } from '../../../src/auditor/proof-types';
import { getVMForTransaction } from '../../../src/challenge-monitor';
import { Database } from '../../../src/db';


describe('Auditor: Witness Errors', () => {
  let context: ParentContext;
  let eth: Eth;
  let accounts: Address[];
  let db: Database;
  let from: Address;
  let auditor: TestAuditor;
  let blockBuilder: BlockBuilder;
  let listener: ParentListener;

  before(async () => {
    ({
      accounts,
      from,
      db,
      listener,
      blockBuilder,
      auditor,
      context,
      eth
    } = await setup())
  });

  // function headerTestCase()

  const provableErrorEvent = () => auditor.provableErrorEvent();
  const errorProofReceipt = () => auditor.errorProofReceipt();
  const blockOK = () => auditor.blockOK();
  const transactionChallenge = () => auditor.transactionChallenge();

  async function submitBlock(block: Block): Promise<ChainPegTransactionReceipt> {
    const receipt = await context.peg.methods.submitBlock({
      header: convertHeaderForWeb3x(block.header.encodeJSON()),
      transactions: block.transactions.map(t => toHex(t.toRollup()))
    }).send({ from, value: '0x2386f26fc10000', gas: 5e6 }).getReceipt();
    block.header.toCommitment({
      submittedAt: receipt.blockNumber,
      childIndex: receipt.events.BlockSubmitted[0].returnValues.childIndex
    });
    await db.putBlock(block);
    return receipt;
  }

  async function challengeBlock(block: Block, transactionIndex: number): Promise<ChainPegTransactionReceipt> {
    const err = new ChallengeRequiredError(
      {
        commitmentQuery: block.header.commitment.query,
        header: block.header.encodeJSON(),
        transactionIndex
      },
      block
    );
    return auditor.challengeBlock(err);
  }

  function respondToChallenge(
    blockHash: BufferLike, transactionIndex: number, witness: string
  ): Promise<ChainPegTransactionReceipt> {
    const fn = context.challengeManager.methods.respondToChallenge(
      toHex(blockHash),
      transactionIndex,
      witness
    );
    const calldata = toHex(fn.encodeABI());
    return context.peg.methods
      .challengeStep(calldata)
      .send({ from, gas: 5e6 })
      .getReceipt();
  }

  it('Catches a badly encoded witness', async () => {
    // Not in the encoding test block because it adds a transaction to
    // the relay and breaks assumptions for previous tests.
    const block = blockBuilder.getDefaultBlock();
    await submitBlock(block);
    await challengeBlock(block, 3);
    await respondToChallenge(block.hash(), 3, randomHexString(60));
    expect(await provableErrorEvent()).to.eq('WITNESS_ENCODING');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a witness with invalid input data', async () => {
    const block = blockBuilder.getDefaultBlock();
    console.log(block)
    await submitBlock(block);
    let index = 0;
    for (; index < block.transactions.length; index++) {
      if (!block.transactions[index].isIncoming) break;
    }
    await challengeBlock(block, index);
    const vm = await getVMForTransaction(auditor.db, block, index);
    const {
      execResult: { witnesses: [witness] }
    } = await vm.runTx({ block, tx: block.transactions[index] });
    witness.origin = toBn(randomHexBuffer(20));
    await respondToChallenge(block.hash(), index, witness.encode());
    expect(await provableErrorEvent()).to.eq('WITNESS_CONTEXT');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a witness with excess gas usage', async () => {
    const block = blockBuilder.getDefaultBlock();
    await submitBlock(block);
    let index = 0;
    for (; index < block.transactions.length; index++) {
      if (!block.transactions[index].isIncoming) break;
    }
    await challengeBlock(block, index);
    const vm = await getVMForTransaction(auditor.db, block, index);
    const {
      execResult: { witnesses: [witness], exceptionError }
    } = await vm.runTx({ block, tx: block.transactions[index] });
    witness.gasUsed = witness.gasAvailable.addn(1);
    await respondToChallenge(block.hash(), index, witness.encode());
    expect(await provableErrorEvent()).to.eq('WITNESS_GAS_EXCEEDED_ERROR');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a witness with a bad entry root', async () => {
    const block = blockBuilder.getDefaultBlock();
    await submitBlock(block);
    let index = 0;
    for (; index < block.transactions.length; index++) {
      if (!block.transactions[index].isIncoming) break;
    }
    await challengeBlock(block, index);
    const vm = await getVMForTransaction(auditor.db, block, index);
    const {
      execResult: { witnesses: [witness] }
    } = await vm.runTx({ block, tx: block.transactions[index] });
    witness.stateRootEnter = toBn(randomHexBuffer(32))
    await respondToChallenge(block.hash(), index, witness.encode());
    expect(await provableErrorEvent()).to.eq('INPUT_STATE_ROOT');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a witness with an invalid gas refund', async () => {
    const block = blockBuilder.getDefaultBlock();
    await submitBlock(block);
    let index = 0;
    for (; index < block.transactions.length; index++) {
      if (!block.transactions[index].isIncoming) break;
    }
    await challengeBlock(block, index);
    const vm = await getVMForTransaction(auditor.db, block, index);
    const {
      execResult: { witnesses: [witness] }
    } = await vm.runTx({ block, tx: block.transactions[index] });
    witness.refund = toBn(500)
    await respondToChallenge(block.hash(), index, witness.encode());
    expect(await provableErrorEvent()).to.eq('WITNESS_REFUND');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a bad root for a successful signed transaction', async () => {
    const header = blockBuilder.getBlock1Header();
    const address = await blockBuilder.deployTestContract();
    const transactions: Transaction[] = await blockBuilder.getTransactions();
    const fnSig = ABI.encodeFunctionSignature('executeSload()')
    const transaction = new SignedTransaction({
      to: address.toString(),
      gasLimit: 100000,
      gasPrice: 2,
      nonce: 0,
      data: fnSig
    });
    transaction.sign(blockBuilder.signerKey);
    const block = new Block({ header, transactions });
    await blockBuilder.executeBlock(block);
    transaction.stateRoot = randomHexBuffer(32);
    block.transactions.push(transaction);
    const txIndex = block.transactions.length - 1;
    block.setOutputs();
    await submitBlock(block);
    const challengeReceipt = await auditor.challengeReceipt();
    expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
    expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
    expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
    expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
    const vm = await getVMForTransaction(auditor.db, block, txIndex);
    const {
      execResult: { witnesses: [witness] }
    } = await vm.runTx({ block, tx: transaction });
    await respondToChallenge(block.hash(), txIndex, witness.encode());
    expect(await provableErrorEvent()).to.eq('SIGNED_TX_STATE_ROOT_SUCCESS');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a bad root for a failed signed transaction', async () => {
    const header = blockBuilder.getBlock1Header();
    const address = await blockBuilder.deployTestContract();
    const transactions: Transaction[] = await blockBuilder.getTransactions();
    const fnSig = ABI.encodeFunctionSignature('executeSload()')
    const transaction = new SignedTransaction({
      to: address.toString(),
      gasLimit: 100000,
      gasPrice: 2,
      nonce: 0,
      data: fnSig
    });
    transaction.sign(blockBuilder.signerKey);
    const block = new Block({ header, transactions });
    await blockBuilder.executeBlock(block);
    transaction.stateRoot = randomHexBuffer(32);
    block.transactions.push(transaction);
    const txIndex = block.transactions.length - 1;
    block.setOutputs();
    await submitBlock(block);
    const challengeReceipt = await auditor.challengeReceipt();
    expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
    expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
    expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
    expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
    const vm = await getVMForTransaction(auditor.db, block, txIndex);
    const {
      execResult: { witnesses: [witness] }
    } = await vm.runTx({ block, tx: transaction });
    witness.status = 0;
    await respondToChallenge(block.hash(), txIndex, witness.encode());
    expect(await provableErrorEvent()).to.eq('SIGNED_TX_STATE_ROOT_FAILURE');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches an exit transaction witness with a bad state root', async () => {
    const header = blockBuilder.getBlock1Header();
    const address = getChildRelayAddressFromCommon();
    const transactions: Transaction[] = await blockBuilder.getTransactions();
    const data = ABI.encodeFunctionSignature('withdraw()')
    const transaction = new SignedTransaction({
      to: address,
      gasLimit: 500000,
      gasPrice: 2,
      nonce: 0,
      data: toBuffer(data)
    });
    transaction.sign(blockBuilder.signerKey);
    const block = new Block({ header, transactions });
    await blockBuilder.executeBlock(block);
    transaction.stateRoot = randomHexBuffer(32);
    block.transactions.push(transaction);
    const txIndex = block.transactions.length - 1;
    block.setOutputs();
    await submitBlock(block);
    const challengeReceipt = await auditor.challengeReceipt();
    expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
    expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
    expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
    expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
    const vm = await getVMForTransaction(auditor.db, block, txIndex);
    const { execResult } = await vm.runTx({ block, tx: transaction });
    const { witnesses: [witness] } = execResult;
    witness.stateRootLeave = new BN(randomHexBuffer(32));
    await respondToChallenge(block.hash(), txIndex, witness.encode());
    expect(await provableErrorEvent()).to.eq('EXIT_CALL_WITNESS_EXIT_ROOT');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches an exit transaction witness with a bad gas value', async () => {
    const header = blockBuilder.getBlock1Header();
    const address = getChildRelayAddressFromCommon();
    const transactions: Transaction[] = await blockBuilder.getTransactions();
    const data = ABI.encodeFunctionSignature('withdraw()')
    const transaction = new SignedTransaction({
      to: address,
      gasLimit: 500000,
      gasPrice: 2,
      nonce: 0,
      data: toBuffer(data)
    });
    transaction.sign(blockBuilder.signerKey);
    const block = new Block({ header, transactions });
    await blockBuilder.executeBlock(block);
    transaction.stateRoot = randomHexBuffer(32);
    block.transactions.push(transaction);
    const txIndex = block.transactions.length - 1;
    block.setOutputs();
    await submitBlock(block);
    const challengeReceipt = await auditor.challengeReceipt();
    expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
    expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
    expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
    expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
    const vm = await getVMForTransaction(auditor.db, block, txIndex);
    const { execResult } = await vm.runTx({ block, tx: transaction });
    const { witnesses: [witness] } = execResult;
    witness.gasUsed = new BN(50);
    await respondToChallenge(block.hash(), txIndex, witness.encode());
    expect(await provableErrorEvent()).to.eq('EXIT_CALL_WITNESS_GAS');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });
});