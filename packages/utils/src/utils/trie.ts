import { toBuffer, rlp } from 'ethereumjs-util';
import Account from 'ethereumjs-account';
const Trie = require('merkle-patricia-tree/secure');

import { BufferLike, toBuf32 } from './to';
import { last } from './last';

const emptyStorageRoot = toBuffer('0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421');
const proofLib = require('./proof-lib');

export { Trie };

export class TrieWrapper {
  public lib: any;
  public trie: any;
  constructor(trie?: any) {
    if (!trie) trie = new Trie()
    this.trie = trie;
    this.lib = proofLib(trie);
  }

  static fromDB(db: any, rootHash?: Buffer): TrieWrapper {
    const trie = new Trie(db, rootHash);
    return new TrieWrapper(trie);
  }

  get root(): Buffer { return this.trie.root; }
  get = (key: BufferLike): Promise<Buffer> => this.lib.get(key);
  put = (key: BufferLike, val: BufferLike) => this.lib.put(key, val);
  del = (key: BufferLike): Promise<void> => this.lib.del(key);
  prove = (key: BufferLike): Promise<string> => this.lib.prove(key);
  checkpoint = (): void => this.trie.checkpoint();
  commit = (): Promise<void> => this.trie.commit();
  revert = (): Promise<void> => this.trie.revert();
}

export class StorageTrie extends TrieWrapper {
  get = (key: BufferLike): Promise<Buffer> => this.lib.get(toBuf32(key)).then((v) => rlp.decode(v));
  put = async (key: BufferLike, value: BufferLike): Promise<string> => {
    return await this.lib.put(toBuf32(key), rlp.encode(toBuffer(value)));
  }
  prove = (key: BufferLike): Promise<string> => this.lib.prove(toBuf32(key));
}

export class StateTrie extends TrieWrapper {
  async getAccount(address: BufferLike): Promise<Account> {
    let buf = Buffer.isBuffer(address) ? address : toBuffer(address);
    const val = await this.lib.get(buf).catch((err: any) => null);
    return new Account(val || undefined);
  }

  static fromDB(db: any, rootHash?: Buffer): StateTrie {
    const trie = new Trie(db, rootHash);
    return new StateTrie(trie);
  }

  async getAccountCode(address: BufferLike): Promise<Buffer> {
    const account = await this.getAccount(address);
    return new Promise((resolve, reject) =>
      account.getCode(this.trie, (err, code) =>
        (err) ? reject(err) : resolve(code)
      )
    );
  }

  async putAccount(address: BufferLike, account: Account) {
    let buf = Buffer.isBuffer(address) ? address : toBuffer(address);
    await this.lib.put(buf, account.serialize());
  }

  async getAccountProof(address: BufferLike): Promise<string> {
    let buf = Buffer.isBuffer(address) ? address : toBuffer(address);
    return this.lib.prove(buf);
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
