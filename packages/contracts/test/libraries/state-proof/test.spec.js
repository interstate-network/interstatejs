const Account = require('ethereumjs-account').default;
const Web3 = require('web3');
const ganache = require('ganache-cli');
const Trie = require('merkle-patricia-tree');
const { bufferToHex } = require('ethereumjs-util');
const lib = require('../merkle-patricia-tree/lib');
const standard = require('./standard.json');
const crypto = require('crypto');
const rlp = require('rlp')
const { expect } = require('chai')

function randomHexString(size) {
  const bytes = crypto.randomBytes(size);
  return '0x' + bytes.toString('hex');
}

const { abi, evm: { bytecode: { object: bytecode } } } = standard["Test.sol"].Test;

describe("StateProofLib.sol", () => {
  let web3, contract, provider, from;

  before(async () => {
    provider = ganache.provider();
    web3 = new Web3(provider);
    contract = new web3.eth.Contract(abi);
    [from] = await web3.eth.getAccounts();
    contract = await contract.deploy({
      data: bytecode
    }).send({ from, gas: 5e6 });
    await new Promise(resolve => setTimeout(resolve, 500))
  });

  describe("proveAccountInState", () => {
    let trie, account, key, encoded, proof, root;
    before(async () => {
      trie = new Trie();
      account = new Account({
        nonce: 2,
        balance: 500,
        stateRoot: Buffer.alloc(32, 5, 'hex')
      });
      encoded = account.serialize();
      key = randomHexString(32);
      await lib.put(trie, key, bufferToHex(encoded));
      /* Put some random elements in the trie */
      for (let i = 0; i < 100; i++) {
        const _key = randomHexString(32);
        const val = randomHexString(30);
        await lib.put(trie, _key, val)
      }
      root = bufferToHex(trie.root);
      proof = await lib.prove(trie, key);
    })

    it('Should prove an account exists in a patricia merkle trie', async () => {
      const result = await contract.methods.proveAccountInState(root, key.slice(0, 42), proof).call();
      expect(result.inState).to.eq(true);
    });
  
    it('Should fail to prove an account that does not exist in the trie', async () => {
      const randKey = randomHexString(20)
      const result = await contract.methods.proveAccountInState(root, randKey, proof).call();
      expect(result.inState).to.eq(false);
    });
  })

  describe("updateAccountBalance", () => {
    let trie, account, key, encoded, proof, root;
    before(async () => {
      trie = new Trie();
      account = new Account({
        nonce: 2,
        balance: 500,
        stateRoot: Buffer.alloc(32, 5, 'hex')
      });
      encoded = account.serialize();
      key = randomHexString(20);
      await lib.put(trie, key, bufferToHex(encoded));
      /* Put some random elements in the trie */
      for (let i = 0; i < 100; i++) {
        const _key = randomHexString(32);
        const val = randomHexString(30);
        await lib.put(trie, _key, val)
      }
      root = bufferToHex(trie.root);
      proof = await lib.prove(trie, key);
    });

    it('Should increase an account balance and calculate the new root', async () => {
      const result = await contract.methods.updateAccountBalance(root, key.slice(0, 42), proof, 250, true).call();
      expect(result.isEmpty).to.eq(false);
      expect(result.balanceOk).to.eq(true);
      expect(result.account.balance).to.eq('750');
      const newAccount = new Account({
        nonce: 2,
        balance: 750,
        stateRoot: Buffer.alloc(32, 5, 'hex')
      });
      await lib.put(trie, key, bufferToHex(newAccount.serialize()));
      (await lib.prove(trie, key));
      const newRoot = bufferToHex(trie.root);
      expect(result.newStateRoot).to.eq(newRoot);
    });

    it('Should decrease an account balance and calculate the new root', async () => {
      const result = await contract.methods.updateAccountBalance(root, key.slice(0, 42), proof, 250, false).call();
      expect(result.isEmpty).to.eq(false);
      expect(result.balanceOk).to.eq(true);
      expect(result.account.balance).to.eq('250');
      const newAccount = new Account({
        nonce: 2,
        balance: 250,
        stateRoot: Buffer.alloc(32, 5, 'hex')
      });
      await lib.put(trie, key, bufferToHex(newAccount.serialize()));
      (await lib.prove(trie, key));
      const newRoot = bufferToHex(trie.root);
      expect(result.newStateRoot).to.eq(newRoot);
    });

    it('Should recognize if an account has an insufficient balance', async () => {
      const result = await contract.methods.updateAccountBalance(root, key.slice(0, 42), proof, 600, false).call();
      expect(result.isEmpty).to.eq(false);
      expect(result.balanceOk).to.eq(false);
    });
  });

  describe("proveStorageValue", () => {
    let trie, account, key, val, encoded, proof, root;
    before(async () => {
      trie = new Trie();
      key = randomHexString(32);
      val = 150;
      await lib.put(trie, key, bufferToHex(rlp.encode(val)));
      /* Put some random elements in the trie */
      for (let i = 0; i < 100; i++) {
        const _key = randomHexString(32);
        const val = randomHexString(30);
        await lib.put(trie, _key, val)
      }
      root = bufferToHex(trie.root);
      proof = await lib.prove(trie, key);
      account = {
        nonce: 5,
        balance: 250,
        storageRoot: root,
        codeHash: randomHexString(32)
      }
    });

    it('Should prove a value at a storage slot', async () => {
      const valHex = ['0x', '00'.repeat(31), '96'].join('')
      const result = await contract.methods.proveStorageValue(account, key, valHex, proof).call();
      expect(result).to.eq(true);
    })
  })

  describe('updateStorageRoot', () => {
    let trie, account, key, val, encoded, proof, root;
    before(async () => {
      trie = new Trie();
      key = randomHexString(32);
      val = 150;
      await lib.put(trie, key, bufferToHex(rlp.encode(val)));
      /* Put some random elements in the trie */
      for (let i = 0; i < 100; i++) {
        const _key = randomHexString(32);
        const val = randomHexString(30);
        await lib.put(trie, _key, val)
      }
      root = bufferToHex(trie.root);
      proof = await lib.prove(trie, key);
      account = {
        nonce: 5,
        balance: 250,
        storageRoot: root,
        codeHash: randomHexString(32)
      }
    });

    it('Should update a value at a storage slot', async () => {
      const valHex = ['0x', '00'.repeat(31), '96'].join('');
      const newValHex = ['0x', '00'.repeat(31), '95'].join('');
      const result = await contract.methods.updateStorageRoot(account, key, newValHex, proof).call();
      expect(result.oldValue).to.eq(valHex);
      expect(result.inStorage).to.eq(true);
      await lib.put(trie, key, bufferToHex(rlp.encode(149)));
      await lib.prove(trie, key);
      const newRoot = bufferToHex(trie.root);
      expect(result.newRoot).to.eq(newRoot);
    })
  })
});