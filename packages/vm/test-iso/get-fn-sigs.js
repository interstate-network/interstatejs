const ABI = require('web3-eth-abi');
const arr = [
  'withdraw()',
  'withdraw(uint256)',
  'addTransaction(address,bytes)',
  'addTransactionWithBounty(address,bytes,uint256)'
];
for (let item of arr) {
  console.log(item, ' | ', ABI.encodeFunctionSignature(item))
}
