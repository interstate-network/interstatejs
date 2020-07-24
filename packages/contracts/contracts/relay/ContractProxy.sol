pragma solidity ^0.6.0;

import "./IParentRelay.sol";

contract ContractProxy {
  IParentRelay private parentRelay;

  constructor() public {
    parentRelay = IParentRelay(msg.sender);
  }

  function executeOutgoingTransaction(address payable to, uint256 sendGas, bytes memory data) public payable {
    // TODO - replace with switch on caller, proxy should have no external functions
    require(
      msg.sender == address(parentRelay),
      // gasleft() >= sendGas + 15000, // TODO - better method for ensuring sufficient gas is available
      "Caller not parent relay."
    );
    assembly {
      let success := call(/* gas() */sendGas, to, callvalue(), add(data, 0x20), mload(data), 0, 0)
      let ptr := mload(0x40)
      
      returndatacopy(ptr, 0, returndatasize())
      if iszero(success) { revert(ptr, returndatasize()) }
      return (ptr, returndatasize())
    }
  }

  fallback() external payable {
    parentRelay.forwardFromProxy{gas: gasleft(), value: msg.value}(msg.sender, gasleft(), msg.data);
  }

  receive() external payable {
    parentRelay.forwardFromProxy{gas: gasleft(), value: msg.value}(msg.sender, gasleft(), bytes(""));
  }
}