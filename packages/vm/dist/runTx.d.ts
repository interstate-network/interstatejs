import BN = require('bn.js');
import { Transaction } from '@interstatejs/tx';
import VM from './index';
import Bloom from './bloom';
import { EVMResult } from './evm/evm';
import { Block } from '@interstatejs/block';
export interface RunTxOpts {
    block?: Block;
    tx: Transaction;
    skipNonce?: boolean;
    skipBalance?: boolean;
}
export interface RunTxResult extends EVMResult {
    bloom: Bloom;
    amountSpent: BN;
    stateRoot: BN;
    gasRefund?: BN;
}
export default function runTx(this: VM, opts: RunTxOpts): Promise<RunTxResult>;
