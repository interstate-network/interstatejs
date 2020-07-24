pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

library RelayTransactionLib {
  struct RelayTransaction {
    address from;
    address to;
    uint256 gas;
    uint256 value;
    bytes data;
  }
  
  /**
   * @dev Data structure representing the full transaction
   * after being processed by the sidechain.
   * The stateRoot field is the only value actually represented
   * in the block, this struct is only used to simplify fraud proofs.
   */
  struct IncomingTransaction {
    address from;
    address to;
    uint256 gas;
    uint256 value;
    bytes data;
    bytes32 stateRoot;
  }

  function toBytes(RelayTransaction memory _itx)
  internal pure returns (bytes memory _encoded) {
    _encoded = abi.encode(_itx);
  }

  function transactionHash(RelayTransaction memory _itx)
  internal pure returns (bytes32) {
    return keccak256(toBytes(_itx));
  }

  function transactionHash(IncomingTransaction memory _itx)
  internal pure returns (bytes32) {
    return transactionHash(RelayTransaction({
      from: _itx.from,
      to: _itx.to,
      gas: _itx.gas,
      value: _itx.value,
      data: _itx.data
    }));
  }
}