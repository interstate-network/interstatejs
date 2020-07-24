import { Database } from "../db";
import { ParentContext } from "../lib/parent-context";
import { BlockConfirmedEventLog, ChainPeg } from "@interstatejs/contracts";
import { EventListener } from './event-listener';

export class BlockConfirmationListener extends EventListener<
  ChainPeg,
  'BlockConfirmed',
  BlockConfirmedEventLog
> {
  constructor(
    private database: Database,
    private context: ParentContext
  ) {
    super(
      database.listenerDB,
      context.eth,
      context.peg,
      'BlockConfirmed',
      async (log: BlockConfirmedEventLog) => this.handleBlockConfirmedLog(log)
    );
  }

  async handleBlockConfirmedLog(log: BlockConfirmedEventLog) {
    // console.log(`Got block confirmation`);
    // console.log(log.returnValues);
    const { returnValues: { blockHash } } = log;
    const block = await this.database.getBlock(blockHash);
    block.header.commitment.isConfirmed = true;
    await this.database.putBlock(block);
    this.emit('block-confirmed', block);
  }
}

export default BlockConfirmationListener;