pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;
import { CommitmentHeaderLib as CL } from "./CommitmentHeaderLib.sol";
import { MerkleProofLib as MerkleProof } from "../rollup/MerkleProofLib.sol";

library ISO_HeaderLib {
  /* Full header of an ISO block */
  struct ISO_Header {
    bytes32 parentHash;
    uint256 number;
    uint256 incomingTransactionsIndex;
    uint256 incomingTransactionsCount;
    uint256 transactionsCount;
    bytes32 transactionsRoot;
    bytes32 stateRoot;
    bytes32 exitsRoot;
    address coinbase;
    uint256 timestamp;
  }

  /**
   * @dev blockHash
   * @notice Hashes a block header.
   * @param header block header to hash
   * @return _hash hash of the packed form of the ABI encoded header
   */
  function blockHash(ISO_Header memory header)
  internal pure returns (bytes32 _hash) {
    _hash = keccak256(abi.encode(header));
  }

  function fromBytes(bytes memory _encoded) internal pure returns (ISO_Header memory _decoded) {
    _decoded = abi.decode((_encoded),  (ISO_Header));
  }

  /**
   * @dev toCommitment
   * @notice Converts a header to a commitment header. These contain the majority of data that will typically be
   * accessed as well as the blockhash. This is used to reduce the amount of calldata that must be submitted to verify
   * that some data existed in a block.
   * @param header Full block header
   * @return commitment Committment header
  */
  function toCommitment(ISO_Header memory header)
  internal view returns (CL.CommitmentHeader memory commitment) {
    commitment = CL.CommitmentHeader(
      block.number,
      header.exitsRoot,
      header.coinbase,
      blockHash(header)
    );
  }

  function matchesCommitment(ISO_Header memory header, CL.CommitmentHeader memory commitment)
  internal pure returns (bool _match) {
    _match = blockHash(header) == commitment.blockHash;
  }

  /**
   * @dev commitmentHash
   * @notice Creates the equivalent of a commitment header hash without the memory overhead of making a second struct.
   * @param header A full block header.
   * @return _commitmentHash Hash of the commitment form of the header.
  */
  function commitmentHash(ISO_Header memory header)
  internal view returns (bytes32 _commitmentHash) {
    _commitmentHash = keccak256(abi.encode(
      block.number,
      header.exitsRoot,
      header.coinbase,
      blockHash(header)
    ));
  }

  /**
   * @dev hasTransaction
   * @notice Checks if a header's transactions tree contained the given transaction
   *  by verifying a provided merkle proof.
   * @param header Header to check for the transaction.
   * @param transaction Encoded transaction.
   * @param index Index the transaction should be at
   * @param siblings Merkle siblings for the transaction
   * @return _hasTransaction True if the provided merkle proof is valid (i.e. the transaction existed in the transactionsRoot)
   */
  function hasTransaction(ISO_Header memory header, bytes memory transaction, uint256 index, bytes32[] memory siblings)
  internal pure returns (bool _hasTransaction) {
    _hasTransaction = MerkleProof.verify(header.transactionsRoot, transaction, index, siblings);
  }

  /**
   * @dev matchesParentBlock
   * @notice Checks if a block header is consistent with being the child of another block.
   * Used as a basic integrity check on block submission.
   * @param _header The full header of the block which we are evaluating as the child.
   * @param _parent The commitment form of the block header which we are evaluating as the parent.
   * @return _follows True if the second header's parentHash, number and parentChainNumber are consistent
   * with being the child of the first block header.
  */
  function matchesParentBlock(ISO_Header memory _header, ISO_Header memory _parent)
  internal pure returns (bool _follows) {
    _follows = (
      _header.number == _parent.number + 1 &&
      _header.parentHash == blockHash(_parent)
    );
  }
}