const BN = require('bn.js')
const { toBuffer } = require('ethereumjs-util')
const {DelegateCallWitness} = require('../dist/witness/call')
const {encodeAccess} = require('../dist/witness/message')
const toHex = require('../dist/witness/toHex').default

console.log(new BN(''))
const prettyPrintWords = (abiEncodedString) =>
  abiEncodedString.slice(2).match(/.{64}/g)
    .map((word, index) => console.log(
      `0x${(index * 32).toString(16)} | ${word}`
    ))

let encoded = encodeAccess(new DelegateCallWitness(
  new BN(0),
  new BN(0),
  new BN(0),
  new BN(toBuffer('0xffffffffffffffffffffffffffffffffffffffff')),
  new BN(toBuffer('0x3c2d8cd2b72f4d773761fded626d1882655d749460170d3c9023662f315a9d50')),
  true,
  '0xff'
))

require('fs').writeFileSync('./delegate-call-witness.json', JSON.stringify(encoded, null, 2))
prettyPrintWords(encoded)