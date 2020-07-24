import fs from 'fs';
import path from 'path';
import { Eth } from 'web3x/eth';
import { compile } from './compile';
import { getWeb3, Deployer } from './web3';
import {
  bytecode as hypervisorBytecode
} from 'huff-hypervisor' // '@interstatejs/hypervisor';
const compileByteCounter = require('../contracts/common/config/byte-counter/compile');


export type PegDeploymentResult = {
  sparseLib: any;
  challengeManager: any;
  childRelay: any;
  parentRelay: any;
  archiveFactory: any;
  archiveInitializerCode: any;
  byteCounter: any;
  hypervisor: any;
  peg: any;
  from: any;
  accounts: any[];
  web3: any;
  accessErrorProver: any;
  blockErrorProver: any;
  executionErrorProver: any;
  transactionErrorProver: any;
  encodingErrorProver: any;
  witnessErrorProver: any;
  stateProofLib: any;
}

export async function deployPeg(): Promise<PegDeploymentResult> {
  const srcPath = path.join(__dirname, '..', 'contracts');
  const names = [
    'common/rollup/SparseMerkleTree.sol',
    'peg/ChainPeg.sol',
    'relay/ChildRelay.sol',
    'relay/ParentRelay.sol',
    'relay/ArchiveFactory.sol',
    'challenge/ChallengeManager.sol',
    'fraud-proofs/AccessErrorProver.sol',
    'fraud-proofs/BlockErrorProver.sol',
    'fraud-proofs/ExecutionErrorProver.sol',
    'fraud-proofs/TransactionErrorProver.sol',
    'fraud-proofs/EncodingErrorProver.sol',
    'fraud-proofs/WitnessErrorProver.sol',
    'mock/MockStateProofLib.sol'
  ];
  const standard = compile(srcPath, names);
  const { web3, from, accounts } = await getWeb3();
  const deployer = new Deployer(web3, from, standard);
  const {
    bytecode: archiveInitializerCode
  } = deployer.toContractFields('relay/ArchiveFactory.sol', 'ArchiveInitializer')
  const sparseLib = await deployer.deploy('common/rollup/SparseMerkleTree.sol', 'SparseMerkleTree');
  const challengeManager = await deployer.deploy('challenge/ChallengeManager.sol', 'ChallengeManager');
  const childRelay = await deployer.deploy('relay/ChildRelay.sol', 'ChildRelay');
  const parentRelay = await deployer.deploy('relay/ParentRelay.sol', 'ParentRelay');
  const archiveFactory = await deployer.deploy('relay/ArchiveFactory.sol', 'ArchiveFactory');
  const accessErrorProver = await deployer.deploy('fraud-proofs/AccessErrorProver.sol', 'AccessErrorProver');
  const blockErrorProver = await deployer.deploy('fraud-proofs/BlockErrorProver.sol', 'BlockErrorProver');
  const executionErrorProver = await deployer.deploy('fraud-proofs/ExecutionErrorProver.sol', 'ExecutionErrorProver');
  const transactionErrorProver = await deployer.deploy('fraud-proofs/TransactionErrorProver.sol', 'TransactionErrorProver');
  const encodingErrorProver = await deployer.deploy('fraud-proofs/EncodingErrorProver.sol', 'EncodingErrorProver');
  const witnessErrorProver = await deployer.deploy('fraud-proofs/WitnessErrorProver.sol', 'WitnessErrorProver');
  const stateProofLib = await deployer.deploy('mock/MockStateProofLib.sol', 'MockStateProofLib');
  // const access = (await deployer.deploy('fraud-proofs/AccessErrorLib.sol', 'AccessErrorLib'));
  const peg = await deployer.deploy('peg/ChainPeg.sol', 'ChainPeg');
  const byteCounter = await deployer.deployBytecode(compileByteCounter().bytecode);
  const hypervisor = await deployer.deployBytecode(hypervisorBytecode);
  await peg.methods.initialize(
    sparseLib.options.address,
    challengeManager.options.address,
    parentRelay.options.address,
    archiveFactory.options.address,
    byteCounter,
    accessErrorProver.options.address,
    blockErrorProver.options.address,
    executionErrorProver.options.address,
    transactionErrorProver.options.address,
    encodingErrorProver.options.address,
    witnessErrorProver.options.address,
    hypervisor
  ).send({ from, gas: 5e6 });
  await parentRelay.methods.initialize(
    peg.options.address,
    archiveFactory.options.address,
    childRelay.options.address
  ).send({ from, gas: 5e6 });
  return {
    sparseLib,
    byteCounter,
    hypervisor,
    challengeManager,
    childRelay,
    parentRelay,
    archiveFactory,
    archiveInitializerCode,
    peg,
    web3,
    from,
    accounts,
    accessErrorProver,
    blockErrorProver,
    executionErrorProver,
    transactionErrorProver,
    encodingErrorProver,
    witnessErrorProver,
    stateProofLib
  };
}