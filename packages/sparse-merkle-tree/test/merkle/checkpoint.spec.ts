import MemDown from 'memdown'
import assert from 'assert'
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { CheckpointDB } from '../../src/db/checkpoint-db';
import { BaseDB } from '../../src/db/db';
import { CheckpointTree } from '../../src/checkpoint-tree';
import { ZERO, ONE, BigNumber } from '../../src/types';
import { keccak256 } from '../../src/utils';
// import { MerkleTreeNode } from '../../src/types-needed';
// import { BaseDB } from '../../src/db/level-sw';
// import { calculateDefaultRoot } from '../../src/utils'
import { randomHexBuffer, randomInt } from '../utils';

const randomKey = () => new BigNumber(randomInt());

const assertNotHasValue = async (
  tree: CheckpointTree,
  key: BigNumber,
  message?: string
) => {
  const value = await tree.getLeaf(key);
  assert(
    value == undefined,
    message || `Found value ${value && value.toString('hex')} expected to be null for key ${key.toString('hex')}`
  )
}

const assertHasCorrectValue = async (
  tree: CheckpointTree,
  key: BigNumber,
  value: Buffer,
  message?: string
) => {
  const realValue = await tree.getLeaf(key);
  assert(
    realValue?.equals(value),
    message || `Incorrect value found at ${key.toString('hex')} - expected ${value.toString('hex')} but got ${realValue && realValue.toString('hex')}`
  )
}

const assertUpdate = async (
  tree: CheckpointTree,
  key: BigNumber,
  value: Buffer,
  message?: string
) => {
  assert(
    await tree.update(key, value),
    message || `Failed to write key ${key.toString('hex')} to tree`
  )
}

const dbPath = path.join(__dirname, 'tmp-db');

function mkDbDir() {
  rmDbDir();
  fs.mkdirSync(dbPath);
}

function rmDbDir() {
  if (fs.existsSync(dbPath)) rimraf.sync(dbPath);
}

async function makeTree(): Promise<[CheckpointDB, CheckpointTree]> {
  const db = new CheckpointDB(new BaseDB(new MemDown()));
  const tree = await CheckpointTree.create(db, undefined, 256);
  return [db, tree];
}

describe('Checkpoint Tree', async () => {
  it('Should revert the tree to the default state', async () => {
    const key = randomKey();
    const value = randomHexBuffer(32);
    const [db, tree] = await makeTree();
    tree.checkpoint();
    assert(await tree.update(key, value), "Failed to update tree with original value");
    await assertHasCorrectValue(tree, key, value, "Returned value did not match inserted value");
    await tree.revert();
    await assertNotHasValue(tree, key, "Returned value was not undefined after revert");
  });

  it('Should revert the tree to the previous state', async () => {
    const key = randomKey();
    const originalValue = randomHexBuffer(32);
    const testValue = randomHexBuffer(32);
    const [db, tree] = await makeTree();
    assert(await tree.update(key, originalValue), "Failed to update tree with original value");
    tree.checkpoint();
    assert(await tree.update(key, testValue), "Failed to update tree with original value");
    await assertHasCorrectValue(tree, key, testValue)
    await tree.revert();
    await assertHasCorrectValue(tree, key, originalValue, "Returned value was not original after revert")
  });

  it('Should update a value', async () => {
    const key = randomKey();
    const originalValue = randomHexBuffer(32);
    const testValue = randomHexBuffer(32);
    const [db, tree] = await makeTree();
    tree.checkpoint();
    tree.checkpoint();
    assert(await tree.update(key, originalValue), "Failed to update tree with original value");
    let retval = await tree.getLeaf(key);
    assert(retval.equals(originalValue), "Returned value did not match original value");
    tree.checkpoint();
    assert(await tree.update(key, testValue), "Failed to update tree with test value");
    await assertHasCorrectValue(tree, key, testValue)
    await tree.revert();
    await assertHasCorrectValue(tree, key, originalValue)
  });

  it('Should be able to set the root to an old committed state', async () => {
    const key = randomKey();
    const originalValue = randomHexBuffer(32);
    const testValue = randomHexBuffer(32);
    const [, tree] = await makeTree()
    tree.checkpoint()
    await tree.update(key, originalValue);
    await assertHasCorrectValue(tree, key, originalValue);
    await tree.commit();
    const root1 = tree.rootHash;
    tree.checkpoint();
    await tree.update(key, testValue);
    await assertHasCorrectValue(tree, key, testValue);
    const root2 = tree.rootHash;
    await tree.commit();
    await tree.setRoot(root1)
    await assertHasCorrectValue(tree, key, originalValue);
    await tree.setRoot(root2)
    await assertHasCorrectValue(tree, key, testValue);
  });

  it('Should work with root being reset', async () => {
    const key = randomKey();
    const originalValue = randomHexBuffer(32);
    const testValue = randomHexBuffer(32);
    let db = new CheckpointDB(new BaseDB());
    let tree = await CheckpointTree.create(db, undefined, 256);
    tree.checkpoint()
    await tree.update(key, originalValue);
    await assertHasCorrectValue(tree, key, originalValue);
    await tree.commit();
    const root1 = tree.rootHash;
    tree.checkpoint();
    await tree.setRoot({hash: tree.EMPTY_ROOT, value: undefined});
    await assertNotHasValue(tree, key);
    assert(await tree.update(key, testValue), "Failed to update tree");
    await assertHasCorrectValue(tree, key, testValue);
  })

  describe('subtree', async () => {
    before(() => {
      mkDbDir();
    });

    after(() => {
      rmDbDir();
    });

    it('Should update a value and revert the tree', async () => {
      const key = randomKey();
      const prefix = randomHexBuffer(32);
      const originalValue = randomHexBuffer(32);
      const testValue = randomHexBuffer(32);
      const [, _tree] = await makeTree()
      // let db = new BaseDB();
      // let tree = await CheckpointTree.create(new CheckpointDB(db), undefined, 256);
      const tree = await _tree.subTree(prefix);
      tree.checkpoint()
      await assertUpdate(tree, key, originalValue)
      await assertHasCorrectValue(tree, key, originalValue);
      await tree.commit();
      tree.checkpoint();
      await assertUpdate(tree, key, testValue);
      await assertHasCorrectValue(tree, key, testValue, "Test value not found");
      await tree.revert();
      // console.log(testValue.toString('hex'))
      await assertHasCorrectValue(tree, key, originalValue);
    });

  })

  // it('tests default root assignment', async () => {
  //   const _tree = await CheckpointTree.create(
  //     new CheckpointDB(new BaseDB(new BaseDB(), 256), 256),
  //     calculateDefaultRoot(256),
  //     256
  //   );

  //   assert(await _tree.update(key, originalValue), "Failed to update tree with original value");
  //   let retval = await _tree.getLeaf(key);
  //   assert(retval.equals(originalValue), "Returned value did not match original value");
  // })

  // it('Should checkpoint and revert the state', async () => {
  //   // tree.checkpoint();
  //   // await checkpoint()
  //   let retval = await tree.getLeaf(key);
  //   assert(
  //     retval.equals(originalValue),
  //     "Returned value did not match original value"
  //   );
  //   await checkpoint();
  //   assert(await tree.update(key, testValue), "Failed to update tree");
  //   retval = await tree.getLeaf(key);
  //   assert(retval.equals(testValue), "Returned value did not match test value");
  //   await tree.revert();
  //   retval = await tree.getLeaf(key);
  //   assert(retval && retval.equals(originalValue), "Returned value did not match original value");
  // });

  /* it('Should test the values with only the db', async () => {
    const _cdb = new BaseDB(new MemDown(), 256)
    const cp = await CheckpointTree.create(_cdb, undefined, 4);
    //  new CheckpointDB(_cdb, 256);
    cp.db.checkpoint()
    for (let node of testData) {
      await cp.db.put(node.nodeID, node.originalValue)
    }
    cp.db.checkpoint();
    for (let node of testData) {
      await cp.db.del(node.nodeID);
      await cp.db.put(
        node.nodeID,
        node.revertedLeafValue
      )
    }
    await cp.db.revert();
    for (let node of testData) {
      const val = await cp.db.get(node.nodeID);
      assert(val.equals(node.originalValue), "Value did not match original after revert");
      // console.log(`Did match original after revert: ${val.equals(node.originalDbValue)}`)
      console.log(`Matched original: ${val.equals(node.originalValue)}`)
      console.log(`Matched post: ${val.equals(node.postValue)}`)
      // console.log(`Matched original db: ${val.equals(node.originalDbValue)}`)
      // console.log(`Matched reverted db: ${val.equals(node.revertedDbValue)}`)
      // console.log(`Matched reverted leaf: ${node.revertedLeafValue}`)
    }
  }) */
  // it('Should checkpoint and revert', async () => {
  //   const db = new CheckpointDB(new BaseDB(new MemDown()));
  //   db.checkpoint();
  //   const key = Buffer.from('dis is me key');
  //   const value = Buffer.from('dis is no key is value');
  //   await db.db.put(key, value);
  //   const v = await db.db.get(key);
  //   assert(value.equals(v), "Returned value does not match original");
  //   await db.revert();
  //   const v2 = await db.db.get(key);
  //   assert(v2 == undefined, "Value was not undefined");
  // });

  // it('Should checkpoint and commit', async () => {
  //   const originalDB = new BaseDB(new MemDown());
  //   const db = new CheckpointDB(originalDB);
  //   db.checkpoint();
  //   const key = Buffer.from('dis is me key');
  //   const value = Buffer.from('dis is no key is value');
  //   await db.db.put(key, value);
  //   const v = await db.db.get(key);
  //   assert(value.equals(v), "Returned value does not match original");
  //   await db.commit();
  //   const v2 = await originalDB.get(key);
  //   assert(value.equals(v2), "Value did not propagate to base db");
  // });

  // it('Should work with nested checkpoints', async () => {
  //   const originalDB = new BaseDB(new MemDown());
  //   const db = new CheckpointDB(originalDB);
  //   db.checkpoint();
  //   const key = Buffer.from('dis is me key');
  //   const value = Buffer.from('dis is no key is value');
  //   await db.db.put(key, value);

  //   db.checkpoint();
  //   const value2 = Buffer.from('dis is not original value');
  //   await db.db.put(key, value2);

  //   let retVal = await db.db.get(key);
  //   assert(value2.equals(retVal), "Returned value does not match expected");

  //   await db.revert();
  //   retVal = await db.db.get(key);
  //   assert(value.equals(retVal), "Returned value does not match expected");

  //   await db.commit();
  //   retVal = await db.db.get(key);
  //   assert(value.equals(retVal), "Value did not propagate to base db");
  // });
});