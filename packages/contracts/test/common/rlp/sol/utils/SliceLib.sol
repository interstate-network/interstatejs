pragma solidity ^0.6.0;

import "../utils/MemcpyLib.sol";

library SliceLib {
  enum UnderlyingDataState {
    FREE,
    BORROWED
  }
  struct Slice {
    uint256 data;
    uint256 length;
    uint256 offset;
    bytes32 cache;
    UnderlyingDataState state;
  }
  function toSlice(bytes memory input, uint256 offset, uint256 length) internal pure returns (Slice memory retval) {
    uint256 data;
    assembly {
      data := add(offset, add(input, 0x20))
    }
    retval.data = data;
    retval.length = length;
    retval.offset = offset;
  }
  function toSlice(bytes memory input) internal pure returns (Slice memory) {
    return toSlice(input, 0);
  }
  function getTargetData(Slice memory slice) internal pure returns (bytes memory retval) {
    uint256 data = slice.data;
    uint256 offset = slice.offset;
    assembly {
      retval := sub(sub(data, offset), 0x20)
    }
  }
  function toSlice(bytes memory input, uint256 offset) internal pure returns (Slice memory) {
    if (input.length < offset) offset = input.length;
    return toSlice(input, offset, input.length - offset);
  }
  function toSlice(Slice memory input, uint256 offset, uint256 length) internal pure returns (Slice memory) {
    return Slice({
      data: input.data + offset,
      offset: input.offset + offset,
      length: length,
      cache: 0,
      state: UnderlyingDataState.FREE
    });
  }
  function toSlice(Slice memory input, uint256 offset) internal pure returns (Slice memory) {
    return toSlice(input, offset, input.length - offset);
  }
  function toSlice(Slice memory input) internal pure returns (Slice memory) {
    return toSlice(input, 0);
  }
  function get(Slice memory slice, uint256 index) internal pure returns (bytes1 result) {
    uint256 data = slice.data - 0x1f + index;
    uint8 intermediate;
    assembly {
      intermediate := and(mload(data), 0xff)
    }
    result = bytes1(intermediate);
  }
  function set(Slice memory slice, uint256 index, uint8 value) internal pure {
    uint256 data = slice.data + index;
    assembly {
      mstore8(data, value)
    }
  }
  function asWord(Slice memory slice) internal pure returns (bytes32 word) {
    uint256 data = slice.data;
    assembly {
      word := mload(data)
    }
  }
  function copy(Slice memory slice) internal pure returns (bytes memory retval) {
    uint256 length = slice.length;
    retval = new bytes(length);
    bytes32 src = bytes32(slice.data);
    bytes32 dest;
    assembly {
      dest := add(retval, 0x20)
    }
    MemcpyLib.memcpy(dest, src, length);
  }
  function toContainer(Slice memory slice) internal pure returns (Slice memory) {
    return Slice({
      length: slice.length + slice.offset,
      offset: 0,
      data: slice.data - slice.offset,
      cache: 0,
      state: UnderlyingDataState.FREE
    });
  }
  function toKeccak(Slice memory slice) internal pure returns (bytes32 result) {
    uint256 length = slice.length;
    uint256 data = slice.data;
    assembly {
      result := keccak256(data, length)
    }
  }
}
