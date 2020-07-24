const { expect } = require('chai');
const { getWeb3, getMerkleProof, compile, deploy, randomHexBuffer } = require('@interstatejs/utils');

function generateRandomLeaves(length, size) {
  return Array(length).fill(null).map(() => randomHexBuffer(size));
}

describe('MerkleProofLib.sol', () => {
  let web3, from, merkleProofLib, checkProof;
  before(async () => {
    const res = await getWeb3()
    web3 = res.web3;
    from = res.from;
    const contracts = compile(__dirname, ['MerkleTreeLib', 'MerkleProofLib']);
    merkleProofLib = await deploy(web3, from, { contracts, name: 'MerkleProofLib' });
    checkProof = (...args) => merkleProofLib.methods.verify(...args).call();
  });

  it('Should prove a value in a tree with one leaf', async () => {
    const leaf = randomHexBuffer(64);
    const { root, siblings } = getMerkleProof([leaf], 0);
    const proven = await checkProof(root, leaf, 0, siblings);
    expect(proven).to.be.true;
  })

  it('Should prove a value in a tree', async () => {
    const leaves5 = generateRandomLeaves(5, 64);
    const { root, siblings } = getMerkleProof(leaves5, 0);
    const proven = await checkProof(root, leaves5[0], 0, siblings);
    expect(proven).to.be.true;
  })

  it('Should prove every value in a tree', async () => {
    const leaves5 = generateRandomLeaves(5, 64);
    for (let i = 0; i < 5; i++) {
      const { root, siblings } = getMerkleProof(leaves5, i);
      const proven = await checkProof(root, leaves5[i], i, siblings);
      expect(proven).to.be.true;
    }
  })
})