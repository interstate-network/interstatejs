import { randomHexBuffer } from '@interstatejs/utils';
import { expect } from 'chai';
import path from 'path';
import { MessageWitness } from '@interstatejs/vm';
import { toBuffer } from 'ethereumjs-util';
import BN from 'bn.js';
import { DebugVM } from "../DebugVM";
import { compileCalldataTest } from '../../src/lib/compile';

import { compile } from '../contracts/easy-huff';

const { bytecode } = compile(path.join(__dirname, '..', 'contracts'), 'test.huff', 'TEST');

describe('Test Calldata Access', async () => {
  let vm: DebugVM;
  let testAddress: Buffer;
  let calldataTestAddress: Buffer;
  let witness: MessageWitness;
  let calldataBuffer: string;

  before(async () => {
    vm = new DebugVM();
    await vm.init();
    testAddress = randomHexBuffer(20);
    calldataTestAddress = randomHexBuffer(20);
    await vm.deploy(bytecode, testAddress);
    await vm.deploy(compileCalldataTest().bytecode, calldataTestAddress);
  });

  it('Should construct a witness by calling the test contract', async () => {
    witness = await vm.getWitness({ to: testAddress });
    expect(witness).to.not.be.null;
  });

  it('Should call the calldata test contract and get a response buffer', async () => {
    const { execResult: { returnValue } } = await vm.vm.runCall({
      to: calldataTestAddress,
      caller: testAddress,
      data: toBuffer(witness.encode())
    });
    expect(returnValue).to.not.be.null;
    calldataBuffer = returnValue.toString('hex');
  });

  it('Should match the witness values', async () => {
    const arr: Array<[BN, string]> = [
      [witness.origin, 'origin'],
      [witness.caller, 'caller'],
      [witness.to, 'to'],
      [witness.context, 'context'],
      [witness.stateRootEnter, 'stateRootEnter'],
      [witness.stateRootLeave, 'stateRootLeave'],
      [witness.callvalue, 'callvalue'],
      [witness.gasPrice, 'gasPrice'],
      [witness.gasAvailable, 'gasAvailable'],
      [witness.gasUsed, 'gasUsed'],
      [new BN(witness.calldata.length), 'calldatasize'],
      [new BN(+witness.status.toString()), 'status'],
      [witness.returndataHash, 'returndataHash'],
      [new BN(witness.state_access_list.length), 'sioSize']
    ];

    const realValues = calldataBuffer.match(/.{64}/g);

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      const original = item[0];
      const actual = realValues[i];
      const actualbn = new BN(Buffer.from(actual, 'hex'), 'hex');
      if (!original.eq(actualbn)) {
        throw new Error(
          `Value for ${item[1]} at index ${i} did not match:` +
          `\n original ${original.toString('hex')}` +
          `\n actual ${actualbn.toString('hex')}`
        );
      }
    }
  })
})

