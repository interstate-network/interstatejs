import { Address } from 'web3x/address';
import { Block, ChallengeResponseData } from '@interstatejs/block';
import { EventEmitter } from 'events';
import ParentListener from "../parent-listeners";
import { BlockSubmissionData } from "../parent-listeners/block-submission-listener";
import { BlockAuditor } from "./block-auditor";
import { ExecutionAuditor } from './execution-auditor';
import { Database } from "../db";
import { ProvableError } from "./witness-auditors/helpers";
import { ChallengeRequiredError, HeaderCommitment, ChallengeSubmissionData, ErrorProof } from "./proof-types";
import { ParentContext } from "../lib/parent-context";
import { encodeChallengeTransactionInput, encodeErrorProofInput } from "./function-map";
import { ChainPegTransactionReceipt } from '@interstatejs/contracts';
import { auditWitness } from './witness-auditors';
import { toHex } from '@interstatejs/utils';
import { CHALLENGE_BOND } from '../lib/constants';

export interface Auditor {
  start(): Promise<void>
  on(event: 'block-ok', listener: (block: Block) => void): this;
  on(event: 'witness-ok', listener: (response: ChallengeResponseData) => void): this;
  on(event: 'provable-error', listener: (errType: string) => void): this;
  on(event: 'error-proof-receipt', listener: (receipt: ChainPegTransactionReceipt) => void): this;
  on(event: 'challenge-receipt', listener: (receipt: ChainPegTransactionReceipt) => void): this;
  on(event: 'provable-error-full', listener: (err: ErrorProof) => void): this;
}

export class Auditor extends EventEmitter {
  constructor(
    public db: Database,
    public context: ParentContext,
    public from: Address,
    public listener: ParentListener
  ) {
    super();
    this.listener.on(
      'block-submitted',
      (event) => {
        this.handleBlockSubmission(event);
      }
    );
    this.listener.on(
      'challenge-response',
      (event: ChallengeResponseData) => {
        this.handleChallengeResponse(event);
      }
    )
  }

  async start() {
    await this.listener.startListeners();
  }

  static async create(context: ParentContext, dbPath?: string) {
    const [from] = await context.eth.getAccounts();
    const db = await Database.create(dbPath);
    const listener = await ParentListener.create(context, db);
    return new Auditor(db, context, from, listener);
  }

  async challengeBlock(err: ChallengeRequiredError): Promise<ChainPegTransactionReceipt> {
    await this.db.putBlock(err.block);
    const input = encodeChallengeTransactionInput(this.context, err);
    console.log(`Challenging block tx index - ${err.challengeData.transactionIndex}`)
    console.log(`Block tx root - ${err.block.transactions[err.challengeData.transactionIndex].stateRoot.toString('hex')}`)
    const fn = this.context.peg.methods.challengeStep(input.input);
    const receipt = await fn.send({
      from: this.from,
      gas: 5e6,
      value: CHALLENGE_BOND
    }).getReceipt();
    this.emit('challenge-receipt', receipt);
    return receipt;
  }

  async proveError(err: ProvableError) {
    this.emit('provable-error', err.error._type);
    this.emit('provable-error-full', err.error);
    const input = await encodeErrorProofInput(this.context, err);
    const fn = this.context.peg.methods[input.name](input.input)
    console.log(`caught err ${err.error._type   }`)
    try {
      const receipt: ChainPegTransactionReceipt = await fn.send({
        from: this.from,
        gas: 6e6
      }).getReceipt();
      console.log(`Error Proof Cost: ${err.error._type} -- ${receipt.gasUsed}`)
      this.emit('error-proof-receipt', receipt);
    } catch (err) {
      console.log('error sending error proof')
      console.log(err)
    }
  }

  async handleBlockSubmission(event: BlockSubmissionData) {
    try {
      const block = await BlockAuditor.auditBlockInput(
        this.db,
        this.listener.incomingTransactionListener,
        event.calldata,
        event.submittedAt,
        event.childIndex
      );
      this.emit('got-block', block);
      await ExecutionAuditor.auditExecution(block, this.db);
      await this.db.putBlock(block);
      this.emit('block-ok', block);
      console.log(`Audited block and found no errors.`)
    } catch (err) {
      console.log(`Caught error auditing block.`)
      if (err instanceof ProvableError) {
        console.log(`Caught provable error auditing block ${err.error._type}.`)
        await this.proveError(err);
      } else if (err instanceof ChallengeRequiredError) {
        console.log(`Caught error in block that requires witness to prove.`)
        await this.challengeBlock(err);
      } else {
        console.log(`Caught unexpected error`);
        console.log(err)
        // throw err;
      }
    }
  }

  async handleChallengeResponse(event: ChallengeResponseData) {
    const { blockHash, transactionIndex, witness } = event;
    try {
      await auditWitness(
        this.db,
        toHex(blockHash),
        transactionIndex,
        toHex(witness)
      )
      this.emit('witness-ok', event);
    } catch (err) {
      if (err instanceof ProvableError) {
        console.log(`Caught provable error auditing witness.`)
        await this.proveError(err);
      } else {
        console.log(`Caught unexpected error auditing witness.`);
        console.log(err)
      }
    }
  }
}