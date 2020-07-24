import { ListenerDatabase } from "../db";
import { EventEmitter } from 'events';
import { EventLog } from "web3x/formatters";
import { Contract } from "web3x/contract";
import { Eth } from "web3x/eth";
import { Subscription } from "web3x/subscriptions";
import {
  BlockChallengeEventLog,
  BlockConfirmedEventLog,
  BlockSubmittedEventLog,
  ChallengeResponseEventLog,
  IncomingTransactionQueuedEventLog,
  ChainPeg,
  ParentRelay
} from "@interstatejs/contracts";

// type ListenerContract = ChainPeg | ParentRelay;
export type ListenerEvent = BlockChallengeEventLog |
  BlockConfirmedEventLog |
  BlockSubmittedEventLog |
  ChallengeResponseEventLog |
  IncomingTransactionQueuedEventLog;

export type EventName = 'BlockChallenge' | 'BlockConfirmed' | 'BlockSubmitted' | 'ChallengeResponse' | 'IncomingTransactionQueued';

export class EventListener<
  ListenerContract extends Contract<any>,
  ListenerEventName extends EventName,
  ListenerEvent extends EventLog<any, ListenerEventName>
> extends EventEmitter
{
  private subscription?: Subscription<ListenerEvent, ListenerEvent>;

  constructor (
    protected db: ListenerDatabase,
    protected eth: Eth,
    protected contract: ListenerContract,
    protected eventName: ListenerEventName,
    protected handleEvent: (event: ListenerEvent) => Promise<void>
  ) {
    super();
  }

  stop = () => {
    this.subscription = null;
    this.removeAllListeners();
  }

  async start(): Promise<void> {
    let latest = await this.db.getLatestBlockNumberForEvent(this.eventName);
    if (!latest) {
      const pastEvents = (await this.contract.getPastEvents(this.eventName, {})) as ListenerEvent[];
      if (pastEvents.length > 0) {
        for (let event of pastEvents) await this.handleEvent(event);
        latest = pastEvents.slice(-1)[0].blockNumber;
      } else {
        latest = await this.eth.getBlockNumber();
      }
      await this.db.updateLatestBlockNumberForEvent(this.eventName, latest);
    }

    this.subscription = this.contract.events[this.eventName](
      { fromBlock: latest },
      async (err: Error, result: ListenerEvent) => {
        console.log(`Got ${this.eventName} event log`);
        if (err) throw err;
        await this.db.updateLatestBlockNumberForEvent(this.eventName, result.blockNumber);
        await this.handleEvent(result);
      }
    );
    return;
  }
}

export default EventListener;