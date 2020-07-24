import Message from "../message";
import EVM, { EVMResult } from "../evm";
export declare function executeExitCall(this: EVM, message: Message): Promise<EVMResult>;
