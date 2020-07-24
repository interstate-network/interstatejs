const { expect } = require('chai');
const path = require('path')
const { getWeb3, getMerkleRoot, compile, deploy, randomHexBuffer, getMerkleProof, TestBlockUtil } = require('interstatejs-utils');

function generateRandomLeaves(length, size) {
  return Array(length).fill(null).map(() => randomHexBuffer(size));
}

const bytes32_zero = `0x${'00'.repeat(32)}`;
const randomTransactions = () => {
  const transactions = generateRandomLeaves(5, 64);
  const root = getMerkleRoot(transactions);
  return {
    count: transactions.length,
    transactions,
    root: root
  }
}

describe('ISO Block and Header Validation', () => {
  let web3, from, blockLibTest, getBlock, parentChainBlock;

  before(async () => {
    const res = await getWeb3()
    web3 = res.web3;
    from = res.from;
    const contracts2 = compile(__dirname, 'StateTest', path.join(__dirname, '..', '..', '..'));
    const contracts = compile(__dirname, 'BlockTest', path.join(__dirname, '..', '..', '..'));
    blockLibTest = await deploy(web3, from, { contracts, name: 'BlockTest' });
    const testBlockUtil = new TestBlockUtil(web3, from);
    getBlock = (...args) => testBlockUtil.getBlock(...args);
    parentChainBlock = (...args) => testBlockUtil.parentChainBlock(...args);
  })

  describe('ISO_BlockLib.sol', async () => {
    let good_cases = [];
    let bad_cases = [];
    describe('matchesParentChain()', async () => {
      it(`Should pass if a header matches the parent chain`, async () => {
        const block = await getBlock();
        const isValid = await blockLibTest.methods.matchesParentChain(block.header).call()
        expect(isValid).to.be.true
      })

      it(`Should fail if a header does not match the parent chain`, async () => {
        const block = await getBlock();
        bad_cases.push(block);
        block.header.parentChainHeight -= 1;
        const isValid = await blockLibTest.methods.matchesParentChain(block.header).call()
        expect(isValid).to.be.false
      })

      it(`Should fail if a header has a parentChainHeight from the future`, async () => {
        const block = await getBlock();
        bad_cases.push(block);
        block.header.parentChainHeight += 10;
        block.header.parentChainHash = bytes32_zero;
        const isValid = await blockLibTest.methods.matchesParentChain(block.header).call()
        expect(isValid).to.be.false
      })
    })

    describe('hasMatchingTransactions()', async () => {
      it('Should pass if a block has matching transactions, root and count', async () => {
        const block = await getBlock()
        const isValid = await blockLibTest.methods.hasMatchingTransactions(block).call()
        expect(isValid).to.be.true
      })

      it(`Should fail if a header has a bad transactionsCount`, async () => {
        const block = await getBlock()
        bad_cases.push(block);
        block.header.transactionsCount -= 1;
        const isValid = await blockLibTest.methods.hasMatchingTransactions(block).call()
        expect(isValid).to.be.false
      })
    
      it(`Should fail if a header has a bad transactionsRoot`, async () => {
        const { root } = await randomTransactions();
        const block = await getBlock()
        bad_cases.push(block);
        block.header.transactionsRoot = root;
        const isValid = await blockLibTest.methods.hasMatchingTransactions(block).call()
        expect(isValid).to.be.false
      })
    })

    describe('checkBlockIntegrity()', async () => {
      async function testBlockIntegrityMatch(block) {
        const validTxs = await blockLibTest.methods.hasMatchingTransactions(block).call()
        const validParent = await blockLibTest.methods.matchesParentChain(block.header).call()
        const isValid = await blockLibTest.methods.checkBlockIntegrity(block).call()
        expect(isValid).to.eq(validTxs && validParent);
      }
      it(`Should pass if both hasMatchingTransactions and matchesParentChain pass`, async () => {
        const block = await getBlock()
        await testBlockIntegrityMatch(block)
      })
      
      it(`Should fail if hasMatchingTransactions or matchesParentChain fails`, async () => {
        const block = await getBlock()
        block.header.parentChainHeight -= 1;
        await testBlockIntegrityMatch(block);
        const block2 = await getBlock();
        block2.transactionsRoot = getMerkleRoot(generateRandomLeaves(4, 60))
        await testBlockIntegrityMatch(block2)
      })
    })
  })

  describe('ISO_HeaderLib.sol', () => {
    describe('hasTransaction', async () => {
      it('Should pass if a valid proof is provided for transactionsRoot', async () => {
        const block = await getBlock()
        const { siblings } = getMerkleProof(block.transactions, 3);
        const isValid = await blockLibTest.methods.hasTransaction(block.header, block.transactions[3], 3, siblings).call();
        expect(isValid).to.be.true;
      })

      it('Should fail if an invalid proof is provided for transactionsRoot', async () => {
        const block = await getBlock()
        const { siblings } = getMerkleProof(block.transactions, 2);
        const isValid = await blockLibTest.methods.hasTransaction(block.header, block.transactions[3], 3, siblings).call();
        expect(isValid).to.be.false;
      })
    })

    describe('matchesParentBlock', async () => {
      it('Should pass if the parent block matches the child', async () => {
        const parent = await getBlock()
        const blockHash = await blockLibTest.methods.blockHash(parent.header).call();
        console.log(parent.header)
        const child = await getBlock(blockHash, parent.header.number);
        console.log(child.header)
        const match = await blockLibTest.methods.matchesParentBlock(child.header, parent.header).call();
        expect(match).to.be.true;
      })

      it('Should fail if the child block is not one block higher than the parent', async () => {
        const parent = await getBlock()
        const blockHash = await blockLibTest.methods.blockHash(parent.header).call();
        const child = await getBlock(blockHash, parent.header.number + 1);
        const match = await blockLibTest.methods.matchesParentBlock(child.header, parent.header).call();
        expect(match).to.be.false;
      })

      it(`Should fail if the child block's parentHash does not match the parent`, async () => {
        const parent = await getBlock()
        const blockHash = await blockLibTest.methods.blockHash(parent.header).call();
        parent.header.transactionsCount += 1;
        const child = await getBlock(blockHash, parent.header.number);
        const match = await blockLibTest.methods.matchesParentBlock(child.header, parent.header).call();
        expect(match).to.be.false;
      })

      it(`Should fail if the child block's parentChainHeight is less than the parent`, async () => {
        const parent = await getBlock()
        const prevParentChain = await parentChainBlock(parent.header.parentChainHeight - 3);
        const blockHash = await blockLibTest.methods.blockHash(parent.header).call();
        const child = await getBlock(blockHash, parent.header.number);
        child.header.parentChainHeight = prevParentChain.blockNumber;
        child.header.parentChainHash = prevParentChain.blockHash;
        const match = await blockLibTest.methods.matchesParentBlock(child.header, parent.header).call();
        expect(match).to.be.false;
      })
    })
  })

  describe('CommitmentHeaderLib.sol', async () => {
    it('Should derive the same commitment hash whether through Header.commitmentHash or Commit.commitmentHash', async () => {
      const block = await getBlock();
      const commitsMatch = await blockLibTest.methods.compareCommitmentHashes(block.header).call();
      expect(commitsMatch).to.be.true
    })
  })
})