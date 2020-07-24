import Blockchain from 'ethereumjs-blockchain';
import VM from './index';
export default function runBlockchain(this: VM, blockchain: Blockchain): Promise<void>;
