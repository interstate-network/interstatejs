const DebugVM = require('../../utils/debug-vm');
const fs = require('fs')
const path = require('path')
const read = (_path) => fs.readFileSync(path.join(__dirname, _path), 'utf8')
const easySolc = require('easy-solc');
const Contract = require('web3-eth-contract');
const debugVM = new DebugVM();

function cleanCode(code) {
  let hex = Buffer.from(code.slice(2), 'hex');
  const opcodes = require('./opcodes')
  let str = [];
  for (let i = 0; i < hex.length; i++) {
    const opNum = hex[i];
    const op = opcodes[opNum];
    if (op && op.name == 'PUSH') {
      const pushSize = opNum - 0x5f;
      str.push(`PC 0x${i.toString(16)} | 0x${opNum.toString(16)} PUSH${pushSize} 0x${hex.slice(i+1, i+pushSize+1).toString('hex')}`)
      i += pushSize;
      continue;
    }
    str.push(`PC 0x${i.toString(16)} | 0x${opNum.toString(16)} (${op ? op.name : 'INVALID'})`)
  }
  return str.join('\n')
}

async function compile() {
  if (fs.existsSync('./CodeCopy.json')) return JSON.parse(read('./CodeCopy.json'))
  const result = await easySolc({
    sources: {
      'CodeCopy.sol': { content: read('CodeCopy.sol') },
    },
    name: 'CodeCopy'
  })
  fs.writeFileSync(path.join(__dirname, 'CodeCopy.json'), JSON.stringify(result, null, 2));
  return result;
};

async function doTest() {
  await debugVM.setup()
  const { bytecode, abi } = await compile();
  const contract = new Contract(abi);
  const codeCopy = await debugVM.deploy(bytecode);
  const codeCopyData = contract.methods.checkShitYo().encodeABI();
  const comparison = await debugVM.compare({ to: codeCopy, data: codeCopyData }, false, true);
  const { nativeResult, virtualResult, txo, txo2 } = comparison;
  const { steps } = nativeResult;
  const { steps: steps2 } = virtualResult;
  debugVM.writeLogs(steps, steps2, txo, txo2)
  console.log(steps2.slice(steps2.length - 20))
  console.log(nativeResult.success)
  console.log(virtualResult.success)
  console.log(`addr`, codeCopy)
}

doTest()