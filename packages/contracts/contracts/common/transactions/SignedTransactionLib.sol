pragma solidity ^0.6.0;

import { MemcpyLib as Copy } from  "../../utils/MemcpyLib.sol";
import "../../utils/RLP.sol";
import "../../common/config/GasSchedule.sol";
import { ChainStateLib as State } from "../../common/ChainStateLib.sol";

library SignedTransactionLib {
  struct SignedTransaction {
    uint256 nonce;
    uint256 gasPrice;
    uint256 gas;
    address to;
    uint256 value;
    bytes data;
    uint256 v;
    bytes32 r;
    bytes32 s;
    bytes32 stateRoot;
  }

  uint256 constant CHAIN_ID = 50005;

  function copyDataBuffer(uint256 ptr, bytes memory data, uint256 length)
  internal pure {
    bytes32 dataPointer;
    assembly { dataPointer := add(data, 0x20) }
    Copy.memcpy(dataPointer, bytes32(ptr), length);
  }

  function getDataBuffer(uint256 ptr)
  internal pure returns (bytes memory _data, uint256 newPtr) {
    uint8 dataPrefix;
    assembly {
      // The data field can be much longer, so we need to handle all string types
      dataPrefix := shr(0xf8, mload(ptr))
      ptr := add(ptr, 1)
    }
    // Determine which decoder to use for the data field
    if (dataPrefix == 0x80) {
      // If data prefix is 0x80, it is 0
      _data = new bytes(0);
    } else if (dataPrefix < 0x80) {
      // If prefix < 0x80, it is 1 byte
      _data = new bytes(1);
      _data[0] = byte(dataPrefix);
    } else if (dataPrefix < 0xb8) {
      // If (0x7f < prefix < 0xb8), it is a string whose length is (prefix-0x80)
      uint256 dataLength = dataPrefix - 0x80;
      _data = new bytes(dataLength);
      copyDataBuffer(ptr, _data, dataLength);
      ptr += dataLength;
    } else if (dataPrefix < 0xc0) {
      // If (b7 < prefix < c0), it is a string whose length is encoded as a string
      // whose length is (prefix - 0xb7)
      uint256 lengthLength = dataPrefix - 0xb7;
      uint256 dataLength;
      assembly {
        dataLength := shr(sub(256, mul(lengthLength, 8)), mload(ptr))
        ptr := add(ptr, lengthLength)
      }
      _data = new bytes(dataLength);
      copyDataBuffer(ptr, _data, dataLength);
      ptr += dataLength;
    } else  {
      revert("Data prefix is invalid.");
    }
    newPtr = ptr;
  }

  /**
   * @dev Decodes an RLP encoded transaction.
   * @notice Expects the transaction to have a 32 byte
   * state root concatenated to the end.
   */
  function decodeTransaction(bytes memory encoded)
  internal pure returns (SignedTransaction memory transaction) {
    uint256 _nonce;
    uint256 _gasprice;
    uint256 _gaslimit;
    address _to;
    uint256 _value;
    bytes memory _data;
    uint256 _v;
    bytes32 _r;
    bytes32 _s;
    bytes32 _stateroot;
    uint256 ptr;
    // Get the first 4 fields and the prefix for the data field
    assembly {
      function getVal(_ptr) -> val, newPtr {
        let prefix := shr(0xf8, mload(_ptr))
        newPtr := add(_ptr, 1)
        switch lt(prefix, 0x80)
          case 0 {
              let len := sub(prefix, 0x80)
              val := shr(sub(256, mul(len, 8)), mload(newPtr))
              newPtr := add(newPtr, len)
          }
          default {
              val := prefix
          }
      }
      ptr := add(encoded, 0x20)
      // We subtract f6 instead of f7 because we want to skip the list length
      // as well as the prefix for the list length.
      let len := sub(shr(0xf8, mload(ptr)), 0xf6)
      ptr := add(ptr, len)
      // The first 5 fields are numeric values and can not exceed 32 bytes,
      // so the simple getVal function works for them
      _nonce, ptr := getVal(ptr)
      _gasprice, ptr := getVal(ptr)
      _gaslimit, ptr := getVal(ptr)
      _to, ptr := getVal(ptr)
      _value, ptr := getVal(ptr)
      // The data field can be much longer, so we need to handle all string types
    }
    (_data, ptr) = getDataBuffer(ptr);
    assembly {
      function getVal(_ptr) -> val, newPtr {
        let prefix := shr(0xf8, mload(_ptr))
        newPtr := add(_ptr, 1)
        switch lt(prefix, 0x80)
          case 0 {
              let len := sub(prefix, 0x80)
              val := shr(sub(256, mul(len, 8)), mload(newPtr))
              newPtr := add(newPtr, len)
          }
          default {
              val := prefix
          }
      }
      _v, ptr := getVal(ptr)
      _r, ptr := getVal(ptr)
      _s, ptr := getVal(ptr)
    }
    // Verify that the pointer is 32 bytes from the end of the encoded transaction.
    // The state root is not part of the RLP encoding, and is simply concatenated at the end.
    uint256 dataPointer;
    assembly { dataPointer := add(encoded, mload(encoded)) }
    require(ptr == dataPointer, "Invalid transaction encoding.");
    assembly { _stateroot := mload(ptr) }
    return SignedTransaction({
      nonce: _nonce,
      gasPrice: _gasprice,
      gas: _gaslimit,
      to: _to,
      value: _value,
      data: _data,
      v: _v,
      r: _r,
      s: _s,
      stateRoot: _stateroot
    });
  }

  struct PreProcessData {
    uint256 prefixSize;
    uint256 valueSize;
  }

  function encodeTransaction(SignedTransaction memory transaction)
  internal pure returns (bytes memory ret) {
    RLP.RLPItem[] memory items = new RLP.RLPItem[](9);
    items[0] = RLP.toRLPItem(RLP.toCompact(transaction.nonce));
    items[1] = RLP.toRLPItem(RLP.toCompact(transaction.gasPrice));
    items[2] = RLP.toRLPItem(RLP.toCompact(transaction.gas));
    items[3] = RLP.toRLPItem(abi.encodePacked(transaction.to));
    items[4] = RLP.toRLPItem(RLP.toCompact(transaction.value));
    items[5] = RLP.toRLPItem(transaction.data);
    items[6] = RLP.toRLPItem(RLP.toCompact(transaction.v));
    items[7] = RLP.toRLPItem(RLP.toCompact(uint256(transaction.r)));
    items[8] = RLP.toRLPItem(RLP.toCompact(uint256(transaction.s)));
    return RLP.encodeList(items).data;
  }

  function getSenderAddress(SignedTransaction memory transaction)
  internal pure returns (address signer) {
    uint256 v = getSigV(transaction);
    bytes32 r = transaction.r;
    bytes32 s = transaction.s;
    bytes32 msgHash = getMessageHash(transaction);
    signer = ecrecover(msgHash, uint8(v), r, s);
  }

  function getMessageHash(SignedTransaction memory transaction)
  internal pure returns (bytes32) {
    transaction.v = CHAIN_ID;
    transaction.r = bytes32(0);
    transaction.s = bytes32(0);
    bytes memory encoded = encodeTransaction(transaction);
    return keccak256(encoded);
  }

  function getSigV(SignedTransaction memory transaction)
  internal pure returns(uint8) {
    return uint8(transaction.v - (2 * CHAIN_ID + 8));
  }

  function getUpfrontCost(SignedTransaction memory transaction)
  internal pure returns (uint256) {
    return (transaction.gas * transaction.gasPrice) + transaction.value;
  }

  /**
   * @dev Get the base gas fee for a transaction.
   * @notice ChainState is only needed to get the byte counter address.
   * Once the address is set as a constant, it can be removed as a parameter.
   */
  function getBaseFee(
    State.ChainState storage _state,
    SignedTransaction memory transaction
  ) internal view returns (uint256) {
    return GasSchedule.C_tx(_state.byteCounter, transaction.data);
  }
}
