/// <reference types="node" />
import VM from './index';
import { EVMResult } from './evm/evm';
export interface RunCallOpts {
    block?: any;
    gasPrice?: Buffer;
    origin?: Buffer;
    caller?: Buffer;
    gasLimit?: Buffer;
    to?: Buffer;
    value?: Buffer;
    data?: Buffer;
    code?: Buffer;
    depth?: number;
    compiled?: boolean;
    static?: boolean;
    salt?: Buffer;
    selfdestruct?: {
        [k: string]: boolean;
    };
    delegatecall?: boolean;
}
export default function runCall(this: VM, opts: RunCallOpts): Promise<EVMResult>;
