import { MerkleTreeNode } from '../types/merkle-tree';
import { copyBuffer, NULL_BUFFER } from "./buffer";
import { keccak256, hashConcat } from './crypto';

export const copyNode = (node: MerkleTreeNode): MerkleTreeNode => ({
  hash: copyBuffer(node.hash),
  value: copyBuffer(node.value)
});

/**
 * Returns an array of default hashes for a sparse merkle tree,
 * where the index is the depth in the tree (i.e. layers from the top).
 *
 * @param height The height of the tree
 */
export const getDefaultHashes = (height: number): Buffer[] => {
  const hashes: Buffer[] = [ keccak256(NULL_BUFFER) ]
  for (let i = 1; i < height; i++) {
    hashes[i] = hashConcat(hashes[i-1], hashes[i-1]);
  }
  return hashes.reverse()
}

/**
 * Returns the default root hash for a tree of a given height.
 *
 * @param height The height of the tree
 */
export const getDefaultRoot = (height: number): Buffer => getDefaultHashes(height)[0];

