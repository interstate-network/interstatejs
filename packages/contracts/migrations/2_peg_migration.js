const ChainPeg = artifacts.require('ChainPeg')
const ChildRelay = artifacts.require('ChildRelay');
const ChallengeManager = artifacts.require('ChallengeManager')
const ArchiveFactory = artifacts.require('ArchiveFactory')
const ParentRelay = artifacts.require('ParentRelay')
const MerkleTreeLib = artifacts.require('MerkleTreeLib')
const MerkleProofLib = artifacts.require('MerkleProofLib')

module.exports = function(deployer, network) {
  // deployment steps
  if (network == 'development') {
    deployer.then(async () => {
      await Promise.all([
        deployer.deploy(ArchiveFactory, { overwrite: false }),
        deployer.deploy(MerkleTreeLib, { overwrite: false }),
        deployer.deploy(MerkleProofLib, { overwrite: false })
      ])
      await Promise.all([
        deployer.link(MerkleTreeLib, [ChallengeManager, ChainPeg, ChildRelay, ParentRelay]),
        deployer.link(MerkleProofLib, [ChallengeManager, ChainPeg, ChildRelay, ParentRelay])
      ])
      await Promise.all([
        deployer.deploy(ChallengeManager, { overwrite: false }),
        deployer.deploy(ChainPeg),
        deployer.deploy(ChildRelay, { overwrite: false }),
        deployer.deploy(ParentRelay, { overwrite: false })
      ])
      
      const peg = await ChainPeg.deployed()
      await peg.initialize(ChallengeManager.address, ParentRelay.address)
      const relay = await ParentRelay.deployed()
      await relay.initialize(ChainPeg.address, ArchiveFactory.address, ChildRelay.address)
    })
  }
};
