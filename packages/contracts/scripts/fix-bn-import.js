const fs = require('fs');
const path = require('path');
const libPath = path.join(__dirname, '..', 'lib');

const paths = [
  'AccessListFraud',
  `ChainPeg`,
  `ParentRelay`,
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
].reduce((arr, v) => [...arr, `${v}.ts`, `${v}Abi.ts`], [])
.filter(
  p => fs.existsSync(path.join(libPath, `${p}.ts`))
)

for (let _path of paths) {
  const createdFile = fs.readFileSync(_path, 'utf8');
  const fixedFile = createdFile.replace(/import BN from "bn\.js"/g, `import * as BN from "bn.js"`);
  fs.writeFileSync(_path, fixedFile);
}