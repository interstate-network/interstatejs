import { Block } from '@interstatejs/block';
import { bufferToHex, toBuffer } from 'ethereumjs-util';
import { IncomingTransaction, SignedTransaction } from '@interstatejs/tx';
import { getMerkleRoot } from '@interstatejs/utils';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Faker } from '../../test-utils/faker';

const { expect } = chai;

describe('Block Submission', async () => {
  let faker: Faker;
  let block: Block;
  let receipt: any;

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
    receipt = await faker.peg.methods.submitBlock({
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
    block.header.toCommitment({ childIndex: 0, submittedAt: receipt.blockNumber });
  });

  it('Should emit a BlockSubmitted event', async () => {
    expect(receipt.events.BlockSubmitted).to.not.be.null;
    expect(receipt.events.BlockSubmitted.returnValues.blockHash).to.eq(bufferToHex(block.hash()))
  });

  it('Should have the pending block', async () => {
    const pendingHash = await faker.peg.methods.getPendingChild(block.header.parentHash, 0).call();
    const commitmentHash = bufferToHex(block.header.commitment.hash());
    expect(pendingHash).to.eq(commitmentHash);
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
});