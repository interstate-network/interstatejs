pragma solidity ^0.6.0;

library ConfigLib {
  /**
   * @dev Derive the child relay address by taking the first 20 bytes
   * of the hash of the chain ID.
   */
  function childRelayAddress() internal pure returns (address relayAddress) {
    bytes32 idHash = keccak256(abi.encodePacked(CHAIN_ID()));
    assembly {
      relayAddress := shr(96, idHash)
    }
  }

  /**
   * @dev The challenge period is the amount of time that a block producer has
   * to respond to a challenge, as well as the amount of time that a challenger
   * has to execute a fraud proof after the challenge has been responded to.
   * Currently implemented as a function, as this may eventually become a
   * mutable value.
   */
  function CHALLENGE_PERIOD() internal pure returns (uint256) { return 512; }

  /**
   * @dev The confirmation period is the window of time during which
   * a block can be challenged, and after which it may be confirmed.
   * Measured in mainnet blocks.
   */
  function CONFIRMATION_PERIOD() internal pure returns (uint256) { return 1; }

  function CHAIN_ID() internal pure returns (uint256) { return uint256(50005); }
  function CHALLENGE_BOND() internal pure returns (uint256) { return 1 ether; }
  function ROLLUP_BOND() internal pure returns (uint256) { return 0.01 ether; }

  function receiveOnlyValue(uint256 bond) internal {
    require(msg.value >= bond, "Insufficient value received.");
    if (msg.value > bond) msg.sender.transfer(msg.value - bond);
  }

  function receiveChallengeBond() internal {
    receiveOnlyValue(CHALLENGE_BOND());
  }

  function receiveRollupBond() internal {
    receiveOnlyValue(ROLLUP_BOND());
  }

  function repayChallengeBond(address challenger) internal {
    payable(challenger).transfer(CHALLENGE_BOND());
  }

  function repayRollupBond(address _coinbase) internal {
    payable(_coinbase).transfer(ROLLUP_BOND());
  }

  /**
   * @dev Pays reward for a challenge and returns challenge collateral.
   *
   * If msg.sender is the challenger:
   * - Sends the challenger 1/2 of the block collateral as a reward
   * and returns the challenge collateral.
   * - Burns the remaining block collateral to the 0 address.
   *
   * If msg.sender is not the challenger:
   * - Sends the challenger 1/4 of the block collateral and returns the
   * challenge collateral.
   * - Sends msg.sender 1/4 of the block collateral.
   * - Burns the remaining block collateral to the 0 address.
   */
  function rewardSuccessfulChallenge(address _challenger) internal {
    address payable challenger = payable(_challenger);
    if (challenger == msg.sender) {
      challenger.transfer(CHALLENGE_BOND() + (ROLLUP_BOND() / 2));
    } else {
      challenger.transfer(CHALLENGE_BOND() + (ROLLUP_BOND() / 4));
      msg.sender.transfer(ROLLUP_BOND() / 4);
    }
    payable(0).transfer(ROLLUP_BOND() / 2);
  }

  function rewardChallengerTimeout(address operator) internal {
    payable(operator).transfer(CHALLENGE_BOND());
  }

  function challengePeriodOpen(uint256 submittedAt) internal view returns (bool _open) {
    _open = (block.number - submittedAt) < CHALLENGE_PERIOD();
  }

  function confirmationPeriodOver(uint256 submittedAt) internal view returns (bool _isReady) {
    _isReady = (block.number - submittedAt) >= CONFIRMATION_PERIOD();
  }
}