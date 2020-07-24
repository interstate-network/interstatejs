pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateImplementer as Stateful } from "../common/ChainStateImplementer.sol";
import { ChainStateLib as State } from "../common/ChainStateLib.sol";
import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
import { StateProofLib as StateProof } from "./lib/StateProofLib.sol";
import { SignedTransactionLib as SignedTx } from "../common/transactions/SignedTransactionLib.sol";
import { RelayTransactionLib as IncomingTx } from "../common/transactions/RelayTransactionLib.sol";
import { RLPAccountLib as Account } from "../utils/type-encoders/RLPAccountLib.sol";


contract TransactionErrorProver is Stateful {
  using State for State.ChainState;
  using Header for Header.ISO_Header;
  using SignedTx for SignedTx.SignedTransaction;

  function validateHeader(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header
  ) internal view {
    require(chainState.hasPendingBlock(commitmentQuery), "Block not pending.");
    require(
      commitmentQuery.commitment.blockHash == header.blockHash(),
      "Header does not match commitment."
    );
  }

  function validateSignedTransaction(
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) internal pure returns (SignedTx.SignedTransaction memory) {
    require(
      transactionIndex >= header.incomingTransactionsCount,
      "Not a signed transaction."
    );
    require(
      header.hasTransaction(transaction, transactionIndex, siblings),
      "Invalid transaction proof."
    );
    return SignedTx.decodeTransaction(transaction);
  }

  function proveTransactionSignatureError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) public {
    validateHeader(commitmentQuery, header);
    SignedTx.SignedTransaction memory _tx = validateSignedTransaction(
      header,
      transaction,
      transactionIndex,
      siblings
    );
    address signer = _tx.getSenderAddress();
    require(signer == address(0), "Signature error not found.");
    chainState.markFraudulentBlock(commitmentQuery);
  }

  function proveInsufficientBalanceError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings,
    bytes memory stateProof
  ) public {
    validateHeader(commitmentQuery, header);
    /* Only signed transactions reduce the caller balance. */
    SignedTx.SignedTransaction memory _tx = validateSignedTransaction(
      header,
      transaction,
      transactionIndex,
      siblings
    );
    address signer = _tx.getSenderAddress();
    Account.Account memory account = StateProof.proveAccountInState(
      chainState.sparse,
      _tx.stateRoot,
      signer,
      stateProof
    );
    uint256 totalCost = (_tx.gas * _tx.gasPrice) + _tx.value;
    require(totalCost > account.balance, "Balance sufficient for transaction.");
    chainState.markFraudulentBlock(commitmentQuery);
  }


  // function validateSimpleTransactionErrorProof(
  //   Header.ISO_Header memory header,
  //   uint256 transactionIndex,
  //   bytes memory transaction,
  //   bytes32[] memory siblings
  // ) internal pure {
  //   bytes memory _tx;
  //   if (transactionIndex < header.incomingTransactionsCount) {
      
  //   }
  //   require(
  //     header.hasTransaction(
  //       transaction, transactionIndex, siblings
  //     ),
  //     "Invalid transaction proof submitted."
  //   );
  // }
}