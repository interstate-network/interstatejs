pragma solidity ^0.6.0;

/**
 * @title TestProxyReceiver
 * @dev Only accepts receipt when sender is a specific address.
 */
contract TestProxyReceiver {
  address private allowedSender;
  bool public received;

  constructor(address _allowOnly) public {
    allowedSender = _allowOnly;
  }

  function hasReceived() external view returns (bool) {
    return received;
  }

  function reset() external {
    received = false;
  }

  function receiveCall() external {
    require(msg.sender == allowedSender, "Bad sender!");
    received = true;
  }
}