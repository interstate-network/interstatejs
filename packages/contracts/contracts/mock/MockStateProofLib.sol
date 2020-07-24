pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { RLPAccountLib as Account } from "../utils/type-encoders/RLPAccountLib.sol";
import { SparseMerkleTree as SparseLib } from "../common/rollup/SparseMerkleTree.sol";
import "../fraud-proofs/lib/StateProofLib.sol";
import "../fraud-proofs/lib/ExitProofLib.sol";
import { MessageWitnessLib as Witness } from "../common/witness/MessageWitnessLib.sol";

contract MockStateProofLib {
  SparseLib sparse;
  constructor() public {
    sparse = new SparseLib();
  }

  function updateExitsTree(
    bytes memory oldRootBytes,
    bytes memory leafProofBytes,
    bytes memory transactionData
  ) public view returns (bytes memory newRootNode) {
    return ExitProofLib.updateExitsTree(
      sparse,
      oldRootBytes,
      leafProofBytes,
      transactionData
    );
  }

  /* function updateStorageTree(
    uint256 height,
    bytes memory accountBytes,
    bytes memory storageProofBytes,
    bytes memory newRootNode
  ) internal view {
    return ExitProofLib.updateExitsTree(
      sparse,
      oldRootBytes,
      leafProofBytes,
      transactionData
    );
  } */

  function updateExitsRoot(
    bytes32 stateRoot,
    address exitsAddress,
    uint256 height,
    bytes memory stateProofBytes,
    bytes memory storageProofBytes,
    bytes memory leafProofBytes,
    bytes memory transactionData
  ) public view returns (bytes32 newStateRoot) {
    return ExitProofLib.updateExitsRoot(
      sparse,
      stateRoot,
      height,
      stateProofBytes,
      storageProofBytes,
      leafProofBytes,
      transactionData
    );
  }

  function getLastState(bytes memory witnessBytes, uint256 recordIndex)
  public pure returns (bytes32 stateRoot) {
    Witness.MessageWitness memory witness = Witness.fromBytes(witnessBytes);
    return Witness.getLastState(witness, recordIndex);
  }


  function proveAccountInState(
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes
  ) public view returns (Account.Account memory account) {
    return StateProofLib.proveAccountInState(
      sparse,
      stateRoot,
      accountAddress,
      proofBytes
    );
  }

  function subtractBalanceAndIncrementNonce(
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes,
    uint256 amount
  ) public view returns (bytes32) {
    return StateProofLib.subtractBalanceAndIncrementNonce(
      sparse,
      stateRoot,
      accountAddress,
      proofBytes,
      amount
    );
  }

  function increaseBalance(
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes,
    uint256 amount
  ) public view returns (bytes32 updatedRoot, Account.Account memory account) {
    return StateProofLib.increaseBalance(
      sparse,
      stateRoot,
      accountAddress,
      proofBytes,
      amount
    );
  }

  function proveAndUpdateAccountStorage(
    bytes32 stateRoot,
    address accountAddress,
    bytes32 slot,
    bytes32 newValue,
    bytes memory accountProofBytes,
    bytes memory storageProofBytes
  ) public view returns (bytes32 oldValue, bytes32 newStateRoot) {
    return StateProofLib.proveAndUpdateAccountStorage(
      sparse,
      stateRoot,
      accountAddress,
      slot,
      newValue,
      accountProofBytes,
      storageProofBytes
    );
  }

  function setAccountCodeHash(
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes,
    bytes32 codeHash
  ) public view returns (bytes32 newRoot) {
    return StateProofLib.setAccountCodeHash(
      sparse,
      stateRoot,
      accountAddress,
      proofBytes,
      codeHash
    );
  }
}