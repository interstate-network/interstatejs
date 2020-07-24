import MemDown from 'memdown'
import assert from 'assert'
import { CheckpointDB } from '../../src/db/checkpoint-db';
import { BaseDB } from '../../src/db/db';
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { randomHexBuffer } from '../utils';
import { CPKVS, KeyValueStore } from '../../src/types';
const dbPath = path.join(__dirname, 'tmp-db');

function mkDbDir() {
  rmDbDir();
  fs.mkdirSync(dbPath);
}

function rmDbDir() {
  if (fs.existsSync(dbPath)) rimraf.sync(dbPath);
}

async function assertNotHasValue(
  db: KeyValueStore,
  key: Buffer,
  message?: string
) {
  const value = await db.get(key)
  assert(
    value == undefined,
    message || `Found value ${value && value.toString('hex')} expected to be null for key ${key.toString('hex')}`
  )
}

async function assertHasCorrectValue(
  db: KeyValueStore,
  key: Buffer,
  value: Buffer,
  message?: string
) {
  const realValue = await db.get(key);
  assert(
    realValue?.equals(value),
    message || `Incorrect value found at ${key.toString('hex')} - expected ${value.toString('hex')}`
  )
}

function makeDB(): [BaseDB, CheckpointDB] {
  const originalDB = new BaseDB(new MemDown());
  const db = new CheckpointDB(originalDB);
  return [originalDB, db];
}

async function test_Checkpoint_Put_Revert() {
  const [baseDB, db] = makeDB();
  db.checkpoint();
  const key = randomHexBuffer(32);
  const value = randomHexBuffer(64);
  await db.put(key, value);
  await assertNotHasValue(baseDB, key);
  await assertHasCorrectValue(db, key, value);
  await db.revert();
  await assertNotHasValue(db, key);
  await assertNotHasValue(baseDB, key);
}

async function test_Put_Checkpoint_Del_Revert() {
  const [baseDB, db] = makeDB();
  db.checkpoint();
  const key = randomHexBuffer(32);
  const value = randomHexBuffer(64);
  await db.put(key, value);
  await assertNotHasValue(baseDB, key, `Found kv pair in base db`);
  await assertHasCorrectValue(db, key, value, `Found incorrect value in db`);
  db.checkpoint();
  await db.del(key);
  await assertNotHasValue(db, key, `Found deleted value in db`);
  await db.revert();
  await assertHasCorrectValue(db, key, value, `Found incorrect value in db after revert`);
  await db.revert();
  await assertNotHasValue(db, key);
  await assertNotHasValue(baseDB, key);
}

describe('Checkpoint Database', async () => {
  describe('insert', async  () => {
    it('Does not propagate insertions to the base db while checkpointed', async () => {
      const [baseDB, db] = makeDB();
      db.checkpoint();
      const key = randomHexBuffer(32);
      const value = randomHexBuffer(64);
      await db.put(key, value);
      await assertNotHasValue(baseDB, key);
      await db.revert();
      await baseDB.close()
    });

    it('Does propagate insertions to the base db on commit', async () => {
      const [baseDB, db] = makeDB();
      db.checkpoint();
      const key = randomHexBuffer(32);
      const value = randomHexBuffer(64);
      await db.put(key, value);
      await assertNotHasValue(baseDB, key);
      await db.commit();
      await assertHasCorrectValue(baseDB, key, value);
      await baseDB.close()
    });
  });

  describe('delete', async () => {
    it('Does not propagate deletions to the base db while checkpointed', async () => {
      const [baseDB, db] = makeDB();
      const key = randomHexBuffer(32);
      const value = randomHexBuffer(64);
      await baseDB.put(key, value)
      db.checkpoint();
      await db.del(key);
      await assertHasCorrectValue(baseDB, key, value);
      await assertNotHasValue(db, key);
      await db.revert();
      await baseDB.close()
    });

    it('Does propagate deletions to the base db after commit', async () => {
      const [baseDB, db] = makeDB();
      const key = randomHexBuffer(32);
      const value = randomHexBuffer(64);
      await baseDB.put(key, value)
      db.checkpoint();
      await db.del(key);
      await assertHasCorrectValue(baseDB, key, value);
      await assertNotHasValue(db, key);
      await db.commit();
      await assertNotHasValue(baseDB, key);
      await baseDB.close()
    });
  });

  describe('buckets', async () => {
    describe('insert', async  () => {
      it('Does not propagate insertions to the container db while checkpointed', async () => {
        const [baseDB, db] = makeDB();
        const prefix = randomHexBuffer(32);
        const bucket = db.bucket(prefix);
        const key = randomHexBuffer(32);
        const value = randomHexBuffer(64);
        const prefixedKey = Buffer.concat([prefix, key]);
        bucket.checkpoint();
        await bucket.put(key, value);
        await assertHasCorrectValue(bucket, key, value);
        await assertNotHasValue(db, prefixedKey);
        await bucket.revert();
        await assertNotHasValue(bucket, key);
        await baseDB.close()
      });
  
      it('Does propagate insertions to the container db on commit', async () => {
        const [baseDB, db] = makeDB();
        const prefix = randomHexBuffer(32);
        const bucket = db.bucket(prefix);
        const key = randomHexBuffer(32);
        const value = randomHexBuffer(64);
        const prefixedKey = Buffer.concat([prefix, key]);
        bucket.checkpoint();
        await bucket.put(key, value);
        await assertHasCorrectValue(bucket, key, value);
        await assertNotHasValue(db, prefixedKey);
        await bucket.commit();
        await assertHasCorrectValue(db, prefixedKey, value);
        await baseDB.close()
      });
  
      // it('Does revert when container db reverts', async () => {
      //   const [baseDB, db] = makeDB();
      //   const prefix = randomHexBuffer(32);
      //   const bucket = db.bucket(prefix);
      //   const key = randomHexBuffer(32);
      //   const value = randomHexBuffer(64);
      //   const prefixedKey = Buffer.concat([prefix, key]);
      //   bucket.checkpoint()
      //   await bucket.put(key, value);
      //   await assertHasCorrectValue(bucket, key, value);
      //   await assertHasCorrectValue(db, prefixedKey, value);
      //   await db.revert();
      //   await assertNotHasValue(db, prefixedKey);
      //   await assertNotHasValue(bucket, key);
      //   await baseDB.close()
      // });
    });
  });
  it('Should keep new values when committing', async () => {
    const originalDB = new BaseDB(new MemDown());
    const db = new CheckpointDB(originalDB);
    db.checkpoint();
    const key = Buffer.from('dis is me key');
    const value = Buffer.from('dis is no key is value');
    await db.put(key, value);
    const v = await db.get(key);
    assert(value.equals(v), "Returned value does not match original");
    await db.commit();
    const v2 = await originalDB.get(key);
    assert(value.equals(v2), "Value did not propagate to base db");
    await originalDB.close()
  });

  it('Should delete removed values when committing', async () => {
    const originalDB = new BaseDB(new MemDown());
    const db = new CheckpointDB(originalDB);
    db.checkpoint();
    const key = Buffer.from('dis is me key');
    const value = Buffer.from('dis is no key is value');
    await db.put(key, value);
    assert(
      (await db.get(key)).equals(value),
      "Returned value does not match original"
    );
    await db.del(key);
    assert(
      (await db.get(key)) == null,
      "Returned value does not match original"
    );
    await db.commit();
    assert(
      (await db.get(key)) == null,
      "Returned value does not match original"
    );
    // const v2 = await originalDB.get(key);
    // assert(value.equals(v2), "Value did not propagate to base db");
    await originalDB.close()
  });

  it('Should work with nested checkpoints', async () => {
    const originalDB = new BaseDB(new MemDown());
    const db = new CheckpointDB(originalDB);
    db.checkpoint();
    const key = Buffer.from('dis is me key');
    const value = Buffer.from('dis is no key is value');
    await db.put(key, value);

    db.checkpoint();
    const value2 = Buffer.from('dis is not original value');
    await db.put(key, value2);

    let retVal = await db.get(key);
    assert(value2.equals(retVal), "Returned value does not match expected");

    await db.revert();
    retVal = await db.get(key);
    assert(value.equals(retVal), "Returned value does not match expected");

    await db.commit();
    retVal = await originalDB.get(key);
    assert(value.equals(retVal), "Value did not propagate to base db");

    db.checkpoint();
    await db.del(key);
    retVal = await db.get(key);
    assert(retVal == null, "Value was not deleted");
    await db.revert();
    retVal = await db.get(key);
    assert(value.equals(retVal), "Value deletion propagated through revert");
    await originalDB.close()
  });

  it('Should work with nested checkpoints 2', async () => {
    const originalDB = new BaseDB(new MemDown());
    const db = new CheckpointDB(originalDB);
    db.checkpoint();
    const key = Buffer.from('dis is me key');
    const key2 = Buffer.from('dis is me second key');
    const value = Buffer.from('dis is no key is value');
    const value2 = Buffer.from('dis is not original value');
    await db.put(key, value);
    assert(
      (await db.get(key)).equals(value),
      "Value did not match after first update"
    )
    await db.put(key2, value2);
    assert(
      (await db.get(key2)).equals(value2),
      "Value did not match after first update"
    )
    db.checkpoint();

    
    await db.del(key)
    await db.del(key2)
    assert(
      (await db.get(key)) == null,
      "Value was not deleted after second update"
    )
    assert(
      (await db.get(key2)) == null,
      "Value was not deleted after second update"
    )
    await db.revert()
    assert(
      (await db.get(key)).equals(value),
      "Value did not match after third update"
    )
    await originalDB.close()
  });

  it('Should work with a bucket', async () => {
    const originalDB = new BaseDB(new MemDown());
    const db = new CheckpointDB(originalDB);
    const bucket = db.bucket(Buffer.from('test-prefix'));
    const key = Buffer.from('dis is me key');
    const key2 = Buffer.from('dis is me second key');
    const value = Buffer.from('dis is no key is value');
    const value2 = Buffer.from('dis is not original value');
    bucket.checkpoint();
    await bucket.put(key, value);
    await assertHasCorrectValue(bucket, key, value, "Value in bucket did not match value set")
    await bucket.revert()
    await assertNotHasValue(bucket, key, "Value still present after revert")
  });
});