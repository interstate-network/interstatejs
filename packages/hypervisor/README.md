# ISO Hypervisor
This repository contains the Interstate EVM Hypervisor - a huff contract which virtualizes EVM execution in order to audit records of EVM execution.

# Message Witness
The calldata to the hypervisor is an ABI encoded Message Witness, which is defined by the struct:

```cs
struct MessageWitness {
  bytes32         stateRootEnter
  bytes32         stateRootLeave
  bool            isStatic
  address         origin
  address         caller
  address         to
  address         context
  uint256         callvalue
  uint256         gasPrice
  uint256         gasAvailable
  uint256         gasUsed
  AccessWitness[] state_access_list
  uint256         status
  bytes32         returndataHash
  bytes           calldata
}
```

So the calldata will look like:
[0-32] offset

[32-64] stateRootEnter

[64-96] stateRootLeave

[96-128] isStatic

[128-160] origin

[160-192] caller

[224-256] to

[256-288] context

[288-320] callvalue

[320-352] gasPrice

[352-384] gasAvailable

[384-416] gasUsed

[416-448] state_access_list_offset

[448-480] status

[480-512] returnDataHash

[512-544] calldata_offset

# Setup
When the hypervisor contract is called, it initializes restricted memory with all the data it needs
to begin execution. First, it derives the archive address from the context address in the TXO and copies
all but the first byte of archived code into its guest code memory. It then finds the offset of the first
SIO in calldata and sets the next SIO pointer. Finally, it sets the offset of guest memory to the
next multiple of 32 following the end of its restricted memory region. This ensures that the MSIZE
opcode, which evaluates to the maximum memory location touched during execution and rounds
up to the nearest multiple of 32, can always be correctly calculated as the difference between the
beginning of guest memory and the native MSIZE.

# Code

# Jump Table
The jump table contains 256 jumpdests, one for every byte value. 

# Memory
The hypervisor’s memory is split into restricted memory and guest memory. Restricted memory
contains all the data the hypervisor needs to model an EVM execution environment, while guest
memory is accessible to the virtualized contract it executes.

## Restricted Memory
Restricted memory contains the guest code, program counter and guest
memory pointer, as well as calldata pointers for the next SIO struct and latest returndatasize.

Virtualized contracts can never access the restricted memory of the hypervisor.

# Input
The calldata sent to the hypervisor is an abi-encoded TXO. The context address refers to the
contract executing the code, while to refers to the contract whose code is being executed.

**msize**


# State Access Operations

# Logs
Unimplemented

# Gas
Unimplemented