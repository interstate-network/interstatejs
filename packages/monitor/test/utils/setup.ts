import { Eth } from 'web3x/eth';
import { Contract } from 'web3x/contract'
import { LegacyProviderAdapter } from 'web3x/providers';
import { Address } from 'web3x/address';
import { deployPeg } from '@interstatejs/contracts/test-utils';
import { ParentContext } from '../../src/lib/parent-context';
import TestAuditor from './test-auditor';
import BlockBuilder from './block-builder';
import { Database } from '../../src/db';
import ParentListener from '../../src/parent-listeners';
import { MockStateProofLib } from '@interstatejs/contracts';
import { compile, Deployer } from '@interstatejs/utils'

export interface TestEntities {
  eth: Eth;
  from: Address;
  accounts: Address[];
  auditor: TestAuditor;
  context: ParentContext;
  db: Database;
  listener: ParentListener;
  blockBuilder: BlockBuilder;
  stateProofLib: MockStateProofLib;
  // testContract: Contract;
}

export async function setup(): Promise<TestEntities> {
  const {
    parentRelay,
    archiveFactory,
    peg,
    web3,
    archiveInitializerCode,
    challengeManager,
    accessErrorProver,
    blockErrorProver,
    executionErrorProver,
    transactionErrorProver,
    encodingErrorProver,
    witnessErrorProver,
    stateProofLib
  } = await deployPeg();
  const eth = new Eth(new LegacyProviderAdapter(web3.currentProvider));
  const accounts = await eth.getAccounts();
  const networkID = await eth.getId();
  const context = new ParentContext(
    eth,
    networkID,
    Address.fromString(peg.options.address),
    Address.fromString(parentRelay.options.address),
    Address.fromString(archiveFactory.options.address),
    archiveInitializerCode,
    Address.fromString(challengeManager.options.address),
    Address.fromString(accessErrorProver.options.address),
    Address.fromString(blockErrorProver.options.address),
    Address.fromString(executionErrorProver.options.address),
    Address.fromString(transactionErrorProver.options.address),
    Address.fromString(encodingErrorProver.options.address),
    Address.fromString(witnessErrorProver.options.address)
  );
  
  const from = accounts[0];
  const db = await Database.create();
  const listener = await ParentListener.create(context, db);
  const auditor = new TestAuditor(db, context, from, listener);
  await auditor.start();

  // const {
  //   abi,
  //   evm: { bytecode: { object: bytecode } } 
  // } = compile(__dirname, 'TestContract.sol', __dirname)['TestContract.sol']['TestContract'];
  // const receipt = await eth.sendTransaction({
  //   data: bytecode,
  //   from
  // }).getReceipt();
  // const testContract = new Contract(eth, abi, receipt.contractAddress);

  const blockBuilder = new BlockBuilder(db, context, listener.incomingTransactionListener, from);
  await blockBuilder.setDefaultBlock();

  return {
    accounts,
    from,
    db,
    listener,
    blockBuilder,
    auditor,
    context,
    eth,
    stateProofLib: new MockStateProofLib(eth, Address.fromString(stateProofLib.options.address)),
    // testContract
  };
}