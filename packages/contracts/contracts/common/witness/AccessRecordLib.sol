pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

library AccessRecordLib {
  struct SloadWitness {
		uint256 opcode;
		bytes32 slot;
		bytes32 value;
	}

	function toSloadWitness(bytes memory data)
	internal pure returns (SloadWitness memory) {
		(uint256 opcode, bytes32 slot, bytes32 value) = abi.decode(
      (data), (uint256, bytes32, bytes32)
    );
		return SloadWitness(opcode, slot, value);
	}

	struct SstoreWitness {
		uint256 opcode;
		bytes32 stateRoot;
		bytes32 slot;
		bytes32 value;
		uint256 refund;
	}

	function toSstoreWitness(bytes memory data)
	internal pure returns (SstoreWitness memory) {
		(
			uint256 opcode, bytes32 stateRoot,
      bytes32 slot, bytes32 value, uint256 refund
		) = abi.decode(
      (data), (uint256, bytes32, bytes32, bytes32, uint256)
    );
		return SstoreWitness(opcode, stateRoot, slot, value, refund);
	}

	struct StaticCallWitness {
		uint256 opcode;
		uint256 gas;
		uint256 gasUsed;
		address to;
		bytes32 calldataHash;
		bool success;
		bytes returndata;
	}

	function toStaticCallWitness(bytes memory data)
	internal pure returns (StaticCallWitness memory) {
		(
			uint256 opcode, uint256 gas, uint256 gasUsed, address to,
			bytes32 calldataHash, bool success, bytes memory returndata
		) = abi.decode(
      (data),
      (uint256, uint256, uint256, address, bytes32, bool, bytes)
    );
		return StaticCallWitness(opcode, gas, gasUsed, to, calldataHash, success, returndata);
	}

	struct DelegateCallWitness {
		uint256 opcode;
		bytes32 stateRoot;
		uint256 gas;
		uint256 gasUsed;
		uint256 gasRefund;
		address to;
		bytes32 calldataHash;
		bool success;
		bytes returndata;
	}

	function toDelegateCallWitness(bytes memory data)
	internal pure returns (DelegateCallWitness memory) {
		(
			uint256 opcode, bytes32 stateRoot, uint256 gas,
      uint256 gasUsed, uint256 gasRefund, address to,
      bytes32 calldataHash, bool success, bytes memory returndata
		) = abi.decode(
      (data),
      (uint256, bytes32, uint256, uint256, uint256, address, bytes32, bool, bytes)
    );
		return DelegateCallWitness(
      opcode, stateRoot, gas, gasUsed, gasRefund, to, calldataHash, success, returndata
    );
	}

	struct CallWitness {
		uint256 opcode;
		bytes32 stateRoot;
		uint256 gas;
		uint256 gasUsed;
		uint256 gasRefund;
		address to;
		uint256 value;
		bytes32 calldataHash;
		bool success;
		bytes returndata;
	}

	function toCallWitness(bytes memory data)
	internal pure returns (CallWitness memory) {
		(
			uint256 opcode, bytes32 stateRoot, uint256 gas, uint256 gasUsed,
			uint256 gasRefund, address to, uint256 value, bytes32 calldataHash,
			bool success, bytes memory returndata
		) = abi.decode(
			(data),
			(uint256, bytes32, uint256, uint256, uint256, address, uint256, bytes32, bool, bytes)
		);
		return CallWitness(
			opcode, stateRoot, gas, gasUsed, gasRefund,
			to, value, calldataHash, success, returndata
		);
	}

	struct BalanceWitness {
		uint256 opcode;
		address target;
		uint256 balance;
	}

	function toBalanceWitness(bytes memory data)
	internal pure returns (BalanceWitness memory) {
		(uint256 opcode, address target, uint256 balance) = abi.decode(
      (data), (uint256, address, uint256)
    );
		return BalanceWitness(opcode, target, balance);
	}

	struct SelfBalanceWitness {
		uint256 opcode;
		uint256 balance;
	}

	function toSelfBalanceWitness(bytes memory data)
	internal pure returns (SelfBalanceWitness memory) {
		(uint256 opcode, uint256 balance) = abi.decode((data), (uint256, uint256));
		return SelfBalanceWitness(opcode, balance);
	}

	struct ExtCodeHashWitness {
		uint256 opcode;
		address target;
		bytes32 value;
	}

	function toExtCodeHashWitness(bytes memory data)
	internal pure returns (ExtCodeHashWitness memory) {
		(uint256 opcode, address target, bytes32 value) = abi.decode((data), (uint256, address, bytes32));
		return ExtCodeHashWitness(opcode, target, value);
	}

	struct ExtCodeSizeWitness {
		uint256 opcode;
		address target;
		uint256 size;
	}

	function toExtCodeSizeWitness(bytes memory data)
	internal pure returns (ExtCodeSizeWitness memory) {
		(
			uint256 opcode, address target, uint256 size
		) = abi.decode((data), (uint256, address, uint256));
		return ExtCodeSizeWitness(opcode, target, size);
	}

	struct ExtCodeCopyWitness {
		uint256 opcode;
		address target;
		bool exists;
	}

	function toExtCodeCopyWitness(bytes memory data)
	internal pure returns (ExtCodeCopyWitness memory) {
		(
			uint256 opcode, address target, bool exists
		) = abi.decode((data), (uint256, address, bool));
		return ExtCodeCopyWitness(opcode, target, exists);
	}

	struct CoinbaseWitness {
		uint256 opcode;
		address coinbase;
	}

	function toCoinbaseWitness(bytes memory data)
	internal pure returns (CoinbaseWitness memory) {
		(uint256 opcode, address coinbase) = abi.decode((data), (uint256, address));
		return CoinbaseWitness(opcode, coinbase);
	}

	struct TimestampWitness {
		uint256 opcode;
		uint256 timestamp;
	}

	function toTimestampWitness(bytes memory data)
	internal pure returns (TimestampWitness memory) {
		(uint256 opcode, uint256 timestamp) = abi.decode((data), (uint256, uint256));
		return TimestampWitness(opcode, timestamp);
	}

	struct NumberWitness {
		uint256 opcode;
		uint256 number;
	}

	function toNumberWitness(bytes memory data)
	internal pure returns (NumberWitness memory) {
		(uint256 opcode, uint256 number) = abi.decode((data), (uint256, uint256));
		return NumberWitness(opcode, number);
	}

	struct DifficultyWitness {
		uint256 opcode;
		uint256 difficulty;
	}

	function toDifficultyWitness(bytes memory data)
	internal pure returns (DifficultyWitness memory) {
		(uint256 opcode, uint256 difficulty) = abi.decode((data), (uint256, uint256));
		return DifficultyWitness(opcode, difficulty);
	}

	struct GaslimitWitness {
		uint256 opcode;
		uint256 gaslimit;
	}

	function toGaslimitWitness(bytes memory data)
	internal pure returns (GaslimitWitness memory) {
		(uint256 opcode, uint256 gaslimit) = abi.decode((data), (uint256, uint256));
		return GaslimitWitness(opcode, gaslimit);
	}

	struct ChainidWitness {
		uint256 opcode;
		uint256 value;
	}

	function toChainidWitness(bytes memory data)
	internal pure returns (ChainidWitness memory) {
		(uint256 opcode, uint256 value) = abi.decode((data), (uint256, uint256));
		return ChainidWitness(opcode, value);
	}

	struct BlockHashWitness {
		uint256 opcode;
		uint256 number;
		bytes32 value;
	}

	function toBlockHashWitness(bytes memory data)
	internal pure returns (BlockHashWitness memory) {
		(uint256 opcode, uint256 number, bytes32 value) = abi.decode(
      (data), (uint256, uint256, bytes32)
    );
		return BlockHashWitness(opcode, number, value);
	}

	struct Log0Witness {
		uint256 opcode;
		bytes32 dataHash;
	}

	function toLog0Witness(bytes memory data)
	internal pure returns (Log0Witness memory) {
		(uint256 opcode, bytes32 dataHash) = abi.decode((data), (uint256, bytes32));
		return Log0Witness(opcode, dataHash);
	}

	struct Log1Witness {
		uint256 opcode;
		bytes32 topic;
		bytes32 dataHash;
	}

	function toLog1Witness(bytes memory data)
	internal pure returns (Log1Witness memory) {
		(uint256 opcode, bytes32 topic, bytes32 dataHash) = abi.decode(
      (data), (uint256, bytes32, bytes32)
    );
		return Log1Witness(opcode, topic, dataHash);
	}

	struct Log2Witness {
		uint256 opcode;
		bytes32 topic0;
		bytes32 topic1;
		bytes32 dataHash;
	}

	function toLog2Witness(bytes memory data)
	internal pure returns (Log2Witness memory) {
		(uint256 opcode, bytes32 topic0, bytes32 topic1, bytes32 dataHash) = abi.decode(
      (data), (uint256, bytes32, bytes32, bytes32)
    );
		return Log2Witness(opcode, topic0, topic1, dataHash);
	}

	struct Log3Witness {
		uint256 opcode;
		bytes32 topic0;
		bytes32 topic1;
		bytes32 topic2;
		bytes32 dataHash;
	}

	function toLog3Witness(bytes memory data)
	internal pure returns (Log3Witness memory) {
		(
			uint256 opcode, bytes32 topic0, bytes32 topic1,
      bytes32 topic2, bytes32 dataHash
		) = abi.decode(
      (data), (uint256, bytes32, bytes32, bytes32, bytes32)
    );
		return Log3Witness(opcode, topic0, topic1, topic2, dataHash);
	}

	struct Log4Witness {
		uint256 opcode;
		bytes32 topic0;
		bytes32 topic1;
		bytes32 topic2;
		bytes32 topic3;
		bytes32 dataHash;
	}

	function toLog4Witness(bytes memory data)
	internal pure returns (Log4Witness memory) {
		(
			uint256 opcode, bytes32 topic0, bytes32 topic1,
      bytes32 topic2, bytes32 topic3, bytes32 dataHash
		) = abi.decode((data), (uint256, bytes32, bytes32, bytes32, bytes32, bytes32));
		return Log4Witness(opcode, topic0, topic1, topic2, topic3, dataHash);
	}
}