pragma solidity ^0.6.0;

abstract contract IContractProxy {
  function executeOutgoingTransaction(address payable to, uint256 sendGas, bytes memory data) public payable virtual;
}