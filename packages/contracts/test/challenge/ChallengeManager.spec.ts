import { Block } from '@interstatejs/block';
import { bufferToHex, toBuffer } from 'ethereumjs-util';
const Trie = require('merkle-patricia-tree/secure');
import { IncomingTransaction, SignedTransaction } from '@interstatejs/tx';
import { getMerkleRoot, randomHexString } from '@interstatejs/utils';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Faker, defaultKey } from '../../test-utils/faker';
import VM from '@interstatejs/vm';

const { expect } = chai;

describe('Block Submission', async () => {
  let faker: Faker;
  let block: Block;
  let receipt: any;
  let witness: any;

  before(async () => {
    faker = new Faker();
    await faker.init();
    block = await faker.deployAndExecute();
  });

  it('Should have confirmed the genesis block', async () => {
    const blockHash = await faker.peg.methods.getConfirmedBlockhash(0).call();
    const block = new Block();
    block.setGenesisParams();
    expect(bufferToHex(block.header.hash())).to.eq(blockHash);
  });

  it('Should submit a block', async () => {
    const transactions = block.transactions.map(tx => tx.toRollup());
    const transactionsRoot = getMerkleRoot(transactions);
    block.header.coinbase = toBuffer(faker.from);
    block.header.transactionsRoot = transactionsRoot;
    block.header.transactionsCount = toBuffer(2);
    block.header.incomingTransactionsCount = toBuffer(1);
    block.header.number = toBuffer(1);
    const header = block.header;
    // header.coinbase = toBuffer(faker.from);
    // header.transactionsRoot = transactionsRoot;
    const receipt0 = await faker.peg.methods.submitBlock({
      header: {
        ...header,
        coinbase: bufferToHex(header.coinbase),
      },
      transactions
    }).send({
      from: faker.from,
      value: 1e16,
      gas: 5e6
    });
    block.header.toCommitment({ childIndex: 0, submittedAt: receipt0.blockNumber });
  });

  it('Should fail to challenge a block with an insufficient bond', async () => {
    const query = block.header.commitment.query;
    // query.commitment.coinbase = bufferToHex(<Buffer> query.commitment.coinbase);
    const challengeData = faker.challengeManager.methods.challengeTransaction(
      query,
      {
        ...block.header,
        coinbase: bufferToHex(block.header.coinbase)
      },
      0
    ).encodeABI();
    expect(
      faker.peg.methods.challengeStep(challengeData).send({ from: faker.from })
    ).to.eventually.be.rejectedWith('revert Insufficient value received.');
  });

  it('Should challenge a block', async () => {
    const query = block.header.commitment.query;
    // query.commitment.coinbase = query.commitment.coinbase;
    const challengeData = faker.challengeManager.methods.challengeTransaction(
      query,
      {
        ...block.header,
        coinbase: bufferToHex(block.header.coinbase)
      },
      0
    ).encodeABI();
    receipt = await faker.peg.methods.challengeStep(challengeData).send({
      from: faker.from,
      value: 1e18,
      gas: 5e6
    });
  });

  it('Should emit a BlockChallenge event', () => {
    expect(receipt.events.BlockChallenge).to.not.be.null;
    const _event = receipt.events.BlockChallenge.returnValues;
    expect(_event.blockHash).to.eq(bufferToHex(block.hash()));
  });

  it('Should have a pending challenge', async () => {
    const isPending = await faker.peg.methods.hasPendingChallenge(block.hash()).call();
    expect(isPending).to.be.true;
  });

  it('Should fail to respond to a challenge from the wrong address', async () => {
    const deployTx = new IncomingTransaction({
      from: block.transactions[0].getSenderAddress(),
      data: '0x6020600055',
    });
    const vm = new VM({ state: new Trie(), produceWitness: true });
    await vm.runTx({ tx: deployTx });
    const tx = new SignedTransaction({
      to: deployTx.getSenderAddress(),
      gasLimit: 5e4,
    });
    tx.sign(defaultKey);
    const { execResult: { witnesses } } = await vm.runTx({
      tx,
      skipNonce: true,
      skipBalance: true
    });
    const data = faker.challengeManager.methods.respondToChallenge(
      block.hash(),
      0,
      witnesses[0].encode()
    ).encodeABI();
    expect(
      faker.peg.methods.challengeStep(data).send({ from: faker.accounts[1], gas: 5e6 })
    ).to.eventually.be.rejectedWith('revert Not the original block producer.');
  });

  it('Should respond to a challenge', async () => {
    const deployTx = new IncomingTransaction({
      from: block.transactions[0].getSenderAddress(),
      data: '0x6020600055',
    });
    const vm = new VM({ state: new Trie(), produceWitness: true });
    await vm.runTx({ tx: deployTx });
    const tx = new SignedTransaction({
      to: deployTx.getSenderAddress(),
      gasLimit: 5e4,
    });
    tx.sign(defaultKey);
    const { execResult: { witnesses } } = await vm.runTx({
      tx,
      skipNonce: true,
      skipBalance: true
    });
    witness = witnesses[0].encode();
    const data = faker.challengeManager.methods.respondToChallenge(
      block.hash(),
      0,
      witness
    ).encodeABI();
    receipt = await faker.peg.methods.challengeStep(data).send({ from: faker.from, gas: 5e6 });
  });
  
  it('Should have emitted a ChallengeResponse event', async () => {
    expect(receipt.events.ChallengeResponse).to.not.be.null;
    const _event = receipt.events.ChallengeResponse.returnValues;
    expect(_event.blockHash).to.eq(bufferToHex(block.hash()));
    expect(_event.transactionIndex).to.eq('0');
    expect(_event.witness).to.eq(witness);
  });

  // it('', async () => {
    
  // });
});