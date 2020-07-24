import { NamedError, TransactionInclusionProof, AccountInclusionProof, HeaderCommitment, BasicTransactionStateProof } from "./base-types"
import { IncomingTransaction } from "@interstatejs/tx";
import { CommitmentHeaderQuery, BlockHeaderJson } from "@interstatejs/block";
import { BufferLike } from "@interstatejs/utils";
import { BN } from "ethereumjs-util";




export type SimpleSignedTransactionErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof & {
    previousRootProof: BufferLike,
    callerProof: string,
    receiverProof: string,
    operatorProof: string,
    // stateRoot1: string,
    // stateRoot2: string,
    // stateRoot3: string,
    // stateRoot4: string,
    // callerAddress: string,
    // receiverAddress: string,
    // operatorAddress: string,
    // value: BN,
    // gasFee: BN
  },
  'SIMPLE_SIGNED_TX'
>;

export type SimpleIncomingTransactionErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof & {
    receiverProof: BufferLike,
    previousRootProof: BufferLike
  },
  'SIMPLE_INCOMING_TX'
>;

export type IncomingTransactionEncodingErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof,
  "INCOMING_TX_ENCODING"
>;

export type SignedTransactionEncodingErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof,
  "SIGNED_TX_ENCODING"
>;


export type InvalidCreateErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof,
  "INVALID_CREATE_TX"
>;

export type TransactionSignatureErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof,
  "TX_SIGNATURE"
>;

export type InsufficientGasErrorProof = NamedError<
  HeaderCommitment & TransactionInclusionProof,
  "INSUFFICIENT_GAS"
>;

export type InsufficientBalanceErrorProof = NamedError<
  BasicTransactionStateProof,
  "INSUFFICIENT_BALANCE"
>;

export type InvalidNonceErrorProof = NamedError<
  BasicTransactionStateProof,
  "INVALID_NONCE"
>;

export type TransactionErrorProof = TransactionSignatureErrorProof |
  InvalidCreateErrorProof |
  SimpleIncomingTransactionErrorProof |
  SimpleSignedTransactionErrorProof |
  IncomingTransactionEncodingErrorProof |
  SignedTransactionEncodingErrorProof |
  InsufficientBalanceErrorProof |
  InvalidNonceErrorProof |
  InsufficientGasErrorProof;