import { AbstractIteratorOptions } from "abstract-leveldown";
import { DB, V, K, KV } from "./db.interface";
import { RangeEntry } from './range-db.interface'

export interface IteratorOptions extends AbstractIteratorOptions {
  gte?: K
  lte?: K
  gt?: K
  lt?: K
  reverse?: boolean
  limit?: number
  keys?: boolean
  values?: boolean
  keyAsBuffer?: boolean
  valueAsBuffer?: boolean
  prefix?: Buffer
}

/**
 * Iterators traverse over ranges of keys.
 * Iterators operate on a *snapshot* of the store
 * and not on the store itself. As a result,
 * the iterator is not impacted by writes
 * made after the iterator was created.
 */
export interface Iterator {
  readonly db: DB

  /**
   * Advances the iterator to the next key.
   * @returns the entry at the next key.
   */
  next(): Promise<{ key: K; value: V }>

  /**
   * Seeks the iterator to the target key.
   * @param target Key to seek to.
   */
  seek(target: K): Promise<void>

  /**
   * Executes a function for each key:value
   * pair in the iterator.
   * @param cb Function to be executed.
   */
  each(cb: (key: Buffer, value: Buffer) => any): Promise<void>

  /**
   * @returns the items in the iterator.
   */
  items(): Promise<KV[]>

  /**
   * @returns all keys in the iterator.
   */
  keys(): Promise<K[]>

  /**
   * @returns all values in the iterator.
   */
  values(): Promise<V[]>

  /**
   * Ends iteration and frees resources.
   */
  end(): Promise<void>
}

export interface RangeIterator extends Iterator {
  nextRange(): Promise<RangeEntry>
}