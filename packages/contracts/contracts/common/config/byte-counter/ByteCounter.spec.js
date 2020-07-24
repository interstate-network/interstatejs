const { expect } = require('chai');
const Web3 = require('web3');
const provider = require('ganache-core').provider();
const web3 = new Web3(provider);
const { randomHexBuffer, toBuf } = require('@interstatejs/utils');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

function compileHuff() {
  const compile = require('./compile');
  return compile().bytecode;
}

function compileSol() {
  const code = fs.readFileSync(path.join(__dirname, 'ByteCounter.sol'), 'utf8');
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
  return bytecode;
}

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
}]



// const countBytes = (str) => byteCounter.methods.countBytes(str)
//   .call({ from, gas: 5e6 });
// const benchmark = (str) => byteCounter.methods.countBytes(str)
//   .send({ from, gas: 5e6 }).then((receipt) => receipt.gasUsed);

let byteCounter, byteCounterSol, from;



describe("ByteCounter test", () => {
  before(async () => {
    await web3.eth.getAccounts().then(([addr]) => from = addr);
    const { contractAddress } = await web3.eth.sendTransaction({
      from, data: compileHuff(), gas: 6e6
    });
    byteCounter = new web3.eth.Contract(byteCounterABI, contractAddress);
    const { contractAddress: solContractAddress } = await web3.eth.sendTransaction({
      from, data: compileSol(), gas: 6e6
    });
    console.log(solContractAddress)
    byteCounterSol = new web3.eth.Contract(byteCounterABI, solContractAddress);
  });

  async function test(contract, size) {
    const data = randomHexBuffer(size);
    let realZeroBytes = 0, realNonZeroBytes = 0;
    for (let i = 0; i < data.length; i++) data[i] == 0 ? realZeroBytes++ : realNonZeroBytes++;
    const { zeroBytes, nonZeroBytes } = await contract.methods.countBytes(data).call({ from, gas: 5e6 });
    expect(+zeroBytes).to.eq(realZeroBytes);
    expect(+nonZeroBytes).to.eq(realNonZeroBytes);
  }
  
  async function benchmark(contract, size) {
    const data = randomHexBuffer(size);
    const buf = toBuf(contract.methods.countBytes(data).encodeABI());
    let baseCost = 21000;
    for (let i = 0; i < size; i++) baseCost += (buf[i] == 0 ? 4 : 16);
    const gasUsed = await contract.methods.countBytes(data)
      .send({ from, gas: 5e6 }).then((receipt) => receipt.gasUsed);
    const executionCost = gasUsed - baseCost;
    const gasPerByte = executionCost / size;
    console.log(`\tBenchmark: BYTES ${size} -- EXECUTION COST: ${executionCost} | PER BYTE ${gasPerByte}`);
    return executionCost;
  }

  // it('Should return (2, 5) for "0xaabbccddee0000"', async () => {
  //   let res = await countBytes('0xaabbccddee0000');
  //   console.log(res)
  //   let { zeroBytes, nonZeroBytes } = res;
  //   expect(zeroBytes).to.eq('2')
  //   expect(nonZeroBytes).to.eq('5')
  // });

  it('ByteCounter.huff should always return the correct byte counts', async () => {
    for (let i = 1; i < 21; i++) await test(byteCounter, i*32);
  });

  it('ByteCounter.sol should always return the correct byte counts', async () => {
    for (let i = 1; i < 21; i++) await test(byteCounterSol, i*32);
  });

  // describe('Test ByteCounter.sol', (done) => {
  //   for (let i = 1; i < 21; i++) {
  //     it('Should return the correct byte counts', async () => {
  //       await test(byteCounterSol, i*32);
  //     });
  //   }
  //   done()
  // });

  it('ByteCounter.huff should always be cheaper than ByteCounter.sol', async () => {
    for (let i = 1; i < 21; i+=2) {
      console.log('HUFF BYTECOUNTER');
      const cost = await benchmark(byteCounter, i*32);
      console.log('SOL BYTECOUNTER');
      const solCost = await benchmark(byteCounterSol, i*32);
      expect(cost).to.be.lessThan(solCost);
    }
  });

  /* describe('Benchmark', async () => {
    for (let i = 1; i < 21; i++) {
      it('Should always be cheaper than the sol version', async () => {
        console.log('HUFF BYTECOUNTER');
        const cost = await benchmark(byteCounter, i*32);
        console.log('SOL BYTECOUNTER');
        const solCost = await benchmark(byteCounterSol, i*32);
        expect(cost).to.be.lessThan(solCost);
      });
    }
  }); */
})