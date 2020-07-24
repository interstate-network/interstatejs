pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./sol/rlp/encoding/RLP.sol";
import "./sol/utils/SliceLib.sol";

contract RLPTest {
  using SliceLib for *;
  using RLP for *;
  enum TestType {
    WALKER_OUTPUT,
    WALKER_READ_WORD,
    ENCODING_ITEM,
    ENCODING_LIST
  }
  struct WalkerOutputTestInput {
    uint256[] path;
    bytes rlpEncoded;
    bytes expected;
  }
  struct WalkerReadWordTestInput {
    uint256[] path;
    bytes rlpEncoded;
    uint256 expected;
  }
  struct WalkerEncodeTestInput {
    bytes data;
    bytes expected;
  }
  struct WalkerEncodeListTestInput {
    bytes[] data;
    bytes expected;
  }
  function traverse(RLP.Walker memory walker, uint256[] memory path, uint256 level) internal pure returns (RLP.Walker memory) {
    while (walker.index != path[level]) {
      walker.walk();
    }
    level++;
    if (level == path.length) return walker;
    return traverse(walker.enterList(), path, level);
  }
  constructor(TestType testType, bytes memory input) public {
    if (testType == TestType.WALKER_OUTPUT) {
      bytes32 actual;
      (WalkerOutputTestInput memory decoded) = abi.decode(input, (WalkerOutputTestInput));
      RLP.Walker memory walker = traverse(RLP.fromRlp(decoded.rlpEncoded).enterList(), decoded.path, 0);
      if (walker.state == RLP.WalkerState.LIST_ENTRY) actual = walker.pointer.toContainer().toKeccak();
      else actual = walker.pointer.toKeccak();
      require(actual == keccak256(decoded.expected));
    } else if (testType == TestType.WALKER_READ_WORD) {
      (WalkerReadWordTestInput memory decoded) = abi.decode(input, (WalkerReadWordTestInput));
      RLP.Walker memory walker = traverse(RLP.fromRlp(decoded.rlpEncoded).enterList(), decoded.path, 0);
      require(decoded.expected == uint256(walker.readWord()));
    } else if (testType == TestType.ENCODING_ITEM) {
      (WalkerEncodeTestInput memory decoded) = abi.decode(input, (WalkerEncodeTestInput));
      require(decoded.expected.toSlice().toKeccak() == decoded.data.encode().toBytes().toSlice().toKeccak());
    } else if (testType == TestType.ENCODING_LIST) {
      (WalkerEncodeListTestInput memory decoded) = abi.decode(input, (WalkerEncodeListTestInput));
      require(decoded.expected.toSlice().toKeccak() == decoded.data.encodeList().toBytes().toSlice().toKeccak());
    } else require(false, "invalid test type");
  }
}
