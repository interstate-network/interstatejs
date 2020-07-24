pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ISO_BlockLib as Block } from "../../../src/common/blocks/ISO_BlockLib.sol";
import { ISO_HeaderLib as Header } from "../../../src/common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as Commit } from "../../../src/common/blocks/CommitmentHeaderLib.sol";
import { ChainStateLib as ChainState } from "../../../src/common/ChainStateLib.sol";
import "../../../src/common/ChainStateImplementer.sol";

contract StateTest is ChainStateImplementer {
  using Header for *;
  using Commit for *;
  using ChainState for *;
  
  function putPendingBlock(Block.ISO_Block memory _block)
  public returns (Commit.CommitmentHeaderQuery memory query) {
    Commit.CommitmentHeader memory commit = _block.header.toCommitment();
    chainState.pendingBlocks[_block.header.parentHash].push(commit.commitmentHash());
    query = Commit.CommitmentHeaderQuery(
      _block.header.parentHash,
      chainState.pendingBlocks[_block.header.parentHash].length - 1,
      _block.header.number,
      commit
    );
  }

  function hasPendingBlock(Commit.CommitmentHeaderQuery memory query)
  public view returns (bool) {
    return chainState.hasPendingBlock(query);
  }
}