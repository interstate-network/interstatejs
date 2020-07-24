import { CheckpointTree } from "./checkpoint-tree";
import { BigNumber } from "./types/number";
import {
  WrappedMerkleTree, MerkleTreeInclusionProof, MerkleUpdate, BufferizedInclusionProof, BufferizedUpdate, BufferizedSparseInclusionProof, MerkleTreeNode
} from './types/merkle-tree';
import { CheckpointDB, BaseDB } from "./db";
import { copyBuffer, getDefaultRoot, NULL_BUFFER } from "./utils";
import MemDown from "memdown";
import { DB } from "./types";
import { AbstractLevelDOWN } from "abstract-leveldown";

const toBN = (buf: Buffer) => new BigNumber(buf, 'hex', 'B');

export type DBType = string | DB | CheckpointDB | AbstractLevelDOWN;

export function toCheckpointDb(db: DBType): CheckpointDB {
  if (db instanceof CheckpointDB) return db;
  if (
    db instanceof AbstractLevelDOWN ||
    typeof db == 'string'
  ) return new CheckpointDB(new BaseDB(db))
  return new CheckpointDB(db);
}

/**
 * Swaps the use of BigNumber with buffers.
 */
export class WrappedTree implements WrappedMerkleTree {
  constructor(
    protected db: CheckpointDB = new CheckpointDB(new BaseDB()),
    protected tree?: CheckpointTree,
    protected height: number = 160
  ) {
    if (!tree) this.tree = new CheckpointTree(db, height);
  }

  public static async create(
    _db: DBType = new BaseDB(),
    rootHash?: Buffer,
    height: number = 160
  ): Promise<WrappedTree> {
    const db = toCheckpointDb(_db);
    const tree = await CheckpointTree.create(db, rootHash, height);
    return new WrappedTree(db, tree, height);
  }

  public static get emptyBuffer(): Buffer {
    return copyBuffer(NULL_BUFFER);
  }

  public get rootHash(): Buffer {
    return this.tree.rootHash;
  }

  public get EMPTY_ROOT(): Buffer {
    return getDefaultRoot(this.height);
  }

  /* Checkpoints */
  public get isCheckpoint(): boolean {
    return this.tree.isCheckpoint;
  }

  public getRoot(): MerkleTreeNode {
    return this.tree.getRoot();
  }

  public checkpoint(): void {
    this.tree.checkpoint();
  }

  public commit(): Promise<void> {
    return this.tree.commit();
  }

  public revert(): Promise<void> {
    return this.tree.revert();
  }

  /* Database Interactions */
  public async getRaw(key: Buffer): Promise<Buffer> {
    return this.db.get(key);
  }

  public async putRaw(key: Buffer, value: Buffer): Promise<void> {
    await this.db.put(key, value);
  }

  /* Tree Queries */
  async checkRoot(rootHash: Buffer): Promise<boolean> {
    return this.tree.checkRoot(rootHash);
  }

  public getHeight(): number {
    return this.height;
  }

  public getLeaf(leafKey: Buffer, rootHash?: Buffer): Promise<Buffer> {
    return this.tree.getLeaf(toBN(leafKey), rootHash);
  }

  public async getMerkleProof(leafKey: Buffer, leafValue?: Buffer): Promise<BufferizedInclusionProof> {
    const leaf = leafValue || (await this.getLeaf(leafKey)) || CheckpointTree.emptyBuffer;
    const proof = await this.tree.getMerkleProof(toBN(leafKey), leaf);
    return {
      ...proof,
      key: proof.key.toBuffer()
    };
  }

  public async getSparseMerkleProof(leafKey: Buffer, leafValue?: Buffer): Promise<BufferizedSparseInclusionProof> {
    const leaf = leafValue || (await this.getLeaf(leafKey)) || WrappedTree.emptyBuffer;
    const proof = await this.tree.getSparseMerkleProof(toBN(leafKey), leaf);
    if (!proof) return undefined;
    return {
      ...proof,
      key: proof.key.toBuffer(),
      inclusionBits: proof.inclusionBits.toBuffer()
    };
  }

  /* Tree Actions */
  async setRoot(rootHash: Buffer): Promise<void> {
    return this.tree.setRoot(rootHash);
  }

  public batchUpdate(updates: BufferizedUpdate[]): Promise<boolean> {
    return this.tree.batchUpdate(
      updates.map((update) => ({
        ...update,
        key: toBN(update.key)
      }))
    );
  }

  public subTree(prefix: Buffer, root?: Buffer, height?: number): Promise<WrappedTree> {
    const bucket = this.db.bucket(prefix);
    return WrappedTree.create(
      bucket,
      root || undefined,
      height
    );
  }

  public delete(leafKey: Buffer): Promise<boolean> {
    return this.tree.delete(toBN(leafKey));
  }

  public update(leafKey: Buffer, leafValue: Buffer): Promise<boolean> {
    return this.tree.update(toBN(leafKey), leafValue);
  }

  public verifyAndStore(inclusionProof: BufferizedInclusionProof): Promise<boolean> {
    return this.tree.verifyAndStore({
      ...inclusionProof, key: toBN(inclusionProof.key)
    });
  }

  public verifyAndStorePartiallyEmptyPath(
    leafKey: Buffer,
    numExistingNodes?: number
  ): Promise<boolean> {
    return this.tree.verifyAndStorePartiallyEmptyPath(
      toBN(leafKey),
      numExistingNodes
    );
  }
}