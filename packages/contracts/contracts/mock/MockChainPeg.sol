pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "../peg/ChainPeg.sol";
import "../relay/ParentRelay.sol";
import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
import { ISO_BlockLib as Block } from "../common/blocks/ISO_BlockLib.sol";
import { BlockQueryLib as BQ } from "../common/blocks/BlockQueryLib.sol";
import { ChainStateLib as CS } from "../common/ChainStateLib.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";

contract MockChainPeg is ChainPeg {
  ParentRelay parentRelay;

  function putPendingBlock(Header.ISO_Header memory header) public payable {
    CL.CommitmentHeader memory commitment = header.toCommitment();
    chainState.pendingBlocks[header.parentHash].push(commitment.commitmentHash());
    emit BlockSubmitted(
      header.number,
      header.parentHash,
      chainState.pendingBlocks[header.parentHash].length - 1, // this can be more efficient
      commitment.blockHash
    );
  }

  function markFraudulentBlock(CL.CommitmentHeaderQuery memory _query) public {
    CS.markFraudulentBlock(chainState, _query);
  }

  function confirmPendingBlock(CL.CommitmentHeaderQuery memory _query) public {
    CS.confirmBlock(chainState, _query);
  }

  // function challengeStep(bytes calldata challengeData)
  // external payable {
  //   (bool success, bytes memory ret) = chainState.challengeManager.delegatecall(challengeData);
  //   if (!success) revert(string(ret));
  //   assembly { return(ret, add(mload(ret), 0x20)) }
  // }

  function blockHash(Header.ISO_Header memory header)
  public pure returns (bytes32) {
    return Header.blockHash(header);
  }

  /* function getConfirmedBlockhash(uint256 num) public view returns (bytes32) {
    return chainState.confirmedBlocks[num];
  } */
}