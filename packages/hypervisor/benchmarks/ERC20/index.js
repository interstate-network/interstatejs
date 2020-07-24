const fs = require('fs')
const path = require('path')
const read = (_path) => fs.readFileSync(path.join(__dirname, _path), 'utf8')
const easySolc = require('easy-solc');
const Contract = require('web3-eth-contract');

async function compile() {
  const jsonPath = 'ERC20.json';
  let contract;
  if (fs.existsSync(jsonPath)) contract = JSON.parse(read(jsonPath));
  else {
    const sources = {
      'ERC20.sol': { content: read('ERC20.sol') },
      'Context.sol': { content: read('Context.sol') },
      'IERC20.sol': { content: read('IERC20.sol') },
      'SafeMath.sol': { content: read('SafeMath.sol') },
    }
    contract = await easySolc({ sources, name: 'ERC20' })
    fs.writeFileSync(path.join(__dirname, jsonPath), JSON.stringify(contract, null, 2));
  }
  return contract;
}

async function benchmark(debugVM) {
  const {abi, bytecode} = await compile()
  const tokenAddress = await debugVM.deploy(bytecode);
  const contract = new Contract(abi);
  const freeTokensData = contract.methods.freeTokens(55).encodeABI();
  const freeTokensComparison = await debugVM.compare({ to: tokenAddress, data: freeTokensData });
  const { virtualResult: virtualResult1 } = freeTokensComparison
  // console.log(virtualResult1)
  const benchmark1 = {
    ...freeTokensComparison,
    name: 'ERC20_MINT',
    data: freeTokensData
  };
  const transferData = contract.methods.transfer('0xf8724cAC821538BC0E6A4bADF0cd19d7Eac5D2Fd', 50).encodeABI();
  const transferComparison = await debugVM.compare({ to: tokenAddress, data: transferData });
  const { virtualResult: virtualResult2 } = transferComparison;
  // console.log(virtualResult2)
  const benchmark2 = {
    ...transferComparison,
    name: 'ERC20_TRANSFER',
    data: transferData
  };
  return [benchmark1, benchmark2];
}


module.exports = benchmark;