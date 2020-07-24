pragma solidity ^0.6.0;

interface IChildRelay {
  function withdraw() external payable;
  function withdrawWithBounty(uint256 bounty) external payable;
  function addTransaction(address to, bytes calldata data) external payable;
  function addTransactionWithBounty(
    address to,
    bytes calldata data,
    uint256 bounty
  ) external payable;
}

contract TestContract {
  IChildRelay private constant relay = IChildRelay(0x21FEFE825AeB285C22892aA8D41D80f812960318);
  uint256 private _value1;
  uint256 private _value2;

  fallback() external payable { return; }
  receive() external payable { return; }

  function executeExtCodeSize() public {
    uint256 size;
    assembly { size := extcodesize(address()) }
    _value2 = size;
  }

  function executeExtCodeHash() public {
    uint256 _hash;
    assembly { _hash := extcodehash(address()) }
    _value2 = _hash;
  }

  function executeExtCodeCopy() public {
    uint256 _hash;
    assembly {
      let ptr := mload(0x40)
      extcodecopy(address(), ptr, 0, 30)
      _hash := keccak256(ptr, 30)
      calldatacopy(ptr, 0, 30)
    }
    _value2 = _hash;
  }

  function executeNumber() public {
    _value2 = block.number;
  }

  function executeCoinbase() public {
    _value2 = uint256(block.coinbase);
  }

  function executeTimestamp() public {
    _value2 = block.timestamp;
  }

  function executeSload() public {
    _value1 += 1;
  }

  function executeBalance() public {
    uint256 _balance;
    assembly { _balance := balance(address()) }
    _value1 = _balance;
  }

  function executeSelfBalance() public {
    uint256 _balance;
    assembly { _balance := selfbalance() }
    _value1 = _balance;
  }

  function executeChainId() public {
    uint256 _chainid;
    assembly { _chainid := chainid() }
    _value1 = _chainid;
  }

  function executeWithdrawal() public payable {
    relay.withdraw{gas: 90000, value: msg.value}();
  }
}