import SimpleLevel from '../lib/simple-level';

export type BlockHashes = string[];
export type Latest = {
  height: number;
  blockHash: string;
}

export class BlockHashDatabase extends SimpleLevel {
  _latest?: number;

  constructor(dbPath?: string) {
    super('blocks', dbPath);
  }

  static async create(dbPath?: string): Promise<BlockHashDatabase> {
    const db = new BlockHashDatabase(dbPath);
    await db.init();
    return db;
  }

  async init(): Promise<void> {
    const n = await this.get('latest');
    this._latest = n || 0;
  }

  async children(parentHash: string): Promise<BlockHashes> {
    return (await this.get(parentHash)) || [];
  }

  /**
   * Get the number of child blockhashes for a given parent block.
   */
  async childCount(parentHash: string): Promise<number> {
    const arr = await this.children(parentHash);
    return arr.length;
  }

  /**
   * Get the array of block hashes stored for a given height.
   */
  async blockHashes(height: number): Promise<BlockHashes> {
    return (await this.get(height)) || [];
  }

  /**
   * Get the number of block hashes stored for a given height or parent block.
   */
  async length(height: number): Promise<number> {
    const arr = await this.blockHashes(height);
    return arr.length;
  }

  /**
   * Check if there are any block hashes stored for a given height.
  */
  async has(height: number): Promise<boolean> {
    return (await this.length(height)) != 0;
  }

  /**
   * Check if there are any block hashes stored for a given height.
  */
  async hasChildren(parentHash: string): Promise<boolean> {
    return (await this.childCount(parentHash)) != 0;
  }

  /**
   * 
   * @param height 
   * @param blockHashes 
   */

  private async update(height: number, blockHashes: BlockHashes): Promise<void> {
    // uses gte to handle height = 0
    if (height >= this._latest) {
      this._latest = height;
      await this.put('latest', height);
    }
    await this.put(height, blockHashes);
  }

  /**
   * 
   * @param parentHash 
   * @param childHashes
   */

  private async updateChildren(parentHash: string, childHashes: BlockHashes): Promise<void> {
    await this.put(parentHash, childHashes);
  }

  /**
   * Push a blockhash to the database.
   */
  async push(height: number, blockHash: string, parentHash?: string): Promise<void> {
    const arr = await this.blockHashes(height);
    arr.push(blockHash);
    await this.update(height, arr);
    // Genesis has no parent
    if (height == 0) return;
    if (!parentHash) throw new Error('Parent hash must be provided after genesis block.');
    const children = await this.children(parentHash);
    children.push(blockHash);
    await this.updateChildren(parentHash, children);
  }

  /**
   * Get the latest block hash for a given height, if one is passed.
   * If no hash is passed, get the latest block height and the latest block hash for that height.
   */
  async latest(): Promise<Latest>
  async latest(height: number): Promise<string>
  async latest(_height?: number): Promise<Latest | string> {
    let height = _height || this._latest;
    const arr = await this.blockHashes(height);
    const blockHash = arr[0];
    if (_height != undefined) return blockHash;
    return { height, blockHash };
  }
}

export default BlockHashDatabase;