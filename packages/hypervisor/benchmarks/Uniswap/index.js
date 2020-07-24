const factoryBytecode = require('./factory.json');
const exchangeBytecode = require('./exchange.json');
const erc20Bytecode = require('./erc20.json');
const factoryABI = require('./abi/factory-abi')
const exchangeABI = require('./abi/exchange-abi')
const erc20ABI = require('./abi/erc20-abi')
const Contract = require('web3-eth-contract');
const Transaction = require('ethereumjs-tx');

let addr1 = `0x3aeffa56e70d045e88dabc4d07914b812390c145`;
let addr2 = `0xbe862ad9abfe6f22bcb087716c7d89a26051f74c`;
let key1 = Buffer.from('e331b6d69882b4cb3ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex');
let key2 = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex');

let erc20Address, factoryAddress, exchangeAddress;

let erc20 = new Contract(erc20ABI);
let factory = new Contract(factoryABI);
let exchange = new Contract(exchangeABI);

async function deployContracts(vm) {
  erc20Address = await vm.deploy(erc20Bytecode);
  factoryAddress = await vm.deploy(factoryBytecode);
  exchangeAddress = await vm.deploy(exchangeBytecode)
  const initData = factory.methods.initializeFactory(exchangeAddress).encodeABI();
  await vm.send({ to: factoryAddress, data: initData });
  
  const deployData = factory.methods.createExchange(erc20Address).encodeABI();
  const { returnValue } = await vm.send({ to: factoryAddress, data: deployData });
  console.log(returnValue.toString('hex').slice(24))
  exchangeAddress = `0x${returnValue.toString('hex').slice(24)}`;
}

async function getFreeTokens(vm) {
  const freeTokensData = erc20.methods.freeTokens(0x100).encodeABI();
  await vm.send({ to: erc20Address, data: freeTokensData, from: key1 })
}

async function benchmark1(debugVM) {
  const addLiquidity = exchange.methods.addLiquidity(0x20, 0x100, 1578079307 * 20).encodeABI();
  // await debugVM.send({ to: exchangeAddress, from: key1, data: addLiquidity, value: 1e12 });
  const comparison = await debugVM.compare({ to: exchangeAddress, from: key1, data: addLiquidity, value: 1e12 }, true, true);
  return {
    ...comparison,
    name: 'UNISWAP_ADD_LIQUIDITY',
    data: addLiquidity,
  }
}

async function benchmark2(debugVM) {
  let data = exchange.methods.ethToTokenSwapOutput(0x02, 1578079307 * 20).encodeABI()
  const comparison = await debugVM.compare({ to: exchangeAddress, from: key2, data, value: 1e10 }, true, true)
  return {
    ...comparison,
    name: 'UNISWAP_ETH_TO_TOKEN_SWAP',
    data,
  }
}

async function benchmark(debugVM) {
  await deployContracts(debugVM);
  await getFreeTokens(debugVM);
  const approveData = erc20.methods.approve(exchangeAddress, 0x100).encodeABI();
  await debugVM.send({ to: erc20Address, data: approveData, from: key1 })
  let bench1 = await benchmark1(debugVM)
  let bench2 = await benchmark2(debugVM)
  return [bench1, bench2]
  // let res = 
  // console.log(res)
  // console.log(bench1.nativeResult.txo.sio)
  // console.log(bench1.virtualResult.txo)
  // console.log(bench1.virtualResult)
  // await debugVM.writeLogs(bench1.nativeResult.steps, bench1.virtualResult.steps, bench1.txo, bench1.txo2)
  // let check = exchange.methods.getEthToTokenInputPrice(1e12).encodeABI();
  // const r2 = await debugVM.send({ to: exchangeAddress, from: key1, data: check });
  
  // console.log(r2.returnValue.toString('hex'))
  // const {abi, bytecode} = await compile()
  // const tokenAddress = await debugVM.deploy(bytecode);
  // const contract = new Contract(abi);
  // const freeTokensData = contract.methods.freeTokens(55).encodeABI();
  // const freeTokensComparison = await debugVM.compare({ to: tokenAddress, data: freeTokensData });
  // const { virtualResult: virtualResult1 } = freeTokensComparison
  // const benchmark1 = {
  //   ...freeTokensComparison,
  //   name: 'ERC20_MINT',
  //   data: freeTokensData
  // };

}

module.exports = benchmark;