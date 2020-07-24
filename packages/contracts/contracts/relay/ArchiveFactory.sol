pragma solidity ^0.6.0;

contract ArchiveFactory {
  address tempRuntimeAddress;
  function archiveContract(address proxyAddress, address runtimeCodeAddress)
  external returns (address archiveAddress) {
    tempRuntimeAddress = runtimeCodeAddress;
    bytes memory code = type(ArchiveInitializer).creationCode;
    assembly {
      archiveAddress := create2(0, add(code, 0x20), mload(code), proxyAddress)
    }
  }

  fallback() external {
    assembly {
      let addr := sload(tempRuntimeAddress_slot)
      let ptr := mload(0x40)
      mstore(ptr, addr)
      return(ptr, 0x20)
    }
  }
}

contract ArchiveInitializer {
  constructor() public payable {
    assembly {
      let ptr := mload(0x40)
      let success := call(gas(), caller(), callvalue(), 0, 0, ptr, 0x20)
      let runtimeAddress := mload(ptr)
      let size := extcodesize(runtimeAddress)
      mstore(ptr, 0)
      extcodecopy(runtimeAddress, add(ptr, 1), 0, size)
      return(ptr, add(size, 1))
    }
  }
}