pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ISO_HeaderLib as Header } from "../../common/blocks/ISO_HeaderLib.sol";

library PriorStateLib {
  using Header for Header.ISO_Header;

  struct PriorStateProof {
    bytes transaction;
    bytes32[] siblings;
  }

  function provePreviousStateRoot(
    Header.ISO_Header memory header,
    bytes memory previousRootProof,
    uint256 transactionIndex
  ) internal pure returns (bytes32) {
    if (transactionIndex == 0) {
      Header.ISO_Header memory parent = Header.fromBytes(previousRootProof);
      require(header.parentHash == parent.blockHash(), "Parent block does not match child.");
      return parent.stateRoot;
    }
    // (bytes memory transaction, bytes32[] memory siblings)
     PriorStateProof memory proof = abi.decode((previousRootProof), (PriorStateProof));
    require(header.hasTransaction(
      proof.transaction,
      transactionIndex - 1,
      proof.siblings
    ));
    bytes memory transaction = proof.transaction;
    bytes32 root;
    assembly { root := mload(add(transaction, mload(transaction))) }
    return root;
  }
}