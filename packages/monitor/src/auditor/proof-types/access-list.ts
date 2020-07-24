import { MessageWitness } from "@interstatejs/vm"
import { CommitmentHeaderData, BlockHeaderData, CommitmentHeader, BlockHeaderJson } from "@interstatejs/block";
import { NamedError, AccountInclusionProof, StorageInclusionProof, AccessRecordInclusionProof } from "./base-types";

export type AccessRecordEncodingError = NamedError<
  AccessRecordInclusionProof,
  "ACCESS_RECORD_ENCODING"
>;

/* Base Types */
export type AccountErrorProof = AccessRecordInclusionProof & {
  accountProof: AccountInclusionProof;
}

export type StorageErrorProof = AccountErrorProof & {
  storageProof: StorageInclusionProof;
};
export type CommitmentErrorProof = AccessRecordInclusionProof;

export type HeaderAccessErrorProof = AccessRecordInclusionProof & {
  header: BlockHeaderJson;
};

/* Storage Errors */
export type SloadErrorProof = NamedError<StorageErrorProof, "SLOAD">;
export type SstoreErrorProof = NamedError<StorageErrorProof, "SSTORE">;

/* Account Error Proofs */
export type BalanceErrorProof = NamedError<AccountErrorProof, "BALANCE">;
export type SelfBalanceErrorProof = NamedError<AccountErrorProof, "SELFBALANCE">;
export type ExtCodeHashErrorProof = NamedError<AccountErrorProof, "EXTCODEHASH">;
export type ExtCodeSizeErrorProof = NamedError<AccountErrorProof, "EXTCODESIZE">;
export type ExtCodeCopyErrorProof = NamedError<AccountErrorProof, "EXTCODECOPY">;

/* Header Errors */
export type CoinbaseErrorProof = NamedError<CommitmentErrorProof, "COINBASE">;
export type TimestampErrorProof = NamedError<HeaderAccessErrorProof, "TIMESTAMP">;
export type NumberErrorProof = NamedError<HeaderAccessErrorProof, "NUMBER">;

/* Other */
export type ChainIdErrorProof = NamedError<AccessRecordInclusionProof, "CHAINID">;

export type CallErrorProof = NamedError<
  AccessRecordInclusionProof & {
    callerProof: string;
    receiverProof: string;
  },
  "CALL"
>;

export type ExitCallErrorProof = NamedError<
  AccessRecordInclusionProof & {
    header: BlockHeaderJson;
    calldata: string;
    callerProof: string;
    stateProofBytes: string;
    storageProofBytes: string;
    leafProofBytes: string;
  },
  "EXIT_CALL"
>;

export type StaticCallErrorProof = NamedError<
  AccessRecordInclusionProof & {
    calldata: string
  },
  "STATICCALL"
>;

export type ExitCallEncodingErrorProof = NamedError<
  AccessRecordInclusionProof & {
    calldata: string
  },
  "EXIT_CALL_ENCODING"
>;

export type AccessListErrorProof = SloadErrorProof |
  SstoreErrorProof |
  BalanceErrorProof |
  SelfBalanceErrorProof |
  ExtCodeHashErrorProof |
  ExtCodeSizeErrorProof |
  ExtCodeCopyErrorProof |
  CoinbaseErrorProof |
  TimestampErrorProof |
  NumberErrorProof |
  AccessRecordEncodingError |
  ChainIdErrorProof |
  CallErrorProof |
  ExitCallErrorProof |
  ExitCallEncodingErrorProof |
  StaticCallErrorProof;