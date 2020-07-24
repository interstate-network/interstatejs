import { BigNumber } from '../number'

export type MerkleTreeNode = {
  value: Buffer;
  hash: Buffer;
}

export interface MerkleTreeInclusionProof {
  rootHash: Buffer
  key: BigNumber
  value: Buffer
  siblings: Buffer[]
}

export type SparseMerkleTreeInclusionProof = {
  inclusionBits: BigNumber
  rootHash: Buffer
  key: BigNumber
  value: Buffer
  siblings: Buffer[]
}

export interface MerkleUpdate {
  key: BigNumber
  oldValue: Buffer
  oldValueProofSiblings: Buffer[]
  newValue: Buffer
}

export type BufferizedSparseInclusionProof = Omit<
  Omit<SparseMerkleTreeInclusionProof, 'key'>,
  'inclusionBits'
> & { key: Buffer, inclusionBits: Buffer }

export type BufferizedInclusionProof = Omit<MerkleTreeInclusionProof, 'key'> & { key: Buffer; }
export type BufferizedUpdate = Omit<MerkleUpdate, 'key'> & { key: Buffer; }