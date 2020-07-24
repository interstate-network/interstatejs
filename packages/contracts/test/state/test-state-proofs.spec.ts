import {
  randomHexBuffer,
  StateTree,
  StorageTree,
  toBuf,
  toHex
} from '@interstatejs/utils';

import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Web3 from 'web3';
import { compile, getWeb3, Deployer } from '../../test-utils';
import Account from '@interstatejs/account';
import { MessageWitness, SstoreWitness, SloadWitness } from '@interstatejs/vm';
import { ChildRelay, encodeRootNode } from '@interstatejs/utils';
import BN from 'bn.js';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('StateProofLib.sol', async () => {
  let tree: StateTree;
  let proofLib: any;
  let from: string, web3: Web3, accounts: string[];
  let _from: Buffer;

  before(async () => {
    const srcPath = path.join(__dirname, '..', '..', 'contracts');
    const names = ['mock/MockStateProofLib.sol'];
    const standard = compile(srcPath, names, srcPath, true);
    ({ web3, from, accounts } = await getWeb3());
    const deployer = new Deployer(web3, from, standard);
    proofLib = await deployer.deploy('mock/MockStateProofLib.sol', 'MockStateProofLib')
    _from = toBuf(from)
  });

  beforeEach(async () => {
    tree = await StateTree.create()
  })

  describe('proveAccountInState()', async () => {
    it('Proves a null account in an empty tree', async () => {
      const proof = await tree.getAccountProof(_from)
      const result = await proofLib.methods.proveAccountInState(
        tree.root,
        from,
        proof
      ).call()
      expect(result.nonce).to.eq('0')
      expect(result.balance).to.eq('0')
      expect(result.codeHash).to.eq('0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470')
      expect(result.stateRoot).to.eq('0xa9a4da177ac3f81cfe85a6767678aabb095aa306e72ab73f5cf0559c56d0a530')
    });
  
    it('Proves an existing account', async () => {
      const account = await tree.getAccount(_from)
      account.balance = Buffer.from('20', 'hex')
      await tree.putAccount(_from, account)
      const proof = await tree.getAccountProof(_from);
      const result = await proofLib.methods.proveAccountInState(
        tree.root,
        from,
        proof
      ).call()
      expect(result.codeHash).to.eq(toHex(account.codeHash))
      expect(result.stateRoot).to.eq(toHex(account.stateRoot))
      expect(result.nonce).to.eq('0')
      expect(result.balance).to.eq('32')
    });

    it('Fails for a proof with an invalid root', async () => {
      const proof = await tree.getAccountProof(_from);
      await tree.putAccount(from, new Account({ nonce: 5 }))
      expect(
        proofLib.methods.proveAccountInState(
          tree.root,
          from,
          proof
        ).send({ from, gas: 5e6 })
      ).to.eventually.be.rejectedWith(/Invalid state proof/g)
    });
  });

  describe('subtractBalanceAndIncrementNonce()', async () => {
    it('Should calculate the correct root', async () => {
      const account = await tree.getAccount(_from);
      account.balance = toBuf(500)
      await tree.putAccount(_from, account)
      const proof = await tree.getAccountProof(_from)
      const root = tree.root;
      const result = await proofLib.methods.subtractBalanceAndIncrementNonce(
        root,
        from,
        proof,
        100
      ).call()
      account.balance = toBuf(400)
      account.nonce = toBuf(1)
      await tree.putAccount(_from, account)
      const newRoot = tree.root;
      expect(result).to.eq(toHex(newRoot))
    });

    it('Should throw when the account has an insufficient balance', async () => {
      const account = await tree.getAccount(_from);
      account.balance = toBuf(100)
      await tree.putAccount(_from, account)
      const proof = await tree.getAccountProof(_from)
      const root = tree.root;
      expect(
        proofLib.methods.subtractBalanceAndIncrementNonce(
          root,
          from,
          proof,
          200
        ).call()
      ).to.eventually.be.rejectedWith(/Insufficient balance/g);
    });
  });

  describe('increaseBalance()', async () => {
    it('Should calculate the correct root', async () => {
      const account = await tree.getAccount(_from);
      account.balance = toBuf(500)
      await tree.putAccount(_from, account)
      const proof = await tree.getAccountProof(_from)
      const root = tree.root;
      const result = await proofLib.methods.increaseBalance(
        root,
        from,
        proof,
        100
      ).call()
      account.balance = toBuf(600)
      await tree.putAccount(_from, account)
      const newRoot = tree.root;
      expect(result.updatedRoot).to.eq(toHex(newRoot))
    });
  });

  describe('proveAndUpdateAccountStorage()', async () => {
    it('Should calculate the correct state root', async () => {
      const storageTree = await tree.getAccountStorageTrie(from);
      const account = await tree.getAccount(from);
      const oldValue = randomHexBuffer(32);
      const newValue = randomHexBuffer(32);
      const key = randomHexBuffer(32);
      await storageTree.put(key, oldValue);
      account.stateRoot = storageTree.root;
      await tree.putAccount(from, account);
      const root = tree.root;
      const accountProof = await tree.getAccountProof(from);
      const storageProof = await storageTree.prove(key);
      await storageTree.put(key, newValue);
      account.stateRoot = storageTree.root;
      await tree.putAccount(from, account);
      const result = await proofLib.methods.proveAndUpdateAccountStorage(
        root,
        from,
        key,
        newValue,
        accountProof,
        storageProof
      ).call()
      expect(result.oldValue).to.eq(toHex(oldValue))
      expect(result.newStateRoot).to.eq(toHex(tree.root))
    })
  });

  describe('setAccountCodeHash()', async () => {
    it('Should calculate the correct state root', async () => {
      const root = tree.root;
      const proof = await tree.getAccountProof(_from)
      const account = await tree.getAccount(_from);
      const codeHash = randomHexBuffer(32);
      account.codeHash = codeHash;
      await tree.putAccount(_from, account)
      const result = await proofLib.methods.setAccountCodeHash(
        root,
        from,
        proof,
        codeHash
      ).call()
      expect(result).to.eq(toHex(tree.root))
    });
  });

  describe('getLastState()', async () => {
    const getWitness = (): MessageWitness => new MessageWitness(
      new BN('ff'.repeat(32), 'hex'),
      new BN('bb'.repeat(32), 'hex'),
      false,
      new BN('ab'.repeat(20), 'hex'),
      new BN('ab'.repeat(20), 'hex'),
      new BN('ab'.repeat(20), 'hex'),
      new BN('ab'.repeat(20), 'hex'),
      new BN(99),
      new BN(99),
      new BN(99),
      new BN(99),
      new BN(99),
      new BN('ab'.repeat(32), 'hex'),
      Buffer.from('ab'.repeat(30), 'hex')
    );

    it('Gets the last state for a record following a state update', async () => {
      const witness = getWitness();
      witness.status = 0;
      witness.state_access_list.push(new SstoreWitness(
        new BN('ab'.repeat(32), 'hex'),
        new BN(50),
        new BN(100),
        new BN(99)
      ));
      witness.state_access_list.push(new SloadWitness(new BN(50), new BN(100)));
      const result = await proofLib.methods.getLastState(
        witness.encode(),
        1
      ).call()
      expect(result.slice(2)).to.eq(witness.state_access_list[0].stateRootLeave.toString('hex'))
    });

    it('Gets the last state for a record with no prior update records', async () => {
      const witness = getWitness();
      witness.status = 0;
      witness.state_access_list.push(new SloadWitness(new BN(50), new BN(100)));
      witness.state_access_list.push(new SstoreWitness(
        new BN('ab'.repeat(32), 'hex'),
        new BN(50),
        new BN(100),
        new BN(99)
      ));
      const result = await proofLib.methods.getLastState(
        witness.encode(),
        1
      ).call()
      expect(result.slice(2)).to.eq(witness.stateRootEnter.toString('hex'))
    })
  })

  describe('updateExitsRoot()', async () => {
    it('Produces the correct root node for the exits tree', async () => {
      const _tree = await StateTree.create();
      const root = _tree.root;
      const exitsAddress = Buffer.from('fb'.repeat(20), 'hex');
      const transactionData = randomHexBuffer(50);
      const relay = await ChildRelay.create(_tree, exitsAddress, 2);
      const proof = await relay.getUpdateProof();
      await relay.insert(transactionData);
      const result = await proofLib.methods.updateExitsTree(
        "0x",
        proof.transactionProof,
        transactionData
      ).call();
      expect(result).to.eq(toHex(encodeRootNode(relay.rootNode)));
    });

    it('Updates the relay storage', async () => {
      const _tree = await StateTree.create();
      const root = _tree.root;
      const exitsAddress = Buffer.from('fb'.repeat(20), 'hex');
      const transactionData = randomHexBuffer(50);
      const relay = await ChildRelay.create(_tree, exitsAddress, 2);
      const proof = await relay.getUpdateProof();
      await relay.insert(transactionData);
      const result = await proofLib.methods.updateExitsRoot(
        toHex(root),
        toHex(exitsAddress),
        2,
        proof.accountProof,
        proof.storageProof,
        proof.transactionProof,
        toHex(transactionData)
      ).call();

      expect(result).to.eq(toHex(_tree.root))
    })
  })

  describe('benchmark', async () => {
    it('proveAccountInState()', async () => {
      const proof = await tree.getAccountProof(_from)
      const receipt = await proofLib.methods.proveAccountInState(
        tree.root,
        from,
        proof
      ).send({ from, gas: 5e6 })
      console.log(`Gas Cost: ${receipt.gasUsed}`)
    });

    it('subtractBalanceAndIncrementNonce()', async () => {
      const account = await tree.getAccount(_from);
      account.balance = toBuf(500)
      await tree.putAccount(_from, account)
      const proof = await tree.getAccountProof(_from)
      const root = tree.root;
      const receipt = await proofLib.methods.subtractBalanceAndIncrementNonce(
        root,
        from,
        proof,
        100
      ).send({ from, gas: 5e6 })
      console.log(`Gas Cost: ${receipt.gasUsed}`)
    });

    it('increaseBalance()', async () => {
      const account = await tree.getAccount(_from);
      account.balance = toBuf(500)
      await tree.putAccount(_from, account)
      const proof = await tree.getAccountProof(_from)
      const root = tree.root;
      const receipt = await proofLib.methods.increaseBalance(
        root,
        from,
        proof,
        100
      ).send({ from, gas: 5e6 })
      console.log(`Gas Cost: ${receipt.gasUsed}`)
    });

    it('proveAndUpdateAccountStorage()', async () => {
      const storageTree = await tree.getAccountStorageTrie(from);
      const account = await tree.getAccount(from);
      const oldValue = randomHexBuffer(32);
      const newValue = randomHexBuffer(32);
      const key = randomHexBuffer(32);
      await storageTree.put(key, oldValue);
      account.stateRoot = storageTree.root;
      await tree.putAccount(from, account);
      const root = tree.root;
      const accountProof = await tree.getAccountProof(from);
      const storageProof = await storageTree.prove(key);
      await storageTree.put(key, newValue);
      account.stateRoot = storageTree.root;
      await tree.putAccount(from, account);
      const receipt = await proofLib.methods.proveAndUpdateAccountStorage(
        root,
        from,
        key,
        newValue,
        accountProof,
        storageProof
      ).send({ from, gas: 5e6 })
      console.log(`Gas Cost: ${receipt.gasUsed}`)
    });

    it('setAccountCodeHash()', async () => {
      const root = tree.root;
      const proof = await tree.getAccountProof(_from)
      const account = await tree.getAccount(_from);
      const codeHash = randomHexBuffer(32);
      account.codeHash = codeHash;
      await tree.putAccount(_from, account)
      const receipt = await proofLib.methods.setAccountCodeHash(
        root,
        from,
        proof,
        codeHash
      ).send({ from, gas: 5e6 })
      console.log(`Gas Cost: ${receipt.gasUsed}`)
    });
  });
});
