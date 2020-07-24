export type AbiBaseType = 'uint256' | 'address' | 'bool' | 'bytes' | 'bytes32';
interface AbiDef { [key: string]: AbiBaseType };
interface AbiMetaDef { [key: string]: AbiDef }

/* struct BalanceWitness { // 0x31
    uint256 opcode;
    address target;
    uint256 value;
  }

  function toBalanceWitness(bytes memory _encoded) internal pure returns(BalanceWitness memory witness) {
    return abi.decode((_encoded), (BalanceWitness));
  } */
export type ArrayJoinInput<T = string> = Array<ArrayJoinInput<T>> | Array<T> | T;

export function joinArr(arr: ArrayJoinInput): string {
  const ret: string[] = [];
  const doMap = (subArr: ArrayJoinInput<string>, depth = 0) => {
    if (subArr == null || subArr == undefined) return;
    if (Array.isArray(subArr)) for (let x of subArr) doMap(x, depth + 1);
    else if (typeof subArr == 'string') {
      if (subArr.length > 0) ret.push(`${'\t'.repeat(depth)}${subArr}`)
      else ret.push('');
    }
  }
  for (let x of arr) doMap(x);
  if (ret[ret.length - 1] == '' || ret[ret.length-1] == '\n') ret.pop();
  return ret.join(`\n`);
}

export function generateStructDecoderWithParameters(abiMetaDef: AbiMetaDef) {
  const [structName] = Object.keys(abiMetaDef);
  const abiDef = abiMetaDef[structName];
  const fields = Object.keys(abiDef);
  const varsTuple = [];
  const typesTuple = [];
  const fieldsTuple = [];
  const structArr = [];
  for (let field of fields) {
    let type: string = abiDef[field];
    let varType = (type == 'bytes') ? 'bytes memory' : type;
    varsTuple.push(`${varType} ${field}`);
    typesTuple.push(type);
    fieldsTuple.push(field);
    structArr.push(`${type} ${field};`)
  }
  const resArr = [
    `struct ${structName} {`,
    structArr,
    `}`,
    '',
    `function to${structName}(bytes memory data)`,
    `internal pure returns (${structName} memory) {`,
    [
      `(${varsTuple.join(', ')}) = abi.decode((data), (${typesTuple.join(', ')}));`,
      `return ${structName}(${fieldsTuple.join(', ')});`
    ],
    `}`
  ];
  return joinArr(resArr);
}

const SloadWitnessAbi = {
  SloadWitness: {
    opcode: 'uint256',
    slot: 'uint256',
    value: 'uint256',
  }
}

const SstoreWitnessAbi = {
  SstoreWitness: {
    opcode: 'uint256',
    stateRootLeave: 'bytes32',
    slot: 'uint256',
    value: 'uint256',
    refund: 'uint256',
  }
}

const StaticCallWitnessAbi = {
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

const DelegateCallWitnessAbi = {
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

const CallWitnessAbi = {
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

const BalanceWitnessAbi = {
  BalanceWitness: {
    opcode: 'uint256',
    address: 'address',
    balance: 'uint256'
  }
}

const SelfBalanceWitnessAbi = {
  SelfBalanceWitness: {
    opcode: 'uint256',
    balance: 'uint256'
  }
}

const ExtCodeHashWitnessAbi = {
  ExtCodeHashWitness: {
    opcode: 'uint256',
    address: 'address',
    hash: 'bytes32'
  }
}

const ExtCodeSizeWitnessAbi = {
  ExtCodeSizeWitness: {
    opcode: 'uint256',
    address: 'address',
    size: 'uint256'
  }
}

const ExtCodeCopyWitnessAbi = {
  ExtCodeCopyWitness: {
    opcode: 'uint256',
    address: 'address',
    exists: 'bool'
  }
}

const CoinbaseWitnessAbi = {
  CoinbaseWitness: {
    opcode: 'uint256',
    coinbase: 'address'
  }
}

const TimestampWitnessAbi = {
  TimestampWitness: {
    opcode: 'uint256',
    timestamp: 'uint256'
  }
}

const NumberWitnessAbi = {
  NumberWitness: {
    opcode: 'uint256',
    number: 'uint256'
  }
}

const DifficultyWitnessAbi = {
  DifficultyWitness: {
    opcode: 'uint256',
    difficulty: 'uint256'
  }
}

const GaslimitWitnessAbi = {
  GaslimitWitness: {
    opcode: 'uint256',
    gaslimit: 'uint256'
  }
}

const ChainidWitnessAbi = {
  ChainidWitness: {
    opcode: 'uint256',
    chainId: 'uint256'
  }
}

const BlockHashWitnessAbi = {
  BlockHashWitness: {
    opcode: 'uint256',
    number: 'uint256',
    hash: 'bytes32'
  }
}

const Log0WitnessAbi = {
  Log0Witness: {
    opcode: 'uint256',
    dataHash: 'bytes32'
  }
}

const Log1WitnessAbi = {
  Log1Witness: {
    opcode: 'uint256',
    topic: 'bytes32',
    dataHash: 'bytes32'
  }
}

const Log2WitnessAbi = {
  Log2Witness: {
    opcode: 'uint256',
    topic0: 'bytes32',
    topic1: 'bytes32',
    dataHash: 'bytes32'
  }
}

const Log3WitnessAbi = {
  Log3Witness: {
    opcode: 'uint256',
    topic0: 'bytes32',
    topic1: 'bytes32',
    topic2: 'bytes32',
    dataHash: 'bytes32'
  }
}

const Log4WitnessAbi = {
  Log4Witness: {
    opcode: 'uint256',
    topic0: 'bytes32',
    topic1: 'bytes32',
    topic2: 'bytes32',
    topic3: 'bytes32',
    dataHash: 'bytes32'
  }
}

const arr = [];
const abis = [
  SloadWitnessAbi,
  SstoreWitnessAbi,
  StaticCallWitnessAbi,
  DelegateCallWitnessAbi,
  CallWitnessAbi,
  BalanceWitnessAbi,
  SelfBalanceWitnessAbi,
  ExtCodeHashWitnessAbi,
  ExtCodeSizeWitnessAbi,
  ExtCodeCopyWitnessAbi,
  CoinbaseWitnessAbi,
  TimestampWitnessAbi,
  NumberWitnessAbi,
  DifficultyWitnessAbi,
  GaslimitWitnessAbi,
  ChainidWitnessAbi,
  BlockHashWitnessAbi,
  Log0WitnessAbi,
  Log1WitnessAbi,
  Log2WitnessAbi,
  Log3WitnessAbi,
  Log4WitnessAbi,
]

for (let abi of abis) {
  arr.push(
    generateStructDecoderWithParameters(abi as AbiMetaDef)
  );
  arr.push('');
}
const str = joinArr(arr);
require('fs').writeFileSync('./structs.sol', str);

// console.log(generateStructDecoderWithParameters(SloadWitnessAbi as AbiMetaDef))