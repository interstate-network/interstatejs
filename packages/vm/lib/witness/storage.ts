import { BN } from "ethereumjs-util";
import AccessWitness, { decodeStructAsParameters, encodeStructAsParameters } from './accessWitness';
import toHex from './toHex'

export const SloadWitnessAbi = {
  SloadWitness: {
    opcode: 'uint256',
    slot: 'uint256',
    value: 'uint256',
  }
}

/* STORAGE */
export class SloadWitness implements AccessWitness {
  opcode = new BN(0x54);
  stateRootLeave: undefined;
  slot: BN;
  value: BN;

  abiTypes = ['uint256', 'uint256'];
  get abiParams() {
    return [
      this.slot,
      this.value
    ].map(toHex)
  }

  encode = (): string => encodeStructAsParameters(this, SloadWitnessAbi)

  static decode = (data: string): SloadWitness => {
    const { slot, value } = decodeStructAsParameters(data, SloadWitnessAbi)
    return new SloadWitness(<BN> slot, <BN> value);
  }
  
  constructor(slot: BN, value: BN) {
    this.slot = slot;
    this.value = value;
  }
}

export const SstoreWitnessAbi = {
  SstoreWitness: {
    opcode: 'uint256',
    stateRootLeave: 'bytes32',
    slot: 'uint256',
    value: 'uint256',
    refund: 'uint256',
  }
}

export class SstoreWitness implements AccessWitness {
  opcode = new BN(0x55);
  stateRootLeave: BN;
  slot: BN;
  value: BN;
  refund: BN;

  encode = (): string => encodeStructAsParameters(this, SstoreWitnessAbi)

  static decode = (data: string): SstoreWitness => {
    const { stateRootLeave, slot, value, refund } = decodeStructAsParameters(data, SstoreWitnessAbi);
    return new SstoreWitness(
      <BN> stateRootLeave,
      <BN> slot,
      <BN> value,
      <BN> refund,
    );
  }

  abiTypes = ['bytes32', 'uint256', 'uint256', 'uint256'];
  get abiParams() {
    return [
      this.stateRootLeave,
      this.slot,
      this.value,
      this.refund
    ].map(toHex)
  }
  
  constructor(stateRootLeave: BN, slot: BN, value: BN, refund: BN) {
    this.stateRootLeave = stateRootLeave;
    this.slot = slot;
    this.value = value;
    this.refund = refund;
  }
}