import { Address } from 'web3x/address';
import { JsonType } from "../lib/simple-level";
import { ProvableError } from "./witness-auditors/helpers";
import { ParentContext } from "../lib/parent-context";
import { toHex } from '@interstatejs/utils/src/utils';
import { IncomingTransaction } from '@interstatejs/tx';
import { BufferLike } from '@interstatejs/utils';
import { ChallengeRequiredError } from './proof-types';
import { convertHeaderForWeb3x, convertCommitmentQueryForWeb3x, convertIncomingTransactionForWeb3x } from '../lib/web3x-adapters';
import { encodeTransactionForProof } from './coder';
import { decodeMessageWitness } from '@interstatejs/vm';

export type FunctionCallInput = {
  name: string;
  input: string;
}


export async function encodeErrorProofInput(
  context: ParentContext,
  err: ProvableError
): Promise<FunctionCallInput> {
  const { error } = err;
  let fn: any;
  switch(error._type) {
    /* Block Errors */
    case 'BLOCK_EXIT_ROOT':
      fn = context.blockErrorProver.methods.proveExitsRootError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        error.accountProof,
        error.storageProof
      );
      return {
        name: 'proveBlockError',
        input: toHex(fn.encodeABI())
      }
    case 'BLOCK_NUMBER':
      fn = context.blockErrorProver.methods.proveBlockNumberError(
        convertHeaderForWeb3x(error.parent),
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header)
      );
      return {
        name: 'proveBlockError',
        input: toHex(fn.encodeABI())
      }
    case 'BLOCK_STATE_ROOT':
      fn = context.blockErrorProver.methods.proveStateRootError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex)
      );
      return {
        name: 'proveBlockError',
        
        input: toHex(fn.encodeABI())
      }
    case 'BLOCK_TIMESTAMP':
      fn = context.blockErrorProver.methods.proveTimestampError(
        convertHeaderForWeb3x(error.parent),
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header)
      );
      return {
        name: 'proveBlockError',
        input: toHex(fn.encodeABI())
      }
    case 'INCOMING_TRANSACTIONS_INDEX':
      fn = context.blockErrorProver.methods.proveIncomingTransactionIndexError(
        convertHeaderForWeb3x(error.parent),
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header)
      );
      return {
        name: 'proveBlockError',
        input: toHex(fn.encodeABI())
      }
    case 'INCOMING_TRANSACTIONS_OUT_OF_RANGE':
      fn = context.blockErrorProver.methods.proveIncomingTransactionsOutOfRangeError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header)
      );
      return {
        name: 'proveBlockError',
        input: toHex(fn.encodeABI())
      }
    /* Transaction Errors */
    case 'INVALID_CREATE_TX':
      fn = context.executionErrorProver.methods.proveInvalidCreateTransaction(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(<BufferLike> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex)
      );
      return {
        name: 'proveExecutionError',
        input: toHex(fn.encodeABI())
      }
    case 'INSUFFICIENT_GAS':
      fn = context.executionErrorProver.methods.proveInsufficientGasError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(<BufferLike> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex)
      );
      return {
        name: 'proveExecutionError',
        input: toHex(fn.encodeABI())
      }
    case 'INSUFFICIENT_BALANCE':
      fn = context.executionErrorProver.methods.proveInsufficientBalanceError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(<BufferLike> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex),
        toHex(error.previousRootProof),
        toHex(error.stateProof)
      );
      return {
        name: 'proveExecutionError',
        input: toHex(fn.encodeABI())
      }
    case 'INVALID_NONCE':
      fn = context.executionErrorProver.methods.proveInvalidNonceError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(<BufferLike> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex),
        toHex(error.previousRootProof),
        toHex(error.stateProof)
      );
      return {
        name: 'proveExecutionError',
        input: toHex(fn.encodeABI())
      }
    case 'SIMPLE_INCOMING_TX':
      fn = context.executionErrorProver.methods.proveSimpleIncomingTransactionExecutionError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        convertIncomingTransactionForWeb3x(<IncomingTransaction> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex),
        toHex(error.previousRootProof),
        toHex(error.receiverProof)
      );
      return {
        name: 'proveExecutionError',
        input: toHex(fn.encodeABI())
      }
    case 'SIMPLE_SIGNED_TX':
      fn = context.executionErrorProver.methods.proveSimpleSignedTransactionExecutionError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(<BufferLike> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex),
        toHex(error.previousRootProof),
        toHex(error.callerProof),
        toHex(error.receiverProof),
        toHex(error.operatorProof)
      );
      return {
        name: 'proveExecutionError',
        input: toHex(fn.encodeABI())
      }
    /* Encoding Errors */
    case 'TX_SIGNATURE':
      fn = context.encodingErrorProver.methods.proveTransactionSignatureError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(<BufferLike> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex)
      );
      return {
        name: 'proveEncodingError',
        input: toHex(fn.encodeABI())
      }
    case 'INCOMING_TX_ENCODING':
      fn = context.encodingErrorProver.methods.proveIncomingTransactionEncodingError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(<BufferLike> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex)
      );
      return {
        name: 'proveEncodingError',
        input: toHex(fn.encodeABI())
      }
    case 'SIGNED_TX_ENCODING':
      fn = context.encodingErrorProver.methods.proveSignedTransactionEncodingError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        toHex(<BufferLike> error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex)
      );
      return {
        name: 'proveEncodingError',
        input: toHex(fn.encodeABI())
      }
    case 'WITNESS_ENCODING':
      fn = context.encodingErrorProver.methods.proveMessageWitnessEncodingError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.transactionIndex,
        error.messageWitness
      )
      return {
        name: 'proveEncodingError',
        input: toHex(fn.encodeABI())
      }
    case 'EXIT_WITNESS_ENCODING_ERROR':
      fn = context.encodingErrorProver.methods.proveExitWitnessEncodingError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.transactionIndex,
        error.messageWitness
      )
      return {
        name: 'proveEncodingError',
        input: toHex(fn.encodeABI())
      }
    case 'ACCESS_RECORD_ENCODING':
      fn = context.encodingErrorProver.methods.proveAccessRecordEncodingError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.transactionIndex,
        error.recordIndex,
        error.messageWitness
      );
      return {
        name: 'proveEncodingError',
        input: toHex(fn.encodeABI())
      }
    case 'EXIT_CALL_ENCODING':
      fn = context.encodingErrorProver.methods.proveExitCallEncodingError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.transactionIndex,
        error.messageWitness,
        error.calldata,
        error.recordIndex
      )
      return {
        name: 'proveEncodingError',
        input: toHex(fn.encodeABI())
      }
    /* Witness Errors */
    case 'EXIT_CALL_WITNESS_GAS':
      fn = context.witnessErrorProver.methods.proveExitCallWitnessGasError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.transactionIndex,
        error.messageWitness
      )
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    case 'EXIT_CALL_WITNESS_EXIT_ROOT':
      console.log('about to send fraud proof for EXIT_CALL_WITNESS_EXIT_ROOT')
      console.log(decodeMessageWitness(error.messageWitness))
      fn = context.witnessErrorProver.methods.proveExitCallWitnessExitRootError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        error.transactionIndex,
        error.messageWitness,
        error.stateProofBytes,
        error.storageProofBytes,
        error.leafProofBytes
      )
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    case 'INPUT_STATE_ROOT':
      fn = context.witnessErrorProver.methods.proveWitnessEntryRootError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        encodeTransactionForProof(error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex),
        toHex(error.previousRootProof),
        error.messageWitness,
        error.stateProof1,
        error.stateProof2
      )
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    case 'WITNESS_CONTEXT':
      fn = context.witnessErrorProver.methods.proveWitnessContextError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        encodeTransactionForProof(error.transaction),
        error.transactionIndex,
        error.siblings.map(toHex),
        error.messageWitness
      );
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    case 'WITNESS_GAS_EXCEEDED_ERROR':
      fn = context.witnessErrorProver.methods.proveWitnessGasExceededError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.transactionIndex,
        error.messageWitness
      );
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    case 'WITNESS_REFUND':
      fn = context.witnessErrorProver.methods.proveWitnessRefundError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.transactionIndex,
        error.messageWitness
      );
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    case 'SIGNED_TX_STATE_ROOT_FAILURE':
      fn = context.witnessErrorProver.methods.proveFailedSignedTransactionStateRootError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        {
          transactionBytes: toHex(error.transaction as BufferLike),
          transactionIndex: error.transactionIndex,
          siblings: error.siblings.map(toHex)
        },
        error.messageWitness,
        error.previousRootProof,
        error.callerProof,
        error.operatorProof
      );
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    case 'SIGNED_TX_STATE_ROOT_SUCCESS':
      fn = context.witnessErrorProver.methods.proveSuccessfulSignedTransactionStateRootError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        {
          transactionBytes: toHex(error.transaction as BufferLike),
          transactionIndex: error.transactionIndex,
          siblings: error.siblings.map(toHex)
        },
        error.messageWitness,
        error.callerProof,
        error.operatorProof
      );
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    case 'INCOMING_TX_STATE_ROOT_SUCCESS':
      fn = context.witnessErrorProver.methods.proveSuccessfulIncomingTransactionStateRootError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        convertHeaderForWeb3x(error.header),
        encodeTransactionForProof(error.transaction as IncomingTransaction),
        error.transactionIndex,
        error.siblings.map(toHex),
        error.messageWitness
      )
      return {
        name: 'proveWitnessError',
        input: toHex(fn.encodeABI())
      }
    /* Access Record Errors */
    case 'CHAINID':
      fn = context.accessErrorProver.methods.proveChainIdError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex
      );
      return {
        name: 'proveAccessError',
        input: toHex(fn.encodeABI())
      }
    case 'BALANCE':
      fn = context.accessErrorProver.methods.proveBalanceError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        error.accountProof
      );
      return {
        name: 'proveAccessError',
        input: toHex(fn.encodeABI())
      }
    case 'SELFBALANCE':
      fn = context.accessErrorProver.methods.proveSelfBalanceError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        error.accountProof
      );
      return {
        name: 'proveAccessError',
        
        input: toHex(fn.encodeABI())
      }
    case 'EXTCODECOPY':
      fn = context.accessErrorProver.methods.proveExtCodeCopyError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        error.accountProof
      );
      return {
        name: 'proveAccessError',
        
        input: toHex(fn.encodeABI())
      }
    case 'EXTCODEHASH':
      fn = context.accessErrorProver.methods.proveExtCodeHashError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        error.accountProof
      );
      return {
        name: 'proveAccessError',
        
        input: toHex(fn.encodeABI())
      }
    case 'EXTCODESIZE':
      fn = context.accessErrorProver.methods.proveExtCodeSizeError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        error.accountProof
      );
      return {
        name: 'proveAccessError',
        input: toHex(fn.encodeABI())
      }
    case 'COINBASE':
      fn = context.accessErrorProver.methods.proveCoinbaseError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex
      );
      return {
        name: 'proveAccessError',
        
        input: toHex(fn.encodeABI())
      }
    case 'NUMBER':
      fn = context.accessErrorProver.methods.proveNumberError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        convertHeaderForWeb3x(error.header)
      );
      return {
        name: 'proveAccessError',
        
        input: toHex(fn.encodeABI())
      }
    case 'SLOAD':
      fn = context.accessErrorProver.methods.proveSloadError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        toHex(error.accountProof),
        toHex(error.storageProof)
      );
      return {
        name: 'proveAccessError',
        
        input: toHex(fn.encodeABI())
      }
    case 'SSTORE':
      fn = context.accessErrorProver.methods.proveSstoreError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        toHex(error.accountProof),
        toHex(error.storageProof)
      );
      return {
        name: 'proveAccessError',
        input: toHex(fn.encodeABI())
      }
    case 'TIMESTAMP':
      fn = context.accessErrorProver.methods.proveTimestampError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        convertHeaderForWeb3x(error.header)
      );
      return {
        name: 'proveAccessError',
        input: toHex(fn.encodeABI())
      }
    case 'CALL':
      fn = context.accessErrorProver.methods.proveCallError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        error.callerProof,
        error.receiverProof
      )
      return {
        name: 'proveAccessError',
        input: toHex(fn.encodeABI())
      }
    case 'STATICCALL':
      fn = context.accessErrorProver.methods.proveStaticCallError(
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        error.calldata
      )
      return {
        name: 'proveAccessError',
        input: toHex(fn.encodeABI())
      }
    case 'EXIT_CALL':
      fn = context.accessErrorProver.methods.proveExitCallError(
        convertHeaderForWeb3x(error.header),
        convertCommitmentQueryForWeb3x(error.commitmentQuery),
        error.messageWitness,
        error.transactionIndex,
        error.recordIndex,
        error.calldata,
        error.callerProof,
        error.stateProofBytes,
        error.storageProofBytes,
        error.leafProofBytes
      );
      return {
        name: 'proveAccessError',
        input: toHex(fn.encodeABI())
      }
  }
}

export function encodeChallengeTransactionInput(
  context: ParentContext,
  err: ChallengeRequiredError
): FunctionCallInput {
  const fn = context.challengeManager.methods.challengeTransaction(
    convertCommitmentQueryForWeb3x(err.challengeData.commitmentQuery),
    convertHeaderForWeb3x(err.challengeData.header),
    err.challengeData.transactionIndex
  );
  return {
    name: 'challengeStep',
    input: toHex(fn.encodeABI())
  }
}