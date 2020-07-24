import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';
import { expect } from 'chai';
import { toBuffer, rlp, BN } from 'ethereumjs-util';
import { SignedTransaction, Transaction } from '@interstatejs/tx';
import { ChainPegTransactionReceipt } from '@interstatejs/contracts';
import { ExtCodeSizeWitness } from '@interstatejs/vm';
const ABI = require('web3-eth-abi');
import { Block } from '@interstatejs/block';
import {
  randomHexBuffer, getMerkleRoot, randomHexString, toHex,
  toBuf, sliceBuffer, BufferLike, toBn, last
} from '@interstatejs/utils';

import { ParentContext } from '../../../src/lib/parent-context';
import { ParentListener } from '../../../src/parent-listeners';
import { BlockBuilder, TestAuditor, setup } from '../../utils';
import { convertHeaderForWeb3x } from '../../../src/lib/web3x-adapters';
import { ChallengeRequiredError } from '../../../src/auditor/proof-types';
import { getVMForTransaction } from '../../../src/challenge-monitor';
import { Database } from '../../../src/db';


describe('Auditor: Execution Errors', () => {
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
      .send({ from })
      .getReceipt();
  }

  it('Catches an invalid create transaction', async () => {
    const block = blockBuilder.getDefaultBlock();
    const tx = new SignedTransaction({
      to: toBuffer(`0x${'00'.repeat(20)}`),
      gasLimit: 30000,
      gasPrice: 50,
      nonce: 0
    });
    tx.sign(randomHexBuffer(32));
    tx.stateRoot = randomHexBuffer(32);
    block.transactions.push(tx);
    block.setOutputs();
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('INVALID_CREATE_TX');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a transaction that has an invalid nonce', async () => {
    const block = blockBuilder.getDefaultBlock();
    const tx = new SignedTransaction({
      to: randomHexBuffer(20),
      gasLimit: 30000,
      gasPrice: 50,
      nonce: 1
    });
    tx.sign(randomHexBuffer(32));
    tx.stateRoot = randomHexBuffer(32);
    block.transactions.push(tx);
    block.setTransactionsRoot();
    block.header.transactionsCount = toBuffer(block.transactions.length);
    block.header.stateRoot = tx.stateRoot;
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('INVALID_NONCE');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a transaction where the caller has an insufficient balance', async () => {
    const block = blockBuilder.getDefaultBlock();
    const tx = new SignedTransaction({
      to: randomHexBuffer(20),
      gasLimit: 30000,
      gasPrice: 50,
      nonce: 0
    });
    tx.sign(randomHexBuffer(32));
    tx.stateRoot = randomHexBuffer(32);
    block.transactions.push(tx);
    block.setTransactionsRoot();
    block.header.transactionsCount = toBuffer(block.transactions.length);
    block.header.stateRoot = tx.stateRoot;
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('INSUFFICIENT_BALANCE');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a transaction with insufficient gas', async () => {
    const block = blockBuilder.getDefaultBlock();
    const tx = new SignedTransaction({
      to: randomHexBuffer(20),
      gasLimit: 30000,
      gasPrice: 50,
      nonce: 0
    });
    tx.gasLimit = toBuf(tx.getBaseFee().subn(1));
    tx.sign(randomHexBuffer(32));
    tx.stateRoot = randomHexBuffer(32);
    block.transactions.push(tx);
    block.setTransactionsRoot();
    block.header.transactionsCount = toBuffer(block.transactions.length);
    block.header.stateRoot = tx.stateRoot;
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('INSUFFICIENT_GAS');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a badly executed deposit transaction', async () => {
    const block = blockBuilder.getDefaultBlock();
    block.transactions[1].stateRoot = randomHexBuffer(32);
    block.setOutputs();
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('SIMPLE_INCOMING_TX');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a badly executed deployment', async () => {
    await context.relay.methods.deployContract(context.archiveFactoryAddress).send({ from, gas: 5e6 }).getReceipt();
    const txs = await blockBuilder.getTransactions();
    // auditor.listener.incomingTransactionListener.getIncomingTransactions(0, 4);
    console.log(`txs length ${txs.length}`);
    const transaction = last(txs);
    transaction.stateRoot = randomHexBuffer(32);
    const block = blockBuilder.getDefaultBlock();
    const signedTransaction = block.transactions.pop();
    block.transactions.push(transaction);
    block.transactions.push(signedTransaction);
    block.setOutputs();
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('SIMPLE_INCOMING_TX');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a badly executed signed transaction', async () => {
    const block = blockBuilder.getDefaultBlock();
    const transaction = new SignedTransaction({
      to: toBuffer(accounts[2].toString()),
      gasLimit: 21000,
      gasPrice: 2,
      value: 500,
      nonce: 1
    });
    transaction.sign(blockBuilder.signerKey);
    transaction.stateRoot = randomHexBuffer(32);
    block.transactions.push(transaction);
    block.setOutputs()
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('SIMPLE_SIGNED_TX');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });
});