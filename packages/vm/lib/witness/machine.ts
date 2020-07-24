// import { BN } from "ethereumjs-util";
// import AccessWitness from './accessWitness';
// import toHex from './toHex'

// /* MACHINE */
// export class GasWitness implements AccessWitness {
//   opcode = new BN(0x5a);
//   stateRootLeave: undefined;
//   gas: BN;

//   abiTypes = ['uint256'];
  
//   get abiParams() {
//     return [toHex(this.gas)];
//   }

//   constructor(gas: BN) {
//     this.gas = gas;
//   }
// }