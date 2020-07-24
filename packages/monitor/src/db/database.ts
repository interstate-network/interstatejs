import levelup, { LevelUp } from 'levelup';
import leveldown from 'leveldown';
import MemDown from 'memdown'
import { Block } from "@interstatejs/block";
import { toHex, BufferLike, toInt } from '@interstatejs/utils/src/utils';
import SparseMerkleTree, { BaseDB, CheckpointTree, CheckpointDB } from '@interstatejs/sparse-merkle-tree';
import { bufferToInt } from "ethereumjs-util";
import { bufferToHex } from "ethereumjs-util";
import path from 'path';
// const Trie = require('merkle-patricia-tree/secure');
import BlockDatabase from "./block-database";
import BlockHashDatabase from "./blockhash-database";
import BN from 'bn.js';
import ListenerDatabase from './listener-database';
import { StateTree, toBuf } from '@interstatejs/utils';
import { AbstractLevelDOWN } from 'abstract-leveldown';
import { toBuffer } from 'ethereumjs-util';

export class Database {
  constructor(
    public blocksDB: BlockDatabase,
    public blockHashDB: BlockHashDatabase,
    public listenerDB: ListenerDatabase,
    public trieDB: AbstractLevelDOWN,
    private dbPath?: string
  ) {}

  async close() {
    await this.blockHashDB.close();
    await this.blocksDB.close();
  }

  static async create(dbPath?: string) {
    const blocksDB = new BlockDatabase(dbPath);
    const blockHashDB = await BlockHashDatabase.create(dbPath);
    const trieDB = dbPath
      ? leveldown(path.join(dbPath, 'state'))
      : new MemDown();
    const listenerDB = await ListenerDatabase.create(dbPath);
    const db = new Database(blocksDB, blockHashDB, listenerDB, trieDB, dbPath);
    if (!blockHashDB._latest) {
      const block = new Block();
      block.setGenesisParams();
      await db.putBlock(block);
    }
    return db;
  }

  async putBlock(block: Block) {
    const blockHash = bufferToHex(block.hash());
    if (!(await this.blocksDB.has(blockHash))) {
      await this.blockHashDB.push(
        bufferToInt(block.header.number),
        blockHash,
        bufferToHex(block.header.parentHash)
      );
      await this.blocksDB.put(blockHash, block);
    }
  }

  /**
   * Reads a block from the database given a block hash or number.
   * If block number is given, an optional index field can also be passed.
   */
  async getBlock(height: number, index?: number): Promise<Block>
  async getBlock(blockHash: BufferLike): Promise<Block>
  async getBlock(hashOrHeight: BufferLike, index?: number): Promise<Block> {
    let blockHash: string;
    if (typeof hashOrHeight == 'number' || BN.isBN(hashOrHeight)) {
      if (index != undefined) {
        blockHash = (await this.blockHashDB.blockHashes(toInt(hashOrHeight)))[index];
      } else {
        blockHash = await this.blockHashDB.latest(toInt(hashOrHeight));
      }
    } else {
      blockHash = toHex(hashOrHeight);
    }
    return this.blocksDB.get(blockHash);
  }

  /**
   * Read the latest block from the database.
   * @param height Optional field to specify which block height to read the latest hash from.
   */
  async latest(height?: number): Promise<Block> {
    const blockHash = await this.blockHashDB.latest(height);
    return this.getBlock(blockHash);
  }

  // async getBlockOrDefault(hashOrNumber?: string | number):
  //     Promise<{ version: number, hardTransactionsCount: number, blockNumber: number, stateRoot?: string }>
  //   {
  //     let block = (hashOrNumber != undefined)
  //       ? await this.getBlock(hashOrNumber)
  //       : await this.latest();
  //     return block ? block.header : defaultBlockInfo;
  //   }

  async getStateTree(rootHash?: BufferLike): Promise<SparseMerkleTree> {
    const db = new CheckpointDB(new BaseDB(this.trieDB));
    const tree = await CheckpointTree.create(
      db,
      rootHash ? toBuffer(rootHash) : undefined,
      160
    );
    return new SparseMerkleTree(db, tree, 160)
    // return SparseMerkleTree.create(
      // new BaseDB(this.trieDB),
      // rootHash && toBuf(rootHash),
      // 160
    // );
    // StateTree.create(this.trieDB, toBuf(rootHash))
  }

  async getBlockStartingState(hashOrNumber?: string | number): Promise<any> {
    if (typeof hashOrNumber == 'number') {
      if (hashOrNumber == 0) return this.getStateTree();
      const previousBlock = await this.getBlock(hashOrNumber - 1);
      return this.getStateTree(previousBlock.header.stateRoot);
    }
    const block = await this.getBlock(hashOrNumber);
    if (bufferToInt(block.header.number) == 0) return this.getStateTree();
    const previousBlock = await this.getBlock(block.header.parentHash);
    return this.getStateTree(previousBlock.header.stateRoot);
  }
}

export default Database;