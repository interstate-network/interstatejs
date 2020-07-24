import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';
import { LegacyProviderAdapter } from 'web3x/providers';
import { deployPeg } from '@interstatejs/contracts/test-utils';
import { expect } from 'chai';
import { BN, toBuffer, rlp } from 'ethereumjs-util';
import { IncomingTransaction, SignedTransaction } from '@interstatejs/tx';
import { ParentRelayTransactionReceipt, ChainPegTransactionReceipt } from '@interstatejs/contracts';
import { toHex, toInt, toBuf, sliceBuffer } from '@interstatejs/utils/src/utils';
import { ParentContext } from '../../src/lib/parent-context';
import { ParentListener } from '../../src/parent-listeners';
import { Auditor } from '../../src/auditor';
import { BadBlockBuilder } from '../utils/bad-block-builder';
import { Block, TransactionChallengeData, ChallengeResponseData } from '@interstatejs/block';
import { TxReceipt } from '@interstatejs/vm/dist/runBlock';
import ChallengeMonitor from '../../src/challenge-monitor';
import { randomHexBuffer, getMerkleRoot } from '@interstatejs/utils';
import { convertHeaderForWeb3x, convertCommitmentQueryForWeb3x } from '../../src/lib/web3x-adapters';
import { CHALLENGE_BOND, PEG_BOND } from '../../src/lib/constants';

describe('ParentListener', () => {
  let context: ParentContext;
  let eth: Eth;
  let from: Address, to: Address;
  let block: Block;
  let blockBuilder: BadBlockBuilder;
  let accounts: Address[];
  let listener: ParentListener;
  let prom: Promise<IncomingTransaction>;
  let receipt: ParentRelayTransactionReceipt;
  let parentRelay: any, archiveFactory: any, peg: any,
    archiveInitializerCode: any, web3: any, _from: string;
  let accessErrorProver, blockErrorProver, executionErrorProver,
    transactionErrorProver, challengeManager, encodingErrorProver;
  let monitor: ChallengeMonitor;

  before(async () => {
    ({
      parentRelay,
      archiveFactory,
      peg,
      web3,
      archiveInitializerCode,
      challengeManager,
      accessErrorProver,
      blockErrorProver,
      executionErrorProver,
      transactionErrorProver,
      encodingErrorProver
    } = await deployPeg());
    eth = new Eth(new LegacyProviderAdapter(web3.currentProvider));
    accounts = await eth.getAccounts();
    const networkID = await eth.getId();
    context = new ParentContext(
      eth,
      networkID,
      Address.fromString(peg.options.address),
      Address.fromString(parentRelay.options.address),
      Address.fromString(archiveFactory.options.address),
      archiveInitializerCode,
      Address.fromString(challengeManager.options.address),
      Address.fromString(accessErrorProver.options.address),
      Address.fromString(blockErrorProver.options.address),
      Address.fromString(executionErrorProver.options.address),
      Address.fromString(transactionErrorProver.options.address),
      Address.fromString(encodingErrorProver.options.address)
    );
    monitor = await ChallengeMonitor.create(context);
    blockBuilder = new BadBlockBuilder(context, monitor.listener.incomingTransactionListener);
    await blockBuilder.setBlockWithSignedTransaction();
    ([ from, to ] = await eth.getAccounts());
  });

  function challengeCreated(): Promise<TransactionChallengeData> {
    return new Promise((resolve) => {
      monitor.listener.once('block-challenged', (data) => resolve(data));
    });
  }

  function challengeResponse(): Promise<ChallengeResponseData> {
    return new Promise((resolve) => {
      monitor.listener.once('challenge-response', (data) => resolve(data))
    });
  }

  async function submitBlock(block: Block): Promise<ChainPegTransactionReceipt> {
    const receipt = await context.peg.methods.submitBlock({
      header: convertHeaderForWeb3x(block.header.encodeJSON()),
      transactions: block.transactions.map(t => toHex(t.toRollup()))
    }).send({ from, value: PEG_BOND }).getReceipt();
    const childIndex = receipt.events.BlockSubmitted[0].returnValues.childIndex;
    block.header.toCommitment({ submittedAt: receipt.blockNumber, childIndex });
    await monitor.database.putBlock(block);
    return receipt;
  }

  it('Should catch a challenge', async () => {
    const block = blockBuilder.getDefaultBlock();

    await submitBlock(block);
    const calldata = context.challengeManager.methods.challengeTransaction(
      convertCommitmentQueryForWeb3x(block.header.commitment.query),
      convertHeaderForWeb3x(block.header.encodeJSON()),
      2,
    ).encodeABI();
    
    const receipt = await context.peg.methods.challengeStep(toHex(calldata))
      .send({ from: to, value: 1e18, gas: 5e6 }).getReceipt();
    const challenge = await challengeCreated();
    expect(toHex(challenge.blockHash)).to.eq(toHex(block.hash()));
    expect(challenge.blockNumber).to.eq(receipt.blockNumber);
    expect(challenge.transactionIndex).to.eq(2);
    expect(toHex(challenge.challenger)).to.eq(toHex(to.toBuffer()));
    const response = await challengeResponse();
    expect(toHex(response.blockHash)).to.eq(toHex(block.hash()));
    expect(response.transactionIndex).to.eq(2);
  });
});