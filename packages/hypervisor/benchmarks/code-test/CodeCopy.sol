pragma solidity ^0.6.0;

contract CodeCopy {
  bytes32 testBoy;
  bytes thuhCode;
  function checkShitYo() external returns (uint8) {
    bytes memory data = new bytes(50);
    assembly {
      codecopy(add(data, 0x20), 0, 50)
    }
    thuhCode = data;
    testBoy = keccak256(data);
    return 55;
  }
}