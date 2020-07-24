const fs = require('fs');
const path = require('path');
const libPath = path.join(__dirname, '..', 'lib');

// const indexFile = [
//   `export * from './ChainPeg';`,
//   `export * from './ParentRelay';`,
//   `export * from './MockParentRelay';`,
//   `export * from './ChildRelay';`,
// ].join('\n')

const indexFile = [
  'AccessListFraud',
  `ChainPeg`,
  `ParentRelay`,
  `ChildRelay`,
  `MockParentRelay`,
  `MockFraudProver`,
  `ChallengeManager`,
  'AccessErrorProver',
  'BlockErrorProver',
  'ExecutionErrorProver',
  'TransactionErrorProver',
  'EncodingErrorProver',
  'WitnessErrorProver',
  'MockStateProofLib'
].reduce((arr, v) => [...arr, v, `${v}Abi`], [])
.filter(
  p => fs.existsSync(path.join(libPath, `${p}.ts`))
).map(s => {
  if (s == 'ChallengeManager') {
    return `export {
      ChallengeManagerTransactionReceipt,
      ChallengeManager,
      ChallengeManagerAbi
    } from './${s}';`
  }
  if (s == 'WitnessErrorProver') {
    return `export {
      WitnessErrorProver,
      WitnessErrorProverAbi,
      WitnessErrorProverTransactionReceipt
    } from './WitnessErrorProver';`
  }
  if (s == 'ExecutionErrorProver') {
    return `export {
      ExecutionErrorProver,
      ExecutionErrorProverAbi,
      ExecutionErrorProverTransactionReceipt
    } from './ExecutionErrorProver';`
  }
  return `export * from './${s}';`;
}).join('\n');

fs.writeFileSync(
  path.join(libPath, 'index.ts'),
  indexFile
)