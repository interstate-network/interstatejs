'use strict';

const { expect } = require('chai');
const path = require('path');
const abi = require('web3-eth-abi');
const { ethers } = require('ethers');
const provider = new ethers.providers.Web3Provider(require('ganache-cli').provider());
const rlp = require('rlp');
const { addHexPrefix, bufferToHex, stripHexPrefix } = require('ethereumjs-util');
const call = (method, params = []) => provider.send(method, params);

const walkerOutputTestInputType = {
  components: [{
    name: 'path',
    type: 'uint256[]',
    internalType: 'uint256[]'
  }, {
    name: 'rlpEncoded',
    type: 'bytes',
    internalType: 'bytes'
  }, {
    name: 'expected',
    type: 'bytes',
    internalType: 'bytes'
  }],
  internalType: 'struct RLPTest.WalkerOutputTestInput',
  type: 'tuple'
};

const walkerReadWordTestInputType = {
  components: [{
    name: 'path',
    type: 'uint256[]',
    internalType: 'uint256[]'
  }, {
    name: 'rlpEncoded',
    type: 'bytes',
    internalType: 'bytes'
  }, {
    name: 'expected',
    type: 'uint256',
    internalType: 'uint256'
  }],
  internalType: 'struct RLPTest.WalkerReadWordTestInput',
  type: 'tuple'
};

const encodeTestInputType = {
  components: [{
    name: 'data',
    type: 'bytes',
    internalType: 'bytes'
  }, {
    name: 'expected',
    type: 'bytes',
    internalType: 'bytes'
  }],
  internalType: 'struct RLPTest.WalkerEncodeTestInput',
  type: 'tuple'
};

const encodeListTestInputType = {
  components: [{
    name: 'data',
    type: 'bytes[]',
    internalType: 'bytes[]'
  }, {
    name: 'expected',
    type: 'bytes',
    internalType: 'bytes'
  }],
  internalType: 'struct RLPTest.WalkerEncodeTestInput',
  type: 'tuple'
};

const TestType = {
  WALKER_OUTPUT: 0,
  WALKER_READ_WORD: 1,
  ENCODING_ITEM: 2,
  ENCODING_LIST: 3
};

let testBinary;

const encodeDynamic = (abiType, o) => abi.encodeParameters([ abiType ], [ o ]);

const encodeTest = (testType, dynamicBytes) => testBinary + stripHexPrefix(abi.encodeParameters(['uint8', 'bytes'], [ testType, dynamicBytes ]));

const { SolcManager } = require('../../utils/solc-manager');

const solcManager = new SolcManager({
  dirname: __dirname,
  buildDir: path.join(__dirname, 'build'),
  jsonDir: path.join(__dirname)
});

describe('RLP libraries', () => {
  before(async () => {
    await solcManager.compile();
    testBinary = await solcManager.loadBinary('RLPTest');
  });
  it('should walk an rlp structure', async () => {
    const rlpEncoded = bufferToHex(rlp.encode(['0x50', '0x6060', [ '0x70' ] ]));
    const path = [2, 0];
    await call('eth_call', [{
      data: encodeTest(TestType.WALKER_OUTPUT, encodeDynamic(walkerOutputTestInputType, {
        rlpEncoded,
        expected: '0x70',
        path
      }))
    }]);
  });
  it('should read a word', async () => {
    const rlpEncoded = bufferToHex(rlp.encode(['0x90', '0xa06080', [ '0x7070' ] ]));
    const path = [2, 0];
    await call('eth_call', [{
      data: encodeTest(TestType.WALKER_READ_WORD, encodeDynamic(walkerReadWordTestInputType, {
        rlpEncoded,
        expected: '0x7070',
        path
      }))
    }]);
  });
  it('should encode a value', async () => {
    const data = '0x500010';
    const expected = addHexPrefix(bufferToHex(rlp.encode([ data ])).substr(4));
    await call('eth_call', [{
      data: encodeTest(TestType.ENCODING_ITEM, encodeDynamic(encodeTestInputType, {
        data,
        expected
      }))
    }]);
  });
  it('should encode a list of values', async () => {
    const data = [ '0x500010', '0x60' ];
    const expected = bufferToHex(rlp.encode(data));
    await call('eth_call', [{
      data: encodeTest(TestType.ENCODING_LIST, encodeDynamic(encodeListTestInputType, {
        data,
        expected
      }))
    }]);
  });
});
