pragma solidity ^0.6.0;

interface IChildRelay {
  function withdraw() external payable;
  function withdrawWithBounty(uint256 bounty) external payable;
  function addTransaction(address to, bytes calldata data) external payable;
  function addTransactionWithBounty(
    address to,
    bytes calldata data,
    uint256 bounty
  ) external payable;
}