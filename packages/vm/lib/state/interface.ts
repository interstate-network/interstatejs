import Account from '@interstatejs/account'
import { ChildRelay } from '@interstatejs/utils';

/**
 * Storage values of an account
 */
export interface StorageDump {
  [key: string]: string
}

export interface StateManager {
  relayAddress: Buffer
  // copy(): StateManager
  isContract(address: Buffer): Promise<boolean>
  getChildRelay(blockNumber: number): Promise<ChildRelay>
  getExitsRoot(blockNumber: number): Promise<Buffer>
  getAccount(address: Buffer): Promise<Account>
  putAccount(address: Buffer, account: Account): Promise<void>
  touchAccount(address: Buffer): void
  putContractCode(address: Buffer, value: Buffer): Promise<void>
  getContractCode(address: Buffer): Promise<Buffer>
  getContractStorage(address: Buffer, key: Buffer): Promise<Buffer>
  getOriginalContractStorage(address: Buffer, key: Buffer): Promise<Buffer>
  putContractStorage(address: Buffer, key: Buffer, value: Buffer): Promise<void>
  clearContractStorage(address: Buffer): Promise<void>
  checkpoint(): Promise<void>
  commit(): Promise<void>
  revert(): Promise<void>
  getStateRoot(): Promise<Buffer>
  setStateRoot(stateRoot: Buffer): Promise<void>
  // dumpStorage(address: Buffer): Promise<StorageDump>
  hasGenesisState(): Promise<boolean>
  generateCanonicalGenesis(): Promise<void>
  generateGenesis(initState: any): Promise<void>
  accountIsEmpty(address: Buffer): Promise<boolean>
  cleanupTouchedAccounts(): Promise<void>
}
