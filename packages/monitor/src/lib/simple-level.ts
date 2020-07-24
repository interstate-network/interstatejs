import { AbstractLevelDOWN, AbstractIteratorOptions } from 'abstract-leveldown';
import levelup from 'levelup'
import leveldown from 'leveldown'
import MemDown from 'memdown'
const WriteStream = require('level-ws');
import path from 'path';
/**
 * Checks if an error is a NotFoundError.
 * @param err Error to check.
 * @return `true` if the error is a NotFoundError, `false` otherwise.
 */
const isNotFound = (err) => {
  if (!err) return false

  return (
    err.notFound ||
    err.type === 'NotFoundError' ||
    /not\s*found/i.test(err.message)
  )
}

export class LevelSideways extends levelup {
  constructor(db?: AbstractLevelDOWN | string) {
    if (db instanceof AbstractLevelDOWN) super(db);
    else if (typeof db == 'string') super(leveldown(db));
    else super(new MemDown());
  }

  async copy(_db?: LevelSideways | AbstractLevelDOWN | string, opts?: AbstractIteratorOptions): Promise<LevelSideways> {
    let db: LevelSideways;
    if (_db instanceof LevelSideways) db = _db;
    else db = new LevelSideways(_db);
    
    return new Promise((resolve, reject) => {
      const ws = WriteStream(db);
      ws.on('close', () => resolve(db));
      ws.on('error', (err) => reject(err));
      this.createReadStream(opts)
        .on('data', pair => ws.write(pair))
        .on('error', (err) => { reject(err); ws.end(); })
        .on('end', () => ws.end());
    })
  }
}

export type JsonBaseType = boolean | string | number | null | undefined;
interface JsonObject {
  [key: string]: JsonType
}
export type JsonType = JsonBaseType | Array<JsonType> | JsonObject;
export interface TransformableToJson {
  toJSON(key?: any): JsonType;
}
export type JsonLike = JsonType | TransformableToJson;

class SimpleLevel {
  db: LevelSideways;

  constructor(public name?: string, public dbPath?: string) {
    if (dbPath) this.db = new LevelSideways(path.join(dbPath, name));
    else this.db = new LevelSideways();
  }

  async copy(_db?: SimpleLevel, opts?: AbstractIteratorOptions) {
    const db = _db || new SimpleLevel();
    await this.db.copy(db.db, opts);
    return db;
  }

  async put(key: JsonBaseType, value: JsonType | TransformableToJson): Promise<void> {
    return new Promise((resolve, reject) => {
      const k = JSON.stringify(key);
      const v = JSON.stringify(value);
      this.db.put(k, v, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async get(key: JsonBaseType): Promise<any> {
    const k = JSON.stringify(key);
    return this.db.get(k).then(v => JSON.parse(v)).catch(err => {
      if (isNotFound(err)) return null;
      throw err
    });
  }

  open = (): Promise<void> => this.db.open();

  close = (): Promise<void> => this.db.close();
}

// class ScratchDB extends SimpleLevel {
//   constructor(private _upstream: SimpleLevel) {
//     super();
//   }

//   public get(key: JsonBaseType): Promise<any> {
//     return super.get(key).then((value) => {
//       if (value == null) return this._upstream.get(key);
//       return value;
//     })
//   }
// }

export default SimpleLevel;