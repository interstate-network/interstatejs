// setupAccessListFraudTest
// proveAccessListFraud
import { BlockHeaderData } from '@interstatejs/block';
import { MessageWitness } from '@interstatejs/vm';
import { Eth } from 'web3x/eth';
import { bufferToHex, BN } from 'ethereumjs-util';
import Account from 'ethereumjs-account'
import { expect } from 'chai';
import crypto from 'crypto';

import { deployFraudMock } from '../../test-utils';
import { MockFraudProver, AccessListFraud } from '../../lib';

const Trie = require('../libraries/merkle-patricia-tree/lib');

function randomHexString(size: number): string {
  const bytes = crypto.randomBytes(size);
  return bufferToHex(bytes);
}

const defaultHeader: BlockHeaderData = {
  parentHash: randomHexString(32),
  number: 2,
  incomingTransactionsIndex: 0,
  incomingTransactionsCount: 0,
  transactionsCount: 1,
  transactionsRoot: randomHexString(32),
  stateRoot: randomHexString(32),
  exitsRoot: randomHexString(32),
  coinbase: randomHexString(20),
  timestamp: 50,
}

describe('Access List Fraud', async () => {
  let prover: MockFraudProver;
  let access: AccessListFraud;
  let web3: Eth;
  before(async () => {
    ({access, prover, web3} = await deployFraudMock());
    const x: MessageWitness
    prover.methods.setupAccessListFraudTest(defaultHeader, )
  })
});
