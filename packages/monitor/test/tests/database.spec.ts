import { Block } from '@interstatejs/block';
import { expect } from 'chai';
import { toHex, toBuf } from '@interstatejs/utils/src/utils';
import { bufferToHex } from 'ethereumjs-util';
import { Database } from '../../src/db';
import VM from '@interstatejs/vm';
import { IncomingTransaction } from '@interstatejs/tx';
import { randomHexBuffer } from '@interstatejs/utils';

describe('Test Database', async () => {
  let db: Database, genesis: Block, blockHash: string, commitmentHash: string;
  let parentHash: string;

  before(async () => {
    db = await Database.create();
    genesis = new Block();
    genesis.setGenesisParams();
    parentHash = toHex(genesis.hash());
  });

  it('Should have the genesis block', async () => {
    expect(await db.blockHashDB.has(0)).to.be.true;
  });

  it('Should retrieve the genesis block', async () => {
    const storedHash = await db.blockHashDB.latest();
    const realHash = toHex(genesis.hash());
    expect(storedHash.blockHash).to.eq(realHash);
    const storedBlock = await db.getBlock(0);
    expect(bufferToHex(storedBlock.hash())).to.eq(realHash);
  });

  it('Should put a new block', async () => {
    const block = new Block();
    block.header.parentHash = genesis.hash();
    block.header.number = toBuf(1);
    block.header.toCommitment({ submittedAt: 10, childIndex: 0 });
    await db.putBlock(block);
    blockHash = toHex(block.hash());
    commitmentHash = toHex(block.header.commitment.hash());
  });

  it('Should have one child for genesis block', async () => {
    expect(await db.blockHashDB.childCount(parentHash)).to.eq(1);
    const children = await db.blockHashDB.children(parentHash);
    expect(children[0]).to.eq(blockHash);
  });

  it('Should have mapped the new block to the genesis children', async () => {
    const block = await db.getBlock(blockHash);
    expect(toHex(block.hash())).to.eq(blockHash);
    expect(block.header.commitment).to.exist;
    expect(toHex(block.header.commitment.hash())).to.eq(commitmentHash);
  });

  it('Should execute a block', async () => {
    const getBlock = async (): Promise<Buffer> => {
      const block = new Block();
      block.setGenesisParams();
      block.header.parentHash = block.hash();
      const parent = await db.getBlock(block.header.parentHash);
      const state = await db.getStateTree(parent.header.stateRoot);
      const vm = await VM.create({ state });
      block.transactions.push(new IncomingTransaction({
        from: randomHexBuffer(20),
        data: randomHexBuffer(100)
      }));
      block.header.number = Buffer.from('1', 'hex');
      await vm.runTx({ block, tx: block.transactions[0] });
      block.setOutputs();
      console.log('set block')
      await db.putBlock(block);
      return block.hash();
    }
    const blockHash = await getBlock();
    const block = await db.getBlock(blockHash);
    const rootA = block.transactions[0].stateRoot.toString('hex');
    const parent = await db.getBlock(block.header.parentHash);
    const state = await db.getStateTree(parent.header.stateRoot);
    const vm = await VM.create({ state });
    await vm.runTx({ tx: block.transactions[0], block });
    const rootB = block.transactions[0].stateRoot.toString('hex');
    expect(rootA).to.eq(rootB)
  })
});