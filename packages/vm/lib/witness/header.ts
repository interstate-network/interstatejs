import { BN } from "ethereumjs-util";
import AccessWitness, { decodeStructAsParameters, encodeStructAsParameters } from './accessWitness';
import toHex from './toHex'

/* HEADER */

export const CoinbaseWitnessAbi = {
  CoinbaseWitness: {
    opcode: 'uint256',
    coinbase: 'address'
  }
}

export class CoinbaseWitness implements AccessWitness {
  opcode = new BN(0x41);
  stateRootLeave: undefined;
  coinbase: BN;

  abiTypes = ['address'];
  
  get abiParams() {
    return [toHex(this.coinbase)];
  }

  encode = (): string => encodeStructAsParameters(this, CoinbaseWitnessAbi);

  static decode = (data: string): CoinbaseWitness => {
    const { coinbase } = decodeStructAsParameters(data, CoinbaseWitnessAbi);
    return new CoinbaseWitness(<BN> coinbase);
  }

  constructor(coinbase: BN) {
    this.coinbase = coinbase;
  }
}

export const TimestampWitnessAbi = {
  TimestampWitness: {
    opcode: 'uint256',
    timestamp: 'uint256'
  }
}

export class TimestampWitness implements AccessWitness {
  opcode = new BN(0x42);
  stateRootLeave: undefined;
  timestamp: BN;

  abiTypes = ['uint256'];
  
  get abiParams() {
    return [toHex(this.timestamp)];
  }

  encode = (): string => encodeStructAsParameters(this, TimestampWitnessAbi);

  static decode = (data: string): TimestampWitness => {
    const { timestamp } = decodeStructAsParameters(data, TimestampWitnessAbi);
    return new TimestampWitness(<BN> timestamp);
  }

  constructor(timestamp: BN) {
    this.timestamp = timestamp;
  }
}

export const NumberWitnessAbi = {
  NumberWitness: {
    opcode: 'uint256',
    number: 'uint256'
  }
}

export class NumberWitness implements AccessWitness {
  opcode = new BN(0x43);
  stateRootLeave: undefined;
  number: BN;

  abiTypes = ['uint256'];
  
  get abiParams() {
    return [toHex(this.number)];
  }

  encode = (): string => encodeStructAsParameters(this, NumberWitnessAbi);

  static decode = (data: string): NumberWitness => {
    const { number } = decodeStructAsParameters(data, NumberWitnessAbi);
    return new NumberWitness(<BN> number);
  }

  constructor(number: BN) {
    this.number = number;
  }
}

export const DifficultyWitnessAbi = {
  DifficultyWitness: {
    opcode: 'uint256',
    difficulty: 'uint256'
  }
}

export class DifficultyWitness implements AccessWitness {
  opcode = new BN(0x44);
  stateRootLeave: undefined;
  difficulty: BN;

  abiTypes = ['uint256'];
  
  get abiParams() {
    return [toHex(this.difficulty)];
  }

  encode = (): string => encodeStructAsParameters(this, DifficultyWitnessAbi);

  static decode = (data: string): DifficultyWitness => {
    const { difficulty } = decodeStructAsParameters(data, DifficultyWitnessAbi);
    return new DifficultyWitness(<BN> difficulty);
  }

  constructor(difficulty: BN) {
    this.difficulty = difficulty;
  }
}

export const GaslimitWitnessAbi = {
  GaslimitWitness: {
    opcode: 'uint256',
    gaslimit: 'uint256'
  }
}

export class GaslimitWitness implements AccessWitness {
  opcode = new BN(0x45);
  stateRootLeave: undefined;
  gaslimit: BN;

  abiTypes = ['uint256'];
  
  get abiParams() {
    return [toHex(this.gaslimit)];
  }

  encode = (): string => encodeStructAsParameters(this, GaslimitWitnessAbi);

  static decode = (data: string): GaslimitWitness => {
    const { gaslimit } = decodeStructAsParameters(data, GaslimitWitnessAbi);
    return new GaslimitWitness(<BN> gaslimit);
  }

  constructor(gaslimit: BN) {
    this.gaslimit = gaslimit;
  }
}

export const ChainidWitnessAbi = {
  ChainidWitness: {
    opcode: 'uint256',
    chainId: 'uint256'
  }
}

export class ChainidWitness implements AccessWitness {
  opcode = new BN(0x46);
  stateRootLeave: undefined;
  chainId: BN;

  abiTypes = ['uint256'];
  
  get abiParams() {
    return [toHex(this.chainId)];
  }

  encode = (): string => encodeStructAsParameters(this, ChainidWitnessAbi);

  static decode = (data: string): ChainidWitness => {
    const { chainId } = decodeStructAsParameters(data, ChainidWitnessAbi);
    return new ChainidWitness(<BN> chainId);
  }

  constructor(chainId: BN) {
    this.chainId = chainId;
  }
}