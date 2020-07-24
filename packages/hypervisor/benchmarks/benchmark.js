const DebugVM = require('../utils/debug-vm');
const benchmarkErc20 = require('./ERC20');
const benchmarkCircom = require('./iden3-circom');
const benchmarkUniswap = require('./Uniswap');
const getTxOpts = require('../utils/tx')
const {table} = require('table');
const vm = new DebugVM();

const txDataZero = 4;
const txDataNonZero = 16;

const dataFee = (data) => Buffer.from(data.slice(2), 'hex').reduce(
  (fee, nibble) => fee + (nibble == 0 ? txDataZero : txDataNonZero),
  0
)

const benchmarkToRow = ({ name, data, nativePrice, virtualPrice, }) => [
  name,
  getTxOpts({ data }).tx.serialize().toString('hex').length + 32,
  dataFee(`${getTxOpts({ data }).tx.serialize().toString('hex')}${'aa'.repeat(32)}`),
  nativePrice,
  virtualPrice,
  // virtualPrice - nativePrice
]
const headRow = [
  'NAME',
  'CD BYTES',
  'ROLLUP COST',
  'NATIVE GAS',
  'EVMVM GAS',
  // 'HV OVERHEAD'
]


async function benchmark() {
  await vm.setup();
  const benchmarks = [
    ...await benchmarkErc20(vm),
    ...await benchmarkUniswap(vm),
    // await benchmarkCircom(vm),
  ].map(bench => benchmarkToRow(bench));
  const data = [
    headRow,
    ...benchmarks,
  ]
  const output = table(data);
 
  console.log(output);
}

benchmark()