const Transaction = require('@interstatejs/tx').SignedTransaction;
const IncomingTransaction = require('@interstatejs/tx').IncomingTransaction;
const BN = require('bn.js')

const gas = 6e6;
const gasPrice = 1;

const defaultKey = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex',
);

/* from must be a private key */
const getTxOpts = ({ from = defaultKey, to, data, value, incoming }) => {
  const tx = new (incoming ? IncomingTransaction : Transaction)({
    to, data, value, gas, gasPrice, from: incoming ? `0x${'ff'.repeat(20)}` : undefined
  }, { chain: 'mainnet', hardfork: 'istanbul' });
  if (!incoming) tx.sign(from);
  tx.getSenderAddress();
  return {
    skipNonce: true,
    skipBalance: true,
    tx,
  }
};

module.exports = getTxOpts;