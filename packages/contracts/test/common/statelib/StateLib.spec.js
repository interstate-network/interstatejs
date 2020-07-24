const { expect } = require('chai');
const path = require('path')
const { getWeb3, getMerkleRoot, compile, deploy, randomHexBuffer, getMerkleProof, TestBlockUtil } = require('interstatejs-utils');

describe('ISO State Query Validation', () => {
  let web3, from, stateLibTest, getBlock, parentChainBlock;

  before(async () => {
    const res = await getWeb3()
    web3 = res.web3;
    from = res.from;
    const contracts = compile(__dirname, 'StateTest', path.join(__dirname, '..', '..', '..'));
    stateLibTest = await deploy(web3, from, { contracts, name: 'StateTest' });
    const testBlockUtil = new TestBlockUtil(web3, from);
    getBlock = (...args) => testBlockUtil.getBlock(...args);
    parentChainBlock = (...args) => testBlockUtil.parentChainBlock(...args);
  })

  async function putBlock() {
    const block = await getBlock();
    const { blockNumber } = await stateLibTest.methods.putPendingBlock(block).send({ from, gas: 5e6 })
    const blockHash = await stateLibTest.methods.blockHash(block.header).call();
    const commitment = {
      coinbase: block.header.coinbase,
      submittedAt: blockNumber,
      exitsRoot: block.header.exitsRoot,
      blockHash
    }
    return {
      parentHash: block.header.parentHash,
      childIndex: 0,
      blockNumber: block.header.number,
      commitment
    }
  }

  describe('CommitmentHeaderQuery', () => {
    // await putBlock()
    describe('hasPendingBlock', () => {
      it('Should return true for a committed block', async () => {
        const query = await putBlock()
        const isPending = await stateLibTest.methods.hasPendingBlock(query).call()
        expect(isPending).to.be.true;
      })
    
      it('Should return false if the wrong blockhash is given in the query', async () => {
        const query = await putBlock()
        query.commitment.blockHash = `0x${'00'.repeat(32)}`;
        const isPending = await stateLibTest.methods.hasPendingBlock(query).call()
        expect(isPending).to.be.false
      })
    })
  })
})