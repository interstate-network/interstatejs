pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateImplementer as Stateful } from "../common/ChainStateImplementer.sol";
import { ChallengeLib as Challenge } from "../challenge/ChallengeLib.sol";
import { ChainStateLib as State } from "../common/ChainStateLib.sol";
import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
import { StateProofLib as StateProof } from "./lib/StateProofLib.sol";
import { SignedTransactionLib as SignedTx } from "../common/transactions/SignedTransactionLib.sol";
import { RelayTransactionLib as IncomingTx } from "../common/transactions/RelayTransactionLib.sol";
import { RLPAccountLib as Account } from "../utils/type-encoders/RLPAccountLib.sol";
import { PriorStateLib as PriorState } from "./lib/PriorStateLib.sol";
import { InclusionProofLib as InclusionProof } from "./lib/InclusionProofLib.sol";
import { ConfigLib as Config } from "../common/config/ConfigLib.sol";

contract ExecutionErrorProver is Stateful {
  using State for State.ChainState;
  using InclusionProof for State.ChainState;
  using InclusionProof for Header.ISO_Header;
  using Header for Header.ISO_Header;
  using SignedTx for SignedTx.SignedTransaction;
  using IncomingTx for IncomingTx.IncomingTransaction;
  using Account for Account.Account;

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

  function getContractCodeHash(address archiveAddress)
  internal view returns (bytes32 codeHash) {
    assembly {
      // Instead of using a `bytes` var, which would permanently expand the memory buffer
      // and increase the cost of future memory expansion, we use the free pointer set by
      // solc to copy the code to, then reset it afterwards using calldatacopy starting at
      // the end of the calldata buffer in order to set the code buffer to 0.
      let codeSize := sub(extcodesize(archiveAddress), 1)
      let ptr := mload(0x40)
      extcodecopy(archiveAddress, ptr, 1, codeSize)
      codeHash := keccak256(ptr, codeSize)
      calldatacopy(ptr, calldatasize(), codeSize)
    }
  }

  /**
   * @dev Prove that a signed transaction targeted the null address,
   * which is not allowed in the ISO blockchain.
   * Note: Only valid for a signed transaction.
   */
  function proveInvalidCreateTransaction(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    SignedTx.SignedTransaction memory _tx = validateSignedTransaction(
      header,
      transaction,
      transactionIndex,
      siblings
    );
    require(_tx.to == address(0), "Not a create transaction");
    chainState.markFraudulentBlock(commitmentQuery);
  }

  /**
   * @dev Prove that the caller of a transaction had an insufficient
   * balance to cover the upfront cost.
   * Note: Only valid for a signed transaction.
   */
  function proveInsufficientBalanceError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transactionBytes,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory previousRootProof,
    bytes memory stateProof
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    /* Only signed transactions reduce the caller balance. */
    SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
      header,
      transactionBytes,
      transactionIndex,
      siblings
    );
    bytes32 previousRoot = PriorState.provePreviousStateRoot(
      header, previousRootProof, transactionIndex
    );
    address signer = transaction.getSenderAddress();
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      previousRoot,
      signer,
      stateProof
    );
    // uint256 totalCost = (_tx.gas * _tx.gasPrice) + _tx.value;
    require(
      transaction.getUpfrontCost() > account.balance,
      "Balance sufficient for transaction."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }

  /**
   * @dev Prove that a transaction had a nonce which did not match the
   * caller account.
   * Note: Only valid for a signed transaction.
   */
  function proveInvalidNonceError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transactionBytes,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory previousRootProof,
    bytes memory stateProof
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    /* Only signed transactions use a nonce. */
    SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
      header, transactionBytes, transactionIndex, siblings
    );
    bytes32 previousRoot = PriorState.provePreviousStateRoot(
      header, previousRootProof, transactionIndex
    );
    address signer = transaction.getSenderAddress();
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      previousRoot,
      signer,
      stateProof
    );
    require(transaction.nonce != account.nonce, "Transaction had correct nonce.");
    chainState.markFraudulentBlock(commitmentQuery);
  }

  /**
   * @dev Prove that a transaction had less gas than the base fee.
   * Note: Only valid for a signed transaction.
   */
  function proveInsufficientGasError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transactionBytes,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
      header, transactionBytes, transactionIndex, siblings
    );
    uint256 baseGasFee = SignedTx.getBaseFee(chainState, transaction);
    require(transaction.gas < baseGasFee, "Transaction had sufficient gas.");
    chainState.markFraudulentBlock(commitmentQuery);
  }

  event ErrorTest(IncomingTx.IncomingTransaction transaction, bytes32[] siblings);
  /**
   * @dev Prove that an incoming transaction was executed incorrectly,
   * where the transaction was either a deployment or a simple value
   * transfer.
   */
  function proveSimpleIncomingTransactionExecutionError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    IncomingTx.IncomingTransaction memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory previousRootProof,
    bytes memory receiverProof
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    chainState.validateIncomingTransaction(header, transaction, transactionIndex, siblings);
    bytes32 stateRoot = PriorState.provePreviousStateRoot(
      header, previousRootProof, transactionIndex
    );
    if (transaction.to == address(0)) {
      /* Deployment transaction. */
      address archiveAddress = chainState.getContractArchiveAddress(transaction.from);
      bytes32 codeHash = getContractCodeHash(archiveAddress);
      stateRoot = StateProof.setAccountCodeHash(
        chainState.sparse,
        stateRoot,
        transaction.from,
        receiverProof,
        codeHash
      );
      
    } else {
      /* Value transfer. */
      Account.Account memory account;
      (stateRoot, account) = StateProof.increaseBalance(
        chainState.sparse,
        stateRoot,
        transaction.to,
        receiverProof,
        transaction.value
      );
      require(!account.isContract(), "Not a simple transaction.");
    }
    require(
      transaction.stateRoot != stateRoot, "Transaction had valid state root."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }

  // /**
  //  * @dev Proves that an exit transaction was executed incorrectly.
  //  */
  // function proveExitTransactionError(
  //   CL.CommitmentHeaderQuery memory commitmentQuery,
  //   Header.ISO_Header memory header,
  //   bytes memory transactionBytes,
  //   uint256 transactionIndex,
  //   bytes32[] memory siblings,
  //   bytes memory previousRootProof,
  //   bytes memory callerProof,
  //   bytes memory receiverProof,
  //   bytes memory operatorProof
  // ) public {
  //   chainState.validateHeaderCommitment(commitmentQuery, header);
  //   SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
  //     header, transactionBytes, transactionIndex, siblings
  //   );
  //   require(
  //     transaction.to == Config.childRelayAddress(),
  //     "Not an exit transaction."
  //   );
  //   bytes32 stateRoot = PriorState.provePreviousStateRoot(
  //     header, previousRootProof, transactionIndex
  //   );
  //   stateRoot = StateProof.subtractBalanceAndIncrementNonce(
  //     chainState.sparse,
  //     stateRoot,
  //     transaction.getSenderAddress(),
  //     callerProof,
  //     transaction.value + (21000 * transaction.gasPrice)
  //   );
  // }

  /**
   * @dev Proves that a signed transaction was executed incorrectly,
   * where the receiver was not a contract.
   * Note: Rather than updating the caller twice (for the gas refund),
   * this simply charges 21000 gas. This gives the same end result.
   */
  function proveSimpleSignedTransactionExecutionError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transactionBytes,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory previousRootProof,
    bytes memory callerProof,
    bytes memory receiverProof,
    bytes memory operatorProof
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
      header, transactionBytes, transactionIndex, siblings
    );
    bytes32 stateRoot = PriorState.provePreviousStateRoot(
      header, previousRootProof, transactionIndex
    );
    stateRoot = StateProof.subtractBalanceAndIncrementNonce(
      chainState.sparse,
      stateRoot,
      transaction.getSenderAddress(),
      callerProof,
      transaction.value + (21000 * transaction.gasPrice)
    );
    Account.Account memory receiver;
    (stateRoot, receiver) = StateProof.increaseBalance(
      chainState.sparse,
      stateRoot,
      transaction.to,
      receiverProof,
      transaction.value
    );
    require(!receiver.isContract(), "Receiver is a contract.");
    (stateRoot,) = StateProof.increaseBalance(
      chainState.sparse,
      stateRoot,
      header.coinbase,
      operatorProof,
      21000 * transaction.gasPrice
    );
    require(
      transaction.stateRoot != stateRoot,
      "Transaction had valid state root."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }

    /**
   * @dev Cancels a challenge on a simple transaction, i.e.
   * a transaction which can be audited without a message witness.
   * A transaction is considered simple if it is a deployment or
   * the target account is not a contract.
   * @param header Block header from the challenged block
   * @param transactionBytes Encoded transaction - either IncomingTransaction struct
   * or RLP encoded signed transaction
   * @param transactionIndex Index of the transaction in the block
   * @param siblings Merkle proof of the transaction's inclusion in the block
   * @param previousRootProof Proof of the previous state root - if the
   * transaction is a deployment, this can be null
   * @param receiverProof Proof of the receiver account in the previous state - if the
   * transaction is a deployment, this can be null
   */
  function cancelSimpleTransactionChallenge(
    Header.ISO_Header memory header,
    bytes memory transactionBytes,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory previousRootProof,
    bytes memory receiverProof
  ) public  {
    bytes32 blockHash = header.blockHash();
    address receiver;
    if (transactionIndex < header.incomingTransactionsCount) {
      IncomingTx.IncomingTransaction memory transaction = abi.decode(
        transactionBytes, (IncomingTx.IncomingTransaction)
      );
      chainState.validateIncomingTransaction(
        header, transaction, transactionIndex, siblings
      );
      receiver = transaction.to;
    } else {
      SignedTx.SignedTransaction memory transaction = validateSignedTransaction(
        header, transactionBytes, transactionIndex, siblings
      );
      receiver = transaction.to;
    }
    if (receiver != address(0)) {
      bytes32 previousRoot = PriorState.provePreviousStateRoot(
        header, previousRootProof, transactionIndex
      );
      Account.Account memory account = StateProof.proveAccountInState(
        chainState.sparse,
        previousRoot,
        receiver,
        receiverProof
      );
      require(!account.isContract(), "Not a simple transaction.");
    }
    Challenge.Challenge memory challenge = chainState
      .challengesByBlock[blockHash]
      .challengesByTransaction[transactionIndex];
    require(
      challenge.step != Challenge.ChallengeStep.NONE,
      "Challenge does not exist."
    );
    chainState.challengesByBlock[blockHash].openChallenges -= 1;
    delete chainState
      .challengesByBlock[blockHash]
      .challengesByTransaction[transactionIndex];
    Config.rewardChallengerTimeout(header.coinbase);
  }
}