'use strict';

const rpcCall = require('kool-makerpccall');
const ganache = require('ganache-cli');
const path = require('path');
const abi = require('web3-eth-abi');
const { expect } = require('chai');

const provider = ganache.provider({
  hardfork: 'istanbul'
});
const Trie = require('merkle-patricia-tree');

const rlp = require('rlp');
const lib = require('./lib');
const chalk = require('chalk');
const { addHexPrefix, bufferToHex, stripHexPrefix } = require('ethereumjs-util');

const fs = require('fs');

const call = (method, params = []) => rpcCall(provider, method, params);
//const bin = '0x' + fs.readFileSync(path.join(__dirname, 'build', '___test_Test_sol_Test.bin'), 'utf8');
const bin = '0x' + fs.readFileSync(path.join(__dirname, 'build', '___test_Test_sol_Test.bin'), 'utf8');

const emitGasUsage = (v) => console.log(chalk.bold(chalk.gray('\tused gas -- ')) + chalk.bold(chalk.yellow(String(Number(v)))));

const updateRoot = async (root, key, proof, val) => {
  const [ from ] = await call('eth_accounts');
  const { gasUsed } = await call('eth_getTransactionReceipt', [ await call('eth_sendTransaction', [{
    from,
    gasPrice: '0x1',
    gas: '0x' + (6e6).toString(16),
    data: bin + stripHexPrefix(abi.encodeParameters(['bytes32', 'bytes', 'bytes', 'bytes'], [ root, '0x00', '0x', '0x00' ]))
  }]) ]);
  const { gasUsed: gasUsedReal } = await call('eth_getTransactionReceipt', [ await call('eth_sendTransaction', [{
    from,
    gasPrice: '0x1',
    gas: '0x' + (6e6).toString(16),
    data: bin + stripHexPrefix(abi.encodeParameters(['bytes32', 'bytes', 'bytes', 'bytes'], [ root, key, proof, val ]))
  }]) ]);
  const newRoot = await call('eth_call', [{
    data: bin + stripHexPrefix(abi.encodeParameters(['bytes32', 'bytes', 'bytes', 'bytes'], [ root, key, proof, val ]))
  }]);
  const result = {
    newRoot,
    gasUsed: Number(gasUsedReal) - Number(gasUsed)
  };
  emitGasUsage(result.gasUsed);
  return result;
};

describe('mpt implementation', () => {
  it('handles trivial case of replacement', async () => {
    const trie = new Trie();
    let key = '0x' + Array(64).fill('1').join('');
    let val = Buffer.from([0x66, 0x77]);
    await lib.put(trie, key, bufferToHex(val));
    val = bufferToHex(Buffer.from(Array(32).fill('0').map(() => ([0x66, 0x77])).reduce((r, v) => r.concat(v), [])));
    key = '0x' + Array(62).fill('1').join('') + '22';
    await lib.put(trie, key, val);
    let root = bufferToHex(trie.root);
    let proof = await lib.prove(trie, key);
    val = bufferToHex(Buffer.from(Array(32).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), [])));
    const {
      gasUsed,
      newRoot
    } = await updateRoot(root, key, proof, val);
    await lib.put(trie, key, val);
    proof = (await lib.prove(trie, key));
    root = bufferToHex(trie.root);
    expect(root).to.eql(newRoot);
  });
  it('handles case of replacement requiring expansion', async () => {
    const trie = new Trie();
    let key = '0x' + Array(64).fill('1').join('');
    let val = Buffer.from([0x66, 0x77]);
    await lib.put(trie, key, bufferToHex(val));
    val = bufferToHex(Buffer.from(Array(32).fill('0').map(() => ([0x66, 0x77])).reduce((r, v) => r.concat(v), [])));
    key = '0x' + Array(62).fill('1').join('') + '22';
    await lib.put(trie, key, val);
    let root = bufferToHex(trie.root);
    let proof = await lib.prove(trie, key);
    val = bufferToHex(Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), [])));
    const {
      gasUsed,
      newRoot
    } = await updateRoot(root, key, proof, val);
    await lib.put(trie, key, val);
    proof = (await lib.prove(trie, key));
    root = bufferToHex(trie.root);
    expect(root).to.eql(newRoot);
  });
  it('handles case of replacement replacing embedded with non-embedded', async () => {
    const trie = new Trie();
    let key = '0x' + Array(64).fill('1').join('');
    let val = Buffer.from([0x66, 0x77]);
    await lib.put(trie, key, bufferToHex(val));
    val = bufferToHex(Buffer.from(Array(2).fill('0').map(() => ([0x66, 0x77])).reduce((r, v) => r.concat(v), [])));
    key = '0x' + Array(62).fill('1').join('') + '22';
    await lib.put(trie, key, val);
    let root = bufferToHex(trie.root);
    let proof = await lib.prove(trie, key);
    val = bufferToHex(Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), [])));
    const {
      gasUsed,
      newRoot
    } = await updateRoot(root, key, proof, val);
    await lib.put(trie, key, val);
    proof = (await lib.prove(trie, key));
    root = bufferToHex(trie.root);
    expect(root).to.eql(newRoot);
  });
  it('handles the case of replacement of non-embedded with embedded', async () => {
    const trie = new Trie();
    let key = '0x' + Array(64).fill('1').join('');
    let val = Buffer.from([0x66, 0x77]);
    await lib.put(trie, key, bufferToHex(val));
    val = bufferToHex(Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), [])));
    key = '0x' + Array(62).fill('1').join('') + '22';
    await lib.put(trie, key, val);
    let root = bufferToHex(trie.root);
    let proof = await lib.prove(trie, key);
    val = bufferToHex(Buffer.from(Array(2).fill('0').map(() => ([0x66, 0x77])).reduce((r, v) => r.concat(v), [])));
    const {
      newRoot,
      gasUsed
    } = await updateRoot(root, key, proof, val);
    await lib.put(trie, key, val);
    proof = (await lib.prove(trie, key));
    root = bufferToHex(trie.root);
    expect(root).to.eql(newRoot);
  });
  it('handles leaf removal in trivial case', async () => {
    const trie = new Trie();
    let key = '0x' + Array(64).fill('1').join('');
    let val = Buffer.from([0x66, 0x77]);
    await lib.put(trie, key, bufferToHex(val));
    val = bufferToHex(Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), [])));
    key = '0x' + Array(62).fill('1').join('') + '22';
    await lib.put(trie, key, val);
    key = '0x' + Array(62).fill('1').join('') + '33';
    await lib.put(trie, key, val);
    let root = bufferToHex(trie.root);
    let proof = await lib.prove(trie, key);
    const {
      newRoot,
      gasUsed
    } = await updateRoot(root, key, proof, '0x');
    await new Promise((resolve, reject) => trie.del(key, (err) => err ? reject(err) : resolve()));
    root = bufferToHex(trie.root);
    expect(root).to.eql(newRoot);
  });
  it('handles leaf removal in divergent case', async () => {
    const trie = new Trie();
    let key = '0x' + Array(64).fill('1').join('');
    let val = Buffer.from([0x66, 0x77]);
    val = (Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), [])));
    await lib.put(trie, key, val);
    key = '0x' + Array(30).fill('1').join('') + '2' + Array(33).fill('1').join('');
    await lib.put(trie, key, val);
    let root = bufferToHex(trie.root);
    let proof = await lib.prove(trie, key);
    const {
      newRoot,
      gasUsed
    } = await updateRoot(root, key, proof, '0x');
    await new Promise((resolve, reject) => trie.del(key, (err) => err ? reject(err) : resolve()));
    root = bufferToHex(trie.root);
    expect(root).to.eql(newRoot);
  });
  it('handles leaf insertion in trivial case', async () => {
    const trie = new Trie();
    let key = '0x' + Array(64).fill('1').join('');
    let val = Buffer.from([0x66, 0x77]);
    await lib.put(trie, key, bufferToHex(val));
    val = bufferToHex(Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), [])));
    key = '0x' + Array(62).fill('1').join('') + '22';
    await lib.put(trie, key, val);
    key = '0x' + Array(62).fill('1').join('') + '33';
    let root = bufferToHex(trie.root);
    let proof = await lib.prove(trie, key);
    const {
      newRoot,
      gasUsed
    } = await updateRoot(root, key, proof, val);
    await lib.put(trie, key, val);
    root = bufferToHex(trie.root);
    expect(root).to.eql(newRoot);
  });
  it('handles leaf insertion via branch creation into extension', async () => {
    const trie = new Trie();
    let key = '0x' + Array(64).fill('1').join('');
    let val = Buffer.from([0x66, 0x77]);
    await lib.put(trie, key, bufferToHex(val));
    val = bufferToHex(Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), [])));
    key = '0x' + Array(62).fill('1').join('') + '33';
    await lib.put(trie, key, val);
    let root = bufferToHex(trie.root);
    key = '0x' + Array(29).fill('1').join('') + '221' + Array(32).fill('1').join('');
    let proof = await lib.prove(trie, key);
    const {
      newRoot,
      gasUsed
    } = await updateRoot(root, key, proof, val);
    await lib.put(trie, key, val);
    root = bufferToHex(trie.root);
    expect(root).to.eql(newRoot);
  });
  it('handles trie removal for filled trie', async () => {
    const trie = new Trie();
    const key = Array(64).fill('1');
    let val = Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), []));
    let i = 0;
    let lastKey;
    for (const k of key) {
      for (let i = 0; i < 16; i++) {
        await lib.put(trie, (lastKey = '0x' + key.slice(0, i).concat(i.toString(16)).concat(key.slice(i + 1)).join('')), val);
      }
      i++;
    }
    let proof = await lib.prove(trie, lastKey);
    const {
      newRoot,
      gasUsed
    } = await updateRoot(bufferToHex(trie.root), lastKey, proof, '0x');
  });
  it('handles filled trie in place update', async () => {
    const trie = new Trie();
    const key = Array(64).fill('1');
    let val = Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), []));
    let i = 0;
    let lastKey;
    for (const k of key) {
      for (let i = 0; i < 16; i++) {
        await lib.put(trie, (lastKey = '0x' + key.slice(0, i).concat(i.toString(16)).concat(key.slice(i + 1)).join('')), val);
      }
      i++;
    }
    let proof = await lib.prove(trie, lastKey);
    val = Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x99])).reduce((r, v) => r.concat(v), []));
    const {
      newRoot,
      gasUsed
    } = await updateRoot(bufferToHex(trie.root), lastKey, proof, bufferToHex(val));
  });
  it('handles worst case trie removal', async () => {
    const trie = new Trie();
    const key = Array(64).fill('1');
    let val = Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), []));
    let i = 0;
    let lastKey;
    for (const k of key) {
      await lib.put(trie, (lastKey = '0x' + key.slice(0, i).concat('2').concat(key.slice(i + 1)).join('')), val);
      i++;
    }
    let proof = await lib.prove(trie, lastKey);
    val = Buffer.from(Array(64).fill('0').map(() => ([0x66, 0x88])).reduce((r, v) => r.concat(v), []));
    const {
      newRoot,
      gasUsed
    } = await updateRoot(bufferToHex(trie.root), lastKey, proof, '0x');
  });
});   
