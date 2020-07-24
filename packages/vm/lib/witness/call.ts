import { BN } from "ethereumjs-util";
import AccessWitness, { decodeStructAsParameters, encodeStructAsParameters } from './accessWitness';
import toHex from './toHex';
/* CALL */
export const CallWitnessAbi = {
  CallWitness: {
    opcode: 'uint256',
    stateRootLeave: 'bytes32',
    gas: 'uint256',
    gasUsed: 'uint256',
    gasRefund: 'uint256',
    address: 'address',
    value: 'uint256',
    calldataHash: 'bytes32',
    success: 'bool',   
    returndata: 'bytes'   
  }
}
export class CallWitness implements AccessWitness {
  opcode = new BN(0xf1);
  // stateRootLeave: BN;
  // gas: BN;
  // gasUsed: BN = new BN(0);
  // gasRefund: BN = new BN(0);
  // address: BN;
  // value: BN;
  // calldataHash: BN;
  // success: Boolean;
  // returndata: Buffer;

  static _abiTypes = [
    'bytes32', // stateRootLeave
    'uint256', // gas
    'uint256', // gasUsed
    'uint256', // gasRefund
    'address', // address
    'uint256', // value
    'bytes32', // calldataHash
    'bool',    // success
    'bytes'    // returndata
  ];

  get abiTypes() { return CallWitness._abiTypes; }

  get abiParams() {
    return [
      toHex(this.stateRootLeave),
      toHex(this.gas),
      toHex(this.gasUsed),
      toHex(this.gasRefund),
      toHex(this.address),
      toHex(this.value),
      toHex(this.calldataHash),
      this.success,
      toHex(this.returndata)
    ];
  }

  encode = (): string => encodeStructAsParameters(this, CallWitnessAbi);

  static decode = (data: string): CallWitness => {
    const {
      stateRootLeave,
      gas,
      gasUsed,
      gasRefund,
      address,
      value,
      calldataHash,
      success,
      returndata,
    } = decodeStructAsParameters(data, CallWitnessAbi);
    return new CallWitness(
      <BN> stateRootLeave,
      <BN> gas,
      <BN> gasUsed,
      <BN> gasRefund,
      <BN> address,
      <BN> value,
      <BN> calldataHash,
      <Boolean> success,
      <Buffer> returndata
    );
  }

  constructor(
    public stateRootLeave: BN,
    public gas: BN,
    public gasUsed: BN,
    public gasRefund: BN,
    public address: BN,
    public value: BN,
    public calldataHash: BN,
    public success: Boolean,
    public returndata: Buffer,
    public calldata?: Buffer // Not part of the record encoding, but used within the auditor
  ) {}
}

export class CallCodeWitness extends CallWitness {
  opcode = new BN(0xf2);
  static decode = (data: string): CallCodeWitness => {
    const {
      stateRootLeave,
      gas,
      gasUsed,
      gasRefund,
      address,
      value,
      calldataHash,
      success,
      returndata,
    } = decodeStructAsParameters(data, CallWitnessAbi);
    return new CallCodeWitness(
      <BN> stateRootLeave,
      <BN> gas,
      <BN> gasUsed,
      <BN> gasRefund,
      <BN> address,
      <BN> value,
      <BN> calldataHash,
      <Boolean> success,
      <Buffer> returndata
    );
  }
}

export const DelegateCallWitnessAbi = {
  DelegateCallWitness: {
    opcode: 'uint256',
    stateRootLeave: 'bytes32',
    gas: 'uint256',
    gasUsed: 'uint256',
    gasRefund: 'uint256',
    address: 'address',
    calldataHash: 'bytes32',
    success: 'bool',   
    returndata: 'bytes'   
  }
}
export class DelegateCallWitness implements AccessWitness {
  opcode = new BN(0xf4);
  stateRootLeave: BN;
  gas: BN;
  gasUsed: BN;
  gasRefund: BN;
  address: BN;
  calldataHash: BN;
  success: Boolean;
  returndata: Buffer;

  static _abiTypes = [
    'bytes32', // stateRootLeave
    'uint256', // gas
    'uint256', // gasUsed
    'uint256', // gasRefund
    'address', // address
    'bytes32', // calldataHash
    'bool',    // success
    'bytes'    // returndata
  ];

  get abiTypes() { return DelegateCallWitness._abiTypes; }

  get abiParams() {
    return [
      toHex(this.stateRootLeave),
      toHex(this.gas),
      toHex(this.gasUsed),
      toHex(this.gasRefund),
      toHex(this.address),
      toHex(this.calldataHash),
      this.success,
      toHex(this.returndata)
    ];
  }

  encode = (): string => encodeStructAsParameters(this, DelegateCallWitnessAbi);

  static decode = (data: string): DelegateCallWitness => {
    const {
      stateRootLeave,
      gas,
      gasUsed,
      gasRefund,
      address,
      calldataHash,
      success,
      returndata,
    } = decodeStructAsParameters(data, DelegateCallWitnessAbi)
    return new DelegateCallWitness(
      <BN> stateRootLeave,
      <BN> gas,
      <BN> gasUsed,
      <BN> gasRefund,
      <BN> address,
      <BN> calldataHash,
      <Boolean> success,
      <Buffer> returndata
    );
  }

  constructor(
    stateRootLeave: BN,
    gas: BN,
    gasUsed: BN,
    gasRefund: BN,
    address: BN,
    calldataHash: BN,
    success: Boolean,
    returndata: Buffer
    ) {
      this.stateRootLeave = stateRootLeave;
      this.gas = gas;
      this.gasUsed = gasUsed;
      this.gasRefund = gasRefund;
      this.address = address;
      this.calldataHash = calldataHash;
      this.success = success;
      this.returndata = returndata;
  }
}

export const StaticCallWitnessAbi = {
  StaticCallWitness: {
    opcode: 'uint256',
    gas: 'uint256',
    gasUsed: 'uint256',
    address: 'address',
    calldataHash: 'bytes32',
    success: 'bool',   
    returndata: 'bytes'   
  }
}

export class StaticCallWitness implements AccessWitness {
  opcode = new BN(0xfa);

  static _abiTypes = [
    'uint256',
    'uint256',
    'address',
    'bytes32',
    'bool',
    'bytes'
  ];

  get abiTypes() { return StaticCallWitness._abiTypes; }

  get abiParams() {
    return [
      toHex(this.gas),
      toHex(this.gasUsed),
      toHex(this.address),
      toHex(this.calldataHash),
      this.success,
      toHex(this.returndata)
    ];
  }

  encode = (): string => encodeStructAsParameters(this, StaticCallWitnessAbi);

  static decode = (data: string): StaticCallWitness => {
    const {
      gas,
      gasUsed,
      address,
      calldataHash,
      success,
      returndata,
    } = decodeStructAsParameters(data, StaticCallWitnessAbi);
    return new StaticCallWitness(
      <BN> gas,
      <BN> gasUsed,
      <BN> address,
      <BN> calldataHash,
      <Boolean> success,
      <Buffer> returndata
    );
  }

  constructor(
    public gas: BN,
    public gasUsed: BN,
    public address: BN,
    public calldataHash: BN,
    public success: Boolean,
    public returndata: Buffer,
    public calldata?: Buffer // Not part of the record encoding, but used within the auditor
    ) {}
}
