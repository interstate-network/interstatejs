pragma solidity ^0.6.0;

interface IByteCounter {
  function countBytes(bytes calldata data) external view returns (uint256 zeroBytes, uint256 nonZeroBytes);
}