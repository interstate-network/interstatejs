/* External Imports */
import {
  AbstractLevelDOWN,
  AbstractOpenOptions,
  AbstractIterator,
} from 'abstract-leveldown'

/**
 * KeyValueStore represents a basic collection of key:value pairs.
 */
import { IteratorOptions, Iterator } from "./iterator.interface"
import { RangeBucket } from "./range-db.interface"
import { CheckpointEntity } from '../checkpoint-entity'

export type K = NonNullable<Buffer>

export type V = NonNullable<Buffer>

export interface KV {
  key: K
  value: V
}

export const PUT_BATCH_TYPE = 'put'
export const DEL_BATCH_TYPE = 'del'

export type Batch = PutBatch | DelBatch

export interface PutBatch {
  readonly type: 'put'
  readonly key: K
  readonly value: V
}

export interface DelBatch {
  readonly type: 'del'
  readonly key: K
}

/**
 * KeyValueStore represents a basic collection of key:value pairs.
 */
export interface KeyValueStore {
  /**
   * Queries the value at a given key.
   * @param key Key to query.
   * @returns the value at that key.
   */
  get(key: K): Promise<V>

  /**
   * Sets the value at a given key.
   * @param key Key to set.
   * @param value Value to set to.
   */
  put(key: K, value: V): Promise<void>

  /**
   * Deletes a given key.
   * @param key Key to delete.
   */
  del(key: K): Promise<void>

  /**
   * Checks whether a given key is set.
   * @param key Key to query.
   * @returns `true` if the key is set, `false` otherwise.
   */
  has(key: K): Promise<boolean>

  /**
   * Performs a series of operations in batch.
   * @param operations Operations to perform.
   */
  batch(operations: ReadonlyArray<Batch>): Promise<void>

  /**
   * Creates an iterator with some options.
   * @param options Parameters for the iterator.
   * @returns the iterator instance.
   */
  iterator?(options?: IteratorOptions): AbstractIterator<K, V> 

  /**
   * Creates a prefixed bucket underneath
   * this bucket.
   * @param prefix Prefix to use for the bucket.
   * @returns the bucket instance.
   */
  bucket(prefix: K): DB

  /**
   * Creates a prefixed range bucket underneath
   * this bucket.
   * @param prefix Prefix to use for the range bucket.
   * @returns the range bucket instance.
   */
  rangeBucket?(prefix: K): RangeBucket
}

export interface CPKVS extends KeyValueStore, CheckpointEntity {}

/**
 * Represents a key:value store.
 */
export interface DB extends KeyValueStore {
  /**
   * Opens the store.
   * @param [options] Database options.
   */
  open?(options?: AbstractOpenOptions): Promise<void>

  /**
   * Closes the store.
   */
  close?(): Promise<void>
}

export interface CPDB extends DB, CheckpointEntity {}

/**
 * Bucket are effectively databases that only perform operations
 * on keys that share a common `prefix`.
 */
// export interface Bucket extends KeyValueStore {
//   readonly prefix: K
// }

// export interface CPBucket extends Bucket, CheckpointEntity {
//   readonly db: KeyValueStore;
//   bucket(prefix: K): CPBucket
// }


