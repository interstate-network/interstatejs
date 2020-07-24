pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import {
  MessageWitnessLib as Message
} from "../common/witness/MessageWitnessLib.sol";
import {ConfigLib as Config} from "../common/config/ConfigLib.sol";

library ChallengeLib {
  using Message for Message.MessageWitness;

  enum ChallengeStep {
    NONE, // Challenge not initiated (null).
    PENDING, // Pending response from block producer.
    RECEIVED // Witness has been received.
  }

  struct Challenge {
    uint56 lastUpdate; // block number of last update to the challenge
    address challenger; // address of challenger
    ChallengeStep step; // step of the challenge
  }

  struct BlockChallengeState {
    address coinbase;
    uint256 openChallenges;
    mapping(uint256 => Challenge) challengesByTransaction;
    mapping(uint256 => bytes32) witnessHashes;
  }

  function challengeHash(Challenge memory challenge)
    internal
    pure
    returns (bytes32 _challengeHash)
  {
    _challengeHash = keccak256(abi.encode(challenge));
  }

  /**
   * @dev Returns the challenge object recorded in a block challenge
   * state at a given transaction index.
   */
  function transactionChallenge(
    BlockChallengeState storage challengeState,
    uint256 transactionIndex
  ) internal view returns (Challenge memory challenge) {
    return challengeState.challengesByTransaction[transactionIndex];
  }

  function hasTransactionChallenge(
    BlockChallengeState storage challengeState,
    uint256 transactionIndex
  ) internal view returns (bool) {
    return
      transactionChallenge(challengeState, transactionIndex).step !=
      ChallengeStep.NONE;
  }

  /**
   * @dev Returns a boolean stating whether the challenge state
   * for a block has the provided witness for the given transaction index.
   * This indicates whether the block producer for that block has submitted
   * the provided witness data for the specified transaction, and thus
   * vouched for its integrity as a representation of the transaction's
   * execution.
   */
  function hasWitness(
    BlockChallengeState storage challengeState,
    uint256 transactionIndex,
    bytes memory witness
  ) internal view returns (bool) {
    return challengeState.witnessHashes[transactionIndex] == keccak256(witness);
  }

  function putChallenge(
    BlockChallengeState storage challengeState,
    uint256 transactionIndex
  ) internal {
    require(
      !hasTransactionChallenge(challengeState, transactionIndex),
      "Transaction has already been challenged."
    );
    Challenge memory challenge = Challenge({
      lastUpdate: uint56(block.number),
      challenger: msg.sender,
      step: ChallengeStep.PENDING
    });
    challengeState.challengesByTransaction[transactionIndex] = challenge;
    challengeState.openChallenges += 1;
  }

  function putWitness(
    BlockChallengeState storage challengeState,
    uint256 transactionIndex,
    bytes memory witness
  ) internal {
    require(
      challengeState.witnessHashes[transactionIndex] == bytes32(0),
      "Witness already committed"
    );
    challengeState.witnessHashes[transactionIndex] = keccak256(witness);
    Challenge memory challenge = transactionChallenge(
      challengeState,
      transactionIndex
    );
    challenge.lastUpdate = uint56(block.number);
    challenge.step = ChallengeStep.RECEIVED;
    challengeState.challengesByTransaction[transactionIndex] = challenge;
  }

  /**
   * @dev Returns a boolean stating whether the challenge has exceeded
   * the challenge period.
   * If true, this indicates that whichever party is currently responsible for
   * making the next step in the challenge will be considered to have been in
   * the wrong and be subject to penalties.
   */
  function isExpired(Challenge memory challenge) internal view returns (bool) {
    return (block.number >= challenge.lastUpdate + Config.CHALLENGE_PERIOD());
  }
}
