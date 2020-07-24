pragma solidity ^0.6.0;

import "../../relay/ArchiveFactory.sol";

contract TestArchive {
  function getInitCodeHash() public pure returns (bytes32) {
    return keccak256(type(ArchiveInitializer).creationCode);
  }

  function getC2Address(address deployer, address proxy, bytes32 initCodeHash)
  public pure returns(address _address) {
    bytes memory input = new bytes(85);
    assembly {
      mstore8(add(input, 0x20), 0xff) // 1
      mstore(add(input, 0x21), shl(0x60, deployer)) // 20
      mstore(add(input, 0x35), proxy) // 32
      mstore(add(input, 0x55), initCodeHash) // 32
      let mask := 0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff
      _address := and(mask, keccak256(add(input, 0x20), 85))
    }
  }

  function checkCode(address redeployed, address archived)
  public view returns (bool _codeMatch) {
    assembly {
      let ptr := mload(0x40)
      mstore(ptr, 0)
      let size := extcodesize(redeployed)
      extcodecopy(redeployed, add(ptr, 0x01), 0, size)
      let codeHash_expected := keccak256(ptr, add(size, 0x01))
      let codeHash_real := extcodehash(archived)
      _codeMatch := eq(codeHash_expected, codeHash_real)
    }
  }

  function putContract(bytes memory code) internal returns (address _deployed) {
    assembly {
      _deployed := create(0, add(code, 0x20), mload(code))
    }
  }

  function doTest() external returns (address, address) {
    ArchiveFactory factory = new ArchiveFactory();
    bytes memory _code = hex"6005598160098239f3aabbccddee";
    address toDeploy = putContract(_code);
    address archive = factory.archiveContract(address(0), toDeploy);
    address _c2 = getC2Address(address(factory), address(0), keccak256(type(ArchiveInitializer).creationCode));
    require(archive == _c2, "Archive address bad");
    require(checkCode(toDeploy, archive), "Code hash does not match.");
    return (archive, _c2);
  }
}