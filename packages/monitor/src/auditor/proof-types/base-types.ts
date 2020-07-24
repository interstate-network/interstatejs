import { BufferLike } from "@interstatejs/utils";
import { IncomingTransaction } from "@interstatejs/tx";
import { MessageWitness } from "@interstatejs/vm";
import { CommitmentHeaderQuery, BlockHeaderJson, Block } from "@interstatejs/block";

export type NamedError<T, Name> = T & { _type: Name }

/* Inclusion Proofs */
export type StorageInclusionProof = string;
export type AccountInclusionProof = string;
export type WitnessInclusionProof = {
  commitmentQuery: CommitmentHeaderQuery;
  messageWitness: string;
  transactionIndex: number;
};


export type TransactionInclusionProof<TxType = IncomingTransaction | BufferLike> = {
  transaction: TxType;
  transactionIndex: number;
  siblings: Array<BufferLike>;
}

export type AccessRecordInclusionProof = WitnessInclusionProof & {
  recordIndex: number;
};

export type HeaderCommitment = {
  commitmentQuery: CommitmentHeaderQuery,
  header: BlockHeaderJson
}

export type WithParent = {
  parent: BlockHeaderJson
}

export type PreviousRootProof = {
  previousRootProof: BufferLike;
};

export type BasicTransactionStateProof = HeaderCommitment & TransactionInclusionProof &
  PreviousRootProof & { stateProof: BufferLike };

export type ChallengeSubmissionData = HeaderCommitment & { transactionIndex: number };

export class ChallengeRequiredError extends Error {
  constructor(
    public challengeData: ChallengeSubmissionData,
    public block: Block
  ) {
    super('Caught error that requires challenge.');
  }
}