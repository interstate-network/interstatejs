import { expect } from 'chai';
import SparseMerkleTree, { DEFAULT_ROOT_256 } from '@interstatejs/sparse-merkle-tree';
import StateManager from '../lib/state/manager';
import keccak256 from '@interstatejs/utils/src/utils/keccak256';

const address0 = Buffer.from('ff00'.repeat(10), 'hex');
const address1 = Buffer.from('ff01'.repeat(10), 'hex');
const address2 = Buffer.from('ff02'.repeat(10), 'hex');
const address3 = Buffer.from('ff03'.repeat(10), 'hex');
const address4 = Buffer.from('ff04'.repeat(10), 'hex');
const address5 = Buffer.from('ff05'.repeat(10), 'hex');

const slot0 = Buffer.from('ab'.repeat(32), 'hex');
const value = Buffer.from('ff'.repeat(32), 'hex');
const code = Buffer.from('f16060'.repeat(32), 'hex');

describe('State Manager', async () => {
  let state: StateManager;

  before(async () => {
    const tree = await SparseMerkleTree.create(undefined, undefined, 160);
    state = new StateManager({ tree });
    console.log(`Address ${address2.toString('hex')}`)
    console.log(`Code Hash ${keccak256(code).toString('hex')}`)
  });

  it('Should retrieve an empty account', async () => {
    const account = await state.getAccount(address0);
    expect(account.isEmpty()).to.be.true;
  });


  /* it('Writes a value to storage', async () => {
    await state.putContractCode(address1, code)
    await state.putContractStorage(address1, slot0, value)
    const val = await state.getContractStorage
  }) */

  describe('code', async () => {
    it('Should write contract code', async () => {
      await state.putContractCode(address1, code)
    })

    it('Retrieves the same code', async () => {
      const rcode = await state.getContractCode(address1)
      expect(rcode.equals(code)).to.be.true
    })
  })

  describe('storage', async () => {
    it('Should write a value to storage', async () => {
      await state.putContractStorage(address1, slot0, value)
    })

    it('Retrieves the same value', async () => {
      const val = await state.getContractStorage(address1, slot0)
      expect(val.equals(value)).to.be.true
    })
  })

  describe('checkpoint & commit', async () => {
    it('Checkpoints the state', async () => {
      await state.checkpoint()
      expect(state._checkpointCount).to.eq(1)
    })

    it('Writes an account', async () => {
      const account = await state.getAccount(address0);
      account.nonce = Buffer.from('5')
      await state.putAccount(address0, account)
      await state.commit()
    })

    it('Retrieves the same account', async () => {
      const account = await state.getAccount(address0);
      expect(account.nonce.equals(Buffer.from('5'))).to.be.true
    })
  })

  describe('checkpoint & revert', async () => {
    it('Checkpoints the state', async () => {
      await state.checkpoint()
      expect(state._checkpointCount).to.eq(1)
    })

    it('Writes an account', async () => {
      await state.putContractCode(address2, code)
      await state.putContractStorage(address2, slot0, value)
      const account = await state.getAccount(address2)
      expect(account.stateRoot.toString('hex')).to.not.eq(DEFAULT_ROOT_256.slice(2))
      expect(account.isContract()).to.be.true
    })

    it('Reverts the state', async () => {
      await state.revert()
    })

    it('Reset the account', async () => {
      const account = await state.getAccount(address2)
      expect(account.isEmpty()).to.be.true
    })

    it('Does not have the storage value', async () => {
      const val = await state.getContractStorage(address2, slot0)
      expect(val).to.eq(undefined)
    })
  })

  describe('forceGetStateRoot', async () => {
    let root: Buffer
    let result: Buffer

    it('Checkpoints and updates the state', async () => {
      state = new StateManager({ tree: await SparseMerkleTree.create(undefined, undefined, 160) })
      root = await state.getStateRoot()
      await state.checkpoint()
      await state.putContractCode(address2, code)
    })

    it('Gets the state root', async () => {
      result = await state.forceGetStateRoot()
    })

    it('Does not match the old state root', async () => {
      expect(result.equals(root)).to.be.false
    })

    it('Reverts the changes and has the same root', async () => {
      await state.revert()
      const newRoot = await state.getStateRoot()
      expect(newRoot.equals(root)).to.be.true
    })

    it('Got the correct root', async () => {
      const _tree = await SparseMerkleTree.create(undefined, undefined, 160);
      const _state = new StateManager({ tree: _tree });
      await _state.putContractCode(address2, code)
      const newRoot = await _state.getStateRoot()
      expect(newRoot.equals(result)).to.be.true
    })
  })
});