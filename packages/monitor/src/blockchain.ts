
import Database from './db/database';
import { Transaction } from '@interstatejs/tx';

export type BlockchainConfig = {
  operatorAddress: Buffer;
}

class Blockchain extends Database {
  async createVMFromStateTrie(trie: any) {
    
  }

  // async processBlock(transactions: Transaction[]) {
  //   const parentBlock = await this.latest();
    
  // }
}