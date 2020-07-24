pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { CommitmentHeaderLib as CH } from "./CommitmentHeaderLib.sol";
import { ChainStateLib as CS } from "../ChainStateLib.sol";

library BlockQueryLib {
  using CS for *;
  /**
   * @dev BlockQuery
   * @notice Used as a generic query to determine whether a block exists in the chain state.
   * @param confirmed Whether or not the block being queried is confirmed.
   * @param queryData If confirmed is true, this is a ConfirmedBlockQuery
   * If confirmed is false, queryData is a CommitmentHeaderQuery.
  */
  struct BlockQuery {
    bool confirmed;
    bytes queryData;
  }

  struct ConfirmedBlockQuery {
    uint256 blockNumber;
    bytes32 blockHash;
  }

  function hasBlock(CS.ChainState storage chainState, BlockQuery memory _query)
  internal view returns (bool _haveBlock) {
    if (_query.confirmed) {
      ConfirmedBlockQuery memory _queryData = abi.decode((_query.queryData), (ConfirmedBlockQuery));
      _haveBlock = chainState.confirmedBlocks[_queryData.blockNumber] == _queryData.blockHash;
    } else {
      CH.CommitmentHeaderQuery memory _queryData = abi.decode((_query.queryData), (CH.CommitmentHeaderQuery));
      _haveBlock = chainState.hasPendingBlock(_queryData);
    }
  }
}