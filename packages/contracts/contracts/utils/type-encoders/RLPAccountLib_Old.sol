pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;
import "../RLP.sol";

library RLPAccountLib_Old {
  struct Account {
    uint256 nonce;
    uint256 balance;
    bytes32 stateRoot;
    bytes32 codeHash;
  }

  function isContract(Account memory account) internal pure returns (bool) {
    return (
      account.codeHash != 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
    );
  }

  function encodeAccount(Account memory account) internal pure returns (bytes memory) {
    uint256 nonce = account.nonce;
    uint256 _balance = account.balance;
    bytes32 stateRoot = account.stateRoot;
    bytes32 codeHash = account.codeHash;
    uint256 nonceSize = RLP.sizeofNumber(nonce);
    uint256 balanceSize = RLP.sizeofNumber(_balance);
    /* 1 byte for each field's prefix */
    uint256 noncePrefixSize = nonce < 0x80 ? 0 : 1;
    uint256 balancePrefixSize = _balance < 0x80 ? 0 : 1;
    /* 2 bytes for list prefix, 1 byte for each of the 32 byte field prefixes */
    uint256 totalSize = noncePrefixSize + nonceSize + balancePrefixSize + balanceSize + 68;
    bytes memory retval = new bytes(totalSize);
    assembly {
      let ptr := add(retval, 0x20)
      /* << Store the list prefix >> */
      /* store f8 as first byte - indicates a list whose length is encoded as the next byte */
      mstore8(ptr, 0xf8)
      ptr := add(ptr, 1)
      /* store the size of the payload as the next byte */
      mstore8(ptr, sub(totalSize, 2))
      ptr := add(ptr, 1)
      /* << Store nonce and its prefix >> */
      switch noncePrefixSize
      case 0 {
        /* If nonce prefix size is 0, store nonce as the next byte */
        mstore8(ptr, nonce)
        ptr := add(ptr, 1)
      }
      default {
        /* Otherwise, store nonce size as the next byte and then store nonce as the next n bytes */
        mstore8(ptr, add(0x80, nonceSize))
        ptr := add(ptr, 1)
        mstore(ptr, shl(sub(0x100, mul(nonceSize, 8)), nonce))
        ptr := add(ptr, nonceSize)
      }

      /* << Store balance and its prefix >> */
      switch balancePrefixSize
      case 0 {
        /* If nonce prefix size is 0, store nonce as the next byte */
        mstore8(ptr, _balance)
        ptr := add(ptr, 1)
      }
      default {
        /* Otherwise, store nonce size as the next byte and then store nonce as the next n bytes */
        mstore8(ptr, add(0x80, balanceSize))
        ptr := add(ptr, 1)
        mstore(ptr, shl(sub(0x100, mul(balanceSize, 8)), _balance))
        ptr := add(ptr, balanceSize)
      }


      mstore8(ptr, 0xa0)
      ptr := add(ptr, 1)
      mstore(ptr, stateRoot)
      ptr := add(ptr, 0x20)

      mstore8(ptr, 0xa0)
      ptr := add(ptr, 1)
      mstore(ptr, codeHash)
      // mstore(add(retval, 0x20), shl(sub(0x100, mul(nonceSize, 8)), nonce))
      // mstore(add(retval, 0x20), shl(sub(0x100, mul(balanceSize, 8)), _balance))
    }
    return retval;
  }

  function decodeAccount(bytes memory encoded) internal pure returns (Account memory account) {
    uint256 nonce;
    uint256 _balance;
    bytes32 stateRoot;
    bytes32 codeHash;
    if (encoded.length == 0) return Account({
      nonce: 0,
      balance: 0,
      stateRoot: 0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421,
      codeHash: 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
    });
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
      let ptr := add(encoded, 0x20)
      let len := sub(shr(0xf8, mload(ptr)), 0xf6)
      ptr := add(ptr, len)
      nonce, ptr := getVal(ptr)
      _balance, ptr := getVal(ptr)
      ptr := add(ptr, 1)
      stateRoot := mload(ptr)
      codeHash := mload(add(ptr, 33))
    }
    return Account(nonce, _balance, stateRoot, codeHash);
  }
}