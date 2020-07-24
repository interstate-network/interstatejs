/* const ChallengeManager = artifacts.require('ChallengeManager')
const ChildRelay = artifacts.require('ChildRelay');
const ArchiveFactory = artifacts.require('ArchiveFactory')
const MerkleTreeLib = artifacts.require('MerkleTreeLib')
const MerkleProofLib = artifacts.require('MerkleProofLib')
const MockChainPeg = artifacts.require('MockChainPeg')
const MockMockParentRelay = artifacts.require('MockMockParentRelay')

module.exports = function(deployer, network) {
  if (network == 'with_mocks') {
    deployer.then(async () => {
      await deployer.deploy(ArchiveFactory, { overwrite: false })
      await deployer.deploy(MerkleTreeLib, { overwrite: false })
      await deployer.deploy(MerkleProofLib, { overwrite: false })
      await deployer.link(MerkleTreeLib, [ChallengeManager, ChildRelay, MockChainPeg, MockMockParentRelay])
      await deployer.link(MerkleProofLib, [ChallengeManager, ChildRelay, MockChainPeg, MockMockParentRelay])
      await deployer.deploy(ChallengeManager, { overwrite: false })
      await deployer.deploy(MockChainPeg, { overwrite: false })
      await deployer.deploy(ChildRelay, { overwrite: false })
      await deployer.deploy(MockMockParentRelay, { overwrite: false })
      const peg = await MockChainPeg.deployed()
      await peg.initialize(ChallengeManager.address, MockMockParentRelay.address)
      const relay = await MockMockParentRelay.deployed()
      await relay.initialize(MockChainPeg.address, ArchiveFactory.address, ChildRelay.address)
    })
  }
};
 */

const ChainPeg = artifacts.require('ChainPeg')
const ChildRelay = artifacts.require('ChildRelay');
const ChallengeManager = artifacts.require('ChallengeManager')
const ArchiveFactory = artifacts.require('ArchiveFactory')
const MockParentRelay = artifacts.require('MockParentRelay')
const MerkleTreeLib = artifacts.require('MerkleTreeLib')
const MerkleProofLib = artifacts.require('MerkleProofLib')

module.exports = function(deployer, network) {
  // deployment steps
  if (network != 'development') {
    deployer.then(async () => {
      await Promise.all([
        deployer.deploy(ArchiveFactory, { overwrite: false }),
        deployer.deploy(MerkleTreeLib, { overwrite: false }),
        deployer.deploy(MerkleProofLib, { overwrite: false })
      ])
      await Promise.all([
        deployer.link(MerkleTreeLib, [ChallengeManager, ChainPeg, ChildRelay, MockParentRelay]),
        deployer.link(MerkleProofLib, [ChallengeManager, ChainPeg, ChildRelay, MockParentRelay])
      ])
      await Promise.all([
        deployer.deploy(ChallengeManager, { overwrite: false }),
        deployer.deploy(ChainPeg),
        deployer.deploy(ChildRelay, { overwrite: false }),
        deployer.deploy(MockParentRelay, { overwrite: false })
      ])
      
      const peg = await ChainPeg.deployed()
      await peg.initialize(ChallengeManager.address, MockParentRelay.address)
      const relay = await MockParentRelay.deployed()
      await relay.initialize(ChainPeg.address, ArchiveFactory.address, ChildRelay.address)
    })
  }
};
