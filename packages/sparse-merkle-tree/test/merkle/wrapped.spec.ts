import MemDown from "memdown";
import { expect } from 'chai'
import { BaseDB } from "../../dist"
import { randomHexBuffer, randomInt } from '../utils';
import { WrappedTree } from "../../dist/wrapped-tree";

describe('WrappedTree', async () => {
  let _db: MemDown<Buffer, Buffer>
  let db: BaseDB;
  let keys: Buffer[] = [];
  let values: Buffer[] = [];
  let root: Buffer;
  let baseRoot: Buffer;
  before(() => {
    _db = new MemDown()
    db = new BaseDB(_db)
    for (let i = 0; i < 20; i++) {
      keys.push(randomHexBuffer(20));
      values.push(randomHexBuffer(100));
    }

  });

  it('Makes a tree', async () => {
    const tree = await WrappedTree.create(db, undefined, 160);
    baseRoot = tree.EMPTY_ROOT
    tree.checkpoint()
    for (let i = 0; i < keys.length; i++) {
      await tree.update(keys[i], values[i]);
    }
    await tree.commit()
    root = tree.rootHash;
  });

  it('Makes a second tree', async () => {
    const tree = await WrappedTree.create(new BaseDB(_db), baseRoot, 160);
    for (let i = 0; i < keys.length; i++) {
      await tree.update(keys[i], values[i]);
    }
    expect(tree.rootHash.toString('hex')).eq(root.toString('hex'))
  })
})