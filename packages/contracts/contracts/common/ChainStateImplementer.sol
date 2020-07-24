pragma solidity ^0.6.0;
import { ChainStateLib as CS } from "./ChainStateLib.sol";

abstract contract ChainStateImplementer {
  CS.ChainState internal chainState;
}