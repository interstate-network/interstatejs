pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateImplementer as Stateful } from "../common/ChainStateImplementer.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
import { ChallengeLib as Challenge } from "./ChallengeLib.sol";
import { ChainStateLib as CS } from "../common/ChainStateLib.sol";
import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
import { ConfigLib as Config } from "../common/config/ConfigLib.sol";



contract ChallengeManager is Stateful {
  using Challenge for Challenge.BlockChallengeState;
  using Challenge for Challenge.Challenge;
  using CS for CS.ChainState;
  using Header for Header.ISO_Header;

  event BlockChallenge(bytes32 indexed blockHash, uint256 transactionIndex, address challenger);
  event ChallengeResponse(bytes32 indexed blockHash, uint256 transactionIndex, bytes witness);
  /**
   * @dev Emitted when a challenge is closed because one of the two parties
   * failed to respond to a challenge step.
   * @param blockHash Blockhash for the challenged block
   * @param transactionIndex Index of the challenged transaction
   * @param step Indicates which step the challenge was on when it timed out.
   */
  event ChallengeTimeout(
    bytes32 indexed blockHash,
    uint256 transactionIndex,
    Challenge.ChallengeStep step
  );

  /**
   * @dev Challenges the block producer of a given block to
   * submit a message witness for the transaction.
   * The challenged block must be a pending block in the chain state,
   * and the challenged transaction must not have already been challenged.
   * @notice Must be submitted with the requisite challenge bond.
   * @param query block query for the block being challenged
   * @param header original header for the block
   * @param transactionIndex index of the transaction to challenge
   */
  function challengeTransaction(
    CL.CommitmentHeaderQuery memory query,
    Header.ISO_Header memory header,
    uint256 transactionIndex
  ) public payable {
    require(
      chainState.hasPendingBlock(query) &&
      Header.blockHash(header) == query.commitment.blockHash &&
      transactionIndex < header.transactionsCount,
      "Block not recognized or transaction out of range."
    );
    Config.receiveChallengeBond();
    bytes32 _blockHash = query.commitment.blockHash;
    Challenge.BlockChallengeState memory blockChallenge = chainState.challengesByBlock[_blockHash];
    if (blockChallenge.coinbase == address(0)) chainState.challengesByBlock[_blockHash].coinbase = header.coinbase;
    chainState.challengesByBlock[_blockHash].putChallenge(transactionIndex);
    emit BlockChallenge(_blockHash, transactionIndex, msg.sender);
  }

  function respondToChallenge(
    bytes32 blockHash,
    uint256 transactionIndex,
    bytes memory witness
  ) public {
    Challenge.BlockChallengeState memory challengedBlock = chainState
      .challengesByBlock[blockHash];
    require(
      msg.sender == challengedBlock.coinbase,
      "Not the original block producer."
    );
    chainState.challengesByBlock[blockHash].putWitness(transactionIndex, witness);
    emit ChallengeResponse(blockHash, transactionIndex, witness);
  }

  function challengeTimeout(
    bytes32 blockHash,
    uint256 transactionIndex
  ) public {
    Challenge.Challenge memory challenge = chainState
      .challengesByBlock[blockHash]
      .transactionChallenge(transactionIndex);
    require(challenge.step != Challenge.ChallengeStep.NONE, "Challenge does not exist.");
    require(challenge.isExpired(), "Challenge has not expired.");
    Challenge.BlockChallengeState memory challengedBlock = chainState
      .challengesByBlock[blockHash];
    if (challenge.step == Challenge.ChallengeStep.PENDING) {
      Config.rewardSuccessfulChallenge(challenge.challenger);
    } else {
      Config.rewardChallengerTimeout(challengedBlock.coinbase);
      challengedBlock.openChallenges--;
    }
    delete chainState
      .challengesByBlock[blockHash]
      .challengesByTransaction[transactionIndex];
    emit ChallengeTimeout(blockHash, transactionIndex, challenge.step);
  }

  /**
   * @dev Reclaim the bond from a challenge to a block
   * which was reverted in a way that did not reward the challenger.
   * This can occur if a challenge to the block succeeds without referencing
   * the message witness from the challenge.
   */
  function reclaimChallengeBond(
    bytes32 blockHash,
    uint256 transactionIndex
  ) public {
    Challenge.Challenge memory challenge = chainState
      .challengesByBlock[blockHash]
      .transactionChallenge(transactionIndex);
    require(challenge.challenger != address(0), "Challenge does not exist.");
    require(
      chainState.revertedBlocks[blockHash] != CS.RevertReason.NONE,
      "Block not reverted"
    );
    delete chainState
      .challengesByBlock[blockHash]
      .challengesByTransaction[transactionIndex];
    Config.repayChallengeBond(challenge.challenger);
  }
}