import { BigNumber } from '../number'
import { MerkleUpdate, MerkleTreeInclusionProof, BufferizedInclusionProof, BufferizedUpdate, MerkleTreeNode, SparseMerkleTreeInclusionProof } from './types'
import { CheckpointEntity } from '../checkpoint-entity'

export interface MerkleTree {
  /**
   * The root hash of the merkle tree.
   */
  rootHash: Buffer;

  /**
   * The height of the Merkle tree, including the root node.
   */
  readonly height: number

  /**
   * Deletes a leaf node by resetting its value to the empty buffer.
   * This is the equivalent of calling update(key, Tree.emptyBuffer)
   *
   * @param leafKey The leaf key to delete
   * @return true if the deletion succeeded, false if we're missing the intermediate nodes / siblings required for this
   */
  delete(leafKey: BigNumber): Promise<boolean>;

  /**
   * Updates the provided key in the Merkle Tree to have the value as data,
   * including all ancestors' hashes that result from this modification.
   *
   * @param leafKey The leaf key to update
   * @param leafValue The new value
   * @return true if the update succeeded, false if we're missing the intermediate nodes / siblings required for this
   */
  update(leafKey: BigNumber, leafValue: Buffer): Promise<boolean>

  /**
   * Updates the provided keys in the Merkle Tree in an atomic fashion
   * including all ancestor hashes that result from these modifications.
   *
   * Note: It is known that applying one update invalidates the proof for the next
   * update, which should be accounted for within this method.
   *
   * @param updates The updates to execute
   * @return true if the update succeeded, false if we're missing the intermediate nodes / siblings required for this
   */
  batchUpdate(updates: MerkleUpdate[]): Promise<boolean>

  /**
   * Gets a Merkle proof for the provided leaf value at the provided key in the tree.
   *
   * @param leafKey The exact path from the root to the leaf value in question
   * @param leafValue The leaf data
   * @returns The MerkleTreeInclusionProof if one is possible, else undefined
   * @throws If data required to calculate the Merkle proof is missing
   */
  getMerkleProof(
    leafKey: BigNumber,
    leafValue: Buffer
  ): Promise<MerkleTreeInclusionProof>

  /**
   * Gets a Merkle proof for the provided leaf value at the provided key in the tree,
   * using an inclusion field to mark default node siblings (which are not included in the proof).
   *
   * @param leafKey The exact path from the root to the leaf value in question
   * @param leafValue The leaf data
   * @returns The SparseMerkleTreeInclusionProof if one is possible, else undefined
   * @throws If data required to calculate the Merkle proof is missing
   */
  getSparseMerkleProof(
    leafKey: BigNumber,
    leafValue: Buffer
  ): Promise<SparseMerkleTreeInclusionProof>

  /**
   * Gets the leaf data at the provided key in the tree, if any exists.
   *
   * @param leafKey The key of the leaf to fetch
   * @param rootHash: The optional root hash if root verification is desired
   * @returns The value at the key if one exists, else undefined
   */
  getLeaf(leafKey: BigNumber, rootHash?: Buffer): Promise<Buffer>
}

export interface SparseMerkleTree extends MerkleTree {
  /**
   * Default root hash for the sparse merkle tree
   */
  EMPTY_ROOT: Buffer;
  /**
   * Default root node for the sparse merkle tree
   */
  EMPTY_ROOT_NODE: MerkleTreeNode

  /**
   * Check if the root is checkpointed in the tree.
   * @param root Root hash or node to check for inclusion.
   */
  checkRoot(root: Buffer): Promise<boolean>;

  /**
   * Set the root node for the merkle tree.
   * @param root Root hash or node to set as the root. If a hash
   * is provided, the tree will look for the value in the database.
   */
  setRoot(root: Buffer | MerkleTreeNode): Promise<void>;

  /**
   * Verifies that the provided inclusion proof and stores the
   * associated siblings for future updates / calculations.
   *
   * @param inclusionProof The inclusion proof in question
   * @return true if the proof was valid (and thus stored), false otherwise
   */
  verifyAndStore(inclusionProof: MerkleTreeInclusionProof): Promise<boolean>

  /**
   * Verifies and stores an empty leaf from a partially non-existent path.
   *
   * @param leafKey The leaf to store
   * @param numExistingNodes The number of existing nodes, if known
   * @returns True if verified, false otherwise
   */
  verifyAndStorePartiallyEmptyPath(
    leafKey: BigNumber,
    numExistingNodes?: number
  ): Promise<boolean>
}

export interface CheckpointMerkleTree extends SparseMerkleTree, CheckpointEntity {
  subTree(
    prefix: Buffer,
    root?: Buffer,
    height?: number
  ): Promise<CheckpointMerkleTree>;
}

export interface WrappedMerkleTree extends CheckpointEntity {
  rootHash: Buffer;
  EMPTY_ROOT: Buffer;
  /* Database */
  getRaw(key: Buffer): Promise<Buffer>;
  putRaw(key: Buffer, value: Buffer): Promise<void>;
  /* <-- Merkle Tree Queries --> */
  /**
   * Check if the root is checkpointed in the tree.
   * @param root Root hash or node to check for inclusion.
   */
  checkRoot(root: Buffer): Promise<boolean>;
  getLeaf(leafKey: Buffer, rootHash?: Buffer): Promise<Buffer>;
  getMerkleProof(leafKey: Buffer, leafValue: Buffer): Promise<BufferizedInclusionProof>;
  subTree(prefix: Buffer, root?: Buffer, height?: number): Promise<WrappedMerkleTree>;
  /* Merkle Tree Actions */
  batchUpdate(updates: BufferizedUpdate[]): Promise<boolean>;
  delete(key: Buffer): Promise<boolean>;
  setRoot(rootHash: Buffer): Promise<void>;
  update(leafKey: Buffer, leafValue: Buffer): Promise<boolean>;
  verifyAndStore(inclusionProof: BufferizedInclusionProof): Promise<boolean>;
  verifyAndStorePartiallyEmptyPath(leafKey: Buffer, numExistingNodes?: number): Promise<boolean>;
}