const fs = require('fs');
const { expect } = require('chai');
const Web3 = require('web3');
const provider = require('ganache-core').provider();
const web3 = new Web3(provider);
const { randomHexString } = require('@interstatejs/utils');
const solc = require('solc');

const code = fs.readFileSync('./ByteCounter.sol', 'utf8');

const res = solc.compile(JSON.stringify({
  language: 'Solidity',
  sources: {
    'ByteCounter.sol': {
      content: code
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      "*": {
        "*": [
          "metadata", "evm.bytecode" // Enable the metadata and bytecode outputs of every single contract.
          , "evm.bytecode.sourceMap" // Enable the source map output of every single contract.
        ]
      }
    }
  },
}));
const { contracts } = JSON.parse(res);
const { bytecode: { object: bytecode } } = contracts['ByteCounter.sol'].ByteCounter.evm;
const byteCounterABI = [{
  name: 'countBytes',
  type: 'function',
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
}]

let byteCounter, from;

before(async () => {
  await web3.eth.getAccounts().then(([addr]) => from = addr);
  const { contractAddress } = await web3.eth.sendTransaction({ from, data: bytecode, gas: 6e6 });
  byteCounter = new web3.eth.Contract(byteCounterABI, contractAddress);
});

const countBytes = (str) => byteCounter.methods.countBytes(str)
  .call({ from, gas: 5e6 });
const benchmark = (str) => byteCounter.methods.countBytes(str)
  .send({ from, gas: 5e6 }).then((receipt) => receipt.gasUsed);

describe("ByteCounter test", async () => {
  it('Should return (2, 5) for "0xaabbccddee0000"', async () => {
    let res = await countBytes('0xaabbccddee0000');
    console.log(res)
    console.log(byteCounter.methods.countBytes('0xaabbccddee0000').encodeABI())
    let { zeroBytes, nonZeroBytes } = res;
    expect(zeroBytes).to.eq('2')
    expect(nonZeroBytes).to.eq('5')
  });

  it('Should benchmark the cost', async () => {
    for (let i = 1; i < 20; i++) {
      const data = randomHexString(i * 32);
      const { zeroBytes, nonZeroBytes } = await countBytes(data);
      const baseFee = 21000 + (zeroBytes * 4) + (nonZeroBytes * 16);
      const gasUsed = await benchmark(data);
      const executionCost = gasUsed - baseFee;
      const gasPerByte = executionCost / (i*32);
      console.log(`Benchmark: BYTES ${i * 32} -- EXECUTION COST: ${executionCost} | PER BYTE ${gasPerByte}`)
    }
  });
})