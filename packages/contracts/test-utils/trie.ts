import { addHexPrefix, toBuffer, bufferToHex, rlp, BN, setLength } from 'ethereumjs-util';
import Account from 'ethereumjs-account';
import VM from '@interstatejs/vm';
const Trie = require('merkle-patricia-tree/secure');
const emptyStorageRoot = toBuffer('0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421');
const proofLib = require('./proof-lib');

export const isHex = (str: string): boolean => Boolean(/[xabcdef]/g.exec(str));

export interface TransformableToBuffer {
  toBuffer(): Buffer
}

export type BufferLike = string | number | BN | Buffer | TransformableToBuffer

export function isBufferLike(input: any): input is BufferLike {
  return (
    typeof input == 'string' ||
    typeof input == 'number' ||
    Buffer.isBuffer(input) ||
    BN.isBN(input) ||
    "toBuffer" in input
  );
}

export const toHex = (value: BufferLike): string => {
  if (typeof value == 'number') return addHexPrefix(value.toString(16));
  if (typeof value == 'string') {
    if (value.slice(0, 2) == '0x') return value;
    if (isHex) return addHexPrefix(value);
    return toHex(toBn(value));
  }
  if (Buffer.isBuffer(value)) return bufferToHex(value);
  if (BN.isBN(value)) return addHexPrefix(value.toString('hex'));
  return bufferToHex(value.toBuffer());
}

export const toBn = (value: BufferLike): BN => {
  if (BN.isBN(value)) return value;
  if (typeof value == 'number') return new BN(value);
  if (typeof value == 'string') return new BN(value, isHex(value) ? 'hex' : undefined);
  if (Buffer.isBuffer(value)) return new BN(value);
  return new BN(value.toBuffer());
}

export const toBuf32 = (value: BufferLike): Buffer => toBn(value).toArrayLike(Buffer, 'be', 32);

export class TrieWrapper {
  public lib: any;
  constructor(public trie: any) {
    this.lib = proofLib(trie);
  }

  get = (key: BufferLike): Promise<Buffer> => this.lib.get(key);
  del = (key: BufferLike): Promise<void> => this.lib.del(key);
  prove = (key: BufferLike): Promise<string> => this.lib.prove(key);
}

export class StorageTrie extends TrieWrapper {
  get = (key: BufferLike): Promise<Buffer> => this.lib.get(toBuf32(key));
  put = async (key: BufferLike, value: BufferLike): Promise<string> => {
    await this.lib.put(toBuf32(key), rlp.encode(toBuffer(value)));
    return this.prove(key);
  }
  prove = (key: BufferLike): Promise<string> => this.lib.prove(toBuf32(key));
}

export class StateTrie extends TrieWrapper {
  static fromVM(vm: VM): StateTrie {
    return new StateTrie(vm.stateManager._trie);
  }

  async getAccount(address: BufferLike): Promise<Account> {
    const val = await this.lib.get(toHex(address)).catch(err => null);
    return new Account(val || undefined);
  }

  async putAccount(address: BufferLike, account: Account) {
    await this.lib.put(toHex(address), account.serialize());
  }

  async getAccountProof(address: BufferLike): Promise<{
    account: Account,
    proof: any
  }> {
    const account = await this.getAccount(toHex(address));
    const proof = await this.lib.prove(toHex(address));
    return { account, proof };
  }

  async getAccountStorageTrie(address: BufferLike): Promise<StorageTrie> {
    const account = await this.getAccount(address);

    let trie: any
    if (account.stateRoot.equals(emptyStorageRoot)) {
      trie = new Trie();
    } else {
      trie = this.trie.copy();
      trie.root = account.stateRoot;
      trie._checkpoints = [];
    }
    return new StorageTrie(trie);
  }

  async getAccountStorageProof(address: BufferLike, key: BufferLike): Promise<{
    value: Buffer,
    proof: string
  }> {
    const trie = await this.getAccountStorageTrie(address);
    const value = await trie.get(key);
    const proof = await trie.prove(key);
    return { value, proof };
  }
}

// export class ProofTrie {
//   public lib: any;
//   constructor(public trie: any) {
//     this.trie = trie;
//     this.lib = proofLib(trie);
//   }

//   async getAccount(address: string): Promise<Account> {
//     const val = await this.lib.get(address).catch(err => null);
//     return new Account(val || undefined);
//   }

//   async getAccountProof(address: string): Promise<{
//     account: Account,
//     proof: any
//   }> {
//     const account = await this.getAccount(address);
//     const proof = await this.lib.prove(address);
//     return { account, proof };
//   }

//   async getAccountStorageTrie(account: Account): Promise<ProofTrie> {
//     let trie: any
//     if (account.stateRoot.equals(emptyStorageRoot)) {
//       trie = new Trie();
//     } else {
//       trie = this.trie.copy();
//       trie.root = account.stateRoot;
//       trie._checkpoints = [];
//     }
//     return new ProofTrie(trie);
//   }

//   async getStorageProof(address: string, slot: BN): Promise<{
//     account: Account,
//     proof: any
//   }> {
//     const account = await this.getAccount(address);
//     const keyBuf = slot.toArrayLike(Buffer, 'be', 32);
//     let trie: any
//     if (account.stateRoot.equals(emptyStorageRoot)) {
//       trie = new Trie();
//     } else {
//       trie = this.trie.copy();
//       trie.root = account.stateRoot;
//       trie._checkpoints = [];
//     }
//     const proof = await this.lib.prove(keyBuf);
//     return { account, proof }
//   }
// }

async function test() {
  const t = new StateTrie(new Trie())
  await t.lib.put('a', 'b');
  const proof = await t.lib.prove('a')
  console.log(proof)
}

// test()