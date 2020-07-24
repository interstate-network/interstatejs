import { TransactionInclusionProof, AccessRecordInclusionProof, NamedError, WitnessInclusionProof, AccountInclusionProof, HeaderCommitment } from "./base-types";
import { BlockHeaderJson, CommitmentHeaderQuery } from "@interstatejs/block";
import { BufferLike } from "@interstatejs/utils";

export type ExitCallWitnessGasError = NamedError<
  WitnessInclusionProof,
  "EXIT_CALL_WITNESS_GAS"
>;

export type ExitWitnessEncodingError = NamedError<
  WitnessInclusionProof,
  "EXIT_WITNESS_ENCODING_ERROR"
>;

export type ExitCallWitnessExitStateRoot = NamedError<
  WitnessInclusionProof & {
    header: BlockHeaderJson;
    stateProofBytes: string;
    storageProofBytes: string;
    leafProofBytes: string;
  },
  "EXIT_CALL_WITNESS_EXIT_ROOT"
>;

export type SuccessfulSignedTransactionStateRootErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof & {
    messageWitness: string;
    callerProof: AccountInclusionProof;
    operatorProof: AccountInclusionProof;
  },
  "SIGNED_TX_STATE_ROOT_SUCCESS"
>;

export type FailedSignedTransactionStateRootErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof & {
    previousRootProof: string;
    messageWitness: string;
    callerProof: AccountInclusionProof;
    operatorProof: AccountInclusionProof
  },
  "SIGNED_TX_STATE_ROOT_FAILURE"
>;

export type SuccesfulIncomingTransactionStateRootErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof & {
    messageWitness: string;
  },
  "INCOMING_TX_STATE_ROOT_SUCCESS"
>;

export type WitnessContextError = NamedError<
  TransactionInclusionProof & WitnessInclusionProof & { header: BlockHeaderJson },
  "WITNESS_CONTEXT"
>;

export type WitnessGasExceededError = NamedError<
  WitnessInclusionProof,
  "WITNESS_GAS_EXCEEDED_ERROR"
>;

export type WitnessRefundError = NamedError<
WitnessInclusionProof,
  "WITNESS_REFUND"
>;

export type WitnessInputRootError = NamedError<
  TransactionInclusionProof & WitnessInclusionProof & { header: BlockHeaderJson } &
  { stateProof1: AccountInclusionProof, stateProof2: AccountInclusionProof } & {
    previousRootProof: BufferLike
  },
  "INPUT_STATE_ROOT"
>;

export type WitnessOutputRootError = NamedError<
  WitnessInclusionProof,
  "OUTPUT_STATE_ROOT"
>;

export type WitnessEncodingError = NamedError<
  WitnessInclusionProof,
  "WITNESS_ENCODING"
>;

export type WitnessMetaError = WitnessContextError |
  WitnessRefundError |
  WitnessInputRootError |
  WitnessOutputRootError |
  WitnessGasExceededError |
  WitnessEncodingError |
  SuccessfulSignedTransactionStateRootErrorProof |
  FailedSignedTransactionStateRootErrorProof |
  SuccesfulIncomingTransactionStateRootErrorProof |
  ExitCallWitnessGasError |
  ExitCallWitnessExitStateRoot |
  ExitWitnessEncodingError;