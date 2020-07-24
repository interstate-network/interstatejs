pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateImplementer as Stateful } from "../common/ChainStateImplementer.sol";
import { ChainStateLib as State } from "../common/ChainStateLib.sol";
import { ISO_HeaderLib as Header } from "../common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
import { InclusionProofLib as InclusionProof } from "./lib/InclusionProofLib.sol";
import { ExitProofLib as ExitProof } from "./lib/ExitProofLib.sol";

contract BlockErrorProver is Stateful {
  using State for State.ChainState;
  using Header for Header.ISO_Header;
  using InclusionProof for State.ChainState;

  function proveExitsRootError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory stateProofBytes,
    bytes memory storageProofBytes
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    bytes32 exitsRoot = ExitProof.proveExitsRoot(
      chainState.sparse,
      header.stateRoot,
      header.number,
      stateProofBytes,
      storageProofBytes
    );
    require(
      header.exitsRoot != exitsRoot,
      "Header had correct exits root."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }

  /**
   * @dev Proves that a header has an invalid incomingTransactionsIndex field.
  */
  function proveIncomingTransactionIndexError(
    Header.ISO_Header memory parent,
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header
  ) public {
    require(
      commitmentQuery.parentHash == parent.blockHash(),
      "Parent block does not match child."
    );
    chainState.validateHeaderCommitment(commitmentQuery, header);
    uint256 expectedIndex = parent.incomingTransactionsIndex + parent.incomingTransactionsCount;
    require(
      header.incomingTransactionsIndex != expectedIndex,
      "Incoming transactions index is valid."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }

  function proveIncomingTransactionsOutOfRangeError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    uint256 total = header.incomingTransactionsIndex + header.incomingTransactionsCount;
    uint256 maximum = chainState.relay.getTransactionsCount();
    require(
      total > maximum,
      "Incoming transactions index in range."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }
  
  /**
   * @dev Proves that a header has an invalid timestamp field.
  */
  function proveTimestampError(
    Header.ISO_Header memory parent,
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header
  ) public {
    require(
      commitmentQuery.parentHash == parent.blockHash(),
      "Parent block does not match child."
    );
    chainState.validateHeaderCommitment(commitmentQuery, header);
    require(
      header.timestamp <= parent.timestamp,
      "Header timestamp is valid."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }
  
  /**
   * @dev Proves that a header has an invalid block number.
  */
  function proveBlockNumberError(
    Header.ISO_Header memory parent,
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header
  ) public {
    require(
      commitmentQuery.parentHash == parent.blockHash(),
      "Parent block does not match child."
    );
    chainState.validateHeaderCommitment(commitmentQuery, header);
    require(
      header.number != parent.number + 1,
      "Block number is valid."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }

  /**
   * @dev Proves that a header has an invalid state root.
  */
  function proveStateRootError(
    CL.CommitmentHeaderQuery memory commitmentQuery,
    Header.ISO_Header memory header,
    bytes memory transaction,
    uint256 transactionIndex,
    bytes32[] memory siblings
  ) public {
    chainState.validateHeaderCommitment(commitmentQuery, header);
    require(
      header.transactionsCount == transactionIndex + 1,
      "Transaction not last in block."
    );
    require(
      header.hasTransaction(transaction, transactionIndex, siblings),
      "Invalid transaction proof."
    );
    bytes32 intermediateStateRoot;
    assembly {
      intermediateStateRoot := mload(add(transaction, mload(transaction)))
    }
    require(
      header.stateRoot != intermediateStateRoot,
      "Header had valid state root."
    );
    chainState.markFraudulentBlock(commitmentQuery);
  }
}