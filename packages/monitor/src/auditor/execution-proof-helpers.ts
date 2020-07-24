import { StateTree, BufferLike, toBn } from "@interstatejs/utils";
import { BN } from "ethereumjs-util";
import { bufferToHex } from "ethereumjs-util";
import { toBuffer } from "ethereumjs-util";

// class ExecutionStateTree extends StateTree {

  
// }

export type StateUpdateProof = {
  stateRoot: string; // root hash of the trie before the update
  address: BufferLike; // address of the modified account
  stateProof: string; // state proof of the account prior to the update
}

export async function subtractBalanceAndIncrementNonce(
  trie: StateTree, address: BufferLike, value: BN
): Promise<StateUpdateProof> {
  const stateRoot = bufferToHex(trie.root);
  const stateProof = await trie.getAccountProof(address);
  const account = await trie.getAccount(address);
  account.nonce = toBuffer(toBn(account.nonce).addn(1));
  account.balance = toBuffer(toBn(account.balance).sub(value));
  await trie.putAccount(address, account);
  return { stateRoot, stateProof, address };
}

export async function increaseBalance(
  trie: StateTree, address: BufferLike, value: BN
): Promise<StateUpdateProof> {
  const stateRoot = bufferToHex(trie.root);
  const stateProof = await trie.getAccountProof(address);
  const account = await trie.getAccount(address);
  account.balance = toBuffer(toBn(account.balance).add(value));
  await trie.putAccount(address, account);
  return { stateRoot, stateProof, address };
}