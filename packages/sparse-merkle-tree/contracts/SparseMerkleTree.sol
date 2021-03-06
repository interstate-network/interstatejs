pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./DefaultHashes.sol";

/*
 * Merkle Tree Utilities for Rollup
 */
contract SparseMerkleTree {
  /* Structs */
  // A partial merkle tree which can be updated with new nodes, recomputing the root
  struct SparseMerkleTree {
    // The root
    bytes32 root;
    uint256 height;
    mapping(bytes32 => bytes32) nodes;
  }

  /* Fields */
  // The address of the default hash storage.
  address public defaultHashStorage;

  // A tree which is used in `update()` and `store()`
  SparseMerkleTree public tree;

  /**
   * @notice Initialize a new SparseMerkleUtils contract, computing the default hashes
   * for the sparse merkle tree (SMT) and saving them as a contract.
   */
  constructor() public {
    defaultHashStorage = address(new DefaultHashes());
  }

  /* Methods */
  function _getDefaultHashes()
  internal view returns (bytes32[256] memory defaultHashes) {
    assembly {
      extcodecopy(
        sload(defaultHashStorage_slot),
        defaultHashes,
        0,
        mul(256, 0x20)
      )
    }
  }
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

  /**
   * @notice Update the stored tree / root with a particular dataBlock at some path (no siblings needed)
   * @param _dataBlock The data block we're storing/verifying
   * @param _path The path from the leaf to the root / the index of the leaf.
   */
  function update(bytes memory _dataBlock, uint256 _path) public {
    bytes32[] memory siblings = getSiblings(_path);
    store(_dataBlock, _path, siblings);
  }

  /**
   * @notice Update the stored tree / root with a particular leaf hash at some path (no siblings needed)
   * @param _leaf The leaf we're storing/verifying
   * @param _path The path from the leaf to the root / the index of the leaf.
   */
  function updateLeaf(bytes32 _leaf, uint256 _path) public {
    bytes32[] memory siblings = getSiblings(_path);
    storeLeaf(_leaf, _path, siblings);
  }

  /**
   * @notice Store a particular merkle proof & verify that the root did not change.
   * @param _dataBlock The data block we're storing/verifying
   * @param _path The path from the leaf to the root / the index of the leaf.
   * @param _siblings The sibling nodes along the way.
   */
  function verifyAndStore(
    bytes memory _dataBlock,
    uint256 _path,
    bytes32[] memory _siblings
  ) public {
    bytes32 oldRoot = tree.root;
    store(_dataBlock, _path, _siblings);
    require(
      tree.root == oldRoot,
      "Failed same root verification check! This was an inclusion proof for a different tree!"
    );
  }

  /**
   * @notice Store a particular dataBlock & its intermediate nodes in the tree
   * @param _dataBlock The data block we're storing.
   * @param _path The path from the leaf to the root / the index of the leaf.
   * @param _siblings The sibling nodes along the way.
   */
  function store(
    bytes memory _dataBlock,
    uint256 _path,
    bytes32[] memory _siblings
  ) public {
    // Compute the leaf node & store the leaf
    bytes32 leaf = keccak256(_dataBlock);
    storeLeaf(leaf, _path, _siblings);
  }

  /**
   * @notice Store a particular leaf hash & its intermediate nodes in the tree
   * @param _leaf The leaf we're storing.
   * @param _path The path from the leaf to the root / the index of the leaf.
   * @param _siblings The sibling nodes along the way.
   */
  function storeLeaf(
    bytes32 _leaf,
    uint256 _path,
    bytes32[] memory _siblings
  ) public {
    // First compute the leaf node
    bytes32 computedNode = _leaf;
    for (uint256 i = 0; i < _siblings.length; i++) {
      bytes32 parent;
      bytes32 sibling = _siblings[i];
      uint8 isComputedRightSibling = getNthBitFromRight(_path, i);
      if (isComputedRightSibling == 0) {
        parent = getParent(computedNode, sibling);
        // Store the node!
        storeNode(parent, computedNode, sibling);
      } else {
        parent = getParent(sibling, computedNode);
        // Store the node!
        storeNode(parent, sibling, computedNode);
      }
      computedNode = parent;
    }
    // Store the new root
    tree.root = computedNode;
  }

  /**
   * @notice Get siblings for a leaf at a particular index of the tree.
   *         This is used for updates which don't include sibling nodes.
   * @param _path The path from the leaf to the root / the index of the leaf.
   * @return The sibling nodes along the way.
   */
  function getSiblings(uint256 _path) public view returns (bytes32[] memory) {
    bytes32[] memory siblings = new bytes32[](tree.height);
    bytes32 computedNode = tree.root;
    for (uint256 i = tree.height; i > 0; i--) {
      uint256 siblingIndex = i - 1;
      (bytes32 leftChild, bytes32 rightChild) = getChildren(computedNode);
      if (getNthBitFromRight(_path, siblingIndex) == 0) {
        computedNode = leftChild;
        siblings[siblingIndex] = rightChild;
      } else {
        computedNode = rightChild;
        siblings[siblingIndex] = leftChild;
      }
    }
    // Now store everything
    return siblings;
  }

  /*********************
   * Utility Functions *
   ********************/
  /**
   * @notice Get our stored tree's root
   * @return The merkle root of the tree
   */
  function getRoot() public view returns (bytes32) {
    return tree.root;
  }

  /**
   * @notice Set the tree root and height of the stored tree
   * @param _root The merkle root of the tree
   * @param _height The height of the tree
   */
  function setMerkleRootAndHeight(bytes32 _root, uint256 _height) public {
    tree.root = _root;
    tree.height = _height;
  }

  /**
   * @notice Store node in the (in-storage) sparse merkle tree
   * @param _parent The parent node
   * @param _leftChild The left child of the parent in the tree
   * @param _rightChild The right child of the parent in the tree
   */
  function storeNode(
    bytes32 _parent,
    bytes32 _leftChild,
    bytes32 _rightChild
  ) public {
    tree.nodes[getLeftSiblingKey(_parent)] = _leftChild;
    tree.nodes[getRightSiblingKey(_parent)] = _rightChild;
  }

  /**
   * @notice Get the parent of two children nodes in the tree
   * @param _left The left child
   * @param _right The right child
   * @return The parent node
   */
  function getParent(bytes32 _left, bytes32 _right)
    internal
    pure
    returns (bytes32)
  {
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
    public
    pure
    returns (uint8)
  {
    return uint8((_intVal >> _index) & 1);
  }

  /**
   * @notice Get the children of some parent in the tree
   * @param _parent The parent node
   * @return (rightChild, leftChild) -- the two children of the parent
   */
  function getChildren(bytes32 _parent) public view returns (bytes32, bytes32) {
    return (
      tree.nodes[getLeftSiblingKey(_parent)],
      tree.nodes[getRightSiblingKey(_parent)]
    );
  }

  /**
     * @notice Get the right sibling key. Note that these keys overwrite the first bit of the hash
               to signify if it is on the right side of the parent or on the left
     * @param _parent The parent node
     * @return the key for the left sibling (0 as the first bit)
     */
  function getLeftSiblingKey(bytes32 _parent) public pure returns (bytes32) {
    return
      _parent &
      0x0111111111111111111111111111111111111111111111111111111111111111;
  }

  /**
     * @notice Get the right sibling key. Note that these keys overwrite the first bit of the hash
               to signify if it is on the right side of the parent or on the left
     * @param _parent The parent node
     * @return the key for the right sibling (1 as the first bit)
     */
  function getRightSiblingKey(bytes32 _parent) public pure returns (bytes32) {
    return
      _parent |
      0x1000000000000000000000000000000000000000000000000000000000000000;
  }
}
