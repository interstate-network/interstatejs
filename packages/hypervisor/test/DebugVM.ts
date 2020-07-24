import VM, { MessageWitness } from '@interstatejs/vm';
import { RunCallOpts } from '@interstatejs/vm/dist/runCall';
import { toTx, GetTxOpts } from './tx';
import { BufferLike, toHex } from '@interstatejs/utils';
import { toBuffer } from 'ethereumjs-util';
import { compileHypervisor } from '../src/lib/compile';
const hypervisorMacro = compileHypervisor();
// require('../src/compile');

export class DebugVM {
  public vm: VM;
  public hypervisor: Buffer;

  constructor() {}

  async deploy(bytecode: BufferLike, from?: Buffer): Promise<Buffer> {
    const { createdAddress } = await this.vm.runTx(toTx({ data: toBuffer(bytecode), from }));
    return createdAddress;
  }

  async init() {
    this.vm = await VM.create({ produceWitness: true });
    if (this.hypervisor) return this.hypervisor;
    this.hypervisor = await this.deploy(hypervisorMacro.deployedBytecode);
  }

  async call(opts: RunCallOpts) {
    return this.vm.runCall(opts);
  }

  async callHypervisor(witness: MessageWitness): Promise<Buffer> {
    const res = await this.call({
      to: this.hypervisor,
      data: toBuffer(witness.encode()),
    });
    return res.execResult.returnValue
  }

  async getWitness(tx: GetTxOpts) {
    const {
      execResult: { witnesses },
    } = await this.vm.runTx(toTx(tx));
    return witnesses[0];
  }

  async send(tx: GetTxOpts, includeSteps?: boolean) {
    let steps = [];
    
    if (includeSteps) this.vm.on('step', ({ pc, opcode, stack, depth }) => depth == 0 && steps.push({
      pc,
      opcode: opcode.name,
      stack: [...stack].reverse()
    }));

    const {
      createdAddress,
      execResult: { runState, witnesses },
      amountSpent
    } = await this.vm.runTx(toTx(tx));
    const witness = witnesses[0];
    const txo = witness.encode()
    
    return {
      ...runState,
      txo,
      amountSpent,
      createdAddress,
      witness,
      witnesses,
      steps
    };
  }
}