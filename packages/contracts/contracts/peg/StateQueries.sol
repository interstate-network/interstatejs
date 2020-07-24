pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateImplementer } from "../common/ChainStateImplementer.sol";
import { ChainStateLib as State } from "../common/ChainStateLib.sol";
import { CommitmentHeaderLib as Commitment } from "../common/blocks/CommitmentHeaderLib.sol";


contract StateQueries is ChainStateImplementer {
  using State for State.ChainState;

  function isBlockConfirmed(uint256 blockNumber)
  external view returns(bool) {
    return chainState.confirmedBlocks[blockNumber] != bytes32(0);
  }

  function getConfirmedBlockhash(uint256 blockNumber)
  external view returns(bytes32) {
    return chainState.confirmedBlocks[blockNumber];
  }

  function getPendingChild(bytes32 parentHash, uint256 childIndex)
  public view returns (bytes32) {
    return chainState.pendingBlocks[parentHash][childIndex];
  }

  function getPendingChildren(bytes32 parentHash)
  public view returns (bytes32[] memory) {
    bytes32[] memory children = chainState.pendingBlocks[parentHash];
    return children;
  }

  function hasPendingBlock(Commitment.CommitmentHeaderQuery memory _query)
  public view returns (bool) {
    return chainState.hasPendingBlock(_query);
  }

  function hasPendingChallenge(bytes32 _blockHash)
  public view returns (bool) {
    return chainState.hasPendingChallenge(_blockHash);
  }
}