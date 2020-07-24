const { BlockHeader: Header } = require('../dist/header');

const A = new Header({
  parentHash: '0x' + '00'.repeat(32),
  number: 5,
  parentChainHash: '0x' + '00'.repeat(32),
  parentChainHeight: 5,
  incomingTransactionsCount: 5,
  transactionsCount: 5,
  transactionsRoot: '0x' + '00'.repeat(32),
  stateRoot: '0x' + '00'.repeat(32),
  exitsRoot: '0x' + '00'.repeat(32),
  coinbase: '0x' + '00'.repeat(20),
  timestamp: 5,
  gasLimit: 5,
  gasUsed: 5,
  exitGasPrice: 5
});
const x = A.encodeABI()
console.log(x)
// Header.decodeABI(x)