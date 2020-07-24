import SimpleLevel from "../lib/simple-level";
import { IncomingTransaction, IncomingTransactionJson } from "@interstatejs/tx";

export class IncomingTransactionsDatabase extends SimpleLevel {
  length?: number;

  constructor(dbPath?: string) {
    super('incoming-transactions', dbPath);
  }

  static async create(dbPath?: string): Promise<IncomingTransactionsDatabase> {
    const db = new IncomingTransactionsDatabase(dbPath);
    await db.init();
    return db;
  }

  async init() {
    let len = await super.get('length');
    if (isNaN(len)) {
      len = 0;
      await super.put('length', len);
    }
    this.length = len;
  }

  async put(index: number, value: IncomingTransaction): Promise<void> {
    if (index >= this.length) {
      this.length++;
      await super.put('length', this.length);
    }
    return super.put(index, value);
  }

  async get(index: number): Promise<IncomingTransaction> {
    const json = await super.get(index);
    if (json == null) return null;
    return new IncomingTransaction(<IncomingTransactionJson> json);
  }
}

export default IncomingTransactionsDatabase;