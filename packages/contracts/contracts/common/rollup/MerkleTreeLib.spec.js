const { expect } = require('chai');
const { getWeb3, getMerkleRoot, compile, deploy, randomHexBuffer } = require('@interstatejs/utils');

function generateRandomLeaves(length, size) {
  return Array(length).fill(null).map(() => randomHexBuffer(size));
}

describe('MerkleTreeLib.sol', () => {
  let web3, from, merkleTreeLib, /* merkleProofLib, */ deriveRoot, checkProof;
  before(async () => {
    const res = await getWeb3()
    web3 = res.web3;
    from = res.from;
    const contracts = compile(__dirname, ['MerkleTreeLib', 'MerkleProofLib']);
    merkleTreeLib = await deploy(web3, from, { contracts, name: 'MerkleTreeLib' });
    // merkleProofLib = await deploy(web3, from, { contracts, name: 'MerkleProofLib' });
    deriveRoot = (...args) => merkleTreeLib.methods.getMerkleRoot(...args).call();
    // checkProof = (...args) => merkleProofLib.methods.verify(...args).call();
  })

  it('Should derive a merkle root from a single leaf', async () => {
    const leaf = randomHexBuffer(64);
    const expectedRoot = '0x' + getMerkleRoot([leaf]).toString('hex');
    const realRoot = await deriveRoot([leaf]);
    expect(realRoot).to.eq(expectedRoot);
  })

  it('Should derive a merkle root from an odd number of leaves', async () => {
    const leaves5 = generateRandomLeaves(5, 64);
    const expectedRoot = '0x' + getMerkleRoot(leaves5).toString('hex');
    const realRoot = await deriveRoot(leaves5);
    expect(realRoot).to.eq(expectedRoot);
  })

  it('Should derive a merkle root from an even number of leaves', async () => {
    const leaves4 = generateRandomLeaves(4, 64);
    const expectedRoot = '0x' + getMerkleRoot(leaves4).toString('hex');
    const realRoot = await deriveRoot(leaves4);
    expect(realRoot).to.eq(expectedRoot);
  })
})