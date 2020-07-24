pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./DefaultHashes.sol";

/*
 * Merkle Tree Utilities for Rollup
 */
contract SparseMerkleTree {
  /* Structs */

  /* Fields */
  // The address of the default hash storage.
  address public defaultHashStorage;

  // A tree which is used in `update()` and `store()`
  /**
   * @notice Initialize a new SparseMerkleUtils contract, computing the default hashes
   * for the sparse merkle tree (SMT) and saving them as a contract.
   */
  constructor() public {
    defaultHashStorage = address(new DefaultHashes());
  }

  /* Methods */
  function _getDefaultHashes(uint256 height)
  internal view returns (bytes32[] memory defaultHashes) {
    defaultHashes = new bytes32[](height);
    assembly {
      extcodecopy(
        sload(defaultHashStorage_slot),
        add(defaultHashes, 0x20),
        0,
        mul(height, 0x20)
      )
    }
  }

  function getDefaultHashes()
  public view returns (bytes32[256] memory defaultHashes) {
    assembly {
      extcodecopy(
        sload(defaultHashStorage_slot),
        defaultHashes,
        0,
        mul(256, 0x20)
      )
    }
  }

  /**
   * @notice Get the sparse merkle root computed from some set of data blocks.
   * @param _dataBlocks The data being used to generate the tree.
   * @return the sparse merkle tree root
   */
  function getMerkleRoot(bytes[] calldata _dataBlocks)
  external view returns (bytes32) {
    uint256 nextLevelLength = _dataBlocks.length;
    uint256 currentLevel = 0;
    bytes32[] memory nodes = new bytes32[](nextLevelLength + 1); // Add one in case we have an odd number of leaves
    bytes32[] memory defaultHashes = _getDefaultHashes(nextLevelLength + 1);
    // Generate the leaves
    for (uint256 i = 0; i < _dataBlocks.length; i++) {
      nodes[i] = keccak256(_dataBlocks[i]);
    }

    if (_dataBlocks.length == 1) {
      return nodes[0];
    }

    // Add a defaultNode if we've got an odd number of leaves
    if (nextLevelLength % 2 == 1) {
      nodes[nextLevelLength] = defaultHashes[currentLevel];
      nextLevelLength += 1;
    }

    // Now generate each level
    while (nextLevelLength > 1) {
      currentLevel += 1;
      // Calculate the nodes for the currentLevel
      for (uint256 i = 0; i < nextLevelLength / 2; i++) {
        nodes[i] = getParent(nodes[i * 2], nodes[i * 2 + 1]);
      }
      nextLevelLength = nextLevelLength / 2;
      // Check if we will need to add an extra node
      if (nextLevelLength % 2 == 1 && nextLevelLength != 1) {
        nodes[nextLevelLength] = defaultHashes[currentLevel];
        nextLevelLength += 1;
      }
    }

    // Alright! We should be left with a single node! Return it...
    return nodes[0];
  }

  /**
   * @dev Verify an inclusion proof for a sparse merkle tree, where some of the
   * siblings are not included because they are default nodes, and simultaneously
   * calculate the root using an alternative leaf node.
   * @param _root The root of the tree we are verifying inclusion for.
   * @param _proveData The data block we're verifying inclusion for.
   * @param _setData The data block we're replacing _proveData with.
   * @param _path The path from the leaf to the root.
   * @param _siblings The sibling nodes along the way.
   * @return _valid Boolean stating whether the proof was valid.
   * @return _updatedRoot Merkle root with _proveData set to _setData.
   */
  function verifyAndUpdate(
    bytes32 _root,
    bytes memory _proveData,
    bytes memory _setData,
    uint256 _path,
    bytes32[] memory _siblings
  ) public pure returns (bool _valid, bytes32 _updatedRoot) {
    // First compute the leaf node
    _updatedRoot = keccak256(_setData);
    bytes32 computedNode = keccak256(_proveData);

    bytes memory hashBuffer = new bytes(64);
    assembly {
      let h1Ptr := add(hashBuffer, 32)
      let h2Ptr := add(hashBuffer, 64)
      // let defPtr := add(defaultHashes, 32)
      let siblingPtr := add(_siblings, 32)
      let max := mload(_siblings)
      // let siblingIndex := 0
      for { let i := 0 } lt(i, max) { i := add(i, 1) } {
        let _sibling := mload(siblingPtr)
        siblingPtr := add(siblingPtr, 32)
        switch iszero(and(shr(i, _path), 1))
          case true {
            mstore(h1Ptr, computedNode)
            mstore(h2Ptr, _sibling)
            computedNode := keccak256(h1Ptr, 64)
            mstore(h1Ptr, _updatedRoot)
            _updatedRoot := keccak256(h1Ptr, 64)
          } default {
            mstore(h1Ptr, _sibling)
            mstore(h2Ptr, computedNode)
            computedNode := keccak256(h1Ptr, 64)
            mstore(h2Ptr, _updatedRoot)
            _updatedRoot := keccak256(h1Ptr, 64)
          }
      }
    }
    // Check if the computed node (_root) is equal to the provided root
    _valid = computedNode == _root;
  }

  /**
   * @dev Verify an inclusion proof for a sparse merkle tree, where some of the
   * siblings are not included because they are default nodes, and simultaneously
   * calculate the root using an alternative leaf node.
   * @param _root The root of the tree we are verifying inclusion for.
   * @param _height The height of the tree the proof is for.
   * @param _inclusionBits Bit field indicating which siblings are included as siblings.
   * @param _proveData The data block we're verifying inclusion for.
   * @param _setData The data block we're replacing _proveData with.
   * @param _path The path from the leaf to the root.
   * @param _siblings The sibling nodes along the way.
   * @return _valid Boolean stating whether the proof was valid.
   * @return _updatedRoot Merkle root with _proveData set to _setData.
   */
  function verifyAndUpdateSparse(
    bytes32 _root,
    uint256 _height,
    uint256 _inclusionBits,
    bytes memory _proveData,
    bytes memory _setData,
    uint256 _path,
    bytes32[] memory _siblings
  ) public view returns (bool _valid, bytes32 _updatedRoot) {
    bytes32[] memory defaultHashes = _getDefaultHashes(_height);
    // First compute the leaf node
    _updatedRoot = keccak256(_setData);
    bytes32 computedNode = keccak256(_proveData);
    bytes memory hashBuffer = new bytes(64);
    assembly {
      let h1Ptr := add(hashBuffer, 32)
      let h2Ptr := add(hashBuffer, 64)
      let siblingPtr := add(_siblings, 32)
      /*
        Using sub(height, 1) instead of setting a pointer because of the solc stack limit
      */
      for { let i := 0 } lt(i, sub(_height, 1)) { i := add(i, 1) } {
        let _sibling := 0
        switch iszero(and(shr(add(i, 1), _inclusionBits), 1))
          case true {
            _sibling := mload(add(defaultHashes, mul(32, add(i, 1))))
          }
          default {
            _sibling := mload(siblingPtr)
            siblingPtr := add(siblingPtr, 32)
          }
        switch iszero(and(shr(i, _path), 1))
          case true {
            mstore(h1Ptr, computedNode)
            mstore(h2Ptr, _sibling)
            computedNode := keccak256(h1Ptr, 64)
            mstore(h1Ptr, _updatedRoot)
            _updatedRoot := keccak256(h1Ptr, 64)
          } default {
            mstore(h1Ptr, _sibling)
            mstore(h2Ptr, computedNode)
            computedNode := keccak256(h1Ptr, 64)
            mstore(h2Ptr, _updatedRoot)
            _updatedRoot := keccak256(h1Ptr, 64)
          }
      }
    }
    // Check if the computed node (_root) is equal to the provided root
    _valid = computedNode == _root;
  }

  /**
   * @dev Verify an inclusion proof for a sparse merkle tree, where some of the
   * siblings are not included because they are default nodes.
   * @param _root The root of the tree we are verifying inclusion for.
   * @param _height The height of the tree the proof is for.
   * @param _inclusionBits Bit field indicating which siblings are included as siblings.
   * @param _leaf The data block we're verifying inclusion for.
   * @param _path The path from the leaf to the root.
   * @param _siblings The sibling nodes along the way.
   * @return The next level of the tree
   */
  function verifySparse(
    bytes32 _root,
    uint256 _height,
    uint256 _inclusionBits,
    bytes memory _leaf,
    uint256 _path,
    bytes32[] memory _siblings
  ) public view returns (bool) {
    bytes32[] memory defaultHashes = _getDefaultHashes(_height);
    // First compute the leaf node
    bytes32 computedNode = keccak256(_leaf);
    bytes memory hashBuffer = new bytes(64);
    assembly {
      let h1Ptr := add(hashBuffer, 32)
      let h2Ptr := add(hashBuffer, 64)
      let defPtr := add(defaultHashes, 32)
      let siblingPtr := add(_siblings, 32)
      let max := sub(_height, 1)
      // let siblingIndex := 0
      for { let i := 0 } lt(i, max) { i := add(i, 1) } {
        // let isRight := and(shr(i, _path), 1)
        // let isDefault := and(shr(add(i, 1), _inclusionBits), 1)
        let _sibling := 0
        switch iszero(and(shr(add(i, 1), _inclusionBits), 1))
          case true { _sibling := mload(add(defPtr, mul(32, i))) }
          default {
            _sibling := mload(siblingPtr)
            siblingPtr := add(siblingPtr, 32)
          }
        switch iszero(and(shr(i, _path), 1))
          case true {
            mstore(h1Ptr, computedNode)
            mstore(h2Ptr, _sibling)
          }
          default {
            mstore(h1Ptr, _sibling)
            mstore(h2Ptr, computedNode)
          }
        computedNode := keccak256(h1Ptr, 64)
      }
    }
    return computedNode == _root;
  }

  /**
   * @notice Verify an inclusion proof.
   * @param _root The root of the tree we are verifying inclusion for.
   * @param _dataBlock The data block we're verifying inclusion for.
   * @param _path The path from the leaf to the root.
   * @param _siblings The sibling nodes along the way.
   * @return The next level of the tree
   */
  function verify(
    bytes32 _root,
    bytes memory _dataBlock,
    uint256 _path,
    bytes32[] memory _siblings
  ) public pure returns (bool) {
    // bytes32[] memory defaultHashes = _getDefaultHashes(_height);
    // First compute the leaf node
    bytes32 computedNode = keccak256(_dataBlock);
    bytes memory hashBuffer = new bytes(64);
    assembly {
      let h1Ptr := add(hashBuffer, 32)
      let h2Ptr := add(hashBuffer, 64)
      // let defPtr := add(defaultHashes, 32)
      let siblingPtr := add(_siblings, 32)
      let max := mload(_siblings)
      // let siblingIndex := 0
      for { let i := 0 } lt(i, max) { i := add(i, 1) } {
        let _sibling := mload(siblingPtr)
        siblingPtr := add(siblingPtr, 32)
        switch iszero(and(shr(i, _path), 1))
          case true {
            mstore(h1Ptr, computedNode)
            mstore(h2Ptr, _sibling)
          } default {
            mstore(h1Ptr, _sibling)
            mstore(h2Ptr, computedNode)
          }
        computedNode := keccak256(h1Ptr, 64)
      }
    }
    return computedNode == _root;
  }

  /*********************
   * Utility Functions *
   ********************/

  /**
   * @notice Get the parent of two children nodes in the tree
   * @param _left The left child
   * @param _right The right child
   * @return The parent node
   */
  function getParent(bytes32 _left, bytes32 _right)
  internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(_left, _right));
  }

  /**
   * @notice get the n'th bit in a uint.
   *         For instance, if exampleUint=binary(11), getNth(exampleUint, 0) == 1, getNth(2, 1) == 1
   * @param _intVal The uint we are extracting a bit out of
   * @param _index The index of the bit we want to extract
   * @return The bit (1 or 0) in a uint8
   */
  function getNthBitFromRight(uint256 _intVal, uint256 _index)
  public pure returns (uint8) {
    return uint8((_intVal >> _index) & 1);
  }
}
