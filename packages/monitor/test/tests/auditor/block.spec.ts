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


describe('Auditor: Block Errors', () => {
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
  function gotBlock(): Promise<Block> {
    return new Promise((resolve) => {
      auditor.once('got-block', block => resolve(block))
    });
  }

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

  it('Approves a block with no errors', async () => {
    const block = blockBuilder.getDefaultBlock();
    await submitBlock(block);
    const _block = await blockOK();
    expect(_block.hash().toString('hex')).to.eq(block.hash().toString('hex'))
  });

  it('Catches a block with an out of range incoming transaction', async () => {
    const block = blockBuilder.getDefaultBlock();
    block.header.incomingTransactionsCount = toBuffer(toBn(block.header.incomingTransactionsCount).addn(1))
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('INCOMING_TRANSACTIONS_OUT_OF_RANGE');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a block with a bad incoming transaction index', async () => {
    const block = blockBuilder.getDefaultBlock();
    block.header.incomingTransactionsIndex = toBuf(1);
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('INCOMING_TRANSACTIONS_INDEX');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a block with a bad state root', async () => {
    const block = blockBuilder.getDefaultBlock();
    block.header.stateRoot = randomHexBuffer(32);
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('BLOCK_STATE_ROOT');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a block with a bad height', async () => {
    const block = blockBuilder.getDefaultBlock();
    block.header.number = toBuffer(2);
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('BLOCK_NUMBER');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });

  it('Catches a block with a bad timestamp', async () => {
    const block = blockBuilder.getDefaultBlock();
    block.header.timestamp = toBuffer(0);
    await submitBlock(block);
    expect(await provableErrorEvent()).to.eq('BLOCK_TIMESTAMP');
    const receipt = await errorProofReceipt();
    expect(receipt.events.BlockReverted).to.not.be.null;
    expect(receipt.events.BlockReverted.length).to.eq(1);
    const revertData = receipt.events.BlockReverted[0];
    expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  });
});