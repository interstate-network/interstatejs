import { BufferLike, toHex } from "@interstatejs/utils";

export enum ChallengeStep {
  NONE = 0,               // Challenge not initiated (null).
  PENDING = 1,            // Pending response from block producer.
  RECEIVED = 2            // Witness has been received.
}

export type ChallengeData = {
  lastUpdate: number;            // block number of last update to the challenge
  challenger: BufferLike;        // address of challenger
  step: ChallengeStep;           // step of the challenge
  witness?: BufferLike;          // submitted witness
}

export type ChallengeJson = {
  lastUpdate: number;
  challenger: string;
  step: number;
  witness?: string;
}

function challengeToJSON(challenge: ChallengeData): ChallengeJson {
  return {
    lastUpdate: challenge.lastUpdate,
    challenger: toHex(challenge.challenger),
    step: +challenge.step,
    witness: challenge.witness ? toHex(challenge.witness) : undefined
  };
}

export interface BlockChallengeData {
  blockHash: BufferLike;
  openChallenges?: number;
  challengedTransactions: number[];
  challengesByTransaction?: { [key: string]: ChallengeData };
}

export type BlockChallengeJson = {
  blockHash: string;
  openChallenges: number;
  challengedTransactions: number[];
  challengesByTransaction: { [key: string]: ChallengeJson };
}

export type BlockChallengeInput = BlockChallengeJson | BlockChallengeData;

export type TransactionChallengeData = {
  blockHash?: BufferLike;
  transactionIndex: number;
  blockNumber: number;
  challenger: BufferLike;
}

export type ChallengeResponseData = {
  blockHash?: BufferLike;
  transactionIndex: number;
  blockNumber: number;
  witness: BufferLike;
}

export class BlockChallenge implements BlockChallengeData {
  blockHash: BufferLike;
  openChallenges: number = 0;
  challengedTransactions: number[] = [];
  challengesByTransaction: { [key: string]: ChallengeData } = {};

  constructor(data: BlockChallengeInput | string) {
    if (typeof data == 'string') {
      this.blockHash = data;
    } else if (typeof data == 'object') {
      Object.assign(this, data);
    }
  }

  putTransactionChallenge(data: TransactionChallengeData) {
    const { transactionIndex, blockNumber, challenger } = data;
    this.openChallenges++;
    this.challengedTransactions.push(transactionIndex);
    this.challengesByTransaction[transactionIndex] = {
      step: ChallengeStep.PENDING,
      lastUpdate: blockNumber,
      challenger
    }
  }

  putChallengeResponse(data: ChallengeResponseData) {
    const { transactionIndex, witness, blockNumber } = data;
    const challenge = this.challengesByTransaction[transactionIndex];
    challenge.lastUpdate = blockNumber;
    challenge.step = ChallengeStep.RECEIVED;
    challenge.witness = witness;
  }

  toJSON(): BlockChallengeJson {
    const challengeKeys = Object.keys(this.challengesByTransaction);
    return {
      blockHash: toHex(this.blockHash),
      openChallenges: this.openChallenges,
      challengedTransactions: this.challengedTransactions,
      challengesByTransaction: challengeKeys.reduce((obj, k) => ({
        ...obj, [k]: challengeToJSON(this.challengesByTransaction[k])
      }), {})
    };
  }
}