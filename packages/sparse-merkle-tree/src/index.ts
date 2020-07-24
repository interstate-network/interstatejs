import { WrappedTree as SparseMerkleTree, DBType, toCheckpointDb } from './wrapped-tree'

export { SparseMerkleTree, DBType, toCheckpointDb }

export * from './db'
export * from './constants';
export * from './types'

export { BaseTree } from './base-tree'
export { CheckpointTree } from './checkpoint-tree'

export default SparseMerkleTree