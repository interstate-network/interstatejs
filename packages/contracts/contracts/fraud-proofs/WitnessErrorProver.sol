pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateLib as State } from "../common/ChainStateLib.sol";
import { ChainStateImplementer as Stateful } from "../common/ChainStateImplementer.sol";
import { ConfigLib as Config } from "../common/config/ConfigLib.sol";
import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
import { StateProofLib as StateProof } from "./lib/StateProofLib.sol";
import { PriorStateLib as PriorState } from "./lib/PriorStateLib.sol";
import { RLPAccountLib as Account } from "../utils/type-encoders/RLPAccountLib.sol";
import { SignedTransactionLib as SignedTx } from "../common/transactions/SignedTransactionLib.sol";
import { RelayTransactionLib as IncomingTx } from "../common/transactions/RelayTransactionLib.sol";
import { OutgoingTransactionLib as OutgoingTx } from "../common/transactions/OutgoingTransactionLib.sol";
import { InclusionProofLib as InclusionProof } from "./lib/InclusionProofLib.sol";
import { MessageWitnessLib as Message } from "../common/witness/MessageWitnessLib.sol";
import { ExitProofLib as ExitProof } from "./lib/ExitProofLib.sol";


contract WitnessErrorProver is Stateful {
  using State for State.ChainState;
  using InclusionProof for State.ChainState;
  using InclusionProof for Header.ISO_Header;
  using Header for Header.ISO_Header;
  using SignedTx for SignedTx.SignedTransaction;
  using Message for Message.MessageWitness;

  /**
   * @dev Contains the information needed to prove a transaction
   * exists in a block. This is used to get around the stack limit
   * in some crowded functions.
   */
  struct TransactionProof {
    bytes transactionBytes;
    uint256 transactionIndex;
    bytes32[] siblings;
  }

  /**
   * @dev Prove that the input state root for a message witness is incorrect
   * by executing the state transition from the previous state root to the
   * witness input root.
   * For a signed transaction, this involves subtracting the upfront cost
   * from the caller and increasing the recipient's balance by the transaction
   * value.
   * For an incoming transaction, this involves increasing the recipient's
   * balance by the transaction value.
   */
  function proveWitnessEntryRootError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transactionBytes,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory previousRootProof,
    bytes memory witnessBytes,
    bytes memory stateProof1,
    bytes memory stateProof2
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    require(
      commitmentQuery.commitment.blockHash == header.blockHash(),
      "Header does not match commitment."
    );
    bytes32 stateRoot = PriorState.provePreviousStateRoot(
      header, previousRootProof, transactionIndex
    );
    if (transactionIndex < header.incomingTransactionsCount) {
      /* Incoming transactions can not target the child relay address. */
      IncomingTx.IncomingTransaction memory transaction = abi.decode(
        transactionBytes, (IncomingTx.IncomingTransaction)
      );
      chainState.validateIncomingTransaction(
        header, transaction, transactionIndex, siblings
      );
      (stateRoot,) = StateProof.increaseBalance(
        chainState.sparse,
        stateRoot,
        transaction.to,
        stateProof1,
        transaction.value
      );
    } else {
      SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
        header, transactionBytes, transactionIndex, siblings
      );
      address caller = transaction.getSenderAddress();
      uint256 upfrontCost = transaction.getUpfrontCost();
      stateRoot = StateProof.subtractBalanceAndIncrementNonce(
        chainState.sparse,
        stateRoot,
        caller,
        stateProof1,
        upfrontCost
      );
      /*
        Calls to the relay address do not add value to the relay account,
        and only subtract from the caller.
       */
      if (transaction.to != Config.childRelayAddress()) {
        (stateRoot,) = StateProof.increaseBalance(
          chainState.sparse,
          stateRoot,
          transaction.to,
          stateProof2,
          transaction.value
        );
      }
    }
    require(witness.stateRootEnter != stateRoot, "Witness had valid input root.");
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /**
   * @dev Proves that some of the data in a message witness does
   * not match the transaction that created it.
   */
  function proveWitnessContextError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transactionBytes,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory witnessBytes
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    require(
      commitmentQuery.commitment.blockHash == header.blockHash(),
      "Header does not match commitment."
    );
    bool isValid;
    if (transactionIndex < header.incomingTransactionsCount) {
      IncomingTx.IncomingTransaction memory transaction = abi.decode(
        transactionBytes, (IncomingTx.IncomingTransaction)
      );
      chainState.validateIncomingTransaction(
        header, transaction, transactionIndex, siblings
      );
      isValid = (
        0 == witness.gasPrice &&
        !witness.isStatic &&
        witness.origin == transaction.from &&
        witness.caller == transaction.from &&
        witness.to == transaction.to &&
        witness.context == transaction.to &&
        witness.callvalue == transaction.value &&
        keccak256(witness.callData) == keccak256(transaction.data)
      );
    } else {
      SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
        header, transactionBytes, transactionIndex, siblings
      );
      address caller = transaction.getSenderAddress();
      isValid = (
        witness.gasPrice == transaction.gasPrice &&
        !witness.isStatic &&
        witness.origin == caller &&
        witness.caller == caller &&
        witness.to == transaction.to &&
        witness.context == transaction.to &&
        witness.callvalue == transaction.value &&
        keccak256(witness.callData) == keccak256(transaction.data)
      );
    }
    require(!isValid, "Witness had valid context.");
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /**
   * @dev Prove that the output root on a message witness is invalid.
   * The output root should be the state root of the last access
   * record in the access list.
   */
  function proveWitnessExitRootError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    require(
      witness.to != Config.childRelayAddress(),
      "Can not use exit call for this function."
    );
    bytes32 expectedRoot = Message.getLastState(witness, witness.access_list.length);
    require(
      witness.stateRootLeave != expectedRoot,
      "Witness had valid output root."
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function proveExitCallWitnessGasError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes
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
      witness.to == Config.childRelayAddress(),
      "Witness not for an exit transaction."
    );
    // Whether the call to the relay succeeds or fails,
    // it will always use all remaining gas.
    require(
      witness.gasUsed != witness.gasAvailable ||
      witness.gasRefund != 0,
      "Witness had correct gas values."
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /**
   * @dev Prove that the output state root for a witness
   * targeting the child relay address is incorrect.
   * The state transition involves adding the encoded outgoing transaction
   * to the transactions tree embedded in the storage tree of the child
   * relay contract.
   */
  function proveExitCallWitnessExitRootError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    uint256 transactionIndex,
    bytes memory witnessBytes,
    bytes memory stateProofBytes,
    bytes memory storageProofBytes,
    bytes memory leafProofBytes
  ) public {
    // Verify that the witness is for the correct block & transaction
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(
      commitmentQuery,
      transactionIndex,
      witnessBytes
    );
    // Verify that the header matches the commitment
    require(
      commitmentQuery.commitment.blockHash == header.blockHash(),
      "Header does not match commitment."
    );
    require(
      witness.to == Config.childRelayAddress(),
      "Witness does not target child relay."
    );
    OutgoingTx.OutgoingTransaction memory transaction = OutgoingTx.fromExitCalldata(
      witness.callData,
      witness.caller,
      witness.callvalue,
      witness.gasAvailable
    );
    bytes memory transactionData = OutgoingTx.toBytes(transaction);
    bytes32 stateRoot = ExitProof.updateExitsRoot(
      chainState.sparse,
      witness.stateRootEnter,
      header.number,
      stateProofBytes,
      storageProofBytes,
      leafProofBytes,
      transactionData
    );
    require(
      witness.stateRootLeave != stateRoot,
      "Witness had correct output state root."
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  /**
   * @dev Prove that the state root for a successful signed transaction
   * is invalid by executing the state transition between its message
   * witness's output state root and the transaction state root.
   * This involves refunding the unspent gas cost to the caller
   * and paying the spent gas cost to the block producer.
   */
  function proveSuccessfulSignedTransactionStateRootError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    TransactionProof memory txProof,
    bytes memory witnessBytes,
    bytes memory callerProof,
    bytes memory operatorProof
  ) public {
    // Verify that the witness is for the correct block & transaction
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(
      commitmentQuery,
      txProof.transactionIndex,
      witnessBytes
    );
    // Verify that the transaction was successful
    require(witness.status == 1, "Unsuccessful transaction can not be used.");
    // Verify that the header matches the commitment
    require(
      commitmentQuery.commitment.blockHash == header.blockHash(),
      "Header does not match commitment."
    );
    // Verify that the transaction is a signed transaction in the block & decode it
    SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
      header,
      txProof.transactionBytes,
      txProof.transactionIndex,
      txProof.siblings
    );
    // Calculate the final gas refund & gas used
    uint256 amountSpent = witness.gasUsed + SignedTx.getBaseFee(chainState, transaction);
    if (witness.gasRefund < amountSpent / 2) {
      amountSpent -= witness.gasRefund;
    } else {
      amountSpent -= amountSpent / 2;
    }
    amountSpent = amountSpent * transaction.gasPrice;

    // Calculate the state root after the caller is refunded
    (bytes32 stateRoot, ) = StateProof.increaseBalance(
      chainState.sparse,
      witness.stateRootLeave,
      witness.caller,
      callerProof,
      (transaction.gas * transaction.gasPrice) - amountSpent
    );
    // Calculate the state root after the operator is paid for gas
    (stateRoot, ) = StateProof.increaseBalance(
      chainState.sparse,
      stateRoot,
      header.coinbase,
      operatorProof,
      amountSpent
    );
    require(
      stateRoot != transaction.stateRoot,
      "Transaction had correct state root."
    );
    handleSuccess(commitmentQuery, txProof.transactionIndex, challenger);
  }

  /**
   * @dev Prove that the state root for an unsuccessful signed transaction
   * is invalid by executing the state transition between the state prior
   * to the transaction and the transaction's state root.
   * If a transaction is unsuccessful, the gas is still paid for and the caller's
   * nonce incremented, but the value transfer to the recipient and all other
   * state changes are reverted.
   */
  function proveFailedSignedTransactionStateRootError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    TransactionProof memory txProof,
    bytes memory witnessBytes,
    bytes memory previousRootProof,
    bytes memory callerProof,
    bytes memory operatorProof
  ) public {
    // Verify that the witness is for the correct block & transaction
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, txProof.transactionIndex, witnessBytes);
    // Verify that the transaction was unsuccessful
    require(witness.status != 1, "Successful transaction can not be used.");
    // Verify that the header matches the commitment
    require(
      commitmentQuery.commitment.blockHash == header.blockHash(),
      "Header does not match commitment."
    );
    // Verify that the transaction is a signed transaction in the block & decode it
    SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
      header,
      txProof.transactionBytes,
      txProof.transactionIndex,
      txProof.siblings
    );
    // Calculate the final gas refund & gas used
    uint256 amountSpent = witness.gasUsed;
    if (witness.gasRefund < amountSpent / 2) {
      amountSpent -= witness.gasRefund;
    } else {
      amountSpent -= amountSpent / 2;
    }
    amountSpent = (amountSpent + SignedTx.getBaseFee(chainState, transaction)) * transaction.gasPrice;
    // Get the state root prior to the transaction
    bytes32 stateRoot = PriorState.provePreviousStateRoot(
      header, previousRootProof, txProof.transactionIndex
    );
    // Calculate the state root after the caller pays for gas and has nonce increased
    stateRoot = StateProof.subtractBalanceAndIncrementNonce(
      chainState.sparse,
      stateRoot,
      witness.caller,
      callerProof,
      amountSpent
    );
    // Calculate the state root after the operator is paid for gas
    (stateRoot, ) = StateProof.increaseBalance(
      chainState.sparse,
      stateRoot,
      header.coinbase,
      operatorProof,
      amountSpent
    );
    require(
      stateRoot != transaction.stateRoot,
      "Transaction had correct state root."
    );
    handleSuccess(commitmentQuery, txProof.transactionIndex, challenger);
  }

  /**
   * @dev Prove that the state root for a successful incoming transaction
   * is invalid by demonstrating that it does not match  the state root
   * for the witness.
   * Because of the cost of outgoing transactions, successful incoming
   * transactions do not return a gas refund.
   */
  function proveSuccessfulIncomingTransactionStateRootError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transactionBytes,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory witnessBytes
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    require(
      commitmentQuery.commitment.blockHash == header.blockHash(),
      "Header does not match commitment."
    );
    // Verify that the transaction was successful
    require(witness.status == 1, "Unsuccessful transaction can not be used.");
    IncomingTx.IncomingTransaction memory transaction = abi.decode(
      transactionBytes, (IncomingTx.IncomingTransaction)
    );
    chainState.validateIncomingTransaction(
      header, transaction, transactionIndex, siblings
    );
    require(
      transaction.stateRoot != witness.stateRootLeave,
      "Transaction had correct state root."
    );
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function proveWitnessGasExceededError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    require(witness.gasUsed > witness.gasAvailable, "Gas used did not exceed limit.");
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function proveWitnessRefundError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes
  ) public {
    (
      Message.MessageWitness memory witness,
      address challenger
    ) = validateWitnessInclusion(commitmentQuery, transactionIndex, witnessBytes);
    uint256 expectedRefund = 0;
    for (uint256 i = 0; i < witness.access_list.length; i++) {
      bytes memory record = witness.access_list[i];
      uint256 opcode;
      assembly { opcode := mload(add(record, 0x20)) }
      // todo add call record conditions
      if (opcode != 0x55) continue;
      assembly {
        let refund := mload(add(record, mload(record)))
        expectedRefund := add(expectedRefund, refund)
      }
    }
    require(witness.gasRefund != expectedRefund, "Witness had correct gas refund.");
    handleSuccess(commitmentQuery, transactionIndex, challenger);
  }

  function proveExecutionError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes memory witnessBytes
  ) public {
    bytes32 witnessHash = keccak256(witnessBytes);
    chainState.validateWitnessForPendingBlock(
      commitmentQuery, transactionIndex, witnessHash
    );
    address challenger = chainState
      .challengesByBlock[commitmentQuery.commitment.blockHash]
      .challengesByTransaction[transactionIndex]
      .challenger;
    (bool success,) = chainState.hypervisorAddress.staticcall{gas: gasleft()}(witnessBytes);
    require(!success, "No errors found in witness execution.");
    handleSuccess(commitmentQuery, transactionIndex, challenger);
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

  function validateSignedTransaction(
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) internal pure returns (SignedTx.SignedTransaction memory) {
    header.validateSignedTransaction(
      transaction, transactionIndex, siblings
    );
    return SignedTx.decodeTransaction(transaction);
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
    chainState.validateWitnessForPendingBlock(
      commitmentQuery, transactionIndex, witnessHash
    );
    witness = Message.fromBytes(witnessBytes);
    challenger = chainState
      .challengesByBlock[commitmentQuery.commitment.blockHash]
      .challengesByTransaction[transactionIndex]
      .challenger;
  }
}