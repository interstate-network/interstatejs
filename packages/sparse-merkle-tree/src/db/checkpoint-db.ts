import { DB, Batch } from "../types";
import { Cache } from "./cache";
import { BaseBucket } from "./bucket";

export class CheckpointDB implements DB {
  protected _checkpoints: Cache[] = [];

  get isCheckpoint(): boolean {
    return this._checkpoints.length > 0;
  }

  get db(): DB {
    if (this.isCheckpoint) {
      return this._checkpoints[this._checkpoints.length - 1];
    }
    return this._db;
  }

  constructor(protected _db: DB) {}

  checkpoint() {
    this._checkpoints.push(new Cache(this.db));
  }

  async commit(): Promise<void> {
    if (!this.isCheckpoint) {
      throw new Error('No checkpoints to commit.')
    }
    const cache = this._checkpoints.pop();
    await cache.flush();
  }

  async revert(): Promise<void> {
    if (!this.isCheckpoint) {
      throw new Error('No checkpoints to commit.')
    }
    const cache = this._checkpoints.pop();
    cache.clear();
  }

  public async has(key: Buffer): Promise<boolean> {
    return this.db.has(key);
  }

  public async get(key: Buffer): Promise<Buffer> {
    return this.db.get(key);
  }

  public async batch(operations: Batch[]): Promise<void> {
    return this.db.batch(operations);
  }

  public async put(key: Buffer, value: Buffer): Promise<void> {
    return this.db.put(key, value);
  }

  public async del(key: Buffer): Promise<void> {
    return this.db.del(key);
  }

  public bucket(prefix: Buffer): CheckpointDB {
    return new CheckpointDB(new Cache(new BaseBucket(this, prefix)));
  }
}

export default CheckpointDB;