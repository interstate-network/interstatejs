import { Database } from '../../db';
import VM, {
  decodeMessageWitness, MessageWitnessAbi, decodeAccessRecord, MessageWitness,
} from '@interstatejs/vm';
import { getPrecompile, PrecompileInput } from '@interstatejs/vm/dist/evm/precompiles';
import { StateTree, toInt, toHex, copyBuffer } from '@interstatejs/utils';

import SignedTransactionWitnessAuditor from './SignedTransactionWitnessAuditor';
import { SignedTransaction, IncomingTransaction } from '@interstatejs/tx';
import WitnessAuditor from './WitnessAuditor';
import IncomingTransactionWitnessAuditor from './IncomingTransactionWitnessAuditor';
import { ProvableError } from './helpers';
import { Block } from '@interstatejs/block';
export * from './WitnessAuditor';


const ABI = require('web3-eth-abi');

function decodeWitness(bytes: string, block: Block, transactionIndex: number): MessageWitness {
  try {
    const witness = decodeMessageWitness(bytes);
    return witness;
  } catch (err) {
    try {
      const baseDecoded = ABI.decodeParameter(MessageWitnessAbi, bytes);
      for (let i = 0; i < baseDecoded.state_access_list.length; i++) {
        try {
          decodeAccessRecord(baseDecoded.state_access_list[i]);
        } catch (err) {
          throw new ProvableError({
            _type: 'ACCESS_RECORD_ENCODING',
            commitmentQuery: block.header.commitment.query,
            transactionIndex,
            messageWitness: bytes,
            recordIndex: i
          });
        }
      }
    } catch(err) {
      throw new ProvableError({
        _type: 'WITNESS_ENCODING',
        commitmentQuery: block.header.commitment.query,
        transactionIndex,
        messageWitness: bytes
      })
    }
  }
}

export async function auditWitness(
  db: Database,
  blockHash: string,
  transactionIndex: number,
  witness: string
): Promise<void> {
  const block = await db.getBlock(blockHash);
  const parent = await db.getBlock(block.header.parentHash);
  const tree = await db.getStateTree(parent.header.stateRoot);
  const vm = await VM.create({ state: tree, produceWitness: true });
  for (let i = 0; i < transactionIndex; i++) {
    const tx = block.transactions[i];
    await vm.runTx({ tx, block });
  }
  const state = new StateTree(tree);
  const transaction = block.transactions[transactionIndex];
  const decodedWitness = decodeWitness(witness, block, transactionIndex);
  const stateRoot = copyBuffer(transaction.stateRoot);
  state.checkpoint();
  const {
    execResult: { witnesses: [ calculatedWitness ] }
  } = await vm.runTx({ tx: transaction, block });
  transaction.stateRoot = stateRoot;
  await state.revert();
  let auditor: WitnessAuditor;
  if (transactionIndex < toInt(block.header.incomingTransactionsCount)) {
    auditor = new IncomingTransactionWitnessAuditor(
      db,
      block,
      state,
      <IncomingTransaction> transaction,
      transactionIndex,
      decodedWitness,
      calculatedWitness 
    );
  } else {
    auditor = new SignedTransactionWitnessAuditor(
      db,
      block,
      state,
      <SignedTransaction> transaction,
      transactionIndex,
      decodedWitness,
      calculatedWitness 
    );
  }
  await auditor.checkAll();
  console.log('Audited witness and found no errors')
}