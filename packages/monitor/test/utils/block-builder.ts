// import { Database } from "../../src/db";
import { Address } from 'web3x/address';
import { Contract } from 'web3x/contract'
import { Block, BlockHeader, BlockJson } from "@interstatejs/block";
import { toBuffer } from "ethereumjs-util";
import VM from '@interstatejs/vm';
import IncomingTransactionListener from "../../src/parent-listeners/incoming-transaction-listener";
import { ParentContext } from "../../src/lib/parent-context";
import { SignedTransaction, IncomingTransaction } from "@interstatejs/tx";
import { keccak256, compile, toHex } from '@interstatejs/utils';
import { privateToAddress } from 'ethereumjs-util';
import { Database } from '../../src/db';
const ABI = require('web3-eth-abi');

export class BlockBuilder {
  private defaultBlock: BlockJson;
  public testContractAddress: Address;

  constructor(
    public db: Database,
    public context: ParentContext,
    public itxListener: IncomingTransactionListener,
    public from: Address,
    // public testContract: Contract
  ) {}

  public getBlock1Header(): BlockHeader {
    const header = new BlockHeader();
    header.setGenesisParams();
    const parentHash = header.hash();
    header.number = toBuffer(1);
    header.coinbase = toBuffer(this.from.toString());
    header.parentHash = parentHash;
    header.timestamp = toBuffer(Date.now());
    return header;
  }

  private async makeFirstIncomingTransaction(_to?: Address) {
    const [from, to] = await this.context.eth.getAccounts();
    await this.context.relay.methods.addTransaction(_to || to, 0, '0x')
      .send({ from, value: 1e18 }).getReceipt();
  }

  // async setDefaultBlock() {
  //   const [from] = await this.context.eth.getAccounts();
  //   const header = this.getBlock1Header();
  //   await this.makeIncomingTransaction();
  //   const transactions = await this.itxListener.getIncomingTransactions(0, 2);
  //   const block = new Block({ header, transactions });
  //   const trie = new Trie();
  //   const vm = new VM({ state: trie, produceWitness: true });
  //   await vm.runBlock({ block, generate: true });
  //   this.defaultBlock = block.toJSON();
  // }

  get signerKey(): Buffer {
    return keccak256('private-key');
  }

  get signer(): Buffer {
    return privateToAddress(this.signerKey);
  }

  async giveSignerEth() {
    await this.context.relay.methods.addTransaction(
      new Address(this.signer), 0, '0x'
    ).send({ from: this.from, value: 1e18 }).getReceipt();
  }

  async getTransactions(): Promise<IncomingTransaction[]> {
    const count = await this.itxListener.getTransactionsCount();
    return this.itxListener.getIncomingTransactions(0, count);
  }

  async deployTestContract(): Promise<Address> {
    if (this.testContractAddress) return this.testContractAddress;
    const {
      abi,
      evm: { bytecode: { object: bytecode } }
    } = compile(__dirname, 'TestContract.sol', __dirname)['TestContract.sol']['TestContract'];
    const deployReceipt = await this.context.eth
      .sendTransaction({ data: bytecode, from: this.from, gas: 5e6 })
      .getReceipt();
    const archiveReceipt = await this.context.relay.methods
      .deployContract(deployReceipt.contractAddress)
      .send({ from: this.from, gas: 5e6 })
      .getReceipt();
    const contractAddress = archiveReceipt.events
      .IncomingTransactionQueued[0].returnValues
      .transaction.from;
    this.testContractAddress = contractAddress;
    return contractAddress;
  }

  async executeBlock(block: Block): Promise<void> {
    const parent = await this.db.getBlock(block.header.parentHash);
    const state = await this.db.getStateTree(parent.header.stateRoot);
    const vm = await VM.create({ state });
    for (let i = 0; i < block.transactions.length; i++) {
      await vm.runTx({ block, tx: block.transactions[i] })
    }
    block.setOutputs();
  }

  async setDefaultBlock() {
    if (this.defaultBlock) return;
    const header = this.getBlock1Header();
    await this.makeFirstIncomingTransaction();
    await this.giveSignerEth();
    const incomingTransactions = await this.itxListener.getIncomingTransactions(0, 10);
    const contractAddress = incomingTransactions[0].from;
    const signedTransaction = new SignedTransaction({
      to: contractAddress,
      gasLimit: 50000,
      gasPrice: 5,
      value: 1e16,
      data: ABI.encodeFunctionSignature('withdraw()')
    });
    signedTransaction.sign(this.signerKey);
    const transactions = [...incomingTransactions, signedTransaction];
    const block = new Block({ header, transactions });
    await this.executeBlock(block);
    this.defaultBlock = block.encodeJSON();
  }

  getDefaultBlock(): Block {
    const block = new Block(this.defaultBlock);
    block.header.timestamp = toBuffer(Date.now());
    return block;
  }
}

export default BlockBuilder;