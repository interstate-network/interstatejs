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
  toBuf, sliceBuffer, BufferLike, toBn, last, getChildRelayAddressFromCommon
} from '@interstatejs/utils';

import { ParentContext } from '../../../src/lib/parent-context';
import { ParentListener } from '../../../src/parent-listeners';
import { BlockBuilder, TestAuditor, setup } from '../../utils';
import { convertHeaderForWeb3x } from '../../../src/lib/web3x-adapters';
import { ChallengeRequiredError } from '../../../src/auditor/proof-types';
import { getVMForTransaction } from '../../../src/challenge-monitor';
import { Database } from '../../../src/db';


describe('Auditor: Encoding Errors', () => {
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
    }).send({ from, value: '0x2386f26fc10000' }).getReceipt();
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
  it('Catches a block with a badly encoded incoming transaction', async () => {
    const block = blockBuilder.getDefaultBlock();
    const transactions = block.transactions.map(tx => tx.toRollup());
    transactions[0] = sliceBuffer(transactions[0], 0, 30);
    block.header.transactionsRoot = getMerkleRoot(transactions);
    await context.peg.methods.submitBlock({
      header: convertHeaderForWeb3x(block.header.encodeJSON()),
      transactions: transactions.map(t => toHex(t))
    }).send({ from, value: '0x2386f26fc10000' }).getReceipt();
    expect(await provableErrorEvent()).to.eq('INCOMING_TX_ENCODING');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a block with a badly encoded signed transaction', async () => {
    const block = blockBuilder.getDefaultBlock();
    const tx = new SignedTransaction({
      to: randomHexBuffer(20),
      gasLimit: 30000,
      gasPrice: 50,
      nonce: 0
    });
    tx.sign(randomHexBuffer(32));
    tx.stateRoot = randomHexBuffer(32);
    const transactions = [
      ...block.transactions.map(tx => tx.toRollup()),
      sliceBuffer(tx.toRollup(), 0, 32)
    ];
    block.header.transactionsRoot = getMerkleRoot(transactions);
    block.header.transactionsCount = toBuffer(transactions.length);
    block.header.stateRoot = last(transactions);
    await context.peg.methods.submitBlock({
      header: convertHeaderForWeb3x(block.header.encodeJSON()),
      transactions: transactions.map(t => toHex(t))
    }).send({ from, value: '0x2386f26fc10000' }).getReceipt();
    expect(await provableErrorEvent()).to.eq('SIGNED_TX_ENCODING');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a block with a bad transaction signature', async () => {
    const block = blockBuilder.getDefaultBlock();
    const tx = new SignedTransaction({
      to: randomHexBuffer(20),
      gasLimit: 30000,
      gasPrice: 50,
      nonce: 0
    });
    tx.sign(randomHexBuffer(32));
    tx.stateRoot = randomHexBuffer(32);
    const txBuf = Buffer.concat([
      rlp.encode([
        ...tx.raw.slice(0, 6),
        toBuffer(100),
        tx.raw[7],
        tx.raw[8]
      ]),
      tx.stateRoot
    ]);
    block.header.transactionsCount = toBuffer(toBn(block.header.transactionsCount).addn(1));
    block.header.stateRoot = tx.stateRoot;
    const txLeaves = [
      ...block.transactions.map(t => t.toRollup()),
      txBuf
    ];
    block.header.transactionsRoot = getMerkleRoot(txLeaves);
    await context.peg.methods.submitBlock({
      header: convertHeaderForWeb3x(block.header.encodeJSON()),
      transactions: txLeaves.map(toHex)
    }).send({ from, value: '0x2386f26fc10000' }).getReceipt();
    // await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('TX_SIGNATURE');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
    const relayAddr = getChildRelayAddressFromCommon();
  });
});