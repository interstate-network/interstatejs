// // import { Database } from "../../src/db";
// import { Address } from 'web3x/address';
// import { Block, BlockHeader, BlockJson } from "@interstatejs/block";
// import { toHex, toInt } from "@interstatejs/utils/src/utils";
// import { toBuffer } from "ethereumjs-util";
// import VM from '@interstatejs/vm';
// const Trie = require('merkle-patricia-tree/secure');
// import IncomingTransactionListener from "../../src/parent-listeners/incoming-transaction-listener";
// import { ParentContext } from "../../src/lib/parent-context";
// import { convertHeaderForWeb3x } from "../../src/lib/web3x-adapters";
// import { SignedTransaction } from "@interstatejs/tx";
// import { randomHexBuffer, common, keccak256, StateTrie } from '@interstatejs/utils';
// import { privateToAddress } from 'ethereumjs-util';

// // function processBlock(transactions: )

// export class BadBlockBuilder {
//   private didRegisterTransaction = false;
//   private defaultBlock: BlockJson;

//   constructor(
//     public context: ParentContext,
//     public itxListener: IncomingTransactionListener
//   ) {}

//   async makeIncomingTransaction(_to?: Address) {
//     if (this.didRegisterTransaction) return;
//     const [from, to] = await this.context.eth.getAccounts();
//     await this.context.relay.methods.addTransaction(_to || to, 0, '0x')
//       .send({ from, value: 1e18 }).getReceipt();
//     this.didRegisterTransaction = true;
//   }

//   async setDefaultBlock() {
//     const [from] = await this.context.eth.getAccounts();
//     const header = new BlockHeader();
//     header.setGenesisParams();
//     const parentHash = header.hash();
//     header.number = toBuffer(1);
//     header.coinbase = from.toBuffer();
//     header.parentHash = parentHash;
//     header.timestamp = toBuffer(Date.now())
//     await this.makeIncomingTransaction();
//     const transactions = await this.itxListener.getIncomingTransactions(0, 2);
//     // console.log(transactions[0])
//     const block = new Block({ header, transactions });
//     const trie = new Trie();
//     const vm = new VM({ state: trie, produceWitness: true });
//     await vm.runBlock({ block, generate: true });
//     this.defaultBlock = block.toJSON();
//   }

//   async setBlockWithSignedTransaction() {
//     const [from] = await this.context.eth.getAccounts();
//     const header = new BlockHeader();
//     header.setGenesisParams();
//     const parentHash = header.hash();
//     header.number = toBuffer(1);
//     header.coinbase = from.toBuffer();
//     header.parentHash = parentHash;
//     header.timestamp = toBuffer(Date.now());
//     const privateKey = keccak256('private-key');
//     const address = privateToAddress(privateKey);
//     await this.context.relay.methods.addTransaction(
//       new Address(address), 0, '0x'
//     ).send({ from, value: 1e18 }).getReceipt();
//     const incomingTransactions = await this.itxListener.getIncomingTransactions(0, 10);
//     const contractAddress = incomingTransactions[0].from;
//     const signedTransaction = new SignedTransaction({
//       to: contractAddress,
//       gasLimit: 21000,
//       gasPrice: 5,
//       value: 1e16
//     });
//     signedTransaction.sign(privateKey);
    
//     const transactions = [...incomingTransactions, signedTransaction];
//     // console.log(transactions[0])
//     const block = new Block({ header, transactions });
//     const trie = new StateTrie().trie;
//     const vm = new VM({ state: trie, produceWitness: true });
//     await vm.runBlock({ block, generate: true });
//     this.defaultBlock = block.encodeJSON();
//   }

//   getDefaultBlock(): Block {
//     return new Block(this.defaultBlock)
//   }

//   async submitBlockBadIncomingTransactionIndex(): Promise<Block> {
//     console.log(`Submitting block with bad incoming transactions index.`);
//     const [from] = await this.context.eth.getAccounts();
//     const header = new BlockHeader();
//     header.setGenesisParams();
//     const parentHash = header.hash();
//     header.number = toBuffer(1);
//     header.coinbase = from.toBuffer();
//     header.parentHash = parentHash;
//     await this.makeIncomingTransaction();
//     const transactions = await this.itxListener.getIncomingTransactions(0, 2);
//     const block = new Block({ header, transactions });
//     const trie = new Trie();
//     const vm = new VM({ state: trie });
//     await vm.runBlock({ block, generate: true });
//     block.header.incomingTransactionsIndex = toBuffer(toInt(block.header.incomingTransactionsIndex) + 1);
//     const receipt = await this.context.peg.methods.submitBlock({
//       header: convertHeaderForWeb3x(block.header.encodeJSON()),
//       transactions: block.transactions.map(t => toHex(t.toRollup()))
//     }).send({ from, value: '0x2386f26fc10000' }).getReceipt();
//     console.log(`Submitted block with bad incoming transactions index.`);
//     // console.log(receipt.events)
//     return block;
//   }
// }