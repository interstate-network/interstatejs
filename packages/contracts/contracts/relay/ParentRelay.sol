pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { RelayTransactionLib as RTL } from "../common/transactions/RelayTransactionLib.sol";
import { OutgoingTransactionLib as OTL } from "../common/transactions/OutgoingTransactionLib.sol";
import { MerkleProofLib as Merkle } from "../common/rollup/MerkleProofLib.sol";
import { ConfigLib as Config } from "../common/config/ConfigLib.sol";
import { IContractProxy as IProxy } from "./IContractProxy.sol";
import "./ArchiveFactory.sol";
import "./ContractProxy.sol";

contract ParentRelay {
  /**
   * @notice Currently confirmedExitRoots is only used for the actual roots,
   * but we have it store the gas price for when we implement that in the future.
   * If this is determined to be a better approach by the time of production release,
   * remove the BlockExitData struct.
  */
  struct BlockExitData {
    uint256 exitGasPrice;
    bytes32 exitsRoot;
  }

  address public childRelayContract;
  address internal _chainPeg;
  ArchiveFactory internal _archiveFactory;
  bytes32[] internal transactionHashes;
  mapping(address => bool) internal deployedContracts;
  mapping(uint256 => BlockExitData) internal confirmedExitRoots;

  event IncomingTransactionQueued(uint256 indexed itxIndex, RTL.RelayTransaction transaction);
  event ExitTransactionProcessed(uint256 blockNumber, uint256 otxIndex, bytes32 newExitRoot);


  function initialize(address chainPeg, address archiveFactory, address childRelayCode) public payable {
    require(_chainPeg == address(0) && address(_archiveFactory) == address(0), "Already initialized!");
    _chainPeg = chainPeg;
    _archiveFactory = ArchiveFactory(archiveFactory);
    childRelayContract = Config.childRelayAddress();
    /* Temporary work-around to ensure the child relay has contract code */
    deployedContracts[childRelayContract] = true;
    _archiveFactory.archiveContract(childRelayContract, childRelayCode);
    RTL.RelayTransaction memory transaction = RTL.RelayTransaction(
      childRelayContract,
      address(0),
      uint256(0),
      uint256(0),
      bytes("")
    );
    _addTransaction(transaction);
  }

  /**
   * @dev _addTransaction
   * @notice Internal function for recording a transaction for the child chain.
   *         Adds the hash of the transaction to the incoming transactions array.
   *         Emits a TransactionSent event.
   * @param transaction Transaction struct with the data to be processed by the child chain.
   * @return Index of the transaction in the incoming transactions array for this block.
   */
  function _addTransaction(RTL.RelayTransaction memory transaction) internal returns (uint256) {
    bytes32 txHash = keccak256(abi.encode(transaction));
    uint256 transactionIndex = transactionHashes.length;
    transactionHashes.push(txHash);
    emit IncomingTransactionQueued(transactionIndex, transaction);
    return transactionIndex;
  }

  /* <-- Query Functions --> */
  function getTransactionHash(uint256 txIndex) external view returns (bytes32 txHash) {
    require(transactionHashes.length > txIndex, "Invalid query - index out of range.");
    return transactionHashes[txIndex];
  }

  function getTransactionsCount() external view returns(uint256 length) {
    length = transactionHashes.length;
  }

  function getTransactionHashes(uint256 start, uint256 maxCount)
  external view returns(bytes32[] memory _transactionHashes) {
    uint256 len = transactionHashes.length;
    uint256 stop = (start+maxCount) > len ? len : (start+maxCount);
    uint256 count = stop - start;
    _transactionHashes = new bytes32[](count);
    for (uint256 i = 0; i < count; i++) _transactionHashes[i] = transactionHashes[start + i];
  }

  function hasOutgoingTransaction(
    OTL.OutgoingTransaction memory _tx,
    bytes32[] memory siblings,
    uint256 txIndex,
    uint256 blockNumber
  ) public view returns (bool) {
    bytes32 exitsRoot = confirmedExitRoots[blockNumber].exitsRoot;
    return Merkle.verify(exitsRoot, OTL.toBytes(_tx), txIndex, siblings);
  }

  function getExitsRoot(uint256 blockNumber) external view returns (bytes32) {
    return confirmedExitRoots[blockNumber].exitsRoot;
  }

  /* <-- Action Functions --> */
  function putConfirmedBlock(uint256 blockNumber, bytes32 exitsRoot) external {
    require(msg.sender == _chainPeg, "Not sent from chain peg.");
    confirmedExitRoots[blockNumber].exitsRoot = exitsRoot;
  }

  /**
   * @dev addTransaction
   * @notice External function for recording a transaction for the child chain.
   *         Does not allow null address as the receiver.
   * @param to Recipient address.
   * @param sendGas Gas to send with the transaction.
   * @param data The data to send in the incoming transaction.
   * @return Index of the transaction in the incoming transactions array for this block.
   */
  function addTransaction(address to, uint256 sendGas, bytes memory data)
  public payable returns (uint256) {
    /* Disallow targetting 0 address - required for deployment logic */
    require(to != address(0), "Deposit to null address not allowed.");
    require(
      to != childRelayContract,
      "Deposit to child relay not allowed."
    );
    RTL.RelayTransaction memory transaction = RTL.RelayTransaction(
      msg.sender,
      to,
      sendGas,
      msg.value,
      data
    );
    return _addTransaction(transaction);
  }

  function deployContract(address runtimeCode) public payable returns (uint256, address) {
    address proxyAddress = address(new ContractProxy());
    deployedContracts[proxyAddress] = true;
    _archiveFactory.archiveContract(proxyAddress, runtimeCode);
    RTL.RelayTransaction memory transaction = RTL.RelayTransaction(
      proxyAddress,
      address(0),
      uint256(0),
      uint256(0),
      bytes("")
    );
    return (_addTransaction(transaction), proxyAddress);
  }

  /**
   * @dev forwardFromProxy
   * @notice Adds an incoming transaction from a contract proxy.
   *         Uses the from address provided by the contract proxy and uses the caller address as the to address.
   *         Allows transactions sent from contract proxies to keep the caller address.
   * @param from The address that called the contract proxy.
   * @param sendGas The amount of gas to send in the incoming transaction.
   * @param data The data to send in the incoming transaction.
   */
  function forwardFromProxy(address from, uint256 sendGas, bytes memory data) public payable {
    require(deployedContracts[msg.sender], "Caller not a proxy contract.");
    RTL.RelayTransaction memory transaction = RTL.RelayTransaction(
      from,
      msg.sender,
      sendGas,
      msg.value,
      data
    );
    _addTransaction(transaction);
  }

  function executeOutgoingTransaction(
    OTL.OutgoingTransaction memory _tx,
    bytes32[] memory siblings,
    uint256 txIndex,
    uint256 blockNumber
  ) public payable {
    bytes32 exitsRoot = confirmedExitRoots[blockNumber].exitsRoot;
    (bool valid, bytes32 newRoot) = Merkle.verifyAndUpdate(
      exitsRoot,
      OTL.toBytes(_tx),
      bytes(""),
      txIndex,
      siblings
    );
    require(valid, "Invalid merkle proof.");
    require(
      msg.value >= _tx.value &&
      gasleft() >= _tx.gas + 15000, // TODO - better method for ensuring sufficient gas is available
      "Insufficient gas or value."
    );
    // Update exits root to delete the transaction
    confirmedExitRoots[blockNumber].exitsRoot = newRoot;
    // If the transaction is from a contract, forward it through its proxy
    if (deployedContracts[_tx.from]) {
      try IProxy(_tx.from).executeOutgoingTransaction{gas: gasleft(), value: _tx.value}(_tx.to, _tx.gas, _tx.data) {
        msg.sender.transfer(_tx.bounty + _tx.value);
        return;
      }
      catch (bytes memory) {
        _addTransaction(
          RTL.RelayTransaction(
            address(0),
            _tx.from,
            uint256(50000), // Give small amount of gas to process the refund
            _tx.value,
            bytes("")
          )
        );
        msg.sender.transfer(_tx.bounty);
        return;
      }
    }
    (bool success,) = _tx.to.call{gas: _tx.gas, value: _tx.value}(_tx.data);
    /*
      If the transaction fails, return only the tx bounty
      to the forwarder and add a deposit to refund the submitter.
    */
    if (!success) {
      _addTransaction(
        RTL.RelayTransaction(
          address(0),
          _tx.from,
          uint256(50000), // Give small amount of gas to process the refund
          _tx.value,
          bytes("")
        )
      );
      msg.sender.transfer(_tx.bounty);
      return;
    }
    msg.sender.transfer(_tx.bounty + _tx.value);
    return;
  }

  receive() external payable {}
}