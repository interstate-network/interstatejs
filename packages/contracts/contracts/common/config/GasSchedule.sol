pragma solidity ^0.6.0;
import "./byte-counter/IByteCounter.sol";

library GasSchedule {
  uint256 constant G_transaction = 21000; // Paid for every transaction.
  uint256 constant G_newaccount = 25000;  // Paid for a CALL that creates an account
  uint256 constant G_rollupbyte = 25;     // Paid per byte in the rollup data for a transaction.
  uint256 constant G_itxcreate = 32000;   // Paid for a contract-creating incoming transaction.
  uint256 constant G_codedeposit = 100;   // Paid per byte for code deployed to the sidechain.
  uint256 constant G_itxbyte = 5;         // Paid per byte for data in an incoming transaction.
  uint256 constant C_txdatazero = 4;      // Paid per zero byte in transaction calldata.
  uint256 constant C_txdatanonzero = 16;  // Paid per non-zero byte in transaction calldata.

  function C_data(IByteCounter byteCounter, bytes memory data) internal view returns (uint256 _c) {
    (uint256 zeroCount, uint256 nonZeroCount) = byteCounter.countBytes(data);
    return (C_txdatazero * zeroCount) + (C_txdatanonzero * nonZeroCount);
  }

  function C_rollup(uint256 byteLen) internal pure returns (uint256 _c) {
    _c = G_rollupbyte * byteLen;
  }

  function C_tx(IByteCounter byteCounter, bytes memory data) internal view returns (uint256 _c) {
    _c = G_transaction + C_data(byteCounter, data);
  }

  /**
   * @dev C_deposit
   * @notice Paid when a deposit is made on the parent chain.
   * @notice G_depositbyte is paid to account for the cost of the node querying data from the parent chain.
   * @notice G_rollupbyte accounts for the cost of actually deploying the transaction to the parent chain.
   * There are 64 rollup bytes for a deposit - 16 for block number, 16 for index in the relay transactions, 32 for stateRoot
  */
  function C_deposit(uint256 byteLen) internal pure returns (uint256 _c) {
    _c = G_transaction + (G_itxbyte * byteLen) + C_rollup(64);
  }

  function C_create(uint256 codeLen) internal pure returns (uint256 _c) {
    _c = G_itxcreate + (G_codedeposit * codeLen) + C_rollup(64);
  }

  // function C_base()
}