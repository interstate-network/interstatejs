import { ListenerDatabase } from "../db";
import { ParentContext } from "../lib/parent-context";
import { IncomingTransaction } from "@interstatejs/tx";
import {
  IncomingTransactionQueuedEventLog,
  ParentRelay
} from "@interstatejs/contracts";

import { EventListener } from './event-listener';
import { toBuffer } from "ethereumjs-util";

export interface IncomingTransactionListener {
  on(
    event: 'incoming-transaction',
    listener: (transaction: IncomingTransaction, blockNumber: number) => void
  ): this;
  getTransactionsCount(): Promise<number>;
  getIncomingTransactions(
    index?: number,
    count?: number
  ): Promise<IncomingTransaction[]>;
}

export class IncomingTransactionListener extends EventListener<
  ParentRelay,
  'IncomingTransactionQueued',
  IncomingTransactionQueuedEventLog
> {
  constructor(
    db: ListenerDatabase,
    private context: ParentContext
  ) {
    super(
      db,
      context.eth,
      context.relay,
      'IncomingTransactionQueued',
      async (log: IncomingTransactionQueuedEventLog) => this.handleIncomingTransactionQueuedLog(log));
  }

  private async convertIncomingTransactionLog(
    log: IncomingTransactionQueuedEventLog
  ): Promise<IncomingTransaction> {
    const { itxIndex, transaction } = log.returnValues;
    // console.log(transaction)
    let { from, to, gas, value, data } = transaction;
    let toBuf: Buffer;
    if (!to || to.toString() == `0x${'00'.repeat(20)}`) {
      /* Transaction is for a deployment */
      const code = await this.context.getArchivedCode(from, true);
      data = code;
      toBuf = Buffer.from('');
    } else {
      toBuf = toBuffer(to.toString());
    }
    return new IncomingTransaction({
      itxIndex: +itxIndex, // may not be necessary
      from: toBuffer(from.toString()),
      to: toBuf,
      gasLimit: +gas,
      value: +value,
      data
    })
  }

  private handleIncomingTransactionQueuedLog = async (log: IncomingTransactionQueuedEventLog) => {
    const tx = await this.convertIncomingTransactionLog(log);
    await this.db.putIncomingTransaction(tx);
    this.emit('incoming-transaction', tx, log.blockNumber);
  }

  async getTransactionsCount(): Promise<number> {
    return this.context.relay.methods.getTransactionsCount().call().then(
      (count) => +count
    );
  }

  /**
   * Retrieves past incoming transactions from a starting index until
   * a maximum number has been retrieved (if one is provided).
   * @param {number?} index Starting index - if not provided, will retrieve
   * all transactions.
   * @param {number?} count Maximum number of transactions - if not provided,
   * will retrieve all transactions after `index`.
   */
  async getIncomingTransactions(
    index?: number,
    count?: number
  ): Promise<IncomingTransaction[]> {
    let options = {};
    if (index != undefined) {
      if (!count) count = (await this.getTransactionsCount()) - index;
      const range = Object.keys(new Array(count).fill(null)).map(n => +n + index);
      options = {
        filter: { itxIndex: range },
        fromBlock: 0
      };
    }
    const logs = await this.context.relay.getPastEvents(
      'IncomingTransactionQueued', options
    );
    return Promise.all(logs.map(
      (log) => this.convertIncomingTransactionLog(log)
    ));
  }
}

export default IncomingTransactionListener;