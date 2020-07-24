// pragma solidity ^0.6.0;
// pragma experimental ABIEncoderV2;

// import { CommitmentHeaderLib as Commitment } from "../../common/blocks/CommitmentHeaderLib.sol";
// import { ChainStateLib as State } from "../../common/ChainStateLib.sol";
// import { ChallengeLib as Challenge } from "../../challenge/ChallengeLib.sol";

// library WitnessChallengeLib {
//   using State for State.ChainState;

//   function hasWitnessForPendingBlock(
//     State.ChainState storage _state,
//     Commitment.CommitmentHeaderQuery memory commitmentQuery,
//     uint256 transactionIndex,
//     bytes32 witnessHash
//   ) internal view returns (bool) {
//     bool hasBlock = _state.hasPendingBlock(commitmentQuery);
//     bool hasWitness = _state
//       .challengesByBlock[commitmentQuery.commitment.blockHash]
//       .witnessHashes[transactionIndex] == witnessHash;
//     return hasBlock && hasWitness;
//   }
// }