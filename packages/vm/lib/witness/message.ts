import { BN, toBuffer } from "ethereumjs-util";
import AccessWitness, { AbiEncodeable, encodeStructAsParameters, encodeStruct, convertBytes32, convertAddress, convertUint, decodeStructAsParameters } from './accessWitness';
const ABI = require('web3-eth-abi')
import toHex from './toHex';
import { BufferLike } from "@interstatejs/tx";
import { sliceBuffer, toInt, toBn } from "@interstatejs/utils";
import { BlockHashWitness } from "./history";
import { SloadWitness, SstoreWitness } from "./storage";
import { CoinbaseWitness, TimestampWitness, NumberWitness, DifficultyWitness, GaslimitWitness, ChainidWitness } from "./header";
import { BalanceWitness, SelfBalanceWitness, ExtCodeHashWitness, ExtCodeSizeWitness, ExtCodeCopyWitness } from "./global-state";
import { Log0Witness, Log1Witness, Log2Witness, Log3Witness, Log4Witness } from "./logs";
import { CallWitness, CallCodeWitness, DelegateCallWitness, StaticCallWitness } from "./call";

export enum Status {
  exception = 0,
  success = 1,
  revert = 2
}

/* const prettyPrintWords = (abiEncodedString: any) =>
  abiEncodedString.slice(2).match(/.{64}/g)
    .map((word: any, index: any) => console.log(
      `0x${(index * 32).toString(16)} | ${word}`
    )) */

/**
 * TODO: Only works for access records with no dynamic fields.
 */
export function abiDecode(types: string[], data: BufferLike) {
  return ABI.decodeParameters(types, data);
}

// export function encodeAccess(access: AccessWitness): string {
//   const abiTypes = ['uint256', ...access.abiTypes];
//   const abiParams = [toHex(access.opcode), ...access.abiParams];
//   return toHex(abiEncode({ abiTypes, abiParams }));
// }

export const MessageWitnessAbi = {
  MessageWitness: {
    stateRootEnter: 'bytes32',
    stateRootLeave: 'bytes32',
    isStatic: 'bool',
    origin: 'address',
    caller: 'address',
    to: 'address',
    context: 'address',
    callvalue: 'uint256',
    gasPrice: 'uint256',
    gasAvailable: 'uint256',
    gasUsed: 'uint256',
    refund: 'uint256',
    state_access_list: 'bytes[]',
    status: 'uint256',
    returndataHash: 'bytes32',
    calldata: 'bytes'
  }
}

export function decodeAccessRecord(bytes: string): AccessWitness {
  const buf = toBuffer(bytes);
  // One of the records without dynamic fields
  const first32 = sliceBuffer(buf, 0, 32);
  const op = toInt(first32);
  switch(op) {
    case 0x31: return BalanceWitness.decode(bytes);
    case 0x3b: return ExtCodeSizeWitness.decode(bytes);
    case 0x3c: return ExtCodeCopyWitness.decode(bytes);
    case 0x3f: return ExtCodeHashWitness.decode(bytes);
    case 0x40: return BlockHashWitness.decode(bytes);
    case 0x41: return CoinbaseWitness.decode(bytes);
    case 0x42: return TimestampWitness.decode(bytes);
    case 0x43: return NumberWitness.decode(bytes);
    case 0x44: return DifficultyWitness.decode(bytes);
    case 0x45: return GaslimitWitness.decode(bytes);
    case 0x46: return ChainidWitness.decode(bytes);
    case 0x47: return SelfBalanceWitness.decode(bytes);
    case 0x54: return SloadWitness.decode(bytes);
    case 0x55: return SstoreWitness.decode(bytes);
    case 0xa0: return Log0Witness.decode(bytes);
    case 0xa1: return Log1Witness.decode(bytes);
    case 0xa2: return Log2Witness.decode(bytes);
    case 0xa3: return Log3Witness.decode(bytes);
    case 0xa4: return Log4Witness.decode(bytes);
    case 0xf1: return CallWitness.decode(bytes);
    case 0xf2: return CallCodeWitness.decode(bytes);
    case 0xf4: return DelegateCallWitness.decode(bytes);
    case 0xfa: return StaticCallWitness.decode(bytes);
    default: throw new Error('Invalid encoding for witness')
  }
}

export function decodeMessageWitness(data: string): MessageWitness {
  const obj = decodeStructAsParameters(data, MessageWitnessAbi);
  //ABI.decodeParameter(MessageWitnessAbi, data);
  const { state_access_list } = obj;
  const witness = new MessageWitness(
    <BN> obj.stateRootEnter,
    // convertBytes32(obj.stateRootEnter),
    <BN> obj.stateRootLeave,
    // convertBytes32(obj.stateRootLeave),
    <boolean> obj.isStatic,
    // convertAddress(obj.origin),
    <BN> obj.origin,
    // convertAddress(obj.caller),
    <BN> obj.caller,
    // convertAddress(obj.to),
    <BN> obj.to,
    // convertAddress(obj.context),
    <BN> obj.context,
    // convertUint(obj.callvalue),
    <BN> obj.callvalue,
    // convertUint(obj.gasPrice),
    <BN> obj.gasPrice,
    // convertUint(obj.gasAvailable),
    <BN> obj.gasAvailable,
    // convertUint(obj.gasUsed),
    <BN> obj.gasUsed,
    // convertUint(obj.refund),
    <BN> obj.refund,
    <BN> obj.returndataHash,
    // convertBytes32(obj.returndataHash),
    toBuffer(obj.calldata)
  )
  witness.status = <Status> +obj.status;
  for (let record of (state_access_list as string[])) {
    witness.state_access_list.push(decodeAccessRecord(record));
  }
  return witness;
}

export class MessageWitness {
  stateRootEnter: BN;
  stateRootLeave: BN;
  isStatic: boolean;
  origin: BN;
  caller: BN;
  to: BN;
  context: BN;
  callvalue: BN;
  gasPrice: BN;
  gasAvailable: BN;
  gasUsed: BN;
  refund: BN;
  state_access_list: AccessWitness[] = [];
  status: Status | undefined;
  returndataHash: BN;
  calldata: Buffer;

  abiTypes: String[] = [
    'bytes32', // stateRootEnter
    'bytes32', // stateRootLeave
    'bool', // isStatic
    'address', // origin
    'address', // caller
    'address', // to
    'address', // context
    'uint256', // callvalue
    'uint256', // gasPrice
    'uint256', // gasAvailable
    'uint256', // gasUsed
    'uint256', // refund
    'bytes[]', // state_access_list
    'uint256', // status
    'bytes32', // returndataHash
    'bytes'    // calldata
  ];

  get abiTuple() {
    return 
  }
  
  encode(): string {
    const obj = Object.assign({}, this, {
      state_access_list: this.state_access_list.map(record => record.encode())
    });
    return encodeStructAsParameters(obj, MessageWitnessAbi);
    // return encodeStruct(obj, MessageWitnessAbi)
  }

  constructor(
    stateRootEnter: BN,
    stateRootLeave: BN,
    isStatic: boolean,
    origin: BN,
    caller: BN,
    to: BN,
    context: BN,
    callvalue: BN,
    gasPrice: BN,
    gasAvailable: BN,
    gasUsed: BN,
    refund: BN,
    returndataHash: BN,
    calldata: Buffer
  ) {
    this.isStatic = isStatic;
    this.origin = origin;
    this.caller = caller;
    this.to = to;
    this.context = context;
    this.stateRootEnter = stateRootEnter;
    this.stateRootLeave = stateRootLeave;
    this.callvalue = callvalue;
    this.gasPrice = gasPrice;
    this.gasAvailable = gasAvailable;
    this.gasUsed = gasUsed;
    this.refund = refund;
    this.returndataHash = returndataHash;
    this.calldata = calldata;
  }
}

export default MessageWitness;