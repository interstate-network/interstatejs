pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateLib as State } from "../../common/ChainStateLib.sol";
import { ChallengeLib as Challenge } from "../../challenge/ChallengeLib.sol";
import { CommitmentHeaderLib as Commitment } from "../../common/blocks/CommitmentHeaderLib.sol";
import { ISO_HeaderLib as Header } from "../../common/blocks/ISO_HeaderLib.sol";
import { SignedTransactionLib as SignedTx } from "../../common/transactions/SignedTransactionLib.sol";
import { RelayTransactionLib as IncomingTx } from "../../common/transactions/RelayTransactionLib.sol";

library InclusionProofLib {
  using State for State.ChainState;
  using Header for Header.ISO_Header;
  using SignedTx for SignedTx.SignedTransaction;
  using IncomingTx for IncomingTx.IncomingTransaction;

  function hasWitnessForPendingBlock(
    State.ChainState storage _state,
    Commitment.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes32 witnessHash
  ) internal view returns (bool) {
    bool hasBlock = State.hasPendingBlock(_state, commitmentQuery);
    bool hasWitness = _state
      .challengesByBlock[commitmentQuery.commitment.blockHash]
      .witnessHashes[transactionIndex] == witnessHash;
    return hasBlock && hasWitness;
  }

  function validateWitnessForPendingBlock(
    State.ChainState storage _state,
    Commitment.CommitmentHeaderQuery memory commitmentQuery,
    uint256 transactionIndex,
    bytes32 witnessHash
  ) internal view {
    require(State.hasPendingBlock(_state, commitmentQuery), "Invalid commitment.");
    validateWitness(
      _state,
      commitmentQuery.commitment.blockHash,
      transactionIndex,
      witnessHash
    );
  }

  function validateWitness(
    State.ChainState storage _state,
    bytes32 blockHash,
    uint256 transactionIndex,
    bytes32 witnessHash
  ) internal view {
    require(
      _state.challengesByBlock[blockHash]
        .witnessHashes[transactionIndex] == witnessHash,
      "Invalid transaction witness."
    );
  }

  function validateHeaderCommitment(
    State.ChainState storage _state,
    Commitment.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header
  ) internal view {
    require(State.hasPendingBlock(_state, commitmentQuery), "Invalid commitment.");
    require(
      commitmentQuery.commitment.blockHash == header.blockHash(),
      "Header does not match commitment."
    );
  }

  function validateIncomingTransaction(
    State.ChainState storage _state,
    Header.ISO_Header memory header,
    IncomingTx.IncomingTransaction memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) internal view {
    require(
      header.hasTransaction(
        abi.encodePacked(transaction.stateRoot),
        transactionIndex,
        siblings
      ),
      "Invalid transaction proof."
    );
    require(
      transactionIndex < header.incomingTransactionsCount,
      "Not an incoming transaction."
    );
    uint256 incomingTransactionIndex = header.incomingTransactionsIndex + transactionIndex;
    bytes32 expectedHash = _state.relay.getTransactionHash(incomingTransactionIndex);
    require(
      transaction.transactionHash() == expectedHash,
      "Transaction does not match relay."
    );
  }

  function validateSignedTransaction(
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) internal pure {
    require(
      transactionIndex >= header.incomingTransactionsCount,
      "Not a signed transaction."
    );
    require(
      header.hasTransaction(transaction, transactionIndex, siblings),
      "Invalid transaction proof."
    );
  }
}