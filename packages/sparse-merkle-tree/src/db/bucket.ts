import { DB, Iterator, IteratorOptions, RangeBucket, Batch } from '../types/db';
import { AbstractLevelDOWN } from 'abstract-leveldown';
import { keccak256 } from '../utils';


export class BaseBucket implements DB {
  constructor(
    public db: DB,
    public prefix: Buffer
  ) {
  }

  /**
   * Queries the value at a given key.
   * @param key Key to query.
   * @returns the value at that key.
   */
  public async get(key: Buffer): Promise<Buffer> {
    return this.db.get(this.addPrefix(key))
  }

  /**
   * Sets the value at a given key.
   * @param key Key to set.
   * @param value Value to set to.
   */
  public async put(key: Buffer, value: Buffer): Promise<void> {
    return this.db.put(this.addPrefix(key), value)
  }

  /**
   * Deletes a given key.
   * @param key Key to delete.
   */
  public async del(key: Buffer): Promise<void> {
    return this.db.del(this.addPrefix(key))
  }

  /**
   * Checks whether a given key is set.
   * @param key Key to query.
   * @returns `true` if the key is set, `false` otherwise.
   */
  public async has(key: Buffer): Promise<boolean> {
    return this.db.has(this.addPrefix(key))
  }

  /**
   * Performs a series of operations in batch.
   * @param operations Operations to perform.
   */
  public async batch(operations: ReadonlyArray<Batch>): Promise<void> {
    return this.db.batch(
      operations.map((op) => {
        return {
          ...op,
          key: this.addPrefix(op.key),
        }
      })
    )
  }

  /**
   * Creates a prefixed bucket underneath
   * this bucket.
   * @param prefix Prefix to use for the bucket.
   * @returns the bucket instance.
   */
  public bucket(prefix: Buffer): BaseBucket {
    return new BaseBucket(
      this,
      keccak256(this.addPrefix(prefix))
    );
  }

  /**
   * Creates a prefixed range bucket underneath
   * this bucket.
   * @param prefix Prefix to use for the bucket.
   * @returns the range bucket instance.
   */
  public rangeBucket(prefix: Buffer): RangeBucket {
    return this.db.rangeBucket(this.addPrefix(prefix))
  }

  /**
   * Concatenates some value to this bucket's prefix.
   * @param value Value to concatenate.
   * @returns the value concatenated to the prefix.
   */
  private addPrefix(value: Buffer): Buffer {
    return value !== undefined
      ? Buffer.concat([this.prefix, value])
      : this.prefix
  }
}