pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { RLPAccountLib as Account } from "../../utils/type-encoders/RLPAccountLib.sol";
import { SparseMerkleTree as SparseLib } from "../../common/rollup/SparseMerkleTree.sol";
import { StateProofLib as StateProof } from "./StateProofLib.sol";
import { ChainStateLib as State } from "../../common/ChainStateLib.sol";
import { ConfigLib as Config } from "../../common/config/ConfigLib.sol";


library ExitProofLib {
  bytes32 constant DEFAULT_ROOT_16 = 0x2def10d13dd169f550f578bda343d9717a138562e0093b380a1120789d53cf10;

  struct RootNode {
    bytes32 rootHash;
    uint256 length;
  }

  function encodeRootNode(bytes32 rootHash, uint256 length)
  internal pure returns (bytes memory) {
    return abi.encode(RootNode(rootHash, length));
  }

  function isEmpty(bytes memory data) internal pure returns (bool) {
    if (data.length == 0) return true;
    if (data.length == 32) {
      uint256 val;
      assembly { val := mload(add(data, 32)) }
      return val == 0;
    }
    return false;
  }

  function decodeRootNode(bytes memory data)
  internal pure returns (RootNode memory) {
    if (isEmpty(data)) return RootNode(DEFAULT_ROOT_16, 0);
    return abi.decode((data), (RootNode));
  }

  function updateExitsTree(
    SparseLib sparse,
    bytes memory oldRootBytes,
    bytes memory leafProofBytes,
    bytes memory transactionData
  ) internal view returns (bytes memory newRootNode) {
    StateProof.SparseMerkleProof memory leafProof
      = StateProof.decodeProof(leafProofBytes);
    RootNode memory root = decodeRootNode(oldRootBytes);
    (bool valid, bytes32 newRoot) = sparse.verifyAndUpdateSparse(
      root.rootHash,
      16,
      leafProof.inclusionBits,
      leafProof.value,
      transactionData,
      root.length,
      leafProof.siblings
    );
    require(valid, "Invalid exit leaf proof.");
    return encodeRootNode(newRoot, root.length + 1);
  }

  function updateStorageTree(
    SparseLib sparse,
    uint256 blockNumber,
    Account.Account memory account,
    StateProof.SparseMerkleProof memory storageProof,
    bytes memory newRootNode
  ) internal view {
    (bool valid, bytes32 updatedRoot) = sparse.verifyAndUpdateSparse(
      account.stateRoot,
      256,
      storageProof.inclusionBits,
      storageProof.value,
      newRootNode,
      uint256(keccak256(abi.encodePacked(blockNumber))),
      storageProof.siblings
    );
    require(valid, "Invalid storage proof");
    account.stateRoot = updatedRoot;
  }

  function proveExitsRoot(
    SparseLib sparse,
    bytes32 stateRoot,
    uint256 blockNumber,
    bytes memory stateProofBytes,
    bytes memory storageProofBytes
  ) internal view returns (bytes32 exitsRoot) {
    Account.Account memory account = StateProof.proveAccountInState(
      sparse,
      stateRoot,
      Config.childRelayAddress(),
      stateProofBytes
    );
    StateProof.SparseMerkleProof memory storageProof = StateProof.decodeProof(
      storageProofBytes
    );
    
    require(
      sparse.verifySparse(
        account.stateRoot,
        256,
        storageProof.inclusionBits,
        storageProof.value,
        uint256(keccak256(abi.encodePacked(blockNumber))),
        storageProof.siblings
      ),
      "Invalid storage proof"
    );
    return decodeRootNode(storageProof.value).rootHash;
  }

  /**
   * @dev Calculate the new state root after inserting a new exit transaction.
   * @param sparse Reference to the sparse merkle tree library
   * @param stateRoot Root hash of the previous global state
   * @param blockNumber Block number for the exits tree to update
   * @param stateProofBytes Encoded proof of the exit relay account in the global state
   * @param storageProofBytes Encoded proof of the root node in the contract storage
   * @param leafProofBytes Encoded proof of the leaf node to update in the 
   */
  function updateExitsRoot(
    SparseLib sparse,
    bytes32 stateRoot,
    uint256 blockNumber,
    bytes memory stateProofBytes,
    bytes memory storageProofBytes,
    bytes memory leafProofBytes,
    bytes memory transactionData
  ) internal view returns (bytes32 newStateRoot) {
    StateProof.SparseMerkleProof memory stateProof
      = StateProof.decodeProof(stateProofBytes);
    StateProof.SparseMerkleProof memory storageProof
      = StateProof.decodeProof(storageProofBytes);
    Account.Account memory account = Account.decodeAccount(stateProof.value);
    bytes memory newRootNode = updateExitsTree(
      sparse,
      storageProof.value,
      leafProofBytes,
      transactionData
    );
    updateStorageTree(sparse, blockNumber, account, storageProof, newRootNode);
    newStateRoot = StateProof.updateStateTree(
      sparse,
      stateRoot,
      Config.childRelayAddress(),
      account,
      stateProof
    );
  }
}