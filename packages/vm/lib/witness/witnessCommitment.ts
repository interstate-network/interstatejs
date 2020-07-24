import * as BN from 'bn.js';
import { toBuffer, keccak256 } from 'ethereumjs-util';

import MessageWitness from './message'
import { ERROR } from '../exceptions';
import { CallCodeWitness, CallWitness, StaticCallWitness, DelegateCallWitness } from './call';

type CallRecordUnion = CallCodeWitness | CallWitness | StaticCallWitness | DelegateCallWitness;

const getCallRecords = (messageWitness: MessageWitness): CallRecordUnion[] => <CallRecordUnion[]> messageWitness
  .state_access_list
  .filter((access) => (
    access.opcode.eqn(0xf1) ||
    access.opcode.eqn(0xf2) ||
    access.opcode.eqn(0xf4) ||
    access.opcode.eqn(0xfa)
  )
);

const nullIndexData = keccak256(ERROR.INSUFFICIENT_BALANCE);

function callDepthContained(witnessIndex: number, witnesses: MessageWitness[]) {
  let nextWitness = witnesses[witnessIndex];
  let records = getCallRecords(nextWitness);
  let depth = 0;
  for (let record of records) {
    if (!record.success && record.returndata.equals(nullIndexData)) continue;
    depth += 1;
    let nextIndex = witnessIndex + depth;
    depth += callDepthContained(nextIndex, witnesses);
  }
  return depth;
}

export function commitmentsFromWitnesses(witnesses: MessageWitness[]): WitnessCommitment[]  {
  const commitments: WitnessCommitment[] = [];
  let depth = 0;
  for (let i = 0; i < witnesses.length; i++) {
    let callDepthIndex: number[] = [];
    let witness = witnesses[i];
    let witnessHash = keccak256(witness.encode());
    const { stateRootEnter, stateRootLeave, } = witness;
    let callRecords = getCallRecords(witness);
    for (let record of callRecords) {
      if (!record.success && record.returndata.equals(nullIndexData)) {
        callDepthIndex.push(0);
        continue;
      }
      depth += 1;
      let nextDepth = callDepthContained(i+depth, witnesses);
      callDepthIndex.push(nextDepth + 1);
      depth += nextDepth;
    }
    commitments.push({ stateRootEnter, stateRootLeave, callDepthIndex, witnessHash });
  }
  return commitments;
}

export class WitnessCommitment {
  constructor(
    public callDepthIndex: number[],
    public stateRootEnter: BN,
    public stateRootLeave: BN,
    public witnessHash: Buffer,
  ) {}
}