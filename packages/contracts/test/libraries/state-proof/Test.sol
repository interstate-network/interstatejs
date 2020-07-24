pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "../../../contracts/fraud-proofs/lib/StateProofLib.sol";

contract Test {
  function proveAccountInState(bytes32 stateRoot, address accountAddress, bytes memory proof)
  public view returns (bool inState, Account.Account memory account) {
    return StateProofLib.proveAccountInState(stateRoot, accountAddress, proof);
  }

  function updateAccountBalance(
    bytes32 stateRoot, address accountAddress, bytes memory proof, uint256 balanceChange, bool addition
  ) public view returns (
    bool isEmpty, bool balanceOk, Account.Account memory account, bytes32 newStateRoot
  ) {
    return StateProofLib.updateAccountBalance(stateRoot, accountAddress, proof, balanceChange, addition); 
  }

  function proveStorageValue(Account.Account memory account, bytes32 slot, bytes32 _value, bytes memory proof)
  public view returns (bool) {
    (bool success, bytes32 gotValue) = StateProofLib.proveStorageValue(account, slot, proof);
    return success && gotValue == _value;
  }

  function updateStorageRoot(Account.Account memory account, bytes32 slot, bytes32 _value, bytes memory proof)
  public view returns (bool inStorage, bytes32 newRoot, bytes32 oldValue) {
    return StateProofLib.updateStorageRoot(account, slot, _value, proof);
  }
}