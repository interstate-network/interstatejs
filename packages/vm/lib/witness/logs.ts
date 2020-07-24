import { BN } from 'ethereumjs-util';
import AccessWitness, { encodeStructAsParameters, decodeStructAsParameters } from './accessWitness';
import toHex from './toHex';

export const Log0WitnessAbi = {
  Log0Witness: {
    opcode: 'uint256',
    dataHash: 'bytes32'
  }
}

export class Log0Witness implements AccessWitness {
  opcode: BN = new BN(0xa0);
  dataHash: BN;
  
  abiTypes = ['bytes32'];
  get abiParams() {
    return [
      toHex(this.dataHash),
    ];
  }

  encode = (): string => encodeStructAsParameters(this, Log0WitnessAbi)

  static decode = (data: string): Log0Witness => {
    const { dataHash } = decodeStructAsParameters(data, Log0WitnessAbi)
    return new Log0Witness(<BN> dataHash);
  }

  constructor(dataHash: BN) {
    this.dataHash = dataHash;
  }
}

export const Log1WitnessAbi = {
  Log1Witness: {
    opcode: 'uint256',
    topic: 'bytes32',
    dataHash: 'bytes32'
  }
}

export class Log1Witness implements AccessWitness {
  opcode: BN = new BN(0xa1);
  topic: BN;
  dataHash: BN;
  
  abiTypes = ['bytes32', 'bytes32'];
  get abiParams() {
    return [
      this.topic,
      this.dataHash,
    ].map(toHex);
  }

  encode = (): string => encodeStructAsParameters(this, Log1WitnessAbi)

  static decode = (data: string): Log1Witness => {
    const {
      topic,
      dataHash,
    } = decodeStructAsParameters(data, Log1WitnessAbi)
    return new Log1Witness(
      <BN> topic,
      <BN> dataHash,
    );
  }

  constructor(topic: BN, dataHash: BN) {
    this.dataHash = dataHash;
    this.topic = topic;
  }
}

export const Log2WitnessAbi = {
  Log2Witness: {
    opcode: 'uint256',
    topic0: 'bytes32',
    topic1: 'bytes32',
    dataHash: 'bytes32'
  }
}

export class Log2Witness implements AccessWitness {
  opcode: BN = new BN(0xa2);
  topic0: BN;
  topic1: BN;
  dataHash: BN;
  
  abiTypes = ['bytes32'];
  get abiParams() {
    return [
      this.topic0,
      this.topic1,
      this.dataHash,
    ].map(toHex);
  }

  encode = (): string => encodeStructAsParameters(this, Log2WitnessAbi);

  static decode = (data: string): Log2Witness => {
    const {
      topic0,
      topic1,
      dataHash,
    } = decodeStructAsParameters(data, Log2WitnessAbi);
    return new Log2Witness(
      <BN> topic0,
      <BN> topic1,
      <BN> dataHash,
    );
  }

  constructor(topic0: BN, topic1: BN, dataHash: BN) {
    this.topic0 = topic0;
    this.topic1 = topic1;
    this.dataHash = dataHash;
  }
}

export const Log3WitnessAbi = {
  Log3Witness: {
    opcode: 'uint256',
    topic0: 'bytes32',
    topic1: 'bytes32',
    topic2: 'bytes32',
    dataHash: 'bytes32'
  }
}

export class Log3Witness implements AccessWitness {
  opcode: BN = new BN(0xa3);
  topic0: BN;
  topic1: BN;
  topic2: BN;
  dataHash: BN;
  
  abiTypes = ['bytes32'];
  get abiParams() {
    return [
      this.topic0,
      this.topic1,
      this.topic2,
      this.dataHash,
    ].map(toHex);
  }

  encode = (): string => encodeStructAsParameters(this, Log3WitnessAbi)

  static decode = (data: string): Log3Witness => {
    const {
      topic0,
      topic1,
      topic2,
      dataHash,
    } = decodeStructAsParameters(data, Log3WitnessAbi)
    return new Log3Witness(
      <BN> topic0,
      <BN> topic1,
      <BN> topic2,
      <BN> dataHash,
    );
  }

  constructor(topic0: BN, topic1: BN, topic2: BN, dataHash: BN) {
    this.topic0 = topic0;
    this.topic1 = topic1;
    this.topic2 = topic2;
    this.dataHash = dataHash;
  }
}

export const Log4WitnessAbi = {
  Log4Witness: {
    opcode: 'uint256',
    topic0: 'bytes32',
    topic1: 'bytes32',
    topic2: 'bytes32',
    topic3: 'bytes32',
    dataHash: 'bytes32'
  }
}

export class Log4Witness implements AccessWitness {
  opcode: BN = new BN(0xa4);
  topic0: BN;
  topic1: BN;
  topic2: BN;
  topic3: BN;
  dataHash: BN;
  
  abiTypes = ['bytes32'];
  get abiParams() {
    return [
      this.topic0,
      this.topic1,
      this.topic2,
      this.topic3,
      this.dataHash,
    ].map(toHex);
  }

  encode = (): string => encodeStructAsParameters(this, Log4WitnessAbi);

  static decode = (data: string): Log4Witness => {
    const {
      topic0,
      topic1,
      topic2,
      topic3,
      dataHash,
    } = decodeStructAsParameters(data, Log4WitnessAbi)
    return new Log4Witness(
      <BN> topic0,
      <BN> topic1,
      <BN> topic2,
      <BN> topic3,
      <BN> dataHash,
    );
  }

  constructor(topic0: BN, topic1: BN, topic2: BN, topic3: BN, dataHash: BN) {
    this.topic0 = topic0;
    this.topic1 = topic1;
    this.topic2 = topic2;
    this.topic3 = topic3;
    this.dataHash = dataHash;
  }
}