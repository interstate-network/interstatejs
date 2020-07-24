import { BN } from "ethereumjs-util";
import AccessWitness, { encodeStructAsParameters, decodeStructAsParameters } from './accessWitness';
import toHex from "./toHex";

export const BlockHashWitnessAbi = {
  BlockHashWitness: {
    opcode: 'uint256',
    number: 'uint256',
    hash: 'bytes32'
  }
}

/* HISTORY */
export class BlockHashWitness implements AccessWitness {
  opcode = new BN(0x40);
  stateRootLeave: undefined;
  number: BN;
  hash: BN;

  encode = (): string => encodeStructAsParameters(this, BlockHashWitnessAbi);

  static decode = (data: string): BlockHashWitness => {
    const { number, hash } = decodeStructAsParameters(data, BlockHashWitnessAbi);
    return new BlockHashWitness(<BN> number, <BN> hash);
  }

  abiTypes = ['uint256', 'bytes32'];

  get abiParams() {
    return [this.number, this.hash].map(toHex);
  }

  constructor(number: BN, hash: BN) {
    this.number = number;
    this.hash = hash;
  }
}