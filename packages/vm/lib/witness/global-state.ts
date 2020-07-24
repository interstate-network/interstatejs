import { BN } from "ethereumjs-util";
import AccessWitness, { decodeStructAsParameters, encodeStructAsParameters } from './accessWitness';
import toHex from './toHex';

/* GLOBAL STATE */
export const BalanceWitnessAbi = {
  BalanceWitness: {
    opcode: 'uint256',
    address: 'address',
    balance: 'uint256'
  }
}

export class BalanceWitness implements AccessWitness {
  opcode = new BN(0x31);
  stateRootLeave: undefined;
  address: BN;
  balance: BN;
  abiTypes = ['address', 'uint256'];

  get abiParams() {
    return [this.address, this.balance].map(toHex);
  }

  encode = (): string => encodeStructAsParameters(this, BalanceWitnessAbi);

  static decode = (data: string): BalanceWitness => {
    const { address, balance } = decodeStructAsParameters(data, BalanceWitnessAbi);
    return new BalanceWitness(<BN> address, <BN> balance);
  }
  
  constructor(address: BN, balance: BN) {
    this.address = address;
    this.balance = balance;
  }
}

export const SelfBalanceWitnessAbi = {
  SelfBalanceWitness: {
    opcode: 'uint256',
    selfBalance: 'uint256'
  }
}

export class SelfBalanceWitness implements AccessWitness {
  opcode = new BN(0x47);
  stateRootLeave: undefined;
  selfBalance: BN;
  abiTypes = ['uint256'];

  get abiParams() {
    return [this.selfBalance].map(toHex);
  }

  encode = (): string => encodeStructAsParameters(this, SelfBalanceWitnessAbi);

  static decode = (data: string): SelfBalanceWitness => {
    const { selfBalance } = decodeStructAsParameters(data, SelfBalanceWitnessAbi);
    return new SelfBalanceWitness(<BN>selfBalance);
  }
  
  constructor(selfBalance: BN) {
    this.selfBalance = selfBalance;
  }
}

export const ExtCodeHashWitnessAbi = {
  ExtCodeHashWitness: {
    opcode: 'uint256',
    address: 'address',
    hash: 'bytes32'
  }
}

export class ExtCodeHashWitness implements AccessWitness {
  opcode = new BN(0x3f);
  stateRootLeave: undefined;
  address: BN;
  hash: BN;
  abiTypes = ['address', 'bytes32'];

  get abiParams() {
    return [this.address, this.hash].map(toHex);
  }

  encode = (): string => encodeStructAsParameters(this, ExtCodeHashWitnessAbi);

  static decode = (data: string): ExtCodeHashWitness => {
    const { address, hash } = decodeStructAsParameters(data, ExtCodeHashWitnessAbi);
    return new ExtCodeHashWitness(<BN> address, <BN> hash);
  }

  constructor(address: BN, hash: BN) {
    this.address = address;
    this.hash = hash;
  }
}

export const ExtCodeSizeWitnessAbi = {
  ExtCodeSizeWitness: {
    opcode: 'uint256',
    address: 'address',
    size: 'uint256'
  }
}

export class ExtCodeSizeWitness implements AccessWitness {
  opcode = new BN(0x3b);
  stateRootLeave: undefined;
  address: BN;
  size: BN;
  abiTypes = ['address', 'uint256'];

  get abiParams() {
    return [this.address, this.size].map(toHex);
  }

  encode = (): string => encodeStructAsParameters(this, ExtCodeSizeWitnessAbi);

  static decode = (data: string): ExtCodeSizeWitness => {
    const { address, size } = decodeStructAsParameters(data, ExtCodeSizeWitnessAbi);
    return new ExtCodeSizeWitness(<BN> address, <BN> size);
  }

  constructor(address: BN, size: BN) {
    this.address = address;
    this.size = size;
  }
}

export const ExtCodeCopyWitnessAbi = {
  ExtCodeCopyWitness: {
    opcode: 'uint256',
    address: 'address',
    exists: 'bool'
  }
}

export class ExtCodeCopyWitness implements AccessWitness {
  opcode = new BN(0x3c);
  stateRootLeave: undefined;
  address: BN;
  exists: Boolean;
  abiTypes = ['address', 'bool'];

  get abiParams() {
    return [toHex(this.address), this.exists];
  }

  encode = (): string => encodeStructAsParameters(this, ExtCodeCopyWitnessAbi);

  static decode = (data: string): ExtCodeCopyWitness => {
    const {address, exists} = decodeStructAsParameters(data, ExtCodeCopyWitnessAbi)
    return new ExtCodeCopyWitness(<BN> address, <Boolean> exists);
  }

  constructor(address: BN, exists: Boolean) {
    this.address = address;
    this.exists = exists;
  }
}