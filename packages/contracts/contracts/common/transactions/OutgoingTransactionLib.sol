pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ISO_HeaderLib as HL } from "../blocks/ISO_HeaderLib.sol";
import { ChainStateLib as CS } from "../ChainStateLib.sol";
import { RelayTransactionLib as RTL } from "./RelayTransactionLib.sol";

library OutgoingTransactionLib {
  struct OutgoingTransaction {
    address payable from;
    address payable to;
    uint256 gas;
    uint256 value;
    bytes data;
    uint256 bounty;
  }

  /* withdraw()  |  0x3ccfd60b
withdraw(uint256)  |  0x2e1a7d4d
addTransaction(address,bytes)  |  0x126e19be
addTransactionWithBounty(address,bytes,uint256)  |  0x10f3c58b */

  function fnSigFromCalldata(bytes memory data)
  internal pure returns (bytes4 fnSig) {
    assembly { fnSig := mload(add(data, 32)) }  
  }
 
  function paramsFromCalldata(bytes memory data)
  internal pure returns (bytes memory res) {
    assembly {
      let len := mload(data)
      res := add(data, 4)
      mstore(res, sub(len, 4))
    }
  }

  function wordsInBytes(bytes memory data)
  internal pure returns (uint256) {
    uint256 len = data.length;
    uint256 r = len % 32;
    if (r == 0) return len / 32;
    return (len + 32 - r) / 32;
  }

  /**
   * @dev Calculates the gas fee for an outgoing transaction.
   * The gas fee is 10,000 as a base fee plus 10,000 for each word of data in
   * the encoded transaction.
   * Every transaction has 5 words for the fields from, to, gas, value, bounty,
   * so the total fee is calculated as 10,000 * (6 + wordCount(data))
  */
  function gasFee(OutgoingTransaction memory transaction) internal pure returns (uint256) {
    uint256 dataWords = wordsInBytes(transaction.data);
    return 10000 * (6 + dataWords);
  }

  /**
   * @dev Decodes the outgoing transaction data from the calldata sent to the
   * child relay address.
   */
  function fromExitCalldata(
    bytes memory exitCalldata,
    address _caller,
    uint256 _value,
    uint256 _gas
  ) internal pure returns (OutgoingTransaction memory transaction) {
    require(exitCalldata.length >= 4, "Invalid calldata encoding.");
    bytes4 fnSig = fnSigFromCalldata(exitCalldata);
    bytes memory params = paramsFromCalldata(exitCalldata);
    transaction.from = payable(_caller);
    transaction.value = _value;
    transaction.bounty = 0;
    if (fnSig == 0x3ccfd60b) {
      transaction.data = bytes("");
      transaction.to = payable(_caller);
    } else if (fnSig == 0x2e1a7d4d) {
      uint256 bounty = abi.decode((params), (uint256));
      require(_value >= bounty, "Insufficient value for bounty.");
      transaction.data = bytes("");
      transaction.to = payable(_caller);
      transaction.bounty = bounty;
      transaction.value -= bounty;
    } else if (fnSig == 0x126e19be) {
      (address to, bytes memory data) = abi.decode(
        (params),
        (address, bytes)
      );
      transaction.to = payable(to);
      transaction.data = data;
    } else if (fnSig == 0x10f3c58b) {
      (address to, bytes memory data, uint256 bounty) = abi.decode(
        (params),
        (address, bytes, uint256)
      );
      require(_value >= bounty, "Insufficient value for bounty.");
      transaction.to = payable(to);
      transaction.data = data;
      transaction.bounty = bounty;
      transaction.value -= bounty;
    } else {
      revert("Invalid function signature.");
    }
    uint256 fee = gasFee(transaction);
    require(_gas >= fee, "Insufficient gas for outgoing tx.");
    transaction.gas = _gas - fee;
  }

  function toBytes(OutgoingTransaction memory _tx) internal pure returns (bytes memory _encoded) {
    _encoded = abi.encode(
      _tx.from,
      _tx.to,
      _tx.gas,
      _tx.value,
      _tx.data,
      _tx.bounty
    );
  }

  function fromBytes(bytes memory _encoded) internal pure returns (OutgoingTransaction memory) {
    (
      address _from,
      address _to,
      uint256 _gas,
      uint256 _value,
      bytes memory _data,
      uint256 _bounty
    ) = abi.decode(
      (_encoded),
      (
        address,
        address,
        uint256,
        uint256,
        bytes,
        uint256
      )
    );
    return OutgoingTransaction(
      payable(_from),
      payable(_to),
      _gas,
      _value,
      _data,
      _bounty
    );
  }
}