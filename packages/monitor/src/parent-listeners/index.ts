import { Database } from "../db";
import { ParentContext } from "../lib/parent-context";
import { EventEmitter } from 'events';
import { Contract } from "web3x/contract";
import {
  BlockChallengeEvent,
  ChallengeResponseEvent
} from "@interstatejs/contracts";
import { EventListener, EventName, ListenerEvent } from "./event-listener";
import IncomingTransactionListener from "./incoming-transaction-listener";
import BlockSubmissionListener, { BlockSubmissionData } from "./block-submission-listener";
import BlockConfirmationListener from "./block-confirmation-listener";
import BlockChallengeListener from './block-challenge-listener';
import { Block, ChallengeResponseData, TransactionChallengeData } from "@interstatejs/block";
import ChallengeResponseListener from "./challenge-response-listener";
import { IncomingTransaction } from "@interstatejs/tx";

interface EventListeners {
  IncomingTransactionQueued?: IncomingTransactionListener;
  BlockSubmitted?: BlockSubmissionListener;
  BlockConfirmed?: BlockConfirmationListener;
  BlockChallenge?: BlockChallengeListener;
  ChallengeResponse?: ChallengeResponseListener;
}

export interface ParentListener {
  on(
    event: 'incoming-transaction',
    listener: (transaction: IncomingTransaction, blockNumber: number) => void
  ): this;
  on(
    event: 'block-submitted',
    listener: (data: BlockSubmissionData) => void
  ): this;
  on(
    event: 'block-confirmed',
    listener: (block: Block) => void
  ): this;
  on(
    event: 'block-challenged',
    listener: (challenge: TransactionChallengeData) => void
  ): this;
  on(
    event: 'challenge-response',
    listener: (response: ChallengeResponseData) => void
  ): this;

  stopListeners(): void;
  startListeners(): Promise<void>;

  readonly incomingTransactionListener: IncomingTransactionListener;
}

export class ParentListener extends EventEmitter {
  private eventListeners: EventListeners = {};

  constructor(
    public context: ParentContext,
    public db: Database
  ) {
    super();
    Object.defineProperty(this, 'incomingTransactionListener', {
      get(): IncomingTransactionListener {
        return this.eventListeners.IncomingTransactionQueued;
      }
    });
  }

  static async create(
    context: ParentContext,
    db?: Database | string
  ): Promise<ParentListener> {
    const database = (db instanceof Database)
      ? db
      : await Database.create(db);
    return new ParentListener(context, database);
  }

  async startListeners() {
    this.eventListeners.IncomingTransactionQueued = new IncomingTransactionListener(this.db.listenerDB, this.context);
    await this.eventListeners.IncomingTransactionQueued.start();
    
    this.eventListeners.BlockSubmitted = new BlockSubmissionListener(this.db.listenerDB, this.context);
    this.eventListeners.BlockSubmitted.on(
      'block-submitted',
      (input: BlockSubmissionData) => this.emit('block-submitted', input)
    );
    await this.eventListeners.BlockSubmitted.start();

    this.eventListeners.BlockConfirmed = new BlockConfirmationListener(this.db, this.context);
    this.eventListeners.BlockConfirmed.on(
      'block-confirmed',
      (block: Block) => this.emit('block-confirmed', block)
    );
    await this.eventListeners.BlockConfirmed.start();

    this.eventListeners.BlockChallenge = new BlockChallengeListener(this.db, this.context);
    // this.eventListeners.BlockChallenge.on()
    this.eventListeners.BlockChallenge.on(
      'block-challenged',
      (challenge: TransactionChallengeData) => this.emit('block-challenged', challenge)
    );
    await this.eventListeners.BlockChallenge.start();
    
    this.eventListeners.ChallengeResponse = new ChallengeResponseListener(this.db, this.context);
    this.eventListeners.ChallengeResponse.on(
      'challenge-response',
      (challenge: ChallengeResponseData) => this.emit('challenge-response', challenge)
    );
    await this.eventListeners.ChallengeResponse.start();
  }

  stopListeners() {
    for (let listenerName of Object.keys(this.eventListeners)) {
      this.eventListeners[listenerName].stop();
      delete this.eventListeners[listenerName];
    }
  }
}

export default ParentListener;