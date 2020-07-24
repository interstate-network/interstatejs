const compile = require('../contracts/common/config/byte-counter/compile');
const path = require('path');
const fs = require('fs');
const { updatedAt } = require('../build/contracts/AccessErrorProver.json');
const { bytecode, deployedBytecode } = compile();

const byteCounterABI = [{
  name: 'countBytes',
  type: 'function',
  stateMutability: "pure",
  inputs: [
    {
      type: 'bytes',
      name: 'inData'
    }
  ],
  outputs: [
    {
      type: 'uint256',
      name: 'zeroBytes'
    },
    {
      type: 'uint256',
      name: 'nonZeroBytes'
    }
  ],
}];

const standard = {
  contractName: "ByteCounter",
  abi: byteCounterABI,
  bytecode,
  deployedBytecode,
  ast: {},
  legacyAST: {},
  compiler: {
    name: "huff",
    version: "0.6.10+commit.00c0fcaf.Emscripten.clang"
  },
  networks: {},
  updatedAt,
  "devdoc": {
    "methods": {}
  },
  "userdoc": {
    "methods": {}
  }
};

fs.writeFileSync(
  path.join(__dirname, '..', 'build', 'contracts', 'ByteCounter.json'),
  JSON.stringify(standard, null, 2)
);