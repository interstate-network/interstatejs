pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { RLPAccountLib as Account } from "../../utils/type-encoders/RLPAccountLib.sol";
import { SparseMerkleTree as SparseLib } from "../../common/rollup/SparseMerkleTree.sol";
// import { ChainStateLib as State } from "../../common/ChainStateLib.sol";

library StateProofLib {
  using Account for bytes;
  using Account for Account.Account;

  struct SparseMerkleProof {
    uint256 inclusionBits;
    bytes value;
    bytes32[] siblings;
  }

  function decodeProof(bytes memory proof)
  internal pure returns (SparseMerkleProof memory) {
    return abi.decode((proof), (SparseMerkleProof));
  }

  function updateStateTree(
    SparseLib sparse,
    bytes32 stateRoot,
    address accountAddress,
    Account.Account memory updatedAccount,
    SparseMerkleProof memory proof
  ) internal view returns (bytes32) {
    (bool valid, bytes32 updatedRoot) = sparse.verifyAndUpdateSparse(
      stateRoot,
      160,
      proof.inclusionBits,
      proof.value,
      updatedAccount.encodeAccount(),
      uint256(accountAddress),
      proof.siblings
    );
    require(valid, "Invalid state proof.");
    return updatedRoot;
  }

  function proveAccountInState(
    SparseLib sparse,
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes
  ) internal view returns (Account.Account memory account) {
    SparseMerkleProof memory proof = decodeProof(proofBytes);
    require(
      sparse.verifySparse(
        stateRoot,
        160,
        proof.inclusionBits,
        proof.value,
        uint256(accountAddress),
        proof.siblings
      ),
      "Invalid state proof"
    );
    return Account.decodeAccount(proof.value);
  }

  function subtractBalanceAllowError(
    SparseLib sparse,
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes,
    uint256 amount
  ) internal view returns (bool valid, bytes32 updatedRoot) {
    SparseMerkleProof memory proof = decodeProof(proofBytes);
    Account.Account memory account = Account.decodeAccount(proof.value);
    valid = account.balance >= amount;
    if (valid) {
      account.balance -= amount;
      updatedRoot = updateStateTree(
        sparse,
        stateRoot,
        accountAddress,
        account,
        proof
      );
    } else {
      updatedRoot = stateRoot;
    }
  }

  function subtractBalanceAndIncrementNonceAllowError(
    SparseLib sparse,
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes,
    uint256 amount
  ) internal view returns (bool valid, bytes32 updatedRoot) {
    SparseMerkleProof memory proof = decodeProof(proofBytes);
    Account.Account memory account = Account.decodeAccount(proof.value);
    valid = account.balance >= amount;
    if (valid) {
      account.balance -= amount;
      account.nonce += 1;
      updatedRoot = updateStateTree(
        sparse,
        stateRoot,
        accountAddress,
        account,
        proof
      );
    } else {
      updatedRoot = stateRoot;
    }
  }

  function subtractBalanceAndIncrementNonce(
    SparseLib sparse,
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes,
    uint256 amount
  ) internal view returns (bytes32) {
    (bool valid, bytes32 updatedRoot) = subtractBalanceAndIncrementNonceAllowError(
      sparse,
      stateRoot,
      accountAddress,
      proofBytes,
      amount
    );
    require(valid, "Insufficient balance");
    return updatedRoot;
  }

  function increaseBalance(
    SparseLib sparse,
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes,
    uint256 amount
  ) internal view returns (bytes32 updatedRoot, Account.Account memory account) {
    SparseMerkleProof memory proof = decodeProof(proofBytes);
    account = Account.decodeAccount(proof.value);
    account.balance += amount;
    updatedRoot = updateStateTree(
      sparse,
      stateRoot,
      accountAddress,
      account,
      proof
    );
  }

  function proveStorageValue(
    SparseLib sparse,
    Account.Account memory account,
    bytes32 slot,
    SparseMerkleProof memory proof
  ) internal view returns (bytes32) {
    require(
      sparse.verifySparse(
        account.stateRoot,
        256,
        proof.inclusionBits,
        proof.value,
        uint256(slot),
        proof.siblings
      ),
      "Invalid storage proof"
    );
    bytes memory value = proof.value;
    bytes32 res;
    assembly { res := mload(add(value, 32)) }
    return res;
  }

  function proveStorageValue(
    SparseLib sparse,
    Account.Account memory account,
    bytes32 slot,
    bytes memory proofBytes
  ) internal view returns (bytes32) {
    return proveStorageValue(sparse, account, slot, decodeProof(proofBytes));
  }

  function updateAccountStorage(
    SparseLib sparse,
    Account.Account memory account,
    bytes32 slot,
    bytes32 newValue,
    bytes memory proofBytes
  ) internal view returns (bytes32 oldValue) {
    SparseMerkleProof memory proof = decodeProof(proofBytes);
    (bool valid, bytes32 updatedRoot) = sparse.verifyAndUpdateSparse(
      account.stateRoot,
      256,
      proof.inclusionBits,
      proof.value,
      abi.encodePacked(newValue),
      uint256(slot),
      proof.siblings
    );
    require(valid, "Invalid storage proof");
    account.stateRoot = updatedRoot;
    bytes memory value = proof.value;
    assembly { oldValue := mload(add(value, 32))}
  }

  function proveAndUpdateAccountStorage(
    SparseLib sparse,
    bytes32 stateRoot,
    address accountAddress,
    bytes32 slot,
    bytes32 newValue,
    bytes memory accountProofBytes,
    bytes memory storageProofBytes
  ) internal view returns (bytes32 oldValue, bytes32 newStateRoot) {
    SparseMerkleProof memory accountProof = decodeProof(accountProofBytes);
    Account.Account memory account = Account.decodeAccount(accountProof.value);
    oldValue = updateAccountStorage(sparse, account, slot, newValue, storageProofBytes);
    
    newStateRoot = updateStateTree(
      sparse,
      stateRoot,
      accountAddress,
      account,
      accountProof
    );
  }

  function setAccountCodeHash(
    SparseLib sparse,
    bytes32 stateRoot,
    address accountAddress,
    bytes memory proofBytes,
    bytes32 codeHash
  ) internal view returns (bytes32 newRoot) {
    SparseMerkleProof memory proof = decodeProof(proofBytes);
    Account.Account memory account = Account.decodeAccount(proof.value);
    account.codeHash = codeHash;
    (bool valid, bytes32 updatedRoot) = sparse.verifyAndUpdateSparse(
      stateRoot,
      160,
      proof.inclusionBits,
      proof.value,
      account.encodeAccount(),
      uint256(accountAddress),
      proof.siblings
    );
    require(valid, "Invalid state proof.");
    return updatedRoot;
  }
}