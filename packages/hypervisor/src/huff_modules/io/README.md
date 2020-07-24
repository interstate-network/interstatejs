# I/O

## Input/Output for all Hypervisor data sources

This directory contains the pointers and base I/O functions for data sources in use by the Hypervisor.
I/O functions either read from or write to some data available to the hypervisor.
Pointers are locations in memory or calldata.

# Locations
## calldata
[0-20] = offset (ignore)
[20-40] = origin
[40-60] = caller
[60-92] = to
[92-124] = context
[124-156] =  stateRootEnter
[156-188] = stateRootLeave
[188-220] = call value
[220-252] = sio offset
[252-284] = call success
[284-316] = returndata offset
[316-348] = calldata offset

## memory
[0-8192] jump table
(locations given as offsets after jump table)
[0-32] = program counter
[32-64] = sio offset
[64-96] = guest returndatasize cd pptr
[96-128] = guest memory pptr
[128-160] = contract codesize
[160-(160+codesize)] = contract code
[(160+codesize) - ] = guest memory


# Pointers
Pointer macros are denoted with `PTR` in the suffix.
- ## Context
The context of a pointer can be determined by the name. If the pointer points to memory, it will use the base `_PTR` suffix. If it points to calldata, it will use a `_CDPTR`. 
Context is also important in the name of the variable/constant the pointer points to. If the pointer resolves directly to the data it points to, e.g. PC, which resolves to a number, the name for the pointer is the name of the variable, so the pointer for `PC` is `PC_PTR`.

If a memory pointer resolves to another memory pointer, the name is `NAME_PPTR`.
- the memory pointer to the guest memory pointer is called `GUEST_MEM_PPTR`.
If a calldata pointer resolves to another calldata pointer, the name is `NAME_CDPPTR`.
- the calldata pointer to the sio array calldata pointer is called `SIO_CDPPTR`
If a memory pointer resolves to a calldata pointer, the name is `NAME_CDPTR_PTR`

- ## I/O
Each pointer has a macro of the same name (sans suffix) and a prefix of `GET_` which resolves the pointer.
- e.g. `GET_PC()`

Variables can be written to directly using setter macros. These have a prefix of `SET_` and do not include the pointer prefix.
- e.g. `SET_PC()`

