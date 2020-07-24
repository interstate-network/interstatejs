const EVM = require('../dist').default;
const getTx = require('./getTx')
// const { abiEncode } = require('../dist/witness')
const { bufferToHex, toBuffer } = require('ethereumjs-util')
const abi = require('web3-eth-abi')
const coder = abi

const prettyPrintWords = (abiEncodedString) =>
  abiEncodedString.slice(2).match(/.{64}/g)
    .map((word, index) => console.log(
      `0x${(index * 32).toString(16)} | ${word}`
    ))

async function test() {
  const evm = new EVM({
    hardfork: 'istanbul',
    produceWitness: true
  })
  // const
  const res1 = await evm.runTx(getTx({
    data: "0x6001600055",
    incoming: true
  }))
  const {createdAddress} = res1;
  const res = await evm.runTx(getTx({
    to: createdAddress,
    gas: 5e5,
    value: 1e18,
  }))
  // const witness = res.execResult.witnesses[0]
  require('fs').writeFileSync('./witness.json', JSON.stringify(res1.execResult.witnesses, null, 2))
  require('fs').writeFileSync('./witness1.json', JSON.stringify(res.execResult.witnesses, null, 2))
  // console.log(witness)
  // console.log(witness.state_access_list)
  // const encoded = abi.encodeParameters(witness.abiTypes, witness.abiParams);
  // require('fs').writeFileSync('./message-witness.json', JSON.stringify(encoded))
  // prettyPrintWords(encoded)
}


test()