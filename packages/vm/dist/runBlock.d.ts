/// <reference types="node" />
import VM from './index';
import { RunTxResult } from './runTx';
import { Block } from '@interstatejs/block';
export interface RunBlockOpts {
    block: Block;
    root?: Buffer;
    generate?: boolean;
    skipBlockValidation?: boolean;
}
export interface RunBlockResult {
    receipts: TxReceipt[];
    results: RunTxResult[];
}
export interface TxReceipt {
    status: 0 | 1;
    gasUsed: Buffer;
    bitvector: Buffer;
    logs: any[];
}
export default function runBlock(this: VM, opts: RunBlockOpts): Promise<RunBlockResult>;
