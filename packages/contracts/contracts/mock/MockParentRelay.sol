pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "../relay/ParentRelay.sol";
import { MerkleTreeLib as MerkleTree } from "../common/rollup/MerkleTreeLib.sol";
import { OutgoingTransactionLib as OTL } from "../common/transactions/OutgoingTransactionLib.sol";

contract MockParentRelay is ParentRelay {

  function putOutgoingTransaction(uint256 blockNumber, OTL.OutgoingTransaction memory otx) public {
    bytes memory exit = OTL.toBytes(otx);
    bytes[] memory exits = new bytes[](1);
    exits[0] = exit;
    bytes32 exitsRoot = MerkleTree.getMerkleRoot(exits);
    confirmedExitRoots[blockNumber].exitsRoot = exitsRoot;
  }

  function encodeOutgoing(OTL.OutgoingTransaction memory otx) public pure returns (bytes memory) {
    return OTL.toBytes(otx);
  }

  function callThroughProxy(address payable proxy, address payable _to, uint256 _gas, bytes memory _data) public payable {
    IProxy(proxy).executeOutgoingTransaction{gas: gasleft(), value: msg.value}(_to, _gas, _data);
  }
}