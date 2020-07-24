import { AbstractLevelDOWN } from 'abstract-leveldown';
import levelup from 'levelup'
import leveldown from 'leveldown'
import MemDown from 'memdown'
import { isNotFound } from '../utils/db';
import { DB } from '../types/db';
import { BaseBucket } from './bucket';

export class BaseDB extends levelup<AbstractLevelDOWN<Buffer, Buffer>> implements DB {
  constructor(db?: AbstractLevelDOWN<Buffer, Buffer> | string) {
    super(
      !db
        ? new MemDown()
        : typeof db == 'string'
          ? Object.assign((leveldown(db) as any), { status: 'unknown' })
          : (db as any).status == undefined
            ? Object.assign(db, { status: 'unknown' })
            : db
    );
  }

  public get = async (k: Buffer): Promise<Buffer> => {
    return super.get(k).catch((err) => {
      if (isNotFound(err)) return undefined;
      throw err;
    })
  }

  public has = async (k: Buffer): Promise<boolean> => {
    return (await this.get(k)) !== undefined;
  }

  public bucket = (prefix: Buffer): BaseBucket => new BaseBucket(this, prefix);
}

export default BaseDB;