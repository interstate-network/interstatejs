const Account = require('ethereumjs-account').default;
const Web3 = require('web3');
const ganache = require('ganache-cli');
const { bufferToHex } = require('ethereumjs-util');
const lib = require('../lib');
const standard = require('./standard.json');
const crypto = require('crypto');
const { expect } = require('chai')

function randomHexString(size) {
  const bytes = crypto.randomBytes(size);
  return '0x' + bytes.toString('hex');
}

const { abi, evm: { bytecode: { object: bytecode } } } = standard["Test.sol"].Test;

describe("RLPAccountLib.sol", () => {
  let web3, contract, provider, from;

  before(async () => {
    provider = ganache.provider();
    web3 = new Web3(provider);
    contract = new web3.eth.Contract(abi);
    [from] = await web3.eth.getAccounts();
    contract = await contract.deploy({
      data: bytecode
    }).send({ from, gas: 5e6 });
  });

  it('encodes an account', async () => {
    const accountOptions = {
      nonce: 2,
      balance: 500,
      storageRoot: '0x' + '05'.repeat(32),
      codeHash: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
    }
    const account = new Account({
      nonce: 2,
      balance: 500,
      stateRoot: '0x' + '05'.repeat(32),
      codeHash: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
    });
    const result = await contract.methods.encodeAccount(accountOptions).call();
    expect(result).to.eql(bufferToHex(account.serialize()))
  })
});