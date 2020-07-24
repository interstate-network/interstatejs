import SimpleLevel from '../lib/simple-level';
import { Block, BlockJson } from '@interstatejs/block';

export class BlockDatabase extends SimpleLevel {
  constructor(dbPath?: string) {
    super('blocks', dbPath);
  }

  async put(key: string, value: Block): Promise<void> {
    return super.put(key, value);
  }

  async get(key: string): Promise<Block> {
    const json = await super.get(key);
    if (json == null) return null;
    return new Block(<BlockJson> json);
  }

  async has(key: string): Promise<boolean> {
    const block = await super.get(key); 
    return block != null;
  }
}

export default BlockDatabase;