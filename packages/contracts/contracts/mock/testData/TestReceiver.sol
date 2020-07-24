pragma solidity ^0.6.0;

contract TestReceiver {
  bool private received;

  function hasReceived() public view returns (bool) {
    return received;
  }

  function receiveCall() public {
    received = true;
  }
}