pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { OutgoingTransactionLib as OTL } from "../common/transactions/OutgoingTransactionLib.sol";


contract ChildRelay {
  uint256 private lastBlockUpdate;

  mapping(uint256 => bytes[]) private outgoingTransactions;
  
  event OutgoingTransactionQueued(OTL.OutgoingTransaction transaction);

  fallback() external payable { return; }
  receive() external payable { return; }
  
  modifier clearsLastBlock {
    if (lastBlockUpdate != block.number) {
      if (outgoingTransactions[lastBlockUpdate].length > 0) {
        delete outgoingTransactions[lastBlockUpdate];
      }
      lastBlockUpdate = block.number;
    }
    _;
  }

  function getQueue(uint256 blockNumber)
  public view returns (OTL.OutgoingTransaction[] memory transactions) {
    uint256 len = outgoingTransactions[blockNumber].length;
    transactions = new OTL.OutgoingTransaction[](len);
    for (uint256 i = 0; i < len; i++) transactions[i] = OTL.fromBytes(outgoingTransactions[blockNumber][i]);
  }

  function _putOutgoing(OTL.OutgoingTransaction memory otx) internal {
    outgoingTransactions[block.number].push(OTL.toBytes(otx));
    uint256 len = outgoingTransactions[block.number].length;
    bytes[] memory leaves = new bytes[](len);
    for (uint256 i = 0; i < len; i++) leaves[i] = outgoingTransactions[block.number][i];
    bytes32 root = getMerkleRoot(leaves);
    assembly { sstore(number(), root) }
    emit OutgoingTransactionQueued(otx);
  }

  function queueParentCall(address payable _to, uint256 _gas, bytes memory data, uint256 bounty)
  public payable {
    require(msg.value >= bounty, "Insufficient value for given bounty.");
    require(data.length <= 2048, "Transaction data too large: maximum 2kb");
    /* Bounty subtracted from msg.value */
    OTL.OutgoingTransaction memory otx = OTL.OutgoingTransaction(
      msg.sender,
      _to,
      _gas,
      msg.value - bounty,
      data,
      bounty
    );
    _putOutgoing(otx);
  }

  /* Temporary way to make the relay more accessible during Alpha builds */
  function queueParentCall(address payable _to, uint256 _gas, bytes memory data) public payable {
    queueParentCall(_to, _gas, data, uint256(0));
  }

  function getMerkleRoot(bytes[] memory leaves)
  internal pure returns(bytes32 root) {
    if (leaves.length == 0) return bytes32(0);
    uint256 nextLevelLength = leaves.length;
    uint256 currentLevel = 0;
    bytes32[] memory nodes = new bytes32[](nextLevelLength + 1); // Add one in case we have an odd number of leaves
    // Generate the leaves
    for (uint256 i = 0; i < leaves.length; i++) nodes[i] = keccak256(leaves[i]);
    if (leaves.length == 1) return nodes[0];
    // Add a defaultNode if we've got an odd number of leaves
    if (nextLevelLength % 2 == 1) {
      nodes[nextLevelLength] = bytes32(0);
      nextLevelLength += 1;
    }

    // Now generate each level
    while (nextLevelLength > 1) {
      currentLevel += 1;
      // Calculate the nodes for the currentLevel
      for (uint256 i = 0; i < nextLevelLength / 2; i++) {
        nodes[i] = getParent(nodes[i*2], nodes[i*2 + 1]);
      }
      nextLevelLength = nextLevelLength / 2;
      // Check if we will need to add an extra node
      if (nextLevelLength % 2 == 1 && nextLevelLength != 1) {
        nodes[nextLevelLength] = bytes32(0);
        nextLevelLength += 1;
      }
    }
    return nodes[0];
  }

  /**
   * @notice Get the parent of two children nodes in the tree
   * @param _left The left child
   * @param _right The right child
   * @return The parent node
   */
  function getParent(bytes32 _left, bytes32 _right)
  internal pure returns(bytes32) {
    return keccak256(abi.encodePacked(_left, _right));
  }
}