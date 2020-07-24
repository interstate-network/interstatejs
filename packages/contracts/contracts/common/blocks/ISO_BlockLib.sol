pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ISO_HeaderLib as HL } from "./ISO_HeaderLib.sol";
import { MerkleTreeLib as Merkle } from "../rollup/MerkleTreeLib.sol";


library ISO_BlockLib {
  /* Block from an ISO chain */
  struct ISO_Block {
    HL.ISO_Header header;
    bytes[] transactions;
  }

  function checkBlockIntegrity(ISO_Block memory _block)
  internal view returns (bool) {
    return (
      hasMatchingTransactions(_block) &&
      _block.header.coinbase == msg.sender
    );
  }

  // /**
  //  * @dev matchesParentChain
  //  * @notice Basic integrity check for submitted ISO blocks to check that the parent chain height matches
  //  * the parent chain blockhash. This is used to avoid slashing nodes who mine blocks with data from chain forks.
  //  * @param _header ISO block header to check.
  //  * @return _goodParentChainHash True if the parent chain hash and parent chain number are consistent.
  //  */
  // function matchesParentChain(HL.ISO_Header memory _header)
  // internal view returns (bool _goodParentChainHash) {
  //   _goodParentChainHash = (
  //     _header.parentChainHash == blockhash(_header.parentChainHeight) &&
  //     _header.parentChainHash != bytes32(0)
  //   );
  // }

  /**
   * @dev hasMatchingTransactions
   * @notice Uses as a basic integrity check for submitted ISO blocks.
   * @param _block - a new block from the ISO chain
   * @return txHashMatches - boolean value stating whether the block header's transactionsRoot
   *         matches the merkle root of the block's transactions
   */
  function hasMatchingTransactions(ISO_Block memory _block)
  internal pure returns (bool txHashMatches) {
    return (
      Merkle.getMerkleRoot(_block.transactions) == _block.header.transactionsRoot &&
      _block.header.transactionsCount == _block.transactions.length
    );
  }
}