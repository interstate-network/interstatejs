const EVM = require('../dist').default;
const getTx = require('./getTx')
// const { abiEncode } = require('../dist/witness')
const { bufferToHex, toBuffer, privateToAddress } = require('ethereumjs-util')
const abi = require('web3-eth-abi')
const coder = abi

const prettyPrintWords = (abiEncodedString) =>
  abiEncodedString.slice(2).match(/.{64}/g)
    .map((word, index) => console.log(
      `0x${(index * 32).toString(16)} | ${word}`
    ))

const pvtKey1 = toBuffer(`0x${'11'.repeat(32)}`);
const account1 = privateToAddress(pvtKey1);

const pvtKey2 = toBuffer(`0x${'22'.repeat(32)}`);
const account2 = privateToAddress(pvtKey2);

async function test() {
  const evm = new EVM({
    hardfork: 'istanbul'
  })
  const tx1 = getTx({
    to: account1,
    incoming: true,
    value: toBuffer(1e18)
  });
  await evm.runTx(tx1);
  const tx2 = getTx({
    from: pvtKey1,
    to: account2,
    gas: 5e5,
    value: 1e17
  })
  const res1 = await evm.runTx(tx2);
  console.log(res1.gasUsed.toNumber());
}


test()