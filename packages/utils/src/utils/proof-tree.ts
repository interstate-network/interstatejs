import SparseMerkleTree, { DBType, BufferizedSparseInclusionProof } from '@interstatejs/sparse-merkle-tree';
import { toBuffer } from 'ethereumjs-util';
import Account from '@interstatejs/account'

import { BufferLike, toBuf32, toBuf, toHex } from './to';
import { keccak256 } from './keccak256';
import { WrappedTree } from '@interstatejs/sparse-merkle-tree/dist/wrapped-tree';
const ABI = require('web3-eth-abi');

/*
const storageTrie = await this._tree.subTree(address, undefined, 256)
*/

/**
 * This structure is not very efficient.
 * We could probably improve it by using the RLP length for
 * serialized accounts to locate the beginning of the siblings
 * array, and slicing the first 32 bytes for storage proofs.
 */
export const SparseMerkleProofABI = {
  StateProof: {
    inclusionBits: 'uint256',
    value: 'bytes',
    siblings: 'bytes32[]'
  }
}

export function encodeSparseMerkleProof(
  proof: BufferizedSparseInclusionProof
): string {
  return toHex(ABI.encodeParameter(SparseMerkleProofABI, {
    value: proof.value,
    inclusionBits: proof.inclusionBits,
    siblings: proof.siblings
  }));
}

export class StateTree {
  get root(): Buffer {
    return this._tree.rootHash;
  }

  constructor(public _tree: SparseMerkleTree) {}

  checkpoint(): void {
    return this._tree.checkpoint();
  }

  async commit(): Promise<void> {
    return this._tree.commit();
  }

  async revert(): Promise<void> {
    return this._tree.revert();
  }

  static async create(db?: DBType, rootHash?: Buffer): Promise<StateTree> {
    const tree = await SparseMerkleTree.create(db, rootHash, 160);
    return new StateTree(tree);
  }

  async isContract(address: BufferLike): Promise<boolean> {
    const account = await this.getAccount(address);
    return account.isContract();
  }

  async getAccount(_address: BufferLike): Promise<Account> {
    const address = Buffer.isBuffer(_address) ? _address : toBuffer(_address);
    const val = await this._tree.getLeaf(address)
    return new Account(val)
  }

  async getAccountCode(address: BufferLike): Promise<Buffer> {
    const account = await this.getAccount(address)
    if (!account.isContract()) {
      return Buffer.alloc(0)
    }
    const code = await this._tree.getRaw(account.codeHash)
    return code || Buffer.alloc(0)
  }

  async putAccountCode(_address: BufferLike, _code: BufferLike): Promise<void> {
    const address = Buffer.isBuffer(_address) ? _address : toBuffer(_address);
    const code = Buffer.isBuffer(_code) ? _code : toBuffer(_code);
    const codeHash = keccak256(code);
    await this._tree.putRaw(codeHash, code);
    const account = await this.getAccount(address);
    account.codeHash = codeHash;
    await this.putAccount(address, account);
  }

  async putAccount(_address: BufferLike, account: Account) {
    const address = Buffer.isBuffer(_address) ? _address : toBuffer(_address);
    await this._tree.update(address, account.serialize())
  }

  async getAccountProof(_address: BufferLike): Promise<string> {
    const address = Buffer.isBuffer(_address) ? _address : toBuffer(_address);
    const proof = await this._tree.getSparseMerkleProof(address);
    return encodeSparseMerkleProof(proof);
  }

  async getAccountStorageTrie(_address: BufferLike): Promise<StorageTree> {
    const address = Buffer.isBuffer(_address) ? _address : toBuffer(_address)
    const account = await this.getAccount(address)
    const storageTree = await this._tree.subTree(address, account.stateRoot, 256)
    return new StorageTree(storageTree)
  }

  async getAccountStorageProof(address: BufferLike, key: BufferLike): Promise<{
    value: Buffer,
    proof: string
  }> {
    const trie = await this.getAccountStorageTrie(address);
    const value = await trie.get(key);
    const proof = await trie.prove(key);
    return { value, proof };
  }

/* const account = await this.getAccount(address)
    // const storageTrie = this._tree.copy(false)
    const storageTrie = await this._tree.subTree(address, undefined, 256)
    await storageTrie.setRoot(account.stateRoot) */
}

export class StorageTree {
  get root(): Buffer {
    return this._tree.rootHash;
  }

  constructor(public _tree: SparseMerkleTree) {}

  async get(key: BufferLike): Promise<Buffer> {
    const value = await this._tree.getLeaf(toBuf32(key));
    if (value == undefined) return Buffer.alloc(0);
    return value;
  }

  async put(key: BufferLike, value: BufferLike): Promise<void> {
    await this._tree.update(toBuf32(key), toBuffer(value));
  }

  async prove(key: BufferLike): Promise<string> {
    const proof = await this._tree.getSparseMerkleProof(toBuf32(key));
    return encodeSparseMerkleProof(proof);
  }
}