import { Auditor } from '../../src/auditor';
import { Block, TransactionChallengeData } from '@interstatejs/block';
import { ChainPegTransactionReceipt } from '@interstatejs/contracts';
import { ErrorProof } from '../../src/auditor/proof-types';

export class TestAuditor extends Auditor {
  fullProvableErrorEvent(): Promise<ErrorProof> {
    return new Promise((resolve) => {
      this.once('provable-error-full', (errType: ErrorProof) => resolve(errType))
    });
  }
  provableErrorEvent(): Promise<string> {
    return new Promise((resolve) => {
      this.once('provable-error', (errType) => resolve(errType))
    });
  }

  errorProofReceipt(): Promise<ChainPegTransactionReceipt> {
    return new Promise((resolve) => {
      this.once('error-proof-receipt', receipt => resolve(receipt))
    });
  }

  blockOK(): Promise<Block> {
    return new Promise((resolve) => {
      this.once('block-ok', block => resolve(block))
    });
  }

  transactionChallenge(): Promise<TransactionChallengeData> {
    return new Promise((resolve) => {
      this.listener.once('block-challenged', event => resolve(event))
    });
  }

  challengeReceipt(): Promise<ChainPegTransactionReceipt> {
    return new Promise((resolve) => {
      this.once('challenge-receipt', block => resolve(block))
    });
  }
}

export default TestAuditor;