import VM, { commitmentsFromWitnesses } from "@interstatejs/vm";
import { SignedTransaction, IncomingTransaction } from "@interstatejs/tx";
import { bufferToHex } from 'ethereumjs-util';
import crypto from 'crypto';
import Trie from 'merkle-patricia-tree/secure';
import { Block, BlockHeaderData } from "@interstatejs/block";
// import { MockFraudProver } from "../../lib";
import { deployFraudMock } from '../../test-utils';
import { toUsable } from '../../test-utils/to'

function randomHexString(size: number): string {
  const bytes = crypto.randomBytes(size);
  return bufferToHex(bytes);
}

const stripHexPrefix = (hex: string) => hex.slice(0, 2) == '0x' ? hex.slice(2) : hex;
const padNBytes = (hex: string, num: number) => stripHexPrefix(hex).padStart(num * 2, '0');
const toByte = (x: number): string => padNBytes(x.toString(16), 1);

const sstoreCode = `6020600055`;
const sloadCode = `6020600055600054`;

const defaultKey = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex',
);

async function getAccessListChallengeData(prover: any, from: string, bytecode: string) {
  console.log('enter')
  const trie = new Trie();
  console.log('trie')
  const vm = new VM({
    produceWitness: true,
    state: trie
  });
  console.log('vm')
  const deployTx = new IncomingTransaction({
    from: randomHexString(20),
    data: `0x${bytecode}`,
  });
  const { createdAddress } = await vm.runTx({ tx: deployTx });
  console .log('deploy tx')
  const executeTx = new SignedTransaction({
    to: createdAddress,
    gasLimit: 5e6,
  });
  executeTx.sign(defaultKey);
  const { execResult: { exceptionError, witnesses }} = await vm.runTx({
    skipBalance: true,
    skipNonce: true,
    tx: executeTx
  });
  console.log('execute')
  const commitment = commitmentsFromWitnesses(witnesses)[0];
  console.log('commit')
  const w = toUsable(witnesses[0] as any);
  console.log(w)
  const header: BlockHeaderData = {
    parentHash: randomHexString(32),
    number: 2,
    incomingTransactionsIndex: 0,
    incomingTransactionsCount: 0,
    transactionsCount: 1,
    transactionsRoot: randomHexString(32),
    stateRoot: randomHexString(32),
    exitsRoot: randomHexString(32),
    coinbase: randomHexString(20),
    timestamp: 50
  };
  const block = new Block({
    header,
    transactions: [ deployTx, executeTx ]
  });

  const witnessQuery = {
    blockHash: block.hash(),
    txIndex: 0,
    witnessIndex: 0,
    siblings: [],
    witnessCommitment: commitment
  };

  const inputHeader = toUsable(block.header.encodeJSON() as any)
  const inputQuery = toUsable(witnessQuery as any)
  const receipt = await prover.methods.setupAccessListFraudTest(
    inputHeader, w
  ).send({ from, gas: 5e6 });
  console.log(`sent that shit yo`)
  const blockCommitment = block.header.toCommitment({ childIndex: 0, submittedAt: receipt.blockNumber });
  const blockQuery = blockCommitment.query;
  return {
    blockQuery,
    witnessQuery,
    messageWitness: witnesses[0],
  }
}

async function execute(bytecode: string) {
  const trie = new Trie();
  const vm = new VM({
    produceWitness: true,
    state: trie
  });
  let tx = new IncomingTransaction({
    from: randomHexString(20),
    data: `0x${bytecode}`,
  });
  const res0 = await vm.runTx({ tx });
  console.log(trie.root)
  
  let tx1 = new SignedTransaction({
    to: res0.createdAddress,
    gasLimit: 5e6,
  })
  tx1.sign(defaultKey);
  const res = await vm.runTx({
    skipBalance: true,
    skipNonce: true,
    tx: tx1
  });
  console.log(trie.root)
  const witnesses = res.execResult.witnesses;
  console.log(res.execResult.exceptionError)
  console.log(witnesses);
  const commitment = commitmentsFromWitnesses(witnesses);
  console.log(commitment)
}

async function test() {
  const { web3, access, prover } = await deployFraudMock();
  console.log('deployed')
  const { blockQuery,
    witnessQuery,
    messageWitness,
  } = await getAccessListChallengeData(prover,  await web3.eth.getAccounts().then(a => a[0]), sstoreCode);
  console.log(`got params`)
  console.log(blockQuery)
  console.log(witnessQuery)
  console.log(messageWitness)
  const worked = await prover.methods.testProof(
    toUsable(blockQuery as any),
    toUsable(witnessQuery as any),
    messageWitness.abiParams
    /* toUsable(messageWitness as any) */,
    0
  ).call();
  console.log('did work?')
  console.log(worked)
}
test()
// execute(sstoreCode)