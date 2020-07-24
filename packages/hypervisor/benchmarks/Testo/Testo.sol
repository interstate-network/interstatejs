pragma solidity ^0.6.0;

contract Testo {
  CallBoy callBoy;
  uint256 response;
  constructor() public {
    callBoy = new CallBoy();
  }
  function callOtherGuy() external returns(uint256) {
    // return 500000 * gasleft();
    // response = callBoy.sendResponse();
    return callBoy.sendResponse();
  }
}

contract CallBoy {
  function sendResponse() external returns(uint256 data) {
    return 5000 * 2000;
  }
}