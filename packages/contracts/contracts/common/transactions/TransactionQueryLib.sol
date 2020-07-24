pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ISO_HeaderLib as Header } from "../blocks/ISO_HeaderLib.sol";
import { SignedTransactionLib as Signed } from "./SignedTransactionLib.sol";
import { RelayTransactionLib as Relayed } from "./RelayTransactionLib.sol";
import { ChainStateLib as CS } from "../ChainStateLib.sol";

library TransactionQueryLib {
  using Relayed for Relayed.RelayTransaction;
  using Relayed for Relayed.IncomingTransaction;

  struct TransactionQuery {
    uint256 txIndex;
    bytes32[] siblings;
    bytes data;
  }

  struct IncomingTransactionProof {
    bytes32 stateRoot;
    Relayed.RelayTransaction transaction;
  }
  
  function verifyAndDecode_Signed(Header.ISO_Header memory header, TransactionQuery memory txQuery)
  internal pure returns (Signed.SignedTransaction memory transaction) {
    bool inBlock = Header.hasTransaction(header, txQuery.data, txQuery.txIndex, txQuery.siblings);
    bool inRange = txQuery.txIndex >= header.incomingTransactionsCount;
    // If the transaction is out of range, it should be proven elsewhere.
    require(inBlock && inRange, "Invalid transaction proof.");
    transaction = Signed.decodeTransaction(txQuery.data);
  }

  /**
   * @dev verifyAndDecode_IncomingRollup
   * @notice Verify that the itx rollup exists in the header's transaction trie
   */
  function verifyAndDecode_Incoming(
    CS.ChainState storage chainState,
    Header.ISO_Header memory header,
    TransactionQuery memory txQuery
  ) internal view returns (Relayed.IncomingTransaction memory transaction) {
    transaction = abi.decode((txQuery.data), (Relayed.IncomingTransaction));
    // IncomingTransactionQuery memory queryData = abi.decode((txQuery), (IncomingTransactionQuery));
    bool inBlock = Header.hasTransaction(
      header,
      abi.encodePacked(transaction.stateRoot),
      txQuery.txIndex,
      txQuery.siblings
    );
    bool inRange = txQuery.txIndex < header.incomingTransactionsCount;
    bytes32 txHash = transaction.transactionHash();
    bytes32 expectedHash = chainState.relay.getTransactionHash(
      header.incomingTransactionsIndex + txQuery.txIndex
    );
    bool inRelay = txHash == expectedHash;
    require(inBlock && inRange && inRelay);
  }

  // function verifyAndDecode_Incoming(CS.ChainState storage chainState, Header.ISO_Header memory header, TransactionQuery memory txQuery)
  // internal view returns (bool inBlock, RTL.RelayTransaction memory transaction) {
  //   bytes memory encodedRollup;
  //   (encodedRollup, transaction) = abi.decode(txQuery.encoded, (bytes, RTL.RelayTransaction));
  //   ITX.ITX_Rollup memory itxRollup = ITX.decodeRollup(encodedRollup);
  //   bytes32 expectedHash = chainState.relay.getTransactionHash(itxRollup.source.sourceBlock, itxRollup.source.itxIndex);
  //   inBlock = (
  //     Header.hasTransaction(header, encodedRollup, txQuery.txIndex, txQuery.siblings) &&
  //     expectedHash == RTL.transactionHash(transaction)
  //   );
  // }
}