# SIO Verifiers
SIO verifiers are macros which ensure the inputs and outputs for internal storage read/write as well as external calls from virtualized execution of a transaction match the recorded values in a transaction receipt.

## Call Verifiers
These macros verify call inputs match the stack, then save a reference in memory to the location of the transaction's returndatasize. Will also copy return data according to the `out, outsize` arguments provided to the call.

### - VERIFY_ACCESS_CALL_7
Used for call & callcode
Input Stack: [gas, address, value, in, insize, out, outsize]
@dev SIO Block Structure:
 - opcode (1 byte) offset = 0
 - receipt hash (32 bytes) offset = 1
 - gas (32 bytes) offset = 33
 - address (20 bytes) offset = 65
 - callvalue (32 bytes) offset = 85
 - calldatahash (32 bytes) offset = 117
 - call success (1 byte) offset = 149
 - returndatasize (32 bytes) offset = 150
 - returndata (returndatasize bytes) offset = 182
@dev Verification:
 - gas == stack[0]
 - address == stack[1]
 - callvalue == stack[2]
 - calldatahash == keccak256(stack[3] + mem offset, stack[4])
@return
 - @param success - boolean added to stack
 - @param returndatasize - location stored in memory 
 - @param returndata - copied to mem[in: insize] (only the requested size is copied. if insize > returndatasize, remaining 0 bytes are appended to the end)
 
## VERIFY_ACCESS_CALL_7
Used for staticcall & delegatecall
Input Stack: [gas, address, in, insize, out, outsize]
@dev SIO Block Structure:
 - opcode (1 byte) offset = 0
 - receipt hash (32 bytes) offset = 1
 - gas (32 bytes) offset = 33
 - address (20 bytes) offset = 65
 - calldatahash (32 bytes) offset = 85
 - call success (1 byte) offset = 117
 - returndatasize (32 bytes) offset = 118
 - returndata - copied to mem[in: insize] (only the requested size is copied. if insize > returndatasize, execution should stop)
@dev Verification:
 - gas == stack[0]
 - address == stack[1]
 - calldatahash == keccak256(stack[2] + mem offset, stack[3])
@return
 - @param success - boolean added to stack
 - @param returndatasize - stored in memory 
 - @param returndata - stored at mem[in: insize]