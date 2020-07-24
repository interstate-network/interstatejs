pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

// import "./ISO_BlockLib.sol";
import { ChallengeLib as Challenge } from "../challenge/ChallengeLib.sol";
import { CommitmentHeaderLib as CL } from "./blocks/CommitmentHeaderLib.sol";
import { ConfigLib as Config } from "./config/ConfigLib.sol";
import { MerkleProofLib as Merkle } from "./rollup/MerkleProofLib.sol";
import "../challenge/ChallengeManager.sol";
import "../relay/IParentRelay.sol";
import "../relay/ArchiveFactory.sol";
import "./config/byte-counter/IByteCounter.sol";
import "./rollup/SparseMerkleTree.sol";
// import "../fraud-proofs/AccessErrorProver.sol";
// import "../fraud-proofs/BlockErrorProver.sol";
// import "../fraud-proofs/ExecutionErrorProver.sol";
// import "../fraud-proofs/TransactionErrorProver.sol";

/*
we need to be able to prove the children of a block we've determined to be fraudulent,
so we map fraudulent block hashes to a bool
we also want to select the first good block at a given height,
but only if its parent is confirmed, so we map children to their parents
- otherwise we'd need to loop through storage arrays checking parent hashes
*/

library ChainStateLib {
  using Config for *;
  using CL for *;
  using Challenge for Challenge.BlockChallengeState;

  bytes32 constant archiveCodeHash = keccak256(type(ArchiveInitializer).creationCode);

  event BlockConfirmed(uint256 indexed blockHeight, bytes32 indexed blockHash);
  event BlockSubmitted(uint256 indexed blockHeight, bytes32 parentHash, bytes32 blockHash);
  event BlockReverted(bytes32 indexed blockHash, RevertReason reason);

  enum RevertReason {
    NONE,     // Null
    TIMEOUT,  // Reverted due to lack of challenge response
    FRAUD     // Reverted due to proven error in the block
  }

  struct ChainState {
    address archiveFactory;
    address challengeManager;
    SparseMerkleTree sparse;
    IParentRelay relay;
    IByteCounter byteCounter;
    address accessErrorProver;
    address blockErrorProver;
    address executionErrorProver;
    address transactionErrorProver;
    address encodingErrorProver;
    address witnessErrorProver;
    address hypervisorAddress;
    bytes32[] confirmedBlocks;
    mapping(bytes32 => bytes32[]) pendingBlocks;
    mapping(bytes32 => Challenge.BlockChallengeState) challengesByBlock;
    mapping(bytes32 => RevertReason) revertedBlocks;
  }

  function init(
    ChainState storage _state,
    SparseMerkleTree sparse,
    address challengeManager,
    address relay,
    address archiveFactory,
    IByteCounter byteCounter,
    address accessErrorProver,
    address blockErrorProver,
    address executionErrorProver,
    address transactionErrorProver,
    address encodingErrorProver,
    address witnessErrorProver,
    address hypervisorAddress
  ) internal {
    require(address(_state.sparse) == address(0), "Already initialized");
    _state.sparse = sparse;
    _state.archiveFactory = archiveFactory;
    _state.challengeManager = challengeManager;
    _state.relay = IParentRelay(relay);
    _state.byteCounter = byteCounter;
    _state.accessErrorProver = accessErrorProver;
    _state.blockErrorProver = blockErrorProver;
    _state.executionErrorProver = executionErrorProver;
    _state.transactionErrorProver = transactionErrorProver;
    _state.encodingErrorProver = encodingErrorProver;
    _state.witnessErrorProver = witnessErrorProver;
    _state.hypervisorAddress = hypervisorAddress;
  }

  function getContractArchiveAddress(ChainState storage _state, address contractProxy)
  internal view returns (address archiveAddress) {
    address deployer = _state.archiveFactory;
    bytes32 initCodeHash = archiveCodeHash;
    bytes memory input = new bytes(85);
    assembly {
      mstore8(add(input, 0x20), 0xff) // 1
      mstore(add(input, 0x21), shl(0x60, deployer)) // 20
      mstore(add(input, 0x35), contractProxy) // 32
      mstore(add(input, 0x55), initCodeHash) // 32
      let mask := 0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff
      archiveAddress := and(mask, keccak256(add(input, 0x20), 85))
    }
  }

  function hasPendingBlock(ChainState storage _state, CL.CommitmentHeaderQuery memory _query)
  internal view returns (bool _hasBlock) {
    _hasBlock = (_state.pendingBlocks[_query.parentHash][_query.childIndex] == _query.commitment.commitmentHash());
  }

  function hasPendingChallenge(ChainState storage _state, bytes32 _blockHash)
  internal view returns (bool _hasChallenge) {
    _hasChallenge = _state.challengesByBlock[_blockHash].openChallenges > 0;
  }

  function verifyCanConfirm(
    ChainState storage _state, CL.CommitmentHeaderQuery memory _query
  ) internal view returns (bool) {
    bytes32[] storage siblings = _state.pendingBlocks[_query.parentHash];
    require(
      siblings[_query.childIndex] == _query.commitment.commitmentHash(),
      "Pending block not found."
    );
    require(
      !hasPendingChallenge(_state, _query.commitment.blockHash),
      "Block has pending challenges."
    );
    require(
      _state.confirmedBlocks[_query.blockNumber - 1] == _query.parentHash,
      "Block parent not in the canonical chain."
    );
    require(
      _state.confirmedBlocks.length == _query.blockNumber,
      "Block already confirmed for height."
    );
    if (_query.childIndex != 0) {
      for (uint256 i = 0; i < _query.childIndex; i++) {
        require(siblings[i] == bytes32(0), "Block not first child of parent.");
      }
    }
    require(
      Config.confirmationPeriodOver(_query.commitment.submittedAt),
      "Block not ready to be confirmed."
    );
    return true;
  }

  function confirmBlock(ChainState storage _state, CL.CommitmentHeaderQuery memory _query)
  internal {
    _state.pendingBlocks[_query.parentHash][_query.childIndex] = bytes32(0);
    _state.confirmedBlocks[_query.blockNumber] = _query.commitment.blockHash;
    Config.repayRollupBond(_query.commitment.coinbase);
    _state.relay.putConfirmedBlock(_query.blockNumber, _query.commitment.exitsRoot);
  }

  /**
   * @dev Deletes a fraudulent block and marks it as reverted due to fraud.
   */
  function markFraudulentBlock(
    ChainState storage _state,
    CL.CommitmentHeaderQuery memory _query
  ) internal returns (uint256) {
    delete _state.pendingBlocks[_query.parentHash][_query.childIndex];
    _state.revertedBlocks[_query.commitment.blockHash] = RevertReason.FRAUD;
    emit BlockReverted(_query.commitment.blockHash, RevertReason.FRAUD);
  }

  /**
   * @dev Deletes a block whose parent was previously
   * marked fraudulent.
   */
  function markFraudulentChild(
    ChainState storage _state,
    CL.CommitmentHeaderQuery memory _query
  ) internal returns (bool) {
    require(hasPendingBlock(_state, _query), "Pending block not found.");
    require(
      _state.revertedBlocks[_query.parentHash] == RevertReason.FRAUD,
      "Parent block not marked fraudulent."
    );
    markFraudulentBlock(_state, _query);
  }
}
