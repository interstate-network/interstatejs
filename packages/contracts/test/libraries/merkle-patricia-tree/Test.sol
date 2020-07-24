pragma solidity ^0.6.0;

import "../../../contracts/utils/MPT.sol";
import "../../../contracts/utils/TraversalRecordLib.sol";

contract Test {
  using MPT for *;
  using TraversalRecordLib for *;
  constructor(bytes32 root, bytes memory key, bytes memory proof, bytes memory newValue) public {
    if (proof.length == 0) assembly {
      return(0x0, 0x20)
    }
    (bool success, TraversalRecordLib.TraversalRecord memory record) = MPT.verifyProof(root, key, proof);
    require(success);
    bytes memory retval = new bytes(0x20);
    bytes32 newRoot = record.updateRoot(newValue);
    assembly {
      mstore(add(retval, 0x20), newRoot)
      return(add(retval, 0x20), mload(retval))
    }
  }
}
