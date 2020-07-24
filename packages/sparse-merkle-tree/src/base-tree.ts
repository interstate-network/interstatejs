import { Cache, BaseDB } from './db'
import { keccak256, NULL_BUFFER, copyBuffer, copyNode, getDefaultHashes, sliceBuffer } from './utils';
import {
  MerkleTreeNode,
  BigNumber,
  MerkleUpdate,
  MerkleTreeInclusionProof,
  ZERO,
  TWO,
  DB,
  ONE,
  SparseMerkleTreeInclusionProof,
  SparseMerkleTree
} from './types';

export class BaseTree implements SparseMerkleTree {
  static emptyBuffer = NULL_BUFFER;
  protected root: MerkleTreeNode;
  protected zeroHashes: Buffer[];

  get EMPTY_ROOT(): Buffer {
    return copyBuffer(this.zeroHashes[0]);
  }

  get EMPTY_ROOT_NODE(): MerkleTreeNode {
    const hash = copyBuffer(this.zeroHashes[0])
    const value = this.height > 1
      ? Buffer.concat([ this.zeroHashes[1], this.zeroHashes[1] ])
      : undefined;

    return this.createNode(hash, value);
  }

  get rootHash(): Buffer {
    return copyBuffer(this.root.hash);
  }

  // async getRootHash(): Promise<Buffer> {
  //   return copyBuffer(this.root.hash);
  // }

  public getRoot(): MerkleTreeNode {
    return copyNode(this.root);
  }

  constructor(
    public db: DB = new BaseDB(),
    public readonly height: number = 160
  ) {
    // this.cache = new Cache(db);
    this.zeroHashes = getDefaultHashes(height);
    this.root = this.EMPTY_ROOT_NODE;
  }

  async checkRoot(rootHash: Buffer): Promise<boolean> {
    return this.db.has(rootHash);
  }

  private isDefaultNode(nodeHash: Buffer, depth: number): boolean {
    return nodeHash.equals(this.zeroHashes[depth]);
  }

  static async create(
    db: DB,
    rootHash?: Buffer,
    height?: number
  ): Promise<BaseTree> {
    const tree = new BaseTree(db, height);
    await tree.init(rootHash);
    return tree;
  }

  protected async init(rootHash?: Buffer): Promise<void> {
    if (!rootHash) return;
    if (!rootHash.equals(this.zeroHashes[0])) {
      this.root = await this.getNode(rootHash);
    }
    // else {
      // this.root = this.EMPTY_ROOT_NODE
    // }

    if (!this.root) {
      this.root = this.EMPTY_ROOT_NODE;
    }
  }

  /** Public Functions */
  public async setRoot(root: Buffer | MerkleTreeNode) {
    if (Buffer.isBuffer(root)) {
      if (root.equals(this.zeroHashes[0])) {
        this.root = this.EMPTY_ROOT_NODE
      } else {
        const node = await this.getNode(root);
        this.root = node || this.createNode(
          root,
          undefined
        );
      }
    } else {
      this.root = copyNode(root);
    }
  }

  public async getLeaf(
    leafKey: BigNumber,
    rootHash?: Buffer
  ): Promise<Buffer> {
    if (!!rootHash && !rootHash.equals(this.root.hash)) {
      return undefined
    }

    const nodesInPath: MerkleTreeNode[] = await this.getNodesInPath(leafKey)
    if (!nodesInPath || nodesInPath.length !== this.height) {
      return undefined
    }
    const leaf: MerkleTreeNode = nodesInPath[nodesInPath.length - 1]
    if (leaf.value.equals(NULL_BUFFER)) return undefined;
    return leaf.value
  }

  /**
   * "Delete" a leaf node by resetting its value to the empty buffer.
   * @param leafKey The leaf key to delete
   */
  public async delete(leafKey: BigNumber): Promise<boolean> {
    return this.update(leafKey, BaseTree.emptyBuffer);
  }

  public async update(
    leafKey: BigNumber,
    leafValue: Buffer
  ): Promise<boolean> {
    let nodesToUpdate: MerkleTreeNode[] = await this.getNodesInPath(leafKey)

    if (!nodesToUpdate) {
      return false
    } else if (nodesToUpdate.length !== this.height) {
      if (
        !(await this.verifyAndStorePartiallyEmptyPath(
          leafKey,
          nodesToUpdate.length
        ))
      ) {
        return false
      }
      nodesToUpdate = await this.getNodesInPath(leafKey)
    }

    const leaf: MerkleTreeNode = nodesToUpdate[nodesToUpdate.length - 1]
    // const idsToDelete: Buffer[] = [this.getNodeID(leaf)]
    nodesToUpdate[nodesToUpdate.length - 1] = this.createNode(
      keccak256(leafValue),
      leafValue
    )
    // leaf.hash = keccak256(leafValue)
    // leaf.value = leafValue

    // let updatedChild: MerkleTreeNode = leaf
    let depth: number = nodesToUpdate.length - 2 // -2 because this array also contains the leaf

    // Iteratively update all nodes from the leaf-pointer node up to the root
    for (; depth >= 0; depth--) {
      nodesToUpdate[depth] = this.updateNode(
        nodesToUpdate[depth],
        nodesToUpdate[depth + 1],
        leafKey,
        depth
      )
      // idsToDelete.push(this.getNodeID(nodesToUpdate[depth]))
      // updatedChild = this.updateNode(
      //   nodesToUpdate[depth],
      //   updatedChild,
      //   leafKey,
      //   depth
      // )
    }

    await Promise.all(nodesToUpdate.map((n) => this.db.put(n.hash, n.value)));

    this.root = nodesToUpdate[0]
    return true
  }

  public async batchUpdate(updates: MerkleUpdate[]): Promise<boolean> {
    for (const update of updates) {
      if (
        !(await this.verifyAndStore({
          rootHash: this.root.hash,
          key: update.key,
          value: update.oldValue,
          siblings: update.oldValueProofSiblings,
        }))
      ) {
        return false
      }
    }

    for (const update of updates) {
      if (!(await this.update(update.key, update.newValue))) {
        throw Error(
          "Verify and Store worked but update didn't! This should never happen!"
        )
      }
    }

    return true
  }

  public async getMerkleProof(
    leafKey: BigNumber,
    leafValue: Buffer
  ): Promise<MerkleTreeInclusionProof> {
    const getProof = async () => {
      if (!this.root || !this.root.hash) {
        return undefined
      }

      let node: MerkleTreeNode = this.root
      const siblings: Buffer[] = []
      for (
        let depth = 0;
        depth < this.height &&
        !!node &&
        !!node.value &&
        node.value.length === 64;
        depth++
      ) {
        siblings.push(this.getChildSiblingHash(node.value, depth, leafKey))
        node = await this.getChild(node, depth, leafKey)
      }

      if (siblings.length !== this.height - 1) {
        // TODO: A much better way of indicating this
        return {
          rootHash: undefined,
          key: undefined,
          value: undefined,
          siblings: undefined,
        }
      }

      if (!node.hash.equals(keccak256(leafValue))) {
        // Provided leaf doesn't match stored leaf
        return undefined
      }

      return {
        rootHash: this.root.hash,
        key: leafKey,
        value: leafValue,
        siblings: siblings.reverse(),
      }
    }
  
    const result: MerkleTreeInclusionProof = await getProof()
    

    if (!result || !!result.rootHash) {
      return result
    }

    // If this is for an empty leaf, we can store it and create a MerkleProof
    if (leafValue.equals(NULL_BUFFER)) {
      if (await this.verifyAndStorePartiallyEmptyPath(leafKey)) {
        return this.getMerkleProof(leafKey, leafValue)
      }
    }
    return undefined
  }

  public async getSparseMerkleProof(
    leafKey: BigNumber,
    leafValue: Buffer
  ): Promise<SparseMerkleTreeInclusionProof> {
    const getProof = async (): Promise<SparseMerkleTreeInclusionProof> => {
      if (!this.root || !this.root.hash) {
        return undefined
      }

      let node: MerkleTreeNode = this.root
      const siblings: Buffer[] = []
      for (
        let depth = 0;
        depth < this.height &&
        !!node &&
        !!node.value &&
        node.value.length === 64;
        depth++
      ) {
        siblings.push(this.getChildSiblingHash(node.value, depth, leafKey))
        node = await this.getChild(node, depth, leafKey)
      }

      if (siblings.length !== this.height - 1) {
        // TODO: A much better way of indicating this
        return undefined;
      }

      if (!node.hash.equals(keccak256(leafValue))) {
        // Provided leaf doesn't match stored leaf
        console.log(node.hash)
        console.log(keccak256(leafValue))
        return undefined
      }

      const proofSiblings = siblings.reverse();
      let inclusionBits = ONE;
      for (let i = 0; i < proofSiblings.length; i++) {
        const depth = this.height - (i + 1);
        if (this.isDefaultNode(proofSiblings[i], depth)) {
          proofSiblings[i] = undefined;
        } else {
          inclusionBits = inclusionBits.setBitFromRight(i + 1);
        }
      }

      return {
        inclusionBits,
        rootHash: this.root.hash,
        key: leafKey,
        value: leafValue,
        siblings: proofSiblings.filter(x => x),
      }
    }
  
    const result: SparseMerkleTreeInclusionProof = await getProof()

    // If this is for an empty leaf, we can store it and create a MerkleProof
    if (!result) {
      if (leafValue.equals(NULL_BUFFER) || leafValue == undefined) {
        if (await this.verifyAndStorePartiallyEmptyPath(leafKey)) {
          return this.getSparseMerkleProof(leafKey, NULL_BUFFER)
        }
      }
      return result;
    }

    if (!!result.rootHash) return result
    
    return undefined
  }

  /**
   * Creates a Merkle Proof sibling node if a node with this hash has not already been stored
   * in the DB.
   *
   * NOTE: If the tree is modified in parallel with a call to this function,
   * results are non-deterministic.
   *
   * @ param nodeHash The hash of the node to create if not already present.
   * @ param leafKey The key detailing how to get to this node from the root
   * @ param depth The depth of this node in the tree
   * @ returns The created node if one was created or undefined if one already exists.
   */
  private async createProofSiblingNodeIfDoesntExist(
    nodeHash: Buffer,
    depth: number
  ): Promise<MerkleTreeNode> {
    // Need to XOR with 1 because this represents a sibling.
    // const nodeKey: BigNumber = this.getNodeKey(leafKey, depth).xor(ONE)
    const node: MerkleTreeNode = await this.getNode(nodeHash)
    if (!!node) return undefined;
    
    let value: Buffer;
    if (depth < this.zeroHashes.length - 1) {
      value = Buffer.concat([
        this.zeroHashes[depth + 1],
        this.zeroHashes[depth + 1]
      ])
    } else {
      value = copyBuffer(NULL_BUFFER)
    }
    return this.createNode(
      this.zeroHashes[depth],
      value
    )
    // return this.createNode(nodeHash, SIBLING_BUFFER);
    /* return this.createNode(
      nodeHash,
      NULL_BUFFER
      // SparseMerkleTreeImpl.siblingBuffer,
      // nodeKey
    ) */
  }

  public async verifyAndStore(
    inclusionProof: MerkleTreeInclusionProof
  ): Promise<boolean> {
    // There should be one sibling for every node except the root.
    if (inclusionProof.siblings.length !== this.height - 1) {
      return false
    }

    const leafHash = keccak256(inclusionProof.value)
    // if (!!(await this.getNode(leafHash))) {
    //   return true
    // }

    let child: MerkleTreeNode = this.createNode(
      leafHash,
      inclusionProof.value
    )

    let siblingIndex = 0
    let parent: MerkleTreeNode = child
    const nodesToStore: MerkleTreeNode[] = [child]
    for (let parentDepth = this.height - 2; parentDepth >= 0; parentDepth--) {
      child = parent

      const childDepth: number = parentDepth + 1
      // Since there's no root sibling, each sibling is one index lower
      const childSiblingHash: Buffer = inclusionProof.siblings[siblingIndex++]
      parent = this.calculateParentNode(
        child,
        childSiblingHash,
        inclusionProof.key,
        parentDepth
      );
      nodesToStore.push(parent)
      
      // Store sibling node, but don't overwrite it if it's in the db.
      const siblingNode: MerkleTreeNode = await this.createProofSiblingNodeIfDoesntExist(
        childSiblingHash,
        childDepth
      )
      if (!!siblingNode) nodesToStore.push(siblingNode)
    }

    if (!parent.hash.equals(this.root.hash)) {
      return false
    }

    // Root hash will not change, but it might have gone from a shortcut to regular node.
    this.root = parent
    for (let node of nodesToStore) this.db.put(node.hash, node.value);

    // await Promise.all(
      // nodesToStore.map((n) => this.db.put(this.getNodeID(n), n.value))
    // )
    return true
  }

  // public async verifyAndStoreSparseProof(
  //   inclusionProof: SparseMerkleTreeInclusionProof
  // ): Promise<boolean> {
  //   // There should be one sibling for every node except the root.
  //   const leafHash = keccak256(inclusionProof.value)

  //   let child: MerkleTreeNode = this.createNode(
  //     leafHash,
  //     inclusionProof.value
  //   )

  //   let siblingIndex = 0
  //   let parent: MerkleTreeNode = child
  //   const nodesToStore: MerkleTreeNode[] = [child]
  //   for (let parentDepth = this.height - 2; parentDepth >= 0; parentDepth--) {
  //     child = parent

  //     const childDepth: number = parentDepth + 1
  //     // Since there's no root sibling, each sibling is one index lower
  //     const childSiblingHash: Buffer = inclusionProof.siblings[siblingIndex++]
  //     parent = this.calculateParentNode(
  //       child,
  //       childSiblingHash,
  //       inclusionProof.key,
  //       parentDepth
  //     );
  //     nodesToStore.push(parent)
      
  //     // Store sibling node, but don't overwrite it if it's in the db.
  //     const siblingNode: MerkleTreeNode = await this.createProofSiblingNodeIfDoesntExist(
  //       childSiblingHash,
  //       childDepth
  //     )
  //     if (!!siblingNode) nodesToStore.push(siblingNode)
  //   }

  //   if (!parent.hash.equals(this.root.hash)) {
  //     return false
  //   }

  //   // Root hash will not change, but it might have gone from a shortcut to regular node.
  //   this.root = parent
  //   for (let node of nodesToStore) this.db.put(node.hash, node.value);

  //   // await Promise.all(
  //     // nodesToStore.map((n) => this.db.put(this.getNodeID(n), n.value))
  //   // )
  //   return true
  // }

  /**
   * Gets the provided parent node's child following the path specified by the
   *  provided leafKey.
   *
   * @param parent The node whose child this will get.
   * @param parentDepth The depth of the parent.
   * @param leafKey The leaf key specifying the path to the child.
   * @returns The child if one is present.
   */
  private async getChild(
    parent: MerkleTreeNode,
    parentDepth: number,
    leafKey: BigNumber
  ): Promise<MerkleTreeNode> {
    const childIndex: number = this.isLeft(leafKey, parentDepth) ? 0 : 32
    const childHash: Buffer = parent.value.subarray(childIndex, childIndex + 32)
    return this.getNode(childHash)
  }

  public async verifyAndStorePartiallyEmptyPath(
    leafKey: BigNumber,
    numExistingNodes?: number
  ): Promise<boolean> {
    if (numExistingNodes === undefined) {
      numExistingNodes = (await this.getNodesInPath(leafKey)).length
    }
    const existingChildren: number = Math.max(numExistingNodes - 1, 0)

    const siblings: Buffer[] = []
    let node: MerkleTreeNode = this.root
    for (let i = 0; i < this.height - 1; i++) {
      if (
        i > existingChildren ||
        (i === existingChildren && (!node.value || node.value.length !== 64))
      ) {
        siblings.push(...this.zeroHashes.slice(i + 1))
        break
      }

      siblings.push(this.getChildSiblingHash(node.value, i, leafKey))
      node = await this.getChild(node, i, leafKey)
    }

    return this.verifyAndStore({
      rootHash: this.root.hash,
      key: new BigNumber(leafKey, 'hex', 'B'),
      value: NULL_BUFFER,
      siblings: siblings.reverse(),
    })
  }

  /** Internal Sync Operations */
  private getNodeKey(leafKey: Buffer, depth: number): BigNumber {
    return new BigNumber(leafKey, 'hex', 'B').shiftRight(this.height - depth - 1)
  }

  private isLeft(key: Buffer | BigNumber, depth: number): boolean {
    return (Buffer.isBuffer(key) ? new BigNumber(key, 'hex', 'B') : key)
      .shiftLeft(depth)
      .shiftRight(this.height - 2)
      .mod(TWO)
      .equals(ZERO);
  }

  private getChildSiblingHash(
    value: Buffer,
    parentDepth: number,
    leafKey: BigNumber
  ): Buffer {
    const isLeft: boolean = this.isLeft(leafKey, parentDepth)
    return isLeft ? value.subarray(32) : value.subarray(0, 32)
  }

  /**
   * Updates the provided MerkleTreeNode based on the provided updated child node.
   *
   * @param node The node to update
   * @param updatedChild The child of the node to update that has changed
   * @param key The key for the updated leaf
   * @param depth the depth of the
   * @returns A reference to the provided node to update
   */
  private updateNode(
    node: MerkleTreeNode,
    updatedChild: MerkleTreeNode,
    key: BigNumber,
    depth: number
  ): MerkleTreeNode {
    const isLeft: boolean = this.isLeft(key, depth)
    let value: Buffer;
    if (isLeft) {
      const sibling = sliceBuffer(node.value, 32, 32);
      value = Buffer.concat([ updatedChild.hash, sibling ])
      // node.value.fill(updatedChild.hash, 0, 32)
    } else {
      // node.value.fill(updatedChild.hash, 32)
      const sibling = sliceBuffer(node.value, 0, 32);
      value = Buffer.concat([ sibling, updatedChild.hash ])
    }
    return this.createNode(
      keccak256(value),
      value
    );
    // node.hash = keccak256(node.value)
    // return node
  }

  /**
   * Calculates the parent hash from the provided node and sibling hash, using the key and depth
   * to determine whether the node is the left node or the sibling is the left node.
   *
   * @param node The node whose hash is used as 1/2 input to parent calculation
   * @param siblingHash The sibling node hash used as 1/2 input to parent calculation
   * @param leafKey The key representing the path to a leaf from which we started
   * @param depth The depth of this node
   * @returns The parent node
   */
  private calculateParentNode(
    node: MerkleTreeNode,
    siblingHash: Buffer,
    leafKey: BigNumber,
    depth: number
  ): MerkleTreeNode {
    let value = Buffer.concat(
      this.isLeft(leafKey, depth)
      ? [ node.hash, siblingHash]
      : [ siblingHash, node.hash ]
    );

    return this.createNode(
      keccak256(value),
      value,
    )
  }

  /**
   * Helper function to create a MerkleTreeNode from the provided hash, value, and key
   *
   * @param hash The hash
   * @param value The value
   * @param key The key that describes how to get to this node from the tree root
   * @returns The resulting MerkleTreeNode
   */
  private createNode(hash: Buffer, value: Buffer): MerkleTreeNode {
    return copyNode({ hash, value })
  }

  /**
   * Gets the MerkleTreeNode with the provided hash from the DB, if one exists.
   *
   * @param nodeHash The node hash uniquely identifying the node
   * @param nodeKey The key identifying the location of the node in question
   * @returns The node, if one was found
   */
  private async getNode(
    nodeHash: Buffer
  ): Promise<MerkleTreeNode> {
    const value: Buffer = await this.db.get(nodeHash)
    if (!value) return undefined;
    return this.createNode(nodeHash, value)
  }

    /**
   * Gets an array of MerkleTreeNodes starting at the root and iterating down to the leaf
   * following the path in the provided key. The returned array will omit any nodes that
   * are not persisted because they can be calculated from the leaf and the zeroHashes.
   *
   * NOTE: If the tree is modified in parallel with a call to this function,
   * results are non-deterministic.
   *
   * @param leafKey The key describing the path to the leaf in question
   * @returns The array of MerkleTreeNodes from root to leaf
   */
  private async getNodesInPath(leafKey: BigNumber): Promise<MerkleTreeNode[]> {
    if (!this.root || !this.root.hash) {
      return []
    }

    if (!this.root.value) {
      return [this.root]
    }

    let node: MerkleTreeNode = this.root
    const nodesToUpdate: MerkleTreeNode[] = [node]
    let depth
    for (depth = 0; depth < this.height - 1; depth++) {
      // const childDepth: number = depth + 1
      if (node.value.length === 64) {
        let v = this.isLeft(leafKey, depth)
          ? node.value.subarray(0, 32)
          : node.value.subarray(32);
        // This is a standard node
        node = this.isLeft(leafKey, depth)
          ? await this.getNode(node.value.subarray(0, 32))
          : await this.getNode(node.value.subarray(32))
        if (node) nodesToUpdate.push(node)
        else {
          break
        }
      } else {
        // This is malformed or a disconnected sibling node
        break
      }
    }
    return nodesToUpdate
  }
}