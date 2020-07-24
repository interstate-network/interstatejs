pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateImplementer as Stateful } from "../common/ChainStateImplementer.sol";
import { ConfigLib as Config } from "../common/config/ConfigLib.sol";
import { ChainStateLib as State } from "../common/ChainStateLib.sol";
import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
import { SignedTransactionLib as SignedTx } from "../common/transactions/SignedTransactionLib.sol";
import { OutgoingTransactionLib as OutgoingTx } from "../common/transactions/OutgoingTransactionLib.sol";
import { MessageWitnessLib as Message } from "../common/witness/MessageWitnessLib.sol";
import { InclusionProofLib as InclusionProof } from "./lib/InclusionProofLib.sol";
import { AccessRecordLib as Access } from "../common/witness/AccessRecordLib.sol";


contract EncodingErrorProver is Stateful {
  using State for State.ChainState;
  using Header for Header.ISO_Header;
  using SignedTx for SignedTx.SignedTransaction;
  using InclusionProof for State.ChainState;
  using InclusionProof for Header.ISO_Header;

  function handleSuccess(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    address challenger
  ) internal {
    chainState.markFraudulentBlock(commitmentQuery);
    Config.rewardSuccessfulChallenge(challenger);
    delete chainState
      .challengesByBlock[commitmentQuery.commitment.blockHash]
      .challengesByTransaction[transactionIndex];
    delete chainState
      .challengesByBlock[commitmentQuery.commitment.blockHash]
      .witnessHashes[transactionIndex];
  }

  function validateWitnessInclusion(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes
  ) internal view returns (address) {
    bytes32 witnessHash = keccak256(witnessBytes);
    require(
      chainState.hasWitnessForPendingBlock(commitmentQuery, transactionIndex, witnessHash),
      "Invalid pending block or witness."
    );
    return chainState
      .challengesByBlock[commitmentQuery.commitment.blockHash]
      .challengesByTransaction[transactionIndex]
      .challenger;
  }

  // function validateHeader(
  //   CL.CommitmentHeaderQuery memory commitmentQuery,
  //   Header.ISO_Header memory header
  // ) internal view {
  //   require(chainState.hasPendingBlock(commitmentQuery), "Block not pending.");
  //   require(
  //     commitmentQuery.commitment.blockHash == header.blockHash(),
  //     "Header does not match commitment."
  //   );
  // }

  function proveIncomingTransactionEncodingError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    require(
      transactionIndex < header.incomingTransactionsCount,
      "Not an incoming transaction."
    );
    require(
      header.hasTransaction(transaction, transactionIndex, siblings),
      "Invalid transaction proof."
    );
    require(transaction.length != 32, "Transaction had valid encoding.");
    chainState.markFraudulentBlock(commitmentQuery);
  }

  function proveSignedTransactionEncodingError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    header.validateSignedTransaction(
      transaction,
      transactionIndex,
      siblings
    );
    require(
      gasleft() > 150000, // Rough estimate of upper bound - could be more precise
      "Insufficient gas."
    );
    (bool success,) = chainState.encodingErrorProver.staticcall{gas: gasleft()}(
      abi.encodeWithSignature(
      "tryDecodeSignedTransaction(bytes)",
        transaction
      )
    );
    require(!success, "Decoding error not found.");
    chainState.markFraudulentBlock(commitmentQuery);
  }

  function proveTransactionSignatureError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    header.validateSignedTransaction(
      transaction,
      transactionIndex,
      siblings
    );
    SignedTx.SignedTransaction memory _tx = SignedTx.decodeTransaction(transaction);
    address signer = _tx.getSenderAddress();
    require(signer == address(0), "Signature error not found.");
    chainState.markFraudulentBlock(commitmentQuery);
  }

  function proveMessageWitnessEncodingError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes
  ) public {
    address challenger = validateWitnessInclusion(
      commitmentQuery, transactionIndex, witnessBytes
    );
    require(
      gasleft() > 150000, // Rough estimate of upper bound - could be more precise
      "Insufficient gas."
    );
    (bool success,) = chainState.encodingErrorProver.staticcall{gas: gasleft()}(
      abi.encodeWithSignature(
      "tryDecodeMessageWitness(witnessBytes)",
        witnessBytes
      )
    );
    require(!success, "Decoding error not found.");
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function proveAccessRecordEncodingError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory witnessBytes
  ) public {
    address challenger = validateWitnessInclusion(
      commitmentQuery, transactionIndex, witnessBytes
    );
    require(
      gasleft() > 150000, // Rough estimate of upper bound - could be more precise
      "Insufficient gas."
    );
    Message.MessageWitness memory witness = Message.fromBytes(witnessBytes);
    (bool success,) = chainState.encodingErrorProver.staticcall{gas: gasleft()}(
      abi.encodeWithSignature(
      "tryDecodeAccessRecord(bytes)",
        witness.access_list[recordIndex]
      )
    );
    require(!success, "Decoding error not found.");
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /**
   * @dev Prove that a message witness targeting the child relay had
   * a passing status when it was invalid, or a failing status
   * when it was valid.
   * Note: This is not strictly an encoding error, in that it is not
   * a proof of the witness itself being encoded incorrectly. It is
   * a proof that the witness data had a valid/invalid call to the child
   * relay which is not reflected in the witness status.
   * Unlike the call record proof of the same type, success here should
   * always indicate success in the call itself, as signed transactions
   * with invalid initial conditions (such as sufficient balance or correct
   * nonce) should never be included in blocks.
   */
  function proveExitWitnessEncodingError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes
  ) public {
    address challenger = validateWitnessInclusion(
      commitmentQuery, transactionIndex, witnessBytes
    );
    Message.MessageWitness memory witness = Message.fromBytes(witnessBytes);
    require(
      gasleft() > 150000, // Rough estimate of upper bound - could be more precise
      "Insufficient gas."
    );
    (bool success,) = chainState.encodingErrorProver.staticcall{gas: gasleft()}(
      abi.encodeWithSignature(
      "tryDecodeOutgoingTransaction(bytes,address,uint256,uint256)",
        witness.callData,
        witness.caller,
        witness.gasAvailable,
        witness.callvalue
      )
    );
    bool witnessSuccess = witness.status == 1;
    require(
      success != witnessSuccess,
      "Witness had correct status"
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /**
   * @dev Prove that a call access record targeting the child relay had
   * a passing status when it was invalid, or a failing status
   * when it was valid.
   * Note: This is not strictly an encoding error, in that it is not
   * a proof of the witness itself being encoded incorrectly. It is
   * a proof that the witness data had an invalid call to the child
   * relay which is not reflected in the witness status.
   * If the encoding was valid, this does not mean the call should have
   * succeeded, as there is still a necessary validation of the caller
   * balance.
   */
  function proveExitCallEncodingError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes,
    bytes memory callData,
    uint256 recordIndex
  ) public {
    address challenger = validateWitnessInclusion(
      commitmentQuery, transactionIndex, witnessBytes
    );
    Message.MessageWitness memory witness = Message.fromBytes(witnessBytes);
    bytes memory recordBytes = witness.access_list[recordIndex];
    uint256 opcode;
    assembly { opcode := mload(add(recordBytes, 32)) }
    require(opcode == 0xf1, "Not a call record.");
    Access.CallWitness memory record = Access.toCallWitness(recordBytes);
    require(keccak256(callData) == record.calldataHash, "Invalid calldata.");
    require(
      gasleft() > 150000, // Rough estimate of upper bound - could be more precise
      "Insufficient gas."
    );
    (bool success,) = chainState.encodingErrorProver.staticcall{gas: gasleft()}(
      abi.encodeWithSignature(
      "tryDecodeOutgoingTransaction(bytes,address,uint256,uint256)",
        callData,
        witness.context,
        record.gas,
        record.value
      )
    );
    require(
      !success,
      "Encoding error not found."
    );
    bytes32 previousRoot = Message.getLastState(witness, recordIndex);
    require(
      record.success || record.stateRoot != previousRoot,
      "Call witness correctly recorded an error."
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function tryDecodeSignedTransaction(bytes memory transactionBytes)
  public pure {
    SignedTx.SignedTransaction memory _tx = SignedTx.decodeTransaction(transactionBytes);
    // Use the reference so solc will compile the decode instruction
    require(_tx.value >= 0, "Decoding error.");
  }

  function tryDecodeMessageWitness(bytes memory witnessBytes)
  public pure {
    Message.MessageWitness memory witness = Message.fromBytes(witnessBytes);
    require(witness.status < 3, "Decoding error.");
  }

  function tryDecodeOutgoingTransaction(
    bytes memory _data,
    address _caller,
    uint256 _gas,
    uint256 _value
  ) public pure {
    OutgoingTx.OutgoingTransaction memory transaction = OutgoingTx.fromExitCalldata(
      _data,
      _caller,
      _value,
      _gas
    );
    require(transaction.gas >= 0, "Decoding error");
  }


  function tryDecodeAccessRecord(bytes memory recordBytes)
  public pure {
    uint256 opcode;
    assembly { opcode := mload(add(recordBytes, 0x20)) }
    uint256 _opcode;
    if (opcode == 0x31) {
    _opcode = Access.toBalanceWitness(recordBytes).opcode;
    } else if (opcode == 0x3b) {
    _opcode = Access.toExtCodeSizeWitness(recordBytes).opcode;
    } else if (opcode == 0x3c) {
    _opcode = Access.toExtCodeCopyWitness(recordBytes).opcode;
    } else if (opcode == 0x3f) {
    _opcode = Access.toExtCodeHashWitness(recordBytes).opcode;
    }/* else if (opcode == 0x40) {
    _opcode = Access.toBlockHashWitness(recordBytes).opcode;
    }  */else if (opcode == 0x41) {
    _opcode = Access.toCoinbaseWitness(recordBytes).opcode;
    } else if (opcode == 0x42) {
    _opcode = Access.toTimestampWitness(recordBytes).opcode;
    } else if (opcode == 0x43) {
    _opcode = Access.toNumberWitness(recordBytes).opcode;
    }/*  else if (opcode == 0x44) {
    _opcode = Access.toDifficultyWitness(recordBytes).opcode;
    }  */else if (opcode == 0x45) {
    _opcode = Access.toGaslimitWitness(recordBytes).opcode;
    } else if (opcode == 0x46) {
    _opcode = Access.toChainidWitness(recordBytes).opcode;
    } else if (opcode == 0x47) {
    _opcode = Access.toSelfBalanceWitness(recordBytes).opcode;
    } else if (opcode == 0x54) {
    _opcode = Access.toSloadWitness(recordBytes).opcode;
    } else if (opcode == 0x55) {
    _opcode = Access.toSstoreWitness(recordBytes).opcode;
    } else if (opcode == 0xa0) {
    _opcode = Access.toLog0Witness(recordBytes).opcode;
    } else if (opcode == 0xa1) {
    _opcode = Access.toLog1Witness(recordBytes).opcode;
    } else if (opcode == 0xa2) {
    _opcode = Access.toLog2Witness(recordBytes).opcode;
    } else if (opcode == 0xa3) {
    _opcode = Access.toLog3Witness(recordBytes).opcode;
    } else if (opcode == 0xa4) {
    _opcode = Access.toLog4Witness(recordBytes).opcode;
    } else if (opcode == 0xf1) {
    _opcode = Access.toCallWitness(recordBytes).opcode;
    } /* else if (opcode == 0xf2) {
    _opcode = Access.toCallWitness(recordBytes).opcode;
    }  *//* else if (opcode == 0xf4) {
    _opcode = Access.toDelegateCallWitness(recordBytes).opcode;
    }  */else if (opcode == 0xfa) {
    _opcode = Access.toStaticCallWitness(recordBytes).opcode;
    } else revert("Did not recognize opcode");
    require(opcode == _opcode, "Decoding error");
  }
}