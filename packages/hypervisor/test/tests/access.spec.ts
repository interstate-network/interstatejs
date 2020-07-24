import { randomHexBuffer, toInt, sliceBuffer, toHex } from '@interstatejs/utils';
import { expect } from 'chai';
import { DebugVM } from "../DebugVM";
import { compile } from '../../src/lib/easy-huff';
import { toTx } from '../tx';
import { SstoreWitness } from '@interstatejs/vm';
import { BN } from 'ethereumjs-util';
const path = require('path')

const { bytecode } = compile(path.join(__dirname, '..', 'contracts'), 'test.huff', 'TEST');

describe('Test Hypervisor', async () => {
  let vm: DebugVM;
  let testAddress: Buffer;

  before(async () => {
    vm = new DebugVM();
    await vm.init();
    testAddress = randomHexBuffer(20);
    await vm.deploy(bytecode, testAddress);
  });

  it('Should return a success response for a valid witness', async () => {
    const witness = await vm.getWitness({ to: testAddress });
    const { execResult: { returnValue, exceptionError } } = await vm.vm.runTx(toTx({
      to: vm.hypervisor,
      data: witness.encode(),
    }));
    expect(exceptionError).to.be.undefined;
    expect(toInt(returnValue)).to.eq(1);
  });

  it('Should return error code AE for an invalid SSTORE access record', async () => {
    const witness = await vm.getWitness({ to: testAddress });
    (witness.state_access_list[0] as SstoreWitness).slot = new BN(500);
    const { execResult: { returnValue, exceptionError } } = await vm.vm.runTx(toTx({
      to: vm.hypervisor,
      data: witness.encode(),
    }));
    expect(exceptionError).to.not.be.undefined;
    const errorCode = sliceBuffer(returnValue, 0, 32);
    expect(toInt(errorCode)).to.eq(174)
  });
});