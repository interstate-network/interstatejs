import { Batch, DB } from '../types';
import { NULL_BUFFER } from '../utils';

export class Cache implements DB {
  protected map: Map<string, Buffer> = new Map<string, Buffer>();

  constructor(protected db: DB) {}

  clear(): void {
    this.map.clear();
  }

  /**
   * Returns true if either the map or the underlying database
   * contains a non-null value for the key.
   * This uses the get method rather than the has functions of
   * the map and db because the map may contain an empty buffer
   * for the key, which indicates that it will be deleted.
   */
  public async has(key: Buffer): Promise<boolean> {
    const val = await this.get(key);
    return val !== undefined;
  }

  /**
   * Returns a value from the map if present; queries the underlying
   * database if no value is found. If the map contains a null buffer,
   * the item has been marked for deletion and get will return undefined.
   */
  public async get(key: Buffer): Promise<Buffer> {
    let k = key.toString('hex');
    let value = this.map.get(k);
    if (value !== undefined) {
      if (value.length == 0 /* || value.equals(NULL_BUFFER) */) return undefined;
      return value;
    }
    value = await this.db.get(key);
    if (value !== undefined) this.map.set(k, value);
    return value;
  }

  public async batch(operations: Batch[]): Promise<void> {
    await Promise.all(
      operations.map((op: Batch) => {
        if (op.type == 'put') return this.put(op.key, op.value)
        else this.del(op.key)
      })
    )
  }

  public async put(key: Buffer, value: Buffer): Promise<void> {
    this.map.set(key.toString('hex'), value)
  }

  public async del(key: Buffer): Promise<void> {
    this.map.set(key.toString('hex'), Buffer.alloc(0));
  }

  public async flush(): Promise<void> {
    const promises: Promise<void>[] = [];
    this.map.forEach((val: Buffer, key: string) => {
      promises.push(
        val.length == 0
        ? this.db.del(Buffer.from(key, 'hex'))
        : this.db.put(Buffer.from(key, 'hex'), val)
      )
    });
    await Promise.all(promises);
    this.map.clear()
  }

  public bucket(prefix: Buffer): Cache {
    const bucket = this.db.bucket(prefix);
    return new Cache(bucket); 
  }
}