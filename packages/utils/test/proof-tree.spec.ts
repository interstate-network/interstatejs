import VM from '@interstatejs/vm/lib';
import { StateTree } from '../src/utils/proof-tree';
import { randomHexBuffer } from '../src/test-utils/random';
import SparseMerkleTree, { BaseDB, CheckpointDB } from '@interstatejs/sparse-merkle-tree';
import { keccak256 } from '../src/utils/keccak256';
import { IncomingTransaction } from '@interstatejs/tx';
import { expect } from 'chai'
import Account from '@interstatejs/account';
import { copyBuffer } from '../src/utils';

async function executeDeploy(address: Buffer, code: Buffer, prin?: boolean): Promise<Buffer> {
  const tree = await SparseMerkleTree.create(new CheckpointDB(new BaseDB()), undefined, 160);
  const state = new StateTree(tree);
  await state.putAccountCode(address, code);
  if (prin) {
    console.log('account in executeDeploy')
    console.log(await state.getAccount(address))
  }
  // const account = await state.getAccount(address);
  // account.codeHash = keccak256(code);
  // await state.putAccount(address, account);
  return state.root;
}

async function executeDeploy2(address: Buffer, code: Buffer): Promise<Buffer> {
  const tree = await SparseMerkleTree.create(undefined, undefined, 160);
  const account = new Account(undefined);
  account.codeHash = keccak256(code);
  await tree.update(address, account.serialize());
  return tree.rootHash;
}

describe('StateTree', async () => {
  let address: Buffer;
  let db: BaseDB;
  let vm: VM;
  let tree: SparseMerkleTree;
  let code: Buffer;
  let root: Buffer;

  before(async () => {
    address = Buffer.from('ab'.repeat(20), 'hex')
    db = new BaseDB();
    tree = await SparseMerkleTree.create(new CheckpointDB(db), undefined, 160);
    vm = await VM.create({ state: tree });
    code = Buffer.from('ff'.repeat(44), 'hex')
  })

  it('StateTree yields same root as SparseMerkleTree', async () => {
    const root1 = await executeDeploy(address, code);
    const root2 = await executeDeploy2(address, code);
    expect(root1.toString('hex')).to.eq(root2.toString('hex'));
  })

  describe('VM Deployment', async () => {
    let itx: IncomingTransaction;
    before(() => {
      itx = new IncomingTransaction({
        from: address,
        data: code
      });
    });

    it('Deploys to the right address', async () => {
      const execResult = await vm.runTx({ tx: itx });
      expect(execResult.createdAddress.toString('hex')).to.eq(address.toString('hex'))
    });

    it('Sets the state root from the manager', async () => {
      root = copyBuffer(itx.stateRoot);
      const stateRoot = await vm.stateManager.getStateRoot()
      expect(root.toString('hex')).to.eq(stateRoot.toString('hex'))
    });

    it('Set the correct code hash', async () => {
      const account = await vm.stateManager.getAccount(address);
      console.log('account in vm')
      console.log(account)
      expect(account.codeHash.toString('hex')).to.eq(keccak256(code).toString('hex'));
    });

    it('Retrieves the account code', async () => {
      const retrievedCode = await vm.stateManager.getContractCode(address);
      expect(retrievedCode.toString('hex')).to.eq(code.toString('hex'))
    });

    it('Gives the same state root as the base tree', async () => {
      const newRoot = await executeDeploy(address, code, true);
      expect(newRoot.toString('hex')).to.eq(root.toString('hex'))
    })
  });
})