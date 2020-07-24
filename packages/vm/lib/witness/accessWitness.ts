import { BN, toBuffer } from "ethereumjs-util";
const ABI = require('web3-eth-abi')
import { toHex } from './toHex';

export interface AbiEncodeable {
  abiTypes: String[];
  abiParams: any[];
}

export default interface AccessWitness {
  opcode: BN;
  stateRootLeave?: BN | undefined;
  encode: () => string;
}

// export function abiEncode(encodeable: AbiEncodeable): Buffer {
//   return ABI.encodeParameters(encodeable.abiTypes, encodeable.abiParams);
// }

// export function encodeAccess(access: AccessWitness): string {
//   const abiTypes = ['uint256', ...access.abiTypes];
//   const abiParams = [toHex(access.opcode), ...access.abiParams];
//   return toHex(abiEncode({ abiTypes, abiParams }));
// }

export function abiObjectToArray(obj: any): any[] {
  return Object.keys(obj).reduce((arr: any[], k: string) => ([
    ...arr, obj[k]
  ]), []);
}

const abiDefToFieldsArray = (abiDef: any): string[] => {
  const [ structName ] = Object.keys(abiDef);
  const abi = abiDef[structName];
  return Object.keys(abi);
}

const abiDefToTypesArray = (abiDef: any): string[] => {
  const [ structName ] = Object.keys(abiDef);
  const abi = abiDef[structName];
  const keys = Object.keys(abi);
  return keys.reduce((arr: any, key: string) => ([ ...arr, abi[key] ]), []);
}

const fieldToAbiCompatible = (field: Buffer | BN | boolean | string | Array<string>): boolean | string | Array<string> => {
  if (typeof field == 'boolean') return field;
  if (Array.isArray(field) && !Buffer.isBuffer(field)) return field;
  if (typeof field == 'string') return field;
  return toHex(field);
}

const objectToAbiCompatible = (obj: ValuesMap, abiDef: any) => {
  const [ structName ] = Object.keys(abiDef);
  const abi = abiDef[structName];
  const keys = Object.keys(abi);
  return keys.reduce((res: any, key: string) => ({
    ...res,
    [key]: fieldToAbiCompatible(obj[key])
  }), {});
}

export function encodeStruct(obj: any, abiDef: any): string {
  return ABI.encodeParameter(abiDef, objectToAbiCompatible(obj, abiDef));
}

export function encodeStructAsParameters(obj: any, abiDef: any): string {
  const [ structName ] = Object.keys(abiDef);
  const abi = abiDef[structName];
  const keys = Object.keys(abi);
  const abiTypes = [];
  const abiParams = [];
  for (let key of keys) {
    const val = obj[key];
    const abiType = abi[key];
    abiTypes.push(abiType);
    if (typeof val == 'boolean') abiParams.push(val);
    else if (abiType.includes('[]')) {
      abiParams.push(val);
    } else abiParams.push(toHex(<Buffer | BN> val));
    // console.log(`${abiType} -- ${abiParams[abiParams.length - 1]}`)
  }
  return ABI.encodeParameters(abiTypes, abiParams);
}

type ValuesMap = {
  [key: string]: Buffer | BN | boolean | string | Array<string>
}

export function convertAddress(addr: string): BN {
  return new BN(addr.slice(2), 'hex');
}

export function convertBytes32(b32: string): BN {
  return new BN(b32.slice(2), 'hex');
}

export function convertUint(val: string): BN {
  if (val.slice(0, 2) == '0x') return new BN(val.slice(2), 'hex');
  return new BN(val);
}

export function decodeStructAsParameters(data: string, abiDef: any): ValuesMap {
  const abiTypes = abiDefToTypesArray(abiDef);
  const abiParams = abiObjectToArray(ABI.decodeParameters(abiTypes, data));
  const fields = abiDefToFieldsArray(abiDef)
  const res: ValuesMap = {};
  for (let i = 0; i < abiParams.length; i++) {
    const param = abiParams[i];
    const _type = abiTypes[i];
    const field = fields[i];
    switch(_type) {
      case 'address':
        res[field] = convertAddress(param);
        break;
      case 'bytes32':
        res[field] = convertBytes32(param);
        break;
      case 'bytes':
        res[field] = toBuffer(param);
        break;
      case 'bool':
        res[field] = Boolean(param);
        break;
      case 'uint256':
        res[field] = convertUint(param);
        break;
      default:
        res[field] = param;
    }
  }
  return res;
}