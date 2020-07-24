// import copyStateManager from '../state/copyStateManager';
import { InterpreterStep, RunState } from './interpreter';
import * as utils from 'ethereumjs-util'
import BN from 'bn.js';

// export function copyStep(step: InterpreterStep): InterpreterStep {
//   return Object.assign({}, step, {
//     opcode: Object.assign({}, step.opcode),
//     stack: step.stack.slice(),
//     memory: step.memory.slice(),
//     stateManager: copyStateManager(step.stateManager)
//   });
// }

export function sha3(runState: RunState, offset: BN, length: BN): BN {
  let data = Buffer.alloc(0)
  if (!length.isZero()) {
    data = runState.memory.read(offset.toNumber(), length.toNumber())
  }
  return new BN(utils.keccak256(data));
}

// export { copyStateManager };