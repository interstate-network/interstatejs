const DebugVM = require('../utils/debug-vm');
const path = require('path')
const vm = new DebugVM();

const { bytecode } = require('./contracts/easy-huff')(path.join(__dirname, 'contracts'), 'test2.huff', 'TEST')

const prettyPrintWords = (abiEncodedString) =>
  abiEncodedString.slice(2).match(/.{0,64}/g)
    .map((word, index) => console.log(
      `0x${(index * 32).toString(16).padEnd(2, 0)} | ${word}`
    ))

async function test() {
  await vm.setup();
  const address = vm.hypervisor;
  console.log(address)
  const res = await vm.send({ to: address, gas: 6e6 })
  const calldata = res.witness.encode()
  // console.log(res.witness.state_access_list)
  // const res2 = await vm.callHypervisor(calldata)
  // const { returnValue, stack, opCode, programCounter } = res2;
  // console.log({ returnValue, stack, opCode, programCounter })
  // // console.log(returnValue.toString('hex'))
  // prettyPrintWords('0x' + returnValue.toString('hex'))
  // console.log(calldata.slice(0x261))
}

test();