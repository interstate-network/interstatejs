// pragma solidity ^0.6.0;
// pragma experimental ABIEncoderV2;

// import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
// import { ISO_BlockLib as Block } from "../common/blocks/ISO_BlockLib.sol";
// import { BlockQueryLib as BQ } from "../common/blocks/BlockQueryLib.sol";
// import { ChainStateLib as CS } from "../common/ChainStateLib.sol";
// import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
// import { ChallengeTypes as CT } from "../challenge/ChallengeTypes.sol";
// import { MessageWitnessLib as Message } from "../common/witness/MessageWitnessLib.sol";
// import { WitnessRollupLib as WRL } from "../challenge/WitnessRollupLib.sol";
// import "../common/ChainStateImplementer.sol";

// contract MockFraudProver is ChainStateImplementer {
//   using Header for Header.ISO_Header;
//   using CL for CL.CommitmentHeader;
//   using Message for Message.MessageWitness;
//   using WRL for WRL.MessageWitnessCommitment;

//   address accessListFraudProvder;

//   constructor(address _accessListFraudProvder) public {
//     accessListFraudProvder = _accessListFraudProvder;
//   }

//   function testProof(
//     CL.CommitmentHeaderQuery memory blockQuery,
//     WRL.MessageWitnessCommitmentQuery memory witnessQuery,
//     Message.MessageWitness memory messageWitness,
//     uint256 recordIndex
//   ) public view returns (bool) {
//     require(CS.hasWitnessCommitment(chainState, witnessQuery), "Witness commitment not found.");
//     require(witnessQuery.witnessCommitment.witnessHash == keccak256(abi.encode(messageWitness)), "Witness hash mismatch.");
//     require(recordIndex < messageWitness.access_list.length, "Record out of range.");
//     require(witnessQuery.blockHash == blockQuery.commitment.blockHash, "Block hash mismatch.");
//     // return (
//     //    &&
//     //   witnessQuery.witnessCommitment.witnessHash == keccak256(abi.encode(messageWitness)) &&
//     //   recordIndex < messageWitness.access_list.length &&
//     //   witnessQuery.blockHash == blockQuery.commitment.blockHash
//     // );
//   }

//   function setupAccessListFraudTest(
//     Header.ISO_Header memory header,
//     Message.MessageWitness memory messageWitness
//     // WRL.MessageWitnessCommitmentQuery memory witnessQuery
//   ) public {
//     bytes32 blockHash = header.blockHash();
//     bytes32[] memory siblings = new bytes32[](0);
//     uint256[] memory callDepthIndex = new uint256[](0);
//     bytes[] memory witnessCommitments = new bytes[](1);
//     WRL.MessageWitnessCommitmentQuery memory witnessQuery = WRL.MessageWitnessCommitmentQuery(
//       header.blockHash(),
//       0,
//       0,
//       siblings,
//       WRL.MessageWitnessCommitment(
//         callDepthIndex,
//         bytes32(0),
//         bytes32(0),
//         messageWitness.witnessHash()
//       )
//     );
//     witnessCommitments[0] = witnessQuery.witnessCommitment.toBytes();
//     chainState.challengesByBlock[blockHash].witnessRoots[0] = WRL.witnessRollup(witnessCommitments);
//     chainState.pendingBlocks[header.parentHash].push(header.toCommitment().commitmentHash());
//   }

//   function proveAccessListFraud(bytes memory data) public {
//     assembly {
//       let ok := delegatecall(gas(), sload(accessListFraudProvder_slot), add(data, 32), mload(data), 0, 0)
//       if iszero(ok) {
//         let ptr := mload(0x40)
//         returndatacopy(ptr, 0, returndatasize())
//         revert(ptr, returndatasize())
//       }
//     }
//   }
// }