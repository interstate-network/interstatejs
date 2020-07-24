import SimpleLevel from "../lib/simple-level";
import { IncomingTransaction } from "@interstatejs/tx";
import { toInt } from "@interstatejs/utils/src/utils";
import { IncomingTransactionsDatabase } from './incoming-transactions-database';
import ChallengeDatabase from "./challenge-database";

export class ListenerDatabase extends SimpleLevel {
  incomingTransactions: IncomingTransactionsDatabase;
  challenges: ChallengeDatabase;

  // challenges: 

  constructor(dbPath?: string) {
    super('listener', dbPath);
  }

  static async create(dbPath?: string): Promise<ListenerDatabase> {
    const db = new ListenerDatabase(dbPath);
    db.incomingTransactions = await IncomingTransactionsDatabase.create(dbPath);
    db.challenges = new ChallengeDatabase(dbPath);
    return db;
  }

  async getLatestBlockNumberForEvent(event: string): Promise<number | null> {
    return this.get(`latest-${event}`);
  }

  async updateLatestBlockNumberForEvent(event: string, n: number): Promise<void> {
    if ((await this.getLatestBlockNumberForEvent(event)) < n) {
      await this.put(`latest-${event}`, n);
    }
  }

  async getIncomingTransaction(index: number): Promise<IncomingTransaction> {
    // if (index >= this.incomingTransactions.length) {
    //   throw new Error(`Index ${index} out of range - db has ${this.incomingTransactions.length} transactions.`);
    // }
    return this.incomingTransactions.get(index);
  }

  putIncomingTransaction(
    transaction: IncomingTransaction, index?: number
  ): Promise<void> {
    if (index == undefined) index = toInt(transaction.itxIndex);
    if (index == undefined) throw new Error(`Must provide incoming transaction index.`);
    return this.incomingTransactions.put(index, transaction);
  }

  /**
   * Will throw if any of the transactions do not have `itxIndex` set.
   */
  async putIncomingTransactions(transactions: IncomingTransaction[]): Promise<void> {
    await Promise.all(transactions.map(tx => this.putIncomingTransaction(tx)));
  }
}

export default ListenerDatabase;