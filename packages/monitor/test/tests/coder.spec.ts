import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';
import { expect } from 'chai';
import { toBuffer, rlp, BN } from 'ethereumjs-util';
import { SignedTransaction, Transaction } from '@interstatejs/tx';
import { ChainPegTransactionReceipt } from '@interstatejs/contracts';
import {
  ExtCodeSizeWitness, ExtCodeHashWitness,
  ExtCodeCopyWitness, SloadWitness,
  SstoreWitness, TimestampWitness,
  NumberWitness, CoinbaseWitness,
  BalanceWitness, SelfBalanceWitness,
  ChainidWitness
} from '@interstatejs/vm';
const ABI = require('web3-eth-abi');
import { Block } from '@interstatejs/block';
import {
  randomHexBuffer, getMerkleRoot, randomHexString, toHex,
  toBuf, sliceBuffer, BufferLike, toBn, last
} from '@interstatejs/utils';

import { ParentContext } from '../../src/lib/parent-context';
import { ParentListener } from '../../src/parent-listeners';
import { BlockBuilder, TestAuditor, setup } from '../utils';
import { convertHeaderForWeb3x } from '../../src/lib/web3x-adapters';
import { ChallengeRequiredError } from '../../src/auditor/proof-types';
import { getVMForTransaction } from '../../src/challenge-monitor';
import { Database } from '../../src/db';
import { decodeBlockInput } from '../../src/auditor/coder';


describe('Auditor: Block Decoder', () => {
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

  it('Decodes a block', async () => {
    const block = blockBuilder.getDefaultBlock();
    block.header.toCommitment({ submittedAt: 20, childIndex: 1 });
    const calldata = context.peg.methods.submitBlock({
      header: convertHeaderForWeb3x(block.header.encodeJSON()),
      transactions: block.transactions.map(t => toHex(t.toRollup()))
    }).encodeABI();
    const { header, transactionsInput } = decodeBlockInput(calldata, 20, 1);
    expect(header.hash().toString('hex')).to.eq(block.header.hash().toString('hex'));
    for (let i = 0; i < block.transactions.length; i++) {
      const tx = block.transactions[i];
      expect(toHex(tx.toRollup())).to.eq(transactionsInput[i]);
    }
  })

  // it('Catches a bad extcodesize operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeExtCodeSize()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as ExtCodeSizeWitness)).size = toBn(5);
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('EXTCODESIZE');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // it('Catches a bad extcodehash operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeExtCodeHash()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as ExtCodeHashWitness)).hash = toBn(5);
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('EXTCODEHASH');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // it('Catches a bad extcodecopy operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeExtCodeCopy()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as ExtCodeCopyWitness)).exists = false;
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('EXTCODECOPY');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // it('Catches a bad sload operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeSload()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as SloadWitness)).value = toBn(100);
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('SLOAD');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // // it('Catches a bad sstore operation', async () => {
  // //   const header = blockBuilder.getBlock1Header();
  // //   const address = await blockBuilder.deployTestContract();
  // //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  // //   const fnSig = ABI.encodeFunctionSignature('executeSload()')
  // //   const transaction = new SignedTransaction({
  // //     to: address.toString(),
  // //     gasLimit: 100000,
  // //     gasPrice: 2,
  // //     nonce: 0,
  // //     data: fnSig
  // //   });
  // //   transaction.sign(blockBuilder.signerKey);
  // //   const block = new Block({ header, transactions });
  // //   await blockBuilder.executeBlock(block);
  // //   transaction.stateRoot = randomHexBuffer(32);
  // //   block.transactions.push(transaction);
  // //   const txIndex = block.transactions.length - 1;
  // //   block.setOutputs();
  // //   await submitBlock(block);
  // //   const challengeReceipt = await auditor.challengeReceipt();
  // //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  // //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  // //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  // //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  // //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  // //   const {
  // //     execResult: { witnesses: [witness] }
  // //   } = await vm.runTx({ block, tx: transaction });
  // //   ((witness.state_access_list[1] as SstoreWitness)).stateRootLeave = toBn(100);
  // //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  // //   expect(await provableErrorEvent()).to.eq('SSTORE');
  // //   const receipt = await errorProofReceipt();
  // //   expect(receipt.events.BlockReverted).to.not.be.null;
  // //   expect(receipt.events.BlockReverted.length).to.eq(1);
  // //   const revertData = receipt.events.BlockReverted[0];
  // //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // // });

  // it('Catches a bad timestamp operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeTimestamp()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as TimestampWitness)).timestamp = toBn(100);
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('TIMESTAMP');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // it('Catches a bad number operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeNumber()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as NumberWitness)).number = toBn(100);
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('NUMBER');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // it('Catches a bad coinbase operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeCoinbase()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as CoinbaseWitness)).coinbase = toBn(toBuffer(`0x${'bb'.repeat(20)}`));
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('COINBASE');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // it('Catches a bad balance operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeBalance()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as BalanceWitness)).balance = toBn(toBuffer(5));
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('BALANCE');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // it('Catches a bad selfbalance operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeSelfBalance()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as SelfBalanceWitness)).selfBalance = toBn(toBuffer(5));
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('SELFBALANCE');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });

  // it('Catches a bad chainid operation', async () => {
  //   const header = blockBuilder.getBlock1Header();
  //   const address = await blockBuilder.deployTestContract();
  //   const transactions: Transaction[] = await blockBuilder.getTransactions();
  //   const fnSig = ABI.encodeFunctionSignature('executeChainId()')
  //   const transaction = new SignedTransaction({
  //     to: address.toString(),
  //     gasLimit: 100000,
  //     gasPrice: 2,
  //     nonce: 0,
  //     data: fnSig
  //   });
  //   transaction.sign(blockBuilder.signerKey);
  //   const block = new Block({ header, transactions });
  //   await blockBuilder.executeBlock(block);
  //   console.log('executed block')
  //   transaction.stateRoot = randomHexBuffer(32);
  //   block.transactions.push(transaction);
  //   const txIndex = block.transactions.length - 1;
  //   block.setOutputs();
  //   await submitBlock(block);
  //   const challengeReceipt = await auditor.challengeReceipt();
  //   expect(challengeReceipt.events.BlockChallenge).to.not.be.null;
  //   expect(challengeReceipt.events.BlockChallenge.length).to.eq(1);
  //   expect(challengeReceipt.events.BlockChallenge[0].returnValues.blockHash).to.eq(toHex(block.hash()));
  //   expect(+(challengeReceipt.events.BlockChallenge[0].returnValues.transactionIndex)).to.eq(txIndex);
  //   const vm = await getVMForTransaction(auditor.db, block, txIndex);
  //   const {
  //     execResult: { witnesses: [witness] }
  //   } = await vm.runTx({ block, tx: transaction });
  //   ((witness.state_access_list[0] as ChainidWitness)).chainId = toBn(toBuffer(5));
  //   await respondToChallenge(block.hash(), txIndex, witness.encode());
  //   expect(await provableErrorEvent()).to.eq('CHAINID');
  //   const receipt = await errorProofReceipt();
  //   expect(receipt.events.BlockReverted).to.not.be.null;
  //   expect(receipt.events.BlockReverted.length).to.eq(1);
  //   const revertData = receipt.events.BlockReverted[0];
  //   expect(revertData.returnValues.blockHash).to.eq(toHex(block.hash()));
  // });
});