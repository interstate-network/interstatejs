import { Address } from 'web3x/address';
import { BufferLike } from "@interstatejs/tx";
import { toHex } from "@interstatejs/utils";
import { ChallengeManager, ChainPegTransactionReceipt } from "@interstatejs/contracts";
import { ParentContext } from "../lib/parent-context";
import { CommitmentHeaderQuery, BlockHeaderJson, BlockHeader } from '@interstatejs/block';
import { convertCommitmentQueryForWeb3x, convertHeaderForWeb3x } from '../lib/web3x-adapters';
import { CHALLENGE_BOND } from '../lib/constants';

export class ChallengeAdapter {
  constructor(
    public context: ParentContext,
    public from: Address
  ) {}

  get challengeManager(): ChallengeManager {
    return this.context.challengeManager;
  }

  async challengeTimeout(
    blockHash: BufferLike,
    transactionIndex: number
  ): Promise<ChainPegTransactionReceipt> {
    const calldata = this.challengeManager.methods.challengeTimeout(
      toHex(blockHash),
      transactionIndex
    ).encodeABI();
    return this.context.peg.methods.challengeStep(
      toHex(calldata)
    ).send({ from: this.from }).getReceipt()
  }

  async challengeTransaction(
    query: CommitmentHeaderQuery,
    header: BlockHeader | BlockHeaderJson,
    transactionIndex: number
  ): Promise<ChainPegTransactionReceipt> {
    const calldata = this.challengeManager.methods.challengeTransaction(
      convertCommitmentQueryForWeb3x(query),
      convertHeaderForWeb3x(header),
      transactionIndex
    ).encodeABI();

    return this.context.peg.methods.challengeStep(
      toHex(calldata)
    ).send({ from: this.from, value: CHALLENGE_BOND }).getReceipt();
  }

  async respondToChallenge(
    blockHash: BufferLike,
    transactionIndex: number,
    witness: BufferLike
  ): Promise<ChainPegTransactionReceipt> {
    const calldata = this.challengeManager.methods.respondToChallenge(
      toHex(blockHash),
      transactionIndex,
      toHex(witness)
    ).encodeABI();

    return this.context.peg.methods.challengeStep(
      toHex(calldata)
    ).send({ from: this.from }).getReceipt();
  }

  async reclaimChallengeBond(
    blockHash: BufferLike,
    transactionIndex: number
  ): Promise<ChainPegTransactionReceipt> {
    const calldata = this.challengeManager.methods.reclaimChallengeBond(
      toHex(blockHash),
      transactionIndex,
    ).encodeABI();

    return this.context.peg.methods.challengeStep(
      toHex(calldata)
    ).send({ from: this.from }).getReceipt();
  }
}

export default ChallengeAdapter;