import {
  BufferLike,
  toHex,
  toInt,
  last,
  getMerkleProof,
  sliceBuffer
 } from "@interstatejs/utils";
import { Block, BlockHeader } from "@interstatejs/block";
import { toBuffer } from "ethereumjs-util";
import {
  IncomingTransaction,
  Transaction,
  SignedTransaction
} from "@interstatejs/tx";
import { decodeBlockInput, encodePreviousRootProof } from "./coder";
import { Database } from "../db";
import {
  ErrorProof,
  HeaderCommitment,
  WithParent,
  TransactionInclusionProof
} from "./proof-types";
import { ProvableError, isEqual } from "./witness-auditors/helpers";

// interface IBlockchain {
//   getBlock(parentHash: BufferLike): Promise<Block>;
//   getStateTree(stateRoot: BufferLike): StateTree;
// }

interface IParentInterface {
  getIncomingTransactions(index: number, count: number): Promise<IncomingTransaction[]>;
  getTransactionsCount(): Promise<number>;
}

export class BlockAuditor {
  parent: Block;
  block: Block;
  transactions: Transaction[] = [];

  constructor(
    private blockchain: Database,
    private parentInterface: IParentInterface,
    public header: BlockHeader,
    public transactionsInput: string[]
  ) {}

  fail(error: ErrorProof) {
    throw new ProvableError(error);
  }

  static async auditBlockInput(
    blockchain: Database,
    parentInterface: IParentInterface,
    calldata: BufferLike,
    submittedAt: number,
    childIndex: number
  ): Promise<Block> {
    const { header, transactionsInput } = decodeBlockInput(calldata, submittedAt, childIndex);
    const auditor = new BlockAuditor(blockchain, parentInterface, header, transactionsInput);
    await auditor.checkHeader();
    await auditor.decodeTransactions();
    return auditor.block;
  }

  async getPreviousRootProof(transactionIndex: number): Promise<BufferLike> {
    if (transactionIndex == 0) {
      const parent = await this.blockchain.getBlock(this.block.header.parentHash);
      return encodePreviousRootProof(parent.header);
    }
    const transaction = this.block.transactions[transactionIndex - 1].toRollup();
    const siblings = this.block.proveTransaction(transactionIndex - 1);
    return encodePreviousRootProof({ transaction, siblings });
  }

  getTransactionProof(index: number): TransactionInclusionProof<BufferLike>  {
    const { siblings } = getMerkleProof(
      this.transactionsInput.map(tx => toBuffer(tx)), index
    );
    return {
      transaction: this.transactionsInput[index],
      transactionIndex: index,
      siblings
    };
  }

  getHeaderCommitment(): HeaderCommitment;
  getHeaderCommitment(withParent: true): HeaderCommitment & WithParent;
  getHeaderCommitment(withParent: false): HeaderCommitment;
  getHeaderCommitment(withParent?: boolean): HeaderCommitment | (HeaderCommitment & WithParent) {
    return {
      commitmentQuery: this.header.commitment.query,
      header: this.header.encodeJSON(),
      parent: withParent ? this.parent.header.encodeJSON() : undefined
    }
  }

  async checkHeader() {
    console.log(`Auditing header`)
    const parent = await this.blockchain.getBlock(this.header.parentHash);
    this.parent = parent;
    // Check incoming transactions index
    const index = toInt(this.header.incomingTransactionsIndex);
    const { incomingTransactionsIndex, incomingTransactionsCount } = parent.header;
    const expectedIndex = toInt(incomingTransactionsIndex) + toInt(incomingTransactionsCount);
    if (index != expectedIndex) this.fail({
      _type: 'INCOMING_TRANSACTIONS_INDEX',
      ...(this.getHeaderCommitment(true))
    });
    const maximum = await this.parentInterface.getTransactionsCount();
    const total = index + toInt(this.header.incomingTransactionsCount);
    if (total > maximum) this.fail({
      _type: 'INCOMING_TRANSACTIONS_OUT_OF_RANGE',
      ...(this.getHeaderCommitment(true))
    });
    // INCOMING_TRANSACTIONS_OUT_OF_RANGE
    // Check timestamp
    if (
      toInt(this.header.timestamp) <= toInt(parent.header.timestamp)
    ) this.fail({
      _type: 'BLOCK_TIMESTAMP',
      ...(this.getHeaderCommitment(true))
    });
    // Check block number
    if (
      toInt(this.header.number) != toInt(parent.header.number) + 1
    ) this.fail({
      _type: 'BLOCK_NUMBER',
      ...(this.getHeaderCommitment(true))
    });
    // Check state root
    const lastTransaction = last(this.transactionsInput);
    const expectedStateRoot = lastTransaction.slice(-64);
    if (toHex(this.header.stateRoot) != toHex(expectedStateRoot)) {
      this.fail({
        _type: 'BLOCK_STATE_ROOT',
        ...(this.getHeaderCommitment()),
        ...(this.getTransactionProof(this.transactionsInput.length - 1))
      });
    }
  }

  async decodeTransactions() {
    const originalIncoming = await this.parentInterface.getIncomingTransactions(
      toInt(this.header.incomingTransactionsIndex),
      toInt(this.header.incomingTransactionsCount)
    );
    for (let i = 0; i < this.transactionsInput.length; i++) {
      const txData = toBuffer(this.transactionsInput[i]);
      if (i < toInt(this.header.incomingTransactionsCount)) {
        if (txData.byteLength != 32) {
          this.fail({
            _type: 'INCOMING_TX_ENCODING',
            ...this.getHeaderCommitment(),
            ...this.getTransactionProof(i)
          });
        }
        originalIncoming[i].stateRoot = txData;
        this.transactions.push(originalIncoming[i]);
      } else {
        try {
          const rootPtr = txData.length - 32;
          const encodedTx = sliceBuffer(txData, 0, rootPtr);
          const stateRoot = sliceBuffer(txData, rootPtr, 32);
          const tx = new SignedTransaction(encodedTx);
          tx.stateRoot = stateRoot;
          if (!tx.verifySignature()) {
            console.log(`Caught Transaction Signature Error`);
            this.fail({
              _type: 'TX_SIGNATURE',
              ...(this.getHeaderCommitment()),
              ...this.getTransactionProof(i)
            });
          }
          if (isEqual(tx.to, 0)) {
            this.fail({
              _type: 'INVALID_CREATE_TX',
              ...(this.getHeaderCommitment()),
              ...this.getTransactionProof(i)
            })
          }
          this.transactions.push(tx);
        } catch(err) {
          if (err instanceof ProvableError) throw err;
          console.log(`Caught Signed Transaction Decoding Error`);
          if (err.message.includes('Incompatible EIP155-based V 100')) {
            this.fail({
              _type: 'TX_SIGNATURE',
              ...(this.getHeaderCommitment()),
              ...this.getTransactionProof(i)
            });
          } else {
            this.fail({
              _type: 'SIGNED_TX_ENCODING',
              ...this.getHeaderCommitment(),
              ...this.getTransactionProof(i)
            });
          }
        }
      }
    }
    this.block = new Block({
      header: this.header,
      transactions: this.transactions
    });
  }
}