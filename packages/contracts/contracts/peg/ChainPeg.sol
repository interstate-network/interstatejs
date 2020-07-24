pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import { ChainStateLib as CS } from "../common/ChainStateLib.sol";
import { ChainStateImplementer } from "../common/ChainStateImplementer.sol";
import { ConfigLib as Config } from "../common/config/ConfigLib.sol";
import { ISO_BlockLib as BL } from "../common/blocks/ISO_BlockLib.sol";
import { ISO_HeaderLib as HL } from "../common/blocks/ISO_HeaderLib.sol";
import { CommitmentHeaderLib as CL } from "../common/blocks/CommitmentHeaderLib.sol";
import { BlockQueryLib as BQ } from "../common/blocks/BlockQueryLib.sol";
import { RelayTransactionLib as IncomingTx } from "../common/transactions/RelayTransactionLib.sol";
import "../common/rollup/SparseMerkleTree.sol";
import "../common/config/byte-counter/IByteCounter.sol";
import "./StateQueries.sol";

contract ChainPeg is ChainStateImplementer, StateQueries {
  using CS for CS.ChainState;
  using HL for HL.ISO_Header;
  using BL for BL.ISO_Block;
  using HL for HL.ISO_Header;
  using CL for CL.CommitmentHeader;

  /* Temporary */
  address public owner;

  event BlockConfirmed(uint256 indexed blockHeight, bytes32 blockHash);
  event BlockSubmitted(uint256 indexed blockHeight, bytes32 parentHash, uint256 childIndex, bytes32 blockHash);
  event BlockChallenge(bytes32 indexed blockHash, uint256 transactionIndex, address challenger);
  event ChallengeResponse(bytes32 indexed blockHash, uint256 transactionIndex, bytes witness);
  event BlockReverted(bytes32 indexed blockHash, CS.RevertReason reason);

  constructor() public {
    HL.ISO_Header memory genesisBlock = HL.ISO_Header({
      parentHash: bytes32(0),
      number: uint256(0),
      incomingTransactionsIndex: uint256(0),
      incomingTransactionsCount: uint256(0),
      transactionsCount: uint256(0),
      transactionsRoot: bytes32(0),
      stateRoot: 0x4b529be809997a3bb9e6aac629611bfe00c51044f4cb112a8b9b4ac7eab5c19a,
      exitsRoot: bytes32(0),
      coinbase: address(0),
      timestamp: uint256(0)
    });

    chainState.confirmedBlocks.push(HL.blockHash(genesisBlock));
  }

  /**
   * @dev Asserts that the caller is the transaction originator.
   * This ensures that the calldata to a function call can always be recovered
   * by a standard Ethereum client without needing to emit logs.
   */
  modifier onlyEOA {
    require(msg.sender == tx.origin, "Caller must be an externally owned account.");
    _;
  }

  /**
   * @dev Asserts that the caller is approved to submit blocks.
   * @notice This will likely be removed in later versions.
   */
  modifier onlyApproved {
    require(msg.sender == owner, "Caller not approved.");
    _;
  }

  function initialize(
    SparseMerkleTree sparse,
    address challengeManager,
    address relay,
    address archiveFactory,
    IByteCounter byteCounter,
    address accessErrorProver,
    address blockErrorProver,
    address executionErrorProver,
    address transactionErrorProver,
    address encodingErrorProver,
    address witnessErrorProver,
    address hypervisorAddress
  ) public {
    require(
      chainState.challengeManager == address(0),
      "Already initialized!"
    );

    chainState.init(
      sparse,
      challengeManager,
      relay,
      archiveFactory,
      byteCounter,
      accessErrorProver,
      blockErrorProver,
      executionErrorProver,
      transactionErrorProver,
      encodingErrorProver,
      witnessErrorProver,
      hypervisorAddress
    );
    owner = msg.sender;
  }

  function submitBlock(BL.ISO_Block memory _block)
  public onlyEOA onlyApproved payable {
    Config.receiveRollupBond();
    // Temporarily removed submission of parent until the node is more fleshed out.
    // require(BQ.hasBlock(chainState, _parent), "Parent block not found.");
    require(BL.checkBlockIntegrity(_block), "Block failed integrity check.");
    CL.CommitmentHeader memory commitment = _block.header.toCommitment();
    uint256 childIndex = chainState.pendingBlocks[_block.header.parentHash].length;
    chainState.pendingBlocks[_block.header.parentHash].push(commitment.commitmentHash());
    emit BlockSubmitted(
      _block.header.number,
      _block.header.parentHash,
      childIndex,
      commitment.blockHash
    );
  }

  function confirmBlock(CL.CommitmentHeaderQuery memory _query) public {
    chainState.verifyCanConfirm(_query);
    chainState.confirmBlock(_query);
    emit BlockConfirmed(_query.blockNumber, _query.commitment.blockHash);
  }

  function challengeStep(bytes memory data) public payable {
    address challengeManager = chainState.challengeManager;
    assembly {
      let ptr := mload(0x40)
      let success := delegatecall(
        gas(), challengeManager, add(data, 32), mload(data), 0, 0
      )
      returndatacopy(ptr, 0, returndatasize())
      if iszero(success) { revert(ptr, returndatasize()) }
      return(ptr, returndatasize())
    }
  }

  function proveAccessError(bytes memory data) public {
    address accessErrorProver = chainState.accessErrorProver;
    assembly {
      let ptr := mload(0x40)
      let success := delegatecall(
        gas(), accessErrorProver, add(data, 32), mload(data), 0, 0
      )
      returndatacopy(ptr, 0, returndatasize())
      switch success
        case true { return(ptr, returndatasize()) }
        default { revert(ptr, returndatasize()) }
    }
  }

  function proveBlockError(bytes memory data) public {
    address blockErrorProver = chainState.blockErrorProver;
    assembly {
      let ptr := mload(0x40)
      let success := delegatecall(
        gas(), blockErrorProver, add(data, 32), mload(data), 0, 0
      )
      returndatacopy(ptr, 0, returndatasize())
      switch success
        case true { return(ptr, returndatasize()) }
        default { revert(ptr, returndatasize()) }
    }
  }

  event ErrorTest(IncomingTx.IncomingTransaction transaction, bytes32[] siblings);

  function proveExecutionError(bytes memory data) public {
    address executionErrorProver = chainState.executionErrorProver;
    assembly {
      let ptr := mload(0x40)
      let success := delegatecall(
        gas(), executionErrorProver, add(data, 32), mload(data), 0, 0
      )
      returndatacopy(ptr, 0, returndatasize())
      switch success
        case true { return(ptr, returndatasize()) }
        default { revert(ptr, returndatasize()) }
    }
  }

  function proveTransactionError(bytes memory data) public {
    address transactionErrorProver = chainState.transactionErrorProver;
    assembly {
      let ptr := mload(0x40)
      let success := delegatecall(
        gas(), transactionErrorProver, add(data, 32), mload(data), 0, 0
      )
      returndatacopy(ptr, 0, returndatasize())
      switch success
        case true { return(ptr, returndatasize()) }
        default { revert(ptr, returndatasize()) }
    }
  }

  event TestAddress(bytes32 stateRoot, address txSender, uint256 upfrontCost);
  function proveWitnessError(bytes memory data) public {
    address witnessErrorProver = chainState.witnessErrorProver;
    assembly {
      let ptr := mload(0x40)
      let success := delegatecall(
        gas(), witnessErrorProver, add(data, 32), mload(data), 0, 0
      )
      returndatacopy(ptr, 0, returndatasize())
      switch success
        case true { return(ptr, returndatasize()) }
        default { revert(ptr, returndatasize()) }
    }
  }

  function proveEncodingError(bytes memory data) public {
    address encodingErrorProver = chainState.encodingErrorProver;
    assembly {
      let ptr := mload(0x40)
      let success := delegatecall(
        gas(), encodingErrorProver, add(data, 32), mload(data), 0, 0
      )
      returndatacopy(ptr, 0, returndatasize())
      switch success
        case true { return(ptr, returndatasize()) }
        default { revert(ptr, returndatasize()) }
    }
  }
}