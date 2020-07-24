import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';
import { LegacyProviderAdapter } from 'web3x/providers';
import { deployPeg } from '@interstatejs/contracts/test-utils';
import { expect } from 'chai';
import { BN } from 'ethereumjs-util';
import { IncomingTransaction } from '@interstatejs/tx';
import { ParentRelayTransactionReceipt } from '@interstatejs/contracts';
import { toHex, toInt } from '@interstatejs/utils/src/utils';
import { ParentContext } from '../../src/lib/parent-context';
import { ParentListener } from '../../src/parent-listeners';

describe('ParentListener', () => {
  let context: ParentContext;
  let eth: Eth;
  let accounts: Address[];
  let listener: ParentListener;
  let prom: Promise<IncomingTransaction>;
  let receipt: ParentRelayTransactionReceipt;
  let parentRelay: any, archiveFactory: any, peg: any,
    archiveInitializerCode: any, web3: any, from: string;
  let accessErrorProver, blockErrorProver,
    executionErrorProver, transactionErrorProver, challengeManager;

  before(async () => {
    ({
      parentRelay,
      archiveFactory,
      peg,
      web3,
      archiveInitializerCode,
      from,
      challengeManager,
      accessErrorProver,
      blockErrorProver,
      executionErrorProver,
      transactionErrorProver
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
    );
    listener = await ParentListener.create(context);
    prom = new Promise(
      (resolve) => listener.incomingTransactionListener.on(
        'incoming-transaction', (tx: IncomingTransaction) => {
          if (toInt(tx.itxIndex) == 1) resolve(tx)
        }
      )
    );
    await listener.startListeners();
  });

  it('Submits an incoming transaction', async () => {
    receipt = await context.relay.methods.addTransaction(
      accounts[1],
      new BN(50000),
      '0x'
    ).send({ from: accounts[0] }).getReceipt();
  });

  it('Contract emits an IncomingTransactionQueued event with the transaction details', () => {
    expect(receipt.events).to.exist;
    expect(receipt.events.IncomingTransactionQueued).to.exist;
    expect(receipt.events.IncomingTransactionQueued.length).to.eq(1);
    const {
      from, to, gas, value, data
    } = receipt.events.IncomingTransactionQueued[0].returnValues.transaction;
    expect(from.equals(accounts[0])).to.be.true;
    expect(to.equals(accounts[1])).to.be.true;
    expect(gas).to.eq('50000');
    expect(value).to.eq('0');
    expect(data).to.eq('0x');
  });

  it('Listener catches transaction', async () => {
    const tx = await prom;
    const { from, to, gasLimit, value, data } = tx;
    expect(toHex(from)).to.eq(toHex(accounts[0].toBuffer()));
    expect(toHex(to)).to.eq(toHex(accounts[1].toBuffer()));
    expect(toHex(gasLimit)).to.eq(toHex(50000));
    expect(toInt(value)).to.eq(0);
    expect(toHex(data)).to.eq('0x');
  });
});