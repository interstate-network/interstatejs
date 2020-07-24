import SparseMerkleTree, { DEFAULT_ROOT_16, BufferizedSparseInclusionProof } from '@interstatejs/sparse-merkle-tree';
import { toBuffer } from "ethereumjs-util";
import Common from 'ethereumjs-common';
import keccak256, { hashConcat } from "./keccak256";
import { StateTree, StorageTree, encodeSparseMerkleProof } from "./proof-tree";
import { toInt, toBuf32, sliceBuffer } from "./to";
import { common } from '../common';
const ABI = require('web3-eth-abi');

const RootNodeAbi = {
  RootNode: {
    root: 'uint256',
    length: 'uint16'
  }
};

export type RootNode = {
  root: Buffer;
  length: number;
}

export type UpdateProof = {
  accountProof: string;
  storageProof: string;
  transactionProof: string;
}

export type RootNodeProof = {
  accountProof: string;
  storageProof: string;
}

export const encodeRootNode = ({ root, length }: RootNode): Buffer => {
  return toBuffer(ABI.encodeParameter(RootNodeAbi, { root, length }));
}

export const decodeRootNode = (data: Buffer): RootNode => {
  if (data.length == 0) return { root: toBuffer(DEFAULT_ROOT_16), length: 0 };
  const decoded = ABI.decodeParameter(RootNodeAbi, data);
  return {
    root: toBuffer(decoded.root),
    length: +decoded.length
  };
}

/**
 * Calculate the child relay address by taking the first 20 bytes of the
 * hash of the chain ID padded to 32 bytes.
 * @param common ethereum common for the chain
 */
export function getChildRelayAddressFromCommon(_common: Common = common): Buffer {
  return sliceBuffer(
    keccak256(toBuf32(_common.chainId())),
    0,
    20
  );
}

export class ChildRelay {
  get root(): Buffer {
    return this.rootNode.root;
  }

  get length(): number {
    return this.rootNode.length;
  }

  get rootKey(): Buffer {
    return keccak256(toBuf32(this.height));
  }

  get stateRoot(): Buffer {
    return this.stateTree.root;
  }

  protected constructor(
    public stateTree: StateTree,
    public storageTree: StorageTree,
    public transactionsTree: SparseMerkleTree,
    public rootNode: RootNode,
    public height: number,
    public address: Buffer
  ) {}
  
  static async create(stateTree: StateTree, address: Buffer, height: number) {
    const storageTree = await stateTree.getAccountStorageTrie(address);
    const heightBuf = Buffer.from(height.toString(16), 'hex');
    const rootKey = keccak256(heightBuf);
    const root = decodeRootNode(await storageTree.get(rootKey));
    const prefix = hashConcat(Buffer.from("EXITS_RELAY"), Buffer.from(height.toString(16), 16));
    const transactionsTree = await storageTree._tree.subTree(
      prefix,
      root.root,
      16
    );
    return new ChildRelay(
      stateTree,
      storageTree,
      transactionsTree,
      root,
      height,
      address
    );
  }

  async getRootProof(): Promise<RootNodeProof> {
    const accountProof = await this.stateTree.getAccountProof(this.address);
    const storageProof = await this.storageTree.prove(this.rootKey);
    return { accountProof, storageProof };
  }

  async getUpdateProof(): Promise<UpdateProof> {
    const accountProof = await this.stateTree.getAccountProof(this.address);
    const storageProof = await this.storageTree.prove(this.rootKey);
    const transactionProof = encodeSparseMerkleProof(
      await this.transactionsTree.getSparseMerkleProof(toBuffer(this.length))
    );
    return {
      accountProof,
      storageProof,
      transactionProof
    };
  }

  protected async updateRootNode() {
    await this.storageTree.put(
      this.rootKey,
      encodeRootNode(this.rootNode)
    );
    const account = await this.stateTree.getAccount(this.address);
    account.stateRoot = this.storageTree.root;
    await this.stateTree.putAccount(this.address, account);
  }

  async insert(transaction: Buffer): Promise<void> {
    await this.transactionsTree.update(
      toBuffer(this.length),
      transaction
    );
    this.rootNode.length += 1;
    this.rootNode.root = this.transactionsTree.rootHash;
    await this.storageTree.put(
      this.rootKey,
      encodeRootNode(this.rootNode)
    );
    const account = await this.stateTree.getAccount(this.address);
    account.stateRoot = this.storageTree.root;
    await this.stateTree.putAccount(this.address, account);
  }

  getTransaction(index: number): Promise<Buffer> {
    if (index >= this.length) {
      throw new Error('Transaction index out of range');
    }
    return this.transactionsTree.getLeaf(toBuffer(index));
  }

  getTransactionProof(index: number): Promise<BufferizedSparseInclusionProof> {
    if (index >= this.length) {
      throw new Error('Transaction index out of range');
    }
    return this.transactionsTree.getSparseMerkleProof(toBuffer(index));
  }
}