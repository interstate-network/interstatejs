import { StateTree } from "@interstatejs/utils";
import SparseMerkleTree from "@interstatejs/sparse-merkle-tree";
import { keccak256, compile, toHex } from '@interstatejs/utils';
import path from 'path';
import { IncomingTransaction } from "@interstatejs/tx";
import VM from "@interstatejs/vm/lib";
const ABI = require('web3-eth-abi');

describe('TestContract', async () => {
  let contractAddress: Buffer;
  let tree: StateTree
  let vm: VM;
  before(async () => {
    tree = new StateTree(new SparseMerkleTree());
    vm = await VM.create({ state: tree._tree, produceWitness: true });
    contractAddress = Buffer.from('ab'.repeat(20), 'hex');
    const {
      abi,
      evm: { deployedBytecode: { object: bytecode } }
    } = compile(
      path.join(__dirname, '..', 'utils'),
      'TestContract.sol',
      __dirname
    )['TestContract.sol']['TestContract'];
    await vm.runTx({
      tx: new IncomingTransaction({
        from: contractAddress,
        data: Buffer.from(bytecode, 'hex')
      })
    });
    // await tree.putAccountCode(contractAddress, bytecode);
  });

  it('Should execute some shit', async () => {
    const fnSig = ABI.encodeFunctionSignature('executeSload()');
    const result = await vm.runTx({
      tx: new IncomingTransaction({
        from: contractAddress,
        to: contractAddress,
        data: fnSig,
        gasLimit: 100000
      })
    });
    console.log(result.execResult.witnesses[0])
    console.log(result.execResult.exceptionError)
  })
})