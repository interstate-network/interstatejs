import SimpleLevel from '../lib/simple-level';
import {
  BlockChallenge,
  BlockChallengeJson,
  TransactionChallengeData,
  ChallengeResponseData
} from '@interstatejs/block';

export class ChallengeDatabase extends SimpleLevel {
  constructor(dbPath?: string) {
    super('challenges', dbPath);
  }

  async get(blockHash: string): Promise<BlockChallenge | null> {
    const json = await super.get(blockHash);
    if (json == null) return new BlockChallenge(blockHash);
    return new BlockChallenge(<BlockChallengeJson> json);
  }

  async put(blockHash: string, value: BlockChallenge): Promise<void> {
    await super.put(blockHash, value);
  }

  async putTransactionChallenge(
    blockHash: string,
    challenge: TransactionChallengeData
  ): Promise<void> {
    const blockChallenge = await this.get(blockHash);
    blockChallenge.putTransactionChallenge(challenge);
    await this.put(blockHash, blockChallenge);
  }

  async putChallengeResponse(
    blockHash: string,
    response: ChallengeResponseData
  ): Promise<void> {
    const blockChallenge = await this.get(blockHash);
    blockChallenge.putChallengeResponse(response);
    await this.put(blockHash, blockChallenge);
  }
}

export default ChallengeDatabase;