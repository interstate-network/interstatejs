import { Database } from "../db";
import { ParentContext } from "../lib/parent-context";
import { ChallengeResponseEventLog, ChainPeg, ChallengeResponseEvent } from "@interstatejs/contracts";
import { ChallengeResponseData } from '@interstatejs/block';
import { EventListener } from './event-listener';
import { toInt } from "@interstatejs/utils";

export interface ChallengeResponseListener {
  on(event: 'challenge-response', listener: (data: ChallengeResponseData) => void): this;
}

export class ChallengeResponseListener extends EventListener<
  ChainPeg,
  'ChallengeResponse',
  ChallengeResponseEventLog
> {
  constructor(
    private database: Database,
    private context: ParentContext
  ) {
    super(
      database.listenerDB,
      context.eth,
      context.peg,
      'ChallengeResponse',
      async (log: ChallengeResponseEventLog) => this.handleChallengeResponseLog(log)
    );
  }

  private async handleChallengeResponseLog(log: ChallengeResponseEventLog) {
    // console.log(`Got challenge response`);
    // console.log(log.returnValues);
    const { blockHash, transactionIndex, witness } = log.returnValues;
    const response: ChallengeResponseData = {
      blockHash,
      transactionIndex: toInt(transactionIndex),
      witness,
      blockNumber: log.blockNumber
    };
    await this.database.listenerDB.challenges.putChallengeResponse(blockHash, response);
    this.emit('challenge-response', response);
  }
}

export default ChallengeResponseListener;