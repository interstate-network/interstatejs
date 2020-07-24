pragma solidity ^0.6.0;

library DeploymentRecordLib {
  struct DeploymentRecord {
    uint128 blockNumber;
    uint128 transactionIndex;
  }
}