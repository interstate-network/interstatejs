const { Runtime: { getNewVM, Runtime } } = require('@aztec/huff');
const BN = require('bn.js')
const { toBuffer } = require('ethereumjs-util')

const vm = getNewVM()
async function getHash() {
  const main = Runtime('test-data.huff', __dirname);
  const { stack, memory, bytecode, returnValue } = await main(vm, 'TEST_CALLDATA_HASH', [], [], [], 0);
  console.log(`0x${returnValue.toString('hex')}`);
}
/*
0x0 | opcode              |   00000000000000000000000000000000000000000000000000000000000000f1
0x20 | stateRootLeave     |   0000000000000000000000000000000000000000000000000000000000000000
0x40 | gas                |   0000000000000000000000000000000000000000000000000000000000000000
0x60 | gasUsed            |   0000000000000000000000000000000000000000000000000000000000000000
0x80 | address            |   000000000000000000000000ffffffffffffffffffffffffffffffffffffffff
0xa0 | value              |   000000000000000000000000000000000000000000000000000000000000ffff
0xc0 | calldatahash       |   3c2d8cd2b72f4d773761fded626d1882655d749460170d3c9023662f315a9d50
0xe0 | success            |   0000000000000000000000000000000000000000000000000000000000000001
0x100 | returndata_offset |   0000000000000000000000000000000000000000000000000000000000000120
0x120 | returndatasize    |   0000000000000000000000000000000000000000000000000000000000000001
0x140 | returndata        |   ff00000000000000000000000000000000000000000000000000000000000000
*/

async function testCall() {
  const calldata = toBuffer(require('./call-witness.json'))
  console.log(calldata)
  let inStack = ['20', '00', '20', '00', 'ffff', 'ffffffffffffffffffffffffffffffffffffffff', '00']
  const main = Runtime('test-call.huff', __dirname);
  const { stack, memory, bytecode, returnValue } = await main(vm, 'TEST_CALL', inStack, [], calldata, 0);
  console.log(stack)
  console.log(returnValue)
}

async function testStaticCall() {
  const calldata = toBuffer(require('./static-call-witness.json'))
  console.log(calldata)
  let inStack = ['20', '00', '20', '00', 'ffffffffffffffffffffffffffffffffffffffff', '00']
  const main = Runtime('test-call.huff', __dirname);
  const { stack, memory, bytecode, returnValue } = await main(vm, 'TEST_STATIC_CALL', inStack, [], calldata, 0);
  console.log(stack)
  console.log(returnValue)
}

async function testDelegateCall() {
  const calldata = toBuffer(require('./delegate-call-witness.json'))
  console.log(calldata)
  let inStack = ['20', '00', '20', '00', 'ffffffffffffffffffffffffffffffffffffffff', '00']
  const main = Runtime('test-call.huff', __dirname);
  const { stack, memory, bytecode, returnValue } = await main(vm, 'TEST_DELEGATE_CALL', inStack, [], calldata, 0);
  console.log(stack)
  console.log(returnValue)
}

testDelegateCall()