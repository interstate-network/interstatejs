import { BaseTree } from "./base-tree";
// import { Cache } from "./db";
import { DB, MerkleTreeNode, CheckpointMerkleTree } from './types';
import { CheckpointDB } from './db/checkpoint-db';

export class CheckpointTree extends BaseTree implements CheckpointMerkleTree {
  public db: CheckpointDB;
  protected _checkpoints: MerkleTreeNode[] = [];

  public get isCheckpoint(): boolean {
    return this._checkpoints.length > 0;
  }

  constructor(db: DB, height?: number) {
    super(
      (db instanceof CheckpointDB) ? db : new CheckpointDB(db),
      height
    );
  }

  static async create(
    db: DB,
    rootHash?: Buffer,
    height?: number
  ): Promise<CheckpointTree> {
    const tree = new CheckpointTree(db, height);
    await tree.init(rootHash);
    return tree;
  }

  public checkpoint() {
    this._checkpoints.push(this.getRoot());
    this.db.checkpoint();
  }

  public async commit(): Promise<void> {
    if (!this.isCheckpoint) {
      throw new Error('No checkpoints to commit.')
    }
    const lastRoot = this._checkpoints.pop();
    await this.db.commit();
    const { hash, value } = this.getRoot();
    if (!lastRoot.hash.equals(hash)) {
      await this.db.put(hash, value);
    }
  }

  public async revert(): Promise<void> {
    if (!this.isCheckpoint) {
      throw new Error('No checkpoints to commit.')
    }
    const root = this._checkpoints.pop();
    this.root = root;
    await this.db.revert();
    // await this.setRoot(root);
  }

  public subTree(prefix: Buffer, root?: Buffer, height?: number): Promise<CheckpointTree> {
    const bucket: any = this.db.bucket(prefix);
    return CheckpointTree.create(
      bucket as CheckpointDB,
      root || undefined,
      height
    );
  }
}

export default CheckpointTree;