pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { RelayTransactionLib as RTL } from "../common/transactions/RelayTransactionLib.sol";

abstract contract IParentRelay {
  /* Queries */
  function getTransactionHash(uint256 txIndex) external virtual view returns (bytes32 txHash);
  function getTransactionsCount() external virtual view returns(uint256 length);
  /* Actions */
  function putConfirmedBlock(uint256 blockNumber, bytes32 exitsRoot) external virtual;
  function forwardFromProxy(address from, uint256 sendGas, bytes memory data) public payable virtual;
  function addTransaction(address to, uint256 sendGas, bytes memory data) public payable virtual returns (uint256);
  function deployContract(address runtimeCode) public payable virtual returns (uint256, address);
  function executeOutgoingTransaction(
    RTL.RelayTransaction memory _tx,
    bytes32[] memory siblings,
    uint256 txIndex,
    uint256 blockNumber
  ) public payable virtual;
}