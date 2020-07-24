import { expect } from 'chai'
import { IncomingTransaction } from '@interstatejs/tx'
import { Block } from '@interstatejs/block';
import VM from '../lib'
import BN from 'bn.js';

describe('Test VM', async () => {
  let vm: VM;
  let block: Block;
  let contractAddress1;
  let contractAddress2;

  before(async () => {
    vm = await VM.create({})
    contractAddress1 = Buffer.from('ab'.repeat(20), 'hex')
    contractAddress2 = Buffer.from('1e'.repeat(20), 'hex')
    block = new Block()
    block.setGenesisParams()
    block.header.coinbase = Buffer.from('ff'.repeat(20), 'hex')
  })

  it('Should deploy a contract that returns the result of a multiplication', async () => {
    const tx = new IncomingTransaction({
      from: contractAddress1,
      data: Buffer.from('600560020260005260206000f3', 'hex')
    });
    const { createdAddress } = await vm.runTx({ block, tx })
    expect(createdAddress.equals(contractAddress1)).to.be.true
  })

  it('Should call the contract and receive the correct output', async () => {
    const { execResult: { returnValue } } = await vm.runCall({
      caller: contractAddress1,
      to: contractAddress1,
    })
    expect(new BN(returnValue).eqn(10)).to.be.true
  })

  it('Should deploy a contract that writes a value to storage', async () => {
    const tx = new IncomingTransaction({
      from: contractAddress2,
      data: Buffer.from('60ff60005560005460005260206000f3', 'hex')
    });
    const { createdAddress } = await vm.runTx({ block, tx })
    expect(createdAddress.equals(contractAddress2)).to.be.true
  })

  it('Should call the contract and receive the correct output', async () => {
    const { execResult: { returnValue } } = await vm.runCall({
      caller: contractAddress1,
      to: contractAddress2,
    })
    expect(new BN(returnValue).eqn(255)).to.be.true
  })
})