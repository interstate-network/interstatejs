// export type BlockHeaderErrorProof = NamedInclusionProof

import { NamedError, HeaderCommitment } from "./base-types";
import { CommitmentHeaderQuery, BlockHeader, BlockHeaderJson } from "@interstatejs/block";
import { BufferLike } from "@interstatejs/utils";

export type ExitRootError = NamedError<
  HeaderCommitment & {
    accountProof: string;
    storageProof: string;
  },
  "BLOCK_EXIT_ROOT"
>

export type IncomingTransactionsIndexErrorProof = NamedError<
  {
    parent: BlockHeaderJson,
    commitmentQuery: CommitmentHeaderQuery,
    header: BlockHeaderJson
  },
  "INCOMING_TRANSACTIONS_INDEX"
>;

export type IncomingTransactionsOutOfRangeErrorProof = NamedError<
  {
    commitmentQuery: CommitmentHeaderQuery,
    header: BlockHeaderJson
  },
  "INCOMING_TRANSACTIONS_OUT_OF_RANGE"
>;

export type BlockTimestampErrorProof = NamedError<
  {
    parent: BlockHeaderJson,
    commitmentQuery: CommitmentHeaderQuery,
    header: BlockHeaderJson
  },
  "BLOCK_TIMESTAMP"
>;

export type BlockNumberErrorProof = NamedError<
  {
    parent: BlockHeaderJson,
    commitmentQuery: CommitmentHeaderQuery,
    header: BlockHeaderJson
  },
  "BLOCK_NUMBER"
>;

export type StateRootErrorProof = NamedError<
  {
    commitmentQuery: CommitmentHeaderQuery,
    header: BlockHeaderJson,
    transaction: BufferLike,
    transactionIndex: number,
    siblings: BufferLike[]
  },
  "BLOCK_STATE_ROOT"
>;

export type BlockErrorProof = IncomingTransactionsIndexErrorProof |
  BlockTimestampErrorProof |
  StateRootErrorProof |
  BlockNumberErrorProof |
  IncomingTransactionsOutOfRangeErrorProof |
  ExitRootError;