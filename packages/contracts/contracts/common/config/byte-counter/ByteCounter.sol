pragma solidity ^0.6.0;

contract ByteCounter {
  function countBytes(bytes calldata)
  external pure returns (uint256 zeroBytes, uint256 nonZeroBytes) {
    assembly {
      let ptr := 68
      let end := add(ptr, calldataload(36))
      for {let i := 68} lt(i, end) {i := add(i, 1)} {
        let _byte := byte(0, calldataload(i))
        switch iszero(_byte)
          case true { zeroBytes := add(zeroBytes, 1) }
          default { nonZeroBytes := add(nonZeroBytes, 1) }
      }
    }
  }
}