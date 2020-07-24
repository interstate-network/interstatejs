import { ListenerDatabase } from "../db";
import { ParentContext } from "../lib/parent-context";
import { BlockSubmittedEventLog, ChainPeg } from "@interstatejs/contracts";
import { TransactionResponse } from "web3x/formatters";
import { EventListener } from './event-listener';

export interface BlockSubmissionData {
  calldata: string;
  submittedAt: number;
  childIndex: number;
  blockHash: string;
}

export class BlockSubmissionListener extends EventListener<
  ChainPeg,
  'BlockSubmitted',
  BlockSubmittedEventLog
> {
  constructor(
    db: ListenerDatabase,
    private context: ParentContext
  ) {
    super(
      db,
      context.eth,
      context.peg,
      'BlockSubmitted',
      async (log: BlockSubmittedEventLog) => this.handleBlockSubmittedLog(log)
    );
  }

  async handleBlockSubmittedLog(log: BlockSubmittedEventLog) {
    const {
      blockNumber,
      transactionHash,
      returnValues: { childIndex, blockHash }
    } = log;
    // console.log(`Got block submitted`);
    // console.log(log.returnValues);
    // Typescript complaints -- I don't think these can actually be empty.
    if (!transactionHash || !blockNumber || !childIndex) {
      throw new Error(`Missing field in BlockSubmittedEventLog`);
    }
    const tx: TransactionResponse = await this.context.eth.getTransaction(transactionHash);
    const event = {
      calldata: tx.input,
      submittedAt: blockNumber,
      childIndex: +childIndex,
      blockHash
    }
    this.emit('block-submitted', event);
  }
}

export default BlockSubmissionListener;