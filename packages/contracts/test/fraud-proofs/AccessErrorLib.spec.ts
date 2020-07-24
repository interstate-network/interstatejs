import Trie from 'merkle-patricia-tree/secure';
import { expect } from 'chai';
import { getWeb3 } from '../../test-utils/web3';
import { compile } from '../../test-utils/compile';
import VM from '@interstatejs/vm';

const sstoreCode = `6020600055`;
const sloadCode = `6020600055600054`;

describe('AccessErrorLib', () => {
  let trie;
  before(() => {
    trie = new Trie();
  });

  describe('SSTORE', async () => {
    let trie: Trie;
    let vm: VM;
    before(() => {
      trie = new Trie();
      vm = new VM({
        produceWitness: true,
        state: trie
      });
    });

    it('Should deploy an SSTORE contract', async () => {
      
    });
  })
  it('Should test SSTORE', async () => {

  })
})
