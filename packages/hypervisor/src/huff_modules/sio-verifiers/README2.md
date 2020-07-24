# State Access Verifiers
This directory contains macros which check if state access witnesses match the inputs expected from EVM execution, and apply the outputs to the local environment.

Every state access record is encoded as an `AccessWitness` struct:
```cs
struct AccessWitness {
  uint8 opcode
  bytes metadata
}
```
In the future, we will change the encoding to minimize the size of the data, but for now we use standard ABI encoding for simplicity.

# Call Verifiers
These macros verify call inputs match the stack, then save a reference in memory to the location of the transaction's returndatasize. They also copy return data to memory at the `out, outsize` arguments provided to the call.


## CALL
```cs
struct CallWitness {
  bytes32  stateRootLeave; /* skip */
  uint256  gas; /* verify */
  uint256  gasUsed; /* skip */
  address  to; /* verify */
  uint256  callvalue; /* verify */
  bytes32  calldataHash; /* verify */
  bool     success; /* push to stack */
  bytes    returndata; /* store pointer in memory, copy to out-outsize */
}
```

## CALLCODE
The 

## DELEGATECALL

## STATICCALL
