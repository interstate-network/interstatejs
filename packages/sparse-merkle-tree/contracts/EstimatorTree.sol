pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./SparseMerkleTree.sol";

contract EstimatorTree is SparseMerkleTree {
  function estimateGetHashes(uint256 height) public {
    _getDefaultHashes(height);
  }
  function estimateVerifySparse(
    bytes32 _root,
    uint256 _height,
    uint256 _inclusionBits,
    bytes memory _leaf,
    uint256 _path,
    bytes32[] memory _siblings
  ) public {
    require(
      verifySparse(_root, _height, _inclusionBits, _leaf, _path, _siblings),
      "Verification failed."
    );
  }
  function estimateVerify(
    bytes32 _root,
    bytes memory _leaf,
    uint256 _path,
    bytes32[] memory _siblings
  ) public {
    require(
      verify(_root, _leaf, _path, _siblings),
      "Verification failed."
    );
  }

  function estimateVerifyAndUpdate(
    bytes32 _root,
    bytes memory _proveData,
    bytes memory _setData,
    uint256 _path,
    bytes32[] memory _siblings
  ) public {
    (bool isValid,) = verifyAndUpdate(
      _root,
      _proveData,
      _setData,
      _path,
      _siblings
    );
    require(isValid, "Verification failed.");
  }

  function estimateVerifyAndUpdateSparse(
    bytes32 _root,
    uint256 _height,
    uint256 _inclusionBits,
    bytes memory _proveData,
    bytes memory _setData,
    uint256 _path,
    bytes32[] memory _siblings
  ) public {
    (bool isValid,) = verifyAndUpdateSparse(
      _root,
      _height,
      _inclusionBits,
      _proveData,
      _setData,
      _path,
      _siblings
    );
    require(isValid, "Verification failed.");
  }
}