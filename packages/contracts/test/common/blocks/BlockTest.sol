pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ISO_BlockLib as Block } from "../../../src/common/blocks/ISO_BlockLib.sol";
import { ISO_HeaderLib as Header } from "../../../src/common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as Commit } from "../../../src/common/blocks/CommitmentHeaderLib.sol";

contract BlockTest {
  /*  --- ISO_BlockLib --- */
  function checkBlockIntegrity(Block.ISO_Block memory _block)
  public view returns (bool) {
    return Block.checkBlockIntegrity(_block);
  }

  function matchesParentChain(Header.ISO_Header memory _header)
  public view returns (bool) {
    return Block.matchesParentChain(_header);
  }

  function hasMatchingTransactions(Block.ISO_Block memory _block)
  public pure returns (bool) {
    return Block.hasMatchingTransactions(_block);
  }

  /*  --- ISO_HeaderLib --- */
  function hasTransaction(
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 index,
    bytes32[] memory siblings
  ) public pure returns (bool) {
    return Header.hasTransaction(header, transaction, index, siblings);
  }

  function matchesParentBlock(Header.ISO_Header memory _header, Header.ISO_Header memory _parent)
  public pure returns (bool) {
    return Header.matchesParentBlock(_header, _parent);
  }

  function blockHash(Header.ISO_Header memory header)
  public pure returns (bytes32) {
    return Header.blockHash(header);
  }

  function compareCommitmentHashes(Header.ISO_Header memory header)
  public view returns (bool) {
    bytes32 hashH = Header.commitmentHash(header);
    bytes32 hashC = Commit.commitmentHash(Header.toCommitment(header));
    return hashH == hashC;
  }
}