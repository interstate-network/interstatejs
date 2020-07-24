pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;


library CommitmentHeaderLib {
  /**
   * @dev CommitmentHeaderQuery
   * @notice Used to show that a commitment header exists in the `pendingBlocks` mapping.
  */
  struct CommitmentHeaderQuery {
    bytes32 parentHash;
    uint256 childIndex;
    uint256 blockNumber;
    CommitmentHeader commitment;
  }

  /**
   * @dev CommitmentHeader
   * @notice The purpose of this struct is to ensure that for common operations,
   * where fraud is not being proven and challenges are not made, gas costs are low.
   * Parent hash is not needed since we can prove bad parent hashes with fraud proofs.
   */
  struct CommitmentHeader {
    uint256 submittedAt;
    bytes32 exitsRoot;
    address coinbase;
    bytes32 blockHash;
  }

  /**
   * @dev commitmentHash
   * @notice Hashes a commitment header.
   * @param commitment - commitment header
   * @return _commitmentHash - hash of the commitment header
   */
  function commitmentHash(CommitmentHeader memory commitment)
  internal pure returns (bytes32 _commitmentHash) {
    _commitmentHash = keccak256(abi.encode(commitment));
  }
}