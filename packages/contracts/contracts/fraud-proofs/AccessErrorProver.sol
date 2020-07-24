pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateImplementer as Stateful } from "../common/ChainStateImplementer.sol";
import { MessageWitnessLib as Message } from "../common/witness/MessageWitnessLib.sol";
import { AccessRecordLib as Access } from "../common/witness/AccessRecordLib.sol";
import { ChainStateLib as State } from "../common/ChainStateLib.sol";
import { ConfigLib as Config } from "../common/config/ConfigLib.sol";
import { StateProofLib as StateProof } from "./lib/StateProofLib.sol";
import { RLPAccountLib as Account } from "../utils/type-encoders/RLPAccountLib.sol";
import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
import { InclusionProofLib as InclusionProof } from "./lib/InclusionProofLib.sol";
import { ExitProofLib as ExitProof } from "./lib/ExitProofLib.sol";
import { OutgoingTransactionLib as OutgoingTx } from "../common/transactions/OutgoingTransactionLib.sol";

contract AccessErrorProver is Stateful {
  using Account for Account.Account;
  using State for State.ChainState;
  using InclusionProof for State.ChainState;

  function proveExtCodeHashError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory stateProof
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateExtCodeHashErrorProof(witness, recordIndex, stateProof);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateExtCodeHashErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory stateProof
  ) internal view {
    // decode the record
    Access.ExtCodeHashWitness memory record = Access.toExtCodeHashWitness(
      getRecord(messageWitness, recordIndex, 0x3f)
    );
    // verify the provided state proof and decode the account
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      Message.getLastState(messageWitness, recordIndex),
      record.target,
      stateProof
    );
    require(account.codeHash != record.value, "Record had valid codehash.");
  }

  function proveExtCodeSizeError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory stateProof
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateExtCodeSizeErrorProof(witness, recordIndex, stateProof);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateExtCodeSizeErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory stateProof
  ) internal view {
    Access.ExtCodeSizeWitness memory record = Access.toExtCodeSizeWitness(
      getRecord(messageWitness, recordIndex, 0x3b)
    );
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      Message.getLastState(messageWitness, recordIndex),
      record.target,
      stateProof
    );
    if (account.codeHash == 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470) {
      /* if the account did not exist, expect the record to have 0 as the size */
      require(record.size != 0, "Record had valid size.");
    } else {
      /* if the account existed, compare the size to the archive */
      address archived = chainState.getContractArchiveAddress(record.target);
      uint256 size;
      assembly { size := sub(extcodesize(archived), 1) } // remove 1 for leading 0
      require(record.size != size, "Record had valid size.");
    }
  }

  function proveExtCodeCopyError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory stateProof
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateExtCodeCopyErrorProof(witness, recordIndex, stateProof);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateExtCodeCopyErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory stateProof
  ) internal view {
    // decode the record
    Access.ExtCodeCopyWitness memory record = Access.toExtCodeCopyWitness(
      getRecord(messageWitness, recordIndex, 0x3c)
    );
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      Message.getLastState(messageWitness, recordIndex),
      record.target,
      stateProof
    );
    if (account.codeHash == 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470) {
      require(record.exists, "Record had correct value.");
    } require(!record.exists, "Record had correct value.");
  }

  function proveChainIdError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateChainIdErrorProof(witness, recordIndex);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateChainIdErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex
  ) internal pure {
    // decode the record
    Access.ChainidWitness memory record = Access.toChainidWitness(
      getRecord(messageWitness, recordIndex, 0x46)
    );
    require(record.value != Config.CHAIN_ID(), "Record had correct chainid.");
  }

  function proveCoinbaseError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateCoinbaseErrorProof(witness, recordIndex, commitmentQuery.commitment);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateCoinbaseErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    CL.CommitmentHeader memory commitment
  ) internal pure {
    // decode the record
    Access.CoinbaseWitness memory record = Access.toCoinbaseWitness(
      getRecord(messageWitness, recordIndex, 0x41)
    );
    require(record.coinbase != commitment.coinbase, "Record had correct coinbase value.");
  }

  function proveTimestampError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    Header.ISO_Header memory header
  ) public {
    require(
      Header.blockHash(header) == commitmentQuery.commitment.blockHash,
      "Invalid header."
    );
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateTimestampErrorProof(witness, recordIndex, header);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateTimestampErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    Header.ISO_Header memory header
  ) internal pure {
    // decode the record
    Access.TimestampWitness memory record = Access.toTimestampWitness(
      getRecord(messageWitness, recordIndex, 0x42)
    );
    require(record.timestamp != header.timestamp, "Record had correct timestamp value.");
  }

  function proveNumberError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    Header.ISO_Header memory header
  ) public {
    require(
      Header.blockHash(header) == commitmentQuery.commitment.blockHash,
      "Invalid header."
    );
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateNumberErrorProof(witness, recordIndex, header);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateNumberErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    Header.ISO_Header memory header
  ) internal pure {
    // decode the record
    Access.NumberWitness memory record = Access.toNumberWitness(
      getRecord(messageWitness, recordIndex, 0x43)
    );
    require(record.number != header.number, "Record had correct number value.");
  }

  function proveBalanceError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory stateProof
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateBalanceErrorProof(witness, recordIndex, stateProof);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /* <-- Begin State Fraud Proofs --> */
  function validateBalanceErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory stateProof
  ) internal view {
    // decode the record
    Access.BalanceWitness memory record = Access.toBalanceWitness(
      getRecord(messageWitness, recordIndex, 0x31)
    );
    // get the state root prior to the operation
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      Message.getLastState(messageWitness, recordIndex),
      record.target,
      stateProof
    );
    require(account.balance != record.balance, "Record had correct balance.");
  }

  function proveSelfBalanceError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory stateProof
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateSelfBalanceErrorProof(witness, recordIndex, stateProof);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateSelfBalanceErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory stateProof
  ) internal view {
    // decode the record
    Access.SelfBalanceWitness memory record = Access.toSelfBalanceWitness(
      getRecord(messageWitness, recordIndex, 0x47)
    );
    // get the state root prior to the operation
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      Message.getLastState(messageWitness, recordIndex),
      messageWitness.context,
      stateProof
    );
    require(account.balance != record.balance, "Record had correct balance.");
  }

  function proveSloadError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory accountProof,
    bytes memory storageProof
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    validateSloadErrorProof(witness, recordIndex, accountProof, storageProof);
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateSloadErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory accountProof,
    bytes memory storageProof
  ) internal view {
    // decode the record
    Access.SloadWitness memory record = Access.toSloadWitness(
      getRecord(messageWitness, recordIndex, 0x54)
    );
    // verify the provided state proof and decode the account
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      Message.getLastState(messageWitness, recordIndex),
      messageWitness.context,
      accountProof
    );
    // verify the provided storage proof
    if (account.hasEmptyState()) {
      require(record.value != 0, "Record had correct value.");
      return;
    }
    bytes32 provenValue = StateProof.proveStorageValue(
      chainState.sparse,
      account,
      record.slot,
      storageProof
    );

    /* if we have a valid proof in last state that doesn't match the record, the record is fraudulent */
    require(record.value != provenValue, "Record had correct value.");
  }

  function proveSstoreError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory accountProof,
    bytes memory storageProof
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(
      commitmentQuery,
      transactionIndex,
      witnessBytes
    );
    validateSstoreErrorProof(
      witness,
      recordIndex,
      accountProof,
      storageProof
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /**
   * @dev Prove that an sstore record in a message witness has
   * an invalid output state root or gas refund.
   */
  function validateSstoreErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory accountProof,
    bytes memory storageProof
  ) internal view {
    // decode the record
    Access.SstoreWitness memory record = Access.toSstoreWitness(
      getRecord(messageWitness, recordIndex, 0x55)
    );
    (bytes32 oldValue, bytes32 newRoot) = StateProof.proveAndUpdateAccountStorage(
      chainState.sparse,
      Message.getLastState(messageWitness, recordIndex),
      messageWitness.context,
      record.slot,
      record.value,
      accountProof,
      storageProof
    );
    if (record.stateRoot != newRoot) return;
    
    require(
      record.refund != (
        record.value == bytes32(0)
          ? oldValue == bytes32(0) ? 15000 : 30000
          : oldValue == bytes32(0) ? 0 : 15000
      ),
      "Record had correct refund and output root."
    );
  }




  function proveExitCallError(
    Header.ISO_Header memory header,
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory callData,
    bytes memory callerProof,
    bytes memory stateProofBytes,
    bytes memory storageProofBytes,
    bytes memory transactionProofBytes
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(
      commitmentQuery,
      transactionIndex,
      witnessBytes
    );
    require(
      Header.blockHash(header) == commitmentQuery.commitment.blockHash,
      "Invalid header."
    );
    validateExitCallErrorProof(
      header,
      witness,
      recordIndex,
      callData,
      callerProof,
      stateProofBytes,
      storageProofBytes,
      transactionProofBytes
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }
  /**
   * @dev Prove that an exit call record was executed incorrectly.
   * This can be proven if the target was a contract but the call succeeded anyways,
   * if the target was an EOA and the output state root is incorrect, or if the 
   */
  function validateExitCallErrorProof(
    Header.ISO_Header memory header,
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory callData,
    bytes memory callerProof,
    bytes memory stateProofBytes,
    bytes memory storageProofBytes,
    bytes memory transactionProofBytes
  ) internal view {
    Access.CallWitness memory record = Access.toCallWitness(
      getRecord(messageWitness, recordIndex, 0xf1)
    );
    require(
      record.to == Config.childRelayAddress(),
      "Can not use calls to child relay for this proof."
    );
    require(
      keccak256(callData) == record.calldataHash,
      "Invalid calldata buffer."
    );
    bytes memory encodedTx = OutgoingTx.toBytes(
      OutgoingTx.fromExitCalldata(
        callData, messageWitness.context, record.value, record.gas
      )
    );
    bytes32 previousRoot = Message.getLastState(messageWitness, recordIndex);
    (bool valid, bytes32 updatedRoot) = StateProof.subtractBalanceAllowError(
      chainState.sparse,
      previousRoot,
      messageWitness.context,
      callerProof,
      record.value
    );
    if (!valid) {
      require(
        record.success || record.stateRoot != previousRoot,
        "No errors found in call record."
      );
      return;
    }

    updatedRoot = ExitProof.updateExitsRoot(
      chainState.sparse,
      updatedRoot,
      header.number,
      stateProofBytes,
      storageProofBytes,
      transactionProofBytes,
      encodedTx
    );
    require(
      !record.success || updatedRoot != record.stateRoot,
      "No errors found in call record."
    );
  }

  function proveStaticCallError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory callData
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(
      commitmentQuery,
      transactionIndex,
      witnessBytes
    );
    validateStaticCallErrorProof(
      witness,
      recordIndex,
      callData
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function validateStaticCallErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory callData
  ) internal view {
    bytes memory recordBytes = getRecord(messageWitness, recordIndex, 0xfa);
    Access.StaticCallWitness memory record = Access.toStaticCallWitness(recordBytes);
    uint256 addressNum = uint256(record.to);
    require(
      keccak256(callData) == record.calldataHash,
      "Invalid calldata provided."
    );
    /* Static calls are only allowed to target the precompile contracts. */
    if (addressNum < 1 || addressNum > 9) {
      require(record.success, "Record had valid failure.");
      return;
    }
    require(gasleft() >= (record.gas + 50000), "Insufficient gas.");
    (bool success, bytes memory returnData) = record.to.staticcall{gas: gasleft()}(callData);
    require(
      record.success != success ||
      keccak256(returnData) != keccak256(record.returndata),
      "No errors found in record."
    );
    // TODO Add handling for gas
  }

  function proveCallError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    bytes memory witnessBytes,
    uint256 transactionIndex,
    uint256 recordIndex,
    bytes memory callerProof,
    bytes memory receiverProof
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(
      commitmentQuery,
      transactionIndex,
      witnessBytes
    );
    validateCallErrorProof(
      witness,
      recordIndex,
      callerProof,
      receiverProof
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /**
   * @dev Prove that a call access record is invalid.
   * The record can be invalid if any of the following are true:
   * - The recipient was a contract and the call succeeded
   * - The caller had insufficient balance and the call succeeded
   * - The output state root does not match the state transition
   *
   * This function will fail if the recipient is the child relay
   * contract, which must be handled with a separate function.
   *
   * Note: This is an incomplete fraud proof function which is a 
   * temporary stand-in for the complete fraud proof.
   */
  function validateCallErrorProof(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    bytes memory callerProof,
    bytes memory receiverProof
  ) internal view {
    Access.CallWitness memory record = Access.toCallWitness(
      getRecord(messageWitness, recordIndex, 0xf1)
    );
    
    bytes32 previousRoot = Message.getLastState(messageWitness, recordIndex);
    (bool valid, bytes32 updatedRoot) = StateProof.subtractBalanceAllowError(
      chainState.sparse,
      previousRoot,
      messageWitness.caller,
      callerProof,
      record.value
    );

    if (!valid) {
      // If the caller had an insufficient balance, the state root should be the
      // input root and the call should have failed.
      require(
        record.success || record.stateRoot != previousRoot,
        "No errors found in call record."
      );
      return;
    }

    require(
      record.to != Config.childRelayAddress(),
      "Can not use calls to child relay for this proof."
    );

    Account.Account memory receiver;
    (updatedRoot, receiver) = StateProof.increaseBalance(
      chainState.sparse,
      updatedRoot,
      record.to,
      receiverProof,
      record.value
    );
    if (Account.isContract(receiver)) {
      // Calls to contracts are temporarily disabled
      require(
        record.success || record.stateRoot != previousRoot,
        "No errors found in call record."
      );
    } else {
      require(
        !record.success || record.stateRoot != updatedRoot,
        "No errors found in call record."
      );
    }
  }

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
  ) internal view returns (
    Message.MessageWitness memory witness,
    address challenger
  ) {
    bytes32 witnessHash = keccak256(witnessBytes);
    require(
      chainState.hasWitnessForPendingBlock(commitmentQuery, transactionIndex, witnessHash),
      "Invalid pending block or witness."
    );
    witness = Message.fromBytes(witnessBytes);
    challenger = chainState
      .challengesByBlock[commitmentQuery.commitment.blockHash]
      .challengesByTransaction[transactionIndex]
      .challenger;
  }

  function getRecord(
    Message.MessageWitness memory messageWitness,
    uint256 recordIndex,
    uint256 opcode
  ) internal pure returns (bytes memory accessRecord) {
    accessRecord = messageWitness.access_list[recordIndex]; // get the encoded access record from the access list
    uint256 _opcode;
    assembly { _opcode := mload(add(accessRecord, 0x20)) }
    require(_opcode == opcode, "Record not for correct operation.");
  }
}