import VM, { MessageWitness, SloadWitness, toHex } from "@interstatejs/vm/dist";
import { toBuffer, BN, bufferToHex, privateToAddress } from 'ethereumjs-util';
const Trie = require('merkle-patricia-tree/secure');
import crypto from 'crypto';
import { IncomingTransaction, SignedTransaction, BufferLike, Transaction } from "@interstatejs/tx";
import { deployPeg } from './deploy';
import { Block } from "@interstatejs/block";

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


export const defaultKey = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
  'hex',
);

export class Faker {
  challengeManager: any;
  childRelay: any;
  parentRelay: any;
  archiveFactory: any;
  web3: any;
  from: string;
  vm: VM;
  testAddress: Buffer;
  peg: any;
  accounts: any[];

  constructor() {
    this.vm = getVM();
  }

  async init() {
    const result = await deployPeg();
    Object.assign(this, result);
  }

  async deployAndExecute(): Promise<Block> {
    const deployTx = new IncomingTransaction({
      from: randomHexString(20),
      data: '0x6020600055',
    });
    const executeTx = new SignedTransaction({
      to: deployTx.getSenderAddress(),
      gasLimit: 5e4,
    });
    executeTx.sign(defaultKey);
    const block = new Block({
      header: undefined,
      transactions: [
        deployTx,
        executeTx
      ]
    });
    await this.vm.runBlock({ block, generate: true });
    return block;
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

// export async function doT() {
//   try {
//     const { access, web3 } = await accessLib();
//     const from = await web3.eth.getAccounts().then(a => a[0]);
//     const { messageWitness, accountProof, storageProof } = await test2();
//     // console.log(messageWitness.abiParams)
//     const receipt = await access.methods.validateSloadErrorProof(
//       messageWitness.encode(),
//       0,
//       accountProof,
//       storageProof
//     ).send({
//       from, gas: 5e6
//     });
//     // .send({ from, gas: 5e6 });
//     // console.log(messageWitness.encode())
//     // const receipt = await access.methods.getRecord2(
//       // messageWitness.encode()
//     // ).call()
//     console.log(receipt);
//   } catch (err)  {
//     console.error(err)
//     console.log(err.stack)
//   }
// }

// // test2()
// doT()