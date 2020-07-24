const child_process = require('child_process');
const fs = require('fs')
const path = require('path')
const read = (_path) => fs.readFileSync(path.join(__dirname, _path), 'utf8')
const easySolc = require('easy-solc');
const Contract = require('web3-eth-contract');

const exec = (command) => child_process.execSync(command, { cwd: __dirname }).toString();

const paramString = exec('snarkjs generatecall');
const {params} = JSON.parse(`{ "params": [${paramString}] }`)

function setup() {
  exec('circom circuit.circom -o circuit.json');
  exec('snarkjs setup');
  exec('snarkjs calculatewitness');
  exec('snarkjs proof');
  exec('snarkjs generateverifier');
  exec(`mv verifier.sol Verifier.sol`)
  exec(`sed -i 's:0\.5\.0\;:0\.6\.0\;:' Verifier.sol`);
  exec(`sed -i 's:@return::' Verifier.sol`)
  exec(`sed -i 's/gas,/gas(),/g' Verifier.sol`);
}

async function compile() {
  let jsonPath = path.join(__dirname, 'verifier.json');
  if (fs.existsSync(jsonPath)) return require('./verifier')
  const result = await easySolc({
    sources: {
      'Verifier.sol': { content: read('Verifier.sol') },
    },
    name: 'Verifier'
  })
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2))
  return result;
}

async function benchmark(debugVM) {
  const { bytecode, abi } = await compile();
  const contract = new Contract(abi);
  const verifier = await debugVM.deploy(bytecode);
  const verifyData = contract.methods.verifyProof(...params).encodeABI();
  const snarkComparison = await debugVM.compare({ to: verifier, data: verifyData }, false, true);
  const { nativeResult, virtualResult, txo, txo2 } = snarkComparison;
  const { steps } = virtualResult;
  debugVM.writeLogs(nativeResult.steps, virtualResult.steps, txo, txo2)
  // console.log(steps.slice(steps.length - 20))
  // console.log(nativeResult.success)
  // console.log(virtualResult.success)
  // console.log(`addr`, verifier)
  // require('fs').writeFileSync('./TXO.json', JSON.stringify(txo, null, 2))
  return {
    ...snarkComparison,
    name: 'SNARKJS_VERIFY',
    data: verifyData,
  };
}

module.exports = benchmark;