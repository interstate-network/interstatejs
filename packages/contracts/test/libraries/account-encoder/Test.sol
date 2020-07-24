pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { RLPAccountLib as Account } from "../../../contracts/utils/type-encoders/RLPAccountLib.sol";

contract Test {
  function encodeAccount(Account.Account memory account) public pure returns (bytes memory) {
    return Account.encodeAccount(account);
  }

  function decodeAccount(bytes memory encoded) public pure returns (Account.Account memory account) {
    return Account.decodeAccount(encoded);
  }
}