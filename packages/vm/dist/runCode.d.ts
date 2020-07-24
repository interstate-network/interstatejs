/// <reference types="node" />
import VM from './index';
import TxContext from './evm/txContext';
import Message from './evm/message';
import { default as EVM, ExecResult } from './evm/evm';
export interface RunCodeOpts {
    block?: any;
    evm?: EVM;
    txContext?: TxContext;
    gasPrice?: Buffer;
    origin?: Buffer;
    message?: Message;
    caller?: Buffer;
    code?: Buffer;
    data?: Buffer;
    gasLimit?: Buffer;
    value?: Buffer;
    depth?: number;
    isStatic?: boolean;
    selfdestruct?: {
        [k: string]: boolean;
    };
    address?: Buffer;
    pc?: number;
}
export default function runCode(this: VM, opts: RunCodeOpts): Promise<ExecResult>;
