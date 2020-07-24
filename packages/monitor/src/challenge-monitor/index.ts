import { Address } from 'web3x/address';
import { BlockChallengeEvent } from "@interstatejs/contracts";
import { BufferLike, StateTree, common, toBn, toHex } from "@interstatejs/utils";
import VM from "@interstatejs/vm";
import { TransactionChallengeData, Block } from "@interstatejs/block";
import { ParentContext } from "../lib/parent-context";
import { Database } from "../db";
import ParentListener from "../parent-listeners";
import { isEqual } from '../auditor/witness-auditors/helpers';

export async function getVMForTransaction(
  db: Database,
  block: Block,
  transactionIndex: number
): Promise<VM> {
  const parent = await db.getBlock(block.header.parentHash);
  const state = await db.getStateTree(parent.header.stateRoot);

  const vm = await VM.create({ state, produceWitness: true });

  for (let i = 0; i < transactionIndex; i++) {
    const tx = block.transactions[i];
    await vm.runTx({ tx, block });
  }
  return vm;
}

/**
 * Listens to challenges for blocks submitted by the operator
 * and responds to them with message witnesses.
 */
export class ChallengeMonitor {
  constructor(
    public context: ParentContext,
    public database: Database,
    public listener: ParentListener,
    public from: Address
  ) {}

  static async create(context: ParentContext, dbPath?: string): Promise<ChallengeMonitor> {
    const db = await Database.create(dbPath);
    const listener = new ParentListener(context, db);
    const [ from ] = await context.eth.getAccounts();
    const monitor = new ChallengeMonitor(context, db, listener, from);
    monitor.start();
    await listener.startListeners();
    return monitor;
  }

  async handleChallenge(challenge: TransactionChallengeData) {
    console.log('handling challenge')
    const { blockHash, transactionIndex } = challenge;
    const block = await this.database.getBlock(blockHash);
    if (!isEqual(block.header.coinbase, this.from.toBuffer())) return;
    const vm = await getVMForTransaction(this.database, block, transactionIndex);
    const tx = block.transactions[transactionIndex];
    const res = await vm.runTx({ block, tx });
    const witness = res.execResult.witnesses[0];

    const fn = this.context.challengeManager.methods.respondToChallenge(
      toHex(blockHash),
      transactionIndex,
      toHex(witness.encode())
    );
    const calldata = toHex(fn.encodeABI());
    await this.context.peg.methods.challengeStep(calldata).send({
      from: this.from,
    });
    console.log(`Submitted challenge response`)
  }

  start() {
    this.listener.on(
      'block-challenged',
      (challenge: TransactionChallengeData) => this.handleChallenge(challenge)
    )
  }
}

export default ChallengeMonitor;