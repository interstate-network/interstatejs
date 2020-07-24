import { Database } from "../db";
import { ParentContext } from "../lib/parent-context";
import { BlockChallengeEvent, BlockChallengeEventLog, ChainPeg } from "@interstatejs/contracts";
import { EventListener } from './event-listener';
import { TransactionChallengeData } from '@interstatejs/block';
import { toInt, toHex } from "@interstatejs/utils";

export interface BlockChallengeListener {
  on(event: 'block-challenged', listener: (data: TransactionChallengeData) => void): this;
}

export class BlockChallengeListener extends EventListener<
  ChainPeg,
  'BlockChallenge',
  BlockChallengeEventLog
> {
  constructor(
    private database: Database,
    private context: ParentContext
  ) {
    super(
      database.listenerDB,
      context.eth,
      context.peg,
      'BlockChallenge',
      async (log: BlockChallengeEventLog) => this.handleBlockChallengeLog(log)
    );
  }

  private async handleBlockChallengeLog(log: BlockChallengeEventLog) {
    // console.log(`Got block challenge`);
    // console.log(log.returnValues);
    const { blockHash, transactionIndex, challenger } = log.returnValues;
    const challenge: TransactionChallengeData = {
      blockHash,
      transactionIndex: toInt(transactionIndex),
      blockNumber: log.blockNumber,
      challenger: toHex(challenger.toBuffer())
    };
    await this.database.listenerDB.challenges.putTransactionChallenge(blockHash, challenge);
    this.emit('block-challenged', challenge);
  }
}

export default BlockChallengeListener;