pragma solidity ^0.6.0;

import "./SliceLib.sol";

library RLP {
  using SliceLib for *;
  uint8 constant STRING_SHORT_PREFIX = 0x80;
  uint8 constant STRING_LONG_PREFIX = 0xb7;
  uint8 constant LIST_SHORT_PREFIX = 0xc0;
	uint8 constant LIST_LONG_PREFIX = 0xf7;
  uint8 constant LARGE_ITEM_SIZE = 0x38;
  bytes32 constant SIZEOF_MASK32 = 0xff00000000000000000000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK31 = 0x00ff000000000000000000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK30 = 0x0000ff0000000000000000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK29 = 0x000000ff00000000000000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK28 = 0x00000000ff000000000000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK27 = 0x0000000000ff0000000000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK26 = 0x000000000000ff00000000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK25 = 0x00000000000000ff000000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK24 = 0x0000000000000000ff0000000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK23 = 0x000000000000000000ff00000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK22 = 0x00000000000000000000ff000000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK21 = 0x0000000000000000000000ff0000000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK20 = 0x000000000000000000000000ff00000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK19 = 0x00000000000000000000000000ff000000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK18 = 0x0000000000000000000000000000ff0000000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK17 = 0x000000000000000000000000000000ff00000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK16 = 0x00000000000000000000000000000000ff000000000000000000000000000000;
  bytes32 constant SIZEOF_MASK15 = 0x0000000000000000000000000000000000ff0000000000000000000000000000;
  bytes32 constant SIZEOF_MASK14 = 0x000000000000000000000000000000000000ff00000000000000000000000000;
  bytes32 constant SIZEOF_MASK13 = 0x00000000000000000000000000000000000000ff000000000000000000000000;
  bytes32 constant SIZEOF_MASK12 = 0x0000000000000000000000000000000000000000ff0000000000000000000000;
  bytes32 constant SIZEOF_MASK11 = 0x000000000000000000000000000000000000000000ff00000000000000000000;
  bytes32 constant SIZEOF_MASK10 = 0x00000000000000000000000000000000000000000000ff000000000000000000;
  bytes32 constant SIZEOF_MASK9 = 0x0000000000000000000000000000000000000000000000ff0000000000000000;
  bytes32 constant SIZEOF_MASK8 = 0x000000000000000000000000000000000000000000000000ff00000000000000;
  bytes32 constant SIZEOF_MASK7 = 0x00000000000000000000000000000000000000000000000000ff000000000000;
  bytes32 constant SIZEOF_MASK6 = 0x0000000000000000000000000000000000000000000000000000ff0000000000;
  bytes32 constant SIZEOF_MASK5 = 0x000000000000000000000000000000000000000000000000000000ff00000000;
  bytes32 constant SIZEOF_MASK4 = 0x00000000000000000000000000000000000000000000000000000000ff000000;
  bytes32 constant SIZEOF_MASK3 = 0x0000000000000000000000000000000000000000000000000000000000ff0000;
  bytes32 constant SIZEOF_MASK2 = 0x000000000000000000000000000000000000000000000000000000000000ff00;
  bytes32 constant SIZEOF_MASK1 = 0x00000000000000000000000000000000000000000000000000000000000000ff;
  function sizeofNumber(uint256 input) internal pure returns (uint256) {
    if (input == 0) return 1;
    if (uint256(SIZEOF_MASK32) & input != 0) return 32;
    if (uint256(SIZEOF_MASK31) & input != 0) return 31;
    if (uint256(SIZEOF_MASK30) & input != 0) return 30;
    if (uint256(SIZEOF_MASK29) & input != 0) return 29;
    if (uint256(SIZEOF_MASK28) & input != 0) return 28;
    if (uint256(SIZEOF_MASK27) & input != 0) return 27;
    if (uint256(SIZEOF_MASK26) & input != 0) return 26;
    if (uint256(SIZEOF_MASK25) & input != 0) return 25;
    if (uint256(SIZEOF_MASK24) & input != 0) return 24;
    if (uint256(SIZEOF_MASK23) & input != 0) return 23;
    if (uint256(SIZEOF_MASK22) & input != 0) return 22;
    if (uint256(SIZEOF_MASK21) & input != 0) return 21;
    if (uint256(SIZEOF_MASK20) & input != 0) return 20;
    if (uint256(SIZEOF_MASK19) & input != 0) return 19;
    if (uint256(SIZEOF_MASK18) & input != 0) return 18;
    if (uint256(SIZEOF_MASK17) & input != 0) return 17;
    if (uint256(SIZEOF_MASK16) & input != 0) return 16;
    if (uint256(SIZEOF_MASK15) & input != 0) return 15;
    if (uint256(SIZEOF_MASK14) & input != 0) return 14;
    if (uint256(SIZEOF_MASK13) & input != 0) return 13;
    if (uint256(SIZEOF_MASK12) & input != 0) return 12;
    if (uint256(SIZEOF_MASK11) & input != 0) return 11;
    if (uint256(SIZEOF_MASK10) & input != 0) return 10;
    if (uint256(SIZEOF_MASK9) & input != 0) return 9;
    if (uint256(SIZEOF_MASK8) & input != 0) return 8;
    if (uint256(SIZEOF_MASK7) & input != 0) return 7;
    if (uint256(SIZEOF_MASK6) & input != 0) return 6;
    if (uint256(SIZEOF_MASK5) & input != 0) return 5;
    if (uint256(SIZEOF_MASK4) & input != 0) return 4;
    if (uint256(SIZEOF_MASK3) & input != 0) return 3;
    if (uint256(SIZEOF_MASK2) & input != 0) return 2;
    return 1;
  }
  function memcpy(uint dest, uint src, uint len) internal pure {
    for(; len >= 32; len -= 32) {
      assembly {
        mstore(dest, mload(src))
      }
      dest += 32;
      src += 32;
    }
    assembly {
      let mask := sub(shl(mul(sub(32, len), 8), 1), 1)
      mstore(dest, or(and(mload(src), not(mask)), and(mload(dest), mask)))
    }
  }

  function encodeWithPrefix(uint256 word) internal pure returns (bytes memory retval) {
    uint256 size = sizeofNumber(word);
    uint256 prefixSize = word < 0x80 ? 0 : 1;
    retval = new bytes(size + prefixSize);
    assembly {
      let ptr := add(retval, 0x20)
      switch prefixSize
      case 0 {
        /* If prefix size is 0, store word as the only byte */
        mstore8(ptr, word)
      }
      default {
        /* Otherwise, store size as the next byte and then store the word as the next n bytes */
        mstore8(ptr, add(0x80, size))
        ptr := add(ptr, 1)
        mstore(ptr, shl(sub(0x100, mul(size, 8)), word))
      }
    }
  }

  function decodePrefixedWord(bytes memory encodedValue) internal pure returns (bytes32 value) {
    if (encodedValue.length == 0) return bytes32(0);
    assembly {
      function decodeWord(_ptr) -> val {
        let prefix := shr(0xf8, mload(_ptr))
        _ptr := add(_ptr, 1)
        switch lt(prefix, 0x80)
        case 0 {
          let len := sub(prefix, 0x80)
          val := shr(sub(256, mul(len, 8)), mload(_ptr))
        }
        default {
          val := prefix
        }
      }
      let ptr := add(encodedValue, 0x20)
      value := decodeWord(ptr)
    }
  }

  function toCompact(uint256 word) internal pure returns (bytes memory retval) {
    uint256 size = sizeofNumber(word);
    if (size == 0) retval = new bytes(0);
    else {
      retval = new bytes(size);
      assembly {
        mstore(add(retval, 0x20), shl(sub(0x100, mul(size, 8)), word))
      }
      return retval;
    }
  }
  function toDynamic(bytes32 word) internal pure returns (bytes memory retval) {
    retval = new bytes(32);
    assembly {
      mstore(add(retval, 0x20), word)
    }
  }
  struct RLPItem {
    bytes data;
    bool pass;
  }
  function toRLPItem(bytes memory input) internal pure returns (RLPItem memory retval) {
    retval.data = input;
  }
  function toBytes(RLPItem memory input) internal pure returns (bytes memory retval) {
    return input.data;
  }
  function encode(bytes memory input) internal pure returns (RLPItem memory retval) {
    return encode(RLPItem({
      data: input,
      pass: false
    }));
  }
  function encode(RLPItem memory input) internal pure returns (RLPItem memory output) {
    if (input.pass) return input;
    bytes memory retval;
    output.pass = true;
    bytes memory data = input.data;
    if (input.pass || data.length == 1 && uint8(data[0]) < STRING_SHORT_PREFIX) {
      if (uint8(data[0]) == 0) {
        output.data = hex"80";
        return output;
      }
      return input;
    }
    else if (data.length < LARGE_ITEM_SIZE) {
      retval = new bytes(data.length + 1);
      retval[0] = byte(STRING_SHORT_PREFIX + uint8(data.length));
      uint256 dest;
      uint256 src;
      assembly {
        dest := add(retval, 0x21)
        src := add(data, 0x20)
      }
      memcpy(dest, src, data.length);
    } else {
      uint256 lengthSize = sizeofNumber(data.length);
      retval = new bytes(1 + lengthSize + data.length);
      retval[0] = byte(STRING_LONG_PREFIX + uint8(lengthSize));
      if (data.length != 0) {
        assembly {
          mstore(add(retval, 0x21), shl(sub(0x100, mul(8, lengthSize)), mload(data)))
        }
        uint256 dest;
        uint256 src;
        assembly {
          dest := add(retval, add(0x21, lengthSize))
          src := add(data, 0x20)
        }
        memcpy(dest, src, data.length);
      }
    }
    output.data = retval;
  }
  function encodeList(RLPItem[] memory input) internal pure returns (RLPItem memory) {
    bytes[] memory intermediate = new bytes[](input.length);
    bytes memory retval;
    uint256 total;
    for (uint256 i = 0; i < input.length; i++) {
      bytes memory tmp = encode(input[i]).data;
      intermediate[i] = tmp;
      total += tmp.length;
    }
    if (total < LARGE_ITEM_SIZE) {
      retval = new bytes(total + 1);
      retval[0] = byte(LIST_SHORT_PREFIX + uint8(total));
      uint256 passed = 0x21;
      for (uint256 i = 0; i < intermediate.length; i++) {
        uint256 dest;
        uint256 src;
        uint256 length;
        assembly {
          let tmp := mload(add(mul(0x20, add(i, 1)), intermediate))
          length := mload(tmp)
          src := add(tmp, 0x20)
          dest := add(retval, passed)
        }
        passed += length;
        memcpy(dest, src, length);
      }
    } else {
      uint256 lengthSize = sizeofNumber(total);
      retval = new bytes(1 + lengthSize + total);
      retval[0] = byte(LIST_LONG_PREFIX + uint8(lengthSize));
      assembly {
        mstore(add(retval, 0x21), shl(sub(0x100, mul(8, lengthSize)), total))
      }
      uint256 passed = 0x21 + lengthSize;
      for (uint256 i = 0; i < intermediate.length; i++) {
        uint256 dest;
        uint256 src;
        uint256 length;
        assembly {
          let tmp := mload(add(mul(0x20, add(i, 1)), intermediate))
          length := mload(tmp)
          src := add(tmp, 0x20)
          dest := add(retval, passed)
        }
        passed += length;
        memcpy(dest, src, length);
      }
    }
    return RLPItem({
      pass: true,
      data: retval
    });
  }
  enum WalkerState {
    UNINITIALIZED,
    NULL_ENTRY,
    WORD_ENTRY,
    STRING_ENTRY,
    LIST_ENTRY,
    REACHED_END
  }
  struct Walker {
    uint256 index;
    SliceLib.Slice pointer;
    SliceLib.Slice data;
    WalkerState state;
  }
  function fromRlp(bytes memory rlpEncoded) internal pure returns (Walker memory walker) {
    walker = fromRlp(rlpEncoded.toSlice());
  }
  function fromRlp(SliceLib.Slice memory slice) internal pure returns (Walker memory walker) {
    walker.data = slice;
    walker.pointer.data = walker.data.data;
    walker.index = uint256(~0);
    walk(walker);
  }
  function getBytes(Walker memory walker) internal pure returns (bytes memory) {
    return walker.pointer.copy();
  }
  function readWord(Walker memory walker) internal pure returns (bytes32 word) {
    SliceLib.Slice memory pointer = walker.pointer;
    if (pointer.length >= 0x20) {
      word = pointer.asWord();
    } else {
      uint256 data = pointer.data - (0x20 - pointer.length);
      uint256 mask = (uint256(0x1) << (pointer.length * 0x8)) - 0x1;
      assembly {
        word := and(mload(data), mask)
      }
    }
  }
  function readContainingBytes(Walker memory walker) internal pure returns (bytes memory) {
    return walker.pointer.toContainer().copy();
  }
  function readBytes(Walker memory walker) internal pure returns (bytes memory) {
    return walker.pointer.copy();
  }
  function readList(Walker memory walker) internal pure returns (RLPItem[] memory decoded) {
    uint256 total = walker.index;
    while (walker.state != WalkerState.REACHED_END) {
      total++;
      walk(walker);
    }
    decoded = new RLPItem[](total);
    rewindToListStart(walker);
    for (uint256 i = 0; i < total; i++) {
      decoded[i] = walker.state == WalkerState.LIST_ENTRY ? RLPItem({
        data: readContainingBytes(walker),
        pass: true
      }) : RLPItem({
        data: readBytes(walker),
        pass: false
      });
      walk(walker);
    }
  }
  function copy(Walker memory walker) internal pure returns (Walker memory) {
    return Walker({
      index: walker.index,
      pointer: walker.pointer.toSlice(),
      state: walker.state,
      data: walker.data.toSlice()
    });
  }
  function reset(Walker memory walker) internal pure {
    walker.index = uint256(~0);
    SliceLib.Slice memory pointer;
    walker.pointer = pointer;
    walker.pointer.data = walker.data.data;
    walker.state = WalkerState.UNINITIALIZED;
    walk(walker);
  }
  function rewindToListStart(Walker memory walker) internal pure {
    reset(walker);
  }
  function resetAndInitialize(Walker memory walker) internal pure {
    reset(walker);
  }
  function resetAndTarget(Walker memory walker, bytes memory data) internal pure {
    walker.data = data.toSlice();
    reset(walker);
  }
  function enterList(Walker memory walker) internal pure returns (Walker memory) {
    uint256 offset = walker.pointer.offset;
    SliceLib.Slice memory data = walker.pointer.toSlice();
    walker.pointer.offset = offset;
    SliceLib.Slice memory pointer;
    pointer.data = data.data;
    Walker memory listWalker = Walker({
      index: uint256(~0),
      data: data,
      state: WalkerState.UNINITIALIZED,
      pointer: pointer
    });
    walk(listWalker);
    return listWalker;
  }
  
  function deriveContainerKeccak(SliceLib.Slice memory slice) internal pure returns (bytes32 root) {
    uint256 start = slice.data - slice.offset;
    uint256 length = slice.length + slice.offset;
    assembly {
      root := keccak256(start, length)
    }
  }

  // function enterListSelf(Walker memory walker) internal pure /* returns (Walker memory) */ {
  //   uint256 oldLen = walker.length;
  //   walker.index = 0;
  //   walker.listProgress = 0;
  //   walker.listLength = 0;
  //   walker.length = 0;
  //   walker.state = WalkerState.UNINITIALIZED;
  //   uint256 start = walker.pos;
  //   walk(walker);
  //   walker.listProgress += walker.pos - start;
  //   walker.listLength = oldLen;
  // }
  function walkMulti(Walker memory walker, uint256 n) internal pure {
    for (uint256 i = 0; i < n; i++) {
      walk(walker);
    }
  }
  function walk(Walker memory walker) internal pure {
    walker.index++;
    if (walker.pointer.length + walker.pointer.data >= walker.data.length + walker.data.data) {
      walker.state = WalkerState.REACHED_END;
      return;
    }
    uint256 start = walker.pointer.data + walker.pointer.length - walker.data.data;
    uint8 code = uint8(walker.data.get(start));
    if (code < STRING_SHORT_PREFIX) {
      walker.pointer = walker.data.toSlice(start, 1);
      walker.pointer.offset = 0;
      walker.state = WalkerState.WORD_ENTRY;
    } else if (code == STRING_SHORT_PREFIX) {
      walker.pointer = walker.data.toSlice(start + 1, 0);
      walker.pointer.offset = 1;
      walker.state = WalkerState.NULL_ENTRY;
    } else if (code <= STRING_LONG_PREFIX) {
      walker.pointer = walker.data.toSlice(start + 1, code - STRING_SHORT_PREFIX);
      walker.pointer.offset = 1;
      if (walker.pointer.length <= 0x20) walker.state = WalkerState.WORD_ENTRY;
      else walker.state = WalkerState.STRING_ENTRY;
    } else if (code < LIST_SHORT_PREFIX) {
      uint256 lengthOfLength = code - STRING_LONG_PREFIX;
      walker.pointer = walker.data.toSlice(start + 1, lengthOfLength);
      uint256 length = uint256(readWord(walker));
      walker.pointer = walker.data.toSlice(start + lengthOfLength + 1, length);
      walker.pointer.offset = lengthOfLength + 1;
      walker.state = walker.pointer.length <= 0x20 ? WalkerState.WORD_ENTRY : WalkerState.STRING_ENTRY;
    } else if (code <= LIST_LONG_PREFIX) {
      walker.pointer = walker.data.toSlice(start + 1, code - LIST_SHORT_PREFIX);
      walker.pointer.offset = 1;
      walker.state = WalkerState.LIST_ENTRY;
    } else {
      uint256 lengthOfLength = code - LIST_LONG_PREFIX;
      walker.pointer = walker.data.toSlice(start + 1, lengthOfLength);
      uint256 length = uint256(readWord(walker));
      walker.pointer = walker.data.toSlice(start + lengthOfLength + 1, length);
      walker.pointer.offset = lengthOfLength + 1;
      walker.state = WalkerState.LIST_ENTRY;
    }
  }
  function isReachedEnd(Walker memory walker) internal pure returns (bool) {
    return walker.state == WalkerState.REACHED_END;
  }
  function isInitialized(Walker memory walker) internal pure returns (bool) {
    return walker.state != WalkerState.UNINITIALIZED;
  }
  function validateLengthEquals(Walker memory walker, uint256 length) internal pure returns (bool) {
    return isInitialized(walker) && !isReachedEnd(walker) && walker.pointer.length == length;
  }
  function validateLengthLessThan(Walker memory walker, uint256 length) internal pure returns (bool) {
    return isInitialized(walker) && isReachedEnd(walker) && walker.pointer.length < length;
  }
  function validateLengthLessThanOrEqual(Walker memory walker, uint256 length) internal pure returns (bool) {
    return isInitialized(walker) && !isReachedEnd(walker) && walker.pointer.length < length;
  }
}
