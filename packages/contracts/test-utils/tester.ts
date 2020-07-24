import VM, { MessageWitness, SloadWitness, toHex } from "@interstatejs/vm/lib";
import { toBuffer, BN, bufferToHex, privateToAddress } from 'ethereumjs-util';
const Trie = require('merkle-patricia-tree/secure');
import crypto from 'crypto';
import { IncomingTransaction, SignedTransaction, BufferLike, Transaction } from "@interstatejs/tx";
import {StateTrie, toBn, StorageTrie} from './trie'
import Account from "ethereumjs-account";
import { accessLib } from './deploy';

function randomHexString(size: number): string {
  const bytes = crypto.randomBytes(size);
  return bufferToHex(bytes);
}

function randomAddress(): Buffer {
  const pvtKey = randomHexString(32);
  return privateToAddress(toBuffer(pvtKey));
}

const stripHexPrefix = (hex: string) => hex.slice(0, 2) == '0x' ? hex.slice(2) : hex;
const padNBytes = (hex: string, num: number) => stripHexPrefix(hex).padStart(num * 2, '0');

export function getVM(): VM {
  const trie = new Trie();
  return new VM({
    state: trie,
    produceWitness: true
  });
}

export enum TestOpcode {
  SLOAD = 0x44,
  SSTORE = 0x55,
}


const defaultKey = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex',
);

class Faker {
  vm: VM;
  testAddress: Buffer;

  constructor() {
    this.vm = getVM();
  }

  async deployTest(): Promise<Buffer> {
    const tx = new IncomingTransaction({
      from: randomHexString(20),
      data: '0x6020600055',
    });
    const { createdAddress } = await this.vm.runTx({ tx });
    this.testAddress = createdAddress;
    return createdAddress;
  }

  async executeTest(): Promise<{
    witness: MessageWitness,
    transaction: Transaction
  }> {
    const tx = new SignedTransaction({
      to: this.testAddress,
      gasLimit: 5e4,
    });
    tx.sign(defaultKey);
    tx.getSenderAddress();
    const { execResult: { witnesses } } = await this.vm.runTx({
      tx,
      skipNonce: true,
      skipBalance: true
    });
    return {
      witness: witnesses[0],
      transaction: tx
    };
  }
}

export async function deployBytecode(vm: VM, code: string): Promise<Buffer> {
  const tx = new IncomingTransaction({
    from: randomHexString(20),
    data: code,
  });
  const { createdAddress } = await vm.runTx({ tx });
  return createdAddress;
}

export async function executeTest({ contractAddress, vm }: {
  contractAddress: Buffer,
  vm: VM
}): Promise<{
  witness: MessageWitness,
  transaction: Transaction
}> {
  const tx = new SignedTransaction({
    to: contractAddress,
    gasLimit: 5e4,
  });
  tx.sign(defaultKey);
  tx.getSenderAddress()
  const { execResult: { witnesses } } = await vm.runTx({
    tx,
    skipNonce: true,
    skipBalance: true
  });
  return {
    witness: witnesses[0],
    transaction: tx
  };
}

export type TestData = {
  opcode: TestOpcode;
  bytecode: string;
  accountProof?: boolean;
  slot?: BufferLike;
}

export const sstoreTestData: TestData = {
  opcode: 0x55,
  bytecode: '0x6020600055',
  slot: 0,
  accountProof: true
}

export const sloadTestData: TestData = {
  opcode: 0x54,
  bytecode: `0x600054`, // 6020600055
  slot: 0,
  accountProof: true
}

export type TestContext = {
  vm: VM;
  contractAddress: BufferLike;
  rootAfterDeploy: BufferLike;
  preTestAccountProof: BufferLike;
  preTestAccount: Account;
  trie: StateTrie;
  account?: Account;
  accountProof?: string;
  storageValue?: BufferLike;
  storageProof?: string;
  messageWitness?: MessageWitness;
  transaction?: Transaction;
}

export type AccountProof = {
  account: Account;
  proof: any;
  root: string;
}

export type StorageProof = {
  slot: BufferLike;
  value: BufferLike;
  proof: string;
}

class Tester {
  vm: VM;
  contractAddress: Buffer;
  senderPrivateKey: Buffer;
  senderAddress: Buffer;
  trie: StateTrie;
  stateProof1?: AccountProof;
  stateProof2?: AccountProof;
  storageProof?: StorageProof;
  messageWitness?: MessageWitness;

  constructor(public data: TestData) {
    this.vm = getVM();
    this.contractAddress = toBuffer(randomHexString(20));
    this.senderPrivateKey = toBuffer(randomHexString(32));
    this.senderAddress = privateToAddress(this.senderPrivateKey);
    this.trie = StateTrie.fromVM(this.vm);
  }

  async putContract() {
    await this.vm.pStateManager.putAccount(
      this.contractAddress,
      new Account()
    );
    await this.vm.pStateManager.putContractCode(
      this.contractAddress,
      toBuffer(this.data.bytecode)
    );
    console.log('state root --', await this.vm.pStateManager.getStateRoot());
  }

  async putSender() {
    console.log('state root --', await this.vm.pStateManager.getStateRoot());
    await this.vm.pStateManager.putAccount(
      this.senderAddress,
      new Account({
        balance: 1
      })
    );
  }

  async getPreProof() {
    console.log('trie root --', this.trie.trie.root);
    this.stateProof1 = {
      ...(await this.trie.getAccountProof(this.contractAddress)),
      root: toHex(this.trie.trie.root)
    };
  }

  async getPostProof() {
    const { slot } = this.data;
    const { value, proof } = await this.trie.getAccountStorageProof(this.contractAddress, slot);
    this.storageProof = { slot, value, proof };
    this.stateProof2 = {
      ...(await this.trie.getAccountProof(this.contractAddress)),
      root: toHex(this.trie.trie.root)
    };
  }

  async executeTest() {
    const tx = new SignedTransaction({
      to: this.contractAddress,
      gasLimit: 5e4
    });
    tx.sign(this.senderPrivateKey);
    const { execResult: { witnesses } } = await this.vm.runTx({
      tx, skipBalance: true, skipNonce: true,
    });
    this.messageWitness = witnesses[0];
  }

  static async test(data: TestData) {
    const tester = new Tester(data);
    await tester.putContract();
    await tester.putSender();
    await tester.getPreProof();
    await tester.executeTest();
    await tester.getPostProof();
    return tester;
  }
}

export async function test2() {
  const testData = sloadTestData;
  try {
    // const tester = await Tester.test(testData);
    const contractAddress = randomAddress();
    const sender = randomAddress();
    const trie = new StateTrie(new Trie());
    const storage = new StorageTrie(new Trie());
    await storage.put(new BN(0), 50);
    const storageRoot = toBuffer(storage.trie.root);
    const storageProof = await storage.prove(new BN(0));

    const account = new Account({ stateRoot: storageRoot });
    await trie.putAccount(contractAddress, account);
    const accountProof = await trie.prove(contractAddress);

    const stateRootEnter = toBn(trie.trie.root);
    const sload = new SloadWitness(new BN(0), new BN(2));
    const stateRootLeave = stateRootEnter;

    const messageWitness = new MessageWitness(
      stateRootEnter,
      stateRootLeave,
      false,
      toBn(sender),
      toBn(sender),
      toBn(contractAddress),
      toBn(contractAddress),
      new BN(2),
      new BN(2),
      new BN(2),
      new BN(2),
      new BN(2),
      new BN(2),
      toBuffer(new BN(0)),
    );
    messageWitness.state_access_list.push(sload);
    messageWitness.status = 1;
    return { messageWitness, accountProof, storageProof };
  } catch (err)  {
    console.error(err)
    console.log(err.stack)
  }
}

export async function doT() {
  try {
    const { access, web3 } = await accessLib();
    const from = await web3.eth.getAccounts().then(a => a[0]);
    const { messageWitness, accountProof, storageProof } = await test2();
    // console.log(messageWitness.abiParams)
    const receipt = await access.methods.validateSloadErrorProof(
      messageWitness.encode(),
      0,
      accountProof,
      storageProof
    ).send({
      from, gas: 5e6
    });
    // .send({ from, gas: 5e6 });
    // console.log(messageWitness.encode())
    // const receipt = await access.methods.getRecord2(
      // messageWitness.encode()
    // ).call()
    console.log(receipt);
  } catch (err)  {
    console.error(err)
    console.log(err.stack)
  }
}

// test2()
doT()